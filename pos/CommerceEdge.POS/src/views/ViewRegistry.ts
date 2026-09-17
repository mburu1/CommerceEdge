export type ViewType = 
  | 'sale' 
  | 'refund' 
  | 'void' 
  | 'customer_lookup' 
  | 'customer_create' 
  | 'product_search' 
  | 'product_details' 
  | 'payment' 
  | 'receipt' 
  | 'shift_open' 
  | 'shift_close' 
  | 'shift_reconcile' 
  | 'manager_menu' 
  | 'reports' 
  | 'settings' 
  | 'login' 
  | 'lock_screen' 
  | 'training' 
  | 'suspended_transactions';

export type ViewState = 'idle' | 'loading' | 'active' | 'error' | 'success';

export interface ViewConfig {
  viewId: string;
  type: ViewType;
  title: string;
  icon?: string;
  permissions?: string[];
  layout: ViewLayout;
  components: ViewComponent[];
  navigation?: ViewNavigation;
  validation?: ViewValidation;
  shortcuts?: Record<string, string>;
}

export interface ViewLayout {
  type: 'single' | 'split' | 'tabs' | 'accordion' | 'modal' | 'drawer';
  orientation?: 'horizontal' | 'vertical';
  sections?: ViewLayoutSection[];
}

export interface ViewLayoutSection {
  id: string;
  title?: string;
  components: string[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
  minSize?: number;
  maxSize?: number;
}

export interface ViewComponent {
  componentId: string;
  type: string;
  props: Record<string, unknown>;
  position?: { x: number; y: number; width?: number; height?: number };
  bindings?: ComponentBinding[];
  events?: ComponentEvent[];
  visible?: boolean | string;
  enabled?: boolean | string;
}

export interface ComponentBinding {
  property: string;
  path: string;
  transformer?: string;
  twoWay?: boolean;
  target?: string | string[];
}

export interface ComponentEvent {
  event: string;
  action: string;
  payload?: Record<string, unknown>;
  condition?: string;
}

export interface ViewNavigation {
  previous?: string;
  next?: string;
  cancel?: string;
  shortcuts?: Record<string, string>;
}

export interface ViewValidation {
  rules: ValidationRule[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface ValidationRule {
  field: string;
  rule: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: unknown;
  message: string;
  customValidator?: string;
}

export interface ViewInstance {
  viewId: string;
  config: ViewConfig;
  state: ViewState;
  data: Record<string, unknown>;
  errors: Record<string, string>;
  focusedComponent?: string;
  history: ViewHistoryEntry[];
}

export interface ViewHistoryEntry {
  viewId: string;
  timestamp: Date;
  data: Record<string, unknown>;
  action: string;
}

export class ViewRegistry {
  private views: Map<string, ViewConfig> = new Map();
  private instances: Map<string, ViewInstance> = new Map();

  register(config: ViewConfig): void {
    this.views.set(config.viewId, config);
  }

  unregister(viewId: string): boolean {
    return this.views.delete(viewId);
  }

  getConfig(viewId: string): ViewConfig | undefined {
    return this.views.get(viewId);
  }

  getAllConfigs(): ViewConfig[] {
    return Array.from(this.views.values());
  }

  createInstance(viewId: string, initialData: Record<string, unknown> = {}): ViewInstance | null {
    const config = this.views.get(viewId);
    if (!config) return null;

    const instance: ViewInstance = {
      viewId,
      config,
      state: 'idle',
      data: initialData,
      errors: {},
      history: []
    };

    this.instances.set(viewId, instance);
    return instance;
  }

  getInstance(viewId: string): ViewInstance | undefined {
    return this.instances.get(viewId);
  }

  updateInstance(viewId: string, updates: Partial<ViewInstance>): ViewInstance | null {
    const instance = this.instances.get(viewId);
    if (!instance) return null;

    const updated = { ...instance, ...updates };
    this.instances.set(viewId, updated);
    return updated;
  }

  destroyInstance(viewId: string): boolean {
    return this.instances.delete(viewId);
  }

  validateInstance(viewId: string): boolean {
    const instance = this.instances.get(viewId);
    if (!instance || !instance.config.validation) return true;

    const errors: Record<string, string> = {};
    let isValid = true;

    for (const rule of instance.config.validation.rules) {
      const value = this.getNestedValue(instance.data, rule.field);
      const fieldValid = this.validateField(value, rule);

      if (!fieldValid) {
        errors[rule.field] = rule.message;
        isValid = false;
      }
    }

    instance.errors = errors;
    return isValid;
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current: any, key) => current?.[key], obj);
  }

  private validateField(value: unknown, rule: ValidationRule): boolean {
    switch (rule.rule) {
      case 'required':
        return value !== undefined && value !== null && value !== '';
      case 'min':
        return typeof value === 'number' && value >= (rule.value as number);
      case 'max':
        return typeof value === 'number' && value <= (rule.value as number);
      case 'pattern':
        return typeof value === 'string' && new RegExp(rule.value as string).test(value);
      case 'custom':
        return true;
      default:
        return true;
    }
  }
}

export const viewRegistry = new ViewRegistry();