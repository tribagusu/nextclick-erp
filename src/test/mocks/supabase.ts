/**
 * Supabase Test Mocks
 */

import { vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/base-feature/domain/database.types';

export function createMockSupabaseClient(overrides: Partial<{
  selectResult: unknown;
  insertResult: unknown;
  updateResult: unknown;
  deleteResult: unknown;
  authUser: { id: string; email: string } | null;
}> = {}): SupabaseClient<Database> {
  const defaults = {
    selectResult: { data: [], count: 0, error: null },
    insertResult: { data: null, error: null },
    updateResult: { data: null, error: null },
    deleteResult: { data: null, error: null },
    authUser: { id: 'test-user-id', email: 'test@example.com' },
  };

  const config = { ...defaults, ...overrides };

  const mockQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(config.selectResult),
    then: vi.fn((resolve) => resolve(config.selectResult)),
  };

  return {
    from: vi.fn(() => mockQueryBuilder),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: config.authUser }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: config.authUser }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: config.authUser }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  } as unknown as SupabaseClient<Database>;
}

export function createMockQueryResult<T>(data: T, count?: number) {
  return {
    data,
    count: count ?? (Array.isArray(data) ? data.length : 1),
    error: null,
  };
}

export function createMockErrorResult(message: string) {
  return {
    data: null,
    count: null,
    error: { message, code: 'ERROR' },
  };
}
