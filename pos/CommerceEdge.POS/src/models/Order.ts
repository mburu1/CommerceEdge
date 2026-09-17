export interface Order {
  orderId: string;
  customerId?: string;
  customerName?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentStatus: PaymentStatus;
  payments: Payment[];
  status: OrderStatus;
  registerId: string;
  operatorId: string;
  shiftId: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface OrderItem {
  lineId: string;
  productId: string;
  productName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
  isVoided: boolean;
  voidReason?: string;
}

export type OrderStatus = 'draft' | 'pending' | 'completed' | 'cancelled' | 'refunded' | 'partially_refunded';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'overpaid' | 'refunded';

export interface Payment {
  paymentId: string;
  orderId: string;
  method: PaymentMethod;
  amount: number;
  reference?: string;
  status: PaymentTransactionStatus;
  processedAt: Date;
  authorizedAt?: Date;
  capturedAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
  cardDetails?: CardPaymentDetails;
}

export type PaymentMethod = 'cash' | 'card' | 'mobile' | 'gift_card' | 'loyalty_points' | 'store_credit' | 'mixed';

export type PaymentTransactionStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'partially_refunded' | 'voided';

export interface CardPaymentDetails {
  cardType: 'visa' | 'mastercard' | 'amex' | 'discover' | 'other';
  lastFourDigits: string;
  expiryMonth?: number;
  expiryYear?: number;
  authorizationCode?: string;
  emvData?: string;
}

export interface OrderSearchCriteria {
  orderId?: string;
  customerId?: string;
  registerId?: string;
  operatorId?: string;
  shiftId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  pageSize?: number;
}

export interface OrderSearchResult {
  orders: Order[];
  totalCount: number;
  page: number;
  pageSize: number;
}