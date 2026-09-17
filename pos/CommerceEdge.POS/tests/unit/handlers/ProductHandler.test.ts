import { ProductHandler, ProductLookupRequest, ProductLookupResponse, InventoryLookupRequest, InventoryLookupResponse, StockAdjustmentRequest, StockAdjustmentResponse } from '../../../src/handlers/ProductHandler';
import { Product, ProductSearchCriteria, InventoryItem, StockMovement } from '../../../src/models/Product';

describe('ProductHandler', () => {
  let handler: ProductHandler;
  const mockProductRepository = new Map<string, Product>();
  const mockInventoryRepository = new Map<string, InventoryItem>();

  beforeEach(() => {
    mockProductRepository.clear();
    mockInventoryRepository.clear();
    handler = new ProductHandler(mockProductRepository, mockInventoryRepository);
  });

  const createValidProduct = (overrides: Partial<Product> = {}): Product => ({
    productId: 'PROD-001',
    sku: 'SKU-001',
    name: 'Test Product',
    description: 'A test product',
    categoryId: 'CAT-001',
    basePrice: 19.99,
    taxRate: 8.5,
    unitOfMeasure: 'each',
    barcode: '1234567890123',
    isActive: true,
    isTaxable: true,
    requiresAgeVerification: false,
    minStockLevel: 10,
    tags: ['test'],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  });

  describe('lookup', () => {
    beforeEach(() => {
      mockProductRepository.set('PROD-001', createValidProduct());
      mockProductRepository.set('PROD-002', createValidProduct({
        productId: 'PROD-002',
        sku: 'SKU-002',
        name: 'Another Product',
        categoryId: 'CAT-002',
        barcode: '9876543210987',
        tags: ['other']
      }));
    });

    it('should find product by ID', async () => {
      const request: ProductLookupRequest = { productId: 'PROD-001' };
      const result = await handler.lookup(request);

      expect(result.success).toBe(true);
      expect(result.product).toBeDefined();
      expect(result.product!.productId).toBe('PROD-001');
    });

    it('should find product by SKU', async () => {
      const request: ProductLookupRequest = { sku: 'SKU-001' };
      const result = await handler.lookup(request);

      expect(result.success).toBe(true);
      expect(result.product).toBeDefined();
      expect(result.product!.sku).toBe('SKU-001');
    });

    it('should find product by barcode', async () => {
      const request: ProductLookupRequest = { barcode: '1234567890123' };
      const result = await handler.lookup(request);

      expect(result.success).toBe(true);
      expect(result.product).toBeDefined();
      expect(result.product!.barcode).toBe('1234567890123');
    });

    it('should return error for non-existent product by ID', async () => {
      const request: ProductLookupRequest = { productId: 'PROD-999' };
      const result = await handler.lookup(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Product not found');
    });

    it('should search products by query', async () => {
      const request: ProductLookupRequest = {
        criteria: { query: 'test', page: 1, pageSize: 20 }
      };
      const result = await handler.lookup(request);

      expect(result.success).toBe(true);
      expect(result.products).toBeDefined();
      expect(result.products!.products).toHaveLength(1);
      expect(result.products!.products[0].name).toBe('Test Product');
    });

    it('should filter by category', async () => {
      const request: ProductLookupRequest = {
        criteria: { categoryId: 'CAT-001', page: 1, pageSize: 20 }
      };
      const result = await handler.lookup(request);

      expect(result.success).toBe(true);
      expect(result.products!.products).toHaveLength(1);
      expect(result.products!.products[0].categoryId).toBe('CAT-001');
    });

    it('should filter by isActive', async () => {
      mockProductRepository.set('PROD-003', createValidProduct({ productId: 'PROD-003', isActive: false }));

      const request: ProductLookupRequest = {
        criteria: { isActive: true, page: 1, pageSize: 20 }
      };
      const result = await handler.lookup(request);

      expect(result.success).toBe(true);
      expect(result.products!.products).toHaveLength(2);
      expect(result.products!.products.every(p => p.isActive)).toBe(true);
    });

    it('should filter by price range', async () => {
      mockProductRepository.set('PROD-003', createValidProduct({ productId: 'PROD-003', basePrice: 100.00 }));
      mockProductRepository.set('PROD-004', createValidProduct({ productId: 'PROD-004', basePrice: 50.00 }));

      const request: ProductLookupRequest = {
        criteria: { minPrice: 20, maxPrice: 80, page: 1, pageSize: 20 }
      };
      const result = await handler.lookup(request);

      expect(result.success).toBe(true);
      expect(result.products!.products).toHaveLength(1);
      expect(result.products!.products[0].basePrice).toBe(50.00);
    });

    it('should filter by tags', async () => {
      mockProductRepository.set('PROD-003', createValidProduct({ productId: 'PROD-003', tags: ['electronics'] }));

      const request: ProductLookupRequest = {
        criteria: { tags: ['test'], page: 1, pageSize: 20 }
      };
      const result = await handler.lookup(request);

      expect(result.success).toBe(true);
      expect(result.products!.products).toHaveLength(1);
    });

    it('should sort results', async () => {
      const request: ProductLookupRequest = {
        criteria: { sortBy: 'name', sortOrder: 'asc', page: 1, pageSize: 20 }
      };
      const result = await handler.lookup(request);

      expect(result.success).toBe(true);
      expect(result.products!.products[0].name).toBe('Another Product');
    });
  });

  describe('getInventory', () => {
    it('should return empty array when no inventory', async () => {
      const request: InventoryLookupRequest = {};
      const result = await handler.getInventory(request);

      expect(result.success).toBe(true);
      expect(result.inventory).toEqual([]);
    });

    it('should return inventory for product', async () => {
      const product = createValidProduct();
      mockProductRepository.set('PROD-001', product);
      mockInventoryRepository.set('PROD-001-LOC-001', { productId: 'PROD-001', productName: 'Test Product', sku: 'SKU-001', quantityOnHand: 0, quantityReserved: 0, quantityAvailable: 0, reorderPoint: 10, reorderQuantity: 50, lastStockCheck: new Date(), locationId: 'LOC-001' });
      
      const request: InventoryLookupRequest = { productId: 'PROD-001' };
      const result = await handler.getInventory(request);

      expect(result.success).toBe(true);
      expect(result.inventory).toHaveLength(1);
      expect(result.inventory![0].productId).toBe('PROD-001');
      expect(result.inventory![0].quantityOnHand).toBe(0);
    });

    it('should filter by location', async () => {
      const product = createValidProduct();
      mockProductRepository.set('PROD-001', product);
      mockInventoryRepository.set('PROD-001-LOC-001', { productId: 'PROD-001', productName: 'Test Product', sku: 'SKU-001', quantityOnHand: 100, quantityReserved: 10, quantityAvailable: 90, reorderPoint: 10, reorderQuantity: 50, lastStockCheck: new Date(), locationId: 'LOC-001' });

      const request: InventoryLookupRequest = { locationId: 'LOC-001' };
      const result = await handler.getInventory(request);

      expect(result.success).toBe(true);
      expect(result.inventory).toHaveLength(1);
      expect(result.inventory![0].locationId).toBe('LOC-001');
    });

    it('should filter low stock only', async () => {
      const product = createValidProduct({ minStockLevel: 10 });
      mockProductRepository.set('PROD-001', product);
      mockInventoryRepository.set('PROD-001-LOC-001', { productId: 'PROD-001', productName: 'Test Product', sku: 'SKU-001', quantityOnHand: 5, quantityReserved: 0, quantityAvailable: 5, reorderPoint: 10, reorderQuantity: 50, lastStockCheck: new Date(), locationId: 'LOC-001' });

      const request: InventoryLookupRequest = { lowStockOnly: true };
      const result = await handler.getInventory(request);

      expect(result.success).toBe(true);
      expect(result.inventory).toHaveLength(1);
      expect(result.inventory![0].quantityAvailable).toBeLessThanOrEqual(result.inventory![0].reorderPoint);
    });
  });

  describe('adjustStock', () => {
    beforeEach(() => {
      mockProductRepository.set('PROD-001', createValidProduct());
    });

    it('should create inventory and add stock', async () => {
      const request: StockAdjustmentRequest = {
        productId: 'PROD-001',
        locationId: 'LOC-001',
        quantity: 100,
        type: 'receipt',
        reason: 'Initial stock',
        performedBy: 'USER-001'
      };
      const result = await handler.adjustStock(request);

      expect(result.success).toBe(true);
      expect(result.movement).toBeDefined();
      expect(result.newQuantity).toBe(100);
      expect(result.movement!.type).toBe('receipt');
      expect(result.movement!.quantity).toBe(100);
    });

    it('should adjust existing inventory', async () => {
      mockInventoryRepository.set('PROD-001-LOC-001', {
        productId: 'PROD-001',
        productName: 'Test Product',
        sku: 'SKU-001',
        quantityOnHand: 100,
        quantityReserved: 10,
        quantityAvailable: 90,
        reorderPoint: 10,
        reorderQuantity: 50,
        lastStockCheck: new Date(),
        locationId: 'LOC-001'
      });

      const request: StockAdjustmentRequest = {
        productId: 'PROD-001',
        locationId: 'LOC-001',
        quantity: -20,
        type: 'adjustment',
        reason: 'Damage write-off',
        performedBy: 'USER-001'
      };
      const result = await handler.adjustStock(request);

      expect(result.success).toBe(true);
      expect(result.newQuantity).toBe(80);
    });

    it('should handle stock count (set absolute quantity)', async () => {
      mockInventoryRepository.set('PROD-001-LOC-001', {
        productId: 'PROD-001',
        productName: 'Test Product',
        sku: 'SKU-001',
        quantityOnHand: 100,
        quantityReserved: 0,
        quantityAvailable: 100,
        reorderPoint: 10,
        reorderQuantity: 50,
        lastStockCheck: new Date(),
        locationId: 'LOC-001'
      });

      const request: StockAdjustmentRequest = {
        productId: 'PROD-001',
        locationId: 'LOC-001',
        quantity: 75,
        type: 'count',
        reason: 'Physical count',
        performedBy: 'USER-001'
      };
      const result = await handler.adjustStock(request);

      expect(result.success).toBe(true);
      expect(result.newQuantity).toBe(75);
    });

    it('should fail when product not found', async () => {
      const request: StockAdjustmentRequest = {
        productId: 'PROD-999',
        locationId: 'LOC-001',
        quantity: 100,
        type: 'receipt',
        reason: 'Test',
        performedBy: 'USER-001'
      };
      const result = await handler.adjustStock(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Product not found');
    });

    it('should fail when insufficient stock', async () => {
      mockInventoryRepository.set('PROD-001-LOC-001', {
        productId: 'PROD-001',
        productName: 'Test Product',
        sku: 'SKU-001',
        quantityOnHand: 10,
        quantityReserved: 0,
        quantityAvailable: 10,
        reorderPoint: 10,
        reorderQuantity: 50,
        lastStockCheck: new Date(),
        locationId: 'LOC-001'
      });

      const request: StockAdjustmentRequest = {
        productId: 'PROD-001',
        locationId: 'LOC-001',
        quantity: -20,
        type: 'adjustment',
        reason: 'Test',
        performedBy: 'USER-001'
      };
      const result = await handler.adjustStock(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient stock');
    });

    it('should record stock movement', async () => {
      const request: StockAdjustmentRequest = {
        productId: 'PROD-001',
        locationId: 'LOC-001',
        quantity: 50,
        type: 'receipt',
        reason: 'Stock receipt',
        referenceId: 'PO-001',
        referenceType: 'purchase_order',
        performedBy: 'USER-001'
      };
      const result = await handler.adjustStock(request);

      expect(result.success).toBe(true);
      expect(result.movement!.referenceId).toBe('PO-001');
      expect(result.movement!.referenceType).toBe('purchase_order');
    });
  });

  describe('getProduct', () => {
    it('should return product by ID', () => {
      mockProductRepository.set('PROD-001', createValidProduct());

      const product = handler.getProduct('PROD-001');
      expect(product).toBeDefined();
      expect(product!.productId).toBe('PROD-001');
    });

    it('should return undefined for non-existent product', () => {
      const product = handler.getProduct('PROD-999');
      expect(product).toBeUndefined();
    });
  });

  describe('getAllProducts', () => {
    it('should return all products', () => {
      mockProductRepository.set('PROD-001', createValidProduct());
      mockProductRepository.set('PROD-002', createValidProduct({ productId: 'PROD-002' }));

      const products = handler.getAllProducts();
      expect(products).toHaveLength(2);
    });
  });

  describe('getStockMovements', () => {
    it('should return all stock movements', async () => {
      mockProductRepository.set('PROD-001', createValidProduct());
      
      await handler.adjustStock({
        productId: 'PROD-001',
        locationId: 'LOC-001',
        quantity: 100,
        type: 'receipt',
        reason: 'Initial',
        performedBy: 'USER-001'
      });

      const movements = handler.getStockMovements();
      expect(movements).toHaveLength(1);
    });

    it('should filter by product', async () => {
      mockProductRepository.set('PROD-001', createValidProduct());
      mockProductRepository.set('PROD-002', createValidProduct({ productId: 'PROD-002' }));
      
      await handler.adjustStock({
        productId: 'PROD-001',
        locationId: 'LOC-001',
        quantity: 100,
        type: 'receipt',
        reason: 'Initial',
        performedBy: 'USER-001'
      });
      await handler.adjustStock({
        productId: 'PROD-002',
        locationId: 'LOC-001',
        quantity: 50,
        type: 'receipt',
        reason: 'Initial',
        performedBy: 'USER-001'
      });

      const movements = handler.getStockMovements('PROD-001');
      expect(movements).toHaveLength(1);
      expect(movements[0].productId).toBe('PROD-001');
    });
  });
});