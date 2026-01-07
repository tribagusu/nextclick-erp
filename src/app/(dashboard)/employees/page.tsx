/**
 * Employees List Page
 */

import { EmployeesTable } from '@/features/employees/ui/components/EmployeesTable';

export const metadata = {
  title: 'Employees | Next Click ERP',
  description: 'Manage your team',
};

export default function EmployeesPage() {
  return (
    <div className="lg:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Employees</h1>
        <p className="text-muted-foreground">Manage your team members</p>
      </div>
      <EmployeesTable />
    </div>
  );
}
