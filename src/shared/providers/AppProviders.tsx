/**
 * App Providers
 *
 * Combines all providers for the application.
 */

'use client';

import { ThemeProvider } from 'next-themes';
import { QueryClientProvider } from './QueryClientProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}
