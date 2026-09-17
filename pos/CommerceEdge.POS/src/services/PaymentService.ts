import { Payment, PaymentMethod, PaymentTransactionStatus, CardPaymentDetails } from '../models/Order';
import { CartService, CartTotals } from './CartService';

export interface PaymentRequest {
  method: PaymentMethod;
  amount: number;
  reference?: string;
  cardDetails?: Omit<CardPaymentDetails, 'authorizationCode'>;
}

export interface PaymentResult {
  success: boolean;
  payment?: Payment;
  authorizationCode?: string;
  error?: string;
  changeDue?: number;
}

export interface SplitPaymentRequest {
  payments: PaymentRequest[];
}

export class PaymentService {
  private payments: Payment[] = [];
  private paymentCounter: number = 0;

  constructor(private readonly cartService: CartService) {}

  processPayment(request: PaymentRequest): PaymentResult {
    const totals = this.cartService.getTotals();
    const paidAmount = this.getPaidAmount();
    const remainingAmount = totals.total - paidAmount;

    if (request.amount <= 0) {
      return { success: false, error: 'Payment amount must be greater than zero' };
    }

    if (request.amount > remainingAmount + 0.01) {
      return { success: false, error: `Payment amount exceeds remaining balance of ${remainingAmount.toFixed(2)}` };
    }

    if (request.method === 'card' && !request.cardDetails) {
      return { success: false, error: 'Card details required for card payments' };
    }

    this.paymentCounter++;
    const paymentId = `PAY-${this.paymentCounter.toString().padStart(10, '0')}`;
    const authorizationCode = this.generateAuthCode();

    const payment: Payment = {
      paymentId,
      orderId: '',
      method: request.method,
      amount: request.amount,
      reference: request.reference,
      status: this.getInitialStatus(request.method),
      processedAt: new Date(),
      authorizedAt: new Date(),
      cardDetails: request.cardDetails ? {
        ...request.cardDetails,
        authorizationCode
      } : undefined
    };

    this.payments.push(payment);

    const newPaidAmount = this.getPaidAmount();
    const changeDue = Math.max(0, newPaidAmount - totals.total);

    return {
      success: true,
      payment,
      authorizationCode,
      changeDue
    };
  }

  processSplitPayment(request: SplitPaymentRequest): PaymentResult[] {
    return request.payments.map(req => this.processPayment(req));
  }

  voidPayment(paymentId: string): boolean {
    const index = this.payments.findIndex(p => p.paymentId === paymentId);
    if (index === -1) return false;

    const payment = this.payments[index];
    if (payment.status === 'captured' || payment.status === 'refunded') return false;

    payment.status = 'voided';
    return true;
  }

  refundPayment(paymentId: string, amount: number, reason: string): PaymentResult {
    const payment = this.payments.find(p => p.paymentId === paymentId);
    if (!payment) {
      return { success: false, error: 'Payment not found' };
    }

    if (payment.status !== 'captured') {
      return { success: false, error: 'Payment cannot be refunded' };
    }

    if (amount <= 0 || amount > payment.amount) {
      return { success: false, error: 'Invalid refund amount' };
    }

    payment.status = amount === payment.amount ? 'refunded' : 'partially_refunded';
    payment.refundedAt = new Date();
    payment.refundAmount = amount;

    return {
      success: true,
      payment
    };
  }

  getPayments(): Payment[] {
    return [...this.payments];
  }

  getPayment(paymentId: string): Payment | undefined {
    return this.payments.find(p => p.paymentId === paymentId);
  }

  getPaymentsByOrder(orderId: string): Payment[] {
    return this.payments.filter(p => p.orderId === orderId);
  }

  getPaidAmount(): number {
    return this.payments
      .filter(p => p.status !== 'voided' && p.status !== 'refunded')
      .reduce((sum, p) => sum + p.amount, 0);
  }

  getRefundedAmount(): number {
    return this.payments
      .filter(p => p.status === 'refunded' || p.status === 'partially_refunded')
      .reduce((sum, p) => sum + (p.refundAmount || 0), 0);
  }

  getChangeDue(totals: CartTotals): number {
    return Math.max(0, this.getPaidAmount() - totals.total);
  }

  isFullyPaid(totals: CartTotals): boolean {
    return this.getPaidAmount() >= totals.total - 0.01;
  }

  getRemainingAmount(totals: CartTotals): number {
    return Math.max(0, totals.total - this.getPaidAmount());
  }

  clear(): void {
    this.payments = [];
  }

  private getInitialStatus(method: PaymentMethod): PaymentTransactionStatus {
    switch (method) {
      case 'cash':
        return 'captured';
      case 'card':
      case 'mobile':
        return 'authorized';
      case 'gift_card':
      case 'loyalty_points':
      case 'store_credit':
        return 'captured';
      default:
        return 'pending';
    }
  }

  private generateAuthCode(): string {
    return `AUTH-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  }
}