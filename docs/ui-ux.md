# ui-ux.md
## UI/UX Design Specification
### AI-Driven Hyper-Local Business Advisory & Financial Structuring Assistant
### Style Reference: Indian Government Digital Portals (Umang, Jan Samarth, MyScheme, Digital India)

---

## 1. Design Philosophy

This app must **feel trustworthy and official** — like a legitimate government-backed tool, not a flashy startup product — because the target user is a rural entrepreneur who is more likely to trust and act on something that *looks* like it belongs to a government scheme portal.

Core principles:
- **Trust over trend** — clean, formal, high-contrast, no playful/startup-style gradients or animations.
- **Clarity over density** — large text, generous spacing, one primary action per screen.
- **Voice-first, text-second** — every screen must work for someone who struggles to read/type.
- **Low cognitive load** — never more than 3–4 decisions on one screen.
- **Familiarity** — reuse visual patterns rural users have already seen on Umang/Jan Samarth/DigiLocker so the app feels instantly recognizable.

---

## 2. Color Palette (Government Portal Style)

| Role | Color | Hex | Usage |
|---|---|---|---|
| Primary (Header/Action) | Government Blue | `#0B3D91` / `#0070C0` | Header bar, primary buttons, links |
| Secondary (Accent) | Saffron/Orange | `#FF9933` | Highlights, active tab, mic button glow |
| Success/Growth | India Green | `#138808` | Approved scheme, positive result, checkmarks |
| Neutral Background | Off-white | `#F5F7FA` | Page background |
| Card Background | White | `#FFFFFF` | Content cards |
| Text Primary | Charcoal | `#1A1A1A` | Body text |
| Text Secondary | Slate Gray | `#5A5A5A` | Helper text, captions |
| Border/Divider | Light Gray | `#D9D9D9` | Card borders, dividers |
| Alert/Warning | Amber | `#B8860B` | Disclaimers ("AI-generated, please verify") |
| Error | Red | `#C0392B` | Form validation errors |

> **Note:** Blue + Saffron + Green together subtly echo the Indian tricolor / Digital India branding — this is intentional and reinforces trust without literally using the national emblem (which is legally restricted).

---

## 3. Typography

- **Font Family:** Use a government-portal-style font stack: `"Noto Sans", "Noto Sans Devanagari", Arial, sans-serif` — Noto Sans Devanagari is mandatory to correctly render Hindi/regional scripts alongside English.
- **Base size:** 16px minimum for body text (never smaller — rural/older users need larger text).
- **Headings:** Bold, high-contrast, 22–28px.
- **Line height:** 1.6 minimum for readability.
- **No decorative/script fonts anywhere.**

| Element | Size | Weight |
|---|---|---|
| Page Title | 24px | 700 |
| Section Heading | 20px | 600 |
| Body Text | 16px | 400 |
| Button Text | 16px | 600 |
| Helper/Caption Text | 14px | 400 |

---

## 4. Layout & Structure (Government Portal Conventions)

### 4.1 Header (fixed, on every page)
- Left: App logo/icon (simple, circular badge style like Umang/SIH logos).
- Center: App name in bold — bilingual, e.g. **"ग्रामीण सलाहकार | Rural Advisor"**.
- Right: Language toggle (English / हिंदी / regional), and a small "Govt. Scheme Partner" trust badge or tagline.
- Background: Primary blue (`#0B3D91`), white text.

### 4.2 Footer (fixed, on every page)
- Simple single line: disclaimer text — *"This is an AI-assisted guide. Please verify final details with your nearest CSC/bank before applying."*
- Optional: Ministry/scheme reference line (e.g., "Based on NSFDC & MoSJE scheme guidelines").
- Background: light gray, small text (14px), centered.

### 4.3 Page Structure Pattern
Every screen follows this same predictable structure (like government portals do):
```
[ Header — fixed ]
[ Step Indicator, if multi-step ]
[ Page Title ]
[ Single primary content card ]
[ Primary Action Button — bottom, full width on mobile ]
[ Footer — fixed ]
```

---

## 5. Screen-by-Screen UI Specification

### Screen 1: Home / Landing
- Large, centered **headline**: "Apne business ke liye sahi sarkari loan scheme jaanein" (Find the right govt. loan scheme for your business).
- One primary CTA button: **"Shuru Karein / Get Started"** (blue, full-width on mobile, rounded corners like govt. portal buttons — not overly rounded/pill-shaped).
- Small illustration or icon set (not stock photos) representing: dairy, shop, tailoring — simple flat-style icons, not photographs of people.
- Trust strip below: small row of icons + text — "Based on NSFDC Schemes", "Free to Use", "Voice Supported".

### Screen 2: Input (Form + Voice)
- Step indicator at top: **Step 1 of 3 — "Apni Jaankari Bharein" (Fill Your Details)**.
- Large, circular **mic button** (saffron/orange, pulsing animation while listening) placed prominently above the form — voice is the primary path, form is the fallback, not the other way around.
- Below mic: "Ya form bharein" (Or fill the form) — collapsible/secondary form with fields:
  - Business Type (dropdown with icons: Dairy, Shop, Tailoring, Other)
  - Investment Amount (numeric input, ₹ symbol prefixed)
  - Location (District dropdown or text)
  - Experience (simple 3-option toggle: New / 1–3 years / 3+ years)
- Each field has a large label above it (not placeholder-only, since placeholder text disappears and confuses low-literacy users).
- Primary button: **"Aage Badhein / Continue"** — disabled/grayed until required fields are filled.

### Screen 3: Processing / Loading State
- Simple centered spinner or a step-progress animation with reassuring text: "Aapke liye sahi scheme dhoondh rahe hain..." (Finding the right scheme for you...).
- Avoid generic "Loading..." — always show a human, reassuring message since users may be anxious about a financial tool.

### Screen 4: Result / Advisory Output
- Step indicator: **Step 3 of 3 — "Aapki Advisory" (Your Advisory)**.
- **Scheme Card** at top (white card, blue left border, green checkmark icon): scheme name + tier, clearly labeled like an official certificate/eligibility card.
- **Numbers Grid** below (4 stat boxes, government-portal style — bordered boxes, not flashy gradient cards):
  | Total Project Cost | Margin Money | Loan Amount | Interest Rate |
- **AI Advisory Text** in a distinct card with a small "AI-Generated" tag/badge (amber, subtle) — builds transparency and trust.
- **Business Plan Summary** as a simple expandable accordion section below (collapsed by default, to keep the primary result uncluttered).
- Bottom actions: **"Download as PDF"** (primary) and **"Start Over"** (secondary, text-link style).
- Persistent disclaimer strip: *"Please confirm with your nearest CSC or bank before applying."*

---

## 6. Component Style Guide

| Component | Style Direction |
|---|---|
| Buttons | Rectangular with slightly rounded corners (4–6px radius) — NOT pill-shaped. Solid fill for primary, outlined for secondary. Minimum tap target 48x48px. |
| Cards | White background, 1px light-gray border, subtle shadow (avoid heavy drop-shadows — govt. portals are flat). |
| Icons | Simple line icons or flat-fill icons (lucide-react style) — no 3D, no gradients, no emoji-style icons. |
| Forms | Large touch targets, visible labels above fields (not floating labels), clear focus states with blue outline. |
| Mic Button | Circular, saffron/orange, with a subtle pulse animation while actively listening; a static mic icon otherwise. |
| Badges/Tags | Small rounded-rectangle tags (e.g., "AI-Generated", "Govt. Scheme") — muted colors, not bright. |
| Tables (comparison, if used) | Bordered, striped rows for readability — matches the look of official scheme comparison tables. |

---

## 7. Accessibility & Rural-User Considerations (Non-Negotiable)

- **Minimum font size 16px** anywhere in the app — no fine print except the footer disclaimer.
- **High color contrast** (WCAG AA minimum) — dark text on light backgrounds throughout.
- **Voice input is a first-class, not secondary, input method** — mic button must always be above or beside the form, never buried in a menu.
- **Icons + text together**, never icon-only navigation — many users won't recognize abstract icons alone.
- **No auto-playing audio/video** without explicit user action.
- **Works on low-end Android phones and slow 3G/4G** — avoid heavy animations, large unoptimized images, or auto-loading media.
- **Bilingual by default** — every screen shows Hindi + English together where space allows (not just a toggle buried in settings), since this mirrors how Umang/Jan Samarth present text.
- **Large, obvious back/retry actions** — rural users are more likely to make input mistakes and need an easy, forgiving way to correct them.

---

## 8. What to Avoid

- No dark mode as default (unfamiliar/untrusted pattern for this audience — light mode only for MVP).
- No heavy animation, parallax scrolling, or startup-style marketing sections.
- No stock photography of generic "diverse people smiling" — use simple flat icons instead.
- No chat-bubble/messenger-style UI for the advisory output — present it like an official document/certificate, not a casual chat conversation, to reinforce credibility.
- No hidden/collapsed critical information — the loan numbers and scheme name must always be visible without extra clicks.

---

*This document should be read alongside `PRD.md`, `architecture.md`, and `rules.md`. All screens described here map to the features defined in the PRD and must be implemented using the tech stack defined in architecture.md (React + Tailwind CSS).*
