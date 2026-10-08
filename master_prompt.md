# master_prompt.md
## Master Build Instruction for Vibe-Coding Agent (Corrected Per Official Problem Statement)
### Hyper-Local AI Business Advisory Assistant with Smart Scheme Calculator

> Paste this to your AI coding agent after placing all 7 docs (`PRD.md`, `architecture.md`, `rules.md`, `phases.doc.md`, `ui-ux.md`, `development.md`, `master_prompt.md`) in a `docs/` folder. This version replaces all earlier drafts — the earlier "4700 schemes / investment-amount-first" approach is now superseded by the official problem statement's exact 2-scheme, margin-capital-first design.

---

## 0. Read This First

1. Read every file in `docs/` before writing code.
2. Build phase by phase per `phases.doc.md`. Confirm with me after each phase.
3. **Ask me, never assume** — for any API key (OpenAI, data.gov.in), any ambiguous decision, or any scheme number you're not 100% sure of. Never invent a placeholder and continue silently.
4. **Remove all demo/mock data**, but only after its real replacement is working — see the sequencing rules already established in the project's build history: real data must exist before mock data is deleted, and every screen must point at the real data afterward, never silently falling back to fakes.

---

## 1. THE MOST IMPORTANT CORRECTION — Read Before Building Anything

The calculation direction is: **User provides Available Margin Capital (what they already have) → system calculates UPWARD to Project Cost and Loan Amount.**

```
Available Margin Capital ÷ 10%  = Total Project Cost
Total Project Cost × 90%        = Loan Amount
```

**Worked example (use this as your primary test case):** ₹1,00,000 margin capital → ₹10,00,000 project cost → ₹9,00,000 loan amount.

Do NOT build a form that asks for "total investment" or "project cost" as the primary input — that is backwards from the official spec.

---

## 2. Build Exactly Two Modules (Not a Generic Chatbot, Not a 4700-Scheme Search Engine)

### Module 2 — Smart Financial Calculator & Scheme Router (Build First — Pure Python, Zero AI)
- `calculate_project_cost()`, `calculate_loan_amount()`, `select_scheme()`, `generate_repayment_schedule()` — all deterministic, per `architecture.md` Section 2.
- Exactly 2 schemes, seeded once in the `loan_schemes` table:
  - **Micro Finance Scheme**: Project Cost ≤ ₹1.40 lakh, 6.5% interest, 3-year tenure, 3-month moratorium, max loan ₹1.25 lakh.
  - **Term Loan Scheme**: Project Cost ₹1.40 lakh–₹50 lakh, 8% interest, 7-year tenure, 6-month moratorium, max loan ₹45 lakh.
- No AI anywhere in this module. Ever.

### Module 1 — Hyper-Local Business Feasibility Report (LLM-Driven, Grounded)
Generate all 6 sub-sections per `PRD.md` Section 4: Market Reach, Opportunity Analysis, SWOT, Threats Identification, Competitor Mapping, Product Market Value.
- Ground **Competitor Mapping** using real Udyam Registration data from **data.gov.in** (ask me for the API key before integrating).
- Ground **Market Reach** using population/demographic estimates for the given village/block/district.
- The other sub-sections (SWOT, Threats, Product Market Value) can be LLM-reasoning-based using the location + category + Module 2's calculated project cost as context, but must never be generic/copy-paste boilerplate — the prompt must explicitly reference the user's actual inputs.
- Always attach the disclaimer: "This feasibility analysis is AI-generated guidance based on available local data. Please validate with a local market visit before finalizing your plan."

**These two modules run independently and in parallel.** Module 2's result must display even if Module 1 fails or is slow.

---

## 3. Real Data Sourcing Rules

| Data Needed | Source | Rule |
|---|---|---|
| The 2 loan schemes' numbers | Official problem statement (already given — no external lookup needed) | Hardcode as seed data once, in the database, never scattered across files |
| Udyam competitor density (Module 1) | data.gov.in official API | Ask me for the API key before use; label data source in the UI |
| Population/demographic estimate (Module 1) | Census/data.gov.in or a reasonable public dataset — ask me if you're unsure which source to use | Never fabricate a population number — if unavailable, say so explicitly in the report rather than guessing |

Do not reintroduce the earlier "bulk-import thousands of schemes from Hugging Face" approach for Module 2 — the official problem statement defines exactly 2 schemes with exact numbers. That approach may still be relevant for a *future* expansion beyond this problem statement's scope, but it is **out of scope for this build** unless I explicitly ask for it again.

---

## 4. Multilingual Voice Requirement (Unchanged from Earlier Discussion)

- Input: Whisper API or Web Speech API for Hindi, Marathi, English speech-to-text.
- The 3 inputs (location, available margin capital, business category) should be collectible by voice, one at a time if using a conversational flow, or via a single voice capture that the LLM parses into the 3 fields — ask me which UX you should build if this is unclear from `ui-ux.md`.
- Module 1's text output should be presentable in the same language the user used.

---

## 5. Definition of Done

- [ ] ₹1,00,000 margin capital input produces exactly ₹10,00,000 project cost, ₹9,00,000 loan, Term Loan Scheme, 8%/7yr/6mo.
- [ ] Project cost exactly at ₹1,40,000 selects Micro Finance Scheme; just above it selects Term Loan Scheme.
- [ ] Feasibility report always shows all 6 required sub-sections with the AI-disclaimer.
- [ ] Competitor Mapping cites a real data source (Udyam/data.gov.in), not a fabricated number.
- [ ] Module 2 works even when Module 1 is down.
- [ ] No demo/mock data remains anywhere in the running app.
- [ ] No API key was ever hardcoded or invented — every one was requested from me directly.
