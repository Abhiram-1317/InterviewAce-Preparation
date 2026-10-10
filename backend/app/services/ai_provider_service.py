import json
import logging
import re
import time
from typing import Any, Optional
import httpx

from app.config import settings

logger = logging.getLogger(__name__)

# Registry of supported AI providers
SUPPORTED_PROVIDERS = {
    "gemini": {
        "id": "gemini",
        "name": "Google Gemini",
        "company": "Google",
        "default_model": "gemini-3.8-flash",
        "models": ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-flash-latest", "gemini-2.5-pro"],
        "description": "High-speed reasoning with large context window and multimodal intelligence.",
    },
    "openai": {
        "id": "openai",
        "name": "OpenAI",
        "company": "OpenAI",
        "default_model": "gpt-4o-mini",
        "models": ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"],
        "description": "Industry benchmark for conversational accuracy, structured extraction, and code comprehension.",
    },
    "claude": {
        "id": "claude",
        "name": "Anthropic Claude",
        "company": "Anthropic",
        "default_model": "claude-3-5-sonnet-20241022",
        "models": ["claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"],
        "description": "Superior nuance, reasoning depth, and nuanced qualitative interview coaching.",
    },
    "groq": {
        "id": "groq",
        "name": "Groq Cloud (Llama / Mixtral)",
        "company": "Groq",
        "default_model": "llama-3.3-70b-versatile",
        "models": ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
        "description": "Ultra-low-latency LPUs running open-weights models for near instantaneous feedback.",
    },
    "custom": {
        "id": "custom",
        "name": "OmniRoute / Custom Endpoint",
        "company": "OmniRoute / Self-Hosted",
        "default_model": "auto/best-coding",
        "models": ["auto/best-coding", "gpt-4o-mini", "deepseek-chat", "default"],
        "description": "Connect OmniRoute, Ollama, vLLM, DeepSeek, or private enterprise routers.",
    },
}



def clean_json_response(content: str) -> Any:
    """Strips markdown code fences and cleans raw LLM output to parse as JSON."""
    if not content:
        return {}

    cleaned = content.strip()
    # Strip markdown code blocks anywhere in text
    if "```" in cleaned:
        code_block = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned, re.IGNORECASE)
        if code_block:
            cleaned = code_block.group(1).strip()
        else:
            cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
            cleaned = re.sub(r"\s*```$", "", cleaned)
            cleaned = cleaned.strip()

    # Sometimes models prepend commentary before the first { or [
    first_brace = cleaned.find("{")
    first_bracket = cleaned.find("[")

    start_idx = -1
    if first_brace != -1 and first_bracket != -1:
        start_idx = min(first_brace, first_bracket)
    elif first_brace != -1:
        start_idx = first_brace
    elif first_bracket != -1:
        start_idx = first_bracket

    if start_idx > 0:
        cleaned = cleaned[start_idx:]

    # Trim any trailing text after last } or ]
    last_brace = cleaned.rfind("}")
    last_bracket = cleaned.rfind("]")
    end_idx = max(last_brace, last_bracket)
    if end_idx != -1 and end_idx < len(cleaned) - 1:
        cleaned = cleaned[: end_idx + 1]

    # 1. Standard parse attempt
    try:
        return json.loads(cleaned)
    except Exception:
        pass

    # 2. Repair trailing commas before } or ]
    repaired = re.sub(r",\s*([\]}])", r"\1", cleaned)
    try:
        return json.loads(repaired)
    except Exception:
        pass

    # 3. Repair unescaped single quotes or literal evaluation
    try:
        import ast
        evaluated = ast.literal_eval(repaired)
        if isinstance(evaluated, (dict, list)):
            return evaluated
    except Exception:
        pass

    logger.warning(f"Could not parse JSON. Preview: {cleaned[:160]}")
    return {}


class AIProviderService:
    """Unified service coordinating multi-provider AI completions and testing."""

    def __init__(self):
        self.active_provider: str = settings.DEFAULT_AI_PROVIDER.lower()

    def set_active_provider(self, provider_id: str) -> bool:
        provider_id = provider_id.lower()
        if provider_id in SUPPORTED_PROVIDERS:
            self.active_provider = provider_id
            return True
        return False

    def get_configured_providers(self) -> list[dict]:
        """Returns details of all supported providers and their configuration status."""
        result = []
        for pid, meta in SUPPORTED_PROVIDERS.items():
            key = self._get_key_for_provider(pid)
            configured = bool(key and not key.startswith("your_") and len(key) > 6)
            if pid == "custom":
                configured = bool(settings.CUSTOM_AI_BASE_URL)

            result.append(
                {
                    **meta,
                    "is_configured": configured,
                    "is_active": pid == self.active_provider,
                }
            )
        return result

    def _get_key_for_provider(self, provider: str, override_key: Optional[str] = None) -> str:
        if override_key:
            return override_key.strip()

        provider = provider.lower()
        if provider == "gemini":
            return settings.GEMINI_API_KEY
        elif provider == "openai":
            return settings.OPENAI_API_KEY
        elif provider == "claude":
            return settings.ANTHROPIC_API_KEY
        elif provider == "groq":
            return settings.GROQ_API_KEY
        elif provider == "custom":
            return settings.CUSTOM_AI_API_KEY
        return ""

    def _get_model_for_provider(self, provider: str, override_model: Optional[str] = None) -> str:
        if override_model:
            return override_model.strip()

        provider = provider.lower()
        if provider == "gemini":
            return settings.GEMINI_MODEL
        elif provider == "openai":
            return settings.OPENAI_MODEL
        elif provider == "claude":
            return settings.ANTHROPIC_MODEL
        elif provider == "groq":
            return settings.GROQ_MODEL
        elif provider == "custom":
            target = settings.CUSTOM_AI_MODEL or "auto/best-coding"
            return "auto/best-coding" if target == "default" else target
        return "default"


    async def execute_prompt(
        self,
        system_prompt: str,
        user_prompt: str,
        provider: Optional[str] = None,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        base_url: Optional[str] = None,
    ) -> Any:
        """Executes a JSON-directed completion against the selected or active provider."""
        selected_provider = (provider or self.active_provider).lower()
        if selected_provider not in SUPPORTED_PROVIDERS:
            selected_provider = "gemini"

        key = self._get_key_for_provider(selected_provider, api_key)
        target_model = self._get_model_for_provider(selected_provider, model)

        # Check if provider has a valid key configured
        is_configured = bool(key and not key.startswith("your_") and len(key) > 6)
        if selected_provider == "custom":
            target_url = base_url or settings.CUSTOM_AI_BASE_URL
            is_configured = bool(target_url)

        if not is_configured:
            # Check if any OTHER provider is configured
            fallback_provider = self._find_first_configured_provider()
            if fallback_provider and fallback_provider != selected_provider:
                logger.info(
                    f"Selected provider {selected_provider} not configured. Routing to configured provider {fallback_provider}."
                )
                return await self.execute_prompt(
                    system_prompt, user_prompt, provider=fallback_provider
                )
            raise ValueError(f"Provider '{selected_provider}' is not configured with a valid API key.")

        timeout = httpx.Timeout(120.0, connect=20.0)
        async with httpx.AsyncClient(timeout=timeout) as client:

            if selected_provider == "gemini":
                return await self._call_gemini(client, key, target_model, system_prompt, user_prompt)
            elif selected_provider == "openai":
                return await self._call_openai(client, key, target_model, system_prompt, user_prompt)
            elif selected_provider == "claude":
                return await self._call_claude(client, key, target_model, system_prompt, user_prompt)
            elif selected_provider == "groq":
                return await self._call_groq(client, key, target_model, system_prompt, user_prompt)
            elif selected_provider == "custom":
                return await self._call_custom(client, key, target_model, base_url or settings.CUSTOM_AI_BASE_URL, system_prompt, user_prompt)
            else:
                raise ValueError(f"Unsupported provider: {selected_provider}")

    def _find_first_configured_provider(self) -> Optional[str]:
        for p in ["gemini", "openai", "claude", "groq"]:
            key = self._get_key_for_provider(p)
            if key and not key.startswith("your_") and len(key) > 6:
                return p
        return None

    async def _call_gemini(
        self,
        client: httpx.AsyncClient,
        api_key: str,
        model: str,
        system_prompt: str,
        user_prompt: str,
    ) -> Any:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {
                            "text": f"SYSTEM INSTRUCTIONS:\n{system_prompt}\n\nUSER PROMPT:\n{user_prompt}\n\nIMPORTANT: Respond ONLY with a valid JSON document conforming strictly to the requested schema. No code fences."
                        }
                    ],
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.2,
            },
        }
        res = await client.post(url, json=payload)
        res.raise_for_status()
        data = res.json()
        candidates = data.get("candidates", [])
        if not candidates:
            raise ValueError("Gemini returned empty response candidates")
        text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "{}")
        return clean_json_response(text)

    async def _call_openai(
        self,
        client: httpx.AsyncClient,
        api_key: str,
        model: str,
        system_prompt: str,
        user_prompt: str,
    ) -> Any:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2,
        }
        res = await client.post(url, headers=headers, json=payload)
        res.raise_for_status()
        data = res.json()
        content = data["choices"][0]["message"]["content"]
        return clean_json_response(content)

    async def _call_claude(
        self,
        client: httpx.AsyncClient,
        api_key: str,
        model: str,
        system_prompt: str,
        user_prompt: str,
    ) -> Any:
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }
        payload = {
            "model": model,
            "system": system_prompt,
            "messages": [
                {
                    "role": "user",
                    "content": f"{user_prompt}\n\nOutput only a valid JSON response adhering to instructions. No preamble.",
                }
            ],
            "max_tokens": 4096,
            "temperature": 0.2,
        }
        res = await client.post(url, headers=headers, json=payload)
        res.raise_for_status()
        data = res.json()
        content = data.get("content", [{}])[0].get("text", "{}")
        return clean_json_response(content)

    async def _call_groq(
        self,
        client: httpx.AsyncClient,
        api_key: str,
        model: str,
        system_prompt: str,
        user_prompt: str,
    ) -> Any:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2,
        }
        res = await client.post(url, headers=headers, json=payload)
        res.raise_for_status()
        data = res.json()
        content = data["choices"][0]["message"]["content"]
        return clean_json_response(content)

    async def _call_custom(
        self,
        client: httpx.AsyncClient,
        api_key: str,
        model: str,
        base_url: str,
        system_prompt: str,
        user_prompt: str,
    ) -> Any:
        if not base_url:
            raise ValueError("Custom endpoint base URL is required")
        endpoint = base_url.rstrip("/")
        if not endpoint.endswith("/chat/completions"):
            endpoint += "/chat/completions"

        headers = {"Content-Type": "application/json"}
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"

        if not model or model == "default":
            model = "auto/best-coding"

        payload = {
            "model": model,
            "messages": [

                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.2,
        }
        res = await client.post(endpoint, headers=headers, json=payload)
        res.raise_for_status()
        data = res.json()
        choices = data.get("choices", [])
        if not choices:
            raise ValueError(f"Custom endpoint returned response without choices: {data}")
        content = choices[0].get("message", {}).get("content", "")
        return clean_json_response(content)

    async def test_provider(
        self,
        provider: str,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        base_url: Optional[str] = None,
    ) -> dict:
        """Lightweight latency and credential connectivity test."""
        start_time = time.time()
        provider = provider.lower()
        test_system = "You are a health-check responder. Output JSON with a status key set to 'ok'."
        test_user = "Return a JSON object: {\"status\": \"ok\", \"provider\": \"" + provider + "\"}"

        try:
            result = await self.execute_prompt(
                system_prompt=test_system,
                user_prompt=test_user,
                provider=provider,
                api_key=api_key,
                model=model,
                base_url=base_url,
            )
            elapsed_ms = int((time.time() - start_time) * 1000)
            return {
                "success": True,
                "provider": provider,
                "latency_ms": elapsed_ms,
                "message": f"Successfully connected to {provider.upper()} in {elapsed_ms}ms.",
                "response": result,
            }
        except Exception as exc:
            elapsed_ms = int((time.time() - start_time) * 1000)
            logger.error(f"Provider connection test failed for {provider}: {exc}")
            return {
                "success": False,
                "provider": provider,
                "latency_ms": elapsed_ms,
                "message": str(exc),
            }


# Singleton service instance
ai_provider_service = AIProviderService()
