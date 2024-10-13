'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FaRegBell } from 'react-icons/fa';
import { MdSchedule } from 'react-icons/md';
import { IoCallSharp } from 'react-icons/io5';
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
import { useSearchParams } from 'next/navigation';
import { updatePatientDosesTakenAndPrescriptions } from '@/lib/patientData';
import { Mode, Prescription } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

function convertToETTime(timeInput: Date | string, testDate?: boolean): string {
  let dateObj: Date;

  if (testDate) {
    // Return a date 5 seconds from now
    dateObj = new Date(Date.now() + 5000); // 5 seconds from now
  } else {
    if (typeof timeInput === 'string') {
      // Assuming timeInput is in 'HH:MM' format
      const [hours, minutes] = timeInput.split(':').map(Number);
      const now = new Date();
      dateObj = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes
      );
    } else {
      dateObj = timeInput;
    }
  }

  // Convert dateObj to Eastern Time
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  const etTimeString = dateObj.toLocaleTimeString('en-US', options);

  return etTimeString; // Returns 'HH:MM' format
}

function convertTimeStringToDate(timeString: string): Date {
  console.log('timeString:', timeString);
  // Get the current date
  const currentDate = new Date();

  // Split the time string and extract hours, minutes, and AM/PM
  const [time, modifier] = timeString.split(' '); // Split into ["08:00", "AM"]
  let [hours, minutes] = time.split(':').map(Number); // Split "08:00" into hours and minutes

  // Adjust hours based on AM/PM
  if (modifier === 'PM' && hours !== 12) {
    // Convert PM hours (except for 12 PM, which is noon)
    hours += 12;
  } else if (modifier === 'AM' && hours === 12) {
    // Convert 12 AM to 0 hours (midnight)
    hours = 0;
  }

  // Set the hours and minutes to the current date
  currentDate.setHours(hours, minutes, 0, 0); // Set time on the date object (hours, minutes, seconds, milliseconds)
  console.log('currentDate:', currentDate);

  return currentDate;
}

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
  const [isLoading, setIsLoading] = React.useState(false);
  const [aiGenerated, setAiGenerated] = React.useState(false);
  const [medication, setMedication] = React.useState('');
  const [dosage, setDosage] = React.useState('');
  const [reminders, setReminders] = React.useState<
    { time_of_consumption: Date | undefined; reminder_mode: string }[]
  >([]);

  const searchParams = useSearchParams();
  const [patientData, setPatientData] = React.useState<any>(null);

  React.useEffect(() => {
    setPatientData({
      fullname: searchParams.get('fullname'),
      consumedDoses: searchParams.get('consumedDoses'),
      gender: searchParams.get('gender'),
      phoneNumber: searchParams.get('phone'),
      medicalConditions: searchParams.get('conditions')
    });
  }, [searchParams]);

  // Simulated AI response - in real case you'd use GPT API here
  const handleAiGeneration = async () => {
    setIsLoading(true);
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
          time_of_consumption: convertTimeStringToDate(
            reminder.time_of_consumption
          ),
          reminder_mode: reminder.reminder_mode
        }))
      );
      setIsLoading(false);
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

  const onSubmit = async (testDate?: boolean) => {
    const parsedReminders = reminders.map((reminder) => {
      let timeString: string | undefined = undefined;

      if (reminder.time_of_consumption) {
        if (testDate) {
          // For test, get the time 5 seconds from now in 'HH:MM' format
          timeString = convertToETTime(reminder.time_of_consumption, true);
        } else {
          // Assuming reminder.time_of_consumption is a Date object
          const hours = reminder.time_of_consumption
            .getHours()
            .toString()
            .padStart(2, '0');
          const minutes = reminder.time_of_consumption
            .getMinutes()
            .toString()
            .padStart(2, '0');
          timeString = convertToETTime(`${hours}:${minutes}`);
        }
      }

      return {
        ...reminder,
        time_of_consumption: timeString
      };
    });

    const prescriptionData = {
      ...patientData,
      medication,
      dosage,
      reminders: parsedReminders
    };

    console.log('Form Submitted:', prescriptionData);

    try {
      const scheduleResponse = await fetch(
        'http://localhost:8000/api/schedule',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(prescriptionData)
        }
      );

      if (scheduleResponse.ok) {
        const { job_id } = await scheduleResponse.json();
        console.log('Prescription scheduled successfully. Job ID:', job_id);

        // Poll for job status
        const result = await pollJobStatus(job_id);
        console.log('Final result:', result);

        // Access doses_taken
        if (result.results && result.results.length > 0) {
          const trimmedPhoneNumber = '+' + prescriptionData.phoneNumber.trim();
          const { reminder_mode } = parsedReminders[0];
          const allTimes = parsedReminders
            .map((r) => r.time_of_consumption)
            .filter((time): time is string => time !== undefined);
          await updatePatientDosesTakenAndPrescriptions(
            trimmedPhoneNumber,
            result.results[0].doses_taken
          );
        }
      } else {
        console.log('Failed to schedule prescription. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting prescription:', error);
    }
  };

  async function pollJobStatus(
    jobId: string,
    maxAttempts = 60,
    interval = 5000
  ): Promise<any> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      console.log(`Polling job status for ${jobId}, attempt ${attempt + 1}`);
      const response = await fetch(
        `http://localhost:8000/api/job_status/${jobId}`
      );
      if (response.ok) {
        const result = await response.json();
        console.log(`Job status for ${jobId}:`, result);
        // Check if there are any results
        if (result.results && result.results.length > 0) {
          console.log(`Job ${jobId} has results. Stopping polling.`);
          return result;
        }
      } else {
        console.error(`Error polling job status: ${response.status}`);
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    throw new Error('Job timed out');
  }

  return (
    <Card className="mx-auto w-full">
      <ScrollArea className="h-[80svh]">
        <CardHeader>
          <CardTitle className="text-left text-2xl font-bold">
            Prescription
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-end gap-4">
          <Textarea
            id="prescription"
            name="prescription"
            value={prescription}
            onChange={(e) => setPrescription(e.target.value)}
            placeholder="Enter the prescription details"
            rows={6}
          />
          {isLoading ? (
            <div role="status">
              <svg
                aria-hidden="true"
                className="h-8 w-8 animate-spin fill-black text-gray-200 dark:text-gray-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          ) : (
            <div>
              <Button type="button" onClick={handleAiGeneration}>
                Generate Reminders
              </Button>
            </div>
          )}
          <form className="w-full">
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
                {reminders.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No reminders added yet. Please enter a prescription first.
                  </p>
                )}

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

            <div className="mt-4 flex flex-col items-end">
              <div className="flex flex-row gap-4">
                <Button
                  type="button"
                  className="gap-2 bg-emerald-500 text-white hover:bg-emerald-400"
                  onClick={() => onSubmit(true)}
                >
                  <IoCallSharp />
                  Test Call
                </Button>
                <Button
                  type="button"
                  className="gap-2"
                  onClick={() => onSubmit()}
                >
                  <MdSchedule />
                  Schedule
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
