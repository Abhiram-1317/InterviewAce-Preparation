from fastapi import APIRouter, Depends

from app.models.analytics import AnalyticsOverview
from app.services.analytics_service import get_user_analytics_overview
from app.utils.dependencies import get_current_user

analytics_router = APIRouter(
    prefix="/api/v1/analytics",
    tags=["Analytics"],
    dependencies=[Depends(get_current_user)],
)


@analytics_router.get(
    "/overview",
    response_model=AnalyticsOverview,
    summary="Get User Analytics Overview",
)
async def get_analytics_overview(
    current_user: dict = Depends(get_current_user),
):
    """Retrieves overall preparation statistics, question counts, and readiness trend for the current user."""
    user_id = str(current_user["id"])
    analytics = await get_user_analytics_overview(user_id)
    return analytics
