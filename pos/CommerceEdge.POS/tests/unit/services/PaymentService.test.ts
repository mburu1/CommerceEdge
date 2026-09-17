import { PaymentService, PaymentRequest, PaymentResult, SplitPaymentRequest } from '../../../src/services/PaymentService';
import { CartService } from '../../../src/services/CartService';
import { Payment, PaymentMethod, PaymentTransactionStatus, CardPaymentDetails } from '../../../src/models/Order';

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let cartService: CartService;

  beforeEach(() => {
    cartService = new CartService();
    paymentService = new PaymentService(cartService);
  });

  const createValidPaymentRequest = (overrides: Partial<PaymentRequest> = {}): PaymentRequest => ({
    method: 'card',
    amount: 50.00,
    cardDetails: {
      cardType: 'visa',
      lastFourDigits: '1234'
    } as CardPaymentDetails,
    ...overrides
  });

  describe('processPayment', () => {
    beforeEach(() => {
      cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 50.00 });
    });

    it('should successfully process a card payment', () => {
      const request = createValidPaymentRequest();
      const result = paymentService.processPayment(request);

      expect(result.success).toBe(true);
      expect(result.payment).toBeDefined();
      expect(result.authorizationCode).toBeDefined();
      expect(result.payment!.method).toBe('card');
      expect(result.payment!.amount).toBe(50.00);
      expect(result.payment!.status).toBe('authorized');
      expect(result.payment!.cardDetails).toBeDefined();
      expect(result.payment!.cardDetails!.authorizationCode).toBe(result.authorizationCode);
    });

    it('should successfully process a cash payment', () => {
      const request = createValidPaymentRequest({ method: 'cash', cardDetails: undefined });
      const result = paymentService.processPayment(request);

      expect(result.success).toBe(true);
      expect(result.payment!.method).toBe('cash');
      expect(result.payment!.status).toBe('captured');
    });

    it('should successfully process a mobile payment', () => {
      const request = createValidPaymentRequest({ method: 'mobile', cardDetails: undefined });
      const result = paymentService.processPayment(request);

      expect(result.success).toBe(true);
      expect(result.payment!.status).toBe('authorized');
    });

    it('should successfully process a gift card payment', () => {
      const request = createValidPaymentRequest({ method: 'gift_card', cardDetails: undefined });
      const result = paymentService.processPayment(request);

      expect(result.success).toBe(true);
      expect(result.payment!.status).toBe('captured');
    });

    it('should successfully process loyalty points payment', () => {
      const request = createValidPaymentRequest({ method: 'loyalty_points', cardDetails: undefined });
      const result = paymentService.processPayment(request);

      expect(result.success).toBe(true);
      expect(result.payment!.status).toBe('captured');
    });

    it('should successfully process store credit payment', () => {
      const request = createValidPaymentRequest({ method: 'store_credit', cardDetails: undefined });
      const result = paymentService.processPayment(request);

      expect(result.success).toBe(true);
      expect(result.payment!.status).toBe('captured');
    });

    it('should fail when amount <= 0', () => {
      const request = createValidPaymentRequest({ amount: 0 });
      const result = paymentService.processPayment(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('greater than zero');
    });

    it('should fail when amount exceeds remaining balance', () => {
      const request = createValidPaymentRequest({ amount: 100.00 });
      const result = paymentService.processPayment(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('exceeds remaining balance');
    });

    it('should fail when card payment missing card details', () => {
      const request = createValidPaymentRequest({ cardDetails: undefined });
      const result = paymentService.processPayment(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Card details required');
    });

    it('should calculate change due correctly', () => {
      // Add another item to make total 100, then pay 60 (should fail) - actually test overpayment
      cartService.addItem({ productId: 'PROD-002', productName: 'Product B', quantity: 1, unitPrice: 50.00 });
      const request = createValidPaymentRequest({ amount: 60.00 });
      const result = paymentService.processPayment(request);

      // Cart total is now 100, paying 60 should succeed with remaining 40
      expect(result.success).toBe(true);
      expect(result.changeDue).toBe(0);
    });

    it('should generate unique payment IDs', () => {
      const request1 = createValidPaymentRequest();
      const result1 = paymentService.processPayment(request1);
      expect(result1.success).toBe(true);

      // Add another item for second payment
      cartService.addItem({ productId: 'PROD-002', productName: 'Product B', quantity: 1, unitPrice: 50.00 });
      const request2 = createValidPaymentRequest();
      const result2 = paymentService.processPayment(request2);

      expect(result1.payment!.paymentId).not.toBe(result2.payment!.paymentId);
    });
  });

  describe('processSplitPayment', () => {
    beforeEach(() => {
      cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 100.00 });
    });

    it('should process multiple payments', () => {
      const request: SplitPaymentRequest = {
        payments: [
          { method: 'cash' as PaymentMethod, amount: 40.00 },
          { method: 'card' as PaymentMethod, amount: 60.00, cardDetails: { cardType: 'visa', lastFourDigits: '1234' } as CardPaymentDetails }
        ]
      };
      const results = paymentService.processSplitPayment(request);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(results[0].payment!.method).toBe('cash');
      expect(results[1].payment!.method).toBe('card');
    });
  });

  describe('voidPayment', () => {
    beforeEach(() => {
      cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 50.00 });
    });

    it('should void an authorized payment', () => {
      const request = createValidPaymentRequest();
      const result = paymentService.processPayment(request);

      const voidResult = paymentService.voidPayment(result.payment!.paymentId);
      expect(voidResult).toBe(true);

      const payment = paymentService.getPayment(result.payment!.paymentId);
      expect(payment!.status).toBe('voided');
    });

    it('should fail to void captured payment', () => {
      const request = createValidPaymentRequest({ method: 'cash', cardDetails: undefined });
      const result = paymentService.processPayment(request);

      const voidResult = paymentService.voidPayment(result.payment!.paymentId);
      expect(voidResult).toBe(false);
    });

    it('should fail to void refunded payment', () => {
      const request = createValidPaymentRequest({ method: 'cash', cardDetails: undefined });
      const result = paymentService.processPayment(request);
      paymentService.refundPayment(result.payment!.paymentId, 50.00, 'Test');

      const voidResult = paymentService.voidPayment(result.payment!.paymentId);
      expect(voidResult).toBe(false);
    });

    it('should return false for non-existent payment', () => {
      const result = paymentService.voidPayment('PAY-999999');
      expect(result).toBe(false);
    });
  });

  describe('refundPayment', () => {
    beforeEach(() => {
      cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 50.00 });
    });

    it('should refund a captured payment', () => {
      const request = createValidPaymentRequest({ method: 'cash', cardDetails: undefined });
      const result = paymentService.processPayment(request);

      const refundResult = paymentService.refundPayment(result.payment!.paymentId, 50.00, 'Customer request');
      expect(refundResult.success).toBe(true);
      expect(refundResult.payment!.status).toBe('refunded');
    });

    it('should partially refund a captured payment', () => {
      // Clear and add new item for this test
      cartService.clear();
      cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 100.00 });
      const request = createValidPaymentRequest({ method: 'cash', cardDetails: undefined, amount: 100.00 });
      const result = paymentService.processPayment(request);

      const refundResult = paymentService.refundPayment(result.payment!.paymentId, 30.00, 'Partial return');
      expect(refundResult.success).toBe(true);
      expect(refundResult.payment!.status).toBe('partially_refunded');
    });

    it('should fail when refund amount exceeds payment amount', () => {
      const request = createValidPaymentRequest({ method: 'cash', cardDetails: undefined, amount: 50.00 });
      const result = paymentService.processPayment(request);

      const refundResult = paymentService.refundPayment(result.payment!.paymentId, 75.00, 'Test');
      expect(refundResult.success).toBe(false);
      expect(refundResult.error).toContain('Invalid refund amount');
    });
  });

  describe('getPaidAmount', () => {
    beforeEach(() => {
      cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 50.00 });
    });

    it('should return sum of non-voided, non-refunded payments', () => {
      const request1 = createValidPaymentRequest({ amount: 30.00 });
      const result1 = paymentService.processPayment(request1);

      cartService.addItem({ productId: 'PROD-002', productName: 'Product B', quantity: 1, unitPrice: 50.00 });
      const request2 = createValidPaymentRequest({ amount: 20.00 });
      const result2 = paymentService.processPayment(request2);

      expect(paymentService.getPaidAmount()).toBe(50.00);
    });

    it('should exclude voided payments', () => {
      const request1 = createValidPaymentRequest({ amount: 30.00 });
      const result1 = paymentService.processPayment(request1);
      paymentService.voidPayment(result1.payment!.paymentId);

      cartService.addItem({ productId: 'PROD-002', productName: 'Product B', quantity: 1, unitPrice: 50.00 });
      const request2 = createValidPaymentRequest({ amount: 20.00 });
      paymentService.processPayment(request2);

      expect(paymentService.getPaidAmount()).toBe(20.00);
    });

    it('should exclude refunded payments', () => {
      const request1 = createValidPaymentRequest({ method: 'cash', cardDetails: undefined, amount: 30.00 });
      const result1 = paymentService.processPayment(request1);
      paymentService.refundPayment(result1.payment!.paymentId, 30.00, 'Test');

      cartService.addItem({ productId: 'PROD-002', productName: 'Product B', quantity: 1, unitPrice: 50.00 });
      const request2 = createValidPaymentRequest({ amount: 20.00 });
      paymentService.processPayment(request2);

      expect(paymentService.getPaidAmount()).toBe(20.00);
    });
  });

  describe('getRefundedAmount', () => {
    beforeEach(() => {
      cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 50.00 });
    });

    it('should return sum of refunded amounts', () => {
      const request1 = createValidPaymentRequest({ method: 'cash', cardDetails: undefined, amount: 50.00 });
      const result1 = paymentService.processPayment(request1);
      paymentService.refundPayment(result1.payment!.paymentId, 30.00, 'Test');

      cartService.addItem({ productId: 'PROD-002', productName: 'Product B', quantity: 1, unitPrice: 100.00 });
      const request2 = createValidPaymentRequest({ method: 'cash', cardDetails: undefined, amount: 100.00 });
      const result2 = paymentService.processPayment(request2);
      paymentService.refundPayment(result2.payment!.paymentId, 100.00, 'Test');

      expect(paymentService.getRefundedAmount()).toBe(130.00);
    });
  });

  describe('getChangeDue', () => {
    it('should calculate change due', () => {
      cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 50.00 });
      cartService.addItem({ productId: 'PROD-002', productName: 'Product B', quantity: 1, unitPrice: 50.00 });
      // Pay 100.01 on 100 total (within 0.01 tolerance), change due = 0.01
      const request = createValidPaymentRequest({ method: 'cash', cardDetails: undefined, amount: 100.01 });
      paymentService.processPayment(request);

      const totals = cartService.getTotals();
      expect(paymentService.getChangeDue(totals)).toBeCloseTo(0.01, 2);
    });
  });

  describe('isFullyPaid', () => {
    it('should return true when fully paid', () => {
      cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 50.00 });
      const request = createValidPaymentRequest({ amount: 50.00 });
      paymentService.processPayment(request);

      const totals = cartService.getTotals();
      expect(paymentService.isFullyPaid(totals)).toBe(true);
    });

    it('should return true when overpaid', () => {
      cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 50.00 });
      cartService.addItem({ productId: 'PROD-002', productName: 'Product B', quantity: 1, unitPrice: 50.00 });
      // Pay 100.01 on 100 total (within 0.01 tolerance)
      const request = createValidPaymentRequest({ method: 'cash', cardDetails: undefined, amount: 100.01 });
      paymentService.processPayment(request);

      const totals = cartService.getTotals();
      expect(paymentService.isFullyPaid(totals)).toBe(true);
    });

    it('should return false when partially paid', () => {
      cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 100.00 });
      const request = createValidPaymentRequest({ amount: 50.00 });
      paymentService.processPayment(request);

      const totals = cartService.getTotals();
      expect(paymentService.isFullyPaid(totals)).toBe(false);
    });
  });

  describe('getRemainingAmount', () => {
    it('should return remaining amount to pay', () => {
      cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 100.00 });
      const request = createValidPaymentRequest({ amount: 30.00 });
      paymentService.processPayment(request);

      const totals = cartService.getTotals();
      expect(paymentService.getRemainingAmount(totals)).toBe(70.00);
    });

    it('should return 0 when fully paid', () => {
      cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 50.00 });
      const request = createValidPaymentRequest({ amount: 50.00 });
      paymentService.processPayment(request);

      const totals = cartService.getTotals();
      expect(paymentService.getRemainingAmount(totals)).toBe(0);
    });
  });

  describe('clear', () => {
    it('should clear all payments', () => {
      cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 50.00 });
      const request = createValidPaymentRequest();
      paymentService.processPayment(request);

      paymentService.clear();
      expect(paymentService.getPayments()).toHaveLength(0);
    });
  });

  describe('getPayments', () => {
    it('should return copy of payments array', () => {
      cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 50.00 });
      const request = createValidPaymentRequest();
      paymentService.processPayment(request);

      const payments = paymentService.getPayments();
      expect(payments).toHaveLength(1);
      payments.push({} as Payment);
      expect(paymentService.getPayments()).toHaveLength(1);
    });
  });

  describe('getPayment', () => {
    it('should return payment by ID', () => {
      cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 50.00 });
      const request = createValidPaymentRequest();
      const result = paymentService.processPayment(request);

      const payment = paymentService.getPayment(result.payment!.paymentId);
      expect(payment).toBeDefined();
      expect(payment!.paymentId).toBe(result.payment!.paymentId);
    });

    it('should return undefined for non-existent payment', () => {
      const payment = paymentService.getPayment('PAY-999999');
      expect(payment).toBeUndefined();
    });
  });

  describe('getPaymentsByOrder', () => {
    it('should return payments for an order', () => {
      cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 50.00 });
      paymentService.processPayment(createValidPaymentRequest({ amount: 30.00 }));
      paymentService.processPayment(createValidPaymentRequest({ amount: 20.00 }));

      const payments = paymentService.getPaymentsByOrder('');
      expect(payments).toHaveLength(2);
    });
  });
});