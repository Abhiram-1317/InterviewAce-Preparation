from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.database import get_database
from app.services.ai_provider_service import ai_provider_service
from app.utils.dependencies import get_current_user

ai_router = APIRouter(
    prefix="/api/v1/ai",
    tags=["AI Providers"],
)


class ActiveProviderRequest(BaseModel):
    provider: str = Field(..., description="Provider identifier: gemini, openai, claude, groq, or custom")


class TestProviderRequest(BaseModel):
    provider: str
    api_key: Optional[str] = None
    model: Optional[str] = None
    base_url: Optional[str] = None


class UserAIConfigRequest(BaseModel):
    preferred_provider: Optional[str] = None
    gemini_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None
    custom_base_url: Optional[str] = None
    custom_api_key: Optional[str] = None


@ai_router.get("/providers")
async def get_providers():
    """Retrieve list of all supported AI providers, their configuration state, and models."""
    providers = ai_provider_service.get_configured_providers()
    return {
        "active_provider": ai_provider_service.active_provider,
        "providers": providers,
    }


@ai_router.post("/active-provider")
async def set_active_provider(payload: ActiveProviderRequest):
    """Set the system default active AI provider."""
    success = ai_provider_service.set_active_provider(payload.provider)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported AI provider: {payload.provider}",
        )
    return {
        "status": "ok",
        "active_provider": ai_provider_service.active_provider,
        "message": f"Active AI provider updated to {payload.provider.upper()}",
    }


@ai_router.post("/test-provider")
async def test_provider(payload: TestProviderRequest):
    """Test connectivity and measure response latency for an AI provider."""
    result = await ai_provider_service.test_provider(
        provider=payload.provider,
        api_key=payload.api_key,
        model=payload.model,
        base_url=payload.base_url,
    )
    return result


@ai_router.get("/user-config")
async def get_user_ai_config(current_user: dict = Depends(get_current_user)):
    """Fetch user's custom saved AI configuration with masked keys."""
    db = get_database()
    config = current_user.get("ai_config", {})
    
    def mask_key(k: Optional[str]) -> Optional[str]:
        if not k or len(k) < 8:
            return None
        return k[:4] + "••••••••" + k[-4:]

    return {
        "preferred_provider": config.get("preferred_provider", ai_provider_service.active_provider),
        "has_gemini_key": bool(config.get("gemini_api_key")),
        "gemini_key_masked": mask_key(config.get("gemini_api_key")),
        "has_openai_key": bool(config.get("openai_api_key")),
        "openai_key_masked": mask_key(config.get("openai_api_key")),
        "has_anthropic_key": bool(config.get("anthropic_api_key")),
        "anthropic_key_masked": mask_key(config.get("anthropic_api_key")),
        "has_groq_key": bool(config.get("groq_api_key")),
        "groq_key_masked": mask_key(config.get("groq_api_key")),
        "custom_base_url": config.get("custom_base_url", ""),
    }


@ai_router.post("/user-config")
async def save_user_ai_config(
    payload: UserAIConfigRequest,
    current_user: dict = Depends(get_current_user),
):
    """Save user's BYOK (Bring Your Own Key) settings and preferred provider."""
    db = get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    current_config = current_user.get("ai_config", {})
    update_data = {}

    if payload.preferred_provider:
        update_data["ai_config.preferred_provider"] = payload.preferred_provider
    if payload.gemini_api_key is not None:
        update_data["ai_config.gemini_api_key"] = payload.gemini_api_key.strip()
    if payload.openai_api_key is not None:
        update_data["ai_config.openai_api_key"] = payload.openai_api_key.strip()
    if payload.anthropic_api_key is not None:
        update_data["ai_config.anthropic_api_key"] = payload.anthropic_api_key.strip()
    if payload.groq_api_key is not None:
        update_data["ai_config.groq_api_key"] = payload.groq_api_key.strip()
    if payload.custom_base_url is not None:
        update_data["ai_config.custom_base_url"] = payload.custom_base_url.strip()
    if payload.custom_api_key is not None:
        update_data["ai_config.custom_api_key"] = payload.custom_api_key.strip()

    if update_data:
        await db["users"].update_one(
            {"_id": current_user["_id"]},
            {"$set": update_data},
        )

    return {
        "status": "ok",
        "message": "AI settings and provider credentials saved successfully.",
    }
