import { MilestonesTable } from '@/features/milestones/ui/components/MilestonesTable';

export const metadata = {
  title: 'Milestones | Next Click ERP',
  description: 'Manage project milestones',
};

export default function MilestonesPage() {
  return (
    <div className="lg:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Milestones</h1>
        <p className="text-muted-foreground">Track project milestones</p>
      </div>
      <MilestonesTable />
    </div>
  );
}
