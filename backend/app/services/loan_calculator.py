"""
loan_calculator.py
Module 2 — Financial Engine for Hyper-Local Rural Advisory Assistant (PS 26091).

CRITICAL ARCHITECTURAL RULE:
This module performs 100% deterministic Python mathematics.
AI/LLM models must NEVER calculate, override, or touch these financial numbers.

Calculation Direction:
Available Margin Capital (the 10% cash user has) → Upward to Project Cost (÷ 0.10) → Loan Amount (× 0.90).
"""

from typing import List, Dict, Any, Optional
import math
from sqlalchemy.orm import Session
from app.models.scheme_model import Scheme

def calculate_project_cost(available_margin_capital: float) -> float:
    """
    Calculate total feasible project cost from entrepreneur's 10% available margin capital.
    Formula: Project Cost = Available Margin Capital / 0.10
    """
    if available_margin_capital <= 0:
        return 0.0
    return round(available_margin_capital / 0.10, 2)


def calculate_loan_amount(project_cost: float) -> float:
    """
    Calculate 90% concessional loan amount provided under government schemes.
    Formula: Loan Amount = 0.90 * Project Cost
    """
    if project_cost <= 0:
        return 0.0
    return round(project_cost * 0.90, 2)


def select_scheme(project_cost: float, db: Optional[Session] = None) -> Optional[Dict[str, Any]]:
    """
    Auto-select loan scheme based on deterministic project cost boundaries.
    
    Boundaries (per official PS 26091):
    - Project Cost <= ₹1,40,000 → Micro Finance Scheme (6.5% interest, 3yr tenure, 3mo moratorium, max loan 1.25L)
    - ₹1,40,000 < Project Cost <= ₹50,00,000 → Term Loan Scheme (8% interest, 7yr tenure, 6mo moratorium, max loan 45L)
    - Project Cost > ₹50,00,000 → Out of scope (returns None)
    """
    if project_cost <= 0:
        return None
        
    if db is not None:
        try:
            schemes = db.query(Scheme).filter(
                Scheme.min_cost <= project_cost,
                Scheme.max_cost >= project_cost,
                Scheme.is_active == True
            ).all()

            if schemes:
                # Prioritize official PS 26091 primary scheme matching the project cost bracket
                primary_name = "Micro Finance Scheme" if project_cost <= 140000.0 else "Term Loan Scheme"
                matched = next((s for s in schemes if primary_name.lower() in s.scheme_name.lower()), schemes[0])

                return {
                    "scheme_id": matched.id,
                    "scheme_name": matched.scheme_name,
                    "scheme_name_hi": matched.scheme_name_hi,
                    "interest_rate": float(matched.interest_rate),
                    "tenure_years": int(matched.repayment_years),
                    "moratorium_months": int(matched.moratorium_months),
                    "max_loan_amount": float(matched.max_loan_amount) if matched.max_loan_amount else None,
                    "margin_percent": float(matched.margin_percent),
                    "govt_loan_percent": float(matched.govt_loan_percent)
                }
        except Exception:
            pass

    # Hardcoded fallback per official problem statement logic if DB is not supplied
    if project_cost <= 140000.0:
        return {
            "scheme_name": "Micro Finance Scheme",
            "scheme_name_hi": "माइक्रो फाइनेंस योजना",
            "interest_rate": 6.5,
            "tenure_years": 3,
            "moratorium_months": 3,
            "max_loan_amount": 125000.0,
            "margin_percent": 10.0,
            "govt_loan_percent": 90.0
        }
    elif project_cost <= 5000000.0:
        return {
            "scheme_name": "Term Loan Scheme",
            "scheme_name_hi": "टर्म लोन योजना",
            "interest_rate": 8.0,
            "tenure_years": 7,
            "moratorium_months": 6,
            "max_loan_amount": 4500000.0,
            "margin_percent": 10.0,
            "govt_loan_percent": 90.0
        }
    else:
        return None


def generate_repayment_schedule(
    loan_amount: float,
    interest_rate: float,
    tenure_years: int,
    moratorium_months: int
) -> List[Dict[str, Any]]:
    """
    Generate quarterly repayment schedule incorporating moratorium period.
    During moratorium: no principal repayment due.
    After moratorium: equal quarterly installment (reducing balance method).
    """
    if loan_amount <= 0 or tenure_years <= 0:
        return []

    total_quarters = tenure_years * 4
    moratorium_quarters = moratorium_months // 3
    active_quarters = total_quarters - moratorium_quarters

    schedule = []
    
    # Moratorium period entries
    for q in range(1, moratorium_quarters + 1):
        schedule.append({
            "quarter": q,
            "amount_due": 0.0,
            "principal_payment": 0.0,
            "interest_payment": 0.0,
            "remaining_balance": round(loan_amount, 2),
            "is_moratorium": True,
            "note": "Moratorium Period (No repayment due)"
        })

    if active_quarters <= 0:
        return schedule

    # Quarterly interest rate
    quarterly_rate = (interest_rate / 100.0) / 4.0
    
    # Calculate Quarterly EMI using standard formula: PMT = P * r * (1+r)^N / ((1+r)^N - 1)
    if quarterly_rate > 0:
        numerator = loan_amount * quarterly_rate * ((1.0 + quarterly_rate) ** active_quarters)
        denominator = ((1.0 + quarterly_rate) ** active_quarters) - 1.0
        quarterly_emi = numerator / denominator if denominator != 0 else loan_amount / active_quarters
    else:
        quarterly_emi = loan_amount / active_quarters

    quarterly_emi = round(quarterly_emi, 2)
    remaining = loan_amount

    for q in range(moratorium_quarters + 1, total_quarters + 1):
        interest_payment = round(remaining * quarterly_rate, 2)
        principal_payment = round(quarterly_emi - interest_payment, 2)
        
        # Last quarter adjustment
        if q == total_quarters or principal_payment > remaining:
            principal_payment = round(remaining, 2)
            quarterly_emi = round(principal_payment + interest_payment, 2)
            remaining = 0.0
        else:
            remaining = round(remaining - principal_payment, 2)

        schedule.append({
            "quarter": q,
            "amount_due": quarterly_emi,
            "principal_payment": principal_payment,
            "interest_payment": interest_payment,
            "remaining_balance": max(0.0, remaining),
            "is_moratorium": False,
            "note": f"Active Repayment (Quarter {q - moratorium_quarters} of {active_quarters})"
        })

    return schedule


def structure_financial_plan(
    available_margin_capital: float,
    location: str = "",
    business_category: str = "",
    db: Optional[Session] = None
) -> Dict[str, Any]:
    """
    Master Module 2 function computing complete financial roadmap from Available Margin Capital.
    """
    if available_margin_capital <= 0:
        return {
            "out_of_scope": True,
            "error": "Invalid input",
            "message": "Available margin capital must be a positive number."
        }

    project_cost = calculate_project_cost(available_margin_capital)
    loan_amount = calculate_loan_amount(project_cost)

    if project_cost > 5000000.0:
        return {
            "out_of_scope": True,
            "margin_capital": available_margin_capital,
            "project_cost": project_cost,
            "loan_amount": loan_amount,
            "scheme_selected": None,
            "message": "Your total project cost exceeds the ₹50,00,000 threshold for these concessional schemes. Please consult your nearest District DIC or bank branch for larger commercial financing."
        }

    scheme = select_scheme(project_cost, db)
    if not scheme:
        return {
            "out_of_scope": True,
            "margin_capital": available_margin_capital,
            "project_cost": project_cost,
            "loan_amount": loan_amount,
            "scheme_selected": None,
            "message": "No matching concessional scheme found for this project cost."
        }

    # Apply cap if calculated loan exceeds scheme max loan limit
    max_loan = scheme.get("max_loan_amount")
    effective_loan_amount = loan_amount
    if max_loan and loan_amount > max_loan:
        effective_loan_amount = max_loan

    repayment_schedule = generate_repayment_schedule(
        loan_amount=effective_loan_amount,
        interest_rate=scheme["interest_rate"],
        tenure_years=scheme["tenure_years"],
        moratorium_months=scheme["moratorium_months"]
    )

    # Estimate working capital needed during moratorium (e.g. ~5% of project cost)
    estimated_working_capital = round(project_cost * 0.05, 2)

    return {
        "out_of_scope": False,
        "margin_capital": available_margin_capital,
        "project_cost": project_cost,
        "loan_amount": effective_loan_amount,
        "scheme_selected": scheme["scheme_name"],
        "scheme_selected_hi": scheme.get("scheme_name_hi", scheme["scheme_name"]),
        "interest_rate": scheme["interest_rate"],
        "tenure_years": scheme["tenure_years"],
        "moratorium_months": scheme["moratorium_months"],
        "repayment_schedule": repayment_schedule,
        "estimated_working_capital_during_moratorium": estimated_working_capital,
        "message": "Financial roadmap generated successfully."
    }

# Alias for backwards compatibility
structure_loan = structure_financial_plan

