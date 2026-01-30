/**
 * Communication Service
 */

import { BaseService } from '@/shared/base-feature/domain/base.service';
import type { CommunicationLog } from '@/shared/base-feature/domain/database.types';
import type { CommunicationCreateInput, CommunicationListParams, CommunicationUpdateInput } from '../types';
import { CommunicationRepository } from './communication.repository';
import { PaginatedResponse } from '@/shared/base-feature/domain/base.types';

export class CommunicationService extends BaseService<CommunicationLog, CommunicationCreateInput, CommunicationUpdateInput> {

  constructor(private communicationRepo: CommunicationRepository) {
    super(communicationRepo)
  }

  async getCommunication(id: string) {
    return this.communicationRepo.findByIdWithRelations(id);
  }

  async getCommunications(params: CommunicationListParams): Promise<PaginatedResponse<CommunicationLog>> {
    return this.communicationRepo.findAllPaginated(params);
  }
}
