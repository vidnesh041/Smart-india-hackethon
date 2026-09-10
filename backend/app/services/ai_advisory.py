"""
AI Advisory Service
Generates plain-language rural advisory narratives and business viability plans.
RULE: AI strictly translates and explains already-computed numbers.
It does NOT perform or override financial calculations.
Supports Google Gemini API with fallback to deterministic templates.
"""

import json
from typing import Dict, Any
from app.config import settings
from app.schemas.user_schema import AdvisoryRequest, SchemeResponse, LoanStructure, BusinessViability

def compute_business_viability(
    investment_amount: float,
    business_type: str,
    monthly_emi: float,
    experience_level: str
) -> BusinessViability:
    """
    Computes projected monthly revenue, operating costs, and net profit based on standard
    rural micro-enterprise benchmarks (NABARD / KVIC models).
    """
    bt = (business_type or "").lower()
    
    if any(k in bt for k in ["dairy", "milk", "poultry", "goat", "animal"]):
        monthly_rev_rate = 0.22
        exp_ratio = 0.55
    elif any(k in bt for k in ["grocery", "kirana", "retail", "shop", "dukaan"]):
        monthly_rev_rate = 0.28
        exp_ratio = 0.72
    elif any(k in bt for k in ["tailor", "garment", "handicraft", "artisan", "silai"]):
        monthly_rev_rate = 0.25
        exp_ratio = 0.40
    elif any(k in bt for k in ["solar", "rickshaw", "transport", "vehicle"]):
        monthly_rev_rate = 0.20
        exp_ratio = 0.35
    else:
        monthly_rev_rate = 0.22
        exp_ratio = 0.50

    exp_mult = 1.0
    if experience_level == "New":
        exp_mult = 0.90
    elif experience_level == "3+ years":
        exp_mult = 1.15

    estimated_monthly_revenue = round(investment_amount * monthly_rev_rate * exp_mult, 2)
    estimated_monthly_expense = round(estimated_monthly_revenue * exp_ratio, 2)
    
    net_operating_income = estimated_monthly_revenue - estimated_monthly_expense
    net_monthly_profit = round(net_operating_income - monthly_emi, 2)
    
    is_viable = net_monthly_profit > (monthly_emi * 0.5) and net_monthly_profit > 3000
    
    if monthly_emi > 0:
        coverage_ratio = net_operating_income / monthly_emi
        viability_score = min(98, max(45, int(coverage_ratio * 30)))
    else:
        viability_score = 90

    if is_viable:
        viability_note = f"Your business is financially viable! After paying your monthly EMI of ₹{monthly_emi:,.0f} and covering operating expenses, you are projected to save approximately ₹{net_monthly_profit:,.0f} per month as net profit."
        viability_note_hi = f"आपका व्यवसाय आर्थिक रूप से मजबूत और लाभदायक है! हर महीने ₹{monthly_emi:,.0f} की लोन किश्त और खर्च निकालने के बाद, आप लगभग ₹{net_monthly_profit:,.0f} का शुद्ध मुनाफा कमा सकेंगे।"
    else:
        viability_note = f"Tight margin: Estimated profit after EMI is ₹{net_monthly_profit:,.0f}. We recommend keeping initial operating costs strictly in check or extending tenure."
        viability_note_hi = f"सावधानी: ईएमआई के बाद अनुमानित बचत ₹{net_monthly_profit:,.0f} है। शुरुआत में खर्चों को नियंत्रित रखें।"

    return BusinessViability(
        estimated_monthly_revenue=estimated_monthly_revenue,
        estimated_monthly_expense=estimated_monthly_expense,
        monthly_loan_emi=monthly_emi,
        estimated_net_monthly_profit=net_monthly_profit,
        is_viable=is_viable,
        viability_score=viability_score,
        viability_note=viability_note,
        viability_note_hi=viability_note_hi
    )


def generate_advisory_narrative(
    request: AdvisoryRequest,
    scheme: SchemeResponse,
    loan: LoanStructure,
    viability: BusinessViability
) -> Dict[str, Any]:
    """
    Generates bilingual explanatory text using Google Gemini API.
    Gracefully falls back to high-quality deterministic templates if API key is not supplied or fails.
    """
    prompt = f"""
    You are a helpful and polite Indian Government Rural Financial Advisory Assistant.
    Explain the following loan structure clearly to a rural entrepreneur in simple language (no heavy jargon).
    
    Entrepreneur Details:
    - Business: {request.business_type} ({request.business_title or 'General'})
    - Location: {request.district or 'Rural'}, {request.state or 'India'}
    - Gender: {request.gender}
    
    Matched Scheme: {scheme.scheme_name} ({scheme.scheme_name_hi}) by {scheme.agency}
    
    Pre-Calculated Numbers (CRITICAL: DO NOT CHANGE ANY NUMBERS):
    - Total Project Cost: Rs. {loan.total_project_cost:,.2f}
    - Entrepreneur Margin Share ({loan.margin_percent}%): Rs. {loan.margin_money:,.2f}
    - Govt Concessional Loan ({loan.loan_percent}%): Rs. {loan.loan_amount:,.2f}
    - Interest Rate: {loan.effective_interest_rate}% p.a.
    - Repayment Tenure: {loan.tenure_years} Years
    - Moratorium Period: {loan.moratorium_months} Months
    - Monthly EMI: Rs. {loan.monthly_emi:,.2f}
    - Projected Net Monthly Profit after EMI: Rs. {viability.estimated_net_monthly_profit:,.2f}
    
    Return strict JSON object with fields:
    {{
      "ai_advisory_text": "2-3 paragraphs in simple English explaining why this scheme fits and how they should manage repayment",
      "ai_advisory_text_hi": "2-3 paragraphs in simple, warm Hindi explaining why this scheme fits, margin money, and EMI",
      "business_action_plan": ["Step 1...", "Step 2...", "Step 3...", "Step 4..."],
      "business_action_plan_hi": ["कदम 1...", "कदम 2...", "कदम 3...", "कदम 4..."],
      "application_steps": ["1. Visit nearest SCA / Bank...", "2. Submit Aadhaar & Estimate...", "3. Loan verification..."],
      "application_steps_hi": ["1. नजदीकी SCA / बैंक शाखा में जाएं...", "2. आधार व कोटेशन जमा करें...", "3. सत्यापन एवं लोन वितरण..."]
    }}
    """

    # 1. Try Google Gemini API
    if settings.GEMINI_API_KEY:
        try:
            from google import genai
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt,
                config={"response_mime_type": "application/json"}
            )
            if response and response.text:
                content = json.loads(response.text)
                return {
                    "ai_advisory_text": content.get("ai_advisory_text"),
                    "ai_advisory_text_hi": content.get("ai_advisory_text_hi"),
                    "business_action_plan": content.get("business_action_plan", []),
                    "business_action_plan_hi": content.get("business_action_plan_hi", []),
                    "application_steps": content.get("application_steps", []),
                    "application_steps_hi": content.get("application_steps_hi", [])
                }
        except Exception as e:
            print(f"Gemini API advisory call error/fallback: {e}")

    # 2. Try OpenAI API (if configured)
    if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.startswith("sk-"):
        try:
            from openai import OpenAI
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            response = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0.3,
                timeout=12.0
            )
            content = json.loads(response.choices[0].message.content)
            return {
                "ai_advisory_text": content.get("ai_advisory_text"),
                "ai_advisory_text_hi": content.get("ai_advisory_text_hi"),
                "business_action_plan": content.get("business_action_plan", []),
                "business_action_plan_hi": content.get("business_action_plan_hi", []),
                "application_steps": content.get("application_steps", []),
                "application_steps_hi": content.get("application_steps_hi", [])
            }
        except Exception as e:
            print(f"OpenAI API advisory call error/fallback: {e}")

    # 3. Deterministic High-Quality Template Fallback
    en_narrative = (
        f"Congratulations! Based on your requirement of ₹{loan.total_project_cost:,.0f} for your {request.business_type} business, "
        f"the best suited government scheme is '{scheme.scheme_name}' provided by {scheme.agency}.\n\n"
        f"Under this scheme, you do not have to worry about huge upfront money. You only need to contribute ₹{loan.margin_money:,.0f} ({loan.margin_percent}%) as your margin share. "
        f"The government agency will provide the remaining ₹{loan.loan_amount:,.0f} ({loan.loan_percent}%) as a concessional loan at an interest rate of {loan.effective_interest_rate}% per annum.\n\n"
        f"You get a grace period (moratorium) of {loan.moratorium_months} months to set up your business before your monthly installment of ₹{loan.monthly_emi:,.0f} begins over {loan.tenure_years} years."
    )
    
    hi_narrative = (
        f"बधाई हो! आपके {request.business_type} व्यवसाय के लिए ₹{loan.total_project_cost:,.0f} के निवेश पर "
        f"सरकारी संस्था '{scheme.agency}' की '{scheme.scheme_name_hi}' सबसे उपयुक्त और लाभकारी योजना है।\n\n"
        f"इस योजना में आपको भारी पूंजी की चिंता नहीं करनी है। आपको खुद केवल ₹{loan.margin_money:,.0f} ({loan.margin_percent}%) मार्जिन मनी लगानी होगी। "
        f"बाकी ₹{loan.loan_amount:,.0f} ({loan.loan_percent}%) सरकार की तरफ से रियायती दर पर मात्र {loan.effective_interest_rate}% वार्षिक ब्याज पर मिलेगा।\n\n"
        f"व्यवसाय को स्थापित करने के लिए आपको {loan.moratorium_months} महीने की छूट (मोरेटोरियम) मिलेगी, जिसके बाद {loan.tenure_years} वर्षों तक हर महीने मात्र ₹{loan.monthly_emi:,.0f} की आसान किश्त चुकानी होगी।"
    )

    action_plan_en = [
        f"Procure core equipment and raw materials using the upfront margin money of ₹{loan.margin_money:,.0f}.",
        f"Keep separate records of daily sales and ensure minimum monthly revenue target of ₹{viability.estimated_monthly_revenue:,.0f}.",
        f"Deposit your monthly EMI of ₹{loan.monthly_emi:,.0f} on time every month to maintain a clean credit score for future business expansion.",
        "Reinvest 30% of monthly net profit back into working capital for sustained growth."
    ]

    action_plan_hi = [
        f"मार्जिन मनी ₹{loan.margin_money:,.0f} से व्यवसाय के लिए आवश्यक मशीनरी या कच्चा माल खरीदें।",
        f"दैनिक बिक्री का हिसाब रखें और कम से कम ₹{viability.estimated_monthly_revenue:,.0f} मासिक आय का लक्ष्य प्राप्त करें।",
        f"हर महीने ₹{loan.monthly_emi:,.0f} की ईएमआई समय पर भरें ताकि भविष्य में बड़े लोन की पात्रता बनी रहे।",
        "मासिक शुद्ध मुनाफे का 30% हिस्सा व्यवसाय के विस्तार और आकस्मिक फंड के लिए अलग रखें।"
    ]

    steps_en = [
        "1. Visit your nearest District State Channelizing Agency (SCA) office, District Industries Centre (DIC), or partner bank branch.",
        f"2. Submit the loan application form attaching your project estimate (₹{loan.total_project_cost:,.0f}) and KYC documents: {scheme.documents_required}.",
        "3. Field officer verification will be completed within 7 to 15 working days.",
        "4. Loan sanction and direct transfer to your vendor/bank account upon margin deposit."
    ]

    steps_hi = [
        "1. अपने जिले के राज्य चैनलाइजिंग एजेंसी (SCA) कार्यालय, जिला उद्योग केंद्र (DIC) या नजदीकी बैंक शाखा में संपर्क करें।",
        f"2. आवेदन पत्र के साथ ₹{loan.total_project_cost:,.0f} का अनुमानित प्रोजेक्ट कोटेशन एवं दस्तावेज जमा करें: {scheme.documents_required}।",
        "3. संबंधित अधिकारी 7 से 15 दिनों में आपके व्यवसाय स्थल का भौतिक सत्यापन करेंगे।",
        "4. मार्जिन मनी जमा करने पर लोन की स्वीकृति और उपकरण/सामग्री हेतु राशि का प्रत्यक्ष हस्तांतरण।"
    ]

    return {
        "ai_advisory_text": en_narrative,
        "ai_advisory_text_hi": hi_narrative,
        "business_action_plan": action_plan_en,
        "business_action_plan_hi": action_plan_hi,
        "application_steps": steps_en,
        "application_steps_hi": steps_hi
    }
