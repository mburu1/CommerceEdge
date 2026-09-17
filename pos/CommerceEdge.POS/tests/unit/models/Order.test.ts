import { Order, OrderItem, OrderStatus, PaymentStatus, Payment, PaymentMethod, PaymentTransactionStatus, CardPaymentDetails, OrderSearchCriteria, OrderSearchResult } from '../../../src/models/Order';

describe('Order Model', () => {
  const createValidOrderItem = (overrides: Partial<OrderItem> = {}): OrderItem => ({
    lineId: 'LINE-001',
    productId: 'PROD-001',
    productName: 'Test Product',
    sku: 'SKU-001',
    quantity: 2,
    unitPrice: 19.99,
    discountPercent: 0,
    discountAmount: 0,
    taxRate: 8.5,
    taxAmount: 3.40,
    lineTotal: 43.38,
    isVoided: false,
    ...overrides
  });

  const createValidPayment = (overrides: Partial<Payment> = {}): Payment => ({
    paymentId: 'PAY-001',
    orderId: 'ORD-001',
    method: 'card',
    amount: 43.38,
    reference: 'REF-123',
    status: 'captured',
    processedAt: new Date(),
    authorizedAt: new Date(),
    capturedAt: new Date(),
    cardDetails: {
      cardType: 'visa',
      lastFourDigits: '1234',
      authorizationCode: 'AUTH123'
    },
    ...overrides
  });

  const createValidOrder = (overrides: Partial<Order> = {}): Order => ({
    orderId: 'ORD-001',
    customerId: 'CUST-001',
    customerName: 'John Doe',
    items: [createValidOrderItem()],
    subtotal: 39.98,
    discount: 0,
    tax: 3.40,
    total: 43.38,
    paymentStatus: 'paid',
    payments: [createValidPayment()],
    status: 'completed',
    registerId: 'REG-001',
    operatorId: 'OP-001',
    shiftId: 'SHIFT-001',
    notes: 'Test order',
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: new Date(),
    ...overrides
  });

  describe('Order interface', () => {
    it('should create a valid order', () => {
      const order = createValidOrder();
      expect(order.orderId).toBe('ORD-001');
      expect(order.customerId).toBe('CUST-001');
      expect(order.items).toHaveLength(1);
      expect(order.subtotal).toBe(39.98);
      expect(order.total).toBe(43.38);
      expect(order.paymentStatus).toBe('paid');
      expect(order.status).toBe('completed');
    });

    it('should support all order statuses', () => {
      const statuses: OrderStatus[] = ['draft', 'pending', 'completed', 'cancelled', 'refunded', 'partially_refunded'];
      
      for (const status of statuses) {
        const order = createValidOrder({ status });
        expect(order.status).toBe(status);
      }
    });

    it('should support all payment statuses', () => {
      const statuses: PaymentStatus[] = ['unpaid', 'partial', 'paid', 'overpaid', 'refunded'];
      
      for (const status of statuses) {
        const order = createValidOrder({ paymentStatus: status });
        expect(order.paymentStatus).toBe(status);
      }
    });

    it('should handle voided items', () => {
      const order = createValidOrder({
        items: [
          createValidOrderItem({ lineId: 'LINE-001', isVoided: false }),
          createValidOrderItem({ lineId: 'LINE-002', isVoided: true, voidReason: 'Customer changed mind' })
        ]
      });
      
      expect(order.items[0].isVoided).toBe(false);
      expect(order.items[1].isVoided).toBe(true);
      expect(order.items[1].voidReason).toBe('Customer changed mind');
    });

    it('should handle multiple items', () => {
      const order = createValidOrder({
        items: [
          createValidOrderItem({ lineId: 'LINE-001', productId: 'PROD-001', quantity: 2 }),
          createValidOrderItem({ lineId: 'LINE-002', productId: 'PROD-002', quantity: 1 })
        ]
      });
      
      expect(order.items).toHaveLength(2);
    });
  });

  describe('OrderItem interface', () => {
    it('should create a valid order item', () => {
      const item = createValidOrderItem();
      expect(item.lineId).toBe('LINE-001');
      expect(item.productId).toBe('PROD-001');
      expect(item.quantity).toBe(2);
      expect(item.unitPrice).toBe(19.99);
      expect(item.lineTotal).toBe(43.38);
    });

    it('should handle discounts', () => {
      const item = createValidOrderItem({
        discountPercent: 10,
        discountAmount: 3.998,
        lineTotal: 39.38
      });
      
      expect(item.discountPercent).toBe(10);
      expect(item.discountAmount).toBe(3.998);
    });
  });

  describe('Payment interface', () => {
    it('should create a valid payment', () => {
      const payment = createValidPayment();
      expect(payment.paymentId).toBe('PAY-001');
      expect(payment.method).toBe('card');
      expect(payment.amount).toBe(43.38);
      expect(payment.status).toBe('captured');
    });

    it('should support all payment methods', () => {
      const methods: PaymentMethod[] = ['cash', 'card', 'mobile', 'gift_card', 'loyalty_points', 'store_credit', 'mixed'];
      
      for (const method of methods) {
        const payment = createValidPayment({ method });
        expect(payment.method).toBe(method);
      }
    });

    it('should support all payment transaction statuses', () => {
      const statuses: PaymentTransactionStatus[] = ['pending', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded', 'voided'];
      
      for (const status of statuses) {
        const payment = createValidPayment({ status });
        expect(payment.status).toBe(status);
      }
    });

    it('should handle card details', () => {
      const payment = createValidPayment({
        cardDetails: {
          cardType: 'mastercard',
          lastFourDigits: '5678',
          expiryMonth: 12,
          expiryYear: 2026,
          authorizationCode: 'AUTH456',
          emvData: 'EMV123'
        }
      });
      
      expect(payment.cardDetails?.cardType).toBe('mastercard');
      expect(payment.cardDetails?.lastFourDigits).toBe('5678');
      expect(payment.cardDetails?.expiryMonth).toBe(12);
    });

    it('should handle refund fields', () => {
      const payment = createValidPayment({
        status: 'refunded',
        refundedAt: new Date(),
        refundAmount: 43.38
      });
      
      expect(payment.status).toBe('refunded');
      expect(payment.refundedAt).toBeDefined();
      expect(payment.refundAmount).toBe(43.38);
    });
  });

  describe('CardPaymentDetails', () => {
    it('should support all card types', () => {
      const cardTypes: CardPaymentDetails['cardType'][] = ['visa', 'mastercard', 'amex', 'discover', 'other'];
      
      for (const cardType of cardTypes) {
        const details: CardPaymentDetails = {
          cardType,
          lastFourDigits: '1234'
        };
        expect(details.cardType).toBe(cardType);
      }
    });
  });

  describe('OrderSearchCriteria', () => {
    it('should create valid search criteria', () => {
      const criteria: OrderSearchCriteria = {
        orderId: 'ORD-001',
        customerId: 'CUST-001',
        registerId: 'REG-001',
        operatorId: 'OP-001',
        shiftId: 'SHIFT-001',
        status: 'completed',
        paymentStatus: 'paid',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        minAmount: 10,
        maxAmount: 1000,
        page: 1,
        pageSize: 20
      };
      
      expect(criteria.orderId).toBe('ORD-001');
      expect(criteria.status).toBe('completed');
      expect(criteria.paymentStatus).toBe('paid');
    });
  });

  describe('OrderSearchResult', () => {
    it('should create valid search result', () => {
      const orders = [createValidOrder({ orderId: 'ORD-001' })];
      const result: OrderSearchResult = {
        orders,
        totalCount: 1,
        page: 1,
        pageSize: 20
      };
      
      expect(result.orders).toHaveLength(1);
      expect(result.totalCount).toBe(1);
    });
  });
});