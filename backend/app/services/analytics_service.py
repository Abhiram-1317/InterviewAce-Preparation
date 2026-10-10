from app.database import get_database


async def get_user_analytics_overview(user_id: str) -> dict:
    """Calculates overall preparation metrics and readiness trends across a user's completed practice sessions.

    Args:
        user_id: String ID of the authenticated user.

    Returns:
        Dictionary conforming to AnalyticsOverview schema.
    """
    db = get_database()

    # Query all completed practice sessions for this user, sorted chronologically
    cursor = db["practice_sessions"].find(
        {
            "user_id": user_id,
            "session_summary": {"$ne": None},
        }
    ).sort("completed_at", 1)

    completed_sessions = await cursor.to_list(length=1000)

    total_sessions = len(completed_sessions)
    if total_sessions == 0:
        return {
            "total_sessions": 0,
            "total_questions_practiced": 0,
            "average_overall_score": 0.0,
            "readiness_trend": "Stable",
        }

    # Sum questions practiced across sessions
    total_questions_practiced = sum(
        len(s.get("questions_attempted", [])) for s in completed_sessions
    )

    # Average overall score across sessions
    overall_scores = [
        float(s["session_summary"]["overall_score"])
        for s in completed_sessions
        if "session_summary" in s and "overall_score" in s["session_summary"]
    ]
    avg_score = round(sum(overall_scores) / len(overall_scores), 1) if overall_scores else 0.0

    # Determine readiness trend from the last two sessions
    if total_sessions >= 2 and len(overall_scores) >= 2:
        last_score = overall_scores[-1]
        prev_score = overall_scores[-2]
        delta = last_score - prev_score
        if delta >= 2.0:
            readiness_trend = "Improving"
        elif delta <= -2.0:
            readiness_trend = "Declining"
        else:
            readiness_trend = "Stable"
    else:
        readiness_trend = "Stable"

    return {
        "total_sessions": total_sessions,
        "total_questions_practiced": total_questions_practiced,
        "average_overall_score": avg_score,
        "readiness_trend": readiness_trend,
    }
