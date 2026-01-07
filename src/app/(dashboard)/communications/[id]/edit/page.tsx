/**
 * Edit Communication Page
 */

'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { CommunicationForm } from '@/features/communications/ui/components/CommunicationForm';
import { useCommunication, useUpdateCommunication } from '@/features/communications/ui/hooks/useCommunications';

interface EditCommunicationPageProps {
  params: Promise<{ id: string }>;
}

export default function EditCommunicationPage({ params }: EditCommunicationPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [projects, setProjects] = useState<{ id: string; project_name: string }[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const { data: communication, isLoading: loadingComm } = useCommunication(id);
  const updateMutation = useUpdateCommunication();

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
        setLoadingData(false);
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async (data: {
    client_id: string;
    project_id: string | null;
    date: string;
    mode: 'email' | 'call' | 'meeting';
    summary: string;
    follow_up_required: boolean;
    follow_up_date: string | null;
  }) => {
    setError(null);
    try {
      await updateMutation.mutateAsync({ id, ...data });
      router.push(`/communications/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update communication');
    }
  };

  if (loadingComm || loadingData) {
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

  if (!communication) {
    return (
      <div className="p-6">
        <div className="rounded-md border p-4">
          <p className="text-muted-foreground">Communication not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/communications/${id}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Communication</h1>
          <p className="text-muted-foreground">Update communication log</p>
        </div>
      </div>
      <div className="max-w-3xl">
        <CommunicationForm defaultValues={communication} clients={clients} projects={projects} onSubmit={handleSubmit} isLoading={updateMutation.isPending} error={error} mode="edit" />
      </div>
    </div>
  );
}
