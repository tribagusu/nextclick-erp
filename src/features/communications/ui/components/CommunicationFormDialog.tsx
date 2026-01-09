/**
 * Communication Form Dialog Component
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
import { useCreateCommunication } from '../hooks/useCommunications';
import { useClients } from '@/features/clients/ui/hooks/useClients';
import { useProjects } from '@/features/projects/ui/hooks/useProjects';

interface CommunicationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CommunicationFormDialog({ open, onOpenChange, onSuccess }: CommunicationFormDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const createMutation = useCreateCommunication();
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
      date: new Date().toISOString().split('T')[0],
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

  const handleFormSubmit = async (data: CommunicationFormData) => {
    setError(null);
    try {
      await createMutation.mutateAsync({
        client_id: data.client_id,
        project_id: data.project_id || undefined,
        date: data.date,
        mode: data.mode,
        summary: data.summary,
        follow_up_required: data.follow_up_required ?? false,
        follow_up_date: data.follow_up_date || undefined,
      });
      toast.success('Communication log created successfully');
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create communication log');
      setError(err instanceof Error ? err.message : 'Failed to create communication log');
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
      title="New Communication Log"
      description="Record a new communication with a client"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dialog-client">Client *</Label>
            <Select 
              value={currentClientId} 
              onValueChange={(value) => {
                setValue('client_id', value);
                setValue('project_id', ''); // Reset project on client change
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
            <Label htmlFor="dialog-project">Project</Label>
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
            <Label htmlFor="dialog-date">Date *</Label>
            <Input id="dialog-date" type="date" {...register('date')} />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dialog-mode">Mode *</Label>
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
          <Label htmlFor="dialog-summary">Summary *</Label>
          <Textarea
            id="dialog-summary"
            placeholder="Brief summary of the communication (min 10 characters)"
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
              id="dialog-follow-up"
              checked={followUpRequired}
              onCheckedChange={(checked) => setValue('follow_up_required', !!checked)}
            />
            <Label htmlFor="dialog-follow-up" className="text-sm font-normal">
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
            Create Log
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}
