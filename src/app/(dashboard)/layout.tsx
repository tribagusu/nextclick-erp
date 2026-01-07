/**
 * Dashboard Layout
 *
 * Layout for authenticated dashboard pages with sidebar.
 */

import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';

export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
