/**
 * Clients List Page
 */

import { ClientsTable } from '@/features/clients/ui/components/ClientsTable';

export const metadata = {
  title: 'Clients | Next Click ERP',
  description: 'Manage your clients',
};

export default function ClientsPage() {
  return (
    <div className="lg:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Clients</h1>
        <p className="text-muted-foreground">Manage your client relationships</p>
      </div>

      <ClientsTable />
    </div>
  );
}
