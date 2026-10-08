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

Your Persona & Style:
- Speak naturally, respectfully, and warmly like a personal human mentor (गुरूजी / मित्र / मार्गदर्शक).
- Avoid robotic checklists, bulleted validation tags, or repeating prompt instructions.
- Provide direct, thoughtful, and complete answers to user questions. Never stop mid-sentence.
- If a user asks about an unrealistic or massive venture (e.g. private jet, airline, luxury skyscraper in a rural district), give an honest, friendly, grounded reality check explaining practical local constraints (runways, ATC, high maintenance, lack of demand, ₹100Cr+ capital required) and gently guide them towards high-demand, high-profit viable rural/semi-rural businesses (e.g., transport logistics, agro-processing, cold chain, dairy).
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
            "temperature": 0.5,
            "maxOutputTokens": 2048
        }
    }

    async with httpx.AsyncClient(timeout=25.0) as client:
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
    msg_lower = user_message.lower()
    loc_str = location or "aapke jile"
    cat_str = category or "vyavasay"
    lang_lower = (language or "hindi").lower()
    is_hinglish = "hinglish" in lang_lower

    # 1. Check for luxury / mega / unrealistic business queries (e.g., private jet, airline, mega mall)
    if any(w in msg_lower for w in ["jet", "private jet", "plane", "helicopter", "airport", "airline", "हवाई जहाज", "जेट"]):
        if is_hinglish:
            return (
                f"Dost, aapka vision sach me bohot bada hai! Lekin ek sachha mentor hone ke naate, mujhe aapko zameen ki haqeeqat batana zaroori hai.\n\n"
                f"✈️ **Private Jet Service {loc_str} me kyun viable nahi hai?**\n"
                f"1. **Badi Lagat (Capital):** Ek chhota private jet bhi ₹50 se ₹150 Crore ka aata hai, jo kisi bhi MSME ya concessional loan scheme ki ₹50 Lakh limit se bohot bahar hai.\n"
                f"2. **Infrastructure ki kami:** {loc_str} me commercial runway, ATC tower, hanger aur jet maintenance facility uplabdh nahi hai.\n"
                f"3. **Local Demand:** Gramin v kasba kshetron me daily private jet hire karne wale customers ki sankhya na ke barabar hoti hai.\n\n"
                f"💡 **Aapke liye Behtar Vikalp (High Profit Alternatives):**\n"
                f"Agar aap transport aur logistics me aage badhna chahte hain, toh:\n"
                f"• **Commercial Cargo / Mini-Truck Fleet** (90% Govt Loan up to ₹45 Lakh)\n"
                f"• **Cold-Chain / Agri Transport Van**\n"
                f"• **Travels & Taxi Fleet Service**\n\n"
                f"Aapke paas kitna budget ya Margin Capital uplabdh hai? Main aapko uska roadmap banakar deta hun!"
            )
        elif "marathi" in lang_lower:
            return (
                f"मित्रा, तुमची कल्पना खूप मोठी आहे, पण एक मार्गदर्शक म्हणून वस्तुस्थिती सांगणे गरजेचे आहे.\n\n"
                f"✈️ **{loc_str} मध्ये प्रायव्हेट जेट सेवा का शक्य नाही?**\n"
                f"१. **प्रचंड खर्च:** एका जेटसाठी किमान ५० ते १०० कोटी लागतात, जे सरकारी एमएसएमई योजनांच्या मर्यादेबाहेर आहे.\n"
                f"२. **पायाभूत सुविधांचा अभाव:** स्थानिक पातळीवर रनवे, एटीसी आणि मेंटेनन्स सुविधा उपलब्ध नाहीत.\n"
                f"३. **स्थानिक मागणी:** अशा भागात नियमित जेट वापरणारे ग्राहक नसतात.\n\n"
                f"💡 **पर्यायी फायदेशीर व्यवसाय:**\n"
                f"• कृषी वाहतूक व मिनी-ट्रक सेवा (९०% शासकीय कर्ज)\n"
                f"• टूर अँड ट्रॅव्हल्स किंवा टेम्पो सेवा\n\n"
                f"तुमच्याकडे किती मार्जिन रक्कम उपलब्ध आहे ते सांगा, आपण योग्य योजना पाहूया!"
            )
        else:
            return (
                f"मित्र, आपका दृष्टिकोण बहुत बड़ा है, लेकिन एक मार्गदर्शक के रूप में ज़मीनी सच्चाई बताना मेरा कर्तव्य है।\n\n"
                f"✈️ **{loc_str} में प्राइवेट जेट सेवा क्यों व्यावहारिक नहीं है?**\n"
                f"1. **अत्यधिक लागत:** एक जेट की लागत ₹50 से ₹150 करोड़ होती है, जो 90% रियायती सरकारी ऋण सीमा (अधिकतम ₹50 लाख) से बहुत अधिक है।\n"
                f"2. **इन्फ्रास्ट्रक्चर की कमी:** स्थानीय स्तर पर रनवे, एटीसी और मेंटेनेंस की सुविधा उपलब्ध नहीं है।\n"
                f"3. **स्थानीय मांग:** ग्रामीण और छोटे शहरों में प्राइवेट जेट के नियमित ग्राहक नहीं होते।\n\n"
                f"💡 **आपके लिए बेहतर और व्यावहारिक विकल्प:**\n"
                f"• **कमर्शियल कार्गो / मिनी-ट्रक सेवा** (90% सरकारी ऋण उपलब्ध)\n"
                f"• **एग्री कोल्ड-चेन ट्रांसपोर्ट वाहन**\n"
                f"• **टूर एंड ट्रेवल्स फ्लीट**\n\n"
                f"आपके पास कितनी मार्जिन राशि उपलब्ध है? बताएं, मैं उसका सही वित्तीय रोडमैप तैयार करूँगा।"
            )

    # 2. Document / Kagaz query
    if any(w in msg_lower for w in ["doc", "document", "kagaz", "praman", "paper", "कागज़", "दस्तावेज़"]):
        if is_hinglish:
            return (
                "📄 **Loan Application ke liye Zaroori Documents:**\n\n"
                "1. **Pehchan Praman (KYC):** Aadhaar Card, PAN Card, Voter ID\n"
                "2. **Pata Praman (Address Proof):** Ration Card ya Bijli Bill\n"
                "3. **Bank Passbook:** Pichhle 6 mahine ka bank statement\n"
                "4. **Aay v Jaati Praman Patra:** Agar SC/ST/OBC/EWS concessional scheme apply kar rahe hain\n"
                "5. **Project DPR / Quotation:** Machine ya raw material ka quotation\n\n"
                "Kya aapko kisi specific document ya DPR banane me madad chahiye?"
            )
        elif "marathi" in lang_lower:
            return (
                "📄 **कर्जासाठी आवश्यक कागदपत्रे (Required Documents):**\n\n"
                "1. **ओळख पुरावा (KYC):** आधार कार्ड / मतदार ओळखपत्र / पॅन कार्ड\n"
                "2. **पत्ता पुरावा:** रेशन कार्ड / वीज बिल / ग्रामपंचायत दाखला\n"
                "3. **उत्पन्न/जात प्रमाणपत्र:** सक्षम अधिकाऱ्याचे उत्पन्न व जात प्रमाणपत्र\n"
                "4. **बँक पासबुक:** गेल्या ६ महिन्यांचे बँक स्टेटमेंट\n"
                "5. **प्रकल्प कोटेशन (DPR):** मशीन किंवा साहित्याचे मूळ अंदाजपत्रक\n\n"
                "तुम्हाला यापैकी कोणत्याही कागदपत्रांबद्दल अधिक माहिती हवी आहे का?"
            )
        elif "english" in lang_lower:
            return (
                "📄 **Key Mandatory Documents Required for Loan Application:**\n\n"
                "1. **Identity Proof (KYC):** Aadhaar Card / Voter ID / PAN Card\n"
                "2. **Address Proof:** Ration Card / Electricity Bill / Gram Panchayat Certificate\n"
                "3. **Income & Category Certificate:** Valid Caste Certificate & Family Income Certificate\n"
                "4. **Bank Passbook:** 6-Month updated Bank Statement\n"
                "5. **Detailed Project DPR / Quotation:** Required for project cost above ₹1.40 Lakh\n\n"
                "Would you like guidance on preparing your Detailed Project Report (DPR)?"
            )
        else:
            return (
                "📄 **ऋण (Loan) के लिए आवश्यक दस्तावेज (Mandatory Documents):**\n\n"
                "1. **पहचान प्रमाण (KYC):** आधार कार्ड / मतदाता पहचान पत्र / पैन कार्ड\n"
                "2. **पता प्रमाण:** राशन कार्ड / बिजली बिल / ग्राम पंचायत प्रमाण पत्र\n"
                "3. **आय व वर्ग प्रमाण पत्र:** सक्षम प्राधिकारी द्वारा जारी आय व जाति प्रमाण पत्र\n"
                "4. **बैंक पासबुक:** पिछले 6 महीने का बैंक पासबुक/स्टेटमेंट\n"
                "5. **प्रोजेक्ट कोटेशन (DPR):** ₹1.40 लाख से अधिक लागत हेतु विस्तृत प्रोजेक्ट रिपोर्ट\n\n"
                "क्या आपको इनमें से किसी दस्तावेज़ को तैयार करने में सहायता चाहिए?"
            )

    # 3. Application Process query
    if any(w in msg_lower for w in ["apply", "kaise", "process", "avadan", "aavedan", "आवेदन", "अर्ज"]):
        if is_hinglish:
            return (
                "📝 **Loan Aavedan ki Step-by-Step Process:**\n\n"
                "1. Apne nikat-tam **District Industries Centre (DIC)** ya Bank Branch me jayein.\n"
                "2. Apni 10% Margin Capital ka praman (bank balance) dikhayein.\n"
                "3. Micro Finance Scheme (₹1.40L tak) ya Term Loan Scheme (₹50L tak) ka aavedan form bharein.\n"
                "4. DIC aur Bank viability check karke 90% concessional loan approve karega.\n"
                "5. Isme 3 se 6 mahine ka moratorium milega jisme EMI nahi deni hoti."
            )
        elif "marathi" in lang_lower:
            return (
                "📝 **कर्ज अर्जाची टप्प्याटप्प्याने प्रक्रिया:**\n\n"
                "1. जवळच्या **जिल्हा उद्योग केंद्र (DIC)** किंवा बँक शाखेला भेट द्या.\n"
                "2. तुमच्याकडे उपलब्ध असलेल्या १०% मार्जिन रकमेचा पुरावा सादर करा.\n"
                "3. मायक्रो फायनान्स किंवा टर्म लोन योजनेचा अर्ज भरा.\n"
                "4. बँक अधिकारी तुमच्या व्यवसायाची व्यवहार्यता तपासून कर्ज मंजूर करतील."
            )
        elif "english" in lang_lower:
            return (
                "📝 **Step-by-Step Loan Application Procedure:**\n\n"
                "1. Visit your nearest **District Industry Centre (DIC)**, SCA office, or Bank Branch.\n"
                "2. Present proof of your 10% Available Margin Capital.\n"
                "3. Submit the concessional loan application form under Micro Finance or Term Loan Scheme.\n"
                "4. The bank evaluates your project cost and sanctions 90% concessional loan."
            )
        else:
            return (
                "📝 **ऋण आवेदन की चरण-दर-चरण प्रक्रिया (Loan Application Process):**\n\n"
                "1. अपने निकटतम **जिला उद्योग केंद्र (DIC)**, SCA कार्यालय या बैंक शाखा में जाएं।\n"
                "2. अपनी 10% मार्जिन राशि का विवरण प्रस्तुत करें।\n"
                "3. माइक्रोक्रेडिट या टर्म लोन योजना हेतु आवेदन पत्र भरें।\n"
                "4. बैंक परियोजना की व्यवहार्यता सत्यापित कर 90% ऋण स्वीकृत करेगा।"
            )

    # 4. Financial plan + SWOT explanation response
    if financial_plan and not financial_plan.get("out_of_scope"):
        cost = financial_plan['project_cost']
        loan = financial_plan['loan_amount']
        margin = financial_plan['margin_capital']
        scheme = financial_plan['scheme_selected']
        rate = financial_plan['interest_rate']
        tenure = financial_plan['tenure_years']
        mora = financial_plan['moratorium_months']

        s_list = swot_analysis.get('strengths', [f"Direct local presence in {loc_str}", "90% Concessional Govt Loan support"]) if swot_analysis else [f"Local presence in {loc_str}", "90% Govt Loan support"]
        w_list = swot_analysis.get('weaknesses', ["Working capital buffer needed during moratorium", "Initial marketing reach"]) if swot_analysis else ["Working capital buffer during moratorium"]
        o_list = swot_analysis.get('opportunities', [f"Unserved demand in 5-10 km radius around {loc_str}", "Institutional buyers"]) if swot_analysis else [f"5-10 km radius demand in {loc_str}"]
        t_list = swot_analysis.get('threats', ["Seasonal agricultural demand cycles", "Raw material price volatility"]) if swot_analysis else ["Seasonal demand cycles"]

        if is_hinglish:
            return (
                f"Aapke available **₹{margin:,.2f}** Margin Capital ke aadhar par **{loc_str}** me **{cat_str}** ka complete Financial Roadmap & SWOT Analysis taiyaar hai:\n\n"
                f"💰 **Financial Roadmap (Module 2):**\n"
                f"• **Total Project Cost:** ₹{cost:,.2f}\n"
                f"• **Govt Concessional Loan (90%):** ₹{loan:,.2f}\n"
                f"• **Selected Scheme:** {scheme} ({rate}% p.a. Byaj, {tenure} Saal ki Avadhi)\n"
                f"• **Moratorium Period:** {mora} Mahine (Is dauraan koi EMI nahi deni padegi!)\n\n"
                f"📊 **SWOT Analysis Breakdown:**\n"
                f"🟢 **Strengths (Taakat):** {', '.join(s_list)}\n"
                f"🔴 **Weaknesses (Kamzoriyaan):** {', '.join(w_list)}\n"
                f"🔵 **Opportunities (Avasar):** {', '.join(o_list)}\n"
                f"🟠 **Threats (Jokhim):** {', '.join(t_list)}\n\n"
                f"Aap aavedan process ya marketing ke baare me kuch bhi pooch sakte hain!"
            )
        elif "english" in lang_lower:
            return (
                f"Based on your available margin capital of **₹{margin:,.2f}**, here is your complete Financial Roadmap & SWOT Analysis for **{cat_str}** in **{loc_str}**:\n\n"
                f"💰 **Financial Roadmap (Module 2):**\n"
                f"• **Total Feasible Project Cost:** ₹{cost:,.2f}\n"
                f"• **Govt Concessional Loan (90%):** ₹{loan:,.2f}\n"
                f"• **Matched Scheme:** {scheme} ({rate}% p.a. Interest, {tenure}-Year Tenure)\n"
                f"• **Moratorium Period:** {mora} Months (No principal repayment due during this window!)\n\n"
                f"📊 **SWOT Analysis Breakdown:**\n"
                f"🟢 **Strengths:** {', '.join(s_list)}\n"
                f"🔴 **Weaknesses:** {', '.join(w_list)}\n"
                f"🔵 **Opportunities:** {', '.join(o_list)}\n"
                f"🟠 **Threats:** {', '.join(t_list)}\n\n"
                f"Feel free to ask me any questions regarding required documents, application process, or marketing strategy!"
            )
        elif "marathi" in lang_lower:
            return (
                f"तुमच्या उपलब्ध **₹{margin:,.2f}** मार्जिन रकमेच्या आधारे **{loc_str}** मधील **{cat_str}** व्यवसायाचा फायनान्शियल रोडमॅप आणि SWOT विश्लेषण:\n\n"
                f"💰 **फायनान्शियल रोडमॅप (Financial Roadmap):**\n"
                f"• **एकूण प्रकल्प खर्च (Total Cost):** ₹{cost:,.2f}\n"
                f"• **शासकीय कर्ज (90% Govt Loan):** ₹{loan:,.2f}\n"
                f"• **निवडलेली योजना:** {scheme} ({rate}% व्याजदर, {tenure} वर्षे मुदत)\n"
                f"• **मोरेटोरियम कालावधी:** {mora} महिने (या काळात हप्ता भरावा लागणार नाही!)\n\n"
                f"📊 **SWOT विश्लेषण (SWOT Analysis):**\n"
                f"🟢 **मजबूत बाजू (Strengths):** {', '.join(s_list)}\n"
                f"🔴 **कमकुवत बाजू (Weaknesses):** {', '.join(w_list)}\n"
                f"🔵 **संधी (Opportunities):** {', '.join(o_list)}\n"
                f"🟠 **धोके (Threats):** {', '.join(t_list)}\n\n"
                f"तुम्ही मला कागदपत्रे, अर्ज प्रक्रिया किंवा स्थानिक विक्रीबद्दल कोणताही प्रश्न विचारू शकता!"
            )
        else:
            return (
                f"आपके उपलब्ध **₹{margin:,.2f}** मार्जिन कैपिटल के आधार पर **{loc_str}** में **{cat_str}** का वित्तीय रोडमैप व SWOT विश्लेषण प्रस्तुत है:\n\n"
                f"💰 **वित्तीय रोडमैप (Financial Roadmap):**\n"
                f"• **कुल परियोजना लागत (Total Cost):** ₹{cost:,.2f}\n"
                f"• **सरकारी ऋण पात्रता (90% Loan):** ₹{loan:,.2f}\n"
                f"• **चयनित योजना:** {scheme} ({rate}% वार्षिक ब्याज, {tenure} वर्ष अवधि)\n"
                f"• **मोरेटोरियम अवधि:** {mora} महीने (इस दौरान मूलधन किस्त देय नहीं होगी!)\n\n"
                f"📊 **SWOT विश्लेषण (SWOT Analysis Breakdown):**\n"
                f"🟢 **मजबूत पक्ष (Strengths):** {', '.join(s_list)}\n"
                f"🔴 **कमजोरियां (Weaknesses):** {', '.join(w_list)}\n"
                f"🔵 **अवसर (Opportunities):** {', '.join(o_list)}\n"
                f"🟠 **जोखिम (Threats):** {', '.join(t_list)}\n\n"
                f"आप मुझसे ऋण आवेदन, आवश्यक दस्तावेज, या स्थानीय बाजार रणनीति के बारे में कोई भी प्रश्न पूछ सकते हैं!"
            )

    # 5. General intelligent response
    if is_hinglish:
        return (
            "Namaste! 🙏 Main **Local Advisor** hun — aapka AI Rural Business Mentor.\n\n"
            "Main aapke business idea, viability, market SWOT analysis aur 90% Govt Loan schemes ko structure karne me poori madad karunga.\n\n"
            "Kripya mujhe batayein:\n"
            "1. Aapka **Business Idea** kya hai?\n"
            "2. Aapki **Location / Jila** kaunsa hai?\n"
            "3. Aapke paas lagbhag kitna **Margin Capital (10% Cash)** hai?"
        )
    elif "marathi" in lang_lower:
        return (
            "नमस्कार! मी **Local Advisor** आहे. 🙏\n\n"
            "मी तुम्हाला तुमच्या व्यवसायाच्या कल्पनेवर आधारित ९०% शासकीय कर्ज पात्रता आणि SWOT विश्लेषण समजून सांगण्यास मदत करेन.\n\n"
            "कृपया सांगा:\n"
            "१. तुमचा **व्यवसाय कोणता** आहे? (उदा. डेअरी, किराणा दुकान, शिलाई, वर्कशॉप)\n"
            "२. तुमचे **स्थान (Location)** कोणते आहे?\n"
            "३. तुमच्याकडे किती **मार्जिन रक्कम (10% Cash)** उपलब्ध आहे? (उदा. ₹५०,००० किंवा ₹१,००,०००)"
        )
    elif "english" in lang_lower:
        return (
            "Hello! I am **Local Advisor** — your AI Rural Business Advisor. 🙏\n\n"
            "I will help you structure your business idea, calculate your 90% Govt Loan eligibility from your 10% Margin Capital, and generate a complete SWOT analysis.\n\n"
            "Please tell me:\n"
            "1. What is your **Business Idea**? (e.g. Dairy, Retail Shop, Tailoring, Workshop)\n"
            "2. What is your **Location** (Village / Block / District)?\n"
            "3. How much **Margin Capital (10% Cash)** do you have? (e.g. ₹50,000 or ₹1,00,000)"
        )
    else:
        return (
            "नमस्ते! मैं **Local Advisor** हूँ। 🙏\n\n"
            "मैं आपके व्यवसाय विचार, 10% मार्जिन राशि से 90% सरकारी ऋण पात्रता, और सम्पूर्ण SWOT विश्लेषण में आपकी सहायता करूँगा।\n\n"
            "कृपया बताएं:\n"
            "1. आपका **व्यवसाय विचार** क्या है? (जैसे डेयरी, किराना दुकान, सिलाई, वर्कशॉप)\n"
            "2. आपका **स्थान (Location)** क्या है?\n"
            "3. आपके पास कितनी **मार्जिन राशि (10% Cash)** उपलब्ध है? (जैसे ₹50,000 या ₹1,00,000)"
        )
