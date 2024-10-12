export interface PatientData {
  id: string;
  fullname: string;
  gender: string;
  age: number;
  phoneNumber: string;
  medicalConditions: string[];
  totalDosesToConsume?: number;
  totalConsumedDoses?: number;
}
