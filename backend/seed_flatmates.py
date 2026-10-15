"""Loads DEMO flatmate profiles into MongoDB for testing the search.

Run once from the backend folder:   python seed_flatmates.py
Running it again replaces the earlier demo profiles (it never touches
documents that don't have is_sample = True).
"""
import os
from datetime import date

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

mongo_uri = os.getenv("MONGO_URI")
if not mongo_uri:
    raise SystemExit("MONGO_URI is missing from the .env file")

client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
db = client["colive_db"]
collection = db["flatmates"]


def month_from_now(offset):
    today = date.today()
    index = today.year * 12 + (today.month - 1) + offset
    return f"{index // 12}-{index % 12 + 1:02d}"


PUNE = "Pune, Maharashtra"

profiles = [
    {"name": "Demo Profile A", "age": 22, "occupation": "Engineering student", "city": PUNE,
     "budget_min": 5000, "budget_max": 8000, "available_from": month_from_now(0),
     "sleep_schedule": "Night owl", "cleanliness": "Very tidy", "social_style": "Easygoing",
     "bio": "Looking for a calm, tidy shared flat near college."},
    {"name": "Demo Profile B", "age": 24, "occupation": "Software developer", "city": PUNE,
     "budget_min": 8000, "budget_max": 12000, "available_from": month_from_now(1),
     "sleep_schedule": "Early bird", "cleanliness": "Tidy", "social_style": "Quiet",
     "bio": "Works long hours, wants a peaceful home to come back to."},
    {"name": "Demo Profile C", "age": 23, "occupation": "MBA student", "city": PUNE,
     "budget_min": 8000, "budget_max": 12000, "available_from": month_from_now(0),
     "sleep_schedule": "Flexible", "cleanliness": "Tidy", "social_style": "Social",
     "bio": "Enjoys cooking together and weekend plans."},
    {"name": "Demo Profile D", "age": 26, "occupation": "Designer", "city": PUNE,
     "budget_min": 12000, "budget_max": 18000, "available_from": month_from_now(2),
     "sleep_schedule": "Night owl", "cleanliness": "Relaxed", "social_style": "Social",
     "bio": "Creative, works from home a few days a week."},
    {"name": "Demo Profile E", "age": 21, "occupation": "Commerce student", "city": PUNE,
     "budget_min": 0, "budget_max": 5000, "available_from": month_from_now(0),
     "sleep_schedule": "Early bird", "cleanliness": "Very tidy", "social_style": "Easygoing",
     "bio": "Budget-conscious and happy to share chores fairly."},
    {"name": "Demo Profile F", "age": 25, "occupation": "Data analyst", "city": "Mumbai, Maharashtra",
     "budget_min": 12000, "budget_max": 18000, "available_from": month_from_now(1),
     "sleep_schedule": "Flexible", "cleanliness": "Tidy", "social_style": "Quiet",
     "bio": "Prefers a quiet flat close to the station."},
    {"name": "Demo Profile G", "age": 24, "occupation": "Product manager", "city": "Bengaluru, Karnataka",
     "budget_min": 12000, "budget_max": 20000, "available_from": month_from_now(0),
     "sleep_schedule": "Early bird", "cleanliness": "Very tidy", "social_style": "Social",
     "bio": "Loves a good coffee and a clean kitchen."},
    {"name": "Demo Profile H", "age": 22, "occupation": "Postgraduate student", "city": "Hyderabad, Telangana",
     "budget_min": 5000, "budget_max": 8000, "available_from": month_from_now(1),
     "sleep_schedule": "Night owl", "cleanliness": "Tidy", "social_style": "Easygoing",
     "bio": "Studies late, looking for an understanding flatmate."},
]

for p in profiles:
    p["is_sample"] = True

removed = collection.delete_many({"is_sample": True}).deleted_count
inserted = collection.insert_many(profiles)

print(f"Removed {removed} old demo profiles.")
print(f"Inserted {len(inserted.inserted_ids)} demo profiles into colive_db.flatmates")