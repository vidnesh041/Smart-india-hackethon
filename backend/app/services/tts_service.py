"""
tts_service.py
Backend Text-to-Speech (TTS) Synthesizer Service for Indian Regional Languages.
Synthesizes full, un-truncated audio streams for Hindi, Marathi, Gujarati, Bengali, Tamil, Telugu, English & Hinglish.
Supports full multi-sentence answers by chunking and stream concatenation.
"""

import re
import httpx
from typing import Optional, List

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

def _chunk_text_for_tts(text: str, max_chunk_len: int = 150) -> List[str]:
    """
    Splits text along natural sentence and clause boundaries (।, ., !, ?, \n, comma)
    so each chunk is under max_chunk_len characters for Google Translate TTS.
    """
    # Split by major sentence enders
    raw_sentences = re.split(r'([।!?\n\.\;]+)', text)
    chunks = []
    current_chunk = ""

    for part in raw_sentences:
        if not part:
            continue
        if len(current_chunk) + len(part) <= max_chunk_len:
            current_chunk += part
        else:
            if current_chunk.strip():
                chunks.append(current_chunk.strip())
            # If a single sentence is itself too long, split by comma or spaces
            if len(part) > max_chunk_len:
                words = part.split(' ')
                sub_chunk = ""
                for w in words:
                    if len(sub_chunk) + len(w) + 1 <= max_chunk_len:
                        sub_chunk += (" " if sub_chunk else "") + w
                    else:
                        if sub_chunk.strip():
                            chunks.append(sub_chunk.strip())
                        sub_chunk = w
                current_chunk = sub_chunk
            else:
                current_chunk = part

    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    return chunks or [text[:max_chunk_len]]

async def generate_speech_audio(text: str, language: str = "English") -> Optional[bytes]:
    """
    Synthesizes complete, continuous speech audio bytes for any Indian language.
    Cleans markdown formatting and concatenates MP3 audio frames for all chunks.
    """
    if not text or not text.strip():
        return None

    # Clean markdown, symbols, asterisks and bullets for spoken clarity
    clean_text = re.sub(r'[#*_`~\[\]()]', '', text)
    clean_text = clean_text.replace('₹', ' रुपये ').replace('%', ' प्रतिशत ').replace('•', ' ').strip()
    
    lang_code = TTS_LANG_MAP.get(language, "en")
    chunks = _chunk_text_for_tts(clean_text, max_chunk_len=160)
    
    url = "https://translate.google.com/translate_tts"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    combined_audio = bytearray()

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            for chunk in chunks:
                if not chunk.strip():
                    continue
                params = {
                    "ie": "UTF-8",
                    "q": chunk,
                    "tl": lang_code,
                    "client": "tw-ob"
                }
                response = await client.get(url, params=params, headers=headers)
                if response.status_code == 200 and len(response.content) > 50:
                    combined_audio.extend(response.content)
                else:
                    print(f"TTS chunk fetch failed with status {response.status_code}")

        if len(combined_audio) > 100:
            return bytes(combined_audio)
    except Exception as e:
        print(f"TTS service error: {e}")

    return None
