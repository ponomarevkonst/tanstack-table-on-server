export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pageCount: number;
  totalCount: number;
};
