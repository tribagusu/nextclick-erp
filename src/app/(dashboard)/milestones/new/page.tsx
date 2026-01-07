/**
 * New Milestone Page
 */

'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { MilestoneForm } from '@/features/milestones/ui/components/MilestoneForm';
import { useCreateMilestone } from '@/features/milestones/ui/hooks/useMilestones';

export default function NewMilestonePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<{ id: string; project_name: string }[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const createMutation = useCreateMilestone();

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/projects?pageSize=100');
        const json = await response.json();
        setProjects(json.data?.projects ?? []);
      } catch {
        console.error('Failed to fetch projects');
      } finally {
        setLoadingProjects(false);
      }
    }
    fetchProjects();
  }, []);

  const handleSubmit = async (data: Parameters<typeof createMutation.mutateAsync>[0]) => {
    setError(null);
    try {
      await createMutation.mutateAsync(data);
      router.push('/milestones');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create milestone');
    }
  };

  if (loadingProjects) {
    return (
      <div className="lg:p-6 space-y-6">
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
    <div className="lg:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/milestones">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New Milestone</h1>
          <p className="text-muted-foreground">Create a new milestone</p>
        </div>
      </div>
      <div className="max-w-3xl">
        <MilestoneForm projects={projects} onSubmit={handleSubmit} isLoading={createMutation.isPending} error={error} mode="create" />
      </div>
    </div>
  );
}
