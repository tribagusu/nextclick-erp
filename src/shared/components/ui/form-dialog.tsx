/**
 * Form Dialog Component
 *
 * Reusable dialog wrapper with fixed header/footer and scrollable content.
 */

'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { cn } from '@/shared/lib/utils';

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * A responsive form dialog with fixed header/footer and scrollable content.
 * Use this for create/edit forms to keep users in context.
 */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          // Responsive width
          'w-full max-w-[95vw] sm:max-w-lg md:max-w-2xl',
          // Fixed height with scrollable content
          'max-h-[90vh] flex flex-col overflow-hidden',
          className
        )}
      >
        {/* Fixed Header */}
        <DialogHeader className="shrink-0 pb-4 border-b">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 px-1">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
