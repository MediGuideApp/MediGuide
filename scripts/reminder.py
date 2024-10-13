import requests
import time
from datetime import datetime
import pytz

class Patient:
    def __init__(self, data):
        full_name = data["fullname"].split()
        self.first_name = full_name[0]
        self.last_name = full_name[1] if len(full_name) > 1 else ''
        self.gender = data["gender"]
        self.phone_number = '+' + data["phoneNumber"]
        self.medical_conditions = data["medicalConditions"]
        self.medications = data["medication"]
        self.consumed_doses = int(data["consumedDoses"])

class Reminder:
    def __init__(self, data):
        self.reminders = data.get('reminders', [])
        self.context = f"""
            You are an automated medication reminder bot, scheduled to remind your patient the appropriate dosage at the correct times of the day.

            Given this patient data: {data},

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
        self.phone_number_id = '79502138-40a6-45d6-8e7e-25f76f37ac37'
        self.auth_token = 'ca979fc4-5476-407a-b8d2-73582ed4f285'
        self.api_url = 'https://api.vapi.ai/call'
        self.call_id = None
    
    def request(self, patient):
        # Make the POST request to Vapi to create the phone call
        response = requests.request("POST",
            self._call_url(), headers=self._headers(), json=self._payload(patient))

        # Check if the request was successful and print the response and returns to next app
        if response.status_code == 201:
            print('Call created successfully')
            print(response.json())
            self.call_id = response.json()['id']
            evaluation = self._get_analysis(self.call_id, patient)
            print(evaluation)
            print({
                'call_id': self.call_id,
                'evaluation': evaluation,
                'doses_taken': patient.consumed_doses
            })
            return {
                'call_id': self.call_id,
                'evaluation': evaluation,
                'doses_taken': patient.consumed_doses
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
        print(f'Patient before taking their medication, doses taken: {patient.consumed_doses}')
        if evaluation == 'true':
            patient.consumed_doses += 1
            print(f'Patient has taken their medication, doses taken: {patient.consumed_doses}')
        else:
            print(f'Patient has not taken their medication. Doses taken: {patient.consumed_doses}')

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
                            "content": self.context
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
        {"time_of_consumption": "08:00", "reminder_mode": "Phone Call"},
        {"time_of_consumption": "12:00", "reminder_mode": "Phone Call"},
        {"time_of_consumption": "16:00", "reminder_mode": "Phone Call"},
        {"time_of_consumption": "22:00", "reminder_mode": "Phone Call"},
    ],
    "consumedDoses": 2
    }
