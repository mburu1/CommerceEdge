import { apiGet } from './api';
import type { Product, Category, PaginatedResponse } from '@/models';

export const productService = {
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
  }): Promise<PaginatedResponse<Product>> {
    return apiGet<PaginatedResponse<Product>>('/products', params as Record<string, string>);
  },

  async getProduct(id: string): Promise<Product> {
    return apiGet<Product>(`/products/${id}`);
  },

  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    return apiGet<Product[]>(`/products/featured?limit=${limit}`);
  },

  async getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
    return apiGet<Product[]>(`/products/${productId}/related?limit=${limit}`);
  },

  async getCategories(): Promise<Category[]> {
    return apiGet<Category[]>('/categories');
  },

  async getCategory(slug: string): Promise<Category> {
    return apiGet<Category>(`/categories/${slug}`);
  },
};