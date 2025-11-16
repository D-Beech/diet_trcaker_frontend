from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
from dotenv import load_dotenv
import os
import json
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

    # Transform to frontend format
    meals = []
    workouts = []

    # Process food items into meals
    if result.food:
        meal_items = []
        total_nutrition = {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}

        for food in result.food:
            meal_items.append({
                "name": food.name,
                "quantity_g": food.quantity_g,
                "quantity_items": food.quantity_items,
                "nutrition": {
                    "calories": food.nutrition.calories,
                    "protein": food.nutrition.protein,
                    "carbs": food.nutrition.carbs,
                    "fat": food.nutrition.fat
                }
            })
            total_nutrition["calories"] += food.nutrition.calories
            total_nutrition["protein"] += food.nutrition.protein
            total_nutrition["carbs"] += food.nutrition.carbs
            total_nutrition["fat"] += food.nutrition.fat

        meals.append({
            "items": meal_items,
            "totalNutrition": total_nutrition
        })

    # Process exercises into workouts
    if result.exercise:
        exercises = []
        total_calories_burned = 0
        total_duration = 0

        for exercise in result.exercise:
            exercises.append({
                "name": exercise.name,
                "sets": exercise.sets,
                "reps": exercise.reps,
                "weight_kg": exercise.weight_kg,
                "distance_km": exercise.distance_km,
                "duration_min": exercise.time_min,
                "calories": exercise.calories_burned or 0
            })
            total_calories_burned += exercise.calories_burned or 0
            total_duration += exercise.time_min or 0

        workouts.append({
            "exercises": exercises,
            "totalCaloriesBurned": total_calories_burned,
            "totalDuration": total_duration
        })

    response = {
        "success": True,
        "timestamp": result.timestamp.isoformat(),
        "meals": meals,
        "workouts": workouts,
        "bodyweight": result.body_weight_kg,
        "rawInput": payload.user_input
    }

    print("\n📤 OUTGOING RESPONSE - /log-natlang")
    print("="*80)
    print(f"Response: {json.dumps(response, indent=2)}")
    print("="*80 + "\n")

    return response
