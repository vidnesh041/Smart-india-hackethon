"""
Unit tests for Module 2 — Financial Engine (loan_calculator.py).
Tests exact formula calculations and boundary conditions per official PS 26091 spec.
"""

import pytest
from app.services.loan_calculator import (
    calculate_project_cost,
    calculate_loan_amount,
    select_scheme,
    generate_repayment_schedule,
    structure_financial_plan
)

def test_primary_worked_example():
    """
    Primary Worked Example from PRD & Master Prompt:
    ₹1,00,000 Margin Capital → ₹10,00,000 Project Cost → ₹9,00,000 Loan Amount → Term Loan Scheme (8%, 7yr, 6mo moratorium).
    """
    margin_capital = 100000.0
    
    project_cost = calculate_project_cost(margin_capital)
    assert project_cost == 1000000.0

    loan_amount = calculate_loan_amount(project_cost)
    assert loan_amount == 900000.0

    scheme = select_scheme(project_cost)
    assert scheme is not None
    assert scheme["scheme_name"] == "Term Loan Scheme"
    assert scheme["interest_rate"] == 8.0
    assert scheme["tenure_years"] == 7
    assert scheme["moratorium_months"] == 6

    plan = structure_financial_plan(margin_capital)
    assert plan["out_of_scope"] is False
    assert plan["project_cost"] == 1000000.0
    assert plan["loan_amount"] == 900000.0
    assert plan["scheme_selected"] == "Term Loan Scheme"
    assert plan["interest_rate"] == 8.0
    assert plan["tenure_years"] == 7
    assert plan["moratorium_months"] == 6
    assert len(plan["repayment_schedule"]) == 28  # 7 yrs * 4 quarters
    assert plan["repayment_schedule"][0]["is_moratorium"] is True
    assert plan["repayment_schedule"][0]["amount_due"] == 0.0
    assert plan["repayment_schedule"][1]["is_moratorium"] is True
    assert plan["repayment_schedule"][2]["is_moratorium"] is False
    assert plan["repayment_schedule"][2]["amount_due"] > 0.0


def test_micro_finance_boundary():
    """
    Boundary test: Project cost exactly ₹1,40,000 (margin capital = ₹14,000).
    Should select Micro Finance Scheme (6.5%, 3yr tenure, 3mo moratorium).
    """
    margin_capital = 14000.0
    
    project_cost = calculate_project_cost(margin_capital)
    assert project_cost == 140000.0

    loan_amount = calculate_loan_amount(project_cost)
    assert loan_amount == 126000.0  # Max scheme limit cap may adjust loan to 1.25L in plan

    scheme = select_scheme(project_cost)
    assert scheme is not None
    assert scheme["scheme_name"] == "Micro Finance Scheme"
    assert scheme["interest_rate"] == 6.5
    assert scheme["tenure_years"] == 3
    assert scheme["moratorium_months"] == 3

    plan = structure_financial_plan(margin_capital)
    assert plan["out_of_scope"] is False
    assert plan["scheme_selected"] == "Micro Finance Scheme"
    assert plan["loan_amount"] <= 125000.0  # Max loan cap applied


def test_term_loan_lower_boundary():
    """
    Boundary test: Project cost just above ₹1,40,000 (e.g. ₹1,40,000.10).
    Should select Term Loan Scheme.
    """
    margin_capital = 14000.01
    
    project_cost = calculate_project_cost(margin_capital)
    assert project_cost > 140000.0

    scheme = select_scheme(project_cost)
    assert scheme is not None
    assert scheme["scheme_name"] == "Term Loan Scheme"


def test_out_of_scope_exceeds_50L():
    """
    Out-of-scope test: Project cost > ₹50,00,000 (margin capital > ₹5,00,000).
    Should mark out_of_scope = True.
    """
    margin_capital = 600000.0
    
    project_cost = calculate_project_cost(margin_capital)
    assert project_cost == 6000000.0

    scheme = select_scheme(project_cost)
    assert scheme is None

    plan = structure_financial_plan(margin_capital)
    assert plan["out_of_scope"] is True
    assert plan["scheme_selected"] is None
    assert "exceeds" in plan["message"]
