import { Payment, PaymentMethod, PaymentTransactionStatus, CardPaymentDetails } from '../models/Order';

export interface PaymentRequest {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  cardDetails?: Omit<CardPaymentDetails, 'authorizationCode'>;
  metadata?: Record<string, unknown>;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  authorizationCode?: string;
  transactionId?: string;
  status: PaymentTransactionStatus;
  message?: string;
  error?: string;
}

export interface PaymentRefundRequest {
  paymentId: string;
  amount: number;
  reason: string;
  reference?: string;
}

export interface PaymentRefundResponse {
  success: boolean;
  refundId?: string;
  status: PaymentTransactionStatus;
  message?: string;
  error?: string;
}

export interface PaymentVoidRequest {
  paymentId: string;
  reason: string;
}

export interface PaymentVoidResponse {
  success: boolean;
  status: PaymentTransactionStatus;
  message?: string;
  error?: string;
}

export interface PaymentCaptureRequest {
  paymentId: string;
  amount?: number;
}

export interface PaymentCaptureResponse {
  success: boolean;
  capturedAmount?: number;
  status: PaymentTransactionStatus;
  message?: string;
  error?: string;
}

export class PaymentHandler {
  private payments: Map<string, Payment> = new Map();
  private paymentCounter: number = 0;

  constructor(
    private readonly paymentGateway?: {
      authorize: (request: PaymentRequest) => Promise<PaymentResponse>;
      capture: (request: PaymentCaptureRequest) => Promise<PaymentCaptureResponse>;
      refund: (request: PaymentRefundRequest) => Promise<PaymentRefundResponse>;
      void: (request: PaymentVoidRequest) => Promise<PaymentVoidResponse>;
    }
  ) {}

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    if (!request.orderId) {
      return {
        success: false,
        status: 'failed',
        error: 'Order ID is required'
      };
    }

    if (request.amount <= 0) {
      return {
        success: false,
        status: 'failed',
        error: 'Payment amount must be greater than zero'
      };
    }

    if (request.method === 'card' && !request.cardDetails) {
      return {
        success: false,
        status: 'failed',
        error: 'Card details required for card payments'
      };
    }

    this.paymentCounter++;
    const paymentId = `PAY-${this.paymentCounter.toString().padStart(10, '0')}`;

    let response: PaymentResponse;

    if (this.paymentGateway) {
      response = await this.paymentGateway.authorize(request);
    } else {
      response = this.mockAuthorize(request, paymentId);
    }

    if (response.success) {
      const payment: Payment = {
        paymentId: response.paymentId || paymentId,
        orderId: request.orderId,
        method: request.method,
        amount: request.amount,
        reference: request.reference,
        status: response.status,
        processedAt: new Date(),
        authorizedAt: response.status === 'authorized' ? new Date() : undefined,
        capturedAt: response.status === 'captured' ? new Date() : undefined,
        cardDetails: request.cardDetails ? {
          ...request.cardDetails,
          authorizationCode: response.authorizationCode
        } : undefined
      };

      this.payments.set(payment.paymentId, payment);
    }

    return response;
  }

  async capturePayment(request: PaymentCaptureRequest): Promise<PaymentCaptureResponse> {
    const payment = this.payments.get(request.paymentId);
    if (!payment) {
      return {
        success: false,
        status: 'failed',
        error: 'Payment not found'
      };
    }

    if (payment.status !== 'authorized') {
      return {
        success: false,
        status: payment.status,
        error: 'Payment cannot be captured in current state'
      };
    }

    let response: PaymentCaptureResponse;

    if (this.paymentGateway) {
      response = await this.paymentGateway.capture(request);
    } else {
      response = this.mockCapture(request, payment);
    }

    if (response.success) {
      payment.status = response.status;
      payment.capturedAt = new Date();
      payment.capturedAt = new Date();
    }

    return response;
  }

  async refundPayment(request: PaymentRefundRequest): Promise<PaymentRefundResponse> {
    const payment = this.payments.get(request.paymentId);
    if (!payment) {
      return {
        success: false,
        status: 'failed',
        error: 'Payment not found'
      };
    }

    if (payment.status !== 'captured') {
      return {
        success: false,
        status: payment.status,
        error: 'Payment cannot be refunded in current state'
      };
    }

    if (request.amount <= 0 || request.amount > payment.amount) {
      return {
        success: false,
        status: payment.status,
        error: 'Invalid refund amount'
      };
    }

    let response: PaymentRefundResponse;

    if (this.paymentGateway) {
      response = await this.paymentGateway.refund(request);
    } else {
      response = this.mockRefund(request, payment);
    }

    if (response.success) {
      payment.status = response.status;
      payment.refundedAt = new Date();
      payment.refundAmount = request.amount;
    }

    return response;
  }

  async voidPayment(request: PaymentVoidRequest): Promise<PaymentVoidResponse> {
    const payment = this.payments.get(request.paymentId);
    if (!payment) {
      return {
        success: false,
        status: 'failed',
        error: 'Payment not found'
      };
    }

    if (payment.status === 'captured' || payment.status === 'refunded') {
      return {
        success: false,
        status: payment.status,
        error: 'Payment cannot be voided in current state'
      };
    }

    let response: PaymentVoidResponse;

    if (this.paymentGateway) {
      response = await this.paymentGateway.void(request);
    } else {
      response = this.mockVoid(request, payment);
    }

    if (response.success) {
      payment.status = response.status;
    }

    return response;
  }

  getPayment(paymentId: string): Payment | undefined {
    return this.payments.get(paymentId);
  }

  getPaymentsByOrder(orderId: string): Payment[] {
    return Array.from(this.payments.values()).filter(p => p.orderId === orderId);
  }

  private mockAuthorize(request: PaymentRequest, paymentId: string): PaymentResponse {
    const immediateCaptureMethods = ['cash', 'gift_card', 'loyalty_points', 'store_credit'];
    const status = immediateCaptureMethods.includes(request.method) ? 'captured' : 'authorized';
    
    return {
      success: true,
      paymentId,
      authorizationCode: `AUTH-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      transactionId: `TXN-${Date.now()}`,
      status,
      message: status === 'captured' ? 'Payment captured successfully' : 'Payment authorized successfully'
    };
  }

  private mockCapture(request: PaymentCaptureRequest, payment: Payment): PaymentCaptureResponse {
    return {
      success: true,
      capturedAmount: request.amount || payment.amount,
      status: 'captured',
      message: 'Payment captured successfully'
    };
  }

  private mockRefund(request: PaymentRefundRequest, payment: Payment): PaymentRefundResponse {
    return {
      success: true,
      refundId: `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      status: request.amount === payment.amount ? 'refunded' : 'partially_refunded',
      message: 'Refund processed successfully'
    };
  }

  private mockVoid(request: PaymentVoidRequest, payment: Payment): PaymentVoidResponse {
    return {
      success: true,
      status: 'voided',
      message: 'Payment voided successfully'
    };
  }
}