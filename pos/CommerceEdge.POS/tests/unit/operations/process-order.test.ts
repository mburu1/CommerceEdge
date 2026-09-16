import { processOrder, validateOrder, OrderData, OrderItem, ProcessOrderOptions } from '../../../src/operations/process-order';

describe('processOrder', () => {
  const createValidOrder = (overrides: Partial<OrderData> = {}): OrderData => ({
    orderId: 'ORD-001',
    customerId: 'CUST-001',
    items: [
      { productId: 'PROD-001', productName: 'Product A', quantity: 2, unitPrice: 10.00 },
      { productId: 'PROD-002', productName: 'Product B', quantity: 1, unitPrice: 25.50 }
    ],
    paymentMethod: 'card',
    payments: [{ method: 'card', amount: 45.50 }],
    ...overrides
  });

  const createValidItem = (overrides: Partial<OrderItem> = {}): OrderItem => ({
    productId: 'PROD-001',
    productName: 'Test Product',
    quantity: 1,
    unitPrice: 10.00,
    ...overrides
  });

  describe('successful order processing', () => {
    it('should process a valid order with default options', () => {
      const order = createValidOrder();
      const result = processOrder(order);

      expect(result.orderId).toBe('ORD-001');
      expect(result.status).toBe('completed');
      expect(result.subtotal).toBe(45.50);
      expect(result.total).toBe(45.50);
      expect(result.paymentStatus).toBe('paid');
      expect(result.items).toHaveLength(2);
      expect(result.processedAt).toBeInstanceOf(Date);
    });

    it('should calculate subtotal correctly', () => {
      const order = createValidOrder({
        items: [
          createValidItem({ quantity: 3, unitPrice: 10.00 }),
          createValidItem({ quantity: 2, unitPrice: 15.00 })
        ]
      });
      const result = processOrder(order);

      expect(result.subtotal).toBe(60.00);
    });

    it('should apply item-level discount', () => {
      const order = createValidOrder({
        items: [
          createValidItem({ quantity: 2, unitPrice: 100.00, discount: 10 })
        ]
      });
      const result = processOrder(order);

      expect(result.discount).toBe(20.00);
      expect(result.subtotal).toBe(200.00);
      expect(result.total).toBe(180.00);
    });

    it('should apply default tax rate', () => {
      const order = createValidOrder({
        items: [createValidItem({ quantity: 1, unitPrice: 100.00 })]
      });
      const options: ProcessOrderOptions = { defaultTaxRate: 10 };
      const result = processOrder(order, options);

      expect(result.tax).toBe(10.00);
      expect(result.total).toBe(110.00);
    });

    it('should apply item-level tax rate', () => {
      const order = createValidOrder({
        items: [createValidItem({ quantity: 1, unitPrice: 100.00, taxRate: 5 })]
      });
      const result = processOrder(order);

      expect(result.tax).toBe(5.00);
      expect(result.total).toBe(105.00);
    });

    it('should apply default discount when no item discount', () => {
      const order = createValidOrder({
        items: [createValidItem({ quantity: 2, unitPrice: 50.00 })]
      });
      const options: ProcessOrderOptions = { defaultDiscount: 10 };
      const result = processOrder(order, options);

      expect(result.discount).toBe(10.00);
      expect(result.total).toBe(90.00);
    });

    it('should apply loyalty discount for customer', () => {
      const order = createValidOrder({
        items: [createValidItem({ quantity: 1, unitPrice: 100.00 })]
      });
      const options: ProcessOrderOptions = { applyLoyaltyDiscount: true };
      const result = processOrder(order, options);

      expect(result.discount).toBe(5.00);
      expect(result.total).toBe(95.00);
    });

    it('should handle multiple payment methods', () => {
      const order = createValidOrder({
        paymentMethod: 'mixed',
        payments: [
          { method: 'cash', amount: 20.00 },
          { method: 'card', amount: 25.50 }
        ]
      });
      const result = processOrder(order);

      expect(result.paymentStatus).toBe('paid');
      expect(result.payments).toHaveLength(2);
    });

    it('should handle partial payment', () => {
      const order = createValidOrder({
        payments: [{ method: 'card', amount: 20.00 }]
      });
      const result = processOrder(order);

      expect(result.paymentStatus).toBe('partial');
      expect(result.status).toBe('pending');
    });

    it('should handle overpayment', () => {
      const order = createValidOrder({
        payments: [{ method: 'card', amount: 100.00 }]
      });
      const result = processOrder(order);

      expect(result.paymentStatus).toBe('overpaid');
      expect(result.status).toBe('completed');
    });

    it('should handle unpaid order', () => {
      const order = createValidOrder({ payments: [] });
      const result = processOrder(order);

      expect(result.paymentStatus).toBe('unpaid');
      expect(result.status).toBe('pending');
    });
  });

  describe('order validation errors', () => {
    it('should fail when orderId is missing', () => {
      const order = createValidOrder({ orderId: '' });
      const result = processOrder(order);

      expect(result.status).toBe('failed');
      expect(result.error).toBe('Order ID is required');
    });

    it('should fail when items array is empty', () => {
      const order = createValidOrder({ items: [] });
      const result = processOrder(order);

      expect(result.status).toBe('failed');
      expect(result.error).toBe('Order must contain at least one item');
    });

    it('should fail when item missing productId', () => {
      const order = createValidOrder({
        items: [{ ...createValidItem(), productId: '' }]
      });
      const result = processOrder(order);

      expect(result.status).toBe('failed');
      expect(result.error).toContain('productId');
    });

    it('should fail when item missing productName', () => {
      const order = createValidOrder({
        items: [{ ...createValidItem(), productName: '' }]
      });
      const result = processOrder(order);

      expect(result.status).toBe('failed');
      expect(result.error).toContain('productName');
    });

    it('should fail when quantity is zero or negative', () => {
      const order = createValidOrder({
        items: [{ ...createValidItem(), quantity: 0 }]
      });
      const result = processOrder(order);

      expect(result.status).toBe('failed');
      expect(result.error).toContain('quantity');
    });

    it('should fail when unitPrice is negative', () => {
      const order = createValidOrder({
        items: [{ ...createValidItem(), unitPrice: -10 }]
      });
      const result = processOrder(order);

      expect(result.status).toBe('failed');
      expect(result.error).toContain('unit price');
    });
  });

  describe('item processing', () => {
    it('should process each item with correct calculations', () => {
      const order = createValidOrder({
        items: [
          createValidItem({ productId: 'PROD-1', productName: 'Item 1', quantity: 2, unitPrice: 50.00, discount: 10, taxRate: 5 })
        ]
      });
      const result = processOrder(order);

      expect(result.items).toHaveLength(1);
      const item = result.items[0];
      expect(item.productId).toBe('PROD-1');
      expect(item.quantity).toBe(2);
      expect(item.unitPrice).toBe(50.00);
      expect(item.discount).toBe(10);
      expect(item.taxRate).toBe(5);
      expect(item.lineTotal).toBe(94.50);
    });

    it('should round monetary values to 2 decimal places', () => {
      const order = createValidOrder({
        items: [createValidItem({ quantity: 3, unitPrice: 10.333 })]
      });
      const result = processOrder(order);

      expect(result.subtotal).toBe(31.00);
      expect(Number(result.subtotal.toFixed(2))).toBe(result.subtotal);
    });
  });

  describe('edge cases', () => {
    it('should handle zero quantity gracefully by setting to 0', () => {
      const order = createValidOrder({
        items: [createValidItem({ quantity: -5 })]
      });
      const result = processOrder(order);

      expect(result.status).toBe('failed');
    });

    it('should handle very large orders', () => {
      const items = Array.from({ length: 100 }, (_, i) => 
        createValidItem({ productId: `PROD-${i}`, quantity: 1, unitPrice: 100 })
      );
      const order = createValidOrder({ items });
      const result = processOrder(order);

      expect(result.items).toHaveLength(100);
      expect(result.subtotal).toBe(10000);
    });

    it('should handle zero prices', () => {
      const order = createValidOrder({
        items: [createValidItem({ quantity: 5, unitPrice: 0 })]
      });
      const result = processOrder(order);

      expect(result.subtotal).toBe(0);
      expect(result.total).toBe(0);
    });
  });
});

describe('validateOrder', () => {
  it('should return valid for correct order', () => {
    const order: OrderData = {
      orderId: 'ORD-001',
      items: [{ productId: 'PROD-1', productName: 'Product', quantity: 1, unitPrice: 10 }],
      paymentMethod: 'cash'
    };
    const result = validateOrder(order);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should return errors for missing orderId', () => {
    const order: OrderData = { orderId: '', items: [], paymentMethod: 'cash' };
    const result = validateOrder(order);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Order ID is required');
  });

  it('should return errors for empty items', () => {
    const order: OrderData = { orderId: 'ORD-001', items: [], paymentMethod: 'cash' };
    const result = validateOrder(order);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Order must contain at least one item');
  });

  it('should return errors for invalid items', () => {
    const order: OrderData = {
      orderId: 'ORD-001',
      items: [
        { productId: '', productName: 'Product', quantity: 1, unitPrice: 10 },
        { productId: 'PROD-1', productName: '', quantity: 1, unitPrice: 10 },
        { productId: 'PROD-2', productName: 'Product', quantity: 0, unitPrice: 10 },
        { productId: 'PROD-3', productName: 'Product', quantity: 1, unitPrice: -5 }
      ],
      paymentMethod: 'cash'
    };
    const result = validateOrder(order);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(4);
  });
});