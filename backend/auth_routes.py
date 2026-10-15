import os
import re
from datetime import datetime, timedelta, timezone

import jwt
from bson import ObjectId
from flask import Blueprint, jsonify, request
from pymongo.errors import DuplicateKeyError
from werkzeug.security import check_password_hash, generate_password_hash

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
TOKEN_HOURS = 24 * 7  # login stays valid for 7 days


def create_auth_blueprint(db):
    """Returns a blueprint with /api/auth/register, /login and /me.

    Passwords are never stored in plain text: only a salted hash is saved.
    Needs JWT_SECRET in the backend .env file.
    """
    bp = Blueprint("auth", __name__)

    if db is not None:
        try:
            db["users"].create_index("email", unique=True)
        except Exception as error:  # the app can still start without it
            print("Could not create users index:", repr(error))

    def error(message, status):
        return jsonify({"status": "error", "message": message}), status

    def make_token(user_id):
        secret = os.getenv("JWT_SECRET")
        payload = {
            "sub": str(user_id),
            "exp": datetime.now(timezone.utc) + timedelta(hours=TOKEN_HOURS),
        }
        return jwt.encode(payload, secret, algorithm="HS256")

    def public_user(doc):
        return {"id": str(doc["_id"]), "name": doc["name"], "email": doc["email"]}

    def setup_problem():
        if db is None:
            return error("Database is not connected.", 503)
        if not os.getenv("JWT_SECRET"):
            return error("Server setup incomplete: JWT_SECRET is missing in .env.", 500)
        return None

    @bp.route("/api/auth/register", methods=["POST"])
    def register():
        problem = setup_problem()
        if problem:
            return problem

        data = request.get_json(silent=True) or {}
        name = str(data.get("name", "")).strip()
        email = str(data.get("email", "")).strip().lower()
        password = str(data.get("password", ""))

        if len(name) < 2 or len(name) > 60:
            return error("Please enter your name (2 to 60 characters).", 400)
        if not EMAIL_RE.match(email) or len(email) > 120:
            return error("Please enter a valid email address.", 400)
        if len(password) < 8 or len(password) > 128:
            return error("Password must be 8 to 128 characters long.", 400)

        user_doc = {
            "name": name,
            "email": email,
            "password_hash": generate_password_hash(password),
            "created_at": datetime.now(timezone.utc),
        }

        try:
            result = db["users"].insert_one(user_doc)
        except DuplicateKeyError:
            return error("An account with this email already exists.", 409)
        except Exception:
            return error("Could not create the account. Please try again.", 500)

        user_doc["_id"] = result.inserted_id
        return jsonify({
            "status": "success",
            "token": make_token(result.inserted_id),
            "user": public_user(user_doc),
        }), 201

    @bp.route("/api/auth/login", methods=["POST"])
    def login():
        problem = setup_problem()
        if problem:
            return problem

        data = request.get_json(silent=True) or {}
        email = str(data.get("email", "")).strip().lower()
        password = str(data.get("password", ""))

        if not email or not password:
            return error("Please enter your email and password.", 400)

        try:
            user = db["users"].find_one({"email": email})
        except Exception:
            return error("Login failed. Please try again.", 500)

        # Same message for "no such user" and "wrong password" on purpose.
        if not user or not check_password_hash(user["password_hash"], password):
            return error("Incorrect email or password.", 401)

        return jsonify({
            "status": "success",
            "token": make_token(user["_id"]),
            "user": public_user(user),
        }), 200

    @bp.route("/api/auth/me")
    def me():
        problem = setup_problem()
        if problem:
            return problem

        header = request.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            return error("Not logged in.", 401)

        try:
            payload = jwt.decode(
                header[len("Bearer "):],
                os.getenv("JWT_SECRET"),
                algorithms=["HS256"],
            )
            user = db["users"].find_one({"_id": ObjectId(payload["sub"])})
        except Exception:
            return error("Session expired. Please log in again.", 401)

        if not user:
            return error("Account not found.", 401)

        return jsonify({"status": "success", "user": public_user(user)}), 200

    return bp
