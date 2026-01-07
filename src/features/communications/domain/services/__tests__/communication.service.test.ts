/**
 * Communication Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommunicationService } from '../communication.service';

// Mock the Supabase client
const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
  },
};

describe('CommunicationService', () => {
  let service: CommunicationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CommunicationService(mockSupabase as never);
  });

  describe('createCommunication', () => {
    it('should create a communication with valid data', async () => {
      const mockCommunication = {
        id: 'comm-1',
        client_id: 'client-1',
        project_id: null,
        date: '2024-01-15',
        mode: 'email',
        summary: 'Discussed project requirements and timeline',
        follow_up_required: true,
        follow_up_date: '2024-01-22',
        created_at: '2024-01-15',
        updated_at: '2024-01-15',
        deleted_at: null,
      };

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockCommunication, error: null }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      const result = await service.createCommunication({
        client_id: 'client-1',
        date: '2024-01-15',
        mode: 'email',
        summary: 'Discussed project requirements and timeline',
        follow_up_required: true,
        follow_up_date: '2024-01-22',
      });

      expect(result.success).toBe(true);
      expect(result.communication).toBeDefined();
      expect(result.communication?.mode).toBe('email');
    });

    it('should return error for missing client_id', async () => {
      const result = await service.createCommunication({
        client_id: '', // Invalid - empty client_id
        date: '2024-01-15',
        mode: 'email',
        summary: 'Test summary content here',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error for short summary', async () => {
      const result = await service.createCommunication({
        client_id: 'client-1',
        date: '2024-01-15',
        mode: 'email',
        summary: 'Short', // Invalid - too short (< 10 chars)
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('10 characters');
    });

    it('should return error for missing date', async () => {
      const result = await service.createCommunication({
        client_id: 'client-1',
        date: '', // Invalid - empty date
        mode: 'email',
        summary: 'Test summary content here',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

});

