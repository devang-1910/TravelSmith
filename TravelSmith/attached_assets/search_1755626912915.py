import os, httpx
from typing import List, Dict, Any
from models import Source

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

async def tavily_search(
    query: str,
    max_results: int = 6,
    recent_only: bool = False,
    official_only: bool = False
) -> List[Source]:
    assert TAVILY_API_KEY, "Set TAVILY_API_KEY"
    payload: Dict[str, Any] = {
        "api_key": TAVILY_API_KEY,
        "query": query,
        "search_depth": "advanced",
        "max_results": max_results,
        "include_answer": False,
        "include_raw_content": False,
    }
    if recent_only:
        payload["time_range"] = "year"
    if official_only:
        payload["include_domains"] = [
            "*.gov", "*.edu",
            "lonelyplanet.com", "visitbritain.com",
            "visitscotland.com", "scotrail.co.uk",
            "rome2rio.com"
        ]

    async with httpx.AsyncClient(timeout=25) as client:
        r = await client.post("https://api.tavily.com/search", json=payload)
        r.raise_for_status()
        data = r.json()

    out: List[Source] = []
    for i, it in enumerate(data.get("results", [])):
        out.append(Source(
            id=i+1,
            title=it.get("title") or "Untitled",
            url=it.get("url"),
            snippet=it.get("snippet") or "",
            published_date=it.get("published_date"),
        ))
    return out
