/**
 * Project Service Tests
 */

import { getInputProjectMock, getValidProjectMock } from '@/features/projects/domain/__tests__/mock.utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectService } from '../project.service';

describe('ProjectService', () => {
  const projectMock = getValidProjectMock()
  let service: ProjectService;

  beforeEach(() => {
    vi.clearAllMocks();
    const repositoryMock = {
      create: vi.fn().mockResolvedValue(projectMock)
    }
    service = new ProjectService(repositoryMock as never);
  });

  describe('createProject', () => {
    it('should create a project with valid data', async () => {
      const project = await service.create(getInputProjectMock());
      expect(project).toBeDefined();
      expect(project).toEqual(projectMock);
    });
  });

});

