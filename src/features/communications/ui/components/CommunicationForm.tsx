/**
 * Communication Form Component
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
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

import { communicationFormSchema, communicationModeOptions, type CommunicationFormData, transformCommunicationInput } from '../../domain/schemas';
import type { CommunicationLog } from '@/shared/types/database.types';

interface CommunicationFormProps {
  defaultValues?: Partial<CommunicationLog>;
  clients: { id: string; name: string }[];
  projects?: { id: string; project_name: string }[];
  onSubmit: (data: ReturnType<typeof transformCommunicationInput>) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  mode?: 'create' | 'edit';
}

export function CommunicationForm({
  defaultValues,
  clients,
  projects = [],
  onSubmit,
  isLoading = false,
  error = null,
  mode = 'create',
}: CommunicationFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CommunicationFormData>({
    resolver: zodResolver(communicationFormSchema),
    defaultValues: {
      client_id: defaultValues?.client_id ?? '',
      project_id: defaultValues?.project_id ?? '',
      date: defaultValues?.date ?? new Date().toISOString().split('T')[0],
      mode: defaultValues?.mode ?? 'email',
      summary: defaultValues?.summary ?? '',
      follow_up_required: defaultValues?.follow_up_required ?? false,
      follow_up_date: defaultValues?.follow_up_date ?? '',
    },
  });

  const currentMode = watch('mode');
  const currentClientId = watch('client_id');
  const currentProjectId = watch('project_id');
  const followUpRequired = watch('follow_up_required');

  const handleFormSubmit = async (data: CommunicationFormData) => {
    const transformed = transformCommunicationInput(data);
    await onSubmit(transformed);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'New Communication Log' : 'Edit Communication'}</CardTitle>
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

            <div className="space-y-2">
              <Label htmlFor="project_id">Project (Optional)</Label>
              <Select value={currentProjectId || ''} onValueChange={(value) => setValue('project_id', value || '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.project_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mode">Mode *</Label>
              <Select value={currentMode} onValueChange={(value) => setValue('mode', value as typeof currentMode)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {communicationModeOptions.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary *</Label>
            <Textarea id="summary" placeholder="Describe the communication..." rows={4} {...register('summary')} />
            {errors.summary && <p className="text-sm text-destructive">{errors.summary.message}</p>}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="follow_up_required"
                checked={followUpRequired}
                onCheckedChange={(checked) => setValue('follow_up_required', Boolean(checked))}
              />
              <Label htmlFor="follow_up_required" className="cursor-pointer">Follow-up required</Label>
            </div>

            {followUpRequired && (
              <div className="space-y-2">
                <Label htmlFor="follow_up_date">Follow-up Date</Label>
                <Input id="follow_up_date" type="date" {...register('follow_up_date')} />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="submit" disabled={isLoading || isSubmitting}>
              {(isLoading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Create Log' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
