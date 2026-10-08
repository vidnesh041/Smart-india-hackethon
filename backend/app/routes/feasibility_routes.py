"""
feasibility_routes.py
API Route handler for Module 1 — Hyper-Local Feasibility Engine.
LLM-driven qualitative analysis, runs independently of Module 2.
"""

from fastapi import APIRouter, HTTPException, status
from app.schemas.input_schema import FeasibilityReportRequest, FeasibilityReportResponse
from app.services.feasibility_report_service import generate_feasibility_report

router = APIRouter(prefix="/feasibility-report", tags=["Module 1 — Feasibility Engine"])

@router.post("", response_model=FeasibilityReportResponse)
async def generate_feasibility_endpoint(request: FeasibilityReportRequest):
    """
    POST /api/feasibility-report
    Generates 6 grounded feasibility sub-sections (Market Reach, Opportunity Analysis, SWOT, Threats, Competitor Mapping, Pricing).
    Must run independently and fail gracefully without affecting Module 2.
    """
    if request.project_cost <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project cost must be a positive number."
        )

    try:
        report_data = await generate_feasibility_report(
            location=request.location,
            business_category=request.business_category,
            project_cost=request.project_cost
        )
        return FeasibilityReportResponse(**report_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to generate feasibility report: {str(e)}"
        )
