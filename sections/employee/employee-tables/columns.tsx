'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Employee } from '@/constants/data';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';

export const columns: ColumnDef<Employee>[] = [
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
    accessorKey: 'first_name',
    header: 'NAME'
  },
  {
    accessorKey: 'age',
    header: 'AGE'
  },
  {
    accessorKey: 'date_of_birth',
    header: 'DATE OF BIRTH'
  },
  {
    accessorKey: 'gender',
    header: 'GENDER'
  },
  {
    accessorKey: 'medical_condition',
    header: 'CONDITION'
  },
  {
    accessorKey: 'phone',
    header: 'PHONE'
  },
  {
    id: 'prescription',
    cell: ({ row }) => <Button variant="outline">Prescription</Button>
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
