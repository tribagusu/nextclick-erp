'use client';

import * as React from 'react';

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/shared/components/ui/sidebar';
import { Separator } from '@/shared/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/components/ui/breadcrumb';
import { AppSidebar } from './AppSidebar';

import type { UserRole } from '@/shared/base-feature/domain/database.types';

// =============================================================================
// TYPES
// =============================================================================

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  user?: {
    name: string | null;
    email: string;
    avatar_url: string | null;
    role: UserRole;
  };
  onLogout?: () => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function DashboardLayout({
  children,
  breadcrumbs = [],
  user,
  onLogout,
}: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar user={user} onLogout={onLogout} />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            {breadcrumbs.length > 0 && (
              <>
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumbs.map((crumb, index) => (
                      <React.Fragment key={`${crumb.label}-${index}`}>
                        {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                        <BreadcrumbItem className={index < breadcrumbs.length - 1 ? 'hidden md:block' : ''}>
                          {crumb.href ? (
                            <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                          ) : (
                            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                          )}
                        </BreadcrumbItem>
                      </React.Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              </>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
