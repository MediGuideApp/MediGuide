from vapi3 import Patient, Reminder
import time
import schedule
# parse a json file of patient reminders
example_patient_data = {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "gender": "male",
    "phone_number": "1234567890",
    "medical_conditions": ["diabetes", "hypertension"],
    "medications": [
        {
            "name": "Metformin",
            "dosage": "500mg",
            "time": "08:00, 20:00"
        },
        {
            "name": "Lisinopril",
            "dosage": "10mg",
            "time": "08:00"
        }
    ],
    "total_doses": 3,
    "doses_taken": 1
}
example_times = ["08:00", "20:00"]

class ReminderScheduler:
    def __init__(self, patient_data) -> None:
        self.patient = Patient(patient_data)
        self.reminders_cache = []

    def cancel_reminders(self):
        schedule.clear()
        print("All reminders cancelled")

    def schedule_reminders(self, times):
        for time in times:
            self._schedule_daily_reminder(time)

    def _schedule_daily_reminder(self, time):
        try:
            # check time is of format HH:MM
            if len(time.split(":")) != 2:
                raise ValueError("Time format is incorrect")
            if time in self.reminders_cache:
                print(f"Reminder already scheduled for {time}")
                return
            # schedule.every().day.at(time).do(self._reminder_job)
            print(f"Reminder scheduled for {time}")
        except Exception as e:
            print(f"Error scheduling reminder: {e}")
        
    def _reminder_job(self):
        reminder = Reminder()
        reminder.request(self.patient)

scheduler = ReminderScheduler(example_patient_data)
scheduler.schedule_reminders(example_times)
scheduler.cancel_reminders()