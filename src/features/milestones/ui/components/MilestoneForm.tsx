/**
 * Milestone Form Component
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

import { milestoneFormSchema, milestoneStatusOptions, type MilestoneFormData, transformMilestoneInput } from '../../domain/schemas';
import type { ProjectMilestone } from '@/shared/base-feature/domain/database.types';

interface MilestoneFormProps {
  defaultValues?: Partial<ProjectMilestone>;
  projects: { id: string; project_name: string }[];
  onSubmit: (data: ReturnType<typeof transformMilestoneInput>) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  mode?: 'create' | 'edit';
}

export function MilestoneForm({
  defaultValues,
  projects,
  onSubmit,
  isLoading = false,
  error = null,
  mode = 'create',
}: MilestoneFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MilestoneFormData>({
    resolver: zodResolver(milestoneFormSchema),
    defaultValues: {
      project_id: defaultValues?.project_id ?? '',
      milestone: defaultValues?.milestone ?? '',
      description: defaultValues?.description ?? '',
      due_date: defaultValues?.due_date ?? '',
      completion_date: defaultValues?.completion_date ?? '',
      status: defaultValues?.status ?? 'pending',
      remarks: defaultValues?.remarks ?? '',
    },
  });

  const currentStatus = watch('status');
  const currentProjectId = watch('project_id');

  const handleFormSubmit = async (data: MilestoneFormData) => {
    const transformed = transformMilestoneInput(data);
    await onSubmit(transformed);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'New Milestone' : 'Edit Milestone'}</CardTitle>
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
              <Label htmlFor="milestone">Milestone Name *</Label>
              <Input id="milestone" placeholder="Milestone name" {...register('milestone')} />
              {errors.milestone && <p className="text-sm text-destructive">{errors.milestone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="project_id">Project *</Label>
              <Select value={currentProjectId} onValueChange={(value) => setValue('project_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.project_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.project_id && <p className="text-sm text-destructive">{errors.project_id.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Milestone description" {...register('description')} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={currentStatus} onValueChange={(value) => setValue('status', value as typeof currentStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {milestoneStatusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input id="due_date" type="date" {...register('due_date')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="completion_date">Completion Date</Label>
              <Input id="completion_date" type="date" {...register('completion_date')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea id="remarks" placeholder="Additional remarks" {...register('remarks')} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="submit" disabled={isLoading || isSubmitting}>
              {(isLoading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Create Milestone' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
