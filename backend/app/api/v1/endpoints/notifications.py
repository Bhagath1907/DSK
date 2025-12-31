from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from app.db.supabase import supabase
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class NotificationPreference(BaseModel):
    enabled: bool

class JobService(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    created_at: str

@router.get("/preference")
def get_notification_preference(current_user=Depends(get_current_user)):
    """
    Get user's job notification preference.
    """
    try:
        uid = current_user.user.id
        response = supabase.table("users").select("job_notifications_enabled").eq("id", uid).single().execute()
        
        if response.data:
            return {"enabled": response.data.get("job_notifications_enabled", False)}
        return {"enabled": False}
    except Exception as e:
        print(f"Error getting notification preference: {e}")
        return {"enabled": False}

@router.post("/preference")
def toggle_notification_preference(pref: NotificationPreference, current_user=Depends(get_current_user)):
    """
    Toggle user's job notification preference.
    """
    try:
        uid = current_user.user.id
        response = supabase.table("users").update({
            "job_notifications_enabled": pref.enabled
        }).eq("id", uid).execute()
        
        return {"success": True, "enabled": pref.enabled}
    except Exception as e:
        print(f"Error updating notification preference: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update preference: {str(e)}")

@router.get("/jobs", response_model=List[JobService])
def get_new_job_services(current_user=Depends(get_current_user)):
    """
    Get new services from the 'Job Applications' category for opted-in users.
    Returns services created in the last 7 days.
    """
    try:
        uid = current_user.user.id
        
        # First check if user has notifications enabled
        user_res = supabase.table("users").select("job_notifications_enabled").eq("id", uid).single().execute()
        if not user_res.data or not user_res.data.get("job_notifications_enabled", False):
            return []
        
        # Find the "Job Applications" category
        cat_res = supabase.table("categories").select("id").ilike("name", "%job%application%").execute()
        
        if not cat_res.data or len(cat_res.data) == 0:
            # Try alternate names
            cat_res = supabase.table("categories").select("id").ilike("name", "%job%").execute()
        
        if not cat_res.data or len(cat_res.data) == 0:
            return []
        
        category_id = cat_res.data[0]["id"]
        
        # Get services from this category created in last 7 days
        from datetime import datetime, timedelta
        seven_days_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
        
        services_res = supabase.table("services").select("id, name, description, price, created_at").eq("category_id", category_id).eq("is_active", True).gte("created_at", seven_days_ago).order("created_at", desc=True).limit(10).execute()
        
        return services_res.data if services_res.data else []
        
    except Exception as e:
        print(f"Error fetching job services: {e}")
        return []
