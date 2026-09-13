export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

export function paginate<T>(
  items: T[],
  page: number,
  limit: number,
  total: number,
): Paginated<T> {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasPrev: page > 1,
      hasNext: page < totalPages,
    },
  };
}
