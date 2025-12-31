from pydantic import BaseModel, Json
from typing import Dict, Any, Optional
from datetime import datetime

class SubmissionBase(BaseModel):
    service_id: int
    data: Dict[str, Any]

class SubmissionCreate(SubmissionBase):
    pass

class SubmissionResponse(SubmissionBase):
    id: int
    user_id: str
    status: str
    final_document_url: Optional[str] = None
    created_at: str
