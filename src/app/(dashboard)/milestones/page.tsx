'use client';

import { FeatureErrorBoundary } from '@/shared/components/ErrorBoundary';
import { MilestonesTable } from '@/features/milestones/ui/components/MilestonesTable';

export default function MilestonesPage() {
  return (
    <div className="lg:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Milestones</h1>
        <p className="text-muted-foreground">Track project milestones</p>
      </div>
      <FeatureErrorBoundary featureName="Milestones">
        <MilestonesTable />
      </FeatureErrorBoundary>
    </div>
  );
}
