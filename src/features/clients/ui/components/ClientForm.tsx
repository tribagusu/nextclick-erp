/**
 * Client Form Component
 *
 * React Hook Form + Zod validation for client create/edit.
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

import { clientSchema, type ClientFormData, transformClientInput } from '../../domain/schemas';
import type { Client } from '@/shared/types/database.types';

interface ClientFormProps {
  defaultValues?: Partial<Client>;
  onSubmit: (data: ReturnType<typeof transformClientInput>) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  mode?: 'create' | 'edit';
}

export function ClientForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  error = null,
  mode = 'create',
}: ClientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      email: defaultValues?.email ?? '',
      phone: defaultValues?.phone ?? '',
      company_name: defaultValues?.company_name ?? '',
      address: defaultValues?.address ?? '',
      notes: defaultValues?.notes ?? '',
    },
  });

  const handleFormSubmit = async (data: ClientFormData) => {
    const transformed = transformClientInput(data);
    await onSubmit(transformed);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'New Client' : 'Edit Client'}</CardTitle>
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
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Client name"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="client@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="+1 (555) 000-0000"
                {...register('phone')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                placeholder="Company name"
                {...register('company_name')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="Street address"
              {...register('address')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              rows={4}
              {...register('notes')}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading || isSubmitting}
            >
              {(isLoading || isSubmitting) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {mode === 'create' ? 'Create Client' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
