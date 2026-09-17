import { viewRegistry, ViewConfig, ViewType, ViewInstance, ViewState } from '../../../src/views/ViewRegistry';
import { saleViewConfig, refundViewConfig, customerViewConfig, shiftViewConfig, paymentViewConfig } from '../../../src/views/StandardViews';

describe('ViewRegistry', () => {
  let registry: typeof viewRegistry;

  beforeEach(() => {
    registry = viewRegistry;
  });

  describe('register', () => {
    it('should register a view config', () => {
      const config: ViewConfig = {
        viewId: 'test-view',
        type: 'sale',
        title: 'Test View',
        layout: { type: 'single', sections: [{ id: 'main', components: [] }] },
        components: []
      };

      registry.register(config);
      const retrieved = registry.getConfig('test-view');
      expect(retrieved).toBeDefined();
      expect(retrieved!.viewId).toBe('test-view');
      expect(retrieved!.title).toBe('Test View');
    });

    it('should overwrite existing view with same ID', () => {
      const config1: ViewConfig = { viewId: 'test-view', type: 'sale', title: 'View 1', layout: { type: 'single', sections: [] }, components: [] };
      const config2: ViewConfig = { viewId: 'test-view', type: 'refund', title: 'View 2', layout: { type: 'single', sections: [] }, components: [] };

      registry.register(config1);
      registry.register(config2);

      const retrieved = registry.getConfig('test-view');
      expect(retrieved!.title).toBe('View 2');
    });
  });

  describe('unregister', () => {
    it('should unregister a view', () => {
      const config: ViewConfig = { viewId: 'test-view', type: 'sale', title: 'Test View', layout: { type: 'single', sections: [] }, components: [] };
      registry.register(config);

      const result = registry.unregister('test-view');
      expect(result).toBe(true);
      expect(registry.getConfig('test-view')).toBeUndefined();
    });

    it('should return false for non-existent view', () => {
      const result = registry.unregister('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('getAllConfigs', () => {
    it('should return all registered views', () => {
      const config1: ViewConfig = { viewId: 'view-1', type: 'sale', title: 'View 1', layout: { type: 'single', sections: [] }, components: [] };
      const config2: ViewConfig = { viewId: 'view-2', type: 'refund', title: 'View 2', layout: { type: 'single', sections: [] }, components: [] };

      registry.register(config1);
      registry.register(config2);

      const configs = registry.getAllConfigs();
      expect(configs).toHaveLength(2);
      expect(configs.map(c => c.viewId)).toContain('view-1');
      expect(configs.map(c => c.viewId)).toContain('view-2');
    });
  });

  describe('createInstance', () => {
    it('should create view instance', () => {
      const config: ViewConfig = { viewId: 'instance-view', type: 'sale', title: 'Instance View', layout: { type: 'single', sections: [] }, components: [] };
      registry.register(config);

      const instance = registry.createInstance('instance-view', { initialData: 'test' });

      expect(instance).toBeDefined();
      expect(instance!.viewId).toBe('instance-view');
      expect(instance!.state).toBe('idle');
      expect(instance!.data.initialData).toBe('test');
      expect(instance!.errors).toEqual({});
      expect(instance!.history).toHaveLength(0);
    });

    it('should return null for non-existent view', () => {
      const instance = registry.createInstance('non-existent');
      expect(instance).toBeNull();
    });
  });

  describe('getInstance', () => {
    it('should return created instance', () => {
      const config: ViewConfig = { viewId: 'instance-view-2', type: 'sale', title: 'Instance View 2', layout: { type: 'single', sections: [] }, components: [] };
      registry.register(config);
      registry.createInstance('instance-view-2');

      const instance = registry.getInstance('instance-view-2');
      expect(instance).toBeDefined();
      expect(instance!.viewId).toBe('instance-view-2');
    });

    it('should return undefined for non-existent instance', () => {
      const instance = registry.getInstance('non-existent');
      expect(instance).toBeUndefined();
    });
  });

  describe('updateInstance', () => {
    it('should update instance', () => {
      const config: ViewConfig = { viewId: 'update-view', type: 'sale', title: 'Update View', layout: { type: 'single', sections: [] }, components: [] };
      registry.register(config);
      registry.createInstance('update-view');

      const updated = registry.updateInstance('update-view', { state: 'active' as ViewState, data: { updated: true } });

      expect(updated).toBeDefined();
      expect(updated!.state).toBe('active');
      expect(updated!.data.updated).toBe(true);
    });

    it('should return null for non-existent instance', () => {
      const updated = registry.updateInstance('non-existent', { state: 'active' as ViewState });
      expect(updated).toBeNull();
    });
  });

  describe('destroyInstance', () => {
    it('should destroy instance', () => {
      const config: ViewConfig = { viewId: 'destroy-view', type: 'sale', title: 'Destroy View', layout: { type: 'single', sections: [] }, components: [] };
      registry.register(config);
      registry.createInstance('destroy-view');

      const result = registry.destroyInstance('destroy-view');
      expect(result).toBe(true);
      expect(registry.getInstance('destroy-view')).toBeUndefined();
    });

    it('should return false for non-existent instance', () => {
      const result = registry.destroyInstance('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('validateInstance', () => {
    it('should return true when no validation rules', () => {
      const config: ViewConfig = { viewId: 'validate-view', type: 'sale', title: 'Validate View', layout: { type: 'single', sections: [] }, components: [] };
      registry.register(config);
      registry.createInstance('validate-view');

      const result = registry.validateInstance('validate-view');
      expect(result).toBe(true);
    });

    it('should validate required fields', () => {
      const config: ViewConfig = {
        viewId: 'validate-view-2',
        type: 'sale',
        title: 'Validate View 2',
        layout: { type: 'single', sections: [] },
        components: [],
        validation: {
          rules: [
            { field: 'requiredField', rule: 'required', message: 'Field is required' }
          ],
          validateOnChange: true,
          validateOnBlur: false
        }
      };
      registry.register(config);
      registry.createInstance('validate-view-2', { requiredField: '' });

      const result = registry.validateInstance('validate-view-2');
      expect(result).toBe(false);
    });

    it('should validate min/max values', () => {
      const config: ViewConfig = {
        viewId: 'validate-view-3',
        type: 'sale',
        title: 'Validate View 3',
        layout: { type: 'single', sections: [] },
        components: [],
        validation: {
          rules: [
            { field: 'age', rule: 'min', value: 18, message: 'Must be 18 or older' },
            { field: 'age', rule: 'max', value: 100, message: 'Must be 100 or younger' }
          ],
          validateOnChange: true,
          validateOnBlur: false
        }
      };
      registry.register(config);

      registry.createInstance('validate-view-3', { age: 15 });
      expect(registry.validateInstance('validate-view-3')).toBe(false);

      registry.createInstance('validate-view-3', { age: 25 });
      expect(registry.validateInstance('validate-view-3')).toBe(true);

      registry.createInstance('validate-view-3', { age: 105 });
      expect(registry.validateInstance('validate-view-3')).toBe(false);
    });

    it('should validate pattern', () => {
      const config: ViewConfig = {
        viewId: 'validate-view-4',
        type: 'sale',
        title: 'Validate View 4',
        layout: { type: 'single', sections: [] },
        components: [],
        validation: {
          rules: [
            { field: 'email', rule: 'pattern', value: '^[^@]+@[^@]+\\.[^@]+$', message: 'Invalid email format' }
          ],
          validateOnChange: true,
          validateOnBlur: false
        }
      };
      registry.register(config);

      registry.createInstance('validate-view-4', { email: 'invalid' });
      expect(registry.validateInstance('validate-view-4')).toBe(false);

      registry.createInstance('validate-view-4', { email: 'valid@test.com' });
      expect(registry.validateInstance('validate-view-4')).toBe(true);
    });

    it('should store validation errors', () => {
      const config: ViewConfig = {
        viewId: 'validate-view-5',
        type: 'sale',
        title: 'Validate View 5',
        layout: { type: 'single', sections: [] },
        components: [],
        validation: {
          rules: [
            { field: 'field1', rule: 'required', message: 'Field 1 required' },
            { field: 'field2', rule: 'required', message: 'Field 2 required' }
          ],
          validateOnChange: true,
          validateOnBlur: false
        }
      };
      registry.register(config);
      registry.createInstance('validate-view-5', {});

      registry.validateInstance('validate-view-5');
      const instance = registry.getInstance('validate-view-5');

      expect(instance!.errors.field1).toBe('Field 1 required');
      expect(instance!.errors.field2).toBe('Field 2 required');
    });
  });
});

describe('StandardViews', () => {
  it('should have saleViewConfig', () => {
    expect(saleViewConfig.viewId).toBe('sale');
    expect(saleViewConfig.type).toBe('sale');
    expect(saleViewConfig.title).toBe('New Sale');
    expect(saleViewConfig.layout.type).toBe('split');
    expect(saleViewConfig.components.length).toBeGreaterThan(0);
  });

  it('should have refundViewConfig', () => {
    expect(refundViewConfig.viewId).toBe('refund');
    expect(refundViewConfig.type).toBe('refund');
    expect(refundViewConfig.title).toBe('Process Refund');
    expect(refundViewConfig.layout.type).toBe('split');
  });

  it('should have customerViewConfig', () => {
    expect(customerViewConfig.viewId).toBe('customer-lookup');
    expect(customerViewConfig.type).toBe('customer_lookup');
    expect(customerViewConfig.title).toBe('Customer Lookup');
  });

  it('should have shiftViewConfig', () => {
    expect(shiftViewConfig.viewId).toBe('shift-open');
    expect(shiftViewConfig.type).toBe('shift_open');
    expect(shiftViewConfig.title).toBe('Open Shift');
  });

  it('should have paymentViewConfig', () => {
    expect(paymentViewConfig.viewId).toBe('payment');
    expect(paymentViewConfig.type).toBe('payment');
    expect(paymentViewConfig.title).toBe('Payment');
  });

  it('should have valid component bindings', () => {
    for (const component of saleViewConfig.components) {
      expect(component.componentId).toBeDefined();
      expect(component.type).toBeDefined();
      expect(component.props).toBeDefined();
    }
  });

  it('should have navigation config', () => {
    expect(saleViewConfig.navigation).toBeDefined();
    expect(saleViewConfig.navigation!.previous).toBe('manager-menu');
    expect(saleViewConfig.navigation!.shortcuts).toBeDefined();
  });

  it('should have validation rules', () => {
    expect(saleViewConfig.validation).toBeDefined();
    expect(saleViewConfig.validation!.rules.length).toBeGreaterThan(0);
  });
});