from fastapi import Header, HTTPException, Depends
from typing import Optional
from app.db.supabase import supabase
import asyncio

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authentication token")
    
    try:
        token = authorization.split(" ")[1]
        
        # Add timeout to prevent hanging
        try:
            user = await asyncio.wait_for(
                asyncio.to_thread(supabase.auth.get_user, token),
                timeout=10.0  # 10 second timeout
            )
        except asyncio.TimeoutError:
            raise HTTPException(status_code=401, detail="Authentication timed out. Please refresh the page and try again.")
        
        if not user or not user.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e).lower()
        if 'expired' in error_msg or 'invalid' in error_msg:
            raise HTTPException(status_code=401, detail="Session expired. Please log in again.")
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

async def get_current_admin(user=Depends(get_current_user)):
    try:
        # Check 'users' table for role. 
        uid = user.user.id
        # print(f"[DEBUG] Checking admin role for user ID: {uid}")
        
        # Use execute() instead of single() to avoid PGRST116 on missing rows
        response = supabase.table("users").select("role").eq("id", uid).execute()
        
        # print(f"[DEBUG] DB Response: {response.data}")
        
        if not response.data or len(response.data) == 0:
            print(f"[DEBUG] User {uid} not found in public.users table.")
            # If user is authenticated but missing profile, deny access cleanly
            raise HTTPException(status_code=403, detail="User profile not found. Please contact support.")
            
        user_role = response.data[0].get('role')
        
        if user_role != 'admin':
            print(f"[DEBUG] User {uid} is not an admin. Role: {user_role}")
            raise HTTPException(status_code=403, detail="Admin privileges required")
        
        # print(f"[DEBUG] Admin check passed for user: {uid}")
        return user
    except HTTPException:
        raise
    except Exception as e:
        print(f"[DEBUG] Exception in get_current_admin: {e}")
        raise HTTPException(status_code=403, detail=f"Could not verify admin privileges: {str(e)}")
