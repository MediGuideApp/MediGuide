from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_apscheduler import APScheduler
from reminder import Reminder, Patient
from datetime import datetime


app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})


scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()

@app.route('/api/schedule', methods=['POST'])
def schedule_reminder():
    data = request.json
    patient_data = data['patient']
    reminder_time_str = data['reminder_time']  # Expected in ISO format

    # Parse reminder_time
    reminder_time = datetime.fromisoformat(reminder_time_str.replace('Z', '+00:00'))

    patient = Patient(patient_data)
    reminder = Reminder()

    # Schedule the task
    job_id = f"reminder_{patient.id}_{reminder_time.timestamp()}"
    scheduler.add_job(
        id=job_id,
        func=reminder.request,
        args=[patient],
        trigger='date',
        run_date=reminder_time
    )

    print(f"Task scheduled with ID: {job_id} at {reminder_time}")

    # Return a response
    return jsonify({'status': 'success', 'task_id': job_id}), 200

if __name__ == "__main__":
    app.run(port=8000, debug=True)
