/**
 * Employee Form Component
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

import { employeeFormSchema, employeeStatusOptions, type EmployeeFormData, transformEmployeeInput } from '../../domain/schemas';
import { sanitizeFormData } from '@/shared/utils/sanitize';
import type { Employee } from '@/shared/types/database.types';

interface EmployeeFormProps {
  defaultValues?: Partial<Employee>;
  onSubmit: (data: ReturnType<typeof transformEmployeeInput>) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  mode?: 'create' | 'edit';
}

export function EmployeeForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  error = null,
  mode = 'create',
}: EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      email: defaultValues?.email ?? '',
      phone: defaultValues?.phone ?? '',
      position: defaultValues?.position ?? '',
      department: defaultValues?.department ?? '',
      hire_date: defaultValues?.hire_date ?? '',
      status: defaultValues?.status ?? 'active',
      salary: defaultValues?.salary?.toString() ?? '',
    },
  });

  const currentStatus = watch('status');

  const handleFormSubmit = async (data: EmployeeFormData) => {
    const sanitized = sanitizeFormData(data);
    const transformed = transformEmployeeInput(sanitized);
    await onSubmit(transformed);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'New Employee' : 'Edit Employee'}</CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" placeholder="Employee name" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" placeholder="employee@example.com" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="+1 (555) 000-0000" {...register('phone')} />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Input id="position" placeholder="Job title" {...register('position')} />
              {errors.position && <p className="text-sm text-destructive">{errors.position.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Input id="department" placeholder="Department" {...register('department')} />
              {errors.department && <p className="text-sm text-destructive">{errors.department.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={currentStatus}
                onValueChange={(value) => setValue('status', value as typeof currentStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {employeeStatusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hire_date">Hire Date</Label>
              <Input id="hire_date" type="date" {...register('hire_date')} />
              {errors.hire_date && <p className="text-sm text-destructive">{errors.hire_date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">Salary</Label>
              <Input id="salary" type="number" placeholder="0.00" {...register('salary')} />
              {errors.salary && <p className="text-sm text-destructive">{errors.salary.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="submit" disabled={isLoading || isSubmitting}>
              {(isLoading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Create Employee' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
