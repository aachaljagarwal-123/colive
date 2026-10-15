import os

import jwt
from bson import ObjectId
from flask import request


def user_id_from_request():
    """Returns the logged-in user's ObjectId from the Authorization header,
    or None if there is no valid login token."""
    header = request.headers.get("Authorization", "")
    secret = os.getenv("JWT_SECRET")
    if not header.startswith("Bearer ") or not secret:
        return None
    try:
        payload = jwt.decode(header[len("Bearer "):], secret, algorithms=["HS256"])
        return ObjectId(payload["sub"])
    except Exception:
        return None