/**
 * Project Form Dialog Component
 *
 * Unified dialog for creating and editing projects.
 * Mode is determined by whether a project prop is provided.
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
  type ProjectFormData,
} from '../../domain/schemas';
import { useCreateProject, useUpdateProject } from '../hooks/useProjects';
import { useClients } from '@/features/clients/ui/hooks/useClients';
import { sanitizeFormData } from '@/shared/utils/sanitize';
import type { Project } from '@/shared/types/database.types';

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;  // If provided, edit mode; otherwise, create mode
  onSuccess?: () => void;
}

export function ProjectFormDialog({ open, onOpenChange, project, onSuccess }: ProjectFormDialogProps) {
  const [error, setError] = useState<string | null>(null);
  
  // Determine mode based on whether project is provided
  const isEditing = !!project;
  
  // Use both mutations, pick the right one based on mode
  const createMutation = useCreateProject();
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

  // Populate form when editing an existing project
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
    } else {
      // Reset to empty defaults when creating new
      reset({
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
      });
    }
  }, [project, reset]);

  const handleFormSubmit = async (data: ProjectFormData) => {
    setError(null);
    try {
      const sanitized = sanitizeFormData(data);
      const payload = {
        project_name: sanitized.project_name,
        client_id: sanitized.client_id,
        description: sanitized.description || undefined,
        start_date: sanitized.start_date || undefined,
        end_date: sanitized.end_date || undefined,
        status: sanitized.status ?? 'draft',
        priority: sanitized.priority ?? 'medium',
        total_budget: sanitized.total_budget ? parseFloat(sanitized.total_budget) : undefined,
        amount_paid: sanitized.amount_paid ? parseFloat(sanitized.amount_paid) : undefined,
        payment_terms: sanitized.payment_terms || undefined,
      };

      if (isEditing && project) {
        await updateMutation.mutateAsync({ id: project.id, ...payload });
        toast.success('Project updated successfully');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Project created successfully');
        reset();
      }
      
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to ${isEditing ? 'update' : 'create'} project`;
      toast.error(message);
      setError(message);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      if (!isEditing) {
        reset();
      }
      setError(null);
    }
    onOpenChange(isOpen);
  };

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <FormDialog
      open={open}
      onOpenChange={handleClose}
      title={isEditing ? 'Edit Project' : 'New Project'}
      description={isEditing ? 'Update project information' : 'Create a new project'}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name *</Label>
            <Input
              id="project-name"
              placeholder="Project name"
              {...register('project_name')}
            />
            {errors.project_name && (
              <p className="text-sm text-destructive">{errors.project_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-client">Client *</Label>
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
          <Label htmlFor="project-description">Description</Label>
          <Textarea
            id="project-description"
            placeholder="Project description"
            rows={3}
            {...register('description')}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="project-status">Status</Label>
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
            <Label htmlFor="project-priority">Priority</Label>
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
            <Label htmlFor="project-start-date">Start Date</Label>
            <Input id="project-start-date" type="date" {...register('start_date')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-end-date">End Date</Label>
            <Input id="project-end-date" type="date" {...register('end_date')} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="project-budget">Total Budget</Label>
            <Input id="project-budget" type="number" placeholder="0.00" {...register('total_budget')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-paid">Amount Paid</Label>
            <Input id="project-paid" type="number" placeholder="0.00" {...register('amount_paid')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-terms">Payment Terms</Label>
            <Input id="project-terms" placeholder="e.g., Net 30" {...register('payment_terms')} />
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
            {isEditing ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}
