export interface ApiResponse<T = any> {
  data: T;
  message: string;
  count?: number;
}

export type SortBy = 'ASC' | 'DESC';
