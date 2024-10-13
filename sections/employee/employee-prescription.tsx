'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FaRegBell } from 'react-icons/fa';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TimePicker12Demo } from '@/components/ui/time-picker-12h';
import { Separator } from '@/components/ui/separator';
import generateReminders from './generateReminders';
import { ScrollArea } from '@/components/ui/scroll-area';

// Reminder component for time of consumption and reminder mode
function Reminder({
  reminder,
  onUpdateReminder,
  onDelete
}: {
  reminder: { time_of_consumption: Date | undefined; reminder_mode: string };
  onUpdateReminder: (updatedReminder: any) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-row items-center gap-8">
      <FaRegBell className="h-6 w-6 text-gray-500" />
      <div className="flex flex-col">
        <label
          htmlFor="timeOfConsumption"
          className="block text-sm font-medium text-gray-700"
        >
          Time of Consumption
        </label>
        <TimePicker12Demo
          date={reminder.time_of_consumption}
          setDate={(date) =>
            onUpdateReminder({ ...reminder, time_of_consumption: date })
          }
        />
      </div>
      <div className="flex flex-col">
        <label
          htmlFor="reminderMode"
          className="block text-sm font-medium text-gray-700"
        >
          Reminder Mode
        </label>
        <Select
          value={reminder.reminder_mode}
          onValueChange={(value) =>
            onUpdateReminder({ ...reminder, reminder_mode: value })
          }
        >
          <SelectTrigger>
            <SelectValue>{reminder.reminder_mode}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Text Message">Text Message</SelectItem>
            <SelectItem value="Phone Call">Phone Call</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        variant="outline"
        type="button"
        className="ml-4"
        onClick={onDelete}
      >
        Remove
      </Button>
    </div>
  );
}

export default function PrescriptionForm() {
  const [prescription, setPrescription] = React.useState('');
  const [aiGenerated, setAiGenerated] = React.useState(false);
  const [medication, setMedication] = React.useState('');
  const [dosage, setDosage] = React.useState('');
  const [reminders, setReminders] = React.useState<
    { time_of_consumption: Date | undefined; reminder_mode: string }[]
  >([{ time_of_consumption: undefined, reminder_mode: 'Text Message' }]);

  // Simulated AI response - in real case you'd use GPT API here
  const handleAiGeneration = async () => {
    if (!prescription) {
      alert('Please enter a prescription.');
      return;
    }

    try {
      const response = await generateReminders(prescription);

      setMedication(response.medication);
      setDosage(response.dosage);
      setReminders(
        response.reminders.map((reminder: any) => ({
          time_of_consumption: new Date(reminder.time_of_consumption),
          reminder_mode: reminder.reminder_mode
        }))
      );
    } catch (error) {
      console.error(
        'Error generating reminders:',
        error.response ? error.response.data : error.message
      );
      alert('Failed to generate reminders. Please try again.');
    }
  };

  const handleAddReminder = () => {
    setReminders((prevReminders) => [
      ...prevReminders,
      { time_of_consumption: undefined, reminder_mode: 'Phone Call' }
    ]);
  };

  const handleUpdateReminder = (index: number, updatedReminder: any) => {
    setReminders((prevReminders) =>
      prevReminders.map((reminder, i) =>
        i === index ? updatedReminder : reminder
      )
    );
  };

  const handleDeleteReminder = (index: number) => {
    setReminders((prevReminders) =>
      prevReminders.filter((_, i) => i !== index)
    );
  };
  const onSubmit = (data: any) => {
    console.log('Form Submitted:', { medication, dosage, reminders });
    alert('Form Submitted!');
  };

  return (
    <Card className="mx-auto w-full">
      <ScrollArea className="h-[80svh]">
        <CardHeader>
          <CardTitle className="text-left text-2xl font-bold">
            Prescription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="prescription"
            name="prescription"
            value={prescription}
            onChange={(e) => setPrescription(e.target.value)}
            placeholder="Enter the prescription details"
            rows={6}
          />
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAiGeneration}
            >
              Generate Reminders
            </Button>
          </div>
          <form onSubmit={onSubmit}>
            <Card className="flex flex-col gap-8 p-8">
              <div className="flex flex-row gap-4">
                <div className="w-[30svw]">
                  <label
                    htmlFor="medication"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Medication
                  </label>
                  <Input
                    id="medication"
                    name="medication"
                    value={medication}
                    onChange={(e) => setMedication(e.target.value)}
                    placeholder="Enter medication"
                  />
                </div>
                <div className="w-full">
                  <label
                    htmlFor="dosage"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Dosage
                  </label>
                  <Input
                    id="dosage"
                    name="dosage"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="Enter dosage"
                  />
                </div>
              </div>

              <Separator />

              {/* Reminder List */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-row items-center justify-between">
                  <h4 className="text-lg font-bold">Reminders</h4>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleAddReminder}
                  >
                    Add Reminder
                  </Button>
                </div>

                {reminders.map((reminder, index) => (
                  <Reminder
                    key={index}
                    reminder={reminder}
                    onUpdateReminder={(updatedReminder) =>
                      handleUpdateReminder(index, updatedReminder)
                    }
                    onDelete={() => handleDeleteReminder(index)}
                  />
                ))}
              </div>
            </Card>

            <div>
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
