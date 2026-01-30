/**
 * Communication Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommunicationService } from '../communication.service';
import { getInputCommunicationMock, getValidCommunicationMock } from '@/features/communications/domain/mock.utils';

describe('Communication Service', () => {
  const communicationMock = getValidCommunicationMock()
  let service: CommunicationService;

  beforeEach(() => {
    vi.clearAllMocks();
    const  repositoryMock = {
      create: vi.fn().mockReturnValue(communicationMock)
    }
    service = new CommunicationService(repositoryMock as never);
  });

  describe('createCommunication', () => {
    it('should create a communication with valid data', async () => {
      const communication = await service.create(getInputCommunicationMock());
      expect(communication).toBeDefined();
       expect(communication).toEqual(communicationMock);
    });
  });

});

