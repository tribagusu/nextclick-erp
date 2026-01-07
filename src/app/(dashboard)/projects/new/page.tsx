/**
 * New Project Page
 */

'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ProjectForm } from '@/features/projects/ui/components/ProjectForm';
import { useCreateProject } from '@/features/projects/ui/hooks/useProjects';

export default function NewProjectPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const createMutation = useCreateProject();

  useEffect(() => {
    async function fetchClients() {
      try {
        const response = await fetch('/api/clients?pageSize=100');
        const json = await response.json();
        setClients(json.data?.clients ?? []);
      } catch {
        console.error('Failed to fetch clients');
      } finally {
        setLoadingClients(false);
      }
    }
    fetchClients();
  }, []);

  const handleSubmit = async (data: Parameters<typeof createMutation.mutateAsync>[0]) => {
    setError(null);
    try {
      await createMutation.mutateAsync(data);
      router.push('/projects');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  if (loadingClients) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-96 w-full max-w-3xl" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New Project</h1>
          <p className="text-muted-foreground">Create a new project</p>
        </div>
      </div>
      <div className="max-w-3xl">
        <ProjectForm clients={clients} onSubmit={handleSubmit} isLoading={createMutation.isPending} error={error} mode="create" />
      </div>
    </div>
  );
}
