'use server';

import OpenAI from 'openai';

export default async function generateReminders(prescription: any) {
  if (!process.env.OPENAI_API_KEY) throw new Error('No OPENAI_API_KEY set');

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const functionDefinition = {
      name: 'generate_medication_reminders',
      description: 'Generate medication reminders from a prescription',
      parameters: {
        type: 'object',
        properties: {
          medication: { type: 'string' },
          dosage: { type: 'string' },
          reminders: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                time_of_consumption: { type: 'string' },
                reminder_mode: {
                  type: 'string',
                  enum: ['Phone Call', 'Text Message']
                }
              }
            }
          }
        },
        required: ['medication', 'dosage', 'reminders']
      }
    };

    const response = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are an assistant that generates medication reminders from a prescription.'
        },
        {
          role: 'user',
          content: `Here is a prescription: "${prescription}". Generate medication, dosage, and reminders with times. Format the output as an object like this: 
            {
              medication: 'Paracetamol',
              dosage: '500mg, twice a day after meals',
              reminders: [
                { time_of_consumption: '12:00 PM', reminder_mode: 'Phone Call' },
                { time_of_consumption: '06:00 PM', reminder_mode: 'Phone Call' }
              ]
            }`
        }
      ],
      model: 'gpt-4o-mini',
      functions: [functionDefinition],
      function_call: { name: 'generate_medication_reminders' },
      max_completion_tokens: 5000
    });

    const functionCall = response.choices[0]?.message?.function_call;

    if (functionCall && functionCall.name === 'generate_medication_reminders') {
      const functionArguments = JSON.parse(functionCall.arguments || '{}');
      return functionArguments;
    }
  } catch (error) {
    console.error('Error generating reminders:', error);
    return '';
  }
}
