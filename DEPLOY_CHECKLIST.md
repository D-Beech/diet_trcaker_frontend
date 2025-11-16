# Pre-Deployment Checklist

## Before You Deploy

### Backend Configuration

- [ ] **OpenAI API Key** - Set in `backend/.env`
  ```
  OPENAI_API_KEY=your_actual_key
  ```

- [ ] **CORS Origins** - Update in `backend/.env` for production
  ```
  ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com
  ```

- [ ] **Port 8000** - Ensure backend runs on port 8000
- [ ] **Health Check** - Test: `curl http://your-backend:8000/health`

### Frontend Configuration

- [ ] **API URL** - Update `frontend/.env.production`
  ```
  VITE_API_URL=https://your-backend-domain.com
  ```
  or for same-origin deployment:
  ```
  VITE_API_URL=https://your-domain.com/api
  ```

- [ ] **Firebase Config** - All Firebase env vars set correctly
- [ ] **Build Output** - Set to `build` folder (already configured)

### Security

- [ ] Remove any test API keys
- [ ] Set CORS to specific domains (not `*`)
- [ ] Use HTTPS for production (required for PWA)
- [ ] Keep `.env` files out of git (already in .gitignore)

### Testing

- [ ] Backend API responds correctly
- [ ] Frontend can call backend API
- [ ] CORS works between domains
- [ ] PWA installs on mobile
- [ ] Offline mode works
- [ ] Service worker caches properly

---

## Quick Deploy Commands

### Backend (Podman)
```bash
cd backend
podman build -t diet-backend .
podman run -d --name diet-backend -p 8000:8000 --env-file .env diet-backend
```

### Frontend (Build)
```bash
cd frontend
npm run build
# Deploy 'build' folder to your hosting
```

---

## Ports Summary

| Service | Port | Usage |
|---------|------|-------|
| Backend | 8000 | API server |
| Frontend Dev | 3000 | Development only |
| Frontend Prod | 80/443 | Static files (nginx/hosting) |

---

## Common Deployment Scenarios

### Scenario 1: Separate Backend & Frontend Domains
- Backend: `https://api.yourdomain.com` (port 8000)
- Frontend: `https://yourdomain.com` (port 80/443)
- Set `ALLOWED_ORIGINS=https://yourdomain.com`
- Set `VITE_API_URL=https://api.yourdomain.com`

### Scenario 2: Same Domain with Reverse Proxy
- Backend: `https://yourdomain.com/api` → proxy to port 8000
- Frontend: `https://yourdomain.com` → static files
- Set `ALLOWED_ORIGINS=https://yourdomain.com`
- Set `VITE_API_URL=https://yourdomain.com/api`

### Scenario 3: Local Testing
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`
- Set `ALLOWED_ORIGINS=http://localhost:3000`
- Set `VITE_API_URL=http://localhost:8000`

---

## Post-Deployment Verification

1. ✅ Backend health check works
2. ✅ Frontend loads without errors
3. ✅ Can log meals/workouts
4. ✅ Gets real nutrition data from OpenAI
5. ✅ Data saves to Firebase
6. ✅ Offline mode works
7. ✅ PWA install prompt appears (mobile)
8. ✅ Voice input works (Oppo phones only)
