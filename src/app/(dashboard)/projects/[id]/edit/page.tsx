/**
 * Edit Project Page
 */

'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ProjectForm } from '@/features/projects/ui/components/ProjectForm';
import { useProject, useUpdateProject } from '@/features/projects/ui/hooks/useProjects';

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  
  const { data: project, isLoading: loadingProject } = useProject(id);
  const updateMutation = useUpdateProject();

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

  const handleSubmit = async (data: {
    project_name: string;
    client_id: string;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
    status: 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    total_budget: number;
    amount_paid: number;
    payment_terms: string | null;
  }) => {
    setError(null);
    try {
      await updateMutation.mutateAsync({ id, ...data });
      router.push(`/projects/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
    }
  };

  if (loadingProject || loadingClients) {
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

  if (!project) {
    return (
      <div className="p-6">
        <div className="rounded-md border p-4">
          <p className="text-muted-foreground">Project not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/projects/${id}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Project</h1>
          <p className="text-muted-foreground">Update project details</p>
        </div>
      </div>
      <div className="max-w-3xl">
        <ProjectForm defaultValues={project} clients={clients} onSubmit={handleSubmit} isLoading={updateMutation.isPending} error={error} mode="edit" />
      </div>
    </div>
  );
}
