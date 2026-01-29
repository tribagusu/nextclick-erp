/**
 * Communication Service
 */

import { BaseRepository } from '@/shared/base-feature/domain/base.repository';
import { GetAllParams, PaginatedResponse } from '@/shared/base-feature/domain/base.types';
import type { BaseEntity } from '@/shared/base-feature/domain/database.types';

export abstract class BaseService<Entity extends BaseEntity, CreateInput, UpdateInput> {
  constructor(protected readonly repository: BaseRepository<Entity, CreateInput, UpdateInput>) {
    this.repository = repository;
  }

  async getAll<ListParams extends GetAllParams>(params: ListParams): Promise<PaginatedResponse<Entity>> {
    return this.repository.findAllPaginated(params);
  }

  async create(input: Partial<CreateInput>): Promise<Entity> {
    return await this.repository.create(input);
  }

  async update(id: string, input: UpdateInput): Promise<Entity> {
    return await this.repository.update(id, input);
  }

  async delete(id: string) {
    await this.repository.softDelete(id);
  }
}
