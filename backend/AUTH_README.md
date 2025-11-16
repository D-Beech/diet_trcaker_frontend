# Firebase Authentication Setup

This backend uses Firebase Authentication to protect API endpoints.

## How It Works

1. **Frontend**: User logs in with Firebase Auth, gets an ID token
2. **Frontend**: Sends token in `Authorization: Bearer <token>` header with each request
3. **Backend**: Verifies token using Firebase Admin SDK
4. **Backend**: Extracts user info (uid, email) and allows request to proceed

## Setup Instructions

### 1. Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file

### 2. Configure Environment Variable

Add to `.env` file:

```bash
# Option 1: JSON string (for production/deployment)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project",...}

# Option 2: File path (for local development)
FIREBASE_SERVICE_ACCOUNT=/path/to/serviceAccountKey.json
```

### 3. Protected Endpoints

All API endpoints except `/health` require authentication:

- `/api/logs/meal` - Log meals
- `/api/logs/workout` - Log workouts
- `/api/summary/today` - Get daily summary
- `/log-natlang` - Natural language logging

## Testing with cURL

```bash
# Get token from frontend first
TOKEN="your_firebase_id_token_here"

# Make authenticated request
curl -X POST http://localhost:8000/log-natlang \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_input": "I ate 2 eggs"}'
```

## Error Responses

### 401 Unauthorized - Missing Token
```json
{
  "detail": "Missing authorization header"
}
```

### 401 Unauthorized - Invalid Token
```json
{
  "detail": "Invalid Firebase ID token"
}
```

### 401 Unauthorized - Expired Token
```json
{
  "detail": "Firebase ID token has expired"
}
```

### 503 Service Unavailable - Firebase Not Configured
```json
{
  "detail": "Authentication service unavailable"
}
```

## Frontend Integration

The frontend should send the Firebase ID token with every request:

```typescript
// Get current user's token
const user = auth.currentUser;
const token = await user.getIdToken();

// Send with request
const response = await fetch('http://localhost:8000/log-natlang', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ user_input: 'I ate 2 eggs' })
});
```

## User Information

The backend extracts user information from the token and makes it available in the endpoint:

```python
@app.post("/log-natlang")
async def log_natlang(
    payload: LogNatLangRequest,
    user: dict = Depends(get_current_user)
):
    # Access user info
    user_id = user["user_id"]      # Firebase UID
    email = user["email"]           # User's email
    verified = user["email_verified"]  # Email verification status
```

## Security Best Practices

1. **Always use HTTPS in production** - Tokens should never be sent over HTTP
2. **Token expiration** - Firebase tokens expire after 1 hour
3. **Refresh tokens** - Frontend should refresh tokens before expiration
4. **CORS** - Only allow trusted origins in ALLOWED_ORIGINS
5. **Service Account** - Keep the service account JSON file secure and never commit to git
