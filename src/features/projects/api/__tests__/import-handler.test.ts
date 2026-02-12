/**
 * Import Projects Handler Tests
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

const importResult = { success: true, imported: 2 };
vi.mock('@/features/projects/domain/services/project.service', () => {
  return {
    ProjectService: class {
      async importProjects() {
        return importResult;
      }
    },
  };
});
vi.mock('@/features/projects/domain/services/project.repository', () => {
  return {
    ProjectRepository: class {},
  };
});

import { handleImportProjects } from '@/features/projects/api/handlers';
import { ProjectService } from '@/features/projects/domain/services/project.service';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const testEndpoint = 'http://test/api/projects/import';

const clientsMock = [
  { id: 'client-uuid-1', name: 'Acme Corp' },
  { id: 'client-uuid-2', name: 'Beta LLC' },
];

const validRows = [
  { project_name: 'Project A', client_name: 'Acme Corp', status: 'draft', priority: 'medium' },
  { project_name: 'Project B', client_name: 'Beta LLC', status: 'active', priority: 'high' },
];

function mockClientsLookup(data = clientsMock, error: unknown = null) {
  dbMock.from.mockReturnValue({
    select: vi.fn().mockReturnValue({
      is: vi.fn().mockResolvedValue({ data, error }),
    }),
  });
}

describe('handleImportProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset default auth
    dbMock.auth.getUser.mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null });
    // Default: clients lookup succeeds
    mockClientsLookup();
  });

  it('returns 401 when unauthenticated', async () => {
    dbMock.auth.getUser.mockResolvedValueOnce({ data: { user: null } });

    const request = new NextRequest(testEndpoint, {
      method: 'POST',
      body: JSON.stringify({ rows: validRows }),
    });

    const response = await handleImportProjects(request);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    });
  });

  it('returns 400 when rows is not an array', async () => {
    const request = new NextRequest(testEndpoint, {
      method: 'POST',
      body: JSON.stringify({ rows: 'not-an-array' }),
    });

    const response = await handleImportProjects(request);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
  });

  it('returns 400 when rows is empty', async () => {
    const request = new NextRequest(testEndpoint, {
      method: 'POST',
      body: JSON.stringify({ rows: [] }),
    });

    const response = await handleImportProjects(request);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
  });

  it('returns 400 when rows exceeds 500', async () => {
    const tooManyRows = Array.from({ length: 501 }, (_, i) => ({
      project_name: `Project ${i}`,
      client_name: 'Acme Corp',
      status: 'draft',
      priority: 'medium',
    }));

    const request = new NextRequest(testEndpoint, {
      method: 'POST',
      body: JSON.stringify({ rows: tooManyRows }),
    });

    const response = await handleImportProjects(request);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.message).toContain('500');
  });

  it('returns 201 with imported count on success', async () => {
    const request = new NextRequest(testEndpoint, {
      method: 'POST',
      body: JSON.stringify({ rows: validRows }),
    });

    const response = await handleImportProjects(request);

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      success: true,
      data: { imported: 2 },
    });
  });

  it('returns 400 when client_name is not found', async () => {
    const rows = [
      { project_name: 'Project X', client_name: 'Unknown Co', status: 'draft', priority: 'medium' },
    ];

    const request = new NextRequest(testEndpoint, {
      method: 'POST',
      body: JSON.stringify({ rows }),
    });

    const response = await handleImportProjects(request);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.message).toContain('Client "Unknown Co" not found');
    expect(json.error.message).toContain('Row 1');
  });

  it('returns 400 when client_name is empty', async () => {
    const rows = [
      { project_name: 'Project X', client_name: '', status: 'draft', priority: 'medium' },
    ];

    const request = new NextRequest(testEndpoint, {
      method: 'POST',
      body: JSON.stringify({ rows }),
    });

    const response = await handleImportProjects(request);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.message).toContain('Row 1');
    expect(json.error.message).toContain('Client name is required');
  });

  it('resolves client names case-insensitively', async () => {
    const rows = [
      { project_name: 'Project A', client_name: 'acme corp', status: 'draft', priority: 'medium' },
      { project_name: 'Project B', client_name: 'BETA LLC', status: 'active', priority: 'high' },
    ];

    const request = new NextRequest(testEndpoint, {
      method: 'POST',
      body: JSON.stringify({ rows }),
    });

    const response = await handleImportProjects(request);

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      success: true,
      data: { imported: 2 },
    });
  });

  it('returns 400 when service returns validation error', async () => {
    vi.spyOn(ProjectService.prototype, 'importProjects').mockResolvedValueOnce({
      success: false,
      error: 'Row 1: Project name must be at least 2 characters',
    });

    const request = new NextRequest(testEndpoint, {
      method: 'POST',
      body: JSON.stringify({ rows: validRows }),
    });

    const response = await handleImportProjects(request);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.message).toContain('Row 1');
  });
});
