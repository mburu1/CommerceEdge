import { CartService } from '@/features/cart/cart.service';

describe('CartService', () => {
  let cart: CartService;

  beforeEach(() => {
    cart = new CartService();
  });

  describe('calculateTotal', () => {
    it('returns 0 for an empty cart', () => {
      expect(cart.calculateTotal()).toBe(0);
    });

    it('calculates total for a single item', () => {
      cart.addItem({ price: 10, quantity: 2 });
      expect(cart.calculateTotal()).toBe(20);
    });

    it('calculates total for multiple items', () => {
      cart.addItem({ price: 10, quantity: 2 });
      cart.addItem({ price: 5, quantity: 3 });
      expect(cart.calculateTotal()).toBe(35);
    });

    it('calculates total with passed items argument', () => {
      const items = [
        { price: 15, quantity: 1 },
        { price: 20, quantity: 4 },
      ];
      expect(cart.calculateTotal(items)).toBe(95);
    });

    it('handles items with quantity of zero', () => {
      cart.addItem({ price: 10, quantity: 0 });
      expect(cart.calculateTotal()).toBe(0);
    });
  });

  describe('addItem', () => {
    it('adds an item to the cart', () => {
      cart.addItem({ price: 10, quantity: 1 });
      expect(cart.getItems()).toHaveLength(1);
      expect(cart.getItems()[0]).toEqual({ price: 10, quantity: 1 });
    });

    it('adds multiple items', () => {
      cart.addItem({ price: 10, quantity: 1 });
      cart.addItem({ price: 20, quantity: 2 });
      expect(cart.getItems()).toHaveLength(2);
    });
  });

  describe('removeItem', () => {
    it('removes an item at the given index', () => {
      cart.addItem({ price: 10, quantity: 1 });
      cart.addItem({ price: 20, quantity: 2 });
      cart.removeItem(0);
      expect(cart.getItems()).toHaveLength(1);
      expect(cart.getItems()[0]).toEqual({ price: 20, quantity: 2 });
    });
  });

  describe('getItemCount', () => {
    it('returns 0 for empty cart', () => {
      expect(cart.getItemCount()).toBe(0);
    });

    it('sums up quantities of all items', () => {
      cart.addItem({ price: 10, quantity: 2 });
      cart.addItem({ price: 5, quantity: 3 });
      expect(cart.getItemCount()).toBe(5);
    });
  });

  describe('clear', () => {
    it('removes all items from the cart', () => {
      cart.addItem({ price: 10, quantity: 1 });
      cart.addItem({ price: 20, quantity: 2 });
      cart.clear();
      expect(cart.getItems()).toHaveLength(0);
      expect(cart.calculateTotal()).toBe(0);
      expect(cart.getItemCount()).toBe(0);
    });
  });
});
