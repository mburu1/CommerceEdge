import { apiGet, apiPost, apiPut, apiDelete } from './api';
import type { Cart } from '@/models';

export const cartService = {
  async getCart(): Promise<Cart> {
    return apiGet<Cart>('/cart');
  },

  async addItem(productId: string, quantity: number, variantId?: string): Promise<Cart> {
    return apiPost<Cart>('/cart/items', { productId, quantity, variantId });
  },

  async updateItem(itemId: string, quantity: number): Promise<Cart> {
    return apiPut<Cart>(`/cart/items/${itemId}`, { quantity });
  },

  async removeItem(itemId: string): Promise<Cart> {
    return apiDelete<Cart>(`/cart/items/${itemId}`);
  },

  async clearCart(): Promise<Cart> {
    return apiDelete<Cart>('/cart');
  },

  async applyCoupon(code: string): Promise<Cart> {
    return apiPost<Cart>('/cart/coupon', { code });
  },

  async removeCoupon(): Promise<Cart> {
    return apiDelete<Cart>('/cart/coupon');
  },
};