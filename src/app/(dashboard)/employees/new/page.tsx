/**
 * New Employee Page
 */

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/shared/components/ui/button';
import { EmployeeForm } from '@/features/employees/ui/components/EmployeeForm';
import { useCreateEmployee } from '@/features/employees/ui/hooks/useEmployees';

export default function NewEmployeePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const createMutation = useCreateEmployee();

  const handleSubmit = async (data: Parameters<typeof createMutation.mutateAsync>[0]) => {
    setError(null);
    try {
      await createMutation.mutateAsync(data);
      router.push('/employees');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create employee');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/employees">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New Employee</h1>
          <p className="text-muted-foreground">Add a new team member</p>
        </div>
      </div>
      <div className="max-w-2xl">
        <EmployeeForm onSubmit={handleSubmit} isLoading={createMutation.isPending} error={error} mode="create" />
      </div>
    </div>
  );
}
