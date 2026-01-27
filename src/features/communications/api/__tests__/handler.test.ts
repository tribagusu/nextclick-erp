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
      createCommunication = vi.fn().mockResolvedValue(communicationMock);
    },
  };
});

import { getInputCommunicationMock, getInvalidCommunicationMock, getValidCommunicationMock } from '@/features/communications/domain/mock.utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleCreateCommunication } from '@/features/communications/api/handlers';


const testEndpoint = 'http://test';
describe('Communication Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      expect(await response.json()).toMatchObject({
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
      expect(await response.json()).toMatchObject({
        success: true,
        data: communicationMock,
      });
    });


    it('returns 400 validation error for invalid fields and details for each error', async () => {
      const input = getInvalidCommunicationMock();
      const request = new Request(testEndpoint, {
        method: 'POST',
        body: JSON.stringify(input),
      });
      const response = await handleCreateCommunication(request)

      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({
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

});

