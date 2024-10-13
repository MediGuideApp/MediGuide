import requests
import time
from datetime import datetime
import pytz

class Patient:
    def __init__(self, data):
        full_name = data["full_name"].split()
        self.first_name = full_name[0]
        self.last_name = full_name[1] if len(full_name) > 1 else ''
        self.gender = data["gender"]
        self.phone_number = data["phone_number"]
        self.medical_conditions = data["medical_conditions"]
        self.medications = data["medications"]
        self.doses_taken = data["doses_taken"]
    
    def generate_patient_data_string(self):
        patient_data = (
            f"Patient name: {self.first_name} {self.last_name}\n"
            f"Gender: {self.gender}\n"
            f"Medical conditions: {', '.join(self.medical_conditions)}\n"
            "Medications for today:\n" +
            '\n'.join([f"{med['name']} {med['dosage']} - {med['time']}" for med in self.medications])
        )
        
        # Log the patient data to the console
        print("Patient Data:")
        print(patient_data)
        
        return patient_data

class Reminder:
    def __init__(self):
        self.context = f"""
            You are an automated medication reminder bot, scheduled to remind your patient the appropriate dosage at the correct times of the day.

            Your job is to:
            1. Inform your patient about the drug they have to consume and the quantity
            2. Ensure that they affirm that they have consumed their medication
            3. You do not have to keep repeating the amount of the medication, for the first time it is fine, subsequently bring up the amount only when prompted.

            The current time is {self._current_time}. Instruct the patient on what medication to consume. Your patient may have memory difficulty, so be patient in making sure they understand the reminder.

            Once the customer acknowledges the reminder, say:
            "Please let me know when you have consumed your medication"

            Then:
            1. Wait for 10 seconds for the customer to consume their medication
            2. If they haven't responded after 10 seconds, ask if everything's okay

            Finally:
            - Upon receiving confirmation that they have consumed their medication, thank them for their cooperation
            - End the call

            """
        self.phone_number_id = '268a6ae6-41ff-43f9-87df-2aab78720327'
        self.auth_token = 'fadf3ce3-ef62-4d84-b11d-91634dc48ac6' # Your Vapi API Authorization token
        self.api_url = 'https://api.vapi.ai/call'
        self.call_id = None
    
    def request(self, patient):
        # Make the POST request to Vapi to create the phone call
        response = requests.request("POST",
            self._call_url(), headers=self._headers(), json=self._payload(patient))

        # Check if the request was successful and print the response and returns to next app
        if response.status_code == 201:
            print('Call created successfully')
            patient.doses_taken += 1
            print(response.json())
            self.call_id = response.json()['id']
            evaluation = self._get_analysis(self.call_id, patient)
            print(evaluation)
            print({
                'call_id': self.call_id,
                'evaluation': evaluation,
                'doses_taken': patient.doses_taken
            })
            return {
                'call_id': self.call_id,
                'evaluation': evaluation,
                'doses_taken': patient.doses_taken
            }
        else:
            print('Failed to create call')
            print(response.text)
            return None

    def save_patient_data(self, patient):
        # Save the patient data to a database
        pass

    def _call_url(self):
        return f'{self.api_url}/phone'

    def _get_analysis(self, call_id, patient):
        while requests.request("GET", f'{self.api_url}/{call_id}', headers=self._headers()).json()['status'] != 'ended':
            time.sleep(3)
        final_request = requests.request("GET", f'{self.api_url}/{call_id}', headers=self._headers())
        analysis = final_request.json().get('analysis')
        if analysis:
            evaluation = analysis.get('successEvaluation')
            if evaluation:
                self._update_patient_adherance(evaluation, patient)
                return evaluation

    def _update_patient_adherance(self, evaluation, patient):
        print(f'Patient before taking their medication, doses taken: ${patient.doses_taken}')
        if evaluation == 'true':
            patient.doses_taken += 1
            print(f'Patient has taken their medication, doses taken: ${patient.doses_taken}')
        else:
            print(f'Patient has not taken their medication. Doses taken: ${patient.doses_taken}')

    def _current_time(self):
        timezone = pytz.timezone('America/New_York')
        return datetime.now(timezone).strftime("%H:%M")

    def _headers(self):
        return {
            'Authorization': f'Bearer {self.auth_token}',
            'Content-Type': 'application/json',
        }
    
    def _payload(self, patient):
        return {
            'assistant': {
                "firstMessage": f"Hi {patient.first_name}! This is your medication reminder. Do you know what medication to take today?",
                "model": {
                    "provider": "openai",
                    "model": "gpt-4o-mini",
                    "messages": [
                        {
                            "role": "system",
                            "content": self.context + patient.generate_patient_data_string()
                        }
                    ]
                },
                "voice": "luna-deepgram",
                "firstMessageMode": "assistant-speaks-first",
                "endCallFunctionEnabled": True,
                "endCallMessage": "Thank you for your response, goodbye!",
                "endCallPhrases": ["I have consumed my medication", "I have already taken my medication", "I took my medication", "I have taken my medication", "I have consumed my medicine", "I have taken my medicine", "I have taken my pills"],
                "analysisPlan": {
                    "successEvaluationPrompt": "You are an experienced healthcare professional. Evaluate true if the customer has confirmed that they have consumed their medication, and false otherwise.",
                    "successEvaluationRubric": "PassFail",
                    "successEvaluationRequestTimeoutSeconds": 10.5
                },
            },
            'phoneNumberId': self.phone_number_id,
            'customer': {
                'number': patient.phone_number,
            },
        }

example_patient = {
    "id": "1",
    "full_name": "John Doe",
    "gender": "male",
    "phone_number": "+19173876165",
    "medical_conditions": "diabetes",
    "medication": "Insulin Lispo (Humalog)",
    "dosage": "5 units subcutaneously before each meal",
    "reminders": [
        {"time_of_consumption": "Sat Oct 12 2024 07:00:00 GMT-0400 (Eastern Daylight Time)", "reminder_mode": "Phone Call"},
    ],
    "total_doses": 3,
    "doses_taken": 2
    }
