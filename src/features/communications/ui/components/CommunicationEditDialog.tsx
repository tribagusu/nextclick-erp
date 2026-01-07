/**
 * Communication Edit Dialog Component
 */

'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
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
  communicationFormSchema, 
  communicationModeOptions,
  type CommunicationFormData 
} from '../../domain/schemas';
import { useUpdateCommunication } from '../hooks/useCommunications';
import { useClients } from '@/features/clients/ui/hooks/useClients';
import { useProjects } from '@/features/projects/ui/hooks/useProjects';
import type { CommunicationLog } from '@/shared/types/database.types';

interface CommunicationEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communication: CommunicationLog | null;
  onSuccess?: () => void;
}

export function CommunicationEditDialog({ open, onOpenChange, communication, onSuccess }: CommunicationEditDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const updateMutation = useUpdateCommunication();
  const { data: clientsData, isLoading: clientsLoading } = useClients({ pageSize: 100 });
  const { data: projectsData, isLoading: projectsLoading } = useProjects({ pageSize: 100 });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CommunicationFormData>({
    resolver: zodResolver(communicationFormSchema),
    defaultValues: {
      client_id: '',
      project_id: '',
      date: '',
      mode: 'email',
      summary: '',
      follow_up_required: false,
      follow_up_date: '',
    },
  });

  const currentClientId = watch('client_id');
  const currentProjectId = watch('project_id');
  const currentMode = watch('mode');
  const followUpRequired = watch('follow_up_required');

  // Filter projects by selected client
  const filteredProjects = projectsData?.projects.filter(
    (p) => p.client_id === currentClientId
  ) ?? [];

  // Update form values when communication changes
  useEffect(() => {
    if (communication) {
      reset({
        client_id: communication.client_id ?? '',
        project_id: communication.project_id ?? '',
        date: communication.date ?? '',
        mode: communication.mode ?? 'email',
        summary: communication.summary ?? '',
        follow_up_required: communication.follow_up_required ?? false,
        follow_up_date: communication.follow_up_date ?? '',
      });
    }
  }, [communication, reset]);

  const handleFormSubmit = async (data: CommunicationFormData) => {
    if (!communication) return;
    
    setError(null);
    try {
      await updateMutation.mutateAsync({
        id: communication.id,
        client_id: data.client_id,
        project_id: data.project_id || undefined,
        date: data.date,
        mode: data.mode,
        summary: data.summary,
        follow_up_required: data.follow_up_required ?? false,
        follow_up_date: data.follow_up_date || undefined,
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update communication log');
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
      title="Edit Communication Log"
      description="Update communication details"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="edit-client">Client *</Label>
            <Select 
              value={currentClientId} 
              onValueChange={(value) => {
                setValue('client_id', value);
                setValue('project_id', '');
              }}
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

          <div className="space-y-2">
            <Label htmlFor="edit-project">Project</Label>
            <Select 
              value={currentProjectId || 'none'} 
              onValueChange={(value) => setValue('project_id', value === 'none' ? '' : value)}
              disabled={projectsLoading || !currentClientId}
            >
              <SelectTrigger>
                <SelectValue placeholder={!currentClientId ? 'Select client first' : 'Select project'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No project</SelectItem>
                {filteredProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.project_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="edit-date">Date *</Label>
            <Input id="edit-date" type="date" {...register('date')} />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-mode">Mode *</Label>
            <Select 
              value={currentMode} 
              onValueChange={(value) => setValue('mode', value as typeof currentMode)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {communicationModeOptions.map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-summary">Summary *</Label>
          <Textarea
            id="edit-summary"
            placeholder="Brief summary of the communication"
            rows={3}
            {...register('summary')}
          />
          {errors.summary && (
            <p className="text-sm text-destructive">{errors.summary.message}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="edit-follow-up"
              checked={followUpRequired}
              onCheckedChange={(checked) => setValue('follow_up_required', !!checked)}
            />
            <Label htmlFor="edit-follow-up" className="text-sm font-normal">
              Follow-up required
            </Label>
          </div>

          {followUpRequired && (
            <div className="flex-1">
              <Input 
                type="date" 
                placeholder="Follow-up date"
                {...register('follow_up_date')} 
              />
            </div>
          )}
        </div>

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
