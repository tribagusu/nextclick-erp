/**
 * App Providers
 *
 * Combines all providers for the application.
 */

'use client';

import { ThemeProvider } from 'next-themes';
import { QueryClientProvider } from './QueryClientProvider';
import { Toaster } from '@/shared/components/ui/sonner';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider>
        {children}
        <Toaster position="bottom-right" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
