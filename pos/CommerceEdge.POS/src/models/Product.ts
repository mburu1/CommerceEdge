export interface Product {
  productId: string;
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  categoryName?: string;
  basePrice: number;
  salePrice?: number;
  taxRate: number;
  unitOfMeasure: string;
  barcode?: string;
  imageUrl?: string;
  isActive: boolean;
  isTaxable: boolean;
  requiresAgeVerification: boolean;
  minStockLevel: number;
  maxStockLevel?: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  categoryId: string;
  name: string;
  description?: string;
  parentCategoryId?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ProductSearchCriteria {
  query?: string;
  categoryId?: string;
  sku?: string;
  barcode?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductSearchResult {
  products: Product[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface InventoryItem {
  productId: string;
  productName: string;
  sku: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  reorderPoint: number;
  reorderQuantity: number;
  lastStockCheck: Date;
  locationId: string;
  locationName?: string;
}

export interface StockMovement {
  movementId: string;
  productId: string;
  type: 'receipt' | 'sale' | 'return' | 'adjustment' | 'transfer' | 'count';
  quantity: number;
  referenceId?: string;
  referenceType?: string;
  notes?: string;
  createdAt: Date;
  createdBy: string;
}