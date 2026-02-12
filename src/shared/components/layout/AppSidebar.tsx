'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  MessageSquare,
  UserCog,
  Settings,
  LogOut,
  Building2,
  Sun,
  Moon,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/shared/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

import type { UserRole } from '@/shared/base-feature/domain/database.types';
import { hasPermission, type Permission } from '@/shared/lib/auth/permissions';
import { useTheme } from 'next-themes';

// =============================================================================
// TYPES
// =============================================================================

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  requiredPermission?: Permission;
}

interface AppSidebarProps {
  user?: {
    name: string | null;
    email: string;
    avatar_url: string | null;
    role: UserRole;
  };
  onLogout?: () => void;
}

// =============================================================================
// NAVIGATION CONFIG
// =============================================================================

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard, requiredPermission: 'dashboard:view' },
  { label: 'Clients', href: '/clients', icon: Users, requiredPermission: 'clients:read' },
  { label: 'Projects', href: '/projects', icon: FolderKanban, requiredPermission: 'projects:read' },
  { label: 'Communications', href: '/communications', icon: MessageSquare, requiredPermission: 'communications:read' },
];

const adminNavItems: NavItem[] = [
  { label: 'Employees', href: '/employees', icon: UserCog, requiredPermission: 'employees:read' },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function AppSidebar({ user, onLogout }: AppSidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const userRole = user?.role ?? 'viewer';

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname === '/';
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

  return (
    <Sidebar collapsible="icon">
      {/* Header - Logo */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Nextclick ERP</span>
                  <span className="truncate text-xs capitalize">{userRole}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMainItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section - Only visible to admins */}
        {visibleAdminItems.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Administration</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleAdminItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.label}>
                        <Link href={item.href}>
                          <item.icon className="size-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {/* Footer - User Menu */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage src={user?.avatar_url ?? undefined} alt={user?.name ?? 'User'} />
                    <AvatarFallback className="rounded-lg">
                      {user?.name?.charAt(0).toUpperCase() ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name ?? 'User'}</span>
                    <span className="truncate text-xs">{user?.email ?? ''}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                              <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 size-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                  {theme === 'dark' ? (
                    <Sun className="mr-2 size-4" />
                  ) : (
                    <Moon className="mr-2 size-4" />
                  )}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
