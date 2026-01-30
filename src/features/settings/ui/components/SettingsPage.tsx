/**
 * Settings Page Component
 *
 * Main orchestrator for the settings page with tab navigation.
 */

'use client';

import { useState } from 'react';
import { User, Lock } from 'lucide-react';

import { SettingsTabs, type SettingsTab } from './SettingsTabs';
import { ProfileSettings } from './ProfileSettings';
import { PasswordSettings } from './PasswordSettings';

// =============================================================================
// TAB CONFIGURATION
// =============================================================================

const tabs: SettingsTab[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'password', label: 'Password', icon: Lock },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <SettingsTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Content */}
      <div className="max-w-2xl">
        {activeTab === 'profile' && <ProfileSettings />}
        {activeTab === 'password' && <PasswordSettings />}
      </div>
    </div>
  );
}
