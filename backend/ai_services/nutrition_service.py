"""
Nutrition service to get calorie and macro information for foods.
Uses USDA FoodData Central API or fallback estimates.
"""
from utils.openai_client import client
import json
import os
from typing import Optional

USDA_API_KEY = os.getenv("USDA_API_KEY")

def get_nutrition_for_food(food_name: str, quantity_g: Optional[float] = None, quantity_items: Optional[int] = None) -> dict:
    """
    Get nutrition information for a food item using OpenAI.
    Returns calories, protein, carbs, and fat.

    Args:
        food_name: Name of the food
        quantity_g: Quantity in grams (if known)
        quantity_items: Number of items (if quantity in grams not known)

    Returns:
        dict with calories, protein, carbs, fat, and estimated_quantity_g
    """

    # Prepare the prompt
    quantity_str = ""
    if quantity_g:
        quantity_str = f"{quantity_g}g of "
    elif quantity_items:
        quantity_str = f"{quantity_items} "

    system_prompt = """You are a nutrition expert. Provide accurate nutrition information for foods.
Return a JSON object with this exact structure:
{
    "calories": <number>,
    "protein": <number in grams>,
    "carbs": <number in grams>,
    "fat": <number in grams>,
    "estimated_quantity_g": <estimated weight in grams if not provided>
}

Rules:
- Be as accurate as possible based on common nutrition databases (USDA, etc.)
- If quantity is not specified, estimate a typical serving size
- Return realistic values
- All macros should be in grams
- estimated_quantity_g should reflect the total weight of food being analyzed
"""

    user_prompt = f"Provide nutrition information for: {quantity_str}{food_name}"

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content
        nutrition_data = json.loads(content)

        return {
            "calories": int(nutrition_data.get("calories", 0)),
            "protein": round(float(nutrition_data.get("protein", 0)), 1),
            "carbs": round(float(nutrition_data.get("carbs", 0)), 1),
            "fat": round(float(nutrition_data.get("fat", 0)), 1),
            "estimated_quantity_g": round(float(nutrition_data.get("estimated_quantity_g", quantity_g or 100)), 1)
        }

    except Exception as e:
        print(f"Error getting nutrition for {food_name}: {e}")
        # Return conservative defaults
        default_quantity = quantity_g or 100
        return {
            "calories": int(default_quantity * 2),  # ~2 cal/g is a moderate estimate
            "protein": round(default_quantity * 0.1, 1),
            "carbs": round(default_quantity * 0.2, 1),
            "fat": round(default_quantity * 0.05, 1),
            "estimated_quantity_g": round(default_quantity, 1)
        }


def estimate_exercise_calories(exercise_name: str, sets: Optional[int] = None, reps: Optional[int] = None,
                               weight_kg: Optional[float] = None, distance_km: Optional[float] = None,
                               time_min: Optional[float] = None) -> dict:
    """
    Estimate calories burned for an exercise using OpenAI.

    Returns:
        dict with calories_burned and estimated_duration_min
    """

    # Build exercise description
    exercise_parts = [exercise_name]
    if sets and reps:
        exercise_parts.append(f"{sets} sets of {reps} reps")
    if weight_kg:
        exercise_parts.append(f"with {weight_kg}kg")
    if distance_km:
        exercise_parts.append(f"for {distance_km}km")
    if time_min:
        exercise_parts.append(f"for {time_min} minutes")

    exercise_desc = " ".join(exercise_parts)

    system_prompt = """You are a fitness expert. Estimate calories burned for exercises.
Return a JSON object with this exact structure:
{
    "calories_burned": <number>,
    "estimated_duration_min": <estimated duration in minutes if not provided>
}

Rules:
- Assume average adult body weight (~70kg) unless specified
- Be realistic with calorie estimates based on exercise science
- If duration is not specified, estimate typical workout duration for that exercise
- Consider intensity based on sets/reps/weight provided
"""

    user_prompt = f"Estimate calories burned for: {exercise_desc}"

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content
        data = json.loads(content)

        return {
            "calories_burned": int(data.get("calories_burned", 0)),
            "estimated_duration_min": round(float(data.get("estimated_duration_min", time_min or 30)), 1)
        }

    except Exception as e:
        print(f"Error estimating calories for {exercise_name}: {e}")
        # Return conservative defaults
        default_duration = time_min or 30
        return {
            "calories_burned": int(default_duration * 5),  # ~5 cal/min is moderate
            "estimated_duration_min": round(default_duration, 1)
        }
