# Diet Tracker Backend

FastAPI backend for parsing natural language meal and workout logs.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create `.env` file with your OpenAI API key:
```
OPENAI_API_KEY=your_key_here
```

3. Run the server:
```bash
uvicorn main:app --reload
```

Server runs on http://localhost:8000

## API Endpoints

- `POST /log-natlang` - Parse natural language input for meals, workouts, and bodyweight
- `GET /health` - Health check

## Docker

```bash
podman build -t diet-backend .
podman run -d -p 8000:8000 --env-file .env diet-backend
```
