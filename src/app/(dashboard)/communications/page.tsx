import { CommunicationsTable } from '@/features/communications/ui/components/CommunicationsTable';

export const metadata = {
  title: 'Communications | Next Click ERP',
  description: 'Manage communication logs',
};

export default function CommunicationsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Communications</h1>
        <p className="text-muted-foreground">Track client interactions</p>
      </div>
      <CommunicationsTable />
    </div>
  );
}
