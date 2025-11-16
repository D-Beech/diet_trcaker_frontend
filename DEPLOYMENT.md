# Deployment Guide

## Backend Deployment (Podman/Docker)

### 1. Build the backend image
```bash
cd backend
podman build -t diet-backend .
```

### 2. Run the backend container
```bash
podman run -d \
  --name diet-backend \
  -p 8000:8000 \
  --env-file .env \
  diet-backend
```

**Important:** Backend runs on port **8000**

### 3. (Optional) Push to container registry
```bash
podman tag diet-backend your-registry.com/diet-backend:latest
podman push your-registry.com/diet-backend:latest
```

---

## Frontend Deployment (Static PWA)

### 1. Update the API URL

Edit `frontend/.env.production` and set your backend URL:
```
VITE_API_URL=https://your-backend-domain.com
```

Or if running locally:
```
VITE_API_URL=http://localhost:8000
```

### 2. Build the static files
```bash
cd frontend
npm install
npm run build
```

This creates a `build` folder with all static files.

### 3. Deploy the build folder

**Option A: Netlify**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd build
netlify deploy --prod
```

**Option B: Vercel**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Option C: Firebase Hosting**
```bash
firebase init hosting
# Select 'build' as public directory
firebase deploy --only hosting
```

**Option D: Static Server (nginx)**
```bash
# Copy build folder to server
scp -r build/* user@server:/var/www/html/

# Or use any static file server
npx serve build -p 80
```

---

## Port Configuration Summary

| Service  | Port | Protocol |
|----------|------|----------|
| Backend  | 8000 | HTTP     |
| Frontend | 80/443 (static) | HTTP/HTTPS |

---

## Environment Variables Checklist

### Backend (.env)
- ✅ `OPENAI_API_KEY` - Your OpenAI API key

### Frontend (.env.production)
- ✅ `VITE_API_URL` - Backend URL (e.g., https://api.yourdomain.com)
- ✅ `VITE_FIREBASE_API_KEY` - Firebase config
- ✅ `VITE_FIREBASE_AUTH_DOMAIN` - Firebase config
- ✅ `VITE_FIREBASE_PROJECT_ID` - Firebase config
- ✅ `VITE_FIREBASE_STORAGE_BUCKET` - Firebase config
- ✅ `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase config
- ✅ `VITE_FIREBASE_APP_ID` - Firebase config

---

## CORS Configuration

If frontend and backend are on different domains, ensure CORS is configured in `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],  # Update this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Testing the Deployment

1. **Test backend:**
```bash
curl http://localhost:8000/health
```

2. **Test API:**
```bash
curl -X POST http://localhost:8000/log-natlang \
  -H "Content-Type: application/json" \
  -d '{"user_input": "I ate chicken and rice"}'
```

3. **Test frontend:**
   - Open browser to your deployed URL
   - Try logging a meal
   - Check browser console for API calls
   - Test offline mode (disconnect internet)
   - Install PWA (look for install prompt)

---

## Troubleshooting

**CORS errors:**
- Update `allow_origins` in backend/main.py
- Ensure frontend uses correct VITE_API_URL

**API not connecting:**
- Check VITE_API_URL in .env.production
- Verify backend is running on port 8000
- Check firewall rules

**PWA not installing:**
- Must use HTTPS (not HTTP) in production
- Check manifest.json is served correctly
- Verify service worker is registered
