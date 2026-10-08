"""
tts_routes.py
API Route handler for Text-to-Speech (TTS) Audio Generation (/api/tts).
"""

from fastapi import APIRouter, HTTPException, status, Response
from pydantic import BaseModel, Field
from typing import Optional
from app.services.tts_service import generate_speech_audio

router = APIRouter(prefix="/tts", tags=["Text-to-Speech Engine"])

class TTSRequest(BaseModel):
    text: str = Field(..., description="Text content to be spoken")
    language: Optional[str] = Field("English", description="Target language name")

@router.post("")
async def get_speech_audio(request: TTSRequest):
    """
    POST /api/tts
    Synthesizes MP3 speech audio bytes for any Indian regional language.
    Returns binary audio stream (audio/mpeg).
    """
    if not request.text or not request.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text content cannot be empty."
        )

    audio_bytes = await generate_speech_audio(
        text=request.text.strip(),
        language=request.language or "English"
    )

    if not audio_bytes:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate speech audio."
        )

    return Response(content=audio_bytes, media_type="audio/mpeg")
