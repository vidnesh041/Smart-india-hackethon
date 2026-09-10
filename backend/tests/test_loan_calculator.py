import pytest
from app.services.loan_calculator import (
    calculate_margin_money,
    calculate_loan_amount,
    calculate_emi,
    structure_loan
)

def test_calculate_margin_money():
    # 10% on 1,00,000 -> 10,000
    assert calculate_margin_money(100000.0, 10.0) == 10000.0
    # 5% on 1,40,000 -> 7,000
    assert calculate_margin_money(140000.0, 5.0) == 7000.0
    # 15% on 20,00,000 -> 3,00,000
    assert calculate_margin_money(2000000.0, 15.0) == 300000.0

def test_calculate_loan_amount():
    assert calculate_loan_amount(100000.0, 10000.0) == 90000.0
    assert calculate_loan_amount(140000.0, 7000.0) == 133000.0

def test_calculate_emi():
    # Principal 90,000, 5% annual interest, 3 years (36 months)
    emi = calculate_emi(90000.0, 5.0, 3)
    assert emi > 0
    # Approx 2697.51
    assert 2690 < emi < 2710

    # Principal 1,33,000, 4% annual interest, 3 years
    emi_women = calculate_emi(133000.0, 4.0, 3)
    assert 3900 < emi_women < 3950

def test_structure_loan_with_women_rebate():
    res = structure_loan(
        total_cost=100000.0,
        margin_percent=10.0,
        interest_rate=6.0,
        tenure_years=5,
        moratorium_months=6,
        is_women=True,
        interest_rebate_women=1.0
    )
    assert res["total_project_cost"] == 100000.0
    assert res["margin_money"] == 10000.0
    assert res["loan_amount"] == 90000.0
    assert res["nominal_interest_rate"] == 6.0
    assert res["effective_interest_rate"] == 5.0
    assert res["interest_rebate_applied"] == 1.0
    assert res["monthly_emi"] > 0
    assert res["total_repayment"] > res["loan_amount"]
