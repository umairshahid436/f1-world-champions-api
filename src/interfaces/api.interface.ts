export interface ApiResponse<T = unknown> {
  data: T;
  message: string;
  count?: number;
}

export type SortBy = 'ASC' | 'DESC';
