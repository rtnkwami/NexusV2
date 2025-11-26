export type ProductSearchFilters = {
  searchQuery?: string;
  price?: { min?: number; max?: number };
  stock?: { min?: number; max?: number };
};
