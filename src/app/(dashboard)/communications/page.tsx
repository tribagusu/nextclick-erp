'use client';

import { FeatureErrorBoundary } from '@/shared/components/ErrorBoundary';
import { CommunicationsTable } from '@/features/communications/ui/components/CommunicationsTable';

export default function CommunicationsPage() {
  return (
    <div className="lg:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Communications</h1>
        <p className="text-muted-foreground">Track client interactions</p>
      </div>
      <FeatureErrorBoundary featureName="Communications">
        <CommunicationsTable />
      </FeatureErrorBoundary>
    </div>
  );
}
