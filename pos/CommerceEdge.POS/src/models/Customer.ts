export interface Customer {
  customerId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: Address;
  loyaltyTier: LoyaltyTier;
  loyaltyPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface CustomerSearchCriteria {
  query?: string;
  customerId?: string;
  email?: string;
  phone?: string;
  loyaltyTier?: LoyaltyTier;
  page?: number;
  pageSize?: number;
}

export interface CustomerSearchResult {
  customers: Customer[];
  totalCount: number;
  page: number;
  pageSize: number;
}