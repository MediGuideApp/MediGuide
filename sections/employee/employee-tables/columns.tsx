'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { PatientData } from '@/types/patient';

export const columns: ColumnDef<PatientData>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'fullname',
    header: 'NAME'
  },
  {
    accessorKey: 'age',
    header: 'AGE'
  },
  {
    accessorKey: 'gender',
    header: 'GENDER'
  },
  {
    accessorKey: 'medicalConditions',
    header: 'CONDITION'
  },
  {
    accessorKey: 'phoneNumber',
    header: 'PHONE'
  },
  {
    id: 'adherenceScore',
    header: 'ADHERENCE SCORE',
    cell: ({ row }) => {
      const totalConsumedDoses = row.original.totalConsumedDoses || 0;
      const totalDosesToConsume = row.original.totalDosesToConsume || 0;
      const adherenceScore =
        totalDosesToConsume > 0
          ? totalConsumedDoses > 0
            ? (totalConsumedDoses / totalDosesToConsume) * 100
            : 0
          : -1;
      return (
        <span>
          {adherenceScore < 0 ? '-' : `${adherenceScore.toFixed(2)}%`}
        </span>
      );
    }
  },
  {
    id: 'prescription',
    cell: ({ row }) => {
      const fullname = row.original.fullname;
      const gender = row.original.gender;
      const phoneNumber = row.original.phoneNumber;
      const medicalConditions = row.original.medicalConditions;
      const totalConsumedDoses = row.original.totalConsumedDoses || 0;
      return (
        <Link
          href={`/dashboard/employee/prescription?fullname=${fullname}&consumedDoses=${totalConsumedDoses}&gender=${gender}&phone=${phoneNumber}&conditions=${medicalConditions}`}
          className={cn(buttonVariants({ variant: 'default' }))}
        >
          Prescription
        </Link>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
