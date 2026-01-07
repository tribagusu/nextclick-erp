/**
 * Milestone Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MilestoneService } from '../milestone.service';

// Mock the Supabase client
const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
  },
};

describe('MilestoneService', () => {
  let service: MilestoneService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new MilestoneService(mockSupabase as never);
  });

  describe('createMilestone', () => {
    it('should create a milestone with valid data', async () => {
      const mockMilestone = {
        id: 'mile-1',
        project_id: 'proj-1',
        milestone: 'Phase 1 Complete',
        description: 'Initial development phase',
        status: 'pending',
        due_date: '2024-03-15',
        completion_date: null,
        remarks: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        deleted_at: null,
      };

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockMilestone, error: null }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      const result = await service.createMilestone({
        project_id: 'proj-1',
        milestone: 'Phase 1 Complete',
        description: 'Initial development phase',
        status: 'pending',
        due_date: '2024-03-15',
      });

      expect(result.success).toBe(true);
      expect(result.milestone).toBeDefined();
      expect(result.milestone?.milestone).toBe('Phase 1 Complete');
    });

    it('should return error for missing milestone name', async () => {
      const result = await service.createMilestone({
        project_id: 'proj-1',
        milestone: '', // Invalid - empty name
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error for missing project_id', async () => {
      const result = await service.createMilestone({
        project_id: '', // Invalid - empty project_id
        milestone: 'Test Milestone',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

});

