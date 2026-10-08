"""
Integration tests for FastAPI /api/financial-plan and /api/feasibility-report endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_financial_plan_endpoint():
    response = client.post(
        "/api/financial-plan",
        json={
            "available_margin_capital": 100000.0,
            "location": "Pune District",
            "business_category": "Dairy"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["out_of_scope"] is False
    assert data["margin_capital"] == 100000.0
    assert data["project_cost"] == 1000000.0
    assert data["loan_amount"] == 900000.0
    assert "Term Loan Scheme" in data["scheme_selected"]
    assert data["interest_rate"] == 8.0
    assert data["tenure_years"] == 7
    assert data["moratorium_months"] == 6
    assert len(data["repayment_schedule"]) > 0


def test_feasibility_report_endpoint():
    response = client.post(
        "/api/feasibility-report",
        json={
            "location": "Shirur Block",
            "business_category": "Dairy Farming",
            "project_cost": 1000000.0
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "market_reach" in data
    assert "opportunity_analysis" in data
    assert "swot" in data
    assert len(data["swot"]["strengths"]) > 0
    assert "threats_identification" in data
    assert "competitor_mapping" in data
    assert data["competitor_mapping"]["estimated_count"] >= 0
    assert "product_market_value" in data
    assert "disclaimer" in data
