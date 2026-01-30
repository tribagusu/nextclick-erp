/**
 * Browser-side Supabase client
 * 
 * Use this for client components that need to interact with Supabase.
 * Creates a singleton instance for the browser environment.
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/shared/base-feature/domain/database.types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Singleton instance for client-side use
let browserClient: ReturnType<typeof createClient> | null = null;

export function getClient() {
  if (typeof window === 'undefined') {
    throw new Error('getClient() should only be called on the client side');
  }
  
  if (!browserClient) {
    browserClient = createClient();
  }
  
  return browserClient;
}
