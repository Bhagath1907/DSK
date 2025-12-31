from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.agent.crew import run_crew

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        if not request.message:
             raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        result = run_crew(request.message)
        
        return ChatResponse(response=str(result))
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))
