'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  UserCog,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import type { UserRole } from '@/shared/types/database.types';
import { hasPermission, type Permission } from '@/shared/lib/auth/permissions';

// =============================================================================
// TYPES
// =============================================================================

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  requiredPermission?: Permission;
}

interface MobileNavProps {
  user?: {
    name: string | null;
    email: string;
    avatar_url: string | null;
    role: UserRole;
  };
}

// =============================================================================
// NAVIGATION CONFIG (shared with AppSidebar)
// =============================================================================

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard, requiredPermission: 'dashboard:view' },
  { label: 'Clients', href: '/clients', icon: Users, requiredPermission: 'clients:read' },
  { label: 'Projects', href: '/projects', icon: FolderKanban, requiredPermission: 'projects:read' },
  // Communications removed from mobile nav
];

const adminNavItems: NavItem[] = [
  { label: 'Employees', href: '/employees', icon: UserCog, requiredPermission: 'employees:read' },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function MobileNav({ user }: MobileNavProps) {
  const pathname = usePathname();
  const userRole = user?.role ?? 'viewer';

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const filterNavItems = (items: NavItem[]) =>
    items.filter((item) => {
      if (!item.requiredPermission) return true;
      return hasPermission(userRole, item.requiredPermission);
    });

  const visibleMainItems = filterNavItems(mainNavItems);
  const visibleAdminItems = filterNavItems(adminNavItems);

  // Combine main and admin items for mobile nav
  const allVisibleItems = [...visibleMainItems, ...visibleAdminItems];

  // Limit to 5 items max for mobile nav (typical mobile nav bar limit)
  const navItems = allVisibleItems.slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background md:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 items-center justify-center px-2 py-2 transition-colors',
                'hover:bg-accent active:bg-accent/80',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
              aria-label={item.label}
            >
              <Icon className={cn('h-6 w-6', active && 'text-primary')} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

