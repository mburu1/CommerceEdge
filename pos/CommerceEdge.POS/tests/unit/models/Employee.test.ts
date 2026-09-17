import { Employee, EmployeeRole, Permission, PermissionCategory, PermissionAction, EmployeeSearchCriteria, EmployeeSearchResult, EmployeeAuthRequest, EmployeeAuthResponse } from '../../../src/models/Employee';

describe('Employee Model', () => {
  const createValidPermission = (overrides: Partial<Permission> = {}): Permission => ({
    permissionId: 'PERM-001',
    name: 'process_sale',
    description: 'Process sales transactions',
    category: 'sales',
    resource: 'sales',
    actions: ['create', 'read'],
    ...overrides
  });

  const createValidEmployee = (overrides: Partial<Employee> = {}): Employee => ({
    employeeId: 'EMP-001',
    employeeNumber: '001',
    firstName: 'John',
    lastName: 'Cashier',
    email: 'john.cashier@store.com',
    phone: '555-123-4567',
    role: 'cashier',
    permissions: [createValidPermission()],
    storeId: 'STORE-001',
    registerIds: ['REG-001'],
    isActive: true,
    hireDate: new Date('2024-01-01'),
    biometricEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  });

  describe('Employee interface', () => {
    it('should create a valid employee', () => {
      const employee = createValidEmployee();
      expect(employee.employeeId).toBe('EMP-001');
      expect(employee.firstName).toBe('John');
      expect(employee.lastName).toBe('Cashier');
      expect(employee.role).toBe('cashier');
      expect(employee.isActive).toBe(true);
    });

    it('should support all employee roles', () => {
      const roles: EmployeeRole[] = [
        'cashier', 'senior_cashier', 'shift_supervisor', 
        'assistant_manager', 'store_manager', 'district_manager', 'system_admin'
      ];
      
      for (const role of roles) {
        const employee = createValidEmployee({ role });
        expect(employee.role).toBe(role);
      }
    });

    it('should handle permissions', () => {
      const employee = createValidEmployee({
        permissions: [
          createValidPermission({ permissionId: 'PERM-001', name: 'process_sale', category: 'sales', actions: ['create'] }),
          createValidPermission({ permissionId: 'PERM-002', name: 'process_refund', category: 'returns', actions: ['create'] }),
          createValidPermission({ permissionId: 'PERM-003', name: 'manage_discounts', category: 'discounts', actions: ['create', 'update'] })
        ]
      });
      
      expect(employee.permissions).toHaveLength(3);
      expect(employee.permissions[0].category).toBe('sales');
      expect(employee.permissions[2].actions).toContain('update');
    });

    it('should support all permission categories', () => {
      const categories: PermissionCategory[] = [
        'sales', 'returns', 'discounts', 'voids', 'payments', 
        'shifts', 'reports', 'inventory', 'customers', 
        'employees', 'registers', 'settings', 'admin'
      ];
      
      const permissions = categories.map((cat, i) => 
        createValidPermission({ permissionId: `PERM-${i}`, name: `${cat}_permission`, category: cat })
      );
      
      const employee = createValidEmployee({ permissions });
      expect(employee.permissions).toHaveLength(categories.length);
    });

    it('should support all permission actions', () => {
      const actions: PermissionAction[] = ['create', 'read', 'update', 'delete', 'approve', 'override'];
      
      const permission = createValidPermission({ actions });
      expect(permission.actions).toHaveLength(6);
    });

    it('should handle inactive employee', () => {
      const employee = createValidEmployee({ 
        isActive: false, 
        terminationDate: new Date('2024-06-01') 
      });
      
      expect(employee.isActive).toBe(false);
      expect(employee.terminationDate).toBeDefined();
    });

    it('should handle biometric', () => {
      const employee = createValidEmployee({ 
        biometricEnabled: true, 
        pinHash: 'hashed_pin' 
      });
      
      expect(employee.biometricEnabled).toBe(true);
      expect(employee.pinHash).toBe('hashed_pin');
    });

    it('should handle register assignments', () => {
      const employee = createValidEmployee({ 
        registerIds: ['REG-001', 'REG-002', 'REG-003'] 
      });
      
      expect(employee.registerIds).toHaveLength(3);
    });
  });

  describe('EmployeeAuthRequest', () => {
    it('should create valid auth request', () => {
      const request: EmployeeAuthRequest = {
        employeeId: 'EMP-001',
        pin: '1234',
        registerId: 'REG-001'
      };
      
      expect(request.employeeId).toBe('EMP-001');
      expect(request.pin).toBe('1234');
      expect(request.registerId).toBe('REG-001');
    });
  });

  describe('EmployeeAuthResponse', () => {
    it('should create successful auth response', () => {
      const employee = createValidEmployee();
      const response: EmployeeAuthResponse = {
        success: true,
        employee,
        token: 'jwt-token-here',
        expiresAt: new Date(Date.now() + 3600000)
      };
      
      expect(response.success).toBe(true);
      expect(response.employee).toBeDefined();
      expect(response.token).toBeDefined();
    });

    it('should create failed auth response', () => {
      const response: EmployeeAuthResponse = {
        success: false,
        message: 'Invalid PIN',
        requiresBiometric: true
      };
      
      expect(response.success).toBe(false);
      expect(response.message).toBe('Invalid PIN');
      expect(response.requiresBiometric).toBe(true);
    });
  });

  describe('EmployeeSearchCriteria', () => {
    it('should create valid search criteria', () => {
      const criteria: EmployeeSearchCriteria = {
        storeId: 'STORE-001',
        role: 'cashier',
        isActive: true,
        query: 'john',
        page: 1,
        pageSize: 20
      };
      
      expect(criteria.storeId).toBe('STORE-001');
      expect(criteria.role).toBe('cashier');
      expect(criteria.query).toBe('john');
    });
  });

  describe('EmployeeSearchResult', () => {
    it('should create valid search result', () => {
      const employees = [createValidEmployee({ employeeId: 'EMP-001' })];
      const result: EmployeeSearchResult = {
        employees,
        totalCount: 1,
        page: 1,
        pageSize: 20
      };
      
      expect(result.employees).toHaveLength(1);
      expect(result.totalCount).toBe(1);
    });
  });
});