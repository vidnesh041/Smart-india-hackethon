"""
Loan Calculator Module
Deterministic financial mathematics for rural micro-entrepreneur credit schemes.
CRITICAL RULE: This module must perform all calculations using exact formulas.
AI/LLM models must NEVER compute or override these values.
"""

def calculate_margin_money(total_cost: float, margin_percent: float) -> float:
    """
    Calculate the upfront contribution required from the entrepreneur.
    Formula: Total Cost * (Margin Percent / 100)
    """
    if total_cost <= 0 or margin_percent < 0:
        return 0.0
    return round(total_cost * (margin_percent / 100.0), 2)


def calculate_loan_amount(total_cost: float, margin_money: float) -> float:
    """
    Calculate the concessional loan amount provided by the government/agency.
    Formula: Total Cost - Margin Money
    """
    if total_cost <= 0:
        return 0.0
    return max(0.0, round(total_cost - margin_money, 2))


def calculate_emi(loan_amount: float, annual_interest_rate: float, tenure_years: int) -> float:
    """
    Calculate the monthly Equated Monthly Installment (EMI) using the reducing balance method.
    Formula: EMI = [P * r * (1 + r)^n] / [(1 + r)^n - 1]
    where:
        P = Principal loan amount
        r = Monthly interest rate (annual_interest_rate / 12 / 100)
        n = Total number of monthly installments (tenure_years * 12)
    """
    if loan_amount <= 0 or tenure_years <= 0:
        return 0.0
    
    total_months = tenure_years * 12
    if annual_interest_rate <= 0:
        return round(loan_amount / total_months, 2)
    
    monthly_rate = (annual_interest_rate / 100.0) / 12.0
    numerator = loan_amount * monthly_rate * ((1.0 + monthly_rate) ** total_months)
    denominator = ((1.0 + monthly_rate) ** total_months) - 1.0
    
    if denominator == 0:
        return round(loan_amount / total_months, 2)
        
    emi = numerator / denominator
    return round(emi, 2)


def structure_loan(
    total_cost: float,
    margin_percent: float,
    interest_rate: float,
    tenure_years: int,
    moratorium_months: int = 6,
    is_women: bool = False,
    interest_rebate_women: float = 1.0
) -> dict:
    """
    Compute full financial structuring package for a given scheme and project cost.
    """
    # Apply interest rebate for women/women-led SHGs if applicable
    effective_interest_rate = interest_rate
    if is_women and interest_rebate_women > 0:
        effective_interest_rate = max(1.0, interest_rate - interest_rebate_women)
        
    margin_money = calculate_margin_money(total_cost, margin_percent)
    loan_amount = calculate_loan_amount(total_cost, margin_money)
    monthly_emi = calculate_emi(loan_amount, effective_interest_rate, tenure_years)
    
    total_repayment = round(monthly_emi * tenure_years * 12, 2)
    total_interest = max(0.0, round(total_repayment - loan_amount, 2))
    
    return {
        "total_project_cost": round(total_cost, 2),
        "margin_percent": margin_percent,
        "margin_money": margin_money,
        "loan_percent": round(100.0 - margin_percent, 2),
        "loan_amount": loan_amount,
        "nominal_interest_rate": interest_rate,
        "effective_interest_rate": effective_interest_rate,
        "interest_rebate_applied": round(interest_rate - effective_interest_rate, 2),
        "tenure_years": tenure_years,
        "moratorium_months": moratorium_months,
        "monthly_emi": monthly_emi,
        "total_interest": total_interest,
        "total_repayment": total_repayment
    }
