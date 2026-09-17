export interface RefundRequest {
  registerId: string;
  operatorId: string;
  shiftId: string;
  originalOrderId: string;
  items: RefundItem[];
  payments: RefundPayment[];
  reason: string;
  notes?: string;
}

export interface RefundItem {
  originalLineId: string;
  productId: string;
  quantity: number;
  reason: string;
}

export interface RefundPayment {
  method: 'cash' | 'card' | 'mobile' | 'gift_card' | 'store_credit';
  amount: number;
  reference?: string;
  originalPaymentId?: string;
}

export interface RefundResponse {
  success: boolean;
  refundId?: string;
  refundNumber?: string;
  totalRefunded: number;
  message?: string;
  error?: string;
}

export class RefundHandler {
  private refunds: Map<string, any> = new Map();
  private refundCounter: number = 0;

  constructor(private readonly orderRepository?: Map<string, any>) {}

  handle(request: RefundRequest): RefundResponse {
    if (!request.registerId || !request.operatorId || !request.shiftId) {
      return {
        success: false,
        totalRefunded: 0,
        error: 'Register ID, Operator ID, and Shift ID are required'
      };
    }

    if (!request.originalOrderId) {
      return {
        success: false,
        totalRefunded: 0,
        error: 'Original order ID is required'
      };
    }

    const originalOrder = this.orderRepository?.get(request.originalOrderId);
    if (!originalOrder) {
      return {
        success: false,
        totalRefunded: 0,
        error: 'Original order not found'
      };
    }

    if (originalOrder.status === 'refunded' || originalOrder.status === 'cancelled') {
      return {
        success: false,
        totalRefunded: 0,
        error: 'Order has already been refunded or cancelled'
      };
    }

    if (!request.items || request.items.length === 0) {
      return {
        success: false,
        totalRefunded: 0,
        error: 'Refund must contain at least one item'
      };
    }

    if (!request.reason) {
      return {
        success: false,
        totalRefunded: 0,
        error: 'Refund reason is required'
      };
    }

    let totalRefunded = 0;

    for (const item of request.items) {
      const originalItem = originalOrder.items.find((i: any) => 
        i.lineId === item.originalLineId || i.productId === item.productId
      );

      if (!originalItem) {
        return {
          success: false,
          totalRefunded: 0,
          error: `Original item not found for product ${item.productId}`
        };
      }

      if (item.quantity <= 0 || item.quantity > originalItem.quantity) {
        return {
          success: false,
          totalRefunded: 0,
          error: `Invalid refund quantity for ${originalItem.productName}`
        };
      }

      const lineRefund = (originalItem.lineTotal / originalItem.quantity) * item.quantity;
      totalRefunded += lineRefund;
    }

    if (!request.payments || request.payments.length === 0) {
      return {
        success: false,
        totalRefunded: 0,
        error: 'At least one refund payment method is required'
      };
    }

    const paymentTotal = request.payments.reduce((sum, p) => sum + p.amount, 0);
    if (Math.abs(paymentTotal - totalRefunded) > 0.01) {
      return {
        success: false,
        totalRefunded: 0,
        error: 'Refund payment total does not match refund amount'
      };
    }

    this.refundCounter++;
    const refundId = `REF-${this.refundCounter.toString().padStart(8, '0')}`;
    const refundNumber = `RF-${Date.now().toString().slice(-8)}`;

    const refund = {
      refundId,
      refundNumber,
      originalOrderId: request.originalOrderId,
      registerId: request.registerId,
      operatorId: request.operatorId,
      shiftId: request.shiftId,
      items: request.items,
      payments: request.payments,
      reason: request.reason,
      notes: request.notes,
      totalRefunded,
      status: 'completed',
      createdAt: new Date()
    };

    this.refunds.set(refundId, refund);

    return {
      success: true,
      refundId,
      refundNumber,
      totalRefunded,
      message: 'Refund processed successfully'
    };
  }

  getRefund(refundId: string): any {
    return this.refunds.get(refundId);
  }

  getRefundsByOrder(orderId: string): any[] {
    return Array.from(this.refunds.values()).filter(r => r.originalOrderId === orderId);
  }
}