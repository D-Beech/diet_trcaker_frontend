"""
Firebase Admin SDK Initialization
Handles Firebase authentication verification for protected API endpoints
"""
import os
import json
import firebase_admin
from firebase_admin import credentials, auth
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase Admin SDK
firebase_app = None

def init_firebase():
    """
    Initialize Firebase Admin SDK with service account credentials.
    Supports both JSON file path and inline JSON credentials.
    """
    global firebase_app

    if firebase_app:
        return firebase_app

    try:
        # Try to get credentials from environment variable (JSON string or file path)
        firebase_creds = os.getenv('FIREBASE_SERVICE_ACCOUNT')

        if not firebase_creds:
            print("WARNING: FIREBASE_SERVICE_ACCOUNT not set. Authentication disabled.")
            return None

        # Check if it's a file path or JSON string
        if firebase_creds.startswith('{'):
            # It's a JSON string
            cred_dict = json.loads(firebase_creds)
            cred = credentials.Certificate(cred_dict)
        else:
            # It's a file path
            cred = credentials.Certificate(firebase_creds)

        firebase_app = firebase_admin.initialize_app(cred)
        print(f"Firebase Admin SDK initialized successfully")
        print(f"Project ID: {cred_dict.get('project_id', 'N/A') if firebase_creds.startswith('{') else 'from file'}")

        return firebase_app

    except Exception as e:
        print(f"Failed to initialize Firebase Admin SDK: {e}")
        print("Authentication will be disabled.")
        return None


def verify_firebase_token(token: str) -> dict:
    """
    Verify Firebase ID token and return decoded token with user info.

    Args:
        token: Firebase ID token from Authorization header

    Returns:
        dict: Decoded token containing user information (uid, email, etc.)

    Raises:
        Exception: If token is invalid or verification fails
    """
    if not firebase_app:
        raise Exception("Firebase not initialized. Authentication unavailable.")

    try:
        # Verify the ID token
        decoded_token = auth.verify_id_token(token)

        print(f"Token verified for user: {decoded_token.get('uid')}")

        return decoded_token

    except auth.InvalidIdTokenError:
        raise Exception("Invalid Firebase ID token")
    except auth.ExpiredIdTokenError:
        raise Exception("Firebase ID token has expired")
    except Exception as e:
        raise Exception(f"Token verification failed: {str(e)}")


def get_user_from_token(token: str) -> dict:
    """
    Extract user information from Firebase token.

    Returns:
        dict with user_id, email, email_verified
    """
    decoded_token = verify_firebase_token(token)

    return {
        "user_id": decoded_token.get("uid"),
        "email": decoded_token.get("email"),
        "email_verified": decoded_token.get("email_verified", False),
        "firebase_claims": decoded_token
    }
