/**
 * Communications Table Component
 *
 * Orchestrator component that combines toolbar, data table, and dialogs.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import type { CommunicationLog, CommunicationMode } from '@/shared/types/database.types';
import { useCommunications, useDeleteCommunication } from '../hooks/useCommunications';
import { DeleteConfirmDialog } from '@/shared/components/DeleteConfirmDialog';

import { CommunicationsToolbar } from './CommunicationsToolbar';
import { CommunicationsDataTable } from './CommunicationsDataTable';
import { CommunicationsPagination } from './CommunicationsPagination';
import { CommunicationFormDialog } from './CommunicationFormDialog';
import { CommunicationEditDialog } from './CommunicationEditDialog';

export function CommunicationsTable() {
  const router = useRouter();
  
  // State
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<CommunicationMode | 'all'>('all');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editCommunication, setEditCommunication] = useState<CommunicationLog | null>(null);

  // Data fetching
  const { data, isLoading, error } = useCommunications({
    page,
    pageSize: 10,
    search: search || undefined,
    mode: mode !== 'all' ? mode : undefined,
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const deleteMutation = useDeleteCommunication();

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleModeChange = (value: CommunicationMode | 'all') => {
    setMode(value);
    setPage(1);
  };

  const handleRowClick = (id: string) => {
    router.push(`/communications/${id}`);
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteMutation.mutateAsync(deleteId);
        setDeleteId(null);
        toast.success('Communication log deleted successfully');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete communication');
      }
    }
  };

  // Error state
  if (error) {
    return (
      <div className="rounded-md border border-destructive p-4">
        <p className="text-destructive">Failed to load communication logs</p>
      </div>
    );
  }

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;
  const emptyMessage = search || mode !== 'all' 
    ? 'No communications found' 
    : 'No communication logs yet. Add your first log!';

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <CommunicationsToolbar
        search={search}
        onSearchChange={handleSearchChange}
        mode={mode}
        onModeChange={handleModeChange}
        onAddClick={() => setCreateDialogOpen(true)}
      />

      {/* Data Table */}
      <CommunicationsDataTable
        communications={data?.communications ?? []}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        onRowClick={handleRowClick}
        onEdit={setEditCommunication}
        onDelete={setDeleteId}
      />

      {/* Pagination */}
      <CommunicationsPagination
        page={page}
        totalPages={totalPages}
        total={data?.total ?? 0}
        pageSize={data?.pageSize ?? 10}
        onPageChange={setPage}
      />

      {/* Dialogs */}
      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Communication Log"
        description="Are you sure you want to delete this communication log? This action cannot be undone."
        isLoading={deleteMutation.isPending}
      />

      <CommunicationFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <CommunicationEditDialog
        open={!!editCommunication}
        onOpenChange={(open) => !open && setEditCommunication(null)}
        communication={editCommunication}
      />
    </div>
  );
}
