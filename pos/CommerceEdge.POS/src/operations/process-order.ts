export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxRate?: number;
}

export interface OrderData {
  orderId: string;
  customerId?: string;
  items: OrderItem[];
  paymentMethod: 'cash' | 'card' | 'mobile' | 'mixed';
  payments?: Array<{ method: string; amount: number }>;
  discount?: number;
  taxRate?: number;
  notes?: string;
}

export interface ProcessedOrder {
  orderId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  items: ProcessedOrderItem[];
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'overpaid';
  payments: Array<{ method: string; amount: number }>;
  processedAt: Date;
  error?: string;
}

export interface ProcessedOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  lineTotal: number;
}

export interface ProcessOrderOptions {
  defaultTaxRate?: number;
  defaultDiscount?: number;
  validateInventory?: boolean;
  applyLoyaltyDiscount?: boolean;
}

function calculateItemTotal(item: OrderItem, defaultTaxRate: number, defaultDiscount: number): ProcessedOrderItem {
  const quantity = Math.max(0, item.quantity);
  const unitPrice = Math.max(0, item.unitPrice);
  const discount = item.discount ?? defaultDiscount ?? 0;
  const taxRate = item.taxRate ?? defaultTaxRate ?? 0;

  const lineSubtotal = quantity * unitPrice;
  const discountAmount = lineSubtotal * (discount / 100);
  const discountedSubtotal = lineSubtotal - discountAmount;
  const taxAmount = discountedSubtotal * (taxRate / 100);
  const lineTotal = discountedSubtotal + taxAmount;

  return {
    productId: item.productId,
    productName: item.productName,
    quantity,
    unitPrice,
    discount,
    taxRate,
    lineTotal: Math.round(lineTotal * 100) / 100
  };
}

function calculateOrderTotals(items: ProcessedOrderItem[]): { subtotal: number; discount: number; tax: number; total: number } {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice) * (item.discount / 100), 0);
  const tax = items.reduce((sum, item) => {
    const discountedSubtotal = (item.quantity * item.unitPrice) * (1 - item.discount / 100);
    return sum + discountedSubtotal * (item.taxRate / 100);
  }, 0);
  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100
  };
}

function determinePaymentStatus(
  total: number,
  payments: Array<{ method: string; amount: number }>
): 'unpaid' | 'partial' | 'paid' | 'overpaid' {
  const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  
  if (paidAmount <= 0) return 'unpaid';
  if (paidAmount < total) return 'partial';
  if (paidAmount > total) return 'overpaid';
  return 'paid';
}

export function processOrder(
  orderData: OrderData,
  options: ProcessOrderOptions = {}
): ProcessedOrder {
  const {
    defaultTaxRate = 0,
    defaultDiscount = 0,
    validateInventory = false,
    applyLoyaltyDiscount = false
  } = options;

  if (!orderData.orderId) {
    return {
      orderId: '',
      status: 'failed',
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0,
      items: [],
      paymentStatus: 'unpaid',
      payments: [],
      processedAt: new Date(),
      error: 'Order ID is required'
    };
  }

  if (!orderData.items || orderData.items.length === 0) {
    return {
      orderId: orderData.orderId,
      status: 'failed',
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0,
      items: [],
      paymentStatus: 'unpaid',
      payments: [],
      processedAt: new Date(),
      error: 'Order must contain at least one item'
    };
  }

  for (const item of orderData.items) {
    if (!item.productId || !item.productName) {
      return {
        orderId: orderData.orderId,
        status: 'failed',
        subtotal: 0,
        discount: 0,
        tax: 0,
        total: 0,
        items: [],
        paymentStatus: 'unpaid',
        payments: [],
        processedAt: new Date(),
        error: 'All items must have productId and productName'
      };
    }
    if (item.quantity <= 0) {
      return {
        orderId: orderData.orderId,
        status: 'failed',
        subtotal: 0,
        discount: 0,
        tax: 0,
        total: 0,
        items: [],
        paymentStatus: 'unpaid',
        payments: [],
        processedAt: new Date(),
        error: `Invalid quantity for product ${item.productId}`
      };
    }
    if (item.unitPrice < 0) {
      return {
        orderId: orderData.orderId,
        status: 'failed',
        subtotal: 0,
        discount: 0,
        tax: 0,
        total: 0,
        items: [],
        paymentStatus: 'unpaid',
        payments: [],
        processedAt: new Date(),
        error: `Invalid unit price for product ${item.productId}`
      };
    }
  }

  const processedItems = orderData.items.map(item => 
    calculateItemTotal(item, defaultTaxRate, defaultDiscount)
  );

  let loyaltyDiscount = 0;
  if (applyLoyaltyDiscount && orderData.customerId) {
    loyaltyDiscount = 5;
  }

  const totals = calculateOrderTotals(processedItems);
  const finalDiscount = totals.discount + (totals.subtotal * loyaltyDiscount / 100);
  const finalTotal = totals.total - (totals.subtotal * loyaltyDiscount / 100);

  const payments = orderData.payments || [];
  const paymentStatus = determinePaymentStatus(finalTotal, payments);

  const status = paymentStatus === 'paid' || paymentStatus === 'overpaid' ? 'completed' : 'pending';

  return {
    orderId: orderData.orderId,
    status,
    subtotal: Math.round(totals.subtotal * 100) / 100,
    discount: Math.round(finalDiscount * 100) / 100,
    tax: Math.round(totals.tax * 100) / 100,
    total: Math.round(finalTotal * 100) / 100,
    items: processedItems,
    paymentStatus,
    payments,
    processedAt: new Date()
  };
}

export function validateOrder(orderData: OrderData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!orderData.orderId) {
    errors.push('Order ID is required');
  }

  if (!orderData.items || orderData.items.length === 0) {
    errors.push('Order must contain at least one item');
  } else {
    orderData.items.forEach((item, index) => {
      if (!item.productId) {
        errors.push(`Item ${index + 1}: productId is required`);
      }
      if (!item.productName) {
        errors.push(`Item ${index + 1}: productName is required`);
      }
      if (item.quantity <= 0) {
        errors.push(`Item ${index + 1}: quantity must be greater than 0`);
      }
      if (item.unitPrice < 0) {
        errors.push(`Item ${index + 1}: unitPrice cannot be negative`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}