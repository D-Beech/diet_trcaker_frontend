"""
Nutrition service to get calorie and macro information for foods.

Architecture:
- AI extracts structured data (food names, quantities) from natural language
- This service queries AWS RDS PostgreSQL database containing USDA nutrition data
- Database contains ~350k+ food items with complete macro profiles
- Provides accurate, consistent nutrition calculations
"""
from utils.openai_client import client
from database.db_connection import get_db_connection, release_db_connection
import json
import os
from typing import Optional

# AWS RDS Database Configuration
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

def get_nutrition_for_food(food_name: str, quantity_g: Optional[float] = None, quantity_items: Optional[int] = None) -> dict:
    """
    Query AWS RDS nutrition database for accurate macro information.

    Process:
    1. Food name/quantity already extracted by AI (nlp_processor)
    2. Search PostgreSQL database for matching food items
    3. Calculate macros based on quantity and per-100g database values
    4. Return precise nutrition data

    Args:
        food_name: Name of the food (extracted by AI)
        quantity_g: Quantity in grams (extracted by AI)
        quantity_items: Number of items (extracted by AI)

    Returns:
        dict with calories, protein, carbs, fat from AWS RDS nutrition database
    """

    # Step 1: Query AWS RDS PostgreSQL database for nutrition data
    conn = get_db_connection()

    if conn:
        try:
            cursor = conn.cursor()

            # Search USDA food database by name similarity
            query = """
                SELECT
                    food_name,
                    calories_per_100g,
                    protein_per_100g,
                    carbs_per_100g,
                    fat_per_100g,
                    typical_serving_g
                FROM usda_foods
                WHERE LOWER(food_name) LIKE LOWER(%s)
                ORDER BY similarity(food_name, %s) DESC
                LIMIT 1
            """

            search_term = f"%{food_name}%"
            cursor.execute(query, (search_term, food_name))
            result = cursor.fetchone()
            cursor.close()
            release_db_connection(conn)

            if result:
                # Calculate nutrition based on quantity
                _, cal_100g, prot_100g, carb_100g, fat_100g, typical_serving = result
                actual_quantity = quantity_g or typical_serving or 100

                # Scale nutrition values based on quantity
                multiplier = actual_quantity / 100

                return {
                    "calories": int(cal_100g * multiplier),
                    "protein": round(prot_100g * multiplier, 1),
                    "carbs": round(carb_100g * multiplier, 1),
                    "fat": round(fat_100g * multiplier, 1),
                    "estimated_quantity_g": round(actual_quantity, 1)
                }

        except Exception as e:
            print(f"Database query failed: {e}, falling back to AI estimates")
            release_db_connection(conn)

    # Fallback: Use AI for estimation if database is unavailable
    print(f"Using AI fallback for: {food_name}")
    quantity_str = ""
    if quantity_g:
        quantity_str = f"{quantity_g}g of "
    elif quantity_items:
        quantity_str = f"{quantity_items} "

    system_prompt = """You are a nutrition expert with access to USDA database. Provide accurate nutrition information for foods.
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
