from bson import ObjectId
from flask import Blueprint, jsonify, request

from auth_utils import user_id_from_request

# Each lifestyle question is a 3-step scale. Answers that are close on the
# scale earn partial credit (e.g. "Flexible" vs "Night owl" = 50%).
TRAITS = {
    "sleep_schedule": ["Early bird", "Flexible", "Night owl"],
    "cleanliness": ["Relaxed", "Tidy", "Very tidy"],
    "social_style": ["Quiet", "Easygoing", "Social"],
}


def compatibility(mine, other):
    """Returns (overall_percent, per_trait_percent) or (None, {}).

    overall = average of the per-trait scores. A trait is only counted when
    both people answered it.
    """
    parts = {}
    for key, scale in TRAITS.items():
        a, b = mine.get(key), other.get(key)
        if a in scale and b in scale:
            gap = abs(scale.index(a) - scale.index(b))
            parts[key] = round(100 * (1 - gap / (len(scale) - 1)))
    if not parts:
        return None, {}
    return round(sum(parts.values()) / len(parts)), parts


def create_search_blueprint(db):
    """Returns a blueprint with the /api/search route.

    `db` is the MongoDB database object created in app.py (it can be None
    if the connection failed, in which case the route answers with 503).
    If the caller is logged in and has a lifestyle profile, each result gets
    a real compatibility score and results are sorted best match first.
    """
    bp = Blueprint("search", __name__)

    @bp.route("/api/search")
    def search_flatmates():
        if db is None:
            return jsonify({
                "status": "error",
                "message": "Database is not connected."
            }), 503

        city = request.args.get("city", "").strip()
        move_in = request.args.get("move_in", "").strip()  # format: YYYY-MM

        try:
            budget_min = int(request.args.get("budget_min", ""))
            budget_max = int(request.args.get("budget_max", ""))
        except ValueError:
            return jsonify({
                "status": "error",
                "message": "budget_min and budget_max must be numbers."
            }), 400

        if not city or not move_in:
            return jsonify({
                "status": "error",
                "message": "city and move_in are required."
            }), 400

        if budget_min > budget_max:
            return jsonify({
                "status": "error",
                "message": "budget_min cannot be greater than budget_max."
            }), 400

        # A profile matches when:
        #  - it is in the chosen city
        #  - its budget range overlaps the chosen budget range
        #  - it is available on or before the chosen month
        query = {
            "city": city,
            "budget_min": {"$lte": budget_max},
            "budget_max": {"$gte": budget_min},
            "available_from": {"$lte": move_in},
        }

        try:
            uid = user_id_from_request()
            my_profile = None
            if uid is not None:
                me = db["users"].find_one({"_id": uid})
                my_profile = (me or {}).get("profile")
                # never show people their own profile
                query["user_id"] = {"$ne": str(uid)}

            docs = list(
                db["flatmates"]
                .find(query)
                .sort("available_from", -1)
                .limit(50)
            )

            results = []
            for doc in docs:
                doc["id"] = str(doc.pop("_id"))
                # user_id is kept so the "Connect" button knows who to ask
                if my_profile:
                    score, breakdown = compatibility(my_profile, doc)
                    doc["match_score"] = score
                    doc["match_breakdown"] = breakdown
                results.append(doc)

            if my_profile:
                results.sort(key=lambda d: d.get("match_score") or -1, reverse=True)
            results = results[:12]

            return jsonify({
                "status": "success",
                "count": len(results),
                "logged_in": uid is not None,
                "has_profile": bool(my_profile),
                "results": results
            }), 200

        except Exception as error:
            return jsonify({
                "status": "error",
                "message": "Search failed.",
                "error_type": type(error).__name__
            }), 500

    return bp