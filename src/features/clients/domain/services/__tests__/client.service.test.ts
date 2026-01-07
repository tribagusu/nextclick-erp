/**
 * Client Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClientService } from '../client.service';

// Mock the Supabase client
const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
  },
};

describe('ClientService', () => {
  let service: ClientService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ClientService(mockSupabase as never);
  });

  describe('createClient', () => {
    it('should create a client with valid data', async () => {
      const mockClient = {
        id: 'client-1',
        name: 'Test Client',
        email: 'test@example.com',
        phone: null,
        company_name: null,
        address: null,
        notes: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        deleted_at: null,
      };

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockClient, error: null }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      const result = await service.createClient({
        name: 'Test Client',
        email: 'test@example.com',
      });

      expect(result.success).toBe(true);
      expect(result.client).toBeDefined();
      expect(result.client?.name).toBe('Test Client');
    });

    it('should return error for invalid data', async () => {
      const result = await service.createClient({
        name: '', // Invalid - empty name
        email: 'test@example.com',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error for short name', async () => {
      const result = await service.createClient({
        name: 'A', // Invalid - too short
        email: 'test@example.com',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('2 characters');
    });
  });

});

