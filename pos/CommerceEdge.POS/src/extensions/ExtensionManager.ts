export type ExtensionPointType = 
  | 'ui_component' 
  | 'business_logic' 
  | 'data_transform' 
  | 'validation' 
  | 'payment_gateway' 
  | 'printer_driver' 
  | 'loyalty_provider' 
  | 'tax_calculator' 
  | 'discount_engine' 
  | 'report_generator' 
  | 'menu_item' 
  | 'keyboard_shortcut' 
  | 'api_endpoint';

export interface ExtensionPoint {
  id: string;
  name: string;
  type: ExtensionPointType;
  description: string;
  version: string;
  requiredPermissions?: string[];
  schema?: Record<string, unknown>;
}

export interface Extension {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  entryPoint: string;
  extensionPoints: string[];
  dependencies?: Record<string, string>;
  configuration?: Record<string, unknown>;
  enabled: boolean;
  installedAt: Date;
  updatedAt?: Date;
  module?: {
    default?: (context: ExtensionContext) => Promise<void>;
    initialize?: (context: ExtensionContext) => Promise<void>;
    cleanup?: (context: ExtensionContext) => Promise<void>;
    destroy?: (context: ExtensionContext) => Promise<void>;
  };
}

export interface ExtensionContext {
  extensionId: string;
  config: Record<string, unknown>;
  services: Map<string, unknown>;
  logger: ExtensionLogger;
  events: ExtensionEventEmitter;
  api: ExtensionAPI;
}

export interface ExtensionLogger {
  debug: (message: string, meta?: Record<string, unknown>) => void;
  info: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
}

export interface ExtensionEventEmitter {
  on: (event: string, handler: (data: unknown) => void) => void;
  off: (event: string, handler: (data: unknown) => void) => void;
  emit: (event: string, data: unknown) => void;
  once: (event: string, handler: (data: unknown) => void) => void;
}

export interface ExtensionAPI {
  registerComponent: (type: string, component: unknown) => void;
  unregisterComponent: (type: string, componentId: string) => void;
  getService: <T>(serviceId: string) => T | undefined;
  registerService: <T>(serviceId: string, service: T) => void;
  addMenuItem: (menuId: string, item: MenuItem) => void;
  removeMenuItem: (menuId: string, itemId: string) => void;
  addKeyboardShortcut: (shortcut: KeyboardShortcut) => void;
  removeKeyboardShortcut: (shortcutId: string) => void;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  action: string;
  parentId?: string;
  order?: number;
  separator?: boolean;
  visible?: boolean | ((context: unknown) => boolean);
  enabled?: boolean | ((context: unknown) => boolean);
}

export interface KeyboardShortcut {
  id: string;
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: string;
  description: string;
  context?: string;
  enabled?: boolean;
}

export class ExtensionManager {
  private extensionPoints: Map<string, ExtensionPoint> = new Map();
  private extensions: Map<string, Extension> = new Map();
  private loadedExtensions: Map<string, ExtensionContext> = new Map();
  private services: Map<string, unknown> = new Map();
  private components: Map<string, Map<string, unknown>> = new Map();
  private menuItems: Map<string, MenuItem[]> = new Map();
  private keyboardShortcuts: Map<string, KeyboardShortcut> = new Map();
  private eventListeners: Map<string, Set<(data: unknown) => void>> = new Map();

  registerExtensionPoint(point: ExtensionPoint): void {
    this.extensionPoints.set(point.id, point);
  }

  unregisterExtensionPoint(pointId: string): boolean {
    return this.extensionPoints.delete(pointId);
  }

  getExtensionPoint(pointId: string): ExtensionPoint | undefined {
    return this.extensionPoints.get(pointId);
  }

  getAllExtensionPoints(): ExtensionPoint[] {
    return Array.from(this.extensionPoints.values());
  }

  async loadExtension(extension: Extension): Promise<boolean> {
    if (this.extensions.has(extension.id)) {
      return false;
    }

    for (const pointId of extension.extensionPoints) {
      if (!this.extensionPoints.has(pointId)) {
        throw new Error(`Extension point not found: ${pointId}`);
      }
    }

    this.extensions.set(extension.id, { ...extension, installedAt: new Date() });

    try {
      const context = await this.createExtensionContext(extension);
      this.loadedExtensions.set(extension.id, context);
      
      await this.initializeExtension(extension, context);
      extension.enabled = true;
      
      return true;
    } catch (error) {
      this.extensions.delete(extension.id);
      throw error;
    }
  }

  async unloadExtension(extensionId: string): Promise<boolean> {
    const extension = this.extensions.get(extensionId);
    if (!extension) return false;

    const context = this.loadedExtensions.get(extensionId);
    if (context) {
      await this.cleanupExtension(extension, context);
      this.loadedExtensions.delete(extensionId);
    }

    this.cleanupExtensionResources(extensionId);
    extension.enabled = false;
    
    return true;
  }

  enableExtension(extensionId: string): boolean {
    const extension = this.extensions.get(extensionId);
    if (!extension || extension.enabled) return false;

    const context = this.loadedExtensions.get(extensionId);
    if (!context) return false;

    extension.enabled = true;
    this.emit('extension:enabled', { extensionId });
    return true;
  }

  disableExtension(extensionId: string): boolean {
    const extension = this.extensions.get(extensionId);
    if (!extension || !extension.enabled) return false;

    extension.enabled = false;
    this.cleanupExtensionResources(extensionId);
    this.emit('extension:disabled', { extensionId });
    return true;
  }

  getExtension(extensionId: string): Extension | undefined {
    return this.extensions.get(extensionId);
  }

  getAllExtensions(): Extension[] {
    return Array.from(this.extensions.values());
  }

  getEnabledExtensions(): Extension[] {
    return Array.from(this.extensions.values()).filter(e => e.enabled);
  }

  registerService<T>(serviceId: string, service: T): void {
    this.services.set(serviceId, service);
  }

  getService<T>(serviceId: string): T | undefined {
    return this.services.get(serviceId) as T | undefined;
  }

  registerComponent(type: string, componentId: string, component: unknown): void {
    if (!this.components.has(type)) {
      this.components.set(type, new Map());
    }
    this.components.get(type)!.set(componentId, component);
  }

  unregisterComponent(type: string, componentId: string): boolean {
    return this.components.get(type)?.delete(componentId) ?? false;
  }

  getComponents(type: string): Map<string, unknown> {
    return this.components.get(type) || new Map();
  }

  addMenuItem(menuId: string, item: MenuItem): void {
    if (!this.menuItems.has(menuId)) {
      this.menuItems.set(menuId, []);
    }
    this.menuItems.get(menuId)!.push(item);
    this.emit('menu:itemAdded', { menuId, item });
  }

  removeMenuItem(menuId: string, itemId: string): boolean {
    const items = this.menuItems.get(menuId);
    if (!items) return false;

    const index = items.findIndex(i => i.id === itemId);
    if (index === -1) return false;

    items.splice(index, 1);
    this.emit('menu:itemRemoved', { menuId, itemId });
    return true;
  }

  getMenuItems(menuId: string): MenuItem[] {
    return this.menuItems.get(menuId) || [];
  }

  addKeyboardShortcut(shortcut: KeyboardShortcut): void {
    this.keyboardShortcuts.set(shortcut.id, shortcut);
    this.emit('shortcut:added', { shortcut });
  }

  removeKeyboardShortcut(shortcutId: string): boolean {
    const deleted = this.keyboardShortcuts.delete(shortcutId);
    if (deleted) {
      this.emit('shortcut:removed', { shortcutId });
    }
    return deleted;
  }

  getKeyboardShortcuts(): KeyboardShortcut[] {
    return Array.from(this.keyboardShortcuts.values());
  }

  on(event: string, handler: (data: unknown) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(handler);
  }

  off(event: string, handler: (data: unknown) => void): void {
    this.eventListeners.get(event)?.delete(handler);
  }

  emit(event: string, data: unknown): void {
    this.eventListeners.get(event)?.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  private async createExtensionContext(extension: Extension): Promise<ExtensionContext> {
    const logger: ExtensionLogger = {
      debug: (msg, meta) => console.debug(`[${extension.id}] ${msg}`, meta),
      info: (msg, meta) => console.info(`[${extension.id}] ${msg}`, meta),
      warn: (msg, meta) => console.warn(`[${extension.id}] ${msg}`, meta),
      error: (msg, meta) => console.error(`[${extension.id}] ${msg}`, meta)
    };

    const events: ExtensionEventEmitter = {
      on: (event, handler) => this.on(`ext:${extension.id}:${event}`, handler),
      off: (event, handler) => this.off(`ext:${extension.id}:${event}`, handler),
      emit: (event, data) => this.emit(`ext:${extension.id}:${event}`, data),
      once: (event, handler) => {
        const wrapper = (data: unknown) => {
          handler(data);
          this.off(`ext:${extension.id}:${event}`, wrapper);
        };
        this.on(`ext:${extension.id}:${event}`, wrapper);
      }
    };

    const api: ExtensionAPI = {
      registerComponent: (type: string, component: unknown) => this.registerComponent(type, extension.id, component),
      unregisterComponent: (type: string, componentId: string) => this.unregisterComponent(type, componentId),
      getService: <T>(serviceId: string) => this.getService<T>(serviceId),
      registerService: <T>(serviceId: string, service: T) => this.registerService(serviceId, service),
      addMenuItem: (menuId: string, item: MenuItem) => this.addMenuItem(menuId, item),
      removeMenuItem: (menuId: string, itemId: string) => this.removeMenuItem(menuId, itemId),
      addKeyboardShortcut: (shortcut: KeyboardShortcut) => this.addKeyboardShortcut(shortcut),
      removeKeyboardShortcut: (shortcutId: string) => this.removeKeyboardShortcut(shortcutId)
    };

    return {
      extensionId: extension.id,
      config: extension.configuration || {},
      services: new Map(),
      logger,
      events,
      api
    };
  }

  private async initializeExtension(extension: Extension, context: ExtensionContext): Promise<void> {
    this.emit('extension:loading', { extensionId: extension.id });
    
    try {
      let module = extension.module;
      
      if (!module) {
        const imported = await import(extension.entryPoint);
        module = imported.default || imported.initialize ? { default: imported.default, initialize: imported.initialize } : imported;
      }
      
      const init = module?.default || module?.initialize;
      
      if (typeof init === 'function') {
        await init(context);
      }
      
      this.emit('extension:loaded', { extensionId: extension.id });
    } catch (error) {
      this.emit('extension:error', { extensionId: extension.id, error });
      throw error;
    }
  }

  private async cleanupExtension(extension: Extension, context: ExtensionContext): Promise<void> {
    try {
      let module = extension.module;
      
      if (!module) {
        const imported = await import(extension.entryPoint);
        module = imported.cleanup || imported.destroy ? { cleanup: imported.cleanup, destroy: imported.destroy } : imported;
      }
      
      const cleanup = module?.cleanup || module?.destroy;
      
      if (typeof cleanup === 'function') {
        await cleanup(context);
      }
    } catch (error) {
      console.error(`Error cleaning up extension ${extension.id}:`, error);
    }
  }

  private cleanupExtensionResources(extensionId: string): void {
    for (const [type, components] of this.components) {
      for (const [compId, comp] of components) {
        if (compId.startsWith(`${extensionId}:`)) {
          components.delete(compId);
        }
      }
    }

    for (const [menuId, items] of this.menuItems) {
      const filtered = items.filter(i => !i.id.startsWith(`${extensionId}:`));
      this.menuItems.set(menuId, filtered);
    }

    for (const [shortcutId, shortcut] of this.keyboardShortcuts) {
      if (shortcutId.startsWith(`${extensionId}:`)) {
        this.keyboardShortcuts.delete(shortcutId);
      }
    }
  }
}

export const extensionManager = new ExtensionManager();