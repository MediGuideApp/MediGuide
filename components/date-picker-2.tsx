'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from './calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Props {
  initialDate?: Date;
  onChange: (date: Date | undefined) => void; // Added onChange prop for form field integration
}

export function DatePicker({ initialDate, onChange }: Props) {
  const [date, setDate] = useState<Date | undefined>(initialDate);
  const [stringDate, setStringDate] = useState(
    initialDate ? format(initialDate, 'PPP') : ''
  );
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setStringDate(selectedDate ? format(selectedDate, 'PPP') : '');
    setErrorMessage('');
    onChange(selectedDate); // Update the parent form with the selected date
  };

  return (
    <Popover>
      <div className="relative w-[280px]">
        <Input
          type="string"
          placeholder="MM/DD/YYYY"
          value={stringDate}
          onFocus={() => {
            if (date) setStringDate(format(date, 'MM/dd/yyyy'));
          }}
          onChange={(e) => {
            setStringDate(e.target.value);
          }}
          onBlur={(e) => {
            const parsedDate = parse(e.target.value, 'MM/dd/yyyy', new Date());
            if (isNaN(parsedDate.getTime())) {
              setErrorMessage('Invalid Date');
            } else {
              handleDateChange(parsedDate);
            }
          }}
        />
        {errorMessage && (
          <div className="absolute bottom-[-1.75rem] left-0 text-sm text-red-400">
            {errorMessage}
          </div>
        )}
        <PopoverTrigger asChild>
          <Button
            variant={'outline'}
            className={cn(
              'absolute right-0 top-[50%] translate-y-[-50%] rounded-l-none font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent align="end" className="w-auto p-0">
        <Calendar
          mode="single"
          captionLayout="dropdown-buttons"
          selected={date}
          defaultMonth={date}
          onSelect={handleDateChange}
          fromYear={1960}
          toYear={2030}
        />
      </PopoverContent>
    </Popover>
  );
}
