/**
 * Settings Page
 */

import { SettingsPage } from '@/features/settings/ui/components/SettingsPage';

export const metadata = {
  title: 'Settings | Next Click ERP',
  description: 'Manage your account settings',
};

export default function SettingsRoute() {
  return (
    <div className="lg:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>
      <SettingsPage />
    </div>
  );
}
