from scripts.reminder import Patient, Reminder
import time
import schedule
# parse a json file of patient reminders

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

    def demo_reminder(self):
        self._reminder_job()

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
