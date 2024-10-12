import { getAllPatients } from '@/lib/patientData';
import { searchParamsCache } from '@/lib/searchparams';
import { EmployeeListingPage } from '@/sections/employee/views';
import { PatientData } from '@/types/patient';
import { SearchParams } from 'nuqs/parsers';
import React from 'react';

type pageProps = {
  searchParams: SearchParams;
};

export const metadata = {
  title: 'Dashboard : Employees'
};

export default async function Page({ searchParams }: pageProps) {
  // Allow nested RSCs to access the search params (in a type-safe way)
  searchParamsCache.parse(searchParams);

  const patients: PatientData[] = await getAllPatients();

  return <EmployeeListingPage patients={patients} />;
}
