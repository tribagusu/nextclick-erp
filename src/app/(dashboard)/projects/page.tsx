import { ProjectsTable } from '@/features/projects/ui/components/ProjectsTable';

export const metadata = {
  title: 'Projects | Next Click ERP',
  description: 'Manage your projects',
};

export default function ProjectsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="text-muted-foreground">Manage your project portfolio</p>
      </div>
      <ProjectsTable />
    </div>
  );
}
