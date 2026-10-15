
import os
from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
from search_routes import create_search_blueprint
from auth_routes import create_auth_blueprint
from profile_routes import create_profile_blueprint
from visit_routes import create_visit_blueprint

load_dotenv()

app = Flask(__name__)
# Only allow the local React dev server (and, once deployed, your live
# frontend set in FRONTEND_URL) to call this API.
allowed_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
frontend_url = os.getenv("FRONTEND_URL", "").strip().rstrip("/")
if frontend_url:
    allowed_origins.append(frontend_url)
CORS(app, origins=allowed_origins)

client = None
db = None

try:
    mongo_uri = os.getenv("MONGO_URI")

    if not mongo_uri:
        raise ValueError("MONGO_URI is missing from the .env file")

    client = MongoClient(
        mongo_uri,
        serverSelectionTimeoutMS=5000
    )

    client.admin.command("ping")
    db = client["colive_db"]

    print("MongoDB Atlas connected successfully!")

except Exception as error:
    client = None
    db = None
    print("MongoDB connection failed:", repr(error))

app.register_blueprint(create_search_blueprint(db))
app.register_blueprint(create_auth_blueprint(db))
app.register_blueprint(create_profile_blueprint(db))
app.register_blueprint(create_visit_blueprint(db))


@app.route("/")
def home():
    return jsonify({
        "message": "Welcome to CoLive API",
        "status": "running"
    })


@app.route("/api/health")
def health():
    return jsonify({
        "app": "CoLive",
        "status": "ok"
    })


@app.route("/api/db-test")
def db_test():
    if client is None or db is None:
        return jsonify({
            "status": "error",
            "message": "MongoDB is not connected. Check the Flask terminal for details."
        }), 500

    try:
        result = client.admin.command("ping")

        return jsonify({
            "status": "success",
            "message": "CoLive is connected to MongoDB Atlas!",
            "ping": result.get("ok")
        }), 200

    except Exception:
        # Full details go to the terminal only, not to the browser.
        app.logger.exception("MongoDB ping failed")

        return jsonify({
            "status": "error",
            "message": "MongoDB ping failed. Check the Flask terminal for details."
        }), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
