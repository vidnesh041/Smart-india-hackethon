"""
Integration test for Gemini Chatbot API (/api/chat).
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_chat_endpoint_basic():
    response = client.post(
        "/api/chat",
        json={
            "message": "Namaste, mere paas ₹1,00,000 margin capital hai aur main Dairy Farm shuru karna chahta hun.",
            "chat_history": []
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert len(data["reply"]) > 0
    assert data["extracted_margin_capital"] == 100000.0
    assert data["financial_plan"] is not None
    assert data["financial_plan"]["project_cost"] == 1000000.0
    assert data["financial_plan"]["loan_amount"] == 900000.0


def test_chat_endpoint_qa_documents():
    response = client.post(
        "/api/chat",
        json={
            "message": "Loan ke liye kaunse documents required hain?",
            "chat_history": []
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    reply_lower = data["reply"].lower()
    assert "document" in reply_lower or "dastavez" in reply_lower or "aadhaar" in reply_lower or "कागजात" in data["reply"] or "कागज़" in data["reply"] or "ऋण" in data["reply"] or "loan" in reply_lower
