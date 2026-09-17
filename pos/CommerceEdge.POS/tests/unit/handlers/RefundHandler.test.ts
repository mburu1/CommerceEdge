import { RefundHandler, RefundRequest, RefundItem, RefundPayment, RefundResponse } from '../../../src/handlers/RefundHandler';

describe('RefundHandler', () => {
  let handler: RefundHandler;
  const mockOrderRepository = new Map<string, any>();

  beforeEach(() => {
    mockOrderRepository.clear();
    mockOrderRepository.set('ORD-001', createValidOrder());
    handler = new RefundHandler(mockOrderRepository);
  });

  const createValidOrder = () => ({
    orderId: 'ORD-001',
    registerId: 'REG-001',
    operatorId: 'OP-001',
    shiftId: 'SHIFT-001',
    items: [
      { lineId: 'LINE-001', productId: 'PROD-001', productName: 'Product A', quantity: 2, unitPrice: 20.00, discountPercent: 0, discountAmount: 0, taxRate: 10, taxAmount: 4.00, lineTotal: 44.00, isVoided: false },
      { lineId: 'LINE-002', productId: 'PROD-002', productName: 'Product B', quantity: 1, unitPrice: 30.00, discountPercent: 0, discountAmount: 0, taxRate: 10, taxAmount: 3.00, lineTotal: 33.00, isVoided: false }
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

  const createValidRefundRequest = (overrides: Partial<RefundRequest> = {}): RefundRequest => ({
    registerId: 'REG-001',
    operatorId: 'OP-001',
    shiftId: 'SHIFT-001',
    originalOrderId: 'ORD-001',
    items: [
      { originalLineId: 'LINE-001', productId: 'PROD-001', quantity: 1, reason: 'defective' }
    ],
    payments: [
      { method: 'card', amount: 22.00, originalPaymentId: 'PAY-001' }
    ],
    reason: 'Product defective',
    ...overrides
  });

  describe('handle', () => {
    beforeEach(() => {
      mockOrderRepository.set('ORD-001', createValidOrder());
    });

    it('should successfully process a valid refund', () => {
      const request = createValidRefundRequest();
      const result = handler.handle(request);

      expect(result.success).toBe(true);
      expect(result.refundId).toBeDefined();
      expect(result.refundNumber).toBeDefined();
      expect(result.totalRefunded).toBe(22.00);
      expect(result.message).toBe('Refund processed successfully');
    });

    it('should calculate refund amount correctly', () => {
      const request = createValidRefundRequest({
        items: [
          { originalLineId: 'LINE-001', productId: 'PROD-001', quantity: 2, reason: 'defective' }
        ],
        payments: [{ method: 'card', amount: 44.00, originalPaymentId: 'PAY-001' }]
      });
      const result = handler.handle(request);

      expect(result.success).toBe(true);
      expect(result.totalRefunded).toBe(44.00);
    });

    it('should fail when registerId is missing', () => {
      const request = createValidRefundRequest({ registerId: '' });
      const result = handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Register ID');
    });

    it('should fail when operatorId is missing', () => {
      const request = createValidRefundRequest({ operatorId: '' });
      const result = handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Operator ID');
    });

    it('should fail when shiftId is missing', () => {
      const request = createValidRefundRequest({ shiftId: '' });
      const result = handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Shift ID');
    });

    it('should fail when originalOrderId is missing', () => {
      const request = createValidRefundRequest({ originalOrderId: '' });
      const result = handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Original order ID');
    });

    it('should fail when order not found', () => {
      const request = createValidRefundRequest({ originalOrderId: 'ORD-999' });
      const result = handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Original order not found');
    });

    it('should fail when order already refunded', () => {
      const order = createValidOrder();
      order.status = 'refunded';
      mockOrderRepository.set('ORD-001', order);

      const request = createValidRefundRequest();
      const result = handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('already been refunded');
    });

    it('should fail when items array is empty', () => {
      const request = createValidRefundRequest({ items: [] });
      const result = handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('at least one item');
    });

    it('should fail when reason is missing', () => {
      const request = createValidRefundRequest({ reason: '' });
      const result = handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Refund reason is required');
    });

    it('should fail when refund quantity exceeds original', () => {
      const request = createValidRefundRequest({
        items: [{ originalLineId: 'LINE-001', productId: 'PROD-001', quantity: 5, reason: 'defective' }],
        payments: [{ method: 'card', amount: 100.00, originalPaymentId: 'PAY-001' }]
      });
      const result = handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid refund quantity');
    });

    it('should fail when payment total does not match refund amount', () => {
      const request = createValidRefundRequest({
        payments: [{ method: 'card', amount: 50.00, originalPaymentId: 'PAY-001' }]
      });
      const result = handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('does not match');
    });

    it('should fail when original item not found', () => {
      const request = createValidRefundRequest({
        items: [{ originalLineId: 'LINE-999', productId: 'PROD-999', quantity: 1, reason: 'defective' }],
        payments: [{ method: 'card', amount: 22.00, originalPaymentId: 'PAY-001' }]
      });
      const result = handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Original item not found');
    });

    it('should generate unique refund IDs', () => {
      const request1 = createValidRefundRequest();
      const request2 = createValidRefundRequest();

      const result1 = handler.handle(request1);
      const result2 = handler.handle(request2);

      expect(result1.refundId).not.toBe(result2.refundId);
    });
  });

  describe('getRefund', () => {
    it('should return refund by ID', () => {
      const request = createValidRefundRequest();
      const result = handler.handle(request);

      const refund = handler.getRefund(result.refundId!);
      expect(refund).toBeDefined();
      expect(refund.refundId).toBe(result.refundId);
    });

    it('should return undefined for non-existent refund', () => {
      const refund = handler.getRefund('REF-999999');
      expect(refund).toBeUndefined();
    });
  });

  describe('getRefundsByOrder', () => {
    it('should return refunds for an order', () => {
      const request1 = createValidRefundRequest();
      const request2 = createValidRefundRequest();
      const request3 = createValidRefundRequest({ originalOrderId: 'ORD-002' });

      handler.handle(request1);
      handler.handle(request2);
      handler.handle(request3);

      const refunds = handler.getRefundsByOrder('ORD-001');
      expect(refunds).toHaveLength(2);
    });
  });
});