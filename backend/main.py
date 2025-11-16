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
    timestamp: Optional[datetime] = None


class WorkoutLogRequest(BaseModel):
    input: str = Field(min_length=1)
    timestamp: Optional[datetime] = None


class LogNatLangRequest(BaseModel):
    user_input: str = Field(min_length=1)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/logs/meal")
async def log_meal(payload: MealLogRequest):
    # TODO: replace with real parsing
    items = [
        {
            "name": payload.input,
            "quantity_g": 100,
            "nutrition": {
                "calories": 200,
                "protein": 10,
                "carbs": 20,
                "fat": 5
            }
        }
    ]
    total_nutrition = {
        "calories": sum(i["nutrition"]["calories"] for i in items),
        "protein": sum(i["nutrition"]["protein"] for i in items),
        "carbs": sum(i["nutrition"]["carbs"] for i in items),
        "fat": sum(i["nutrition"]["fat"] for i in items)
    }
    return {
        "success": True,
        "timestamp": (payload.timestamp or datetime.now()).isoformat(),
        "items": items,
        "totalNutrition": total_nutrition,
        "rawInput": payload.input
    }


@app.post("/api/logs/workout")
async def log_workout(payload: WorkoutLogRequest):
    # TODO: replace with real parsing
    exercises = [
        {
            "name": payload.input,
            "duration_min": 30,
            "calories": 250
        }
    ]
    return {
        "success": True,
        "timestamp": (payload.timestamp or datetime.now()).isoformat(),
        "exercises": exercises,
        "totalCaloriesBurned": sum(e["calories"] for e in exercises),
        "totalDuration": sum(e["duration_min"] for e in exercises),
        "rawInput": payload.input
    }


@app.get("/api/summary/today")
async def summary_today():
    # TODO: replace with DB-backed aggregates
    return {
        "calories": {"consumed": 0, "burned": 0},
        "macros": {"protein": 0, "carbs": 0, "fat": 0},
        "workoutTimeMin": 0,
    }


@app.post("/log-natlang")
async def log_natlang(payload: LogNatLangRequest):
    print("\n" + "="*80)
    print("📥 INCOMING REQUEST - /log-natlang")
    print("="*80)
    print(f"User Input: {payload.user_input}")
    print("-"*80)

    result = parse_log_entry(payload.user_input)

    print("\n📤 OUTGOING RESPONSE - /log-natlang")
    print("="*80)
    print(f"Response: {result.model_dump_json(indent=2)}")
    print("="*80 + "\n")

    return result
