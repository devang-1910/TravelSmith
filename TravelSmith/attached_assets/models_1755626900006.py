from pydantic import BaseModel
from typing import Optional, List

class Source(BaseModel):
    id: int
    title: str
    url: str
    snippet: Optional[str] = ""
    published_date: Optional[str] = None

class AskBody(BaseModel):
    query: str
    freshOnly: bool = False
    officialOnly: bool = False
    maxResults: int = 6

class AskResponse(BaseModel):
    answer: str
    sources: List[Source]

class PlanBody(BaseModel):
    days: int
    month: str
    party: str
    maxDrive: float
    interests: str
    budget: str

class PlanResponse(BaseModel):
    answer: str
