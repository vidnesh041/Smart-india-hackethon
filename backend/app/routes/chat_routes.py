"""
chat_routes.py
API Route handler for Gemini Conversational AI Chatbot ("Local Advisor").
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.database.db_connection import get_db
from app.services.gemini_chatbot_service import process_chat_message

router = APIRouter(prefix="/chat", tags=["Gemini AI Chatbot Engine"])

class ChatMessagePayload(BaseModel):
    role: str = "user"
    content: str

class ChatRequest(BaseModel):
    message: str = Field(..., description="User's text input or transcribed speech")
    chat_history: Optional[List[Dict[str, Any]]] = Field(default=[], description="Previous conversation turns")
    available_margin_capital: Optional[float] = Field(None, description="Available 10% margin capital in INR")
    location: Optional[str] = Field(None, description="Village / Block / District name")
    business_category: Optional[str] = Field(None, description="Category of business")
    language: Optional[str] = Field("Hindi", description="Target conversation language (e.g. Hindi, English, Marathi, Hinglish, Tamil, Telugu, Gujarati, Bengali)")

class ChatResponse(BaseModel):
    reply: str
    financial_plan: Optional[Dict[str, Any]] = None
    swot: Optional[Dict[str, Any]] = None
    extracted_margin_capital: Optional[float] = None
    extracted_location: Optional[str] = None
    extracted_category: Optional[str] = None

@router.post("", response_model=ChatResponse)
async def chat_with_gemini_advisor(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    """
    POST /api/chat
    Engages in multi-turn conversation with Gemini AI rural business advisor.
    Extracts margin capital & business idea, computes upward financial plan,
    explains SWOT analysis, and answers any follow-up questions.
    """
    if not request.message or not request.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message content cannot be empty."
        )

    try:
        res = await process_chat_message(
            user_message=request.message.strip(),
            chat_history=request.chat_history,
            available_margin_capital=request.available_margin_capital,
            location=request.location,
            business_category=request.business_category,
            language=request.language or "Hindi",
            db=db
        )
        return ChatResponse(**res)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat error: {str(e)}"
        )
