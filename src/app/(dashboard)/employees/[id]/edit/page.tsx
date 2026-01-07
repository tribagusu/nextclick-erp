/**
 * Edit Employee Page
 */

'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { EmployeeForm } from '@/features/employees/ui/components/EmployeeForm';
import { useEmployee, useUpdateEmployee } from '@/features/employees/ui/hooks/useEmployees';

interface EditEmployeePageProps {
  params: Promise<{ id: string }>;
}

export default function EditEmployeePage({ params }: EditEmployeePageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  
  const { data: employee, isLoading } = useEmployee(id);
  const updateMutation = useUpdateEmployee();

  const handleSubmit = async (data: {
    name: string;
    email: string | null;
    phone: string | null;
    position: string | null;
    department: string | null;
    hire_date: string | null;
    status?: 'active' | 'inactive' | 'on_leave';
    salary: number | null;
  }) => {
    setError(null);
    try {
      await updateMutation.mutateAsync({ id, ...data, status: data.status ?? 'active' });
      router.push(`/employees/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update employee');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-96 w-full max-w-2xl" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6">
        <div className="rounded-md border p-4">
          <p className="text-muted-foreground">Employee not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/employees/${id}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Employee</h1>
          <p className="text-muted-foreground">Update employee information</p>
        </div>
      </div>
      <div className="max-w-2xl">
        <EmployeeForm defaultValues={employee} onSubmit={handleSubmit} isLoading={updateMutation.isPending} error={error} mode="edit" />
      </div>
    </div>
  );
}
