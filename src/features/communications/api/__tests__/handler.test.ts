/**
 * Communication Handler Tests
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

const communicationMock = getValidCommunicationMock();
vi.mock('@/features/communications/domain/services/communication.service', () => {
  return {
    CommunicationService: class {
      async getCommunication() {
        return communicationMock;
      }
      async getCommunications() {
        return {
          data: [communicationMock],
          total: 1,
          page: 2,
          pageSize: 1,
        };
      }
      async create() {
        return communicationMock;
      }
      async update() {
        return communicationMock;
      }
      async delete() {
        return;
      }
    },
  };
});

import { getInputCommunicationMock, getInvalidCommunicationMock, getValidCommunicationMock } from '@/features/communications/domain/mock.utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleCreateCommunication, handleDeleteCommunication, handleGetCommunication, handleGetCommunications, handleUpdateCommunication } from '@/features/communications/api/handlers';
import { withParams } from '@/shared/base-feature/test-utils';
import { CommunicationService } from '@/features/communications/domain/services/communication.service';


const testEndpoint = 'http://test';
describe('Communication Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleGetCommunications', () => {
    it('returns 401 when unauthorized user', async () => {
      dbMock.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });
      const request = new Request(testEndpoint, {
        method: 'READ',
        body: JSON.stringify({}),
      });
      const response = await handleGetCommunications(request)

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
      const request = new Request(testEndpoint + '?page=2&page_size=10&search=&sortBy=mode&sortOrder=asc', {
        method: 'READ',
        body: JSON.stringify({}),
      });
      const response = await handleGetCommunications(request)

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        success: true,
        data: [communicationMock],
        meta: {
          total: 1,
          page: 2,
          pageSize: 1,
        }
      });
    });
  });

  describe('handleGetCommunication', () => {
    it('returns 401 when unauthorized user', async () => {
      dbMock.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });
      const request = new Request(testEndpoint, {
        method: 'READ',
        body: JSON.stringify({}),
      });
      const response = await handleGetCommunication(request, withParams({ id: communicationMock.id }))

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
      const request = new Request(testEndpoint, {
        method: 'READ',
        body: JSON.stringify({}),
      });
      const response = await handleGetCommunication(request, withParams({ id: communicationMock.id }))

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        success: true,
        data: communicationMock
      });
    });

    it('returns 400 validation error for invalid param and details for each error', async () => {
      const request = new Request(testEndpoint, {
        method: 'READ',
        body: JSON.stringify({}),
      });
      const response = await handleGetCommunication(request, withParams({ id: 'invalid-id' }))

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Failed to read Communication Log',
          details: {
            id: 'Invalid UUID format'
          }
        }
      });
    });

    it('returns 404 not found error when resource is not found', async () => {
      vi
        .spyOn(CommunicationService.prototype, 'getCommunication')
        .mockResolvedValueOnce(null);
      const request = new Request(testEndpoint, {
        method: 'READ',
        body: JSON.stringify({}),
      });
      const response = await handleGetCommunication(request, withParams({ id: crypto.randomUUID() }))

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Communication Log not found',
        }
      });
    });
  });

  describe('handleCreateCommunication', () => {
    it('returns 401 when unauthorized user', async () => {
      dbMock.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });
      const request = new Request(testEndpoint, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const response = await handleCreateCommunication(request)

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
      const request = new Request(testEndpoint, {
        method: 'POST',
        body: JSON.stringify(getInputCommunicationMock()),
      });
      const response = await handleCreateCommunication(request)

      expect(response.status).toBe(201);
      expect(await response.json()).toEqual({
        success: true,
        data: communicationMock,
      });
    });

    it('returns 400 validation error for invalid fields and details for each error', async () => {
      const request = new Request(testEndpoint, {
        method: 'POST',
        body: JSON.stringify(getInvalidCommunicationMock()),
      });
      const response = await handleCreateCommunication(request)

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Failed to create Communication Log',
          details: {
            client_id: 'Client is required',
            date: 'Date is required',
            mode: 'Invalid option: expected one of "email"|"call"|"meeting"',
            summary: 'Summary must be at least 10 characters',
            follow_up_required: 'Invalid input: expected boolean, received number'
          }
        }
      });
    });
  });

  describe('handleUpdateCommunication', () => {
    it('returns 401 when unauthorized user', async () => {
      dbMock.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });
      const request = new Request(testEndpoint, {
        method: 'PUT',
        body: JSON.stringify({}),
      });
      const response = await handleUpdateCommunication(request, withParams({ id: communicationMock.id }))

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
      const request = new Request(testEndpoint, {
        method: 'PUT',
        body: JSON.stringify(getInputCommunicationMock()),
      });
      const response = await handleUpdateCommunication(request, withParams({ id: communicationMock.id }))

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        success: true,
        data: communicationMock,
      });
    });

    it('returns 400 validation error for invalid fields or param and details for each error', async () => {
      const request = new Request(testEndpoint, {
        method: 'PUT',
        body: JSON.stringify(getInvalidCommunicationMock()),
      });
      const response = await handleUpdateCommunication(request, withParams({ id: 'invalid-id' }))

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Failed to update Communication Log',
          details: {
            id: 'Invalid UUID format',
            client_id: 'Client is required',
            date: 'Date is required',
            mode: 'Invalid option: expected one of "email"|"call"|"meeting"',
            summary: 'Summary must be at least 10 characters',
            follow_up_required: 'Invalid input: expected boolean, received number'
          }
        }
      });
    });
  });

  describe('handleDeleteCommunication', () => {
    it('returns 401 when unauthorized user', async () => {
      dbMock.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });
      const request = new Request(testEndpoint, {
        method: 'DELETE',
        body: JSON.stringify({}),
      });
      const response = await handleDeleteCommunication(request, withParams({ id: communicationMock.id }))

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
      const request = new Request(testEndpoint, {
        method: 'DELETE',
        body: JSON.stringify({}),
      });
      const response = await handleDeleteCommunication(request, withParams({ id: communicationMock.id }))

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        success: true,
        data: {
          "message": "Communication Log deleted successfully"
        }
      });
    });

    it('returns 400 validation error for invalid param and details for each error', async () => {
      const request = new Request(testEndpoint, {
        method: 'DELETE',
        body: JSON.stringify({}),
      });
      const response = await handleDeleteCommunication(request, withParams({ id: 'invalid-id' }))

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Failed to delete Communication Log',
          details: {
            id: 'Invalid UUID format'
          }
        }
      });
    });
  });
});

