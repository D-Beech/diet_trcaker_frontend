"""
Firebase Authentication Middleware for FastAPI
Protects API endpoints by verifying Firebase ID tokens
"""
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from auth.firebase_admin import verify_firebase_token, firebase_app

security = HTTPBearer(auto_error=False)


async def get_current_user(request: Request) -> dict:
    """
    Dependency to extract and verify Firebase token from request.
    Use this in protected routes to get current user info.

    Usage:
        @app.get("/protected")
        async def protected_route(user: dict = Depends(get_current_user)):
            return {"user_id": user["user_id"]}
    """
    # Check if Firebase is initialized
    if not firebase_app:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service unavailable"
        )

    # Extract token from Authorization header
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Remove "Bearer " prefix
    token = auth_header.replace("Bearer ", "").strip()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify token
    try:
        decoded_token = verify_firebase_token(token)

        return {
            "user_id": decoded_token.get("uid"),
            "email": decoded_token.get("email"),
            "email_verified": decoded_token.get("email_verified", False),
            "firebase_claims": decoded_token
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


async def verify_token_middleware(request: Request, call_next):
    """
    Global middleware to verify Firebase tokens on all requests.
    Can be used as application-wide middleware.

    Note: This is optional. Using get_current_user as a dependency
    on specific routes is more flexible.
    """
    # Skip authentication for public endpoints
    public_paths = ["/health", "/docs", "/openapi.json", "/redoc"]

    if request.url.path in public_paths or request.method == "OPTIONS":
        return await call_next(request)

    # Verify token for protected endpoints
    try:
        await get_current_user(request)
        response = await call_next(request)
        return response
    except HTTPException as e:
        # Re-raise the exception to be handled by FastAPI
        raise e
