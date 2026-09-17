import { Customer, Address, LoyaltyTier, CustomerSearchCriteria, CustomerSearchResult } from '../../../src/models/Customer';

describe('Customer Model', () => {
  const createValidCustomer = (overrides: Partial<Customer> = {}): Customer => ({
    customerId: 'CUST-001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-123-4567',
    address: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      postalCode: '90210',
      country: 'USA'
    },
    loyaltyTier: 'bronze',
    loyaltyPoints: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  });

  const createValidAddress = (overrides: Partial<Address> = {}): Address => ({
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    postalCode: '90210',
    country: 'USA',
    ...overrides
  });

  describe('Customer interface', () => {
    it('should create a valid customer', () => {
      const customer = createValidCustomer();
      expect(customer.customerId).toBe('CUST-001');
      expect(customer.firstName).toBe('John');
      expect(customer.lastName).toBe('Doe');
      expect(customer.email).toBe('john.doe@example.com');
      expect(customer.loyaltyTier).toBe('bronze');
      expect(customer.loyaltyPoints).toBe(0);
    });

    it('should support all loyalty tiers', () => {
      const tiers: LoyaltyTier[] = ['bronze', 'silver', 'gold', 'platinum'];
      
      for (const tier of tiers) {
        const customer = createValidCustomer({ loyaltyTier: tier });
        expect(customer.loyaltyTier).toBe(tier);
      }
    });

    it('should handle optional fields', () => {
      const customer = createValidCustomer({
        email: undefined,
        phone: undefined,
        address: undefined
      });
      
      expect(customer.email).toBeUndefined();
      expect(customer.phone).toBeUndefined();
      expect(customer.address).toBeUndefined();
    });

    it('should handle address object', () => {
      const address = createValidAddress();
      const customer = createValidCustomer({ address });
      
      expect(customer.address).toEqual(address);
    });

    it('should handle updated timestamps', () => {
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-06-01');
      const customer = createValidCustomer({ createdAt, updatedAt });
      
      expect(customer.createdAt).toEqual(createdAt);
      expect(customer.updatedAt).toEqual(updatedAt);
    });
  });

  describe('CustomerSearchCriteria', () => {
    it('should create valid search criteria', () => {
      const criteria: CustomerSearchCriteria = {
        query: 'john',
        loyaltyTier: 'gold',
        page: 1,
        pageSize: 20
      };
      
      expect(criteria.query).toBe('john');
      expect(criteria.loyaltyTier).toBe('gold');
      expect(criteria.page).toBe(1);
      expect(criteria.pageSize).toBe(20);
    });

    it('should handle all optional fields', () => {
      const criteria: CustomerSearchCriteria = {};
      expect(criteria.query).toBeUndefined();
      expect(criteria.customerId).toBeUndefined();
      expect(criteria.email).toBeUndefined();
      expect(criteria.phone).toBeUndefined();
      expect(criteria.loyaltyTier).toBeUndefined();
      expect(criteria.page).toBeUndefined();
      expect(criteria.pageSize).toBeUndefined();
    });
  });

  describe('CustomerSearchResult', () => {
    it('should create valid search result', () => {
      const customers = [createValidCustomer({ customerId: 'CUST-001' })];
      const result: CustomerSearchResult = {
        customers,
        totalCount: 1,
        page: 1,
        pageSize: 20
      };
      
      expect(result.customers).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });
  });
});