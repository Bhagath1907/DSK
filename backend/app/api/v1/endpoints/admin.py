from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from app.core.security import get_current_admin, get_current_user
from app.db.supabase import supabase
from pydantic import BaseModel
from typing import List, Optional, Any
import shutil
import time

router = APIRouter()

router = APIRouter()

# --- Removed promote-to-admin endpoint for security ---

class AdminStats(BaseModel):
    total_users: int
    total_services: int
    total_applications: int
    pending_applications: int
    approved_applications: int
    rejected_applications: int

@router.get("/stats", response_model=AdminStats)
def get_admin_stats(current_user: dict = Depends(get_current_admin)):
    """
    Get aggregated statistics for the Admin Dashboard.
    """
    try:
        # Parallel fetching would be better but sequential is fine for now
        users = supabase.table("users").select("id", count="exact", head=True).execute()
        services = supabase.table("services").select("id", count="exact", head=True).execute()
        
        total_apps = supabase.table("submissions").select("id", count="exact", head=True).execute()
        pending = supabase.table("submissions").select("id", count="exact", head=True).eq("status", "pending").execute()
        approved = supabase.table("submissions").select("id", count="exact", head=True).eq("status", "approved").execute()
        rejected = supabase.table("submissions").select("id", count="exact", head=True).eq("status", "rejected").execute()

        return {
            "total_users": users.count or 0,
            "total_services": services.count or 0,
            "total_applications": total_apps.count or 0,
            "pending_applications": pending.count or 0,
            "approved_applications": approved.count or 0,
            "rejected_applications": rejected.count or 0
        }
    except Exception as e:
        print(f"Error fetching admin stats: {e}")
        # Return zeros on error to keep dashboard functional, or re-raise
        # Re-raising 500 allows frontend to see error. 
        # But returning zeros might be "safer" for UI rendering? 
        # Let's raise 500 so our new frontend error handling picks it up.
        raise HTTPException(status_code=500, detail=f"Stats calculation failed: {str(e)}")

@router.get("/applications")
def get_all_applications(status: Optional[str] = None, current_user: dict = Depends(get_current_admin)):
    """
    Get all applications with User and Service details.
    """
    query = supabase.table("submissions").select("*, users(email), services(name, fields, Category:categories(name))")
    
    if status:
        query = query.eq("status", status)
        
    response = query.order("created_at", desc=True).execute()
    return response.data

@router.get("/applications/{id}")
def get_application_detail(id: int, current_user: dict = Depends(get_current_admin)):
    """
    Get a single application detail.
    """
    try:
        response = supabase.table("submissions").select("*, users(email), services(name, fields, Category:categories(name))").eq("id", id).single().execute()
        return response.data
    except Exception as e:
        print(f"Error fetching application {id}: {e}")
        raise HTTPException(status_code=500, detail=f"Fetch failed: {str(e)}")

class StatusUpdate(BaseModel):
    status: str

@router.patch("/applications/{id}")
def update_application_status(id: int, update: StatusUpdate, current_user: dict = Depends(get_current_admin)):
    """
    Update application status (approve/reject).
    """
    if update.status not in ['pending', 'approved', 'rejected']:
        raise HTTPException(status_code=400, detail="Invalid status")


    response = supabase.table("submissions").update({"status": update.status}).eq("id", id).execute()
    return response.data

@router.post("/upload-logo")
async def upload_service_logo(file: UploadFile = File(...), current_user: dict = Depends(get_current_admin)):
    """
    Upload a service logo to Supabase Storage (bypassing RLS via Service Role).
    """
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        # Generate unique filename
        file_ext = file.filename.split('.')[-1] if '.' in file.filename else 'png'
        file_name = f"{int(time.time())}_{file.filename}"
        
        # Read file content
        file_content = await file.read()

        # Upload to Supabase Storage
        # NOTE: The current 'supabase' client in app.db.supabase is likely initialized with SERVICE_ROLE_KEY if properly configured for backend
        # logic, or we rely on the specific bucket being public for reading.
        # For writing, if the client uses Anon key, it respects RLS. If Service key, it bypasses.
        # Ensure app.db.supabase uses Service Role Key for this to work perfectly.
        
        res = supabase.storage.from_("service-logos").upload(
            file_name,
            file_content,
            {"content-type": file.content_type}
        )

        # Construct Public URL (Simpler than calling getPublicUrl which sometimes returns slight variations)
        # Standard Supabase Storage Public URL format:
        # https://<project_ref>.supabase.co/storage/v1/object/public/<bucket>/<file>
        
        # However, to be safe, let's ask Supabase for it.
        public_url_res = supabase.storage.from_("service-logos").get_public_url(file_name)
        
        return {"url": public_url_res}

    except Exception as e:
        print(f"Upload Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.post("/applications/{id}/document")
async def upload_application_document(id: int, file: UploadFile = File(...), current_user: dict = Depends(get_current_admin)):
    """
    Upload a final document for an application (Admin only).
    Stored in 'final-documents' bucket (Private).
    """
    try:
        print(f"[DEBUG] Uploading file for app {id}")
        
        # Check if settings are loaded
        from app.core.config import settings
        if not settings.SUPABASE_SERVICE_ROLE_KEY:
            print("[DEBUG] CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing!")
            raise Exception("Server configuration error: Missing Service Role Key")

        # Generate unique filename
        file_ext = file.filename.split('.')[-1] if '.' in file.filename else 'pdf'
        file_name = f"app_{id}_{int(time.time())}.{file_ext}"
        print(f"[DEBUG] Generated filename: {file_name}")
        
        # Read file content
        file_content = await file.read()
        print(f"[DEBUG] File size: {len(file_content)} bytes")

        # Upload to Supabase Storage (final-documents bucket)
        print("[DEBUG] Attempting upload to 'final-documents' bucket...")
        res = supabase.storage.from_("final-documents").upload(
            file_name,
            file_content,
            {"content-type": file.content_type}
        )
        print(f"[DEBUG] Upload res type: {type(res)}")
        # Note: supabase-py upload might return a response object or dict depending on version.
        # If it fails, it usually raises an exception or returns error dict.
        
        print(f"[DEBUG] Upload successful. Updating database...")

        # Store the FILE PATH (not public URL) in the database
        update_res = supabase.table("submissions").update({
            "final_document_url": file_name
        }).eq("id", id).execute()
        
        print(f"[DEBUG] Database updated: {update_res.data}")
        
        return {"success": True, "file_path": file_name}

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"[DEBUG] Document Upload Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
