# services/ai_service.py
from openai import OpenAI
from .models import LogEntry
import json
from datetime import datetime

def do_ai(prompt: str, api_key, log_time: datetime = None):
    """
    Extract exercises and foods from a natural language prompt using GPT-3.5-Turbo.

    - Only include items explicitly mentioned.
    - Return empty arrays if nothing is mentioned.
    - Returns a dict matching the LogEntry schema.
    """
    client = OpenAI(api_key=api_key)

    schema_instruction = """
    Respond ONLY in JSON matching this schema:

    {
        "exercise": [
            {
                "name": "string",
                "sets": number,
                "reps": number,
                "weight_kg": number,
                "distance_km": number,
                "time_min": number
            }
        ],
        "food": [
            {
                "name": "string",
                "quantity_g": number,
                "quantity_items": number
            }
        ],
        "body_weight_kg": number
    }

    Rules:
    1. Include exercises and foods mentioned in the prompt. If you are unsure, include them with null values for missing fields.
    2. Do NOT invent additional exercises or foods.
    3. Use numbers for sets, reps, weight, distance, time, quantity. If only a word is given, try to convert to number. If missing, use null.
    4. If no exercises or foods are mentioned, return empty arrays.
    5. Respond with strict JSON only, no commentary.
    6. If bodyweight is not mentioned use null.

    """

    try:

        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": f"{prompt}\n\n{schema_instruction}"}]
        )

        response_text = completion.choices[0].message.content
        parsed_json = json.loads(response_text)

        # Add timestamp if provided
        if log_time:
            parsed_json["timestamp"] = log_time.isoformat()

        # Validate with Pydantic
        validated_data = LogEntry.model_validate(parsed_json)
        return validated_data.model_dump()

    except json.JSONDecodeError:
        return {"error": "AI did not return valid JSON", "raw_response": response_text}
    except Exception as e:
        return {"error": str(e)}