/**
 * Client Edit Form Dialog Component
 *
 * Dialog wrapper for editing existing clients.
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

import { clientSchema, type ClientFormData, transformClientInput } from '../../domain/schemas';
import { useUpdateClient } from '../hooks/useClients';
import type { Client } from '@/shared/base-feature/domain/database.types';

interface ClientEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onSuccess?: () => void;
}

export function ClientEditDialog({ open, onOpenChange, client, onSuccess }: ClientEditDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const updateMutation = useUpdateClient();

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

  // Update form values when client changes
  useEffect(() => {
    if (client) {
      reset({
        name: client.name ?? '',
        email: client.email ?? '',
        phone: client.phone ?? '',
        company_name: client.company_name ?? '',
        address: client.address ?? '',
        notes: client.notes ?? '',
      });
    }
  }, [client, reset]);

  const handleFormSubmit = async (data: ClientFormData) => {
    if (!client) return;
    
    setError(null);
    try {
      const transformed = transformClientInput(data);
      await updateMutation.mutateAsync({ id: client.id, ...transformed });
      toast.success('Client updated successfully');
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update client');
      setError(err instanceof Error ? err.message : 'Failed to update client');
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
      title="Edit Client"
      description="Update client information"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name *</Label>
            <Input
              id="edit-name"
              placeholder="Client name"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
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
            <Label htmlFor="edit-phone">Phone</Label>
            <Input
              id="edit-phone"
              placeholder="+1 (555) 000-0000"
              {...register('phone')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-company">Company Name</Label>
            <Input
              id="edit-company"
              placeholder="Company name"
              {...register('company_name')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-address">Address</Label>
          <Input
            id="edit-address"
            placeholder="Street address"
            {...register('address')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-notes">Notes</Label>
          <Textarea
            id="edit-notes"
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
            Save Changes
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}
