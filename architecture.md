# architecture.md
## Hyper-Local AI Business Advisory Assistant with Smart Scheme Calculator

---

## 1. Architecture Overview

The system is built around **two independent but parallel-running modules**, both triggered from the same single user input (Location + Available Margin Capital + Business Category).

```
                        [ User Input: Location, Margin Capital, Business Category ]
                                              |
                              (via Voice — Web Speech API / Whisper — or Form)
                                              |
                                     [ FastAPI Backend ]
                                    /                    \
                                   /                      \
                  [ MODULE 2: Financial Engine ]    [ MODULE 1: Feasibility Engine ]
                  (Pure Python — deterministic)      (LLM-driven — grounded in local data)
                          |                                       |
             Project Cost, Loan Amount,               Market Reach, Opportunity Analysis,
             Scheme Selection, EMI/                   SWOT, Threats, Competitor Mapping,
             Moratorium Schedule                       Pricing/Market Value
                          \                                       /
                           \                                     /
                                  [ Combined Response JSON ]
                                              |
                                    [ React Frontend — Result Page ]
                        (Financial Roadmap card + Feasibility Report card, side by side/stacked)
```

### Why Two Parallel Engines, Not One Sequential Flow
- Module 2 (financial math) is instant and 100% deterministic — no reason to make the user wait for it.
- Module 1 (feasibility report) requires LLM generation (and ideally external data lookups for grounding), which is slower.
- Running them in parallel (async) means the user sees the financial numbers almost immediately while the feasibility report streams in shortly after — better perceived performance.

---

## 2. Module 2 — Financial Engine (Deep Dive)

**This module is pure Python. No AI/LLM involvement in any calculation.**

### 2.1 Core Calculation Logic (`loan_calculator.py`)

```python
"""
Pseudo-logic — implement exactly this, in this order:

def calculate_project_cost(available_margin_capital: float) -> float:
    # Margin is ALWAYS 10% of project cost, per official scheme rules
    return available_margin_capital / 0.10

def calculate_loan_amount(project_cost: float) -> float:
    return project_cost * 0.90

def select_scheme(project_cost: float) -> dict:
    if project_cost <= 140000:
        return SCHEMES["micro_finance"]   # 6.5% interest, 3yr tenure, 3mo moratorium, max loan 1.25L
    elif project_cost <= 5000000:
        return SCHEMES["term_loan"]        # 8% interest, 7yr tenure, 6mo moratorium, max loan 45L
    else:
        return None  # Out of scope — flag to user

def generate_repayment_schedule(loan_amount, interest_rate, tenure_years, moratorium_months) -> list:
    # Quarterly schedule, no repayment due during moratorium period
    # (confirm exact quarterly EMI formula against scheme guidelines during implementation)
    ...
"""
```

### 2.2 Scheme Configuration (Stored as DB rows or a config table — never hardcoded inline in multiple files)

```sql
CREATE TABLE loan_schemes (
    scheme_id SERIAL PRIMARY KEY,
    scheme_name VARCHAR(50) NOT NULL,      -- 'Micro Finance Scheme' / 'Term Loan Scheme'
    min_project_cost NUMERIC,
    max_project_cost NUMERIC,
    max_loan_amount NUMERIC,               -- 1,25,000 or 45,00,000
    interest_rate NUMERIC,                 -- 6.5 or 8.0
    tenure_years INT,                      -- 3 or 7
    moratorium_months INT,                 -- 3 or 6
    loan_percent NUMERIC DEFAULT 90,
    margin_percent NUMERIC DEFAULT 10
);

-- Seed exactly 2 rows per the official problem statement:
-- ('Micro Finance Scheme', 0, 140000, 125000, 6.5, 3, 3)
-- ('Term Loan Scheme', 140000.01, 5000000, 4500000, 8.0, 7, 6)
```

### 2.3 API Endpoint

```
POST /api/financial-plan
Body: { "available_margin_capital": 100000, "location": "...", "business_category": "Dairy" }

Response:
{
  "project_cost": 1000000,
  "loan_amount": 900000,
  "margin_capital": 100000,
  "scheme_selected": "Term Loan Scheme",
  "interest_rate": 8.0,
  "tenure_years": 7,
  "moratorium_months": 6,
  "repayment_schedule": [ {"quarter": 1, "amount_due": 0, "note": "Moratorium period"}, ... ],
  "estimated_working_capital_during_moratorium": 45000
}
```

---

## 3. Module 1 — Feasibility Engine (Deep Dive)

**This module is LLM-driven, but must be grounded — not purely generative/hallucinated.**

### 3.1 Grounding Data Per Sub-Section

| Feasibility Sub-Section | Grounding Data Source (Use Real Data Where Possible) |
|---|---|
| 1. Market Reach | Village/Block population data (Census/data.gov.in), distance-based radius estimation |
| 2. Opportunity Analysis | Business category density in the area (see Competitor Mapping source below) cross-referenced with population |
| 3. SWOT | LLM-generated, using budget level (from Module 2's Project Cost) + location + category as context — no external data needed, this is reasoning-based |
| 4. Threats Identification | LLM-generated using category-specific general knowledge (seasonal patterns, supply chain norms) + location (e.g., monsoon-dependent regions) |
| 5. Competitor Mapping | **Udyam Registration data (data.gov.in official API)** for registered business density by district/NIC code + OpenStreetMap/Places API for physical nearby businesses where available |
| 6. Product Market Value | LLM-generated pricing suggestion using regional cost-of-living/purchasing-power context; can be grounded further with local commodity price data (e.g., Agmarknet for agri-based businesses) if in scope |

### 3.2 Processing Flow

```
1. Fetch grounding data (Udyam counts, population estimate, Places/OSM nearby businesses)
   → backend/app/services/feasibility_data_service.py

2. Construct a structured prompt combining:
   - User input (location, business category, project cost from Module 2)
   - Grounding data fetched in step 1

3. Single LLM call (or 6 smaller calls, one per sub-section, for better structure/reliability)
   → backend/app/services/feasibility_report_service.py
   → Returns structured JSON: { market_reach, opportunity_analysis, swot, threats, 
                                  competitor_mapping, product_market_value }

4. Return combined structured report to frontend
```

### 3.3 API Endpoint

```
POST /api/feasibility-report
Body: { "location": "...", "business_category": "Dairy", "project_cost": 1000000 }

Response:
{
  "market_reach": "...",
  "opportunity_analysis": "...",
  "swot": { "strengths": [...], "weaknesses": [...], "opportunities": [...], "threats": [...] },
  "threats_identification": "...",
  "competitor_mapping": { "estimated_count": 12, "data_source": "Udyam Registration", "summary": "..." },
  "product_market_value": "...",
  "disclaimer": "This feasibility analysis is AI-generated guidance based on available local data and should be validated with local market visits before finalizing your business plan."
}
```

---

## 4. Folder & File Structure

```
rural-advisory-app/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MicButton.jsx
│   │   │   ├── FormInput.jsx
│   │   │   ├── FinancialRoadmapCard.jsx      # Module 2 output
│   │   │   ├── FeasibilityReportCard.jsx     # Module 1 output (SWOT grid, etc.)
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── InputPage.jsx                 # 3-field form: location, margin capital, category
│   │   │   └── ResultPage.jsx                # combines both module outputs
│   │   ├── services/api.js
│   │   ├── utils/speechToText.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   │   ├── financial_routes.py           # POST /api/financial-plan
│   │   │   └── feasibility_routes.py         # POST /api/feasibility-report
│   │   ├── models/
│   │   │   ├── loan_scheme_model.py
│   │   │   └── user_input_model.py
│   │   ├── schemas/
│   │   │   └── input_schema.py
│   │   ├── services/
│   │   │   ├── loan_calculator.py            # Module 2 — pure Python
│   │   │   ├── feasibility_data_service.py   # Fetches Udyam/Places/population grounding data
│   │   │   └── feasibility_report_service.py # Module 1 — LLM calls
│   │   ├── database/db_connection.py
│   │   └── config.py
│   ├── requirements.txt
│   └── .env
│
├── docs/
│   ├── PRD.md
│   ├── architecture.md
│   ├── rules.md
│   ├── phases.doc.md
│   ├── ui-ux.md
│   ├── development.md
│   └── master_prompt.md
│
└── README.md
```

---

## 5. Tech Stack

### Frontend
| Component | Technology |
|---|---|
| Framework | React.js |
| Styling | Tailwind CSS |
| API Calls | Axios |
| Voice Input | Web Speech API / Whisper API |
| Icons | lucide-react |

### Backend
| Component | Technology |
|---|---|
| Framework | FastAPI (Python), async endpoints for Module 1 & 2 to run in parallel |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| AI (Module 1 only) | OpenAI GPT-4o-mini |
| Calculation (Module 2 only) | Pure Python — never AI |
| Grounding Data | data.gov.in (Udyam), OpenStreetMap/Places API (competitor locations) |

### Why This Split Architecture
- Keeps the **non-negotiable rule** (financial math must never touch AI) architecturally enforced — Module 2 has zero dependency on the OpenAI client.
- Allows Module 1 to be improved/re-prompted independently without any risk of affecting the trustworthiness of the financial numbers.
- Matches the official problem statement's explicit two-module structure exactly, making the build traceable back to the requirements.
