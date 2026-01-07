/**
 * Client Form Dialog Component
 *
 * Dialog wrapper for ClientForm for inline creation.
 */

'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { FormDialog } from '@/shared/components/ui/form-dialog';

import { clientSchema, type ClientFormData, transformClientInput } from '../../domain/schemas';
import { useCreateClient } from '../hooks/useClients';

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ClientFormDialog({ open, onOpenChange, onSuccess }: ClientFormDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const createMutation = useCreateClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company_name: '',
      address: '',
      notes: '',
    },
  });

  const handleFormSubmit = async (data: ClientFormData) => {
    setError(null);
    try {
      const transformed = transformClientInput(data);
      await createMutation.mutateAsync(transformed);
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create client');
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
      title="New Client"
      description="Add a new client to your CRM"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dialog-name">Name *</Label>
            <Input
              id="dialog-name"
              placeholder="Client name"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dialog-email">Email</Label>
            <Input
              id="dialog-email"
              type="email"
              placeholder="client@example.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dialog-phone">Phone</Label>
            <Input
              id="dialog-phone"
              placeholder="+1 (555) 000-0000"
              {...register('phone')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dialog-company">Company Name</Label>
            <Input
              id="dialog-company"
              placeholder="Company name"
              {...register('company_name')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dialog-address">Address</Label>
          <Input
            id="dialog-address"
            placeholder="Street address"
            {...register('address')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dialog-notes">Notes</Label>
          <Textarea
            id="dialog-notes"
            placeholder="Additional notes..."
            rows={3}
            {...register('notes')}
          />
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
            Create Client
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}
