from langchain_core.tools import BaseTool
from app.db.supabase import supabase
import json
from typing import Optional, Type
from pydantic import BaseModel

class PlatformKnowledgeTool(BaseTool):
    name: str = "platform_knowledge"
    description: str = "Useful for getting information about available service categories and services on the platform. It returns a JSON string with list of categories and services."

    def _run(self, query: str = "") -> str:
        # Fetch categories (just names)
        categories_response = supabase.table("categories").select("name").eq("is_active", True).execute()
        
        # Fetch services (optimize columns: name, price, category name)
        # We exclude large fields like created_at, updated_at, and full description to save tokens
        services_response = supabase.table("services").select("name, price, categories(name)").eq("is_active", True).execute()
        
        data = {
            "categories": [c['name'] for c in categories_response.data],
            "services": services_response.data
        }
        return json.dumps(data, indent=2)

    async def _arun(self, query: str = "") -> str:
        raise NotImplementedError("PlatformKnowledgeTool does not support async")
