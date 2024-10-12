'use server';

import { PatientData } from '@/types/patient';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAllPatients(): Promise<PatientData[]> {
  return await prisma.patient.findMany();
}

export async function savePatient(patientData: PatientData) {
  try {
    const savedPatient = await prisma.patient.create({
      data: {
        id: patientData.id,
        fullname: patientData.fullname,
        gender: patientData.gender,
        age: patientData.age,
        phoneNumber: patientData.phoneNumber,
        medicalConditions: patientData.medicalConditions
      }
    });

    console.log('Patient saved successfully:', savedPatient);
    return savedPatient;
  } catch (error) {
    console.error('Error saving patient:', error);
    throw error; // Re-throw the error so the caller can handle it
  }
}
