'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TimePicker } from '@/components/ui/time-picker-12h';

export default function PrescriptionForm() {
  const form = useForm({
    defaultValues: {
      prescription: '',
      medication: '',
      dosage: '',
      time_of_consumption: '',
      reminder_mode: 'Text Message'
    }
  });

  const [aiGenerated, setAiGenerated] = React.useState(false);

  // Simulated AI response - in real case you'd use GPT API here
  const handleAiGeneration = async (prescriptionText: string) => {
    // Example AI-generated data (replace with real OpenAI API call)
    const aiResponse = {
      medication: 'Paracetamol',
      dosage: '500mg',
      time_of_consumption: '08:00 AM',
      reminder_mode: 'Phone Call'
    };

    // Populate the form with AI-generated suggestions
    form.setValue('medication', aiResponse.medication);
    form.setValue('dosage', aiResponse.dosage);
    form.setValue('time_of_consumption', aiResponse.time_of_consumption);
    form.setValue('reminder_mode', aiResponse.reminder_mode);
    setAiGenerated(true);
  };

  const onSubmit = (data: any) => {
    console.log('Form Submitted:', data);
  };

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          Prescription
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Prescription Input */}
          <div>
            <label className="mb-2 block font-bold">Prescription</label>
            <Textarea
              placeholder="Enter the prescription details"
              {...form.register('prescription')}
            />
            <Button
              type="button"
              className="mt-4"
              onClick={() => handleAiGeneration(form.getValues('prescription'))}
            >
              Generate AI Suggestions
            </Button>
          </div>

          {/* AI-Generated Editable Fields */}
          {aiGenerated && (
            <>
              {/* Medication Field */}
              <div>
                <label className="mb-2 block font-bold">Medication</label>
                <Input
                  placeholder="Enter medication name"
                  {...form.register('medication')}
                />
              </div>

              {/* Dosage Field */}
              <div>
                <label className="mb-2 block font-bold">Dosage</label>
                <Input
                  placeholder="Enter dosage"
                  {...form.register('dosage')}
                />
              </div>

              {/* Time of Consumption Field */}
              <div>
                <label className="mb-2 block font-bold">
                  Time of Consumption
                </label>
                <TimePicker
                  value={form.getValues('time_of_consumption')}
                  onChange={(value) =>
                    form.setValue('time_of_consumption', value)
                  }
                />
              </div>

              {/* Reminder Mode Field */}
              <div>
                <label className="mb-2 block font-bold">Reminder Mode</label>
                <Select
                  onValueChange={(value) =>
                    form.setValue('reminder_mode', value)
                  }
                  value={form.getValues('reminder_mode')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reminder mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Phone Call">Phone Call</SelectItem>
                    <SelectItem value="Text Message">Text Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Save Button */}
          <Button type="submit">Save</Button>
        </form>
      </CardContent>
    </Card>
  );
}
