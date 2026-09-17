import { Product, ProductCategory, ProductSearchCriteria, ProductSearchResult, InventoryItem, StockMovement } from '../../../src/models/Product';

describe('Product Model', () => {
  const createValidProduct = (overrides: Partial<Product> = {}): Product => ({
    productId: 'PROD-001',
    sku: 'SKU-001',
    name: 'Test Product',
    description: 'A test product',
    categoryId: 'CAT-001',
    categoryName: 'Test Category',
    basePrice: 19.99,
    salePrice: 14.99,
    taxRate: 8.5,
    unitOfMeasure: 'each',
    barcode: '1234567890123',
    imageUrl: 'https://example.com/product.jpg',
    isActive: true,
    isTaxable: true,
    requiresAgeVerification: false,
    minStockLevel: 10,
    maxStockLevel: 100,
    tags: ['test', 'sample'],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  });

  const createValidCategory = (overrides: Partial<ProductCategory> = {}): ProductCategory => ({
    categoryId: 'CAT-001',
    name: 'Test Category',
    description: 'A test category',
    parentCategoryId: undefined,
    isActive: true,
    sortOrder: 1,
    ...overrides
  });

  describe('Product interface', () => {
    it('should create a valid product', () => {
      const product = createValidProduct();
      expect(product.productId).toBe('PROD-001');
      expect(product.sku).toBe('SKU-001');
      expect(product.name).toBe('Test Product');
      expect(product.basePrice).toBe(19.99);
      expect(product.salePrice).toBe(14.99);
      expect(product.taxRate).toBe(8.5);
      expect(product.isActive).toBe(true);
      expect(product.isTaxable).toBe(true);
    });

    it('should handle optional fields', () => {
      const product = createValidProduct({
        description: undefined,
        salePrice: undefined,
        barcode: undefined,
        imageUrl: undefined,
        categoryName: undefined,
        maxStockLevel: undefined
      });
      
      expect(product.description).toBeUndefined();
      expect(product.salePrice).toBeUndefined();
      expect(product.barcode).toBeUndefined();
      expect(product.imageUrl).toBeUndefined();
    });

    it('should handle age verification flag', () => {
      const product = createValidProduct({ requiresAgeVerification: true });
      expect(product.requiresAgeVerification).toBe(true);
    });

    it('should handle taxable flag', () => {
      const product = createValidProduct({ isTaxable: false });
      expect(product.isTaxable).toBe(false);
    });

    it('should handle tags array', () => {
      const product = createValidProduct({ tags: ['electronics', 'sale', 'featured'] });
      expect(product.tags).toHaveLength(3);
      expect(product.tags).toContain('electronics');
    });
  });

  describe('ProductCategory interface', () => {
    it('should create a valid category', () => {
      const category = createValidCategory();
      expect(category.categoryId).toBe('CAT-001');
      expect(category.name).toBe('Test Category');
      expect(category.isActive).toBe(true);
      expect(category.sortOrder).toBe(1);
    });

    it('should handle parent category', () => {
      const category = createValidCategory({ parentCategoryId: 'CAT-000' });
      expect(category.parentCategoryId).toBe('CAT-000');
    });
  });

  describe('ProductSearchCriteria', () => {
    it('should create valid search criteria', () => {
      const criteria: ProductSearchCriteria = {
        query: 'test',
        categoryId: 'CAT-001',
        isActive: true,
        minPrice: 10,
        maxPrice: 100,
        tags: ['electronics'],
        page: 1,
        pageSize: 20,
        sortBy: 'price',
        sortOrder: 'asc'
      };
      
      expect(criteria.query).toBe('test');
      expect(criteria.categoryId).toBe('CAT-001');
      expect(criteria.minPrice).toBe(10);
      expect(criteria.maxPrice).toBe(100);
      expect(criteria.sortBy).toBe('price');
      expect(criteria.sortOrder).toBe('asc');
    });
  });

  describe('ProductSearchResult', () => {
    it('should create valid search result', () => {
      const products = [createValidProduct({ productId: 'PROD-001' })];
      const result: ProductSearchResult = {
        products,
        totalCount: 1,
        page: 1,
        pageSize: 20
      };
      
      expect(result.products).toHaveLength(1);
      expect(result.totalCount).toBe(1);
    });
  });

  describe('InventoryItem', () => {
    it('should create valid inventory item', () => {
      const item: InventoryItem = {
        productId: 'PROD-001',
        productName: 'Test Product',
        sku: 'SKU-001',
        quantityOnHand: 50,
        quantityReserved: 5,
        quantityAvailable: 45,
        reorderPoint: 10,
        reorderQuantity: 100,
        lastStockCheck: new Date(),
        locationId: 'LOC-001',
        locationName: 'Main Warehouse'
      };
      
      expect(item.quantityOnHand).toBe(50);
      expect(item.quantityAvailable).toBe(45);
      expect(item.locationId).toBe('LOC-001');
    });
  });

  describe('StockMovement', () => {
    it('should create valid stock movement', () => {
      const movement: StockMovement = {
        movementId: 'MOV-001',
        productId: 'PROD-001',
        type: 'receipt',
        quantity: 100,
        referenceId: 'PO-001',
        referenceType: 'purchase_order',
        notes: 'Initial stock receipt',
        createdAt: new Date(),
        createdBy: 'USER-001'
      };
      
      expect(movement.type).toBe('receipt');
      expect(movement.quantity).toBe(100);
      expect(movement.referenceType).toBe('purchase_order');
    });

    it('should support all movement types', () => {
      const types: StockMovement['type'][] = ['receipt', 'sale', 'return', 'adjustment', 'transfer'];
      
      for (const type of types) {
        const movement: StockMovement = {
          movementId: 'MOV-001',
          productId: 'PROD-001',
          type,
          quantity: 10,
          createdAt: new Date(),
          createdBy: 'USER-001'
        };
        expect(movement.type).toBe(type);
      }
    });
  });
});