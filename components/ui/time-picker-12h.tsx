import * as React from 'react';
import { Label } from '@/components/ui/label';
import { TimePickerInput } from './time-picker-input';
import { TimePeriodSelect } from './period-select';
import { Period } from './time-picker-utils';

interface TimePickerDemoProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export function TimePicker12Demo({ date, setDate }: TimePickerDemoProps) {
  // Initialize the period based on the provided date
  const [period, setPeriod] = React.useState<Period>(() => {
    if (date) {
      const hours = date.getHours();
      return hours >= 12 ? 'PM' : 'AM';
    }
    return 'AM';
  });

  const minuteRef = React.useRef<HTMLInputElement>(null);
  const hourRef = React.useRef<HTMLInputElement>(null);
  const secondRef = React.useRef<HTMLInputElement>(null);
  const periodRef = React.useRef<HTMLButtonElement>(null);

  // Function to handle changes in time and period
  const updateTime = (
    newHours: number,
    newMinutes: number,
    newSeconds: number
  ) => {
    const newDate = new Date(date || Date.now());
    newDate.setHours(newHours);
    newDate.setMinutes(newMinutes);
    newDate.setSeconds(newSeconds);
    setDate(newDate);
  };

  // Function to update the period based on the hour
  React.useEffect(() => {
    if (date) {
      const hours = date.getHours();
      setPeriod(hours >= 12 ? 'PM' : 'AM');
    }
  }, [date]);

  return (
    <div className="flex items-start gap-2">
      <div className="grid gap-1 text-center">
        <Label htmlFor="hours" className="text-xs">
          Hours
        </Label>
        <TimePickerInput
          picker="12hours"
          period={period}
          date={date}
          setDate={(updatedDate) => {
            setDate(updatedDate);
            const hours = updatedDate.getHours();
            setPeriod(hours >= 12 ? 'PM' : 'AM'); // Update period based on the new time
          }}
          ref={hourRef}
          onRightFocus={() => minuteRef.current?.focus()}
        />
      </div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="minutes" className="text-xs">
          Minutes
        </Label>
        <TimePickerInput
          picker="minutes"
          id="minutes12"
          date={date}
          setDate={setDate}
          ref={minuteRef}
          onLeftFocus={() => hourRef.current?.focus()}
          onRightFocus={() => secondRef.current?.focus()}
        />
      </div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="seconds" className="text-xs">
          Seconds
        </Label>
        <TimePickerInput
          picker="seconds"
          id="seconds12"
          date={date}
          setDate={setDate}
          ref={secondRef}
          onLeftFocus={() => minuteRef.current?.focus()}
          onRightFocus={() => periodRef.current?.focus()}
        />
      </div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="period" className="text-xs">
          Period
        </Label>
        <TimePeriodSelect
          period={period}
          setPeriod={(newPeriod) => {
            setPeriod(newPeriod);
            const hours = date?.getHours() || 0;
            let newHours = hours;

            if (newPeriod === 'PM' && hours < 12) {
              newHours += 12;
            } else if (newPeriod === 'AM' && hours >= 12) {
              newHours -= 12;
            }

            const minutes = date?.getMinutes() || 0;
            const seconds = date?.getSeconds() || 0;
            updateTime(newHours, minutes, seconds); // Update the time based on the selected period
          }}
          date={date}
          setDate={setDate}
          ref={periodRef}
          onLeftFocus={() => secondRef.current?.focus()}
        />
      </div>
    </div>
  );
}
