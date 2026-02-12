/**
 * Clients Toolbar Component
 *
 * Search input and action buttons for clients list.
 */

'use client';

import { Search, Plus, Upload } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

interface ClientsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
  onImportClick: () => void;
}

export function ClientsToolbar({ search, onSearchChange, onAddClick, onImportClick }: ClientsToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search clients..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Button variant="outline" onClick={onImportClick}>
        <Upload className="mr-2 h-4 w-4" />
        Import CSV
      </Button>
      <Button onClick={onAddClick}>
        <Plus className="mr-2 h-4 w-4" />
        Add Client
      </Button>
    </div>
  );
}
