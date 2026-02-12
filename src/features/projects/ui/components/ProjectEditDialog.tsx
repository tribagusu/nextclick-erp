/**
 * Project Edit Dialog Component
 *
 * Full dialog for editing projects (all 10 fields).
 */

'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { FormDialog } from '@/shared/components/ui/form-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

import { 
  projectFormSchema, 
  projectStatusOptions, 
  projectPriorityOptions, 
  type ProjectFormData 
} from '../../domain/schemas';
import { useUpdateProject } from '../hooks/useProjects';
import { useClients } from '@/features/clients/ui/hooks/useClients';
import type { Project } from '@/shared/base-feature/domain/database.types';

interface ProjectEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onSuccess?: () => void;
}

export function ProjectEditDialog({ open, onOpenChange, project, onSuccess }: ProjectEditDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const updateMutation = useUpdateProject();
  const { data: clientsData, isLoading: clientsLoading } = useClients({ pageSize: 100 });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      project_name: '',
      client_id: '',
      description: '',
      start_date: '',
      end_date: '',
      status: 'draft',
      priority: 'medium',
      total_budget: '',
      amount_paid: '',
      payment_terms: '',
    },
  });

  const currentStatus = watch('status');
  const currentPriority = watch('priority');
  const currentClientId = watch('client_id');

  // Update form values when project changes
  useEffect(() => {
    if (project) {
      reset({
        project_name: project.project_name ?? '',
        client_id: project.client_id ?? '',
        description: project.description ?? '',
        start_date: project.start_date ?? '',
        end_date: project.end_date ?? '',
        status: project.status ?? 'draft',
        priority: project.priority ?? 'medium',
        total_budget: project.total_budget?.toString() ?? '',
        amount_paid: project.amount_paid?.toString() ?? '',
        payment_terms: project.payment_terms ?? '',
      });
    }
  }, [project, reset]);

  const handleFormSubmit = async (data: ProjectFormData) => {
    if (!project) return;
    
    setError(null);
    try {
      // Pass form data directly, convert budget strings to numbers
      await updateMutation.mutateAsync({ 
        id: project.id,
        project_name: data.project_name,
        client_id: data.client_id,
        description: data.description || undefined,
        start_date: data.start_date || undefined,
        end_date: data.end_date || undefined,
        status: data.status,
        priority: data.priority,
        total_budget: data.total_budget ? parseFloat(data.total_budget) : undefined,
        amount_paid: data.amount_paid ? parseFloat(data.amount_paid) : undefined,
        payment_terms: data.payment_terms || undefined,
      });
      toast.success('Project updated successfully');
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update project');
      setError(err instanceof Error ? err.message : 'Failed to update project');
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setError(null);
    }
    onOpenChange(isOpen);
  };

  const isLoading = isSubmitting || updateMutation.isPending;

  return (
    <FormDialog
      open={open}
      onOpenChange={handleClose}
      title="Edit Project"
      description="Update project information"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="edit-project-name">Project Name *</Label>
            <Input
              id="edit-project-name"
              placeholder="Project name"
              {...register('project_name')}
            />
            {errors.project_name && (
              <p className="text-sm text-destructive">{errors.project_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-client">Client *</Label>
            <Select 
              value={currentClientId} 
              onValueChange={(value) => setValue('client_id', value)}
              disabled={clientsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={clientsLoading ? 'Loading...' : 'Select client'} />
              </SelectTrigger>
              <SelectContent>
                {clientsData?.clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.client_id && (
              <p className="text-sm text-destructive">{errors.client_id.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-description">Description</Label>
          <Textarea
            id="edit-description"
            placeholder="Project description"
            rows={3}
            {...register('description')}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select 
              value={currentStatus} 
              onValueChange={(value) => setValue('status', value as typeof currentStatus)}
            >
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
            <Label htmlFor="edit-priority">Priority</Label>
            <Select 
              value={currentPriority} 
              onValueChange={(value) => setValue('priority', value as typeof currentPriority)}
            >
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="edit-start-date">Start Date</Label>
            <Input id="edit-start-date" type="date" {...register('start_date')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-end-date">End Date</Label>
            <Input id="edit-end-date" type="date" {...register('end_date')} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="edit-budget">Total Budget</Label>
            <Input id="edit-budget" type="number" placeholder="0.00" {...register('total_budget')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-paid">Amount Paid</Label>
            <Input id="edit-paid" type="number" placeholder="0.00" {...register('amount_paid')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-terms">Payment Terms</Label>
            <Input id="edit-terms" placeholder="e.g., Net 30" {...register('payment_terms')} />
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}
