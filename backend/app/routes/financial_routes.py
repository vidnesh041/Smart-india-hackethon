"""
financial_routes.py
API Route handler for Module 2 — Financial Roadmap Generator.
Pure Python deterministic logic, zero AI dependency.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.db_connection import get_db
from app.schemas.input_schema import FinancialPlanRequest, FinancialPlanResponse
from app.services.loan_calculator import structure_financial_plan

router = APIRouter(prefix="/financial-plan", tags=["Module 2 — Financial Engine"])

@router.post("", response_model=FinancialPlanResponse)
async def generate_financial_plan(
    request: FinancialPlanRequest,
    db: Session = Depends(get_db)
):
    """
    POST /api/financial-plan
    Calculates project cost upward from Available Margin Capital (10%) and maps to scheme (Micro Finance vs Term Loan).
    Returns instant deterministic financial roadmap and quarterly EMI/moratorium schedule.
    """
    if request.available_margin_capital <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Available margin capital must be greater than zero."
        )

    try:
        plan_data = structure_financial_plan(
            available_margin_capital=request.available_margin_capital,
            location=request.location or "",
            business_category=request.business_category or "",
            db=db
        )
        return FinancialPlanResponse(**plan_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating financial plan: {str(e)}"
        )
