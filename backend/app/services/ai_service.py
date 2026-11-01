import json, re
import httpx
from ..config import settings

KNOWN_SKILLS = {
    "python": "Programming", "javascript": "Programming", "typescript": "Programming",
    "react": "Frontend", "html": "Frontend", "css": "Frontend", "next.js": "Frontend",
    "fastapi": "Backend", "django": "Backend", "flask": "Backend", "node.js": "Backend",
    "sql": "Database", "postgresql": "Database", "mysql": "Database", "mongodb": "Database",
    "git": "Tools", "docker": "Tools", "linux": "Tools", "aws": "Cloud",
    "figma": "Design", "communication": "Soft skills", "problem solving": "Soft skills",
    "rest api": "Backend", "testing": "Quality", "pytest": "Quality"
}

def fallback_extract(text: str):
    lower = text.lower()
    found = []
    for skill, category in KNOWN_SKILLS.items():
        if re.search(r"(?<![a-z0-9])" + re.escape(skill) + r"(?![a-z0-9])", lower):
            found.append({
                "skill_name": skill.title() if skill not in {"html", "css", "sql", "aws"} else skill.upper(),
                "importance": "high" if skill in {"javascript", "react", "python", "sql"} else "medium",
                "required_level": 4 if skill in {"react", "javascript", "python"} else 3,
                "category": category
            })
    return found[:20]

async def extract_requirements(description: str):
    if not settings.ai_api_key or not settings.ai_model:
        return fallback_extract(description), "keyword_fallback"
    prompt = (
        "Extract only skills explicitly required or clearly preferred in this job description. "
        "Return JSON object with key requirements, an array of objects containing skill_name, "
        "importance (high/medium/low), required_level (1-5), category. Do not invent skills. "
        "Description:\n" + description
    )
    headers = {"Authorization": f"Bearer {settings.ai_api_key}", "Content-Type": "application/json"}
    body = {
        "model": settings.ai_model,
        "temperature": 0.1,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": "You extract structured job requirements. Output valid JSON only."},
            {"role": "user", "content": prompt}
        ]
    }
    try:
        async with httpx.AsyncClient(timeout=35) as client:
            response = await client.post(
                settings.ai_base_url.rstrip("/") + "/chat/completions",
                headers=headers, json=body
            )
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
            parsed = json.loads(content)
            requirements = parsed.get("requirements", [])
            cleaned = []
            for item in requirements[:20]:
                name = str(item.get("skill_name", "")).strip()[:100]
                if not name:
                    continue
                cleaned.append({
                    "skill_name": name,
                    "importance": item.get("importance", "medium") if item.get("importance") in {"high","medium","low"} else "medium",
                    "required_level": max(1, min(5, int(item.get("required_level", 3)))),
                    "category": str(item.get("category", "Technical"))[:80]
                })
            if cleaned:
                return cleaned, "ai"
    except Exception:
        pass
    return fallback_extract(description), "keyword_fallback"
