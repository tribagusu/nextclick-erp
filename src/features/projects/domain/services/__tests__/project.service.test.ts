/**
 * Project Service Tests
 */

import { getInputProjectMock, getValidProjectMock } from '@/features/projects/domain/__tests__/mock.utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectService } from '../project.service';

describe('ProjectService', () => {
  const projectMock = getValidProjectMock();
  let service: ProjectService;
  let repositoryMock: { create: ReturnType<typeof vi.fn>; createMany: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    repositoryMock = {
      create: vi.fn().mockResolvedValue(projectMock),
      createMany: vi.fn().mockResolvedValue(2),
    };
    service = new ProjectService(repositoryMock as never);
  });

  describe('createProject', () => {
    it('should create a project with valid data', async () => {
      const project = await service.create(getInputProjectMock());
      expect(project).toBeDefined();
      expect(project).toEqual(projectMock);
    });
  });

  describe('importProjects', () => {
    const validRows = [
      { project_name: 'Project A', client_id: 'client-1', status: 'draft' as const, priority: 'medium' as const },
      { project_name: 'Project B', client_id: 'client-2', status: 'active' as const, priority: 'high' as const, description: 'A description' },
    ];

    it('should import valid rows successfully', async () => {
      const result = await service.importProjects(validRows);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(2);
    });

    it('should return error when a row fails Zod validation', async () => {
      const invalidRows = [
        { project_name: '', client_id: 'client-1', status: 'draft' as const, priority: 'medium' as const },
      ];

      const result = await service.importProjects(invalidRows);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Row 1');
    });

    it('should include row number in validation error message', async () => {
      const rows = [
        { project_name: 'Valid', client_id: 'client-1', status: 'draft' as const, priority: 'medium' as const },
        { project_name: '', client_id: 'client-2', status: 'active' as const, priority: 'high' as const },
      ];

      const result = await service.importProjects(rows);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Row 2');
    });

    it('should return error when database insert fails', async () => {
      repositoryMock.createMany.mockRejectedValueOnce({ message: 'Insert failed', code: 'ERROR' });

      const result = await service.importProjects(validRows);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insert failed');
    });

    it('should return permission denied for error code 42501', async () => {
      repositoryMock.createMany.mockRejectedValueOnce({ message: 'permission denied', code: '42501' });

      const result = await service.importProjects(validRows);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Permission denied');
    });

    it('should return error when client_id is missing', async () => {
      const rows = [
        { project_name: 'Project X', client_id: '', status: 'draft' as const, priority: 'medium' as const },
      ];

      const result = await service.importProjects(rows);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Row 1');
    });
  });

});

