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
        company_name: 'Test Corp',
        address: '123 Main St',
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

  describe('importClients', () => {
    const validRows = [
      { name: 'Client A', email: 'a@example.com', phone: null, company_name: 'Company A', address: 'Addr A', notes: null },
      { name: 'Client B', email: null, phone: '555-1234', company_name: 'Company B', address: 'Addr B', notes: null },
    ];

    it('should import valid rows successfully', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [{ id: '1' }, { id: '2' }],
          error: null,
        }),
      });

      mockSupabase.from.mockReturnValue({ insert: mockInsert });

      const result = await service.importClients(validRows);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(2);
    });

    it('should return error when a row fails Zod validation', async () => {
      const invalidRows = [
        { name: '', email: 'a@example.com', phone: null, company_name: 'Co', address: 'Addr', notes: null },
      ];

      const result = await service.importClients(invalidRows);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Row 1');
    });

    it('should include row number in validation error message', async () => {
      const rows = [
        { name: 'Valid', email: 'a@example.com', phone: null, company_name: 'Co', address: 'Addr', notes: null },
        { name: '', email: 'b@example.com', phone: null, company_name: 'Co', address: 'Addr', notes: null },
      ];

      const result = await service.importClients(rows);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Row 2');
    });

    it('should return error when database insert fails', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Insert failed', code: 'ERROR' },
        }),
      });

      mockSupabase.from.mockReturnValue({ insert: mockInsert });

      const result = await service.importClients(validRows);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insert failed');
    });

    it('should return permission denied for error code 42501', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'permission denied', code: '42501' },
        }),
      });

      mockSupabase.from.mockReturnValue({ insert: mockInsert });

      const result = await service.importClients(validRows);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Permission denied');
    });

    it('should reject rows missing both email and phone', async () => {
      const rows = [
        { name: 'No Contact', email: null, phone: null, company_name: 'Co', address: 'Addr', notes: null },
      ];

      const result = await service.importClients(rows);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Row 1');
    });
  });

});


