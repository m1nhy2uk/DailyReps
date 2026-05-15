export type ServiceResult<T> = {
  data: T | null;
  error: string | null;
};

export type PaginatedResult<T> = {
  data: T[];
  nextCursor: string | null;
  error: string | null;
};
