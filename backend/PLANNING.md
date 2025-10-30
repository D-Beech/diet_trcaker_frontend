
## Backend Planning

### Goals
- Accept natural-language logs for meals and workouts
- Parse inputs to structured entries (food items, macros; exercise type, duration, calories)
- Store user data and provide analytics summaries

### Tech Stack (proposed)
- Python + FastAPI
- PostgreSQL (SQLModel/SQLAlchemy) or SQLite for quick start
- Pydantic for validation, FastAPI auto-generates OpenAPI docs

### API Endpoints (initial)
- POST /api/logs/meal
  - body: { input: string, mealType?: 'breakfast'|'lunch'|'dinner'|'snacks', timestamp?: string }
  - result: { id, parsedItems: [{ name, calories, protein, carbs, fat }], totalCalories }

- POST /api/logs/workout
  - body: { input: string, timestamp?: string }
  - result: { id, activities: [{ name, durationMin, calories }], totalCalories }

- GET /api/summary/today
  - returns: calories consumed/burned, macros, workout time

### Parsing Strategy
- Phase 1: Rule-based heuristics + keyword matching
- Phase 2: Optional LLM-assisted parsing endpoint

### Data Model (sketch)
- users: id, email
- meals: id, userId, mealType, timestamp
- meal_items: id, mealId, name, calories, protein, carbs, fat
- workouts: id, userId, timestamp
- workout_items: id, workoutId, name, durationMin, calories

### Security
- JWT-based auth (later), CORS from frontend

### Observability
- Request logging, error handling, health check (/health)

### Next Steps
1) Scaffold FastAPI app with /health and the two POST endpoints
2) Add Pydantic models and auto OpenAPI docs
3) Add simple parser stubs that echo input and return mock parsed items
4) Add DB schema and persistence
