'use server';

import { PatientData } from '@/types/patient';
import { Prescription, PrismaClient } from '@prisma/client';

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

export async function updatePatientDosesTakenAndPrescriptions(
  phoneNumber: string,
  dosage: number
  //   prescriptions: Prescription[]
) {
  const patients = await getAllPatients();
  const patient = patients.find((p) => p.phoneNumber === phoneNumber);
  if (patient) {
    // Patient found, update the doses taken
    patient.totalConsumedDoses = (patient.totalConsumedDoses || 0) + dosage;
    patient.totalDosesToConsume = (patient.totalDosesToConsume || 0) + 1;
    // const updatedPrescriptions: Prescription[] = prescriptions.map(prescription => ({
    //     ...prescription,
    //     patientId: patient.id
    //   }));
    // Here you would typically update the patient data in your database
    await prisma.patient.update({
      where: {
        id: patient.id
      },
      data: {
        totalConsumedDoses: dosage,
        totalDosesToConsume: patient.totalDosesToConsume
        // medications: updatedPrescriptions
      }
    });
    return patient;
  } else {
    throw new Error(`Patient with phone number ${phoneNumber} not found`);
  }
}
