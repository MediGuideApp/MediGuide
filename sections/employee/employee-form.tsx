'use client';

import * as React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/date-picker-2';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PatientData } from '@/types/patient';
import { savePatient } from '@/lib/patientData';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.'
  }),
  medical_condition: z.string().min(1, {
    message: 'Please enter a valid medical condition.'
  }),
  date_of_birth: z
    .date({
      required_error: 'Please enter a valid date of birth.',
      invalid_type_error: 'Invalid date format.'
    })
    .refine((date) => date <= new Date(), {
      message: 'Date of birth cannot be in the future.'
    }),
  phone: z
    .string()
    .min(10, { message: 'Phone number must be at least 10 digits.' }),
  gender: z.enum(['Male', 'Female', 'Other'], {
    required_error: 'Please select a gender.'
  })
});

export default function EmployeeForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      date_of_birth: undefined,
      medical_condition: '',
      phone: '',
      gender: undefined
    }
  });

  function calculateAge(dateOfBirth: Date): number {
    const diff = new Date().getTime() - new Date(dateOfBirth).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  async function savePatientData(values: z.infer<typeof formSchema>) {
    try {
      console.log('Form submitted with values:', values);

      const medicalConditionsArray = values.medical_condition
        .split(',')
        .map((condition) => condition.trim());

      const patientData: PatientData = {
        id: uuidv4(),
        fullname: values.name,
        gender: values.gender,
        age: calculateAge(values.date_of_birth),
        phoneNumber: values.phone,
        medicalConditions: medicalConditionsArray
      };

      console.log('Saving patient data:', patientData);
      await savePatient(patientData);
      console.log('Patient data saved successfully');

      // Optionally, reset the form or show a success message
      form.reset();
      router.push('/dashboard/employee');
      // You might want to add some UI feedback here, like a toast notification
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle the error, maybe show an error message to the user
    }
  }

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          Patient Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(savePatientData)}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter patient's name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="medical_condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical Condition</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter the medical condition"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* date of birth picker with datepicker on a newline below the form label*/}
              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block">Date of Birth</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input
                        type="phone"
                        placeholder="Enter patient's phone number"
                        pattern="[+0-9]+"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="Male" />
                        </FormControl>
                        <FormLabel className="font-normal">Male</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="Female" />
                        </FormControl>
                        <FormLabel className="font-normal">Female</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="Other" />
                        </FormControl>
                        <FormLabel className="font-normal">Other</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
