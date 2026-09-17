import { Order, OrderItem, OrderStatus, PaymentStatus, Payment, PaymentMethod, Customer } from '../models';

export interface CartItem {
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
  temporary?: boolean;
}

export interface CartState {
  items: CartItem[];
  customer?: Customer;
  discountPercent: number;
  discountAmount: number;
  taxRate: number;
  notes?: string;
  suspended: boolean;
  suspendedAt?: Date;
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  itemCount: number;
}

export class CartService {
  private state: CartState = {
    items: [],
    discountPercent: 0,
    discountAmount: 0,
    taxRate: 0,
    suspended: false
  };

  private listeners: Set<(state: CartState) => void> = new Set();
  private lineCounter: number = 0;

  getState(): Readonly<CartState> {
    return { ...this.state };
  }

  getTotals(): CartTotals {
    const subtotal = this.state.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const itemDiscount = this.state.items.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice) * ((item.discountPercent ?? 0) / 100), 0
    );
    const orderDiscountPercent = subtotal * (this.state.discountPercent / 100);
    const discount = itemDiscount + orderDiscountPercent + this.state.discountAmount;
    const taxableSubtotal = subtotal - discount;
    const tax = taxableSubtotal * (this.state.taxRate / 100);
    const total = taxableSubtotal + tax;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
      itemCount: this.state.items.reduce((sum, item) => sum + item.quantity, 0)
    };
  }

  subscribe(listener: (state: CartState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.getState());
    }
  }

  addItem(item: Partial<Omit<CartItem, 'lineId'>>): CartItem {
    this.lineCounter++;
    const newItem: CartItem = {
      lineId: `LINE-${this.lineCounter.toString().padStart(4, '0')}`,
      productId: item.productId || '',
      productName: item.productName || '',
      sku: item.sku,
      quantity: item.quantity ?? 1,
      unitPrice: item.unitPrice ?? 0,
      discountPercent: item.discountPercent ?? 0,
      discountAmount: item.discountAmount ?? 0,
      taxRate: item.taxRate ?? this.state.taxRate,
      taxAmount: item.taxAmount ?? 0,
      lineTotal: item.lineTotal ?? 0,
      isVoided: item.isVoided ?? false,
      voidReason: item.voidReason,
      temporary: item.temporary
    };

    this.state.items.push(newItem);
    this.notify();
    return newItem;
  }

  updateItem(lineId: string, updates: Partial<CartItem>): boolean {
    const index = this.state.items.findIndex(item => item.lineId === lineId);
    if (index === -1) return false;

    this.state.items[index] = { ...this.state.items[index], ...updates };
    this.notify();
    return true;
  }

  removeItem(lineId: string): boolean {
    const index = this.state.items.findIndex(item => item.lineId === lineId);
    if (index === -1) return false;

    this.state.items.splice(index, 1);
    this.notify();
    return true;
  }

  setQuantity(lineId: string, quantity: number): boolean {
    if (quantity < 0) return false;
    return this.updateItem(lineId, { quantity });
  }

  setDiscount(lineId: string, discountPercent: number): boolean {
    if (discountPercent < 0 || discountPercent > 100) return false;
    return this.updateItem(lineId, { discountPercent });
  }

  setItemTaxRate(lineId: string, taxRate: number): boolean {
    if (taxRate < 0) return false;
    return this.updateItem(lineId, { taxRate });
  }

  setCustomer(customer?: Customer): void {
    this.state.customer = customer;
    this.notify();
  }

  setOrderDiscount(percent: number, amount: number = 0): void {
    this.state.discountPercent = Math.max(0, Math.min(100, percent));
    this.state.discountAmount = Math.max(0, amount);
    this.notify();
  }

  setTaxRate(rate: number): void {
    this.state.taxRate = Math.max(0, rate);
    this.notify();
  }

  setNotes(notes?: string): void {
    this.state.notes = notes;
    this.notify();
  }

  clear(): void {
    this.state = {
      items: [],
      discountPercent: 0,
      discountAmount: 0,
      taxRate: 0,
      suspended: false
    };
    this.notify();
  }

  suspend(): void {
    this.state.suspended = true;
    this.state.suspendedAt = new Date();
    this.notify();
  }

  resume(): void {
    this.state.suspended = false;
    this.state.suspendedAt = undefined;
    this.notify();
  }

  isSuspended(): boolean {
    return this.state.suspended;
  }

  getItemCount(): number {
    return this.state.items.length;
  }

  getTotalQuantity(): number {
    return this.state.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  hasItems(): boolean {
    return this.state.items.length > 0;
  }

  toOrderData(registerId: string, operatorId: string, shiftId: string, payments: Payment[]): Omit<Order, 'orderId' | 'createdAt' | 'updatedAt' | 'completedAt'> {
    const totals = this.getTotals();
    
    return {
      customerId: this.state.customer?.customerId,
      customerName: this.state.customer ? `${this.state.customer.firstName} ${this.state.customer.lastName}` : undefined,
      items: this.state.items.map(item => ({
        lineId: item.lineId,
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent ?? 0,
        discountAmount: (item.quantity * item.unitPrice) * ((item.discountPercent ?? 0) / 100),
        taxRate: item.taxRate ?? 0,
        taxAmount: ((item.quantity * item.unitPrice) * (1 - (item.discountPercent ?? 0) / 100)) * ((item.taxRate ?? 0) / 100),
        lineTotal: (item.quantity * item.unitPrice) * (1 - (item.discountPercent ?? 0) / 100) * (1 + (item.taxRate ?? 0) / 100),
        isVoided: false
      })),
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total,
      paymentStatus: this.determinePaymentStatus(totals.total, payments),
      payments,
      status: this.determineOrderStatus(totals.total, payments),
      registerId,
      operatorId,
      shiftId,
      notes: this.state.notes
    };
  }

  private determinePaymentStatus(total: number, payments: Payment[]): PaymentStatus {
    const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    if (paidAmount <= 0) return 'unpaid';
    if (paidAmount < total - 0.01) return 'partial';
    if (paidAmount > total + 0.01) return 'overpaid';
    return 'paid';
  }

  private determineOrderStatus(total: number, payments: Payment[]): OrderStatus {
    const paymentStatus = this.determinePaymentStatus(total, payments);
    if (paymentStatus === 'paid' || paymentStatus === 'overpaid') return 'completed';
    if (paymentStatus === 'partial') return 'pending';
    return 'pending';
  }
}

export const cartService = new CartService();