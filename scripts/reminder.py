import requests
import time
from datetime import datetime
class Patient:
    def __init__(self, data):
        self.id = data["id"]
        self.first_name = data["first_name"]
        self.last_name = data["last_name"]
        self.gender = data["gender"]
        self.phone_number = data["phone_number"]
        self.medical_conditions = data["medical_conditions"]
        self.medications = data["medications"]
        self.total_doses = data["total_doses"]
        self.doses_taken = data["doses_taken"]
    
    def generate_patient_data_string(self):
        return f"Patient name: {self.first_name} {self.last_name}\nGender: {self.gender}\nMedical conditions: {', '.join(self.medical_conditions)}\nMedications for today:\n{'\n'.join([f'{med["name"]} {med["dosage"]} - {med["time"]}' for med in self.medications])}\nAdherance rate: {self.doses_taken/self.total_doses}"

class Reminder:
    def __init__(self):
        self.context = f"You are an automated medication reminder bot, scheduled to remind your patient the appropriate dosage at the correct times of the day.\nYour job is to inform your patient about the drug that they have to consume and the quantity, and ensure that they affirm that they have consumed their medication.\nThe current time is {self._current_time}, instruct the patient on what medication to consume. Your patient may have memory difficulty so be patient with making sure they understand the reminder. \nOnce the customer acknowledges the reminder, say \"Please let me know when you have consumed your medication\".\nProceed to wait for 10 seconds for the customer to consume their medication.\n Upon receiving confirmation that they have consumed their medication, end the call immediately.\n"
        self.phone_number_id = '79502138-40a6-45d6-8e7e-25f76f37ac37'
        self.auth_token = 'ca979fc4-5476-407a-b8d2-73582ed4f285' # Your Vapi API Authorization token
        self.api_url = 'https://api.vapi.ai/call'
        self.call_id = None
    
    def request(self, patient):
        # Make the POST request to Vapi to create the phone call
        response = requests.request("POST",
            self._call_url(), headers=self._headers(), json=self._payload(patient))

        # Check if the request was successful and print the response
        if response.status_code == 201:
            print('Call created successfully')
            self.call_id = response.json()['id']
            return self.call_id
        else:
            print('Failed to create call')
            print(response.text)

    def _call_url(self):
        return f'{self.api_url}/phone'

    def _get_analysis(self, call_id):
        # query call by call_id
        response = requests.request("GET", f'{self.api_url}', headers=self._headers())
        for call in response.json():
            if call.get('id') == call_id:
                analysis = call.get('analysis')
                if analysis:
                    return analysis.get('successEvaluation')
                else:
                    print('No analysis found')
                    return None


    def _current_time(self):
        return datetime.now().strftime("%H:%M")

    def _headers(self):
        return {
            'Authorization': f'Bearer {self.auth_token}',
            'Content-Type': 'application/json',
        }
    
    def _payload(self, patient):
        return {
            'assistant': {
                "firstMessage": f"Hi {patient.first_name}! This is your medication reminder. Do you know what medication to take?",
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
                "endCallPhrases": ["I have consumed my medication", "I do not want to take my medication", "I have already taken my medication", "I took my medication", "I have taken my medication", "I have consumed my medicine", "I have taken my medicine", "I have taken my pills"],
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
