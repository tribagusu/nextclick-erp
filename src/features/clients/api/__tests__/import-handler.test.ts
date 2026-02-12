/**
 * Import Clients Handler Tests
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

const importResult = { success: true, imported: 3 };
vi.mock('@/features/clients/domain/services/client.service', () => {
  return {
    ClientService: class {
      async importClients() {
        return importResult;
      }
    },
  };
});

import { handleImportClients } from '@/features/clients/api/handlers';
import { ClientService } from '@/features/clients/domain/services/client.service';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const testEndpoint = 'http://test/api/clients/import';

const validRows = [
  { name: 'Client A', email: 'a@example.com', phone: null, company_name: 'Company A', address: 'Addr A', notes: null },
  { name: 'Client B', email: null, phone: '555-1234', company_name: 'Company B', address: 'Addr B', notes: null },
  { name: 'Client C', email: 'c@example.com', phone: null, company_name: 'Company C', address: 'Addr C', notes: 'VIP' },
];

describe('handleImportClients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset default auth
    dbMock.auth.getUser.mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null });
  });

  it('returns 401 when unauthenticated', async () => {
    dbMock.auth.getUser.mockResolvedValueOnce({ data: { user: null } });

    const request = new NextRequest(testEndpoint, {
      method: 'POST',
      body: JSON.stringify({ rows: validRows }),
    });

    const response = await handleImportClients(request);

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

    const response = await handleImportClients(request);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
  });

  it('returns 400 when rows is empty', async () => {
    const request = new NextRequest(testEndpoint, {
      method: 'POST',
      body: JSON.stringify({ rows: [] }),
    });

    const response = await handleImportClients(request);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
  });

  it('returns 400 when rows exceeds 500', async () => {
    const tooManyRows = Array.from({ length: 501 }, (_, i) => ({
      name: `Client ${i}`,
      email: `c${i}@example.com`,
      phone: null,
      company_name: `Company ${i}`,
      address: `Addr ${i}`,
      notes: null,
    }));

    const request = new NextRequest(testEndpoint, {
      method: 'POST',
      body: JSON.stringify({ rows: tooManyRows }),
    });

    const response = await handleImportClients(request);

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

    const response = await handleImportClients(request);

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      success: true,
      data: { imported: 3 },
    });
  });

  it('returns 400 when service returns validation error', async () => {
    vi.spyOn(ClientService.prototype, 'importClients').mockResolvedValueOnce({
      success: false,
      error: 'Row 2: Client name is required',
    });

    const request = new NextRequest(testEndpoint, {
      method: 'POST',
      body: JSON.stringify({ rows: validRows }),
    });

    const response = await handleImportClients(request);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.message).toContain('Row 2');
  });
});
