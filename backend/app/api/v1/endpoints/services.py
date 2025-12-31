from fastapi import APIRouter, Depends, HTTPException, Request
from app.core.security import get_current_admin
from app.db.supabase import supabase
from app.models.service import ServiceCreate, ServiceUpdate
from app.models.submission import SubmissionCreate

router = APIRouter()

@router.get("/")
def get_services():
    """Public endpoint to list active services"""
    response = supabase.table("services").select("*").eq("is_active", True).execute()
    return response.data

@router.get("/{service_id}")
def get_service(service_id: int):
    """Public endpoint to get service details"""
    response = supabase.table("services").select("*").eq("id", service_id).single().execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Service not found")
    return response.data

@router.post("/", dependencies=[Depends(get_current_admin)])
def create_service(service: ServiceCreate):
    """Admin only: Create new service"""
    # Convert Pydantic to dict, handling fields list -> json
    data = service.model_dump()
    response = supabase.table("services").insert(data).execute()
    return response.data[0]

@router.put("/{service_id}", dependencies=[Depends(get_current_admin)])
def update_service(service_id: int, service: ServiceUpdate):
    """Admin only: Update service"""
    data = service.model_dump()
    response = supabase.table("services").update(data).eq("id", service_id).execute()
    return response.data

@router.delete("/{service_id}", dependencies=[Depends(get_current_admin)])
def delete_service(service_id: int):
    """Admin only: Delete service and related submissions"""
    try:
        # First delete all related submissions
        supabase.table("submissions").delete().eq("service_id", service_id).execute()
        # Then delete the service
        response = supabase.table("services").delete().eq("id", service_id).execute()
        return {"message": "Service and related submissions deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete service: {str(e)}")

@router.post("/apply")
async def apply_for_service(submission: SubmissionCreate, request: Request = None):
    """
    Apply for a service.
    Expects {service_id: int, data: dict}
    """
    user_id = submission.data.get('user_id')
    if not user_id:
         raise HTTPException(status_code=400, detail="User ID required in data")

    try:
        # 2. Call RPC to create submission and deduct wallet
        response = supabase.rpc('submit_application', {
            'p_user_id': user_id,
            'p_service_id': submission.service_id,
            'p_data': submission.data
        }).execute()
        
        # 3. Update Submission with IP (Optional, but handy since we have it, keeping consistent with request even if captcha is gone)
        # Actually user asked to remove "captcha regarding code", didn't say remove IP tracking completely.
        # But usually IP tracking was for security alongside captcha.
        # I will keep IP tracking as it is good practice, but remove captcha_verified update.
        if response.data and response.data.get('success'):
            submission_id = response.data.get('submission_id')
            client_ip = request.client.host if request else "unknown"
            
            supabase.table("submissions").update({
                "submitted_ip": client_ip
            }).eq("id", submission_id).execute()
        
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

