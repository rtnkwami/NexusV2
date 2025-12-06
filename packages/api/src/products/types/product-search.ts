export type ProductSearchFilters = {
  searchQuery?: string;
  category?: string;
  price?: { min?: number; max?: number };
  stock?: { min?: number; max?: number };
};
