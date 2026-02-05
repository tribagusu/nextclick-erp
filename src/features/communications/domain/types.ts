/**
 * Communications Feature - Domain Types
 */

import { GetAllParams } from '@/shared/base-feature/domain/base.types';
import type { BaseEntity, CommunicationLog } from '@/shared/base-feature/domain/database.types';

export interface CommunicationListParams extends GetAllParams, CommunicationUpdateInput { }

export type CommunicationCreateInput = Omit<CommunicationLog, keyof BaseEntity>;

export type CommunicationUpdateInput = Partial<CommunicationCreateInput>;
