import { PaymentHandler, PaymentRequest, PaymentResponse, PaymentRefundRequest, PaymentRefundResponse, PaymentVoidRequest, PaymentVoidResponse, PaymentCaptureRequest, PaymentCaptureResponse } from '../../../src/handlers/PaymentHandler';
import { Payment, PaymentMethod, PaymentTransactionStatus, CardPaymentDetails } from '../../../src/models/Order';

describe('PaymentHandler', () => {
  let handler: PaymentHandler;

  beforeEach(() => {
    handler = new PaymentHandler();
  });

  const createValidPaymentRequest = (overrides: Partial<PaymentRequest> = {}): PaymentRequest => ({
    orderId: 'ORD-001',
    amount: 50.00,
    method: 'card',
    cardDetails: {
      cardType: 'visa',
      lastFourDigits: '1234'
    },
    ...overrides
  });

  describe('processPayment', () => {
    it('should successfully process a card payment', async () => {
      const request = createValidPaymentRequest();
      const result = await handler.processPayment(request);

      expect(result.success).toBe(true);
      expect(result.paymentId).toBeDefined();
      expect(result.authorizationCode).toBeDefined();
      expect(result.transactionId).toBeDefined();
      expect(result.status).toBe('authorized');
      expect(result.message).toBe('Payment authorized successfully');
    });

    it('should successfully process a cash payment', async () => {
      const request = createValidPaymentRequest({ method: 'cash', cardDetails: undefined });
      const result = await handler.processPayment(request);

      expect(result.success).toBe(true);
      expect(result.status).toBe('captured');
    });

    it('should successfully process a mobile payment', async () => {
      const request = createValidPaymentRequest({ method: 'mobile', cardDetails: undefined });
      const result = await handler.processPayment(request);

      expect(result.success).toBe(true);
      expect(result.status).toBe('authorized');
    });

    it('should successfully process a gift card payment', async () => {
      const request = createValidPaymentRequest({ method: 'gift_card', cardDetails: undefined });
      const result = await handler.processPayment(request);

      expect(result.success).toBe(true);
      expect(result.status).toBe('captured');
    });

    it('should successfully process loyalty points payment', async () => {
      const request = createValidPaymentRequest({ method: 'loyalty_points', cardDetails: undefined });
      const result = await handler.processPayment(request);

      expect(result.success).toBe(true);
      expect(result.status).toBe('captured');
    });

    it('should successfully process store credit payment', async () => {
      const request = createValidPaymentRequest({ method: 'store_credit', cardDetails: undefined });
      const result = await handler.processPayment(request);

      expect(result.success).toBe(true);
      expect(result.status).toBe('captured');
    });

    it('should fail when orderId is missing', async () => {
      const request = createValidPaymentRequest({ orderId: '' });
      const result = await handler.processPayment(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Order ID is required');
    });

    it('should fail when amount is zero or negative', async () => {
      const request = createValidPaymentRequest({ amount: 0 });
      const result = await handler.processPayment(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('greater than zero');
    });

    it('should fail when card payment missing card details', async () => {
      const request = createValidPaymentRequest({ cardDetails: undefined });
      const result = await handler.processPayment(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Card details required');
    });

    it('should store payment with correct details', async () => {
      const request = createValidPaymentRequest();
      const result = await handler.processPayment(request);

      const payment = handler.getPayment(result.paymentId!);
      expect(payment).toBeDefined();
      expect(payment!.orderId).toBe('ORD-001');
      expect(payment!.method).toBe('card');
      expect(payment!.amount).toBe(50.00);
      expect(payment!.cardDetails).toBeDefined();
      expect(payment!.cardDetails!.cardType).toBe('visa');
      expect(payment!.cardDetails!.lastFourDigits).toBe('1234');
      expect(payment!.cardDetails!.authorizationCode).toBe(result.authorizationCode);
    });

    it('should generate unique payment IDs', async () => {
      const request1 = createValidPaymentRequest();
      const request2 = createValidPaymentRequest();

      const result1 = await handler.processPayment(request1);
      const result2 = await handler.processPayment(request2);

      expect(result1.paymentId).not.toBe(result2.paymentId);
    });
  });

  describe('capturePayment', () => {
    it('should capture an authorized payment', async () => {
      const request = createValidPaymentRequest();
      const processResult = await handler.processPayment(request);

      const captureRequest: PaymentCaptureRequest = { paymentId: processResult.paymentId! };
      const result = await handler.capturePayment(captureRequest);

      expect(result.success).toBe(true);
      expect(result.capturedAmount).toBe(50.00);
      expect(result.status).toBe('captured');
    });

    it('should fail when payment not found', async () => {
      const captureRequest: PaymentCaptureRequest = { paymentId: 'PAY-999999' };
      const result = await handler.capturePayment(captureRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Payment not found');
    });

    it('should fail when payment not in authorized state', async () => {
      const request = createValidPaymentRequest({ method: 'cash', cardDetails: undefined });
      const processResult = await handler.processPayment(request);

      const captureRequest: PaymentCaptureRequest = { paymentId: processResult.paymentId! };
      const result = await handler.capturePayment(captureRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('cannot be captured');
    });

    it('should capture partial amount', async () => {
      const request = createValidPaymentRequest({ amount: 100.00 });
      const processResult = await handler.processPayment(request);

      const captureRequest: PaymentCaptureRequest = { paymentId: processResult.paymentId!, amount: 50.00 };
      const result = await handler.capturePayment(captureRequest);

      expect(result.success).toBe(true);
      expect(result.capturedAmount).toBe(50.00);
    });
  });

  describe('refundPayment', () => {
    it('should refund a captured payment', async () => {
      const request = createValidPaymentRequest({ method: 'card' });
      const processResult = await handler.processPayment(request);
      await handler.capturePayment({ paymentId: processResult.paymentId! });

      const refundRequest: PaymentRefundRequest = {
        paymentId: processResult.paymentId!,
        amount: 50.00,
        reason: 'Customer request'
      };
      const result = await handler.refundPayment(refundRequest);

      expect(result.success).toBe(true);
      expect(result.status).toBe('refunded');
    });

    it('should partially refund a captured payment', async () => {
      const request = createValidPaymentRequest({ amount: 100.00 });
      const processResult = await handler.processPayment(request);
      await handler.capturePayment({ paymentId: processResult.paymentId! });

      const refundRequest: PaymentRefundRequest = {
        paymentId: processResult.paymentId!,
        amount: 30.00,
        reason: 'Partial return'
      };
      const result = await handler.refundPayment(refundRequest);

      expect(result.success).toBe(true);
      expect(result.status).toBe('partially_refunded');
    });

    it('should fail when payment not found', async () => {
      const refundRequest: PaymentRefundRequest = { paymentId: 'PAY-999999', amount: 10.00, reason: 'Test' };
      const result = await handler.refundPayment(refundRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Payment not found');
    });

    it('should fail when payment not captured', async () => {
      const request = createValidPaymentRequest();
      const processResult = await handler.processPayment(request);

      const refundRequest: PaymentRefundRequest = {
        paymentId: processResult.paymentId!,
        amount: 50.00,
        reason: 'Test'
      };
      const result = await handler.refundPayment(refundRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('cannot be refunded');
    });

    it('should fail when refund amount exceeds payment amount', async () => {
      const request = createValidPaymentRequest({ amount: 50.00 });
      const processResult = await handler.processPayment(request);
      await handler.capturePayment({ paymentId: processResult.paymentId! });

      const refundRequest: PaymentRefundRequest = {
        paymentId: processResult.paymentId!,
        amount: 75.00,
        reason: 'Test'
      };
      const result = await handler.refundPayment(refundRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid refund amount');
    });
  });

  describe('voidPayment', () => {
    it('should void an authorized payment', async () => {
      const request = createValidPaymentRequest();
      const processResult = await handler.processPayment(request);

      const voidRequest: PaymentVoidRequest = {
        paymentId: processResult.paymentId!,
        reason: 'Customer cancelled'
      };
      const result = await handler.voidPayment(voidRequest);

      expect(result.success).toBe(true);
      expect(result.status).toBe('voided');
    });

    it('should fail when payment not found', async () => {
      const voidRequest: PaymentVoidRequest = { paymentId: 'PAY-999999', reason: 'Test' };
      const result = await handler.voidPayment(voidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Payment not found');
    });

    it('should fail when payment already captured', async () => {
      const request = createValidPaymentRequest();
      const processResult = await handler.processPayment(request);
      await handler.capturePayment({ paymentId: processResult.paymentId! });

      const voidRequest: PaymentVoidRequest = {
        paymentId: processResult.paymentId!,
        reason: 'Test'
      };
      const result = await handler.voidPayment(voidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('cannot be voided');
    });

    it('should fail when payment already refunded', async () => {
      const request = createValidPaymentRequest({ method: 'card' });
      const processResult = await handler.processPayment(request);
      await handler.capturePayment({ paymentId: processResult.paymentId! });
      await handler.refundPayment({ paymentId: processResult.paymentId!, amount: 50.00, reason: 'Test' });

      const voidRequest: PaymentVoidRequest = {
        paymentId: processResult.paymentId!,
        reason: 'Test'
      };
      const result = await handler.voidPayment(voidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('cannot be voided');
    });
  });

  describe('getPayment', () => {
    it('should return payment by ID', async () => {
      const request = createValidPaymentRequest();
      const result = await handler.processPayment(request);

      const payment = handler.getPayment(result.paymentId!);
      expect(payment).toBeDefined();
      expect(payment!.paymentId).toBe(result.paymentId);
    });

    it('should return undefined for non-existent payment', () => {
      const payment = handler.getPayment('PAY-999999');
      expect(payment).toBeUndefined();
    });
  });

  describe('getPaymentsByOrder', () => {
    it('should return payments for an order', async () => {
      const request1 = createValidPaymentRequest({ orderId: 'ORD-001' });
      const request2 = createValidPaymentRequest({ orderId: 'ORD-001' });
      const request3 = createValidPaymentRequest({ orderId: 'ORD-002' });

      await handler.processPayment(request1);
      await handler.processPayment(request2);
      await handler.processPayment(request3);

      const payments = handler.getPaymentsByOrder('ORD-001');
      expect(payments).toHaveLength(2);
    });
  });
});