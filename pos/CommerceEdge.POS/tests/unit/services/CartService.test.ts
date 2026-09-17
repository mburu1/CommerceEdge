import { CartService, CartItem, CartState, CartTotals } from '../../../src/services/CartService';
import { Customer } from '../../../src/models/Customer';
import { Payment, PaymentMethod } from '../../../src/models/Order';

describe('CartService', () => {
  let cartService: CartService;

  beforeEach(() => {
    cartService = new CartService();
  });

  describe('getState', () => {
    it('should return initial empty state', () => {
      const state = cartService.getState();
      expect(state.items).toHaveLength(0);
      expect(state.discountPercent).toBe(0);
      expect(state.discountAmount).toBe(0);
      expect(state.taxRate).toBe(0);
      expect(state.suspended).toBe(false);
    });
  });

  describe('getTotals', () => {
    it('should return zero totals for empty cart', () => {
      const totals = cartService.getTotals();
      expect(totals.subtotal).toBe(0);
      expect(totals.discount).toBe(0);
      expect(totals.tax).toBe(0);
      expect(totals.total).toBe(0);
      expect(totals.itemCount).toBe(0);
    });

    it('should calculate totals correctly', () => {
      cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 2, unitPrice: 10.00 });
      cartService.addItem({ productId: 'PROD-002', productName: 'Product B', quantity: 1, unitPrice: 20.00 });

      const totals = cartService.getTotals();
      expect(totals.subtotal).toBe(40.00);
      expect(totals.discount).toBe(0);
      expect(totals.tax).toBe(0);
      expect(totals.total).toBe(40.00);
      expect(totals.itemCount).toBe(3);
    });

    it('should apply item discounts', () => {
      cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 2, unitPrice: 100.00, discountPercent: 10 });

      const totals = cartService.getTotals();
      expect(totals.subtotal).toBe(200.00);
      expect(totals.discount).toBe(20.00);
      expect(totals.total).toBe(180.00);
    });

    it('should apply order discount', () => {
      cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 2, unitPrice: 50.00 });
      cartService.setOrderDiscount(10, 0);

      const totals = cartService.getTotals();
      expect(totals.subtotal).toBe(100.00);
      expect(totals.discount).toBe(10.00);
      expect(totals.total).toBe(90.00);
    });

    it('should apply tax rate', () => {
      cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 100.00 });
      cartService.setTaxRate(10);

      const totals = cartService.getTotals();
      expect(totals.subtotal).toBe(100.00);
      expect(totals.tax).toBe(10.00);
      expect(totals.total).toBe(110.00);
    });
  });

  describe('addItem', () => {
    it('should add item to cart', () => {
      const item = cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 10.00 });

      expect(item.lineId).toMatch(/^LINE-\d{4}$/);
      expect(item.productId).toBe('PROD-001');
      expect(item.quantity).toBe(1);
      expect(item.unitPrice).toBe(10.00);

      const state = cartService.getState();
      expect(state.items).toHaveLength(1);
    });

    it('should generate unique line IDs', () => {
      const item1 = cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 10.00 });
      const item2 = cartService.addItem({ productId: 'PROD-002', productName: 'Product B', quantity: 1, unitPrice: 20.00 });

      expect(item1.lineId).not.toBe(item2.lineId);
    });

    it('should set default discountPercent and taxRate', () => {
      const item = cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 10.00 });

      expect(item.discountPercent).toBe(0);
      expect(item.taxRate).toBe(0);
    });
  });

  describe('updateItem', () => {
    it('should update existing item', () => {
      const item = cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 10.00 });
      const result = cartService.updateItem(item.lineId, { quantity: 3, unitPrice: 15.00 });

      expect(result).toBe(true);
      const state = cartService.getState();
      expect(state.items[0].quantity).toBe(3);
      expect(state.items[0].unitPrice).toBe(15.00);
    });

    it('should return false for non-existent item', () => {
      const result = cartService.updateItem('LINE-9999', { quantity: 5 });
      expect(result).toBe(false);
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const item = cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 10.00 });
      const result = cartService.removeItem(item.lineId);

      expect(result).toBe(true);
      expect(cartService.getState().items).toHaveLength(0);
    });

    it('should return false for non-existent item', () => {
      const result = cartService.removeItem('LINE-9999');
      expect(result).toBe(false);
    });
  });

  describe('setQuantity', () => {
    it('should set item quantity', () => {
      const item = cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 10.00 });
      const result = cartService.setQuantity(item.lineId, 5);

      expect(result).toBe(true);
      expect(cartService.getState().items[0].quantity).toBe(5);
    });

    it('should fail for negative quantity', () => {
      const item = cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 10.00 });
      const result = cartService.setQuantity(item.lineId, -1);

      expect(result).toBe(false);
    });
  });

  describe('setDiscount', () => {
    it('should set item discount', () => {
      const item = cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 100.00 });
      const result = cartService.setDiscount(item.lineId, 20);

      expect(result).toBe(true);
      expect(cartService.getState().items[0].discountPercent).toBe(20);
    });

    it('should fail for discount > 100', () => {
      const item = cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 100.00 });
      const result = cartService.setDiscount(item.lineId, 150);

      expect(result).toBe(false);
    });
  });

  describe('setItemTaxRate', () => {
    it('should set item tax rate', () => {
      const item = cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 100.00 });
      const result = cartService.setItemTaxRate(item.lineId, 8.5);

      expect(result).toBe(true);
      expect(cartService.getState().items[0].taxRate).toBe(8.5);
    });

    it('should fail for negative tax rate', () => {
      const item = cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 100.00 });
      const result = cartService.setItemTaxRate(item.lineId, -5);

      expect(result).toBe(false);
    });
  });

  describe('setCustomer', () => {
    it('should set customer', () => {
      const customer: Customer = { customerId: 'CUST-001', firstName: 'John', lastName: 'Doe', loyaltyTier: 'gold', loyaltyPoints: 5000, createdAt: new Date(), updatedAt: new Date() };
      cartService.setCustomer(customer);

      expect(cartService.getState().customer).toEqual(customer);
    });

    it('should clear customer', () => {
      const customer: Customer = { customerId: 'CUST-001', firstName: 'John', lastName: 'Doe', loyaltyTier: 'gold', loyaltyPoints: 5000, createdAt: new Date(), updatedAt: new Date() };
      cartService.setCustomer(customer);
      cartService.setCustomer(undefined);

      expect(cartService.getState().customer).toBeUndefined();
    });
  });

  describe('setOrderDiscount', () => {
    it('should set order discount percent', () => {
      cartService.setOrderDiscount(15);
      expect(cartService.getState().discountPercent).toBe(15);
    });

    it('should clamp discount percent to 0-100', () => {
      cartService.setOrderDiscount(150);
      expect(cartService.getState().discountPercent).toBe(100);

      cartService.setOrderDiscount(-10);
      expect(cartService.getState().discountPercent).toBe(0);
    });

    it('should set order discount amount', () => {
      cartService.setOrderDiscount(0, 5.00);
      expect(cartService.getState().discountAmount).toBe(5.00);
    });
  });

  describe('setTaxRate (order level)', () => {
    it('should set order tax rate', () => {
      cartService.setTaxRate(8.5);
      expect(cartService.getState().taxRate).toBe(8.5);
    });

    it('should clamp tax rate to >= 0', () => {
      cartService.setTaxRate(-5);
      expect(cartService.getState().taxRate).toBe(0);
    });
  });

  describe('setNotes', () => {
    it('should set notes', () => {
      cartService.setNotes('Test notes');
      expect(cartService.getState().notes).toBe('Test notes');
    });

    it('should clear notes', () => {
      cartService.setNotes('Test notes');
      cartService.setNotes(undefined);
      expect(cartService.getState().notes).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('should reset cart to initial state', () => {
      cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 10.00 });
      cartService.setCustomer({ customerId: 'CUST-001', firstName: 'John', lastName: 'Doe', loyaltyTier: 'bronze', loyaltyPoints: 0, createdAt: new Date(), updatedAt: new Date() });
      cartService.setOrderDiscount(10);
      cartService.setTaxRate(8.5);
      cartService.setNotes('Test');

      cartService.clear();

      const state = cartService.getState();
      expect(state.items).toHaveLength(0);
      expect(state.customer).toBeUndefined();
      expect(state.discountPercent).toBe(0);
      expect(state.discountAmount).toBe(0);
      expect(state.taxRate).toBe(0);
      expect(state.notes).toBeUndefined();
      expect(state.suspended).toBe(false);
    });
  });

  describe('suspend/resume', () => {
    it('should suspend cart', () => {
      cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 10.00 });
      cartService.suspend();

      expect(cartService.isSuspended()).toBe(true);
      expect(cartService.getState().suspendedAt).toBeDefined();
    });

    it('should resume cart', () => {
      cartService.suspend();
      cartService.resume();

      expect(cartService.isSuspended()).toBe(false);
      expect(cartService.getState().suspendedAt).toBeUndefined();
    });
  });

  describe('getItemCount', () => {
    it('should return number of line items', () => {
      cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 2, unitPrice: 10.00 });
      cartService.addItem({ productId: 'PROD-002', productName: 'Product B', quantity: 1, unitPrice: 20.00 });

      expect(cartService.getItemCount()).toBe(2);
    });
  });

  describe('getTotalQuantity', () => {
    it('should return total quantity of all items', () => {
      cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 2, unitPrice: 10.00 });
      cartService.addItem({ productId: 'PROD-002', productName: 'Product B', quantity: 3, unitPrice: 20.00 });

      expect(cartService.getTotalQuantity()).toBe(5);
    });
  });

  describe('hasItems', () => {
    it('should return true when cart has items', () => {
      cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 10.00 });
      expect(cartService.hasItems()).toBe(true);
    });

    it('should return false when cart is empty', () => {
      expect(cartService.hasItems()).toBe(false);
    });
  });

  describe('toOrderData', () => {
    it('should create order data from cart', () => {
      cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 2, unitPrice: 10.00 });
      cartService.setCustomer({ customerId: 'CUST-001', firstName: 'John', lastName: 'Doe', loyaltyTier: 'bronze', loyaltyPoints: 0, createdAt: new Date(), updatedAt: new Date() });
      cartService.setNotes('Test order');

      const payments: Payment[] = [{ paymentId: 'PAY-001', orderId: '', method: 'card', amount: 20.00, status: 'captured', processedAt: new Date() }];
      const orderData = cartService.toOrderData('REG-001', 'OP-001', 'SHIFT-001', payments);

      expect(orderData.customerId).toBe('CUST-001');
      expect(orderData.customerName).toBe('John Doe');
      expect(orderData.items).toHaveLength(1);
      expect(orderData.registerId).toBe('REG-001');
      expect(orderData.operatorId).toBe('OP-001');
      expect(orderData.shiftId).toBe('SHIFT-001');
      expect(orderData.notes).toBe('Test order');
      expect(orderData.paymentStatus).toBe('paid');
      expect(orderData.status).toBe('completed');
    });

    it('should set payment status to partial when underpaid', () => {
      cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 100.00 });
      const payments: Payment[] = [{ paymentId: 'PAY-001', orderId: '', method: 'cash', amount: 50.00, status: 'captured', processedAt: new Date() }];
      const orderData = cartService.toOrderData('REG-001', 'OP-001', 'SHIFT-001', payments);

      expect(orderData.paymentStatus).toBe('partial');
      expect(orderData.status).toBe('pending');
    });

    it('should set payment status to overpaid when overpaid', () => {
      cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 10.00 });
      const payments: Payment[] = [{ paymentId: 'PAY-001', orderId: '', method: 'cash', amount: 20.00, status: 'captured', processedAt: new Date() }];
      const orderData = cartService.toOrderData('REG-001', 'OP-001', 'SHIFT-001', payments);

      expect(orderData.paymentStatus).toBe('overpaid');
      expect(orderData.status).toBe('completed');
    });
  });

  describe('subscribe', () => {
    it('should notify subscribers on state change', () => {
      const listener = jest.fn();
      const unsubscribe = cartService.subscribe(listener);

      cartService.addItem({ productId: 'PROD-001', productName: 'Product A', quantity: 1, unitPrice: 10.00 });
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      cartService.addItem({ productId: 'PROD-002', productName: 'Product B', quantity: 1, unitPrice: 20.00 });
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });
});