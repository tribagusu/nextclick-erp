/**
 * Projects Feature - Domain Types
 */

import { GetAllParams } from '@/shared/base-feature/domain/base.types';
import type { BaseEntity, Project } from '@/shared/base-feature/domain/database.types';

export interface ProjectListParams extends GetAllParams, ProjectUpdateInput { }

export type ProjectCreateInput = Omit<Project, keyof BaseEntity>;

export type ProjectUpdateInput = Partial<ProjectCreateInput>;
