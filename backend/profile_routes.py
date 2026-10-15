import re

from flask import Blueprint, jsonify, request

from auth_utils import user_id_from_request

SLEEP = ["Early bird", "Flexible", "Night owl"]
CLEANLINESS = ["Relaxed", "Tidy", "Very tidy"]
SOCIAL = ["Quiet", "Easygoing", "Social"]
MONTH_RE = re.compile(r"^\d{4}-(0[1-9]|1[0-2])$")


def create_profile_blueprint(db):
    """Routes to read and save the logged-in user's lifestyle profile.

    The profile is saved on the user's account. If the user ticks
    "show my profile in search", a public copy (name + lifestyle answers,
    never the email) is added to the `flatmates` collection.
    """
    bp = Blueprint("profile", __name__)

    def error(message, status):
        return jsonify({"status": "error", "message": message}), status

    @bp.route("/api/profile", methods=["GET"])
    def get_profile():
        if db is None:
            return error("Database is not connected.", 503)
        uid = user_id_from_request()
        if uid is None:
            return error("Please log in first.", 401)

        user = db["users"].find_one({"_id": uid})
        if not user:
            return error("Account not found.", 401)
        return jsonify({"status": "success", "profile": user.get("profile")}), 200

    @bp.route("/api/profile", methods=["PUT"])
    def save_profile():
        if db is None:
            return error("Database is not connected.", 503)
        uid = user_id_from_request()
        if uid is None:
            return error("Please log in first.", 401)

        user = db["users"].find_one({"_id": uid})
        if not user:
            return error("Account not found.", 401)

        data = request.get_json(silent=True) or {}

        city = str(data.get("city", "")).strip()
        move_in = str(data.get("available_from", "")).strip()
        sleep = data.get("sleep_schedule")
        clean = data.get("cleanliness")
        social = data.get("social_style")
        occupation = str(data.get("occupation", "")).strip()
        bio = str(data.get("bio", "")).strip()
        visible = bool(data.get("visible", False))

        try:
            budget_min = int(data.get("budget_min"))
            budget_max = int(data.get("budget_max"))
        except (TypeError, ValueError):
            return error("Please choose a monthly budget.", 400)

        age_raw = data.get("age")
        age = None
        if age_raw not in (None, ""):
            try:
                age = int(age_raw)
            except (TypeError, ValueError):
                return error("Age must be a number.", 400)
            if age < 18 or age > 80:
                return error("Age must be between 18 and 80.", 400)

        if not city or len(city) > 60:
            return error("Please choose a city.", 400)
        if not MONTH_RE.match(move_in):
            return error("Please choose a move-in month.", 400)
        if budget_min < 0 or budget_max > 1000000 or budget_min > budget_max:
            return error("Please choose a valid monthly budget.", 400)
        if sleep not in SLEEP or clean not in CLEANLINESS or social not in SOCIAL:
            return error("Please answer all the lifestyle questions.", 400)
        if len(occupation) > 60:
            return error("Occupation is too long (max 60 characters).", 400)
        if len(bio) > 200:
            return error("Bio is too long (max 200 characters).", 400)

        profile = {
            "city": city,
            "available_from": move_in,
            "budget_min": budget_min,
            "budget_max": budget_max,
            "sleep_schedule": sleep,
            "cleanliness": clean,
            "social_style": social,
            "age": age,
            "occupation": occupation,
            "bio": bio,
            "visible": visible,
        }

        try:
            db["users"].update_one({"_id": uid}, {"$set": {"profile": profile}})

            if visible:
                public_doc = {
                    "user_id": str(uid),
                    "name": user["name"],
                    "age": age,
                    "occupation": occupation,
                    "city": city,
                    "budget_min": budget_min,
                    "budget_max": budget_max,
                    "available_from": move_in,
                    "sleep_schedule": sleep,
                    "cleanliness": clean,
                    "social_style": social,
                    "bio": bio,
                    "is_sample": False,
                }
                db["flatmates"].replace_one({"user_id": str(uid)}, public_doc, upsert=True)
            else:
                db["flatmates"].delete_many({"user_id": str(uid)})
        except Exception:
            return error("Could not save your profile. Please try again.", 500)

        return jsonify({"status": "success", "profile": profile}), 200

    return bp