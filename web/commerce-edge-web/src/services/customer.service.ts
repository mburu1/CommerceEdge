import { apiGet, apiPost, apiPut, apiDelete } from './api';
import type { Customer, Address, PaymentMethod, AuthResponse, LoginCredentials, RegisterData } from '@/models';

export const customerService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiPost<AuthResponse>('/auth/login', credentials);
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    return apiPost<AuthResponse>('/auth/register', data);
  },

  async logout(): Promise<void> {
    return apiPost<void>('/auth/logout', {});
  },

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    return apiPost<AuthResponse>('/auth/refresh', { refreshToken });
  },

  async getProfile(): Promise<Customer> {
    return apiGet<Customer>('/customers/me');
  },

  async updateProfile(data: Partial<Customer>): Promise<Customer> {
    return apiPut<Customer>('/customers/me', data);
  },

  async getAddresses(): Promise<Address[]> {
    return apiGet<Address[]>('/customers/me/addresses');
  },

  async getAddress(id: string): Promise<Address> {
    return apiGet<Address>(`/customers/me/addresses/${id}`);
  },

  async createAddress(address: Omit<Address, 'id'>): Promise<Address> {
    return apiPost<Address>('/customers/me/addresses', address);
  },

  async updateAddress(id: string, address: Partial<Address>): Promise<Address> {
    return apiPut<Address>(`/customers/me/addresses/${id}`, address);
  },

  async deleteAddress(id: string): Promise<void> {
    return apiDelete<void>(`/customers/me/addresses/${id}`);
  },

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return apiGet<PaymentMethod[]>('/customers/me/payment-methods');
  },

  async addPaymentMethod(method: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> {
    return apiPost<PaymentMethod>('/customers/me/payment-methods', method);
  },

  async deletePaymentMethod(id: string): Promise<void> {
    return apiDelete<void>(`/customers/me/payment-methods/${id}`);
  },

  async setDefaultPaymentMethod(id: string): Promise<PaymentMethod> {
    return apiPut<PaymentMethod>(`/customers/me/payment-methods/${id}/default`, {});
  },
};