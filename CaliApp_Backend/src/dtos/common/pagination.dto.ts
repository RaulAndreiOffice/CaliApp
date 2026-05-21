export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponseDTO<T> {
  data: T[];
  meta: PaginationDTO;
}
