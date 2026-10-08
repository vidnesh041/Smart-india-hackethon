# ui-ux.md
## UI/UX Design Specification
### Hyper-Local AI Business Advisory Assistant with Smart Scheme Calculator
### Style Reference: Indian Government Digital Portals (Umang, Jan Samarth, MyScheme, Digital India)

> Design philosophy, color palette, typography, and accessibility rules are unchanged from the original `ui-ux.md` (government-portal trust aesthetic, voice-first, bilingual, high-contrast). This revision updates only the **input fields and result screens** to match the corrected 2-module problem statement.

---

## 1. Screen 2 — Input (Corrected Fields)

Only **3 fields**, exactly as specified in the problem statement — do not add "experience" or "investment amount" fields from earlier drafts.

1. **Geographic Location** — Village / Block / District (dropdown or text with voice input)
2. **Available Margin Capital** — numeric input, ₹ prefixed. Label must clarify: *"Yeh woh raashi hai jo aapke paas already hai (project cost ka 10%)"* (This is the amount you already have — 10% of your project cost) — this framing is important since users may otherwise assume this field wants the total project cost.
3. **Proposed Business Category** — dropdown with icons (Dairy, Retail, Textiles, etc.)

Mic button remains the primary input method above the form, per the original accessibility rules.

---

## 2. Screen 4 — Result Page (Two Cards, Not One)

The result page must clearly show **two distinct, separately labeled sections**, matching the problem statement's own Module 1 / Module 2 framing:

### Card A: "Aapka Financial Roadmap" (Module 2 — appears first, loads fastest)
- Stat grid: Total Project Cost | Your Margin (10%) | Loan Amount (90%) | Scheme Selected
- Scheme details: Interest Rate, Tenure, Moratorium Period
- Simple repayment schedule table (quarterly)
- No "AI-Generated" badge needed here — this section is 100% deterministic math.

### Card B: "Aapki Business Feasibility Report" (Module 1 — appears as it streams in)
- **Market Reach** — short paragraph + simple radius icon/graphic
- **Opportunity Analysis** — short paragraph
- **SWOT** — 2x2 colored grid (Strengths=green, Weaknesses=red, Opportunities=blue, Threats=amber)
- **Threats Identification** — bullet list
- **Competitor Mapping** — stat ("X similar businesses nearby") + short summary + data source label
- **Product Market Value** — short paragraph with a suggested price range if applicable
- **Persistent AI-Generated badge and disclaimer** at the top of this card: *"This feasibility analysis is AI-generated guidance based on available local data. Please validate with a local market visit before finalizing your plan."*

### Loading State Between Cards
- Card A appears almost instantly (deterministic, fast).
- Card B shows a distinct loading message while generating: *"Aapke area ka feasibility analysis taiyaar kiya ja raha hai..."* — never block Card A from displaying while Card B loads.

---

## 3. Component Addition: SWOT Grid

A new reusable component style for Module 1:
```
┌─────────────────────┬─────────────────────┐
│  STRENGTHS (green)   │  WEAKNESSES (red)    │
├─────────────────────┼─────────────────────┤
│  OPPORTUNITIES (blue)│  THREATS (amber)      │
└─────────────────────┴─────────────────────┘
```
Each quadrant: short bullet list, max 3–4 points, plain language, bilingual where space allows.

---

*All other design rules (colors, typography, accessibility, government-portal styling) from the original `ui-ux.md` remain unchanged and apply to these updated screens.*
