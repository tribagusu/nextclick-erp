'use client';

import { FeatureErrorBoundary } from '@/shared/components/ErrorBoundary';
import { ProjectsTable } from '@/features/projects/ui/components/ProjectsTable';

export default function ProjectsPage() {
  return (
    <div className="lg:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="text-muted-foreground">Manage your project portfolio</p>
      </div>
      <FeatureErrorBoundary featureName="Projects">
        <ProjectsTable />
      </FeatureErrorBoundary>
    </div>
  );
}
