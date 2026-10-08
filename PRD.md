# PRD (Product Requirement Document)
## Hyper-Local AI Business Advisory Assistant with Smart Scheme Calculator
### Smart India Hackathon 2026 — Problem Statement ID: 26091

> This PRD is derived directly from the official, detailed problem statement (background, challenge, expected solution, and impact goals as issued for PS 26091). It supersedes all earlier simplified versions.

---

## 1. Background (Why This Exists)

The government promotes economic empowerment of marginalized communities via concessional credit for income-generating activities. Under these schemes:
- The beneficiary contributes **margin money** — typically **10% of the total project cost**.
- A State/Channelizing Agency (SCA/CA) provides the remaining **90% as a concessional loan**.
- Example: to establish a ₹10,00,000 enterprise, the entrepreneur needs ₹1,00,000 (10%) as margin money, making them eligible for a ₹9,00,000 (90%) loan.

### The Two Official Loan Tiers

| Tier | Project Cost Range | Loan Provided | Interest Rate | Tenure | Moratorium |
|---|---|---|---|---|---|
| **Micro Finance Scheme** | Up to ₹1.40 lakh | Up to 90% (max ₹1.25 lakh) | 6.5% p.a. | 3 years | 3 months |
| **Term Loan Scheme** | ₹1.40 lakh – ₹50.00 lakh | Up to 90% (max ₹45 lakh) | 8% p.a. | 7 years | 6 months |

---

## 2. The Challenge (What's Actually Broken)

Despite capital being available, first-time rural entrepreneurs face a **high rate of business stagnation** because of:
- **Lack of formal, geography-specific market research** — no tool tells them if their business idea will actually work *where they live*.
- **Poor financial literacy** around loan structuring, margin requirements, and repayment.
- **Anecdotal decision-making** — beneficiaries pick a business because "someone else did well with it," not because of data-driven local demand.
- **No analytical tools** to determine local market saturation, optimal pricing, localized threats, or their precise financial eligibility.

**Core Insight:** The problem is not just "which scheme do I qualify for" (a financial question) — it is also "will this business actually survive in my village" (a feasibility question). Both must be solved together, **before** the entrepreneur applies for funding.

---

## 3. What to Build

An **NLP-powered, multilingual AI Business Advisory Assistant** for rural and semi-urban geographies, built around **exactly two core modules**, that together democratize institutional-grade business consulting for a first-time rural entrepreneur.

### User Inputs (Only 3 — Keep It Simple)
1. **Geographic Location** — Village / Block / District
2. **Available Margin Capital** — e.g., ₹1,00,000 (this is the 10% the user already has, NOT the total project cost)
3. **Proposed Business Category** — e.g., Dairy, Retail, Textiles, etc.

---

## 4. Module 1 — Hyper-Local Business Feasibility Report

Given the location + business category, the AI must dynamically generate a localized strategy covering all six of the following. This is a **qualitative, AI-generated report** (LLM-driven, using local/contextual data where available) — not a financial calculation.

1. **Market Reach** — Estimate the immediate consumer base within a **5–10 km radius** of the village/block; identify primary distribution channels.
2. **Opportunity Analysis** — Highlight unserved or underserved niches within the chosen business sector in that specific local economy.
3. **General Business Analysis (SWOT)** — A foundational Strengths / Weaknesses / Opportunities / Threats breakdown, tailored to the specific micro-enterprise budget level.
4. **Threats Identification** — Pinpoint local risks: supply chain bottlenecks, seasonal demand fluctuations, dependency on single buyers.
5. **Competitor Mapping** — Use localized demographic/economic data to estimate the density of existing similar businesses in the block.
6. **Product Market Value** — Suggest optimal pricing strategy and predict the local market value of the goods/services based on regional purchasing power.

> Note: This module is inherently AI/LLM-driven (it is a written analysis, not a number), but must be grounded in real signals where possible (see `architecture.md` for data sourcing per sub-section) rather than being a generic, non-localized template response.

---

## 5. Module 2 — Smart Financial Calculator & Scheme Router

An integrated, **fully deterministic (non-AI)** financial engine that processes the user's **Available Margin Capital** into a complete financial roadmap.

### 5.1 Financial Structuring (Reverse Calculation — Read Carefully)

This is the opposite direction from a typical "enter your investment, get your margin" calculator:

```
Input:  Available Margin Capital (the 10% the user already has)

Step 1: Total Feasible Project Cost = Available Margin Capital ÷ 10%
Step 2: Maximum Loan Amount = 90% × Total Feasible Project Cost
```

**Worked Example (from the official problem statement):**
- User inputs ₹1,00,000 as Available Margin Capital
- Project Cost = ₹1,00,000 ÷ 0.10 = **₹10,00,000**
- Loan Eligibility = 90% × ₹10,00,000 = **₹9,00,000**

### 5.2 Scheme Auto-Selection (Exact Logic — Only 2 Branches)

```
IF Total Project Cost <= ₹1,40,000:
    → Select "Micro Finance Scheme"
    → Interest: 6.5% p.a. | Tenure: 3 years | Moratorium: 3 months

ELSE IF Total Project Cost > ₹1,40,000 AND <= ₹50,00,000:
    → Select "Term Loan Scheme"
    → Interest: 8% p.a. | Tenure: 7 years | Moratorium: 6 months

ELSE (Project Cost > ₹50,00,000):
    → Out of scope for these two schemes — flag to user, no scheme match
```

### 5.3 EMI & Moratorium Generator
Given the selected scheme's interest rate, tenure, and moratorium period, generate:
- Expected **quarterly repayment schedule** (not monthly — the source data implies quarterly cadence typical of these schemes; confirm exact repayment frequency convention with scheme guidelines during implementation).
- Estimated **operational costs** and **working capital requirements**, factoring in the moratorium period (i.e., no repayment due during the moratorium, but working capital still needed to run the business in that window).

---

## 6. Features Summary (Must-Have for MVP)

1. Simple 3-field input form (Location, Available Margin Capital, Business Category) — voice input as an accessible alternative to typing.
2. **Module 2 output first** (numbers are fast, deterministic, and build trust immediately): Project Cost → Loan Amount → Scheme Selected → EMI/Moratorium schedule.
3. **Module 1 output second** (the feasibility report, which takes more generation time): Market Reach, Opportunity Analysis, SWOT, Threats, Competitor Mapping, Pricing guidance.
4. Combined result screen presenting both modules clearly separated (financial roadmap vs. feasibility analysis).
5. Multilingual support (Hindi, Marathi, English) for both input and output.

### Nice-to-Have
- Downloadable PDF of the combined report (feasibility + financial roadmap) — this mirrors an "institutional-grade consulting report," which is explicitly the product's aspiration.
- Voice narration of the advisory output.

---

## 7. Impact Goals (As Defined in the Official Problem Statement)

1. **Reduce the failure rate** of newly funded micro-enterprises by ensuring beneficiaries choose viable, locally relevant business models based on data (Module 1's job).
2. **Eliminate financial confusion** by clearly mapping the beneficiary's available cash (10%) to their maximum borrowing capacity (90%) and exact repayment obligations (Module 2's job).
3. **Empower marginalized youth** with enterprise intelligence, fostering a culture of data-backed, financially sound entrepreneurship at the grassroots level.

---

## 8. Constraints & Non-Negotiables

- **All financial calculations (Module 2) must be pure, deterministic Python code — never AI-generated.** This includes Project Cost, Loan Amount, scheme selection logic, and EMI/moratorium schedule.
- **Module 1's feasibility content is AI-generated** (this is expected and correct per the problem statement) but must be clearly labeled as AI-generated guidance, not verified fact, and should use real local data signals (population/market data, competitor density data) as grounding input to the LLM wherever feasible rather than being purely generic.
- The two schemes' numbers (interest rate, tenure, moratorium, tier boundaries) are **fixed, official values** — they must be stored as configuration/database values, never hardcoded inline in multiple places, and never altered by the AI.
- Must work with **demo/dummy data only** during hackathon development, then transition to real local/demographic data sources (see `architecture.md`) for Module 1's grounding data.
- Must support Hindi, Marathi, and English.
