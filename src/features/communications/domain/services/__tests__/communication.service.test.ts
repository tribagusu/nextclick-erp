/**
 * Communication Service Tests
 */

import { getInputCommunicationMock, getValidCommunicationMock } from '@/features/communications/domain/__tests__/mock.utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommunicationService } from '../communication.service';

describe('Communication Service', () => {
  const communicationMock = getValidCommunicationMock()
  let service: CommunicationService;

  beforeEach(() => {
    vi.clearAllMocks();
    const repositoryMock = {
      create: vi.fn().mockResolvedValue(communicationMock)
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

