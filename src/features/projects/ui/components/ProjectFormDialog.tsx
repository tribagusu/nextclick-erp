/**
 * Project Form Dialog Component
 *
 * Simplified dialog for quick project creation (4 fields).
 */

'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
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
  projectCreateSchema, 
  projectStatusOptions, 
  projectPriorityOptions, 
  type ProjectCreateFormData 
} from '../../domain/schemas';
import { useCreateProject } from '../hooks/useProjects';
import { useClients } from '@/features/clients/ui/hooks/useClients';

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ProjectFormDialog({ open, onOpenChange, onSuccess }: ProjectFormDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const createMutation = useCreateProject();
  const { data: clientsData, isLoading: clientsLoading } = useClients({ pageSize: 100 });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProjectCreateFormData>({
    resolver: zodResolver(projectCreateSchema),
    defaultValues: {
      project_name: '',
      client_id: '',
      status: 'draft',
      priority: 'medium',
    },
  });

  const currentStatus = watch('status');
  const currentPriority = watch('priority');
  const currentClientId = watch('client_id');

  const handleFormSubmit = async (data: ProjectCreateFormData) => {
    setError(null);
    try {
      // Pass form data directly with defaults for optional fields
      await createMutation.mutateAsync({
        project_name: data.project_name,
        client_id: data.client_id,
        status: data.status ?? 'draft',
        priority: data.priority ?? 'medium',
      });
      toast.success('Project created successfully');
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create project');
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
      setError(null);
    }
    onOpenChange(isOpen);
  };

  const isLoading = isSubmitting || createMutation.isPending;

  return (
    <FormDialog
      open={open}
      onOpenChange={handleClose}
      title="New Project"
      description="Create a new project (you can add more details later)"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="dialog-project-name">Project Name *</Label>
          <Input
            id="dialog-project-name"
            placeholder="Project name"
            {...register('project_name')}
          />
          {errors.project_name && (
            <p className="text-sm text-destructive">{errors.project_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dialog-client">Client *</Label>
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dialog-status">Status</Label>
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
            <Label htmlFor="dialog-priority">Priority</Label>
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
            Create Project
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}
