# Diet Tracker Frontend

React PWA for tracking diet and exercise with natural language input.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set environment variables (create `.env`):
```
VITE_API_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

3. Run development server:
```bash
npm run dev
```

App runs on http://localhost:3000

## Build for Production

```bash
npm run build
```

Deploy the `build` folder to any static hosting (Netlify, Vercel, Firebase, etc.)

## Features

- Natural language meal logging
- Workout tracking
- Offline-first with automatic sync
- PWA installable on mobile
- Voice input (Oppo phones only)

## Note

Voice input features require Oppo phone hardware for optimal performance.
