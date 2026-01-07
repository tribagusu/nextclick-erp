/**
 * New Communication Page
 */

'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { CommunicationForm } from '@/features/communications/ui/components/CommunicationForm';
import { useCreateCommunication } from '@/features/communications/ui/hooks/useCommunications';

export default function NewCommunicationPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [projects, setProjects] = useState<{ id: string; project_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const createMutation = useCreateCommunication();

  useEffect(() => {
    async function fetchData() {
      try {
        const [clientsRes, projectsRes] = await Promise.all([
          fetch('/api/clients?pageSize=100'),
          fetch('/api/projects?pageSize=100'),
        ]);
        const clientsJson = await clientsRes.json();
        const projectsJson = await projectsRes.json();
        setClients(clientsJson.data?.clients ?? []);
        setProjects(projectsJson.data?.projects ?? []);
      } catch {
        console.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async (data: Parameters<typeof createMutation.mutateAsync>[0]) => {
    setError(null);
    try {
      await createMutation.mutateAsync(data);
      router.push('/communications');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create communication');
    }
  };

  if (loading) {
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
        <Link href="/communications">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New Communication</h1>
          <p className="text-muted-foreground">Log a client interaction</p>
        </div>
      </div>
      <div className="max-w-3xl">
        <CommunicationForm clients={clients} projects={projects} onSubmit={handleSubmit} isLoading={createMutation.isPending} error={error} mode="create" />
      </div>
    </div>
  );
}
