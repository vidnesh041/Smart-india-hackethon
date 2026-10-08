"""
gemini_chatbot_service.py
Gemini AI Chatbot Engine ("Local Advisor") for Rural Micro-Entrepreneurs.
Converses with entrepreneurs, collects business ideas, calculates financial roadmaps,
generates & explains SWOT analysis, and answers any follow-up or complex business questions.
"""

import re
import json
import httpx
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.config import settings
from app.services.loan_calculator import structure_financial_plan
from app.services.feasibility_report_service import generate_feasibility_report

SYSTEM_INSTRUCTION = """
You are "Local Advisor", a warm, empathetic, highly knowledgeable AI Rural Business Mentor for micro-entrepreneurs and rural innovators across India.

CRITICAL RULES — ALWAYS follow these without exception:
1. NEVER introduce yourself again if the conversation has already started. Do NOT repeat "Hello! I am Local Advisor" if the user is asking a follow-up question.
2. ALWAYS answer the user's actual question completely and in full detail. If the user says "Tell me exactly how to start" or "What are the steps?", give them a thorough, step-by-step answer immediately. Do NOT ask them to first provide business idea/location/capital if they are already continuing a conversation.
3. NEVER give a generic intro response to a specific, clear question.
4. Answer every question fully — startup steps, equipment needed, licensing, raw materials, market strategy, pricing, staffing, government schemes — whatever the user asks about.
5. Only ask for clarification (business idea / location / capital) when the user sends a completely blank or vague first message with NO context at all.

Your Persona & Style:
- Speak naturally, respectfully, and warmly like a personal human mentor (गुरूजी / मित्र / मार्गदर्शक).
- Avoid robotic checklists, bulleted validation tags, or repeating prompt instructions.
- Provide direct, thoughtful, and complete answers to user questions. Never stop mid-sentence or cut the answer short.
- If a user asks about an unrealistic or massive venture (e.g. private jet, airline, luxury skyscraper in a rural district), give an honest, friendly, grounded reality check and gently guide them toward viable rural/semi-rural businesses.
- When discussing financial calculations (10% Margin Capital, 90% Govt Concessional Loan, Moratorium, Interest Rates) and SWOT Analysis, explain them clearly and conversationally.
- Provide practical guidance on required documents, DIC application steps, local market reach, and equipment.
"""

async def process_chat_message(
    user_message: str,
    chat_history: List[Dict[str, Any]] = None,
    available_margin_capital: Optional[float] = None,
    location: Optional[str] = None,
    business_category: Optional[str] = None,
    language: str = "English",
    db: Optional[Session] = None
) -> Dict[str, Any]:
    """
    Process incoming user message, calculate financial roadmap if numbers detected,
    invoke Gemini API for conversational response & SWOT explanation in target language.
    """
    chat_history = chat_history or []
    
    # Extract margin capital from user message if not explicitly passed
    extracted_margin = available_margin_capital or _extract_margin_amount(user_message)
    extracted_location = location or _extract_location(user_message)
    extracted_category = business_category or _extract_category(user_message)

    financial_plan = None
    swot_analysis = None

    if extracted_margin and extracted_margin > 0:
        financial_plan = structure_financial_plan(
            available_margin_capital=extracted_margin,
            location=extracted_location or "Rural District",
            business_category=extracted_category or "Micro Enterprise",
            db=db
        )

        if financial_plan and not financial_plan.get("out_of_scope"):
            try:
                feasibility = await generate_feasibility_report(
                    location=extracted_location or "Rural District",
                    business_category=extracted_category or "Micro Enterprise",
                    project_cost=financial_plan["project_cost"]
                )
                swot_analysis = feasibility.get("swot")
            except Exception as e:
                print(f"Feasibility error in chat: {e}")

    # Build Gemini prompt with contextual knowledge & target language
    gemini_reply = await _call_gemini_api(
        user_message=user_message,
        chat_history=chat_history,
        financial_plan=financial_plan,
        swot_analysis=swot_analysis,
        location=extracted_location,
        category=extracted_category,
        margin_capital=extracted_margin,
        language=language
    )

    return {
        "reply": gemini_reply,
        "financial_plan": financial_plan,
        "swot": swot_analysis,
        "extracted_margin_capital": extracted_margin,
        "extracted_location": extracted_location,
        "extracted_category": extracted_category
    }


async def _call_gemini_api(
    user_message: str,
    chat_history: List[Dict[str, Any]],
    financial_plan: Optional[Dict[str, Any]],
    swot_analysis: Optional[Dict[str, Any]],
    location: Optional[str],
    category: Optional[str],
    margin_capital: Optional[float],
    language: str = "Hindi"
) -> str:
    """
    Call Google Gemini REST API with conversation history, grounding context & language enforcement.
    """
    api_key = settings.GEMINI_API_KEY
    primary_model = settings.GEMINI_MODEL or "gemini-3.6-flash"
    candidate_models = [primary_model, "gemini-3.6-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-flash-latest"]

    models_to_try = list(dict.fromkeys(candidate_models))

    # Language rule instruction
    lang_rule = f"Please converse naturally and completely in {language} (use Hinglish if requested, or clean natural conversational phrasing). Do not output any meta checklists, debug validation tags, or bullet points about language verification. Answer the question directly and completely."

    # Context enrichment for Gemini
    context_note = ""
    if financial_plan and not financial_plan.get("out_of_scope"):
        context_note += f"\n[FINANCIAL CONTEXT: Module 2 calculated project cost ₹{financial_plan['project_cost']:,.2f}, Govt Loan ₹{financial_plan['loan_amount']:,.2f}, Scheme: {financial_plan['scheme_selected']}, Interest: {financial_plan['interest_rate']}%, Tenure: {financial_plan['tenure_years']}yrs, Moratorium: {financial_plan['moratorium_months']} months.]"
    if swot_analysis:
        context_note += f"\n[SWOT CONTEXT: Strengths={swot_analysis.get('strengths')}, Weaknesses={swot_analysis.get('weaknesses')}, Opportunities={swot_analysis.get('opportunities')}, Threats={swot_analysis.get('threats')}]"

    if not api_key:
        return _generate_fallback_chat_reply(user_message, financial_plan, swot_analysis, location, category, margin_capital, language)

    # Format messages for Gemini API
    contents = []

    # Include recent clean history
    for msg in chat_history[-6:]:
        role = "user" if msg.get("role") in ["user", "human"] else "model"
        text = msg.get("content") or msg.get("text", "")
        if text:
            # Clean past checklist artifacts if any
            cleaned_text = re.sub(r'^\s*(\*|\-)\s*[A-Za-z\s\?]+:\s*(Yes|No)\.?\s*$', '', text, flags=re.MULTILINE).strip()
            if cleaned_text:
                contents.append({"role": role, "parts": [{"text": cleaned_text}]})

    # Current user message
    contents.append({"role": "user", "parts": [{"text": user_message}]})

    payload = {
        "systemInstruction": {
            "parts": [{"text": f"{SYSTEM_INSTRUCTION}\n{lang_rule}\n{context_note}"}]
        },
        "contents": contents,
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 2048,
            "topP": 0.9
        }
    }

    async with httpx.AsyncClient(timeout=45.0) as client:
        for model in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            try:
                response = await client.post(url, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            raw_reply = parts[0].get("text", "").strip()
                            # Strip any checklist artifacts
                            cleaned = re.sub(r'^\s*(\*|\-)\s*[A-Za-z\s\?]+:\s*(Yes|No)\.?\s*\n?', '', raw_reply, flags=re.MULTILINE).strip()
                            cleaned = re.sub(r'^\s*(\*|\-)\s*(Conc|Warm|Empathetic|Hinglish|Hindi|English|Language)[^\n]*\n?', '', cleaned, flags=re.MULTILINE).strip()
                            if cleaned:
                                return cleaned
                else:
                    print(f"Gemini model {model} returned status {response.status_code}")
            except Exception as e:
                print(f"Gemini API call to {model} failed: {e}")

    return _generate_fallback_chat_reply(user_message, financial_plan, swot_analysis, location, category, margin_capital, language)


def _extract_margin_amount(text: str) -> Optional[float]:
    if not text:
        return None

    clean_text = text.replace(',', '')

    lakh_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs|लख|लाख)', clean_text, re.IGNORECASE)
    if lakh_match:
        val = float(lakh_match.group(1))
        return val * 100000.0

    k_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:k|thousand|हजार)', clean_text, re.IGNORECASE)
    if k_match:
        val = float(k_match.group(1))
        return val * 1000.0

    raw_match = re.search(r'(?:₹|rs\.?|inr)?\s*(\d{4,8})', clean_text, re.IGNORECASE)
    if raw_match:
        return float(raw_match.group(1))

    return None


def _extract_location(text: str) -> Optional[str]:
    if not text:
        return None
    loc_keywords = ["pune", "shirur", "nashik", "satara", "nagpur", "bhandara", "mumbai", "solapur", "kolhapur", "aurangabad", "latur", "thane", "varanasi", "district", "village", "block"]
    for kw in loc_keywords:
        if kw in text.lower():
            return kw.capitalize()
    return None


def _extract_category(text: str) -> Optional[str]:
    if not text:
        return None
    lower = text.lower()
    if "dairy" in lower or "doodh" in lower or "cow" in lower or "buffalo" in lower or "पशुपालन" in lower:
        return "Dairy & Livestock Farming"
    elif "retail" in lower or "shop" in lower or "kirana" in lower or "dukaan" in lower or "दुकान" in lower:
        return "Retail & Grocery Shop"
    elif "tailor" in lower or "silai" in lower or "textile" in lower or "boutique" in lower or "सिलाई" in lower:
        return "Textiles, Garments & Tailoring"
    elif "repair" in lower or "mobile" in lower or "electrical" in lower or "वर्कशॉप" in lower:
        return "Electrical & Mobile Repair Workshop"
    elif "mill" in lower or "flour" in lower or "agro" in lower or "आटा" in lower:
        return "Agro Processing & Flour Mill"
    elif "rickshaw" in lower or "transport" in lower or "auto" in lower or "रिक्शा" in lower or "गाड़ी" in lower:
        return "E-Rickshaw & Commercial Transport"
    return None


def _generate_fallback_chat_reply(
    user_message: str,
    financial_plan: Optional[Dict[str, Any]],
    swot_analysis: Optional[Dict[str, Any]],
    location: Optional[str],
    category: Optional[str],
    margin_capital: Optional[float],
    language: str = "Hindi"
) -> str:
    """
    True last-resort fallback — only called when the Gemini API is completely
    unreachable (network down, all models failed, no API key).
    Does NOT intercept any questions via keyword matching.
    """
    lang_lower = (language or "hindi").lower()
    is_hinglish = "hinglish" in lang_lower

    if is_hinglish:
        return (
            "Dost, abhi AI service temporarily unavailable hai. 🙏\n\n"
            "Kripya thodi der baad try karein. Aapka question note kar liya gaya hai.\n\n"
            "Agar urgent madad chahiye, toh apne nearest District Industries Centre (DIC) ya bank branch se sampark karein."
        )
    elif "marathi" in lang_lower:
        return (
            "मित्रा, AI सेवा तात्पुरती उपलब्ध नाही. 🙏\n\n"
            "कृपया काही वेळाने पुन्हा प्रयत्न करा. तुमचा प्रश्न नोंदवला गेला आहे.\n\n"
            "तातडीच्या मदतीसाठी जवळच्या जिल्हा उद्योग केंद्र (DIC) किंवा बँकेशी संपर्क साधा."
        )
    elif "english" in lang_lower:
        return (
            "I'm sorry, the AI service is temporarily unavailable. 🙏\n\n"
            "Please try again in a moment. Your question has been noted.\n\n"
            "For urgent assistance, please contact your nearest District Industries Centre (DIC) or bank branch."
        )
    else:
        return (
            "क्षमा करें, AI सेवा अभी अस्थायी रूप से अनुपलब्ध है। 🙏\n\n"
            "कृपया थोड़ी देर बाद पुनः प्रयास करें। आपका प्रश्न नोट कर लिया गया है।\n\n"
            "अत्यावश्यक सहायता के लिए अपने निकटतम जिला उद्योग केंद्र (DIC) या बैंक शाखा से संपर्क करें।"
        )
