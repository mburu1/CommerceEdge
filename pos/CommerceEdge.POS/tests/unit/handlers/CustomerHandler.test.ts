import { CustomerHandler, CustomerLookupRequest, CustomerLookupResponse, CreateCustomerRequest, CreateCustomerResponse, UpdateCustomerRequest, UpdateCustomerResponse, AddLoyaltyPointsRequest, AddLoyaltyPointsResponse, RedeemLoyaltyPointsRequest, RedeemLoyaltyPointsResponse } from '../../../src/handlers/CustomerHandler';
import { Customer, LoyaltyTier } from '../../../src/models/Customer';

describe('CustomerHandler', () => {
  let handler: CustomerHandler;
  const mockRepository = new Map<string, Customer>();

  beforeEach(() => {
    mockRepository.clear();
    handler = new CustomerHandler(mockRepository);
  });

  const createValidCustomer = (overrides: Partial<Customer> = {}): Customer => ({
    customerId: 'CUST-001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '555-123-4567',
    address: { street: '123 Main St', city: 'Anytown', state: 'CA', postalCode: '90210', country: 'USA' },
    loyaltyTier: 'bronze',
    loyaltyPoints: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  });

  describe('lookup', () => {
    beforeEach(() => {
      mockRepository.set('CUST-001', createValidCustomer());
      mockRepository.set('CUST-002', createValidCustomer({ 
        customerId: 'CUST-002', 
        firstName: 'Jane', 
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        loyaltyTier: 'gold',
        loyaltyPoints: 5000
      }));
    });

    it('should find customer by ID', async () => {
      const request: CustomerLookupRequest = { customerId: 'CUST-001' };
      const result = await handler.lookup(request);

      expect(result.success).toBe(true);
      expect(result.customer).toBeDefined();
      expect(result.customer!.customerId).toBe('CUST-001');
    });

    it('should find customer by email', async () => {
      const request: CustomerLookupRequest = { email: 'jane.smith@example.com' };
      const result = await handler.lookup(request);

      expect(result.success).toBe(true);
      expect(result.customer).toBeDefined();
      expect(result.customer!.email).toBe('jane.smith@example.com');
    });

    it('should find customer by phone', async () => {
      const request: CustomerLookupRequest = { phone: '555-123-4567' };
      const result = await handler.lookup(request);

      expect(result.success).toBe(true);
      expect(result.customer).toBeDefined();
      expect(result.customer!.phone).toBe('555-123-4567');
    });

    it('should return error for non-existent customer by ID', async () => {
      const request: CustomerLookupRequest = { customerId: 'CUST-999' };
      const result = await handler.lookup(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Customer not found');
    });

    it('should search customers by query', async () => {
      const request: CustomerLookupRequest = { query: 'john' };
      const result = await handler.lookup(request);

      expect(result.success).toBe(true);
      expect(result.customers).toBeDefined();
      expect(result.customers!.customers).toHaveLength(1);
      expect(result.customers!.customers[0].firstName).toBe('John');
    });

    it('should search customers by last name', async () => {
      const request: CustomerLookupRequest = { query: 'smith' };
      const result = await handler.lookup(request);

      expect(result.success).toBe(true);
      expect(result.customers!.customers).toHaveLength(1);
      expect(result.customers!.customers[0].lastName).toBe('Smith');
    });

    it('should filter by loyalty tier', async () => {
      const request: CustomerLookupRequest = { loyaltyTier: 'gold' };
      const result = await handler.lookup(request);

      expect(result.success).toBe(true);
      expect(result.customers!.customers).toHaveLength(1);
      expect(result.customers!.customers[0].loyaltyTier).toBe('gold');
    });

    it('should paginate results', async () => {
      const request: CustomerLookupRequest = { page: 1, pageSize: 1 };
      const result = await handler.lookup(request);

      expect(result.success).toBe(true);
      expect(result.customers!.customers).toHaveLength(1);
      expect(result.customers!.page).toBe(1);
      expect(result.customers!.pageSize).toBe(1);
      expect(result.customers!.totalCount).toBe(2);
    });
  });

  describe('create', () => {
    it('should create a new customer', async () => {
      const request: CreateCustomerRequest = {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.j@example.com',
        phone: '555-987-6543',
        loyaltyTier: 'silver'
      };
      const result = await handler.create(request);

      expect(result.success).toBe(true);
      expect(result.customer).toBeDefined();
      expect(result.customer!.firstName).toBe('Alice');
      expect(result.customer!.lastName).toBe('Johnson');
      expect(result.customer!.email).toBe('alice.j@example.com');
      expect(result.customer!.loyaltyTier).toBe('silver');
      expect(result.customer!.loyaltyPoints).toBe(0);
      expect(result.customer!.customerId).toMatch(/^CUST-\d{8}$/);
    });

    it('should fail when firstName is missing', async () => {
      const request: CreateCustomerRequest = { firstName: '', lastName: 'Doe' };
      const result = await handler.create(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('First name and last name are required');
    });

    it('should fail when lastName is missing', async () => {
      const request: CreateCustomerRequest = { firstName: 'John', lastName: '' };
      const result = await handler.create(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('First name and last name are required');
    });

    it('should fail when email already exists', async () => {
      mockRepository.set('CUST-001', createValidCustomer());

      const request: CreateCustomerRequest = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      };
      const result = await handler.create(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });

    it('should default loyalty tier to bronze', async () => {
      const request: CreateCustomerRequest = { firstName: 'Test', lastName: 'User' };
      const result = await handler.create(request);

      expect(result.success).toBe(true);
      expect(result.customer!.loyaltyTier).toBe('bronze');
    });
  });

  describe('update', () => {
    beforeEach(() => {
      mockRepository.set('CUST-001', createValidCustomer());
    });

    it('should update customer first name', async () => {
      const request: UpdateCustomerRequest = { customerId: 'CUST-001', firstName: 'Johnny' };
      const result = await handler.update(request);

      expect(result.success).toBe(true);
      expect(result.customer!.firstName).toBe('Johnny');
    });

    it('should update customer email', async () => {
      const request: UpdateCustomerRequest = { customerId: 'CUST-001', email: 'johnny.doe@example.com' };
      const result = await handler.update(request);

      expect(result.success).toBe(true);
      expect(result.customer!.email).toBe('johnny.doe@example.com');
    });

    it('should fail when customer not found', async () => {
      const request: UpdateCustomerRequest = { customerId: 'CUST-999', firstName: 'Test' };
      const result = await handler.update(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Customer not found');
    });

    it('should fail when email already in use by another customer', async () => {
      mockRepository.set('CUST-002', createValidCustomer({ 
        customerId: 'CUST-002', 
        email: 'jane.doe@example.com' 
      }));

      const request: UpdateCustomerRequest = { customerId: 'CUST-001', email: 'jane.doe@example.com' };
      const result = await handler.update(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('already in use');
    });

    it('should update loyalty tier', async () => {
      const request: UpdateCustomerRequest = { customerId: 'CUST-001', loyaltyTier: 'platinum' };
      const result = await handler.update(request);

      expect(result.success).toBe(true);
      expect(result.customer!.loyaltyTier).toBe('platinum');
    });
  });

  describe('addLoyaltyPoints', () => {
    beforeEach(() => {
      mockRepository.set('CUST-001', createValidCustomer());
    });

    it('should add loyalty points', async () => {
      const request: AddLoyaltyPointsRequest = { customerId: 'CUST-001', points: 100, reason: 'Purchase' };
      const result = await handler.addLoyaltyPoints(request);

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(100);
      expect(result.message).toBe('Loyalty points added successfully');
    });

    it('should upgrade tier when points threshold reached', async () => {
      const customer = createValidCustomer({ loyaltyPoints: 990 });
      mockRepository.set('CUST-001', customer);

      const request: AddLoyaltyPointsRequest = { customerId: 'CUST-001', points: 20, reason: 'Purchase' };
      const result = await handler.addLoyaltyPoints(request);

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(1010);
      expect(result.newTier).toBe('silver');
    });

    it('should fail when customer not found', async () => {
      const request: AddLoyaltyPointsRequest = { customerId: 'CUST-999', points: 100, reason: 'Purchase' };
      const result = await handler.addLoyaltyPoints(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Customer not found');
    });

    it('should fail when points <= 0', async () => {
      const request: AddLoyaltyPointsRequest = { customerId: 'CUST-001', points: 0, reason: 'Purchase' };
      const result = await handler.addLoyaltyPoints(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('greater than zero');
    });
  });

  describe('redeemLoyaltyPoints', () => {
    beforeEach(() => {
      mockRepository.set('CUST-001', createValidCustomer({ loyaltyPoints: 1000, loyaltyTier: 'silver' }));
    });

    it('should redeem loyalty points', async () => {
      const request: RedeemLoyaltyPointsRequest = { customerId: 'CUST-001', points: 500, orderId: 'ORD-001' };
      const result = await handler.redeemLoyaltyPoints(request);

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(500);
      expect(result.discountAmount).toBe(5.00);
    });

    it('should downgrade tier when points fall below threshold', async () => {
      const customer = createValidCustomer({ loyaltyPoints: 1010, loyaltyTier: 'silver' });
      mockRepository.set('CUST-001', customer);

      const request: RedeemLoyaltyPointsRequest = { customerId: 'CUST-001', points: 20, orderId: 'ORD-001' };
      const result = await handler.redeemLoyaltyPoints(request);

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(990);
    });

    it('should fail when customer not found', async () => {
      const request: RedeemLoyaltyPointsRequest = { customerId: 'CUST-999', points: 100, orderId: 'ORD-001' };
      const result = await handler.redeemLoyaltyPoints(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Customer not found');
    });

    it('should fail when insufficient points', async () => {
      const request: RedeemLoyaltyPointsRequest = { customerId: 'CUST-001', points: 1500, orderId: 'ORD-001' };
      const result = await handler.redeemLoyaltyPoints(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient loyalty points');
    });

    it('should fail when points <= 0', async () => {
      const request: RedeemLoyaltyPointsRequest = { customerId: 'CUST-001', points: -100, orderId: 'ORD-001' };
      const result = await handler.redeemLoyaltyPoints(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('greater than zero');
    });
  });

  describe('getCustomer', () => {
    it('should return customer by ID', () => {
      mockRepository.set('CUST-001', createValidCustomer());

      const customer = handler.getCustomer('CUST-001');
      expect(customer).toBeDefined();
      expect(customer!.customerId).toBe('CUST-001');
    });

    it('should return undefined for non-existent customer', () => {
      const customer = handler.getCustomer('CUST-999');
      expect(customer).toBeUndefined();
    });
  });

  describe('getAllCustomers', () => {
    it('should return all customers', () => {
      mockRepository.set('CUST-001', createValidCustomer());
      mockRepository.set('CUST-002', createValidCustomer({ customerId: 'CUST-002' }));

      const customers = handler.getAllCustomers();
      expect(customers).toHaveLength(2);
    });
  });
});