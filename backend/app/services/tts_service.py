"""
tts_service.py
Backend Text-to-Speech (TTS) Synthesizer Service for Indian Regional Languages.
Synthesizes clean audio streams for Hindi, Marathi, Gujarati, Bengali, Tamil, Telugu, English & Hinglish.
"""

import re
import httpx
from typing import Optional

TTS_LANG_MAP = {
    "Hindi": "hi",
    "English": "en",
    "Marathi": "mr",
    "Hinglish": "hi",
    "Bengali": "bn",
    "Tamil": "ta",
    "Telugu": "te",
    "Gujarati": "gu"
}

async def generate_speech_audio(text: str, language: str = "English") -> Optional[bytes]:
    """
    Synthesizes speech audio bytes from text for the target Indian language.
    Cleans markdown formatting and returns MP3 audio bytes.
    """
    if not text or not text.strip():
        return None

    # Clean markdown, symbols, and formatting for spoken clarity
    clean_text = re.sub(r'[#*_`~\[\]()]', '', text)
    clean_text = clean_text.replace('₹', ' रुपये ').replace('%', ' प्रतिशत ').replace('•', ' ').strip()
    
    # Truncate text to 300 characters for optimal audio generation
    if len(clean_text) > 300:
        clean_text = clean_text[:300] + '...'

    lang_code = TTS_LANG_MAP.get(language, "en")
    
    url = "https://translate.google.com/translate_tts"
    params = {
        "ie": "UTF-8",
        "q": clean_text,
        "tl": lang_code,
        "client": "tw-ob"
    }
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params, headers=headers)
            if response.status_code == 200 and len(response.content) > 100:
                return response.content
            else:
                print(f"TTS backend failed with status {response.status_code}")
    except Exception as e:
        print(f"TTS service error: {e}")

    return None
