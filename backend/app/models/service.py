from pydantic import BaseModel
from typing import List, Optional, Any

class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = 0.0
    category_id: int
    fields: List[Any] = []
    logo_url: Optional[str] = None
    is_active: bool = True

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(ServiceBase):
    pass
