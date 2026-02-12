/**
 * Projects Toolbar Component
 *
 * Search input, status filter, and action buttons.
 */

'use client';

import { Search, Plus, Upload } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

import type { ProjectStatus } from '@/shared/base-feature/domain/database.types';

interface ProjectsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: ProjectStatus | 'all';
  onStatusChange: (value: ProjectStatus | 'all') => void;
  onAddClick: () => void;
  onImportClick: () => void;
}

export function ProjectsToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  onAddClick,
  onImportClick,
}: ProjectsToolbarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={status} onValueChange={(v) => onStatusChange(v as ProjectStatus | 'all')}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="on_hold">On Hold</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={onImportClick}>
        <Upload className="mr-2 h-4 w-4" />
        Import CSV
      </Button>
      <Button onClick={onAddClick}>
        <Plus className="mr-2 h-4 w-4" />
        Add Project
      </Button>
    </div>
  );
}
