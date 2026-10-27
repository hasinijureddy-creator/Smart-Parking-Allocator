from flask import Flask, render_template, request, jsonify
import json
import os

app = Flask(__name__)

# =========================================================
# PARKING DATA
# =========================================================

DATA_FILE = "parking_data.json"

ZONES = {
    "A": [f"A{i:02d}" for i in range(1, 31)],
    "B": [f"B{i:02d}" for i in range(1, 31)],
    "C": [f"C{i:02d}" for i in range(1, 31)]
}


# =========================================================
# LOAD PARKING DATA
# =========================================================

def load_parking_data():

    if not os.path.exists(DATA_FILE):
        return {
            "bookings": []
        }

    try:

        with open(DATA_FILE, "r") as file:
            data = json.load(file)

        if "bookings" not in data:
            data["bookings"] = []

        return data

    except Exception:

        return {
            "bookings": []
        }


# =========================================================
# SAVE PARKING DATA
# =========================================================

def save_parking_data(data):

    with open(DATA_FILE, "w") as file:
        json.dump(data, file, indent=4)


# =========================================================
# HOME
# =========================================================

@app.route("/")
def home():

    return render_template("index.html")


# =========================================================
# PARKING
# =========================================================

@app.route("/parking")
def parking():

    return render_template("parking.html")


# =========================================================
# BOOKING
# =========================================================

@app.route("/booking")
def booking():

    return render_template("booking.html")


# =========================================================
# ALLOCATION
# =========================================================

@app.route("/allocation")
def allocation():

    return render_template("allocation.html")


# =========================================================
# LIVE STATUS
# =========================================================

@app.route("/status")
def status():

    return render_template("live.html")


@app.route("/live")
def live():

    return render_template("live.html")


# =========================================================
# PREDICTION
# =========================================================

@app.route("/prediction")
def prediction():

    return render_template("prediction.html")


# =========================================================
# ABOUT
# =========================================================

@app.route("/about")
def about():

    return render_template("about.html")


# =========================================================
# SUBJECT DETAILS
# =========================================================

@app.route("/subject/<subject>")
def subject_details(subject):

    subject = subject.lower().strip()

    allowed_subjects = [
        "python",
        "oopj",
        "adsa",
        "dmgt"
    ]

    if subject not in allowed_subjects:

        return "Subject not found", 404

    return render_template(
        "subject.html",
        subject=subject
    )


# =========================================================
# GET ALL BOOKINGS
# =========================================================

@app.route("/api/bookings", methods=["GET"])
def get_bookings():

    data = load_parking_data()

    return jsonify({

        "success": True,

        "bookings": data["bookings"]

    })


# =========================================================
# SMART ALLOCATION
# =========================================================

@app.route("/api/allocate", methods=["POST"])
def allocate_slot():

    try:

        data = request.get_json() or {}

        vehicle = str(
            data.get("vehicle", "")
        ).strip()

        vehicle_type = str(
            data.get("vehicleType", "car")
        ).strip()

        preferred_zone = str(
            data.get("zone", "auto")
        ).strip().upper()

        if len(vehicle) < 4:

            return jsonify({

                "success": False,

                "message":
                    "Please enter a valid vehicle number."

            }), 400

        parking_data = load_parking_data()

        booked_slots = {

            str(item.get("slot", "")).upper()

            for item in parking_data["bookings"]

        }

        # -------------------------------------------------
        # DEMO OCCUPIED SLOTS
        # -------------------------------------------------

        occupied_slots = set()

        for zone_name, slots in ZONES.items():

            for index, slot in enumerate(slots):

                if index % 9 == 0:

                    occupied_slots.add(slot)

        # -------------------------------------------------
        # SELECT ZONE
        # -------------------------------------------------

        if preferred_zone in ZONES:

            search_zones = [preferred_zone]

        else:

            search_zones = ["A", "B", "C"]

        # -------------------------------------------------
        # FIND AVAILABLE SLOT
        # -------------------------------------------------

        selected_slot = None

        for zone_name in search_zones:

            for slot in ZONES[zone_name]:

                if slot in booked_slots:
                    continue

                if slot in occupied_slots:
                    continue

                selected_slot = slot

                break

            if selected_slot:
                break

        # -------------------------------------------------
        # NO SLOT AVAILABLE
        # -------------------------------------------------

        if not selected_slot:

            return jsonify({

                "success": False,

                "message":
                    "No available parking slot found."

            }), 409

        # -------------------------------------------------
        # RETURN ALLOCATION
        # -------------------------------------------------

        return jsonify({

            "success": True,

            "message":
                "Best parking slot found.",

            "slot":
                selected_slot,

            "vehicle":
                vehicle,

            "vehicleType":
                vehicle_type,

            "zone":
                selected_slot[0]

        })

    except Exception as error:

        print(
            "ALLOCATION ERROR:",
            error
        )

        return jsonify({

            "success": False,

            "message":
                "Unable to allocate parking slot."

        }), 500


# =========================================================
# CREATE BOOKING
# =========================================================

@app.route("/api/bookings", methods=["POST"])
def create_booking():

    try:

        data = request.get_json() or {}

        slot = str(
            data.get("slot", "")
        ).strip().upper()

        vehicle = str(
            data.get("vehicle", "")
        ).strip()

        duration = str(
            data.get(
                "duration",
                "1 Hour"
            )
        ).strip()

        vehicle_type = str(
            data.get(
                "vehicleType",
                "car"
            )
        ).strip()

        # -------------------------------------------------
        # VALIDATE SLOT
        # -------------------------------------------------

        if not slot:

            return jsonify({

                "success": False,

                "message":
                    "Parking slot is required."

            }), 400

        # -------------------------------------------------
        # VALIDATE VEHICLE
        # -------------------------------------------------

        if not vehicle:

            return jsonify({

                "success": False,

                "message":
                    "Vehicle number is required."

            }), 400

        parking_data = load_parking_data()

        # -------------------------------------------------
        # CHECK EXISTING BOOKING
        # -------------------------------------------------

        already_booked = any(

            str(
                booking.get(
                    "slot",
                    ""
                )
            ).upper() == slot

            for booking
            in parking_data["bookings"]

        )

        if already_booked:

            return jsonify({

                "success": False,

                "message":
                    f"{slot} is already booked."

            }), 409

        # -------------------------------------------------
        # CREATE BOOKING
        # -------------------------------------------------

        new_booking = {

            "slot":
                slot,

            "vehicle":
                vehicle,

            "vehicleType":
                vehicle_type,

            "duration":
                duration

        }

        parking_data["bookings"].append(
            new_booking
        )

        save_parking_data(
            parking_data
        )

        return jsonify({

            "success": True,

            "message":
                f"{slot} booked successfully.",

            "booking":
                new_booking

        })

    except Exception as error:

        print(
            "BOOKING ERROR:",
            error
        )

        return jsonify({

            "success": False,

            "message":
                "Unable to save booking."

        }), 500


# =========================================================
# RESET BOOKINGS
# =========================================================

@app.route(
    "/api/bookings/reset",
    methods=["POST"]
)
def reset_bookings():

    save_parking_data({

        "bookings": []

    })

    return jsonify({

        "success": True,

        "message":
            "All bookings cleared."

    })


# =========================================================
# RUN APPLICATION
# =========================================================

if __name__ == "__main__":

    app.run(
        debug=True
    )