/**
 * New Client Page
 */

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/shared/components/ui/button';
import { ClientForm } from '@/features/clients/ui/components/ClientForm';
import { useCreateClient } from '@/features/clients/ui/hooks/useClients';

export default function NewClientPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const createMutation = useCreateClient();

  const handleSubmit = async (data: Parameters<typeof createMutation.mutateAsync>[0]) => {
    setError(null);
    try {
      await createMutation.mutateAsync(data);
      router.push('/clients');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create client');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New Client</h1>
          <p className="text-muted-foreground">Add a new client to your ERP</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <ClientForm
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
          error={error}
          mode="create"
        />
      </div>
    </div>
  );
}
