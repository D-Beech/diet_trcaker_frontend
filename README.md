# Diet & Exercise Tracker

A Progressive Web App for tracking meals, workouts, and body weight using natural language input.

## Features

- Track meals with natural language (e.g., "I ate 300g chicken and rice")
- Log workouts (e.g., "Did 10 pushups and ran 5km")
- Record body weight
- Offline-first architecture with automatic sync
- PWA support for mobile installation
- Voice input (Oppo phones only)

## Installation

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # Add your OpenAI API key
uvicorn main:app --reload
```

Backend runs on http://localhost:8000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:3000

## Docker Deployment

### Backend
```bash
cd backend
podman build -t diet-backend .
podman run -d -p 8000:8000 --env-file .env diet-backend
```

### Frontend
Build static files and deploy to any static hosting:
```bash
cd frontend
npm run build
# Deploy the 'build' folder to Netlify, Vercel, Firebase, etc.
```

## Tech Stack

- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Python FastAPI + OpenAI
- Database: Firebase Firestore
- PWA: Service Workers + Offline Support

## License

MIT
