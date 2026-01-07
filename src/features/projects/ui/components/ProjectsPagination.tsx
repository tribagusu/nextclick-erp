/**
 * Projects Pagination Component
 */

'use client';

import { Button } from '@/shared/components/ui/button';

interface ProjectsPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function ProjectsPagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: ProjectsPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {((page - 1) * pageSize) + 1} to{' '}
        {Math.min(page * pageSize, total)} of {total}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
