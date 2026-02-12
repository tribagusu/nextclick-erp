/**
 * Project Form Component
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

import { projectFormSchema, projectStatusOptions, projectPriorityOptions, type ProjectFormData, transformProjectInput } from '../../domain/schemas';
import type { Project } from '@/shared/base-feature/domain/database.types';

interface ProjectFormProps {
  defaultValues?: Partial<Project>;
  clients: { id: string; name: string }[];
  onSubmit: (data: ReturnType<typeof transformProjectInput>) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  mode?: 'create' | 'edit';
}

export function ProjectForm({
  defaultValues,
  clients,
  onSubmit,
  isLoading = false,
  error = null,
  mode = 'create',
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      project_name: defaultValues?.project_name ?? '',
      client_id: defaultValues?.client_id ?? '',
      description: defaultValues?.description ?? '',
      start_date: defaultValues?.start_date ?? '',
      end_date: defaultValues?.end_date ?? '',
      status: defaultValues?.status ?? 'draft',
      priority: defaultValues?.priority ?? 'medium',
      total_budget: defaultValues?.total_budget?.toString() ?? '',
      amount_paid: defaultValues?.amount_paid?.toString() ?? '',
      payment_terms: defaultValues?.payment_terms ?? '',
    },
  });

  const currentStatus = watch('status');
  const currentPriority = watch('priority');
  const currentClientId = watch('client_id');

  const handleFormSubmit = async (data: ProjectFormData) => {
    const transformed = transformProjectInput(data);
    await onSubmit(transformed);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'New Project' : 'Edit Project'}</CardTitle>
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
              <Label htmlFor="project_name">Project Name *</Label>
              <Input id="project_name" placeholder="Project name" {...register('project_name')} />
              {errors.project_name && <p className="text-sm text-destructive">{errors.project_name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_id">Client *</Label>
              <Select value={currentClientId} onValueChange={(value) => setValue('client_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.client_id && <p className="text-sm text-destructive">{errors.client_id.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Project description" {...register('description')} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={currentStatus} onValueChange={(value) => setValue('status', value as typeof currentStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projectStatusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={currentPriority} onValueChange={(value) => setValue('priority', value as typeof currentPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projectPriorityOptions.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input id="start_date" type="date" {...register('start_date')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input id="end_date" type="date" {...register('end_date')} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="total_budget">Total Budget</Label>
              <Input id="total_budget" type="number" placeholder="0.00" {...register('total_budget')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount_paid">Amount Paid</Label>
              <Input id="amount_paid" type="number" placeholder="0.00" {...register('amount_paid')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_terms">Payment Terms</Label>
              <Input id="payment_terms" placeholder="e.g., Net 30" {...register('payment_terms')} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="submit" disabled={isLoading || isSubmitting}>
              {(isLoading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Create Project' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
