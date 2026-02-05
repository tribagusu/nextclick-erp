/**
 * Base domain types
 */

import type { BaseEntity } from '@/shared/base-feature/domain/database.types';
import { restrictValue } from '@/shared/lib/utils';
import { NextURL } from 'next/dist/server/web/next-url';

export const SortOrders = {
  ASC: 'asc',
  DESC: 'desc'
} as const;
export type SortOrder = (typeof SortOrders)[keyof typeof SortOrders];

export class GetAllParams {
  public static readonly DEFAULT_PAGE = 1;
  public static readonly DEFAULT_PAGE_SIZE = 10;
  public static readonly MIN_PAGE_SIZE = 1;
  public static readonly MAX_PAGE_SIZE = 100;

  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;

  constructor(url: NextURL) {
    this.page = restrictValue(url.searchParams.get('page'), GetAllParams.DEFAULT_PAGE, Number.MAX_SAFE_INTEGER, GetAllParams.DEFAULT_PAGE);
    this.pageSize = restrictValue(url.searchParams.get('pageSize'), GetAllParams.MIN_PAGE_SIZE, GetAllParams.MAX_PAGE_SIZE, GetAllParams.DEFAULT_PAGE_SIZE);
    this.search = url.searchParams.get('search') ?? undefined;
    this.sortBy = url.searchParams.get('sortBy') ?? 'created_at';
    this.sortOrder = (url.searchParams.get('sortOrder') as SortOrder) ?? SortOrders.DESC;
  }
}

export interface PaginatedResponse<E extends BaseEntity> {
  data: E[];
  total: number;
  page: number;
  pageSize: number;
}
