import { SaleHandler, SaleRequest, SaleItem, SalePayment, SaleResponse } from '../../../src/handlers/SaleHandler';

describe('SaleHandler', () => {
  let handler: SaleHandler;

  beforeEach(() => {
    handler = new SaleHandler();
  });

  const createValidSaleRequest = (overrides: Partial<SaleRequest> = {}): SaleRequest => ({
    registerId: 'REG-001',
    operatorId: 'OP-001',
    shiftId: 'SHIFT-001',
    items: [
      { productId: 'PROD-001', quantity: 2, unitPrice: 19.99 },
      { productId: 'PROD-002', quantity: 1, unitPrice: 29.99 }
    ],
    payments: [
      { method: 'card', amount: 79.97 }
    ],
    ...overrides
  });

  describe('handle', () => {
    it('should successfully process a valid sale', async () => {
      const request = createValidSaleRequest();
      const result = await handler.handle(request);

      expect(result.success).toBe(true);
      expect(result.orderId).toBeDefined();
      expect(result.orderNumber).toBeDefined();
      expect(result.receiptNumber).toBeDefined();
      expect(result.total).toBe(69.97);
      expect(result.changeDue).toBe(10);
      expect(result.paymentStatus).toBe('paid');
      expect(result.message).toBe('Sale completed successfully');
    });

    it('should calculate totals correctly', async () => {
      const request = createValidSaleRequest({
        items: [
          { productId: 'PROD-001', quantity: 3, unitPrice: 10.00 },
          { productId: 'PROD-002', quantity: 2, unitPrice: 15.00 }
        ],
        payments: [{ method: 'cash', amount: 60.00 }]
      });
      const result = await handler.handle(request);

      expect(result.success).toBe(true);
      expect(result.total).toBe(60.00);
    });

    it('should apply item discounts', async () => {
      const request = createValidSaleRequest({
        items: [
          { productId: 'PROD-001', quantity: 2, unitPrice: 100.00, discountPercent: 10 }
        ],
        payments: [{ method: 'card', amount: 180.00 }]
      });
      const result = await handler.handle(request);

      expect(result.success).toBe(true);
      expect(result.total).toBe(180.00);
    });

    it('should apply item tax', async () => {
      const request = createValidSaleRequest({
        items: [
          { productId: 'PROD-001', quantity: 1, unitPrice: 100.00, taxRate: 10 }
        ],
        payments: [{ method: 'card', amount: 110.00 }]
      });
      const result = await handler.handle(request);

      expect(result.success).toBe(true);
      expect(result.total).toBe(110.00);
    });

    it('should handle multiple payment methods', async () => {
      const request = createValidSaleRequest({
        payments: [
          { method: 'cash', amount: 40.00 },
          { method: 'card', amount: 39.97 }
        ]
      });
      const result = await handler.handle(request);

      expect(result.success).toBe(true);
      expect(result.paymentStatus).toBe('paid');
    });

    it('should handle partial payment', async () => {
      const request = createValidSaleRequest({
        payments: [{ method: 'cash', amount: 30.00 }]
      });
      const result = await handler.handle(request);

      expect(result.success).toBe(true);
      expect(result.paymentStatus).toBe('partial');
      expect(result.changeDue).toBe(0);
    });

    it('should handle overpayment with change', async () => {
      const request = createValidSaleRequest({
        payments: [{ method: 'cash', amount: 100.00 }]
      });
      const result = await handler.handle(request);

      expect(result.success).toBe(true);
      expect(result.paymentStatus).toBe('paid');
      expect(result.changeDue).toBe(30.03);
    });

    it('should fail when registerId is missing', async () => {
      const request = createValidSaleRequest({ registerId: '' });
      const result = await handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Register ID');
    });

    it('should fail when operatorId is missing', async () => {
      const request = createValidSaleRequest({ operatorId: '' });
      const result = await handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Operator ID');
    });

    it('should fail when shiftId is missing', async () => {
      const request = createValidSaleRequest({ shiftId: '' });
      const result = await handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Shift ID');
    });

    it('should fail when items array is empty', async () => {
      const request = createValidSaleRequest({ items: [] });
      const result = await handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('at least one item');
    });

    it('should fail when payments array is empty', async () => {
      const request = createValidSaleRequest({ payments: [] });
      const result = await handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('At least one payment');
    });

    it('should fail when item quantity is invalid', async () => {
      const request = createValidSaleRequest({
        items: [{ productId: 'PROD-001', quantity: 0, unitPrice: 10.00 }]
      });
      const result = await handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid quantity');
    });

    it('should fail when item price is negative', async () => {
      const request = createValidSaleRequest({
        items: [{ productId: 'PROD-001', quantity: 1, unitPrice: -10.00 }]
      });
      const result = await handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid price');
    });

    it('should generate unique order IDs', async () => {
      const request1 = createValidSaleRequest();
      const request2 = createValidSaleRequest();

      const result1 = await handler.handle(request1);
      const result2 = await handler.handle(request2);

      expect(result1.orderId).not.toBe(result2.orderId);
    });

    it('should include customerId when provided', async () => {
      const request = createValidSaleRequest({ customerId: 'CUST-001' });
      const result = await handler.handle(request);

      expect(result.success).toBe(true);
      const order = handler.getOrder(result.orderId!);
      expect(order.customerId).toBe('CUST-001');
    });

    it('should include notes when provided', async () => {
      const request = createValidSaleRequest({ notes: 'Customer requested gift wrap' });
      const result = await handler.handle(request);

      expect(result.success).toBe(true);
      const order = handler.getOrder(result.orderId!);
      expect(order.notes).toBe('Customer requested gift wrap');
    });
  });

  describe('getOrder', () => {
    it('should return order by ID', async () => {
      const request = createValidSaleRequest();
      const result = await handler.handle(request);

      const order = handler.getOrder(result.orderId!);
      expect(order).toBeDefined();
      expect(order.orderId).toBe(result.orderId);
    });

    it('should return undefined for non-existent order', () => {
      const order = handler.getOrder('ORD-999999');
      expect(order).toBeUndefined();
    });
  });

  describe('getOrdersByShift', () => {
    it('should return orders for a shift', async () => {
      const request1 = createValidSaleRequest({ shiftId: 'SHIFT-001' });
      const request2 = createValidSaleRequest({ shiftId: 'SHIFT-001' });
      const request3 = createValidSaleRequest({ shiftId: 'SHIFT-002' });

      await handler.handle(request1);
      await handler.handle(request2);
      await handler.handle(request3);

      const shiftOrders = handler.getOrdersByShift('SHIFT-001');
      expect(shiftOrders).toHaveLength(2);
    });
  });
});