from fastapi import APIRouter

router = APIRouter()

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr
from app.db.supabase import supabase
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr
from app.db.supabase import supabase
import os

router = APIRouter()

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    privacy_policy_accepted: bool

@router.post("/signup")
async def signup(request: Request, body: SignupRequest):
    """
    Proxied Signup Endpoint.
    Validates Privacy Policy acceptance server-side before creating user.
    """
    # 1. Validate Privacy Policy
    if not body.privacy_policy_accepted:
        raise HTTPException(status_code=400, detail="You must agree to the Privacy Policy and Terms.")

    # 2. Create User in Supabase Auth
    # Use Admin API (service_role) to create user to ensure we can set metadata immediately if needed,
    # OR standard signUp if we are just proxying.
    # Standard signUp returns a session if auto-confirm is on, or just user if not.
    try:
        auth_response = supabase.auth.sign_up({
            "email": body.email,
            "password": body.password,
            "options": {
                "data": {
                    "full_name": body.full_name
                }
            }
        })
        
        if not auth_response.user:
             raise HTTPException(status_code=400, detail="Signup failed. Please try again.")
             
        # 4. Update User Metadata (Privacy, IP) in public.users table
        # The trigger `on_auth_user_created` creates the row in public.users.
        # We need to update it with the extra fields.
        user_id = auth_response.user.id
        client_ip = request.client.host
        
        supabase.table("users").update({
            "privacy_policy_accepted": True,
            "accepted_at": "now()",
            "ip_address": client_ip
        }).eq("id", user_id).execute()

        return {"message": "Account created successfully! Please check your email."}

    except Exception as e:
        # Clean up error message
        msg = str(e)
        if "msg" in msg: 
            # Try to extract the actual message if it's a Supabase error dict
            pass
        raise HTTPException(status_code=400, detail=msg)

class RecordLoginRequest(BaseModel):
    user_id: str
    user_agent: str

@router.post("/record-login")
async def record_login(request: Request, body: RecordLoginRequest):
    """
    Records a login session in the login_history table.
    This is called from the frontend after a successful login.
    """
    try:
        client_ip = request.client.host if request.client else "Unknown"
        
        result = supabase.table("login_history").insert({
            "user_id": body.user_id,
            "ip_address": client_ip,
            "user_agent": body.user_agent[:500] if body.user_agent else "Unknown"  # Truncate long user agents
        }).execute()
        
        print(f"Login history insert result: {result}")
        return {"message": "Login recorded successfully"}
    except Exception as e:
        # Log the full error for debugging
        import traceback
        traceback.print_exc()
        print(f"Error recording login: {e}")
        return {"message": f"Login recorded (with warnings): {str(e)}"}
