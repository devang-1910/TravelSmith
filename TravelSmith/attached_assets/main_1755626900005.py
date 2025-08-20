import os
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models import AskBody, AskResponse, PlanBody, PlanResponse, Source
from services.search import tavily_search
from services.llm import build_explorer_prompt, build_plan_prompt, call_llm

load_dotenv()

ALLOWED = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app = FastAPI(title="TripSmith Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED if ALLOWED != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"ok": True}

@app.post("/ask", response_model=AskResponse)
async def ask(body: AskBody):
    if not body.query or len(body.query.strip()) < 3:
        raise HTTPException(status_code=400, detail="Query too short")

    sources: List[Source] = await tavily_search(
        body.query,
        max_results=min(max(body.maxResults, 3), 8),
        recent_only=body.freshOnly,
        official_only=body.officialOnly,
    )
    prompt = build_explorer_prompt(body.query, sources)
    answer = call_llm(prompt)
    return AskResponse(answer=answer, sources=sources)

@app.post("/plan", response_model=PlanResponse)
async def plan(body: PlanBody):
    q = f"{body.days}-day itinerary {body.month} {body.interests} max {body.maxDrive}h drives"
    src = await tavily_search(q, max_results=6, recent_only=True, official_only=True)
    prompt = build_plan_prompt(
        body.days, body.month, body.party, body.maxDrive, body.interests, body.budget, src
    )
    answer = call_llm(prompt)
    return PlanResponse(answer=answer)
