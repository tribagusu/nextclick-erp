/**
 * Project Handler Tests
 */

// =============================================================================
// File Based Mocks
// =============================================================================
const dbMock = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
  },
};
vi.mock('../../../../../supabase/server', () => {
  return {
    createClient: vi.fn(() => dbMock),
  };
});

const projectMock = getValidProjectMock();
vi.mock('@/features/projects/domain/services/project.service', () => {
  return {
    ProjectService: class {
      async getProject() {
        return projectMock;
      }
      async getProjects() {
        return {
          data: [projectMock],
          total: 1,
          page: 2,
          pageSize: 1,
        };
      }
      async create() {
        return projectMock;
      }
      async update() {
        return projectMock;
      }
      async delete() {
        return;
      }
    },
  };
});

import { handleCreateProject, handleDeleteProject, handleGetProject, handleGetProjects, handleUpdateProject } from '@/features/projects/api/handlers';
import { getInputProjectMock, getInvalidProjectMock, getValidProjectMock } from '@/features/projects/domain/__tests__/mock.utils';
import { ProjectService } from '@/features/projects/domain/services/project.service';
import { RequestContext } from '@/shared/base-feature/api/request-context.wrapper';
import { withParams } from '@/shared/base-feature/test-utils';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';


const testEndpoint = 'http://test';
describe('Project Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    try {
      RequestContext.set({});
    } catch {
      // ignore if context was never initialized
    }
  });

  describe('handleGetProjects', () => {
    it('returns 401 when unauthorized user', async () => {
      dbMock.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });
      const request = new NextRequest(testEndpoint, {
        method: 'READ',
        body: JSON.stringify({}),
      });
      const response = await handleGetProjects(request, withParams({}))

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        }
      });
    })

    it('returns 200 when data is valid and service succeeds', async () => {
      const request = new NextRequest(testEndpoint + '?page=2&page_size=10&search=&sortBy=mode&sortOrder=asc', {
        method: 'READ',
        body: JSON.stringify({}),
      });
      const response = await handleGetProjects(request, withParams({}))

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        success: true,
        data: {
          data: [projectMock],
          total: 1,
          page: 2,
          pageSize: 1,
        },
      });
    });
  });

  describe('handleGetProject', () => {
    it('returns 401 when unauthorized user', async () => {
      dbMock.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });
      const request = new NextRequest(testEndpoint, {
        method: 'READ',
        body: JSON.stringify({}),
      });
      const response = await handleGetProject(request, withParams({ id: projectMock.id }))

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        }
      });
    })

    it('returns 200 when data is valid and service succeeds', async () => {
      const request = new NextRequest(testEndpoint, {
        method: 'READ',
        body: JSON.stringify({}),
      });
      const response = await handleGetProject(request, withParams({ id: projectMock.id }))

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        success: true,
        data: projectMock
      });
    });

    it('returns 400 INVALID_PATH_PARAM error for invalid param and details for each error', async () => {
      const request = new NextRequest(testEndpoint, {
        method: 'READ',
        body: JSON.stringify({}),
      });
      const response = await handleGetProject(request, withParams({ id: 'invalid-id' }))

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        success: false,
        error: {
          code: 'INVALID_ROUTE_PARAM',
          message: 'Failed to read Project',
          details: {
            id: 'Invalid UUID format'
          }
        }
      });
    });

    it('returns 404 not found error when resource is not found', async () => {
      vi
        .spyOn(ProjectService.prototype, 'getProject')
        .mockResolvedValueOnce(null);
      const request = new NextRequest(testEndpoint, {
        method: 'READ',
        body: JSON.stringify({}),
      });
      const response = await handleGetProject(request, withParams({ id: crypto.randomUUID() }))

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found',
        }
      });
    });
  });

  describe('handleCreateProject', () => {
    it('returns 401 when unauthorized user', async () => {
      dbMock.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });
      const request = new NextRequest(testEndpoint, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const response = await handleCreateProject(request, withParams({}))

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        }
      });
    });

    it('returns 201 when data is valid and service succeeds', async () => {
      const request = new NextRequest(testEndpoint, {
        method: 'POST',
        body: JSON.stringify(getInputProjectMock()),
      });
      const response = await handleCreateProject(request, withParams({}))

      expect(response.status).toBe(201);
      expect(await response.json()).toEqual({
        success: true,
        data: projectMock,
      });
    });

    it('returns 400 VALIDATION_ERROR for invalid fields and details for each error', async () => {
      const request = new NextRequest(testEndpoint, {
        method: 'POST',
        body: JSON.stringify(getInvalidProjectMock()),
      });
      const response = await handleCreateProject(request, withParams({}))

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          details: {
            amount_paid: 'Invalid input: expected number, received string',
            client_id: 'Please select a client for this project',
            payment_terms: 'Invalid input: expected string, received number',
            project_name: 'Project name must be at least 2 characters',
            total_budget: 'Invalid input: expected number, received string',
          },
          message: "Failed to create Project",
        },
      });
    });
  });

  describe('handleUpdateProject', () => {
    it('returns 401 when unauthorized user', async () => {
      dbMock.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });
      const request = new NextRequest(testEndpoint, {
        method: 'PUT',
        body: JSON.stringify({}),
      });
      const response = await handleUpdateProject(request, withParams({ id: projectMock.id }))

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        }
      });
    })

    it('returns 200 when data is valid and service succeeds', async () => {
      const request = new NextRequest(testEndpoint, {
        method: 'PUT',
        body: JSON.stringify(getInputProjectMock()),
      });
      const response = await handleUpdateProject(request, withParams({ id: projectMock.id }))

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        success: true,
        data: projectMock,
      });
    });

    it('returns 400 VALIDATION_ERROR code for invalid fields', async () => {
      const request = new NextRequest(testEndpoint, {
        method: 'PUT',
        body: JSON.stringify(getInvalidProjectMock()),
      });
      const response = await handleUpdateProject(request, withParams({ id: projectMock.id }))

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          details: {
            amount_paid: 'Invalid input: expected number, received string',
            client_id: 'Please select a client for this project',
            payment_terms: 'Invalid input: expected string, received number',
            project_name: 'Project name must be at least 2 characters',
            total_budget: 'Invalid input: expected number, received string',
          },
          message: "Failed to update Project",
        },
      });
    });

    it('returns 400 INVALID_ROUTE_PARAM code for invalid path param', async () => {
      const request = new NextRequest(testEndpoint, {
        method: 'PUT',
        body: JSON.stringify(getInvalidProjectMock()),
      });
      const response = await handleUpdateProject(request, withParams({ id: 'invalid-id' }))

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        success: false,
        error: {
          code: 'INVALID_ROUTE_PARAM',
          message: 'Failed to update Project',
          details: {
            id: 'Invalid UUID format',
          }
        }
      });
    });
  });

  describe('handleDeleteProject', () => {
    it('returns 401 when unauthorized user', async () => {
      dbMock.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });
      const request = new NextRequest(testEndpoint, {
        method: 'DELETE',
        body: JSON.stringify({}),
      });
      const response = await handleDeleteProject(request, withParams({ id: projectMock.id }))

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        }
      });
    })

    it('returns 200 when data is valid and service succeeds', async () => {
      const request = new NextRequest(testEndpoint, {
        method: 'DELETE',
        body: JSON.stringify({}),
      });
      const response = await handleDeleteProject(request, withParams({ id: projectMock.id }))

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        success: true,
        data: {
          "message": "Project deleted successfully"
        }
      });
    });

    it('returns 400 INVALID_ROUTE_PARAM error for invalid param and details for each error', async () => {
      const request = new NextRequest(testEndpoint, {
        method: 'DELETE',
        body: JSON.stringify({}),
      });
      const response = await handleDeleteProject(request, withParams({ id: 'invalid-id' }))

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        success: false,
        error: {
          code: 'INVALID_ROUTE_PARAM',
          message: 'Failed to delete Project',
          details: {
            id: 'Invalid UUID format'
          }
        }
      });
    });
  });
});