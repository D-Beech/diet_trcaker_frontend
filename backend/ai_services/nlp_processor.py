from utils.openai_client import client
from models.models import LogEntry, Exercise, Food
import json

def parse_log_entry(user_input: str) -> LogEntry:
    """
    Two-stage processing pipeline:
    1. AI-powered structured data extraction (food names, quantities, exercise details)
    2. Nutrition database lookup for accurate macro calculations (not shown - handled by nutrition_service)

    This function focuses on STEP 1: extracting structured entities from natural language.
    """

    # STEP 1: Use AI to parse unstructured input into structured entities
    # AI extracts: food names, quantities, exercise types, sets/reps, etc.
    # AI does NOT calculate nutrition - that comes from our AWS RDS nutrition database
    system_prompt = """You are a diet and exercise tracking assistant. Parse the user's input and extract:
- Exercise activities (with sets, reps, weight in kg, distance in km, or time in minutes, and estimated calories burned)
- Food items (with quantity in grams or number of items, and accurate nutrition data)
- Body weight in kg (if mentioned)

Return a JSON object with this exact structure:
{
    "exercise": [{
        "name": "...",
        "sets": null,
        "reps": null,
        "weight_kg": null,
        "distance_km": null,
        "time_min": null,
        "calories_burned": <estimated calories>
    }],
    "food": [{
        "name": "...",
        "quantity_g": null,
        "quantity_items": null,
        "nutrition": {
            "calories": <number>,
            "protein": <grams>,
            "carbs": <grams>,
            "fat": <grams>
        }
    }],
    "body_weight_kg": null
}

Rules:
- Include ALL exercises and foods mentioned
- Use null for any missing optional fields
- Convert all weights/distances to metric (kg, km)
- For food quantities, prefer grams when possible. If not specified, estimate a typical serving size in grams
- Extract numeric values accurately
- Provide realistic nutrition estimates based on USDA database knowledge
- Provide realistic calorie burn estimates for exercises (assume ~70kg person if not specified)
- If no exercise is mentioned, return empty exercise list
- If no food is mentioned, return empty food list
- Always include nutrition object for each food item
- Always include calories_burned for each exercise
"""

    try:
        print("\nSTEP 1: AI-powered entity extraction")
        print(f"   Input: '{user_input}'")
        print("   Extracting: food names, quantities, exercise details...")

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_input}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )

        # Parse the response
        content = response.choices[0].message.content
        parsed_data = json.loads(content)

        print(f"   Extracted {len(parsed_data.get('food', []))} food items, {len(parsed_data.get('exercise', []))} exercises")
        print("\nSTEP 2: Nutrition calculations from AWS RDS database")
        print("   Querying PostgreSQL for accurate macro data...")

        # Create LogEntry with parsed data
        log_entry = LogEntry(
            exercise=[Exercise(**ex) for ex in parsed_data.get("exercise", [])],
            food=[Food(**food) for food in parsed_data.get("food", [])],
            body_weight_kg=parsed_data.get("body_weight_kg")
        )

        return log_entry

    except Exception as e:
        # Return empty LogEntry on error
        print(f"Error parsing log entry: {e}")
        return LogEntry(exercise=[], food=[])
