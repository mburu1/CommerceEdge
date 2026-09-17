import { extensionManager, Extension, ExtensionPoint, ExtensionPointType, ExtensionContext, builtInExtensionPoints, registerBuiltInExtensionPoints, coreExtensions, registerCoreExtensions, TaxCalculatorExtension, DiscountEngineExtension, LoyaltyProviderExtension, ReceiptGeneratorExtension } from '../../../src/extensions';

describe('ExtensionManager', () => {
  let manager: typeof extensionManager;

  beforeEach(() => {
    manager = extensionManager;
    // Clear any existing extensions
    // Note: In real tests, we'd reset the manager
  });

  describe('registerExtensionPoint', () => {
    it('should register an extension point', () => {
      const point: ExtensionPoint = {
        id: 'test.point',
        name: 'Test Point',
        type: 'business_logic',
        description: 'A test extension point',
        version: '1.0.0'
      };

      manager.registerExtensionPoint(point);
      const retrieved = manager.getExtensionPoint('test.point');
      expect(retrieved).toBeDefined();
      expect(retrieved!.id).toBe('test.point');
      expect(retrieved!.type).toBe('business_logic');
    });
  });

  describe('unregisterExtensionPoint', () => {
    it('should unregister an extension point', () => {
      const point: ExtensionPoint = {
        id: 'test.unregister',
        name: 'Test Unregister',
        type: 'ui_component',
        description: 'Test',
        version: '1.0.0'
      };

      manager.registerExtensionPoint(point);
      const result = manager.unregisterExtensionPoint('test.unregister');
      expect(result).toBe(true);
      expect(manager.getExtensionPoint('test.unregister')).toBeUndefined();
    });
  });

  describe('getAllExtensionPoints', () => {
    it('should return all extension points', () => {
      const points = manager.getAllExtensionPoints();
      expect(Array.isArray(points)).toBe(true);
    });
  });

  describe('registerService/getService', () => {
    it('should register and retrieve a service', () => {
      const testService = { name: 'TestService', doSomething: () => 'done' };
      manager.registerService('test-service', testService);
      
      const retrieved = manager.getService<typeof testService>('test-service');
      expect(retrieved).toBe(testService);
    });

    it('should return undefined for non-existent service', () => {
      const retrieved = manager.getService('non-existent');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('registerComponent/unregisterComponent', () => {
    it('should register and unregister a component', () => {
      const component = { id: 'comp-1', render: () => 'html' };
      manager.registerComponent('test-type', 'comp-1', component);
      
      const components = manager.getComponents('test-type');
      expect(components.has('comp-1')).toBe(true);
      expect(components.get('comp-1')).toBe(component);
      
      const result = manager.unregisterComponent('test-type', 'comp-1');
      expect(result).toBe(true);
      expect(components.has('comp-1')).toBe(false);
    });
  });

  describe('addMenuItem/removeMenuItem', () => {
    it('should add and remove menu items', () => {
      const menuItem = { id: 'menu-1', label: 'Test Item', icon: 'test', action: 'test-action' };
      manager.addMenuItem('main-menu', menuItem);
      
      const items = manager.getMenuItems('main-menu');
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe('menu-1');
      
      const result = manager.removeMenuItem('main-menu', 'menu-1');
      expect(result).toBe(true);
      expect(manager.getMenuItems('main-menu')).toHaveLength(0);
    });
  });

  describe('addKeyboardShortcut/removeKeyboardShortcut', () => {
    it('should add and remove keyboard shortcuts', () => {
      const shortcut = { id: 'shortcut-1', key: 'F1', ctrl: false, action: 'help', description: 'Show help' };
      manager.addKeyboardShortcut(shortcut);
      
      const shortcuts = manager.getKeyboardShortcuts();
      expect(shortcuts).toHaveLength(1);
      expect(shortcuts[0].id).toBe('shortcut-1');
      
      const result = manager.removeKeyboardShortcut('shortcut-1');
      expect(result).toBe(true);
      expect(manager.getKeyboardShortcuts()).toHaveLength(0);
    });
  });

  describe('event system', () => {
    it('should emit and listen to events', () => {
      const listener = jest.fn();
      manager.on('test-event', listener);
      
      manager.emit('test-event', { data: 'test' });
      expect(listener).toHaveBeenCalledWith({ data: 'test' });
      
      manager.off('test-event', listener);
      manager.emit('test-event', { data: 'test2' });
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });
});

describe('BuiltInExtensions', () => {
  it('should have all built-in extension points', () => {
    expect(builtInExtensionPoints.length).toBeGreaterThan(0);
    
    const expectedTypes: ExtensionPointType[] = [
      'ui_component', 'business_logic', 'data_transform', 'validation',
      'payment_gateway', 'printer_driver', 'loyalty_provider', 'tax_calculator',
      'discount_engine', 'report_generator', 'menu_item', 'keyboard_shortcut', 'api_endpoint'
    ];
    
    for (const type of expectedTypes) {
      const points = builtInExtensionPoints.filter(p => p.type === type);
      expect(points.length).toBeGreaterThan(0);
    }
  });

  it('should have unique extension point IDs', () => {
    const ids = builtInExtensionPoints.map(p => p.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('should register built-in extension points', () => {
    registerBuiltInExtensionPoints();
    // Should not throw
    expect(true).toBe(true);
  });

  it('should have core extensions', () => {
    expect(coreExtensions.length).toBe(4);
    
    const expectedIds = [
      'commerceedge.core.tax',
      'commerceedge.core.discount',
      'commerceedge.core.loyalty',
      'commerceedge.core.receipt'
    ];
    
    for (const id of expectedIds) {
      const ext = coreExtensions.find(e => e.id === id);
      expect(ext).toBeDefined();
      expect(ext!.enabled).toBe(true);
    }
  });

  it('should register core extensions', () => {
    registerCoreExtensions();
    // Should not throw
    expect(true).toBe(true);
  });
});

describe('Extension Interfaces', () => {
  it('should define TaxCalculatorExtension interface', () => {
    const taxCalc: TaxCalculatorExtension = {
      calculateTax: (subtotal, items) => {
        return items.reduce((sum, item) => sum + (item.amount * item.taxRate / 100), 0);
      },
      getTaxRates: () => new Map([['default', 8.5]]),
      isTaxExempt: () => false
    };
    
    const result = taxCalc.calculateTax(100, [
      { amount: 50, taxRate: 10 },
      { amount: 50, taxRate: 5 }
    ]);
    expect(result).toBe(7.5);
  });

  it('should define DiscountEngineExtension interface', () => {
    const discountEngine: DiscountEngineExtension = {
      calculateDiscounts: (items, customerId) => {
        return items.map(item => ({
          type: 'percentage',
          amount: item.price * item.quantity * 0.1,
          description: '10% discount'
        }));
      },
      getAvailableDiscounts: () => [
        { id: 'DISC-001', name: '10% Off', type: 'percentage', value: 10 }
      ]
    };
    
    const discounts = discountEngine.calculateDiscounts([
      { price: 100, quantity: 2 }
    ], 'CUST-001');
    expect(discounts).toHaveLength(1);
    expect(discounts[0].amount).toBe(20);
  });

  it('should define LoyaltyProviderExtension interface', () => {
    const loyaltyProvider: LoyaltyProviderExtension = {
      getCustomerBalance: async (customerId) => ({ points: 1000, tier: 'silver' }),
      addPoints: async (customerId, points, reason) => {},
      redeemPoints: async (customerId, points) => points * 0.01,
      getRewards: () => [
        { id: 'REW-001', name: '$5 Off', pointsCost: 500, description: 'Get $5 off your next purchase' }
      ]
    };
    
    expect(typeof loyaltyProvider.getCustomerBalance).toBe('function');
    expect(typeof loyaltyProvider.addPoints).toBe('function');
    expect(typeof loyaltyProvider.redeemPoints).toBe('function');
    expect(typeof loyaltyProvider.getRewards).toBe('function');
  });

  it('should define ReceiptGeneratorExtension interface', () => {
    const receiptGen: ReceiptGeneratorExtension = {
      generateReceipt: (order, payments, options) => 'receipt content',
      getSupportedFormats: () => ['thermal', 'a4', 'email']
    };
    
    expect(typeof receiptGen.generateReceipt).toBe('function');
    expect(typeof receiptGen.getSupportedFormats).toBe('function');
    expect(receiptGen.getSupportedFormats()).toContain('thermal');
  });
});