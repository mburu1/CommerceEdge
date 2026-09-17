import { apiGet, apiPost } from './api';
import type { Order, CheckoutData, ShippingMethod, PaginatedResponse } from '@/models';

export const orderService = {
  async getOrders(params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<Order>> {
    return apiGet<PaginatedResponse<Order>>('/orders', params as Record<string, string>);
  },

  async getOrder(id: string): Promise<Order> {
    return apiGet<Order>(`/orders/${id}`);
  },

  async createOrder(data: CheckoutData): Promise<Order> {
    return apiPost<Order>('/orders', data);
  },

  async cancelOrder(id: string): Promise<Order> {
    return apiPost<Order>(`/orders/${id}/cancel`, {});
  },

  async getShippingMethods(): Promise<ShippingMethod[]> {
    return apiGet<ShippingMethod[]>('/shipping-methods');
  },

  async trackOrder(trackingNumber: string): Promise<{ trackingUrl: string; events: Array<{ date: string; status: string; location: string }> }> {
    return apiGet(`/orders/track/${trackingNumber}`);
  },
};