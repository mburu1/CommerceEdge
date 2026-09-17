import { VoidHandler, VoidRequest, VoidItem, VoidResponse } from '../../../src/handlers/VoidHandler';

describe('VoidHandler', () => {
  let handler: VoidHandler;
  const mockOrderRepository = new Map<string, any>();

  beforeEach(() => {
    mockOrderRepository.clear();
    mockOrderRepository.set('ORD-001', createValidOrder());
    handler = new VoidHandler(mockOrderRepository);
  });

  const createValidOrder = () => ({
    orderId: 'ORD-001',
    registerId: 'REG-001',
    operatorId: 'OP-001',
    shiftId: 'SHIFT-001',
    items: [
      { lineId: 'LINE-001', productId: 'PROD-001', productName: 'Product A', quantity: 2, unitPrice: 20.00 },
      { lineId: 'LINE-002', productId: 'PROD-002', productName: 'Product B', quantity: 1, unitPrice: 30.00 }
    ],
    subtotal: 70.00,
    discount: 0,
    tax: 7.00,
    total: 77.00,
    payments: [{ paymentId: 'PAY-001', method: 'card', amount: 77.00, status: 'captured' }],
    status: 'completed',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const createValidVoidRequest = (overrides: Partial<VoidRequest> = {}): VoidRequest => ({
    registerId: 'REG-001',
    operatorId: 'OP-001',
    shiftId: 'SHIFT-001',
    orderId: 'ORD-001',
    reason: 'Customer changed mind',
    voidType: 'full',
    ...overrides
  });

  describe('handle', () => {
    beforeEach(() => {
      mockOrderRepository.set('ORD-001', createValidOrder());
    });

    it('should successfully process a full void', () => {
      const request = createValidVoidRequest();
      const result = handler.handle(request);

      expect(result.success).toBe(true);
      expect(result.voidId).toBeDefined();
      expect(result.voidNumber).toBeDefined();
      expect(result.message).toBe('Order voided successfully');
    });

    it('should successfully process a partial void', () => {
      const request = createValidVoidRequest({
        voidType: 'partial',
        items: [
          { lineId: 'LINE-001', quantity: 1, reason: 'Damaged item' }
        ]
      });
      const result = handler.handle(request);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Partial void completed successfully');
    });

    it('should fail when registerId is missing', () => {
      const request = createValidVoidRequest({ registerId: '' });
      const result = handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Register ID');
    });

    it('should fail when operatorId is missing', () => {
      const request = createValidVoidRequest({ operatorId: '' });
      const result = handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Operator ID');
    });

    it('should fail when shiftId is missing', () => {
      const request = createValidVoidRequest({ shiftId: '' });
      const result = handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Shift ID');
    });

    it('should fail when orderId is missing', () => {
      const request = createValidVoidRequest({ orderId: '' });
      const result = handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Order ID');
    });

    it('should fail when order not found', () => {
      const request = createValidVoidRequest({ orderId: 'ORD-999' });
      const result = handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Order not found');
    });

    it('should fail when order already voided', () => {
      const order = createValidOrder();
      order.status = 'void';
      mockOrderRepository.set('ORD-001', order);

      const request = createValidVoidRequest();
      const result = handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('already been voided');
    });

    it('should fail when order already cancelled', () => {
      const order = createValidOrder();
      order.status = 'cancelled';
      mockOrderRepository.set('ORD-001', order);

      const request = createValidVoidRequest();
      const result = handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('already been voided or cancelled');
    });

    it('should fail when order already refunded', () => {
      const order = createValidOrder();
      order.status = 'refunded';
      mockOrderRepository.set('ORD-001', order);

      const request = createValidVoidRequest();
      const result = handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot void a refunded order');
    });

    it('should fail when reason is missing', () => {
      const request = createValidVoidRequest({ reason: '' });
      const result = handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Void reason is required');
    });

    it('should fail partial void when items array is empty', () => {
      const request = createValidVoidRequest({ voidType: 'partial', items: [] });
      const result = handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('requires at least one item');
    });

    it('should fail when void item not found in order', () => {
      const request = createValidVoidRequest({
        voidType: 'partial',
        items: [{ lineId: 'LINE-999', quantity: 1, reason: 'Damaged' }]
      });
      const result = handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Order item not found');
    });

    it('should fail when void quantity exceeds order quantity', () => {
      const request = createValidVoidRequest({
        voidType: 'partial',
        items: [{ lineId: 'LINE-001', quantity: 5, reason: 'Damaged' }]
      });
      const result = handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid void quantity');
    });

    it('should generate unique void IDs', () => {
      const request1 = createValidVoidRequest();
      const request2 = createValidVoidRequest();

      const result1 = handler.handle(request1);
      const result2 = handler.handle(request2);

      expect(result1.voidId).not.toBe(result2.voidId);
    });
  });

  describe('getVoid', () => {
    it('should return void by ID', () => {
      const request = createValidVoidRequest();
      const result = handler.handle(request);

      const voidRecord = handler.getVoid(result.voidId!);
      expect(voidRecord).toBeDefined();
      expect(voidRecord.voidId).toBe(result.voidId);
    });

    it('should return undefined for non-existent void', () => {
      const voidRecord = handler.getVoid('VOID-999999');
      expect(voidRecord).toBeUndefined();
    });
  });

  describe('getVoidsByOrder', () => {
    it('should return voids for an order', () => {
      const request1 = createValidVoidRequest();
      const request2 = createValidVoidRequest();
      const request3 = createValidVoidRequest({ orderId: 'ORD-002' });

      mockOrderRepository.set('ORD-002', createValidOrder());

      handler.handle(request1);
      handler.handle(request2);
      handler.handle(request3);

      const voids = handler.getVoidsByOrder('ORD-001');
      expect(voids).toHaveLength(2);
    });
  });
});