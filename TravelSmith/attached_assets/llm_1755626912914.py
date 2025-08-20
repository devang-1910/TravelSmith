import os
from typing import List
from openai import OpenAI
from models import Source

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
assert OPENAI_API_KEY, "Set OPENAI_API_KEY"

client = OpenAI(api_key=OPENAI_API_KEY)

SYSTEM = (
    "You are a careful travel assistant. Use ONLY the provided web results for facts. "
    "Every claim must have an inline citation like [1], [2] immediately after the sentence. "
    "Prefer concrete dates, opening months, and drive durations. If data is stale or conflicting, say so briefly."
)

def build_explorer_prompt(query: str, sources: List[Source]) -> str:
    ctx = []
    for s in sources:
        d = f" ({s.published_date})" if s.published_date else ""
        ctx.append(f"[{s.id}] {s.title} — {s.url}{d}\nSnippet: {s.snippet}")
    return (
        f"TRAVEL QUESTION:\n{query}\n\nWEB RESULTS:\n" + "\n\n".join(ctx) +
        "\n\nINSTRUCTIONS:\n- Answer in 5–8 short bullets.\n"
        "- Put citations [id] right after the sentences they support.\n"
        "- End with a 'Sources' section listing [id] Title — URL — (Date).\n"
    )

def build_plan_prompt(days:int, month:str, party:str, maxDrive:float, interests:str, budget:str, sources: List[Source]) -> str:
    ctx = []
    for s in sources:
        d = f" ({s.published_date})" if s.published_date else ""
        ctx.append(f"[{s.id}] {s.title} — {s.url}{d}\nSnippet: {s.snippet}")
    constraints = (
        f"USER CONSTRAINTS:\n- Trip length: {days} days, month: {month}\n"
        f"- Party: {party}\n- Driving: max {maxDrive} hours per leg\n"
        f"- Interests: {interests}\n- Budget: {budget}\n\n"
    )
    tasks = (
        "TASKS:\n1) Propose a day-by-day itinerary with AM/PM blocks; include estimated drive time per leg.\n"
        "2) For each day add 2–3 highlights with [id] citations and a short rain plan.\n"
        "3) Suggest a hotel area and dining style.\n4) Provide a compact budget bracket per day ($ / $$ / $$$).\n"
        "Return a concise human-readable plan.\n"
    )
    return constraints + "WEB RESULTS:\n" + "\n\n".join(ctx) + "\n\n" + tasks

def call_llm(prompt: str) -> str:
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0.2,
        messages=[{"role": "system", "content": SYSTEM},
                  {"role": "user", "content": prompt}],
    )
    return resp.choices[0].message.content or "No answer."
