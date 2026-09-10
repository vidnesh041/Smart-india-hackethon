from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from app.database.db_connection import get_db
from app.models.scheme_model import Scheme
from app.schemas.user_schema import SchemeResponse, SchemesPageResponse

router = APIRouter(prefix="/schemes", tags=["Government Schemes"])


@router.get("", response_model=SchemesPageResponse)
def get_all_schemes(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    limit: int = Query(12, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search across name, ministry, state, category"),
    category: Optional[str] = Query(None, description="Filter by category keyword"),
    state: Optional[str] = Query(None, description="Filter by state"),
    min_cost: Optional[float] = Query(None, description="Filter by minimum project cost"),
    max_cost: Optional[float] = Query(None, description="Filter by maximum project cost"),
    sort_by: Optional[str] = Query(None, description="Sort order: interest_asc, limit_desc, limit_asc, name_asc"),
):
    """Fetch paginated active government schemes with search, category, state, and cost filters."""
    query = db.query(Scheme).filter(Scheme.is_active == True)

    # Full-text search across key fields
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Scheme.scheme_name.ilike(term),
                Scheme.scheme_name_hi.ilike(term),
                Scheme.ministry.ilike(term),
                Scheme.department.ilike(term),
                Scheme.state.ilike(term),
                Scheme.category.ilike(term),
                Scheme.description.ilike(term),
            )
        )

    if category and category.strip() and category != "All":
        query = query.filter(Scheme.category.ilike(f"%{category.strip()}%"))

    if state and state.strip() and state != "All":
        query = query.filter(Scheme.state.ilike(f"%{state.strip()}%"))

    if min_cost is not None:
        query = query.filter(Scheme.max_cost >= min_cost)

    if max_cost is not None:
        query = query.filter(Scheme.min_cost <= max_cost)

    # Sorting
    if sort_by == "interest_asc":
        query = query.order_by(Scheme.interest_rate.asc())
    elif sort_by == "limit_desc":
        query = query.order_by(Scheme.max_cost.desc())
    elif sort_by == "limit_asc":
        query = query.order_by(Scheme.max_cost.asc())
    elif sort_by == "name_asc":
        query = query.order_by(Scheme.scheme_name.asc())
    else:
        query = query.order_by(Scheme.id.asc())

    total = query.count()
    schemes = query.offset((page - 1) * limit).limit(limit).all()

    return SchemesPageResponse(
        total=total,
        page=page,
        limit=limit,
        total_pages=(total + limit - 1) // limit,
        schemes=schemes,
    )


@router.get("/filters")
def get_scheme_filters(db: Session = Depends(get_db)):
    """Fetch unique states and top categories for UI filter dropdowns."""
    raw_states = [s[0] for s in db.query(Scheme.state).distinct().all() if s[0]]
    # Ensure 'Central / All India' is first, then rest sorted
    clean_states = sorted([st for st in set(raw_states) if st != "Central / All India"])
    sorted_states = ["Central / All India"] + clean_states

    top_categories = [
        "Business & Entrepreneurship",
        "Agriculture,Rural & Environment",
        "Banking,Financial Services and Insurance",
        "Women and Child",
        "Skills & Employment",
        "Education & Learning",
        "Social welfare & Empowerment",
        "Science, IT & Communications",
        "Health & Wellness",
        "Utility & Sanitation"
    ]

    total_count = db.query(Scheme).filter(Scheme.is_active == True).count()

    return {
        "states": sorted_states,
        "categories": top_categories,
        "total_active_schemes": total_count,
    }


@router.get("/all", response_model=List[SchemeResponse])
def get_all_schemes_flat(db: Session = Depends(get_db)):
    """Fetch all active schemes (no pagination) - use sparingly."""
    return db.query(Scheme).filter(Scheme.is_active == True).all()


@router.get("/{scheme_id}", response_model=SchemeResponse)
def get_scheme_by_id(scheme_id: int, db: Session = Depends(get_db)):
    """Fetch a specific scheme by ID."""
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id, Scheme.is_active == True).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return scheme
