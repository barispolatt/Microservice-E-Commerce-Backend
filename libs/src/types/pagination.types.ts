export type SortOrder = 'asc' | 'desc';

export interface PaginationOptions {
    page?: number;
    limit?: number;
    sort?: string;
    order?: SortOrder;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}