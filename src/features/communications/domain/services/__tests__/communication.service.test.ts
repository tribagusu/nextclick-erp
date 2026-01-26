/**
 * Communication Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommunicationService } from '../communication.service';
import { getInputCommunicationMock, getValidCommunicationMock } from '@/features/communications/domain/mock.utils';

// Mock the Supabase client
const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
  },
};

describe('Communication Service', () => {
  let service: CommunicationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CommunicationService(mockSupabase as never);
  });

  describe('createCommunication', () => {
    it('should create a communication with valid data', async () => {
      const communicationMock = getValidCommunicationMock();

      // mocks repository calls
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: communicationMock, error: null }),
          }),
        }),
      });

      const communication = await service.createCommunication(getInputCommunicationMock());

      expect(communication).toBeDefined();
       expect(communication).toEqual(communicationMock);
    });
  });

});

