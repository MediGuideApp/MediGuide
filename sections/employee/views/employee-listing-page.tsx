import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import EmployeeTable from '../employee-tables';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { searchParamsCache } from '@/lib/searchparams';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { PatientData } from '@/types/patient';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Patients', link: '/dashboard/patient' }
];

interface PatientListingPageProps {
  patients: PatientData[];
}
export default async function EmployeeListingPage(
  props: PatientListingPageProps
) {
  const { patients } = props;

  // Showcasing the use of search params cache in nested RSCs
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('q');
  const gender = searchParamsCache.get('gender');
  const pageLimit = searchParamsCache.get('limit');

  const filters = {
    page,
    limit: pageLimit,
    ...(search && { search }),
    ...(gender && { genders: gender })
  };

  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading
            title={`Patients (${patients.length})`}
            description="Manage patients"
          />

          <Link
            href={'/dashboard/employee/new'}
            className={cn(buttonVariants({ variant: 'default' }))}
          >
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Link>

          <Link
            href={'/dashboard/employee/prescription'}
            className={cn(buttonVariants({ variant: 'default' }))}
          >
            Prescription
          </Link>
        </div>
        <Separator />
        <EmployeeTable data={patients} totalData={patients.length} />
      </div>
    </PageContainer>
  );
}
