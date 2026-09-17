import { triggerManager, TriggerContext, TriggerPhase, TriggerPriority, TriggerHandler, TriggerResult } from '../../../src/triggers/TriggerManager';
import { registerTrigger, executeTrigger, triggerEvents, TriggerEventName, unregisterTrigger } from '../../../src/triggers/TriggerEvents';
import { defaultTriggers, registerDefaultTriggers } from '../../../src/triggers/DefaultTriggers';
import { Order, OrderItem, Payment, Customer, Product, Shift, Employee } from '../../../src/models';

describe('TriggerManager', () => {
  let manager: typeof triggerManager;

  beforeEach(() => {
    // Create a fresh instance for each test
    // Note: In real implementation, we'd reset or create new instance
  });

  const createContext = (overrides: Partial<TriggerContext> = {}): TriggerContext => ({
    registerId: 'REG-001',
    operatorId: 'OP-001',
    shiftId: 'SHIFT-001',
    storeId: 'STORE-001',
    timestamp: new Date(),
    correlationId: 'CORR-001',
    ...overrides
  });

  describe('register', () => {
    it('should register a trigger', () => {
      const registration = {
        name: 'test-trigger',
        phase: 'before' as TriggerPhase,
        priority: 'normal' as TriggerPriority,
        handler: async () => ({ success: true, shouldContinue: true }),
        enabled: true
      };

      triggerManager.register('test-event', registration);
      const triggers = triggerManager.getRegisteredTriggers('test-event');
      expect(triggers).toHaveLength(1);
      expect(triggers[0].name).toBe('test-trigger');
    });

    it('should sort triggers by priority', () => {
      const lowPriority = {
        name: 'low-priority',
        phase: 'before' as TriggerPhase,
        priority: 'low' as TriggerPriority,
        handler: async () => ({ success: true, shouldContinue: true }),
        enabled: true
      };

      const highPriority = {
        name: 'high-priority',
        phase: 'before' as TriggerPhase,
        priority: 'high' as TriggerPriority,
        handler: async () => ({ success: true, shouldContinue: true }),
        enabled: true
      };

      triggerManager.register('priority-test', lowPriority);
      triggerManager.register('priority-test', highPriority);

      const triggers = triggerManager.getRegisteredTriggers('priority-test');
      expect(triggers[0].name).toBe('high-priority');
      expect(triggers[1].name).toBe('low-priority');
    });
  });

  describe('unregister', () => {
    it('should unregister a trigger', () => {
      const registration = {
        name: 'test-trigger',
        phase: 'before' as TriggerPhase,
        priority: 'normal' as TriggerPriority,
        handler: async () => ({ success: true, shouldContinue: true }),
        enabled: true
      };

      triggerManager.register('test-unregister-event', registration);
      const result = triggerManager.unregister('test-unregister-event', 'test-trigger');
      expect(result).toBe(true);
      expect(triggerManager.getRegisteredTriggers('test-unregister-event')).toHaveLength(0);
    });

    it('should return false for non-existent trigger', () => {
      const result = triggerManager.unregister('test-event', 'non-existent');
      expect(result).toBe(false);
    });
  });

  describe('execute', () => {
    it('should execute all enabled triggers', async () => {
      const results: string[] = [];

      const trigger1 = {
        name: 'trigger-1',
        phase: 'before' as TriggerPhase,
        priority: 'normal' as TriggerPriority,
        handler: async () => {
          results.push('trigger-1');
          return { success: true, shouldContinue: true };
        },
        enabled: true
      };

      const trigger2 = {
        name: 'trigger-2',
        phase: 'before' as TriggerPhase,
        priority: 'normal' as TriggerPriority,
        handler: async () => {
          results.push('trigger-2');
          return { success: true, shouldContinue: true };
        },
        enabled: true
      };

      triggerManager.register('execute-test', trigger1);
      triggerManager.register('execute-test', trigger2);

      const result = await triggerManager.execute('execute-test', createContext(), {});

      expect(result.success).toBe(true);
      expect(result.shouldContinue).toBe(true);
      expect(results).toContain('trigger-1');
      expect(results).toContain('trigger-2');
    });

    it('should stop execution when shouldContinue is false', async () => {
      const results: string[] = [];

      const trigger1 = {
        name: 'trigger-1',
        phase: 'before' as TriggerPhase,
        priority: 'normal' as TriggerPriority,
        handler: async () => {
          results.push('trigger-1');
          return { success: true, shouldContinue: false };
        },
        enabled: true
      };

      const trigger2 = {
        name: 'trigger-2',
        phase: 'before' as TriggerPhase,
        priority: 'normal' as TriggerPriority,
        handler: async () => {
          results.push('trigger-2');
          return { success: true, shouldContinue: true };
        },
        enabled: true
      };

      triggerManager.register('stop-test', trigger1);
      triggerManager.register('stop-test', trigger2);

      const result = await triggerManager.execute('stop-test', createContext(), {});

      expect(result.success).toBe(true);
      expect(result.shouldContinue).toBe(false);
      expect(results).toContain('trigger-1');
      expect(results).not.toContain('trigger-2');
    });

    it('should handle trigger errors', async () => {
      const trigger1 = {
        name: 'failing-trigger',
        phase: 'before' as TriggerPhase,
        priority: 'normal' as TriggerPriority,
        handler: async () => {
          throw new Error('Trigger failed');
        },
        enabled: true
      };

      triggerManager.register('error-test', trigger1);

      const result = await triggerManager.execute('error-test', createContext(), {});

      expect(result.success).toBe(false);
      expect(result.shouldContinue).toBe(false);
      expect(result.message).toContain('Trigger failed');
    });

    it('should skip disabled triggers', async () => {
      const results: string[] = [];

      const trigger1 = {
        name: 'enabled-trigger',
        phase: 'before' as TriggerPhase,
        priority: 'normal' as TriggerPriority,
        handler: async () => {
          results.push('enabled-trigger');
          return { success: true, shouldContinue: true };
        },
        enabled: true
      };

      const trigger2 = {
        name: 'disabled-trigger',
        phase: 'before' as TriggerPhase,
        priority: 'normal' as TriggerPriority,
        handler: async () => {
          results.push('disabled-trigger');
          return { success: true, shouldContinue: true };
        },
        enabled: false
      };

      triggerManager.register('disabled-test', trigger1);
      triggerManager.register('disabled-test', trigger2);

      const result = await triggerManager.execute('disabled-test', createContext(), {});

      expect(result.success).toBe(true);
      expect(results).toContain('enabled-trigger');
      expect(results).not.toContain('disabled-trigger');
    });

    it('should merge results from multiple triggers', async () => {
      const trigger1 = {
        name: 'trigger-1',
        phase: 'before' as TriggerPhase,
        priority: 'normal' as TriggerPriority,
        handler: async () => ({
          success: true,
          shouldContinue: true,
          data: { key1: 'value1' },
          modifications: { mod1: 'mod-value1' }
        }),
        enabled: true
      };

      const trigger2 = {
        name: 'trigger-2',
        phase: 'before' as TriggerPhase,
        priority: 'normal' as TriggerPriority,
        handler: async () => ({
          success: true,
          shouldContinue: true,
          data: { key2: 'value2' },
          modifications: { mod2: 'mod-value2' }
        }),
        enabled: true
      };

      triggerManager.register('merge-test', trigger1);
      triggerManager.register('merge-test', trigger2);

      const result = await triggerManager.execute('merge-test', createContext(), {});

      expect(result.data).toEqual({ key1: 'value1', key2: 'value2' });
      expect(result.modifications).toEqual({ mod1: 'mod-value1', mod2: 'mod-value2' });
    });
  });

  describe('enable/disable', () => {
    it('should enable a trigger', () => {
      const registration = {
        name: 'test-trigger',
        phase: 'before' as TriggerPhase,
        priority: 'normal' as TriggerPriority,
        handler: async () => ({ success: true, shouldContinue: true }),
        enabled: false
      };

      triggerManager.register('enable-test', registration);
      triggerManager.enableTrigger('enable-test', 'test-trigger');
      const triggers = triggerManager.getRegisteredTriggers('enable-test');
      expect(triggers[0].enabled).toBe(true);
    });

    it('should disable a trigger', () => {
      const registration = {
        name: 'test-trigger',
        phase: 'before' as TriggerPhase,
        priority: 'normal' as TriggerPriority,
        handler: async () => ({ success: true, shouldContinue: true }),
        enabled: true
      };

      triggerManager.register('disable-test', registration);
      triggerManager.disableTrigger('disable-test', 'test-trigger');
      const triggers = triggerManager.getRegisteredTriggers('disable-test');
      expect(triggers[0].enabled).toBe(false);
    });
  });
});

describe('TriggerEvents', () => {
  beforeEach(() => {
    // Clear triggers before each test
  });

  describe('registerTrigger', () => {
    it('should register a trigger using helper function', () => {
      const registration = {
        name: 'helper-trigger',
        phase: 'before' as TriggerPhase,
        priority: 'normal' as TriggerPriority,
        handler: async () => ({ success: true, shouldContinue: true }),
        enabled: true
      };

      registerTrigger('beforeSale', registration);
      const triggers = triggerManager.getRegisteredTriggers('beforeSale');
      expect(triggers.some(t => t.name === 'helper-trigger')).toBe(true);
    });
  });

  describe('executeTrigger', () => {
    it('should execute trigger using helper function', async () => {
      const registration = {
        name: 'execute-helper-trigger',
        phase: 'before' as TriggerPhase,
        priority: 'normal' as TriggerPriority,
        handler: async () => ({ success: true, shouldContinue: true, data: { executed: true } }),
        enabled: true
      };

      registerTrigger('afterSale', registration);
      const context: TriggerContext = {
        registerId: 'REG-001',
        operatorId: 'OP-001',
        shiftId: 'SHIFT-001',
        storeId: 'STORE-001',
        timestamp: new Date(),
        correlationId: 'test-correlation'
      };
      const result = await executeTrigger('afterSale', context, {});

      expect(result.success).toBe(true);
      expect(result.data?.executed).toBe(true);
    });
  });

  describe('unregisterTrigger', () => {
    it('should unregister trigger using helper function', () => {
      const registration = {
        name: 'unregister-trigger',
        phase: 'before' as TriggerPhase,
        priority: 'normal' as TriggerPriority,
        handler: async () => ({ success: true, shouldContinue: true }),
        enabled: true
      };

      registerTrigger('beforeVoid', registration);
      const result = unregisterTrigger('beforeVoid', 'unregister-trigger');
      expect(result).toBe(true);
    });
  });

  describe('triggerEvents', () => {
    it('should have all expected event names', () => {
      expect(triggerEvents.beforeSale).toBe('beforeSale');
      expect(triggerEvents.afterSale).toBe('afterSale');
      expect(triggerEvents.beforePayment).toBe('beforePayment');
      expect(triggerEvents.afterPayment).toBe('afterPayment');
      expect(triggerEvents.beforeRefund).toBe('beforeRefund');
      expect(triggerEvents.afterRefund).toBe('afterRefund');
      expect(triggerEvents.beforeVoid).toBe('beforeVoid');
      expect(triggerEvents.afterVoid).toBe('afterVoid');
      expect(triggerEvents.beforeDiscount).toBe('beforeDiscount');
      expect(triggerEvents.afterDiscount).toBe('afterDiscount');
      expect(triggerEvents.beforeCustomerAdd).toBe('beforeCustomerAdd');
      expect(triggerEvents.afterCustomerAdd).toBe('afterCustomerAdd');
      expect(triggerEvents.beforeCustomerUpdate).toBe('beforeCustomerUpdate');
      expect(triggerEvents.afterCustomerUpdate).toBe('afterCustomerUpdate');
      expect(triggerEvents.beforeShiftOpen).toBe('beforeShiftOpen');
      expect(triggerEvents.afterShiftOpen).toBe('afterShiftOpen');
      expect(triggerEvents.beforeShiftClose).toBe('beforeShiftClose');
      expect(triggerEvents.afterShiftClose).toBe('afterShiftClose');
      expect(triggerEvents.beforeShiftReconcile).toBe('beforeShiftReconcile');
      expect(triggerEvents.afterShiftReconcile).toBe('afterShiftReconcile');
      expect(triggerEvents.beforeProductScan).toBe('beforeProductScan');
      expect(triggerEvents.afterProductScan).toBe('afterProductScan');
      expect(triggerEvents.beforePriceOverride).toBe('beforePriceOverride');
      expect(triggerEvents.afterPriceOverride).toBe('afterPriceOverride');
      expect(triggerEvents.beforeLogin).toBe('beforeLogin');
      expect(triggerEvents.afterLogin).toBe('afterLogin');
      expect(triggerEvents.beforeLogout).toBe('beforeLogout');
      expect(triggerEvents.afterLogout).toBe('afterLogout');
    });
  });
});

describe('DefaultTriggers', () => {
  const createContext = (overrides: Partial<TriggerContext> = {}): TriggerContext => ({
    registerId: 'REG-001',
    operatorId: 'OP-001',
    shiftId: 'SHIFT-001',
    storeId: 'STORE-001',
    timestamp: new Date(),
    correlationId: 'CORR-001',
    ...overrides
  });

  describe('validateOrderItems', () => {
    it('should fail when items array is empty', async () => {
      const trigger = defaultTriggers.find(t => t.name === 'validateOrderItems')!;
      const handler = trigger.handler as TriggerHandler<TriggerContext, { order: Order; items: OrderItem[] }>;
      const result = await handler(createContext(), { order: {} as Order, items: [] });

      expect(result.success).toBe(false);
      expect(result.shouldContinue).toBe(false);
      expect(result.message).toContain('at least one item');
    });

    it('should fail when quantity is invalid', async () => {
      const trigger = defaultTriggers.find(t => t.name === 'validateOrderItems')!;
      const handler = trigger.handler as TriggerHandler<TriggerContext, { order: Order; items: OrderItem[] }>;
      const items: OrderItem[] = [{ lineId: '1', productId: 'PROD-001', productName: 'Test', quantity: 0, unitPrice: 10, discountPercent: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, lineTotal: 0, isVoided: false }];
      const result = await handler(createContext(), { order: {} as Order, items });

      expect(result.success).toBe(false);
      expect(result.shouldContinue).toBe(false);
      expect(result.message).toContain('Invalid quantity');
    });

    it('should fail when price is negative', async () => {
      const trigger = defaultTriggers.find(t => t.name === 'validateOrderItems')!;
      const handler = trigger.handler as TriggerHandler<TriggerContext, { order: Order; items: OrderItem[] }>;
      const items: OrderItem[] = [{ lineId: '1', productId: 'PROD-001', productName: 'Test', quantity: 1, unitPrice: -10, discountPercent: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, lineTotal: 0, isVoided: false }];
      const result = await handler(createContext(), { order: {} as Order, items });

      expect(result.success).toBe(false);
      expect(result.shouldContinue).toBe(false);
      expect(result.message).toContain('Invalid price');
    });

    it('should pass for valid items', async () => {
      const trigger = defaultTriggers.find(t => t.name === 'validateOrderItems')!;
      const handler = trigger.handler as TriggerHandler<TriggerContext, { order: Order; items: OrderItem[] }>;
      const items: OrderItem[] = [{ lineId: '1', productId: 'PROD-001', productName: 'Test', quantity: 2, unitPrice: 10, discountPercent: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, lineTotal: 20, isVoided: false }];
      const result = await handler(createContext(), { order: {} as Order, items });

      expect(result.success).toBe(true);
      expect(result.shouldContinue).toBe(true);
    });
  });

  describe('applyAutomaticDiscounts', () => {
    it('should apply platinum discount', async () => {
      const trigger = defaultTriggers.find(t => t.name === 'applyAutomaticDiscounts')!;
      const handler = trigger.handler as TriggerHandler<TriggerContext, { order: Order; items: OrderItem[]; customer?: Customer }>;
      const customer: Customer = { customerId: 'CUST-001', firstName: 'John', lastName: 'Doe', loyaltyTier: 'platinum', loyaltyPoints: 15000, createdAt: new Date(), updatedAt: new Date() };
      const result = await handler(createContext(), { order: {} as Order, items: [], customer });

      expect(result.success).toBe(true);
      expect(result.modifications?.loyaltyDiscount).toBe(10);
    });

    it('should apply gold discount', async () => {
      const trigger = defaultTriggers.find(t => t.name === 'applyAutomaticDiscounts')!;
      const handler = trigger.handler as TriggerHandler<TriggerContext, { order: Order; items: OrderItem[]; customer?: Customer }>;
      const customer: Customer = { customerId: 'CUST-001', firstName: 'John', lastName: 'Doe', loyaltyTier: 'gold', loyaltyPoints: 7000, createdAt: new Date(), updatedAt: new Date() };
      const result = await handler(createContext(), { order: {} as Order, items: [], customer });

      expect(result.success).toBe(true);
      expect(result.modifications?.loyaltyDiscount).toBe(5);
    });

    it('should not apply discount for bronze', async () => {
      const trigger = defaultTriggers.find(t => t.name === 'applyAutomaticDiscounts')!;
      const handler = trigger.handler as TriggerHandler<TriggerContext, { order: Order; items: OrderItem[]; customer?: Customer }>;
      const customer: Customer = { customerId: 'CUST-001', firstName: 'John', lastName: 'Doe', loyaltyTier: 'bronze', loyaltyPoints: 100, createdAt: new Date(), updatedAt: new Date() };
      const context: TriggerContext = { registerId: 'REG-001', operatorId: 'OP-001', shiftId: 'SHIFT-001', storeId: 'STORE-001', timestamp: new Date(), correlationId: 'test' };
      const result = await handler(context, { order: {} as Order, items: [], customer });

      expect(result.success).toBe(true);
      expect(result.modifications?.loyaltyDiscount).toBeUndefined();
    });
  });

  describe('validatePaymentAmount', () => {
    it('should fail when payment amount <= 0', async () => {
      const trigger = defaultTriggers.find(t => t.name === 'validatePaymentAmount')!;
      const handler = trigger.handler as TriggerHandler<TriggerContext, { order: Order; payment: Payment }>;
      const order = { orderId: 'ORD-001', total: 100, payments: [] } as unknown as Order;
      const payment: Payment = { paymentId: 'PAY-001', orderId: 'ORD-001', method: 'cash', amount: 0, status: 'pending', processedAt: new Date() };
      const context: TriggerContext = { registerId: 'REG-001', operatorId: 'OP-001', shiftId: 'SHIFT-001', storeId: 'STORE-001', timestamp: new Date(), correlationId: 'test' };
      const result = await handler(context, { order, payment });

      expect(result.success).toBe(false);
      expect(result.shouldContinue).toBe(false);
      expect(result.message).toContain('greater than zero');
    });

    it('should fail when payment exceeds order total', async () => {
      const trigger = defaultTriggers.find(t => t.name === 'validatePaymentAmount')!;
      const handler = trigger.handler as TriggerHandler<TriggerContext, { order: Order; payment: Payment }>;
      const order = { orderId: 'ORD-001', total: 100, payments: [] } as unknown as Order;
      const payment: Payment = { paymentId: 'PAY-001', orderId: 'ORD-001', method: 'cash', amount: 150, status: 'pending', processedAt: new Date() };
      const context: TriggerContext = { registerId: 'REG-001', operatorId: 'OP-001', shiftId: 'SHIFT-001', storeId: 'STORE-001', timestamp: new Date(), correlationId: 'test' };
      const result = await handler(context, { order, payment });

      expect(result.success).toBe(false);
      expect(result.shouldContinue).toBe(false);
      expect(result.message).toContain('exceeds order total');
    });

    it('should pass for valid payment', async () => {
      const trigger = defaultTriggers.find(t => t.name === 'validatePaymentAmount')!;
      const handler = trigger.handler as TriggerHandler<TriggerContext, { order: Order; payment: Payment }>;
      const order = { orderId: 'ORD-001', total: 100, payments: [] } as unknown as Order;
      const payment: Payment = { paymentId: 'PAY-001', orderId: 'ORD-001', method: 'cash', amount: 50, status: 'pending', processedAt: new Date() };
      const context: TriggerContext = { registerId: 'REG-001', operatorId: 'OP-001', shiftId: 'SHIFT-001', storeId: 'STORE-001', timestamp: new Date(), correlationId: 'test' };
      const result = await handler(context, { order, payment });

      expect(result.success).toBe(true);
      expect(result.shouldContinue).toBe(true);
    });
  });

  describe('validateShiftFloat', () => {
    it('should fail when opening float is negative', async () => {
      const trigger = defaultTriggers.find(t => t.name === 'validateShiftFloat')!;
      const handler = trigger.handler as TriggerHandler<TriggerContext, { shift: Shift; openingFloat?: number; closingFloat?: number }>;
      const shift = { shiftId: 'SHIFT-001', registerId: 'REG-001', operatorId: 'OP-001', status: 'open', startTime: new Date(), openingFloat: 100 } as unknown as Shift;
      const context: TriggerContext = { registerId: 'REG-001', operatorId: 'OP-001', shiftId: 'SHIFT-001', storeId: 'STORE-001', timestamp: new Date(), correlationId: 'test' };
      const result = await handler(context, { shift, openingFloat: -50 });

      expect(result.success).toBe(false);
      expect(result.shouldContinue).toBe(false);
      expect(result.message).toContain('Opening float cannot be negative');
    });

    it('should fail when closing float is negative', async () => {
      const trigger = defaultTriggers.find(t => t.name === 'validateShiftFloat')!;
      const handler = trigger.handler as TriggerHandler<TriggerContext, { shift: Shift; openingFloat?: number; closingFloat?: number }>;
      const shift = { shiftId: 'SHIFT-001', registerId: 'REG-001', operatorId: 'OP-001', status: 'open', startTime: new Date(), openingFloat: 100 } as unknown as Shift;
      const context: TriggerContext = { registerId: 'REG-001', operatorId: 'OP-001', shiftId: 'SHIFT-001', storeId: 'STORE-001', timestamp: new Date(), correlationId: 'test' };
      const result = await handler(context, { shift, closingFloat: -50 });

      expect(result.success).toBe(false);
      expect(result.shouldContinue).toBe(false);
      expect(result.message).toContain('Closing float cannot be negative');
    });

    it('should pass for valid floats', async () => {
      const trigger = defaultTriggers.find(t => t.name === 'validateShiftFloat')!;
      const handler = trigger.handler as TriggerHandler<TriggerContext, { shift: Shift; openingFloat?: number; closingFloat?: number }>;
      const shift = { shiftId: 'SHIFT-001', registerId: 'REG-001', operatorId: 'OP-001', status: 'open', startTime: new Date(), openingFloat: 100 } as unknown as Shift;
      const context: TriggerContext = { registerId: 'REG-001', operatorId: 'OP-001', shiftId: 'SHIFT-001', storeId: 'STORE-001', timestamp: new Date(), correlationId: 'test' };
      const result = await handler(context, { shift, openingFloat: 100, closingFloat: 150 });

      expect(result.success).toBe(true);
      expect(result.shouldContinue).toBe(true);
    });
  });

  describe('validateEmployeePermissions', () => {
    it('should fail when employee inactive', async () => {
      const trigger = defaultTriggers.find(t => t.name === 'validateEmployeePermissions')!;
      const handler = trigger.handler as TriggerHandler<TriggerContext, { employee: Employee; requiredPermission?: string }>;
      const employee = { employeeId: 'EMP-001', employeeNumber: '001', firstName: 'John', lastName: 'Doe', email: 'john@test.com', role: 'cashier', permissions: [], storeId: 'STORE-001', registerIds: [], isActive: false, hireDate: new Date(), biometricEnabled: false, createdAt: new Date(), updatedAt: new Date() } as unknown as Employee;
      const result = await handler(createContext(), { employee });

      expect(result.success).toBe(false);
      expect(result.shouldContinue).toBe(false);
      expect(result.message).toContain('inactive');
    });

    it('should fail when missing required permission', async () => {
      const trigger = defaultTriggers.find(t => t.name === 'validateEmployeePermissions')!;
      const handler = trigger.handler as TriggerHandler<TriggerContext, { employee: Employee; requiredPermission?: string }>;
      const employee = { employeeId: 'EMP-001', employeeNumber: '001', firstName: 'John', lastName: 'Doe', email: 'john@test.com', role: 'cashier', permissions: [{ permissionId: 'PERM-001', name: 'process_sale', description: '', category: 'sales', resource: 'sales', actions: ['create'] }], storeId: 'STORE-001', registerIds: [], isActive: true, hireDate: new Date(), biometricEnabled: false, createdAt: new Date(), updatedAt: new Date() } as unknown as Employee;
      const result = await handler(createContext(), { employee, requiredPermission: 'process_refund' });

      expect(result.success).toBe(false);
      expect(result.shouldContinue).toBe(false);
      expect(result.message).toContain('process_refund');
    });

    it('should pass for valid employee with permission', async () => {
      const trigger = defaultTriggers.find(t => t.name === 'validateEmployeePermissions')!;
      const handler = trigger.handler as TriggerHandler<TriggerContext, { employee: Employee; requiredPermission?: string }>;
      const employee = { employeeId: 'EMP-001', employeeNumber: '001', firstName: 'John', lastName: 'Doe', email: 'john@test.com', role: 'cashier', permissions: [{ permissionId: 'PERM-001', name: 'process_refund', description: '', category: 'returns', resource: 'returns', actions: ['create'] }], storeId: 'STORE-001', registerIds: [], isActive: true, hireDate: new Date(), biometricEnabled: false, createdAt: new Date(), updatedAt: new Date() } as unknown as Employee;
      const result = await handler(createContext(), { employee, requiredPermission: 'process_refund' });

      expect(result.success).toBe(true);
      expect(result.shouldContinue).toBe(true);
    });

    it('should pass for admin permission', async () => {
      const trigger = defaultTriggers.find(t => t.name === 'validateEmployeePermissions')!;
      const handler = trigger.handler as TriggerHandler<TriggerContext, { employee: Employee; requiredPermission?: string }>;
      const employee = { employeeId: 'EMP-001', employeeNumber: '001', firstName: 'John', lastName: 'Doe', email: 'john@test.com', role: 'system_admin', permissions: [{ permissionId: 'PERM-001', name: 'admin', description: '', category: 'admin', resource: 'admin', actions: ['admin'] }], storeId: 'STORE-001', registerIds: [], isActive: true, hireDate: new Date(), biometricEnabled: false, createdAt: new Date(), updatedAt: new Date() } as unknown as Employee;
      const result = await handler(createContext(), { employee, requiredPermission: 'any_permission' });

      expect(result.success).toBe(true);
      expect(result.shouldContinue).toBe(true);
    });
  });
});