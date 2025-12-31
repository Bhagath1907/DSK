from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_admin, get_current_user
from app.db.supabase import supabase
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class JobNotificationBase(BaseModel):
    title: str
    description: Optional[str] = None
    link: Optional[str] = None
    is_active: bool = True

class JobNotificationCreate(JobNotificationBase):
    pass

class JobNotificationResponse(JobNotificationBase):
    id: int
    created_at: str

@router.get("/", response_model=List[JobNotificationResponse])
def get_active_jobs(current_user: dict = Depends(get_current_user)):
    """
    Get all active job notifications for users.
    """
    try:
        response = supabase.table("job_notifications").select("*").eq("is_active", True).order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch jobs: {str(e)}")

@router.get("/all", response_model=List[JobNotificationResponse])
def get_all_jobs(current_user: dict = Depends(get_current_admin)):
    """
    Get ALL jobs (active and inactive) for admins.
    """
    try:
        response = supabase.table("job_notifications").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch jobs: {str(e)}")

@router.post("/", response_model=JobNotificationResponse)
def create_job(job: JobNotificationCreate, current_user: dict = Depends(get_current_admin)):
    """
    Create a new job notification (Admin only).
    """
    try:
        response = supabase.table("job_notifications").insert(job.dict()).execute()
        if response.data:
            return response.data[0]
        raise HTTPException(status_code=400, detail="Creation returned no data")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create job: {str(e)}")

@router.delete("/{id}")
def delete_job(id: int, current_user: dict = Depends(get_current_admin)):
    """
    Delete a job notification (Admin only).
    """
    try:
        # We can either soft delete (set is_active=False) or hard delete.
        # User requested "add and remove", so hard delete is acceptable, or soft.
        # Let's do hard delete for now as requested.
        response = supabase.table("job_notifications").delete().eq("id", id).execute()
        return {"message": "Job notification deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete job: {str(e)}")
