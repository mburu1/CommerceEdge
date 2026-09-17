import { Customer, CustomerSearchCriteria, CustomerSearchResult, LoyaltyTier } from '../models/Customer';

export interface CustomerLookupRequest {
  query?: string;
  customerId?: string;
  email?: string;
  phone?: string;
  loyaltyTier?: LoyaltyTier;
  page?: number;
  pageSize?: number;
}

export interface CustomerLookupResponse {
  success: boolean;
  customers?: CustomerSearchResult;
  customer?: Customer;
  message?: string;
  error?: string;
}

export interface CreateCustomerRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: Customer['address'];
  loyaltyTier?: LoyaltyTier;
}

export interface CreateCustomerResponse {
  success: boolean;
  customer?: Customer;
  message?: string;
  error?: string;
}

export interface UpdateCustomerRequest {
  customerId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: Customer['address'];
  loyaltyTier?: LoyaltyTier;
}

export interface UpdateCustomerResponse {
  success: boolean;
  customer?: Customer;
  message?: string;
  error?: string;
}

export interface AddLoyaltyPointsRequest {
  customerId: string;
  points: number;
  reason: string;
  orderId?: string;
}

export interface AddLoyaltyPointsResponse {
  success: boolean;
  newBalance?: number;
  newTier?: LoyaltyTier;
  message?: string;
  error?: string;
}

export interface RedeemLoyaltyPointsRequest {
  customerId: string;
  points: number;
  orderId: string;
}

export interface RedeemLoyaltyPointsResponse {
  success: boolean;
  newBalance?: number;
  discountAmount?: number;
  message?: string;
  error?: string;
}

export class CustomerHandler {
  private customers: Map<string, Customer> = new Map();
  private customerCounter: number = 0;

  constructor(private readonly customerRepository?: Map<string, Customer>) {
    if (customerRepository) {
      this.customers = customerRepository;
    }
  }

  async lookup(request: CustomerLookupRequest): Promise<CustomerLookupResponse> {
    let results: Customer[] = [];

    if (request.customerId) {
      const customer = this.customers.get(request.customerId);
      if (customer) {
        return {
          success: true,
          customer,
          message: 'Customer found'
        };
      }
      return {
        success: false,
        error: 'Customer not found'
      };
    }

    if (request.email) {
      const customer = Array.from(this.customers.values()).find(c => c.email === request.email);
      if (customer) {
        return {
          success: true,
          customer,
          message: 'Customer found'
        };
      }
      return {
        success: false,
        error: 'Customer not found'
      };
    }

    if (request.phone) {
      const customer = Array.from(this.customers.values()).find(c => c.phone === request.phone);
      if (customer) {
        return {
          success: true,
          customer,
          message: 'Customer found'
        };
      }
      return {
        success: false,
        error: 'Customer not found'
      };
    }

    results = Array.from(this.customers.values());

    if (request.query) {
      const query = request.query.toLowerCase();
      results = results.filter(c => 
        c.firstName.toLowerCase().includes(query) ||
        c.lastName.toLowerCase().includes(query) ||
        c.customerId.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.phone?.includes(query)
      );
    }

    if (request.loyaltyTier) {
      results = results.filter(c => c.loyaltyTier === request.loyaltyTier);
    }

    const page = request.page || 1;
    const pageSize = request.pageSize || 20;
    const start = (page - 1) * pageSize;
    const paginatedResults = results.slice(start, start + pageSize);

    return {
      success: true,
      customers: {
        customers: paginatedResults,
        totalCount: results.length,
        page,
        pageSize
      },
      message: 'Search completed'
    };
  }

  async create(request: CreateCustomerRequest): Promise<CreateCustomerResponse> {
    if (!request.firstName || !request.lastName) {
      return {
        success: false,
        error: 'First name and last name are required'
      };
    }

    if (request.email) {
      const existing = Array.from(this.customers.values()).find(c => c.email === request.email);
      if (existing) {
        return {
          success: false,
          error: 'Customer with this email already exists'
        };
      }
    }

    this.customerCounter++;
    const customerId = `CUST-${this.customerCounter.toString().padStart(8, '0')}`;

    const now = new Date();
    const customer: Customer = {
      customerId,
      firstName: request.firstName,
      lastName: request.lastName,
      email: request.email,
      phone: request.phone,
      address: request.address,
      loyaltyTier: request.loyaltyTier || 'bronze',
      loyaltyPoints: 0,
      createdAt: now,
      updatedAt: now
    };

    this.customers.set(customerId, customer);

    return {
      success: true,
      customer,
      message: 'Customer created successfully'
    };
  }

  async update(request: UpdateCustomerRequest): Promise<UpdateCustomerResponse> {
    const customer = this.customers.get(request.customerId);
    if (!customer) {
      return {
        success: false,
        error: 'Customer not found'
      };
    }

    if (request.firstName) customer.firstName = request.firstName;
    if (request.lastName) customer.lastName = request.lastName;
    if (request.email) {
      const existing = Array.from(this.customers.values()).find(c => c.email === request.email && c.customerId !== request.customerId);
      if (existing) {
        return {
          success: false,
          error: 'Email already in use by another customer'
        };
      }
      customer.email = request.email;
    }
    if (request.phone) customer.phone = request.phone;
    if (request.address) customer.address = request.address;
    if (request.loyaltyTier) customer.loyaltyTier = request.loyaltyTier;

    customer.updatedAt = new Date();

    return {
      success: true,
      customer,
      message: 'Customer updated successfully'
    };
  }

  async addLoyaltyPoints(request: AddLoyaltyPointsRequest): Promise<AddLoyaltyPointsResponse> {
    const customer = this.customers.get(request.customerId);
    if (!customer) {
      return {
        success: false,
        error: 'Customer not found'
      };
    }

    if (request.points <= 0) {
      return {
        success: false,
        error: 'Points must be greater than zero'
      };
    }

    customer.loyaltyPoints += request.points;
    customer.updatedAt = new Date();

    const newTier = this.calculateLoyaltyTier(customer.loyaltyPoints);
    const tierChanged = newTier !== customer.loyaltyTier;
    customer.loyaltyTier = newTier;

    return {
      success: true,
      newBalance: customer.loyaltyPoints,
      newTier: tierChanged ? newTier : undefined,
      message: tierChanged 
        ? `Loyalty points added. New tier: ${newTier}` 
        : 'Loyalty points added successfully'
    };
  }

  async redeemLoyaltyPoints(request: RedeemLoyaltyPointsRequest): Promise<RedeemLoyaltyPointsResponse> {
    const customer = this.customers.get(request.customerId);
    if (!customer) {
      return {
        success: false,
        error: 'Customer not found'
      };
    }

    if (request.points <= 0) {
      return {
        success: false,
        error: 'Points must be greater than zero'
      };
    }

    if (customer.loyaltyPoints < request.points) {
      return {
        success: false,
        error: 'Insufficient loyalty points'
      };
    }

    customer.loyaltyPoints -= request.points;
    customer.updatedAt = new Date();

    const newTier = this.calculateLoyaltyTier(customer.loyaltyPoints);
    const tierChanged = newTier !== customer.loyaltyTier;
    customer.loyaltyTier = newTier;

    const discountAmount = request.points * 0.01;

    return {
      success: true,
      newBalance: customer.loyaltyPoints,
      discountAmount,
      message: 'Loyalty points redeemed successfully'
    };
  }

  private calculateLoyaltyTier(points: number): LoyaltyTier {
    if (points >= 10000) return 'platinum';
    if (points >= 5000) return 'gold';
    if (points >= 1000) return 'silver';
    return 'bronze';
  }

  getCustomer(customerId: string): Customer | undefined {
    return this.customers.get(customerId);
  }

  getAllCustomers(): Customer[] {
    return Array.from(this.customers.values());
  }
}