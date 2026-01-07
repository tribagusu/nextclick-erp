/**
 * Project Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectService } from '../project.service';

// Mock the Supabase client
const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
  },
};

describe('ProjectService', () => {
  let service: ProjectService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ProjectService(mockSupabase as never);
  });

  describe('createProject', () => {
    it('should create a project with valid data', async () => {
      const mockProject = {
        id: 'proj-1',
        project_name: 'Website Redesign',
        client_id: 'client-1',
        description: 'Complete website overhaul',
        status: 'draft',
        priority: 'high',
        total_budget: 50000,
        amount_paid: 0,
        start_date: '2024-01-01',
        end_date: '2024-06-01',
        payment_terms: 'Net 30',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        deleted_at: null,
      };

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockProject, error: null }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      const result = await service.createProject({
        project_name: 'Website Redesign',
        client_id: 'client-1',
        description: 'Complete website overhaul',
        status: 'draft',
        priority: 'high',
        total_budget: 50000,
      });

      expect(result.success).toBe(true);
      expect(result.project).toBeDefined();
      expect(result.project?.project_name).toBe('Website Redesign');
    });

    it('should return error for missing project name', async () => {
      const result = await service.createProject({
        project_name: '', // Invalid - empty name
        client_id: 'client-1',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error for missing client_id', async () => {
      const result = await service.createProject({
        project_name: 'Test Project',
        client_id: '', // Invalid - empty client_id
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

});

