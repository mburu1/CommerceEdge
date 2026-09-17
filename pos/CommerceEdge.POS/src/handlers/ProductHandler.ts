import { Product, ProductSearchCriteria, ProductSearchResult, InventoryItem, StockMovement } from '../models/Product';

export interface ProductLookupRequest {
  productId?: string;
  sku?: string;
  barcode?: string;
  criteria?: ProductSearchCriteria;
}

export interface ProductLookupResponse {
  success: boolean;
  product?: Product;
  products?: ProductSearchResult;
  message?: string;
  error?: string;
}

export interface InventoryLookupRequest {
  productId?: string;
  locationId?: string;
  lowStockOnly?: boolean;
}

export interface InventoryLookupResponse {
  success: boolean;
  inventory?: InventoryItem[];
  message?: string;
  error?: string;
}

export interface StockAdjustmentRequest {
  productId: string;
  locationId: string;
  quantity: number;
  type: 'receipt' | 'adjustment' | 'transfer' | 'count';
  reason: string;
  referenceId?: string;
  referenceType?: string;
  performedBy: string;
}

export interface StockAdjustmentResponse {
  success: boolean;
  movement?: StockMovement;
  newQuantity?: number;
  message?: string;
  error?: string;
}

export class ProductHandler {
  private products: Map<string, Product> = new Map();
  private inventory: Map<string, InventoryItem> = new Map();
  private stockMovements: StockMovement[] = [];
  private productCounter: number = 0;
  private movementCounter: number = 0;

  constructor(
    private readonly productRepository?: Map<string, Product>,
    private readonly inventoryRepository?: Map<string, InventoryItem>
  ) {
    if (productRepository) this.products = productRepository;
    if (inventoryRepository) this.inventory = inventoryRepository;
  }

  async lookup(request: ProductLookupRequest): Promise<ProductLookupResponse> {
    if (request.productId) {
      const product = this.products.get(request.productId);
      if (product) {
        return { success: true, product, message: 'Product found' };
      }
      return { success: false, error: 'Product not found' };
    }

    if (request.sku) {
      const product = Array.from(this.products.values()).find(p => p.sku === request.sku);
      if (product) {
        return { success: true, product, message: 'Product found' };
      }
      return { success: false, error: 'Product not found' };
    }

    if (request.barcode) {
      const product = Array.from(this.products.values()).find(p => p.barcode === request.barcode);
      if (product) {
        return { success: true, product, message: 'Product found' };
      }
      return { success: false, error: 'Product not found' };
    }

    if (request.criteria) {
      let results = Array.from(this.products.values());

      if (request.criteria.query) {
        const query = request.criteria.query.toLowerCase();
        results = results.filter(p => 
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.barcode?.toLowerCase().includes(query) ||
          p.tags.some(t => t.toLowerCase().includes(query))
        );
      }

      if (request.criteria.categoryId) {
        results = results.filter(p => p.categoryId === request.criteria!.categoryId);
      }

      if (request.criteria.isActive !== undefined) {
        results = results.filter(p => p.isActive === request.criteria!.isActive);
      }

      if (request.criteria.minPrice !== undefined) {
        results = results.filter(p => p.basePrice >= request.criteria!.minPrice!);
      }

      if (request.criteria.maxPrice !== undefined) {
        results = results.filter(p => p.basePrice <= request.criteria!.maxPrice!);
      }

      if (request.criteria.tags && request.criteria.tags.length > 0) {
        results = results.filter(p => request.criteria!.tags!.some(t => p.tags.includes(t)));
      }

      const sortBy = request.criteria.sortBy || 'name';
      const sortOrder = request.criteria.sortOrder || 'asc';
      results.sort((a, b) => {
        const aVal = a[sortBy as keyof Product] ?? '';
        const bVal = b[sortBy as keyof Product] ?? '';
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      const page = request.criteria.page || 1;
      const pageSize = request.criteria.pageSize || 20;
      const start = (page - 1) * pageSize;
      const paginated = results.slice(start, start + pageSize);

      return {
        success: true,
        products: {
          products: paginated,
          totalCount: results.length,
          page,
          pageSize
        },
        message: 'Search completed'
      };
    }

    return { success: false, error: 'No search criteria provided' };
  }

  async getInventory(request: InventoryLookupRequest): Promise<InventoryLookupResponse> {
    let results = Array.from(this.inventory.values());

    if (request.productId) {
      results = results.filter(i => i.productId === request.productId);
    }

    if (request.locationId) {
      results = results.filter(i => i.locationId === request.locationId);
    }

    if (request.lowStockOnly) {
      results = results.filter(i => i.quantityAvailable <= i.reorderPoint);
    }

    return {
      success: true,
      inventory: results,
      message: 'Inventory lookup completed'
    };
  }

  async adjustStock(request: StockAdjustmentRequest): Promise<StockAdjustmentResponse> {
    const inventoryKey = `${request.productId}-${request.locationId}`;
    let inventoryItem = this.inventory.get(inventoryKey);

    if (!inventoryItem) {
      const product = this.products.get(request.productId);
      if (!product) {
        return { success: false, error: 'Product not found' };
      }

      inventoryItem = {
        productId: request.productId,
        productName: product.name,
        sku: product.sku,
        quantityOnHand: 0,
        quantityReserved: 0,
        quantityAvailable: 0,
        reorderPoint: product.minStockLevel,
        reorderQuantity: product.maxStockLevel || product.minStockLevel * 2,
        lastStockCheck: new Date(),
        locationId: request.locationId
      };
      this.inventory.set(inventoryKey, inventoryItem);
    }

    const previousQuantity = inventoryItem.quantityOnHand;
    let newQuantity = previousQuantity;

    switch (request.type) {
      case 'receipt':
      case 'adjustment':
        newQuantity = previousQuantity + request.quantity;
        break;
      case 'transfer':
        newQuantity = previousQuantity + request.quantity;
        break;
      case 'count':
        newQuantity = request.quantity;
        break;
    }

    if (newQuantity < 0) {
      return { success: false, error: 'Insufficient stock' };
    }

    inventoryItem.quantityOnHand = newQuantity;
    inventoryItem.quantityAvailable = newQuantity - inventoryItem.quantityReserved;
    inventoryItem.lastStockCheck = new Date();

    this.movementCounter++;
    const movement: StockMovement = {
      movementId: `MOV-${this.movementCounter.toString().padStart(10, '0')}`,
      productId: request.productId,
      type: request.type,
      quantity: request.type === 'count' ? newQuantity - previousQuantity : request.quantity,
      referenceId: request.referenceId,
      referenceType: request.referenceType,
      notes: request.reason,
      createdAt: new Date(),
      createdBy: request.performedBy
    };

    this.stockMovements.push(movement);

    return {
      success: true,
      movement,
      newQuantity,
      message: 'Stock adjusted successfully'
    };
  }

  getProduct(productId: string): Product | undefined {
    return this.products.get(productId);
  }

  getAllProducts(): Product[] {
    return Array.from(this.products.values());
  }

  getStockMovements(productId?: string, locationId?: string): StockMovement[] {
    let movements = this.stockMovements;
    if (productId) movements = movements.filter(m => m.productId === productId);
    if (locationId) movements = movements.filter(m => m.referenceId?.includes(locationId));
    return movements;
  }
}