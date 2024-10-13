'use server';

async function scheduleReminder(patientId, reminderTime) {
  const response = await fetch('http://localhost:8000/api/schedule', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ patient_id: patientId, reminder_time: reminderTime })
  });
  const data = await response.json();
  return data;
}
