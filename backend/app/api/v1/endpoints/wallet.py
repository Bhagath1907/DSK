from fastapi import APIRouter, HTTPException, Request, Header
from app.db.supabase import supabase
from app.core.config import settings
from pydantic import BaseModel
from typing import Optional
import razorpay
import hmac
import hashlib
import json

router = APIRouter()

# Initialize Razorpay client
razorpay_client = None
if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET:
    razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

# Plan configuration - maps plan names to amounts
PLAN_AMOUNTS = {
    "Go": 100.00,
    "Pro": 300.00,
    "Plus": 600.00
}

class VerifyPaymentRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: Optional[str] = None
    razorpay_signature: Optional[str] = None
    user_id: str
    plan_name: str

class TopUpRequest(BaseModel):
    amount: float
    user_id: str
    description: str = "Wallet Top-up"

@router.get("/balance")
def get_balance():
    return {"message": "Balance check should be done via Supabase Client on Frontend for now."}

@router.post("/topup")
def top_up_wallet(request: TopUpRequest):
    """Direct top-up endpoint (for testing or manual credits by admin)"""
    try:
        # Get current user balance
        user_response = supabase.table("users").select("wallet_balance").eq("id", request.user_id).single().execute()
        
        if not user_response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        current_balance = float(user_response.data.get("wallet_balance", 0))
        new_balance = current_balance + request.amount
        
        # Update wallet balance
        supabase.table("users").update({
            "wallet_balance": new_balance
        }).eq("id", request.user_id).execute()
        
        # Create transaction record
        supabase.table("transactions").insert({
            "user_id": request.user_id,
            "amount": request.amount,
            "type": "credit",
            "description": request.description
        }).execute()
        
        return {
            "status": "success",
            "message": "Top-up successful",
            "new_balance": new_balance
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/razorpay-webhook")
async def razorpay_webhook(request: Request, x_razorpay_signature: str = Header(None)):
    """
    Webhook endpoint for Razorpay payment notifications.
    Configure this URL in Razorpay Dashboard: Settings -> Webhooks
    """
    try:
        body = await request.body()
        body_str = body.decode('utf-8')
        
        # Verify webhook signature if secret is configured
        if settings.RAZORPAY_WEBHOOK_SECRET:
            expected_signature = hmac.new(
                settings.RAZORPAY_WEBHOOK_SECRET.encode('utf-8'),
                body,
                hashlib.sha256
            ).hexdigest()
            
            if x_razorpay_signature != expected_signature:
                raise HTTPException(status_code=400, detail="Invalid webhook signature")
        
        payload = json.loads(body_str)
        event = payload.get("event")
        
        # Handle payment.captured event
        if event == "payment.captured":
            payment = payload.get("payload", {}).get("payment", {}).get("entity", {})
            
            payment_id = payment.get("id")
            amount_paise = payment.get("amount", 0)
            amount_rupees = amount_paise / 100  # Razorpay sends amounts in paise
            email = payment.get("email", "")
            notes = payment.get("notes", {})
            
            # Get user ID from notes or find by email
            user_id = notes.get("user_id")
            plan_name = notes.get("plan_name", "Top-up")
            
            if not user_id and email:
                # Try to find user by email
                user_response = supabase.table("users").select("id").eq("email", email).single().execute()
                if user_response.data:
                    user_id = user_response.data.get("id")
            
            if user_id:
                # Check if this payment was already processed
                existing = supabase.table("transactions").select("id").eq("description", f"Razorpay Payment: {payment_id}").execute()
                
                if not existing.data:
                    # Credit the wallet
                    await credit_wallet(user_id, amount_rupees, f"Razorpay Payment: {payment_id}", plan_name)
                    
            return {"status": "ok", "message": "Webhook processed"}
        
        return {"status": "ok", "message": f"Event {event} received"}
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    except Exception as e:
        print(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify-payment")
async def verify_payment(request: VerifyPaymentRequest):
    """
    Verify a Razorpay payment after redirect.
    Called by frontend after user returns from payment page.
    """
    try:
        if not razorpay_client:
            raise HTTPException(status_code=500, detail="Razorpay not configured")
        
        # Fetch payment details from Razorpay
        payment = razorpay_client.payment.fetch(request.razorpay_payment_id)
        
        if payment.get("status") != "captured":
            return {
                "status": "pending",
                "message": "Payment not yet captured"
            }
        
        amount_paise = payment.get("amount", 0)
        amount_rupees = amount_paise / 100
        
        # Validate amount matches plan
        expected_amount = PLAN_AMOUNTS.get(request.plan_name, 0)
        if expected_amount > 0 and abs(amount_rupees - expected_amount) > 1:  # Allow 1 rupee tolerance
            raise HTTPException(status_code=400, detail="Payment amount mismatch")
        
        # Check if this payment was already processed
        existing = supabase.table("transactions").select("id").eq(
            "description", f"Razorpay Payment: {request.razorpay_payment_id}"
        ).execute()
        
        if existing.data:
            # Already processed - return current balance
            user_data = supabase.table("users").select("wallet_balance").eq("id", request.user_id).single().execute()
            return {
                "status": "already_processed",
                "message": "Payment already credited",
                "new_balance": float(user_data.data.get("wallet_balance", 0)) if user_data.data else 0
            }
        
        # Credit the wallet
        new_balance = await credit_wallet(
            request.user_id, 
            amount_rupees, 
            f"Razorpay Payment: {request.razorpay_payment_id}",
            request.plan_name
        )
        
        return {
            "status": "success",
            "message": "Payment verified and wallet credited",
            "amount": amount_rupees,
            "new_balance": new_balance
        }
        
    except razorpay.errors.BadRequestError as e:
        raise HTTPException(status_code=400, detail=f"Invalid payment ID: {str(e)}")
    except Exception as e:
        print(f"Payment verification error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def credit_wallet(user_id: str, amount: float, description: str, plan_name: str = "Top-up") -> float:
    """
    Helper function to credit user's wallet and create transaction record.
    Returns the new balance.
    """
    # Get current balance
    user_response = supabase.table("users").select("wallet_balance").eq("id", user_id).single().execute()
    
    if not user_response.data:
        raise Exception(f"User {user_id} not found")
    
    current_balance = float(user_response.data.get("wallet_balance", 0))
    new_balance = current_balance + amount
    
    # Update wallet balance
    supabase.table("users").update({
        "wallet_balance": new_balance
    }).eq("id", user_id).execute()
    
    # Create transaction record
    supabase.table("transactions").insert({
        "user_id": user_id,
        "amount": amount,
        "type": "credit",
        "description": f"{plan_name} Plan - {description}"
    }).execute()
    
    print(f"Credited {amount} to user {user_id}. New balance: {new_balance}")
    
    return new_balance
