/**
 * Communications Table Component
 *
 * Orchestrator component that combines toolbar, data table, and dialogs.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { CommunicationLog, CommunicationMode } from '@/shared/types/database.types';
import { useCommunications, useDeleteCommunication } from '../hooks/useCommunications';

import { CommunicationsToolbar } from './CommunicationsToolbar';
import { CommunicationsDataTable } from './CommunicationsDataTable';
import { CommunicationsPagination } from './CommunicationsPagination';
import { CommunicationDeleteDialog } from './CommunicationDeleteDialog';
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
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
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
      <CommunicationDeleteDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
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
