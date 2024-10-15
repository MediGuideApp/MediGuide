from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_apscheduler import APScheduler
from reminder import Reminder, Patient
from datetime import datetime
import uuid
from urllib.parse import unquote


app = Flask(__name__)
CORS(app)

scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()

job_results = {}  # Store job results

@app.route('/api/fast', methods=['POST'])
def schedule_reminder_fast():
    data = request.json
    reminders = data.get('reminders', [])
    
    patient = Patient(data)
    reminder = Reminder(data)
    now = datetime.now()
    reminder_datetime = now.strftime("%H:%M")
    reminder.request(patient)

    job_id = str(uuid.uuid4())  # Generate a unique job ID
    job_results[job_id] = {'status': 'pending', 'results': []}

    return jsonify({'status': 'scheduled', 'job_id': job_id}), 202

@app.route('/api/schedule', methods=['POST'])
def schedule_reminder():
    data = request.json
    reminders = data.get('reminders', [])
    
    patient = Patient(data)
    reminder = Reminder(data)

    job_id = str(uuid.uuid4())  # Generate a unique job ID
    job_results[job_id] = {'status': 'pending', 'results': []}

    for rem in reminders:
        reminder_time = rem['time_of_consumption']
        
        now = datetime.now()
        reminder_datetime = datetime.strptime(reminder_time, "%H:%M")
        reminder_datetime = reminder_datetime.replace(year=now.year, month=now.month, day=now.day)
        
        scheduler.add_job(
            id=f"{job_id}_{reminder_datetime.timestamp()}",
            func=execute_reminder,
            args=[job_id, reminder, patient],
            trigger='date',
            run_date=reminder_datetime
        )
        print(f"Scheduled job {job_id} to run at {reminder_datetime}")

    return jsonify({'status': 'scheduled', 'job_id': job_id}), 202

def execute_reminder(job_id, reminder, patient):
    print(f"Executing reminder for job_id: {job_id}")
    result = reminder.request(patient)
    print(f"Reminder result for job_id {job_id}: {result}")
    if result:
        if job_id in job_results:
            job_results[job_id]['results'].append(result)
            print(f"Updated job_results for {job_id}: {job_results[job_id]}")
            if len(job_results[job_id]['results']) == len(reminder.reminders):
                job_results[job_id]['status'] = 'completed'
                print(f"Job {job_id} marked as completed")
        else:
            print(f"Warning: job_id {job_id} not found in job_results")
    else:
        print(f"Warning: reminder.request returned None for job_id {job_id}")

@app.route('/api/job_status/<job_id>', methods=['GET'])
def get_job_status(job_id):
    if job_id in job_results:
        return jsonify(job_results[job_id])
    return jsonify({'status': 'not_found', 'job_id': job_id}), 404

if __name__ == "__main__":
    app.run(port=8000, debug=True)
