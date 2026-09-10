"""
Authentic Government Concessional Schemes Seed Data
Sources: NSFDC (National Scheduled Castes Finance & Development Corporation),
Ministry of Social Justice and Empowerment (MoSJE), and National SC/ST Hub Guidelines.
"""

from app.database.db_connection import SessionLocal, engine, Base
from app.models.scheme_model import Scheme

AUTHENTIC_SCHEMES = [
    {
        "scheme_name": "Micro Finance Scheme (MFS)",
        "scheme_name_hi": "माइक्रो फाइनेंस योजना (एमएफएस)",
        "agency": "NSFDC / State Channelizing Agencies (SCA)",
        "category": "Small Business / Dairy / Artisan / Retail",
        "min_cost": 10000.0,
        "max_cost": 140000.0,
        "margin_percent": 5.0,
        "govt_loan_percent": 95.0,
        "interest_rate": 5.0,
        "interest_rebate_women": 1.0,
        "repayment_years": 3,
        "moratorium_months": 3,
        "description": "Provides quick concessional micro-credit directly or through Self Help Groups (SHGs) for starting small rural income-generating activities such as dairy, poultry, petty shop, tailoring, or handicrafts.",
        "description_hi": "ग्रामीण उद्यमियों और स्वयं सहायता समूहों (SHG) को डेयरी, छोटी दुकान, सिलाई या हस्तशिल्प जैसे छोटे व्यवसाय शुरू करने के लिए 95% तक रियायती लोन उपलब्ध कराता है।",
        "eligibility": "Rural micro-entrepreneurs belonging to target beneficiary groups with annual family income criteria as per MoSJE/SCA guidelines.",
        "eligibility_hi": "लक्षित वर्ग के ग्रामीण उद्यमी व परिवार जिनकी वार्षिक आय राज्य/केंद्रीय दिशा-निर्देशों के अनुरूप हो।",
        "documents_required": "Aadhaar Card, Caste/Category Certificate, Income Certificate, Bank Account Passbook, Passport Size Photograph",
        "is_active": True
    },
    {
        "scheme_name": "Mahila Samriddhi Yojana (MSY)",
        "scheme_name_hi": "महिला समृद्धि योजना (एमएसवाई)",
        "agency": "NSFDC / MoSJE (Exclusively for Women)",
        "category": "Women Enterprise / Tailoring / Beauty / Dairy / SHG",
        "min_cost": 10000.0,
        "max_cost": 140000.0,
        "margin_percent": 5.0,
        "govt_loan_percent": 95.0,
        "interest_rate": 4.0,
        "interest_rebate_women": 0.0, # Base rate already discounted to 4%
        "repayment_years": 3,
        "moratorium_months": 3,
        "description": "Special exclusive micro-finance scheme for women entrepreneurs and women SHGs with an ultra-low concessional interest rate of 4% per annum to promote financial independence.",
        "description_hi": "महिला उद्यमियों और महिला SHG के लिए विशेष योजना, जिसमें मात्र 4% वार्षिक ब्याज दर पर 95% लोन सहायता दी जाती है।",
        "eligibility": "Exclusively for women beneficiaries and women Self-Help Groups (SHGs).",
        "eligibility_hi": "केवल महिला उद्यमियों और महिला स्वयं सहायता समूहों के लिए मान्य।",
        "documents_required": "Aadhaar Card, Category Certificate, Income Proof, Bank Passbook, SHG Resolution/Recommendation (if group)",
        "is_active": True
    },
    {
        "scheme_name": "Laghu Vyavasay Yojana (LVY)",
        "scheme_name_hi": "लघु व्यवसाय योजना (एलवीवाई)",
        "agency": "NSFDC / State Channelizing Agencies",
        "category": "Retail / Workshop / Transport / Services",
        "min_cost": 50000.0,
        "max_cost": 500000.0,
        "margin_percent": 10.0,
        "govt_loan_percent": 90.0,
        "interest_rate": 6.0,
        "interest_rebate_women": 1.0,
        "repayment_years": 5,
        "moratorium_months": 6,
        "description": "Supports small businesses and service setups like grocery stores, mobile/electrical repair workshops, transport vehicles, welding units, and fabrication.",
        "description_hi": "किराना स्टोर, मोबाइल/इलेक्ट्रिकल रिपेयर, ऑटो-ट्रांसपोर्ट, वेल्डिंग एवं सर्विसिंग जैसे छोटे उद्यमों के लिए ₹5 लाख तक का रियायती ऋण।",
        "eligibility": "Eligible target group entrepreneurs with basic vocational skills or trade experience.",
        "eligibility_hi": "उद्यमी जिनके पास संबंधित काम का बुनियादी अनुभव या कौशल हो।",
        "documents_required": "Aadhaar Card, Category Certificate, Income Certificate, Basic Project Quotation/Estimate, Bank Passbook, KYC",
        "is_active": True
    },
    {
        "scheme_name": "Term Loan Scheme (TLS) - Tier 1",
        "scheme_name_hi": "टर्म लोन योजना - टियर 1",
        "agency": "NSFDC / MoSJE",
        "category": "Manufacturing / Agri-Processing / Dairy Unit / Transport",
        "min_cost": 500000.0,
        "max_cost": 1500000.0,
        "margin_percent": 10.0,
        "govt_loan_percent": 90.0,
        "interest_rate": 7.0,
        "interest_rebate_women": 1.0,
        "repayment_years": 7,
        "moratorium_months": 6,
        "description": "Funding for viable commercial ventures including commercial dairy setups (10-20 cattle), mini flour/oil mills, cold storage transport, and light manufacturing units.",
        "description_hi": "व्यावसायिक डेयरी फार्म, मिनी आटा/तेल मिल, लाइट मैन्युफैक्चरिंग एवं कमर्शियल ट्रांसपोर्ट वाहनों के लिए ₹15 लाख तक का टर्म लोन।",
        "eligibility": "Target group entrepreneurs with viable business plan and technical feasibility.",
        "eligibility_hi": "व्यवहार्य बिजनेस प्लान और तकनीकी समझ रखने वाले पात्र उद्यमी।",
        "documents_required": "Aadhaar Card, PAN Card, Category Certificate, Detailed Project Report (DPR), Quotations for Machinery, Bank Passbook (6 months)",
        "is_active": True
    },
    {
        "scheme_name": "Term Loan Scheme (TLS) - Tier 2 (Major Projects)",
        "scheme_name_hi": "टर्म लोन योजना - टियर 2 (बड़ी परियोजनाएं)",
        "agency": "NSFDC / MoSJE",
        "category": "Enterprise / Agro-Industry / Logistics / Healthcare Unit",
        "min_cost": 1500000.0,
        "max_cost": 5000000.0,
        "margin_percent": 15.0,
        "govt_loan_percent": 85.0,
        "interest_rate": 8.0,
        "interest_rebate_women": 1.0,
        "repayment_years": 7,
        "moratorium_months": 9,
        "description": "High-value concessional financing for substantial agro-processing units, warehousing, diagnostic clinics, or large industrial micro-enterprises.",
        "description_hi": "एग्रो-प्रोसेसिंग, वेयरहाउसिंग, डायग्नोस्टिक सेंटर व बड़े सूक्ष्म उद्योगों के विस्तार के लिए ₹50 लाख तक का रियायती ऋण।",
        "eligibility": "Experienced entrepreneurs with formal trade registrations and viable business proposals.",
        "eligibility_hi": "अनुभवी उद्यमी जिनके पास वैध पंजीकरण और व्यवहार्य प्रोजेक्ट रिपोर्ट हो।",
        "documents_required": "Aadhaar Card, PAN Card, Category Certificate, Detailed DPR, Land/Rental Agreement, Quotations, Bank Statement (1 year), ITR (if applicable)",
        "is_active": True
    },
    {
        "scheme_name": "Green Business Scheme (GBS)",
        "scheme_name_hi": "हरित व्यवसाय योजना (ग्रीन बिजनेस स्कीम)",
        "agency": "NSFDC / Renewable Energy Promotion",
        "category": "Solar / Bio-Gas / E-Rickshaw / Organic Farming",
        "min_cost": 100000.0,
        "max_cost": 3000000.0,
        "margin_percent": 10.0,
        "govt_loan_percent": 90.0,
        "interest_rate": 5.0,
        "interest_rebate_women": 1.0,
        "repayment_years": 6,
        "moratorium_months": 6,
        "description": "Promotes eco-friendly and climate-resilient livelihoods: battery operated e-rickshaws, solar rooftop pumps, polyhouse farming, and bio-waste management.",
        "description_hi": "पर्यावरण अनुकूल उद्यम जैसे ई-रिक्शा, सोलर पंप, पॉलीहाउस खेती और बायो-वेस्ट कंपोस्टिंग के लिए मात्र 5% ब्याज पर लोन।",
        "eligibility": "Individuals or groups engaging in eligible green/renewable micro-business activities.",
        "eligibility_hi": "ग्रीन एनर्जी या पर्यावरण-अनुकूल व्यवसाय शुरू करने वाले पात्र उद्यमी।",
        "documents_required": "Aadhaar Card, Category Certificate, Green Technology Equipment Quotation, Driving License (for E-Rickshaw), Bank Passbook",
        "is_active": True
    }
]

def seed_database():
    """Initializes tables and seeds authentic schemes if database is empty."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        count = db.query(Scheme).count()
        if count == 0:
            for s_data in AUTHENTIC_SCHEMES:
                scheme = Scheme(**s_data)
                db.add(scheme)
            db.commit()
            print(f"Successfully seeded {len(AUTHENTIC_SCHEMES)} authentic government schemes.")
        else:
            print(f"Database already contains {count} schemes. Skipping seed.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
