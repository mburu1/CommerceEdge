export interface SaleRequest {
  registerId: string;
  operatorId: string;
  shiftId: string;
  items: SaleItem[];
  customerId?: string;
  payments: SalePayment[];
  notes?: string;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  taxRate?: number;
  overridePrice?: boolean;
  priceOverrideReason?: string;
}

export interface SalePayment {
  method: 'cash' | 'card' | 'mobile' | 'gift_card' | 'loyalty_points' | 'store_credit';
  amount: number;
  reference?: string;
  cardDetails?: {
    cardType: string;
    lastFourDigits: string;
    authorizationCode?: string;
  };
}

export interface SaleResponse {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  receiptNumber?: string;
  total: number;
  changeDue: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  message?: string;
  error?: string;
}

export class SaleHandler {
  private orders: Map<string, any> = new Map();
  private orderCounter: number = 0;

  constructor(private readonly dependencies?: {
    inventoryService?: any;
    paymentService?: any;
    receiptService?: any;
    loyaltyService?: any;
  }) {}

  async handle(request: SaleRequest): Promise<SaleResponse> {
    if (!request.registerId || !request.operatorId || !request.shiftId) {
      return {
        success: false,
        total: 0,
        changeDue: 0,
        paymentStatus: 'unpaid',
        error: 'Register ID, Operator ID, and Shift ID are required'
      };
    }

    if (!request.items || request.items.length === 0) {
      return {
        success: false,
        total: 0,
        changeDue: 0,
        paymentStatus: 'unpaid',
        error: 'Sale must contain at least one item'
      };
    }

    if (!request.payments || request.payments.length === 0) {
      return {
        success: false,
        total: 0,
        changeDue: 0,
        paymentStatus: 'unpaid',
        error: 'At least one payment is required'
      };
    }

    for (const item of request.items) {
      if (item.quantity <= 0) {
        return {
          success: false,
          total: 0,
          changeDue: 0,
          paymentStatus: 'unpaid',
          error: `Invalid quantity for product ${item.productId}`
        };
      }
      if (item.unitPrice < 0) {
        return {
          success: false,
          total: 0,
          changeDue: 0,
          paymentStatus: 'unpaid',
          error: `Invalid price for product ${item.productId}`
        };
      }
    }

    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    const processedItems = request.items.map(item => {
      const lineSubtotal = item.quantity * item.unitPrice;
      const discountAmount = lineSubtotal * ((item.discountPercent || 0) / 100);
      const discountedSubtotal = lineSubtotal - discountAmount;
      const taxAmount = discountedSubtotal * ((item.taxRate || 0) / 100);
      const lineTotal = discountedSubtotal + taxAmount;

      subtotal += lineSubtotal;
      totalDiscount += discountAmount;
      totalTax += taxAmount;

      return {
        ...item,
        lineSubtotal,
        discountAmount,
        taxAmount,
        lineTotal
      };
    });

    const total = subtotal - totalDiscount + totalTax;
    const paidAmount = request.payments.reduce((sum, p) => sum + p.amount, 0);
    const changeDue = Math.max(0, paidAmount - total);

    let paymentStatus: 'paid' | 'partial' | 'unpaid';
    if (paidAmount >= total - 0.01) {
      paymentStatus = 'paid';
    } else if (paidAmount > 0) {
      paymentStatus = 'partial';
    } else {
      paymentStatus = 'unpaid';
    }

    this.orderCounter++;
    const orderId = `ORD-${this.orderCounter.toString().padStart(8, '0')}`;
    const orderNumber = `SO-${Date.now().toString().slice(-8)}`;

    const order = {
      orderId,
      orderNumber,
      registerId: request.registerId,
      operatorId: request.operatorId,
      shiftId: request.shiftId,
      customerId: request.customerId,
      items: processedItems,
      subtotal,
      discount: totalDiscount,
      tax: totalTax,
      total,
      payments: request.payments,
      paymentStatus,
      status: paymentStatus === 'paid' ? 'completed' : 'pending',
      notes: request.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.orders.set(orderId, order);

    return {
      success: true,
      orderId,
      orderNumber,
      receiptNumber: `RCT-${orderNumber}`,
      total,
      changeDue,
      paymentStatus,
      message: 'Sale completed successfully'
    };
  }

  getOrder(orderId: string): any {
    return this.orders.get(orderId);
  }

  getOrdersByShift(shiftId: string): any[] {
    return Array.from(this.orders.values()).filter(o => o.shiftId === shiftId);
  }
}