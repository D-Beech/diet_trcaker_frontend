from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
from dotenv import load_dotenv
import os
from ai_services.nlp_processor import parse_log_entry

load_dotenv()

app = FastAPI(title="Diet Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MealLogRequest(BaseModel):
    input: str = Field(min_length=1)
    mealType: Optional[Literal["breakfast", "lunch", "dinner", "snacks"]] = None
    timestamp: Optional[datetime] = None


class WorkoutLogRequest(BaseModel):
    input: str = Field(min_length=1)
    timestamp: Optional[datetime] = None


class TestAIRequest(BaseModel):
    user_input: str = Field(min_length=1)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/logs/meal")
async def log_meal(payload: MealLogRequest):
    # TODO: replace with real parsing
    parsed_items = [
        {"name": payload.input, "calories": 0, "protein": 0, "carbs": 0, "fat": 0}
    ]
    return {
        "id": "mock-meal-id",
        "parsedItems": parsed_items,
        "totalCalories": sum(i["calories"] for i in parsed_items),
    }


@app.post("/api/logs/workout")
async def log_workout(payload: WorkoutLogRequest):
    # TODO: replace with real parsing
    activities = [{"name": payload.input, "durationMin": 0, "calories": 0}]
    return {
        "id": "mock-workout-id",
        "activities": activities,
        "totalCalories": sum(a["calories"] for a in activities),
    }


@app.get("/api/summary/today")
async def summary_today():
    # TODO: replace with DB-backed aggregates
    return {
        "calories": {"consumed": 0, "burned": 0},
        "macros": {"protein": 0, "carbs": 0, "fat": 0},
        "workoutTimeMin": 0,
    }


@app.post("/testai")
async def test_ai(payload: TestAIRequest):
    result = parse_log_entry(payload.user_input)
    return result
