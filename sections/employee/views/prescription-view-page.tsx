import { Breadcrumbs } from '@/components/breadcrumbs';
import { ScrollArea } from '@/components/ui/scroll-area';
import PrescriptionForm from '../employee-prescription';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Patients', link: '/dashboard/employee' },
  { title: 'Create', link: '/dashboard/employee/create' }
];

export default function PrescriptionViewPage() {
  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-8">
        <Breadcrumbs items={breadcrumbItems} />
        <PrescriptionForm />
      </div>
    </ScrollArea>
  );
}
