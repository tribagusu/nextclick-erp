/**
 * Edit Client Page
 */

'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ClientForm } from '@/features/clients/ui/components/ClientForm';
import { useClient, useUpdateClient } from '@/features/clients/ui/hooks/useClients';

interface EditClientPageProps {
  params: Promise<{ id: string }>;
}

export default function EditClientPage({ params }: EditClientPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  
  const { data: client, isLoading } = useClient(id);
  const updateMutation = useUpdateClient();

  const handleSubmit = async (data: {
    name: string;
    email?: string | null;
    phone?: string | null;
    company_name?: string | null;
    address?: string | null;
    notes?: string | null;
  }) => {
    setError(null);
    try {
      await updateMutation.mutateAsync({ id, ...data });
      router.push(`/clients/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update client');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-96 w-full max-w-2xl" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6">
        <div className="rounded-md border p-4">
          <p className="text-muted-foreground">Client not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/clients/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Client</h1>
          <p className="text-muted-foreground">Update client information</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <ClientForm
          defaultValues={client}
          onSubmit={handleSubmit}
          isLoading={updateMutation.isPending}
          error={error}
          mode="edit"
        />
      </div>
    </div>
  );
}
