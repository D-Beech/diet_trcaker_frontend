from utils.openai_client import client
from models.models import LogEntry, Exercise, Food
import json

def parse_log_entry(user_input: str) -> LogEntry:
    """
    Parse natural language input into structured LogEntry format.
    Uses OpenAI to extract exercise and food information.
    """

    system_prompt = """You are a diet and exercise tracking assistant. Parse the user's input and extract:
- Exercise activities (with sets, reps, weight in kg, distance in km, or time in minutes)
- Food items (with quantity in grams or number of items)
- Body weight in kg (if mentioned)

Return a JSON object with this exact structure:
{
    "exercise": [{"name": "...", "sets": null, "reps": null, "weight_kg": null, "distance_km": null, "time_min": null}],
    "food": [{"name": "...", "quantity_g": null, "quantity_items": null}],
    "body_weight_kg": null
}

Rules:
- Include ALL exercises and foods mentioned
- Use null for any missing optional fields
- Convert all weights/distances to metric (kg, km)
- For food quantities, prefer grams when possible
- Extract numeric values accurately
- If no exercise is mentioned, return empty exercise list
- If no food is mentioned, return empty food list
"""

    try:
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
