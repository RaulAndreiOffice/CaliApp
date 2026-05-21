import { PaginationParams } from "../types/common";
import type { PaginationDTO } from "../dtos/common/pagination.dto";

export const parsePagination = (query: any): PaginationParams => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  return { page, limit };
};

export const getPrismaSkip = (params: PaginationParams) => {
  return (params.page - 1) * params.limit;
};

export const buildPaginationMeta = (
  params: PaginationParams,
  total: number
): PaginationDTO => ({
  page: params.page,
  limit: params.limit,
  total,
  totalPages: Math.ceil(total / params.limit),
});
