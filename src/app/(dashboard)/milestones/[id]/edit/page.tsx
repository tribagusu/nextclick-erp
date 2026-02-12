/**
 * Edit Milestone Page
 */

'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { FeatureErrorBoundary } from '@/shared/components/ErrorBoundary';
import { MilestoneForm } from '@/features/milestones/ui/components/MilestoneForm';
import { useMilestone, useUpdateMilestone } from '@/features/milestones/ui/hooks/useMilestones';

interface EditMilestonePageProps {
  params: Promise<{ id: string }>;
}

export default function EditMilestonePage({ params }: EditMilestonePageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<{ id: string; project_name: string }[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  
  const { data: milestone, isLoading: loadingMilestone } = useMilestone(id);
  const updateMutation = useUpdateMilestone();

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

  const handleSubmit = async (data: {
    project_id: string;
    milestone: string;
    description: string | null;
    due_date: string | null;
    completion_date: string | null;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    remarks: string | null;
  }) => {
    setError(null);
    try {
      await updateMutation.mutateAsync({ id, ...data });
      router.push(`/milestones/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update milestone');
    }
  };

  if (loadingMilestone || loadingProjects) {
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

  if (!milestone) {
    return (
      <div className="p-6">
        <div className="rounded-md border p-4">
          <p className="text-muted-foreground">Milestone not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/milestones/${id}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Milestone</h1>
          <p className="text-muted-foreground">Update milestone details</p>
        </div>
      </div>
      <FeatureErrorBoundary featureName="Edit Milestone">
        <div className="max-w-3xl">
          <MilestoneForm defaultValues={milestone} projects={projects} onSubmit={handleSubmit} isLoading={updateMutation.isPending} error={error} mode="edit" />
        </div>
      </FeatureErrorBoundary>
    </div>
  );
}
