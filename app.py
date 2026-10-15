
import os
from flask import Flask
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

mongo_uri = os.getenv("MONGO_URI")

if not mongo_uri:
    raise ValueError("MONGO_URI is missing. Check your .env file.")

client = MongoClient(
    mongo_uri,
    serverSelectionTimeoutMS=10000
)

db = client["colive_db"]
users_collection = db["users"]


@app.route("/")
def home():
    return """
    <h1>Welcome to Co-Live!</h1>
    <p>Flatmate Matching and Recommendation System</p>
    """


@app.route("/test-db")
def test_db():
    try:
        client.admin.command("ping")
        return "MongoDB connected successfully!"
    except Exception as error:
        app.logger.exception("MongoDB connection failed")
        return "MongoDB connection failed. Check your configuration and terminal logs.", 500


if __name__ == "__main__":
    app.run(debug=True)
