/**
 * RBAC Permission Guards
 * 
 * Role-based access control utilities for UI and API layers.
 */

import type { UserRole } from '@/shared/types/database.types';

// =============================================================================
// PERMISSION DEFINITIONS
// =============================================================================

export type Permission =
  | 'dashboard:view'
  | 'clients:read'
  | 'clients:write'
  | 'projects:read'
  | 'projects:write'
  | 'projects:assign'
  | 'milestones:read'
  | 'milestones:write'
  | 'milestones:assign'
  | 'employees:read'
  | 'employees:write'
  | 'communications:read'
  | 'communications:write';

/**
 * Permission matrix mapping roles to their allowed permissions
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'dashboard:view',
    'clients:read',
    'clients:write',
    'projects:read',
    'projects:write',
    'projects:assign',
    'milestones:read',
    'milestones:write',
    'milestones:assign',
    'employees:read',
    'employees:write',
    'communications:read',
    'communications:write',
  ],
  manager: [
    'dashboard:view',
    'clients:read',
    'clients:write',
    'projects:read',
    'projects:write',
    'projects:assign',
    'milestones:read',
    'milestones:write',
    'milestones:assign',
    'communications:read',
    'communications:write',
  ],
  employee: [
    'dashboard:view',
    'clients:read',
    'projects:read',
    'projects:write', // Only for assigned projects (enforced by RLS)
    'milestones:read',
    'milestones:write', // Only for assigned milestones (enforced by RLS) - cannot edit name or assignees
    'communications:read',
    'communications:write', // Only for assigned projects (enforced by RLS)
  ],
  viewer: [
    'dashboard:view',
    'clients:read',
    'projects:read',
    'milestones:read',
    'communications:read',
  ],
};

// =============================================================================
// PERMISSION CHECKING UTILITIES
// =============================================================================

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

// =============================================================================
// ROLE HIERARCHY UTILITIES
// =============================================================================

const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 4,
  manager: 3,
  employee: 2,
  viewer: 1,
};

/**
 * Check if a role is at or above a minimum role level
 */
export function isRoleAtLeast(role: UserRole, minimumRole: UserRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minimumRole];
}

/**
 * Check if role is admin
 */
export function isAdmin(role: UserRole): boolean {
  return role === 'admin';
}

/**
 * Check if role can manage (admin or manager)
 */
export function canManage(role: UserRole): boolean {
  return role === 'admin' || role === 'manager';
}

// =============================================================================
// NAVIGATION VISIBILITY
// =============================================================================

/**
 * Navigation items visible per role
 */
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  requiredPermission?: Permission;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard', requiredPermission: 'dashboard:view' },
  { label: 'Clients', href: '/clients', icon: 'Users', requiredPermission: 'clients:read' },
  { label: 'Projects', href: '/projects', icon: 'FolderKanban', requiredPermission: 'projects:read' },
  { label: 'Communications', href: '/communications', icon: 'MessageSquare', requiredPermission: 'communications:read' },
  { label: 'Employees', href: '/employees', icon: 'UserCog', requiredPermission: 'employees:read' },
];

/**
 * Filter navigation items based on user role
 */
export function getVisibleNavItems(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => {
    if (!item.requiredPermission) return true;
    return hasPermission(role, item.requiredPermission);
  });
}
