import requests
import sqlite3
from datetime import datetime, timedelta

last_email_time = None

def send_email_notification(result, cooldown_minutes=30, cooldown_seconds=0):

    global last_email_time

    sensor = result["sensor_data"]

    alerts = []

    if sensor["do"] < 5:

        alerts.append({

            "title": "Low Dissolved Oxygen",

            "severity": "CRITICAL",

            "message":
            "DO level below recommended threshold."

        })

    if sensor["temperature"] > 30:

        alerts.append({

            "title": "High Temperature",

            "severity": "WARNING",

            "message":
            "Water temperature exceeds optimal range."

        })

    if sensor["ph"] < 6.5 or sensor["ph"] > 8:

        alerts.append({

            "title": "Unstable pH",

            "severity": "WARNING",

            "message":
            "pH outside safe operating range."

        })

    if result["health_status"] == "At Risk":

        alerts.append({

            "title": "Fish At Risk",

            "severity": "CRITICAL",

            "message":
            "Random Forest predicted At Risk condition."

        })

    if len(alerts) == 0:
        return False

    now = datetime.now()

    if (
        last_email_time is not None
        and now - last_email_time < timedelta(minutes=cooldown_minutes, seconds=cooldown_seconds)
    ):
        return False

    conn = sqlite3.connect("aquaagent.db")
    cursor = conn.cursor()
    cursor.execute("SELECT email FROM email_recipients")
    emails = [row[0] for row in cursor.fetchall()]
    conn.close()

    if len(emails) == 0:
        print("No email recipients found (cooldown updated)")
        last_email_time = now
        return True

    try:
        requests.post(
            "http://localhost:3000/api/send-alert-email",
            json={
                "emails": emails,
                "alerts": alerts,
                "sensorData": sensor,
                "buzzer": result["buzzer"]
            },
            timeout=10
        )
        last_email_time = now
        print(f"Alert email sent to {len(emails)} recipients.")
        return True
    except Exception as e:
        print("Email Error:", e)
        # Tetap update last_email_time agar tidak spam retry jika jaringan bermasalah
        last_email_time = now
        return True
