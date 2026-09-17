import { Extension, ExtensionPoint, ExtensionPointType, extensionManager } from './ExtensionManager';

export const builtInExtensionPoints: ExtensionPoint[] = [
  {
    id: 'ui.sale.screen',
    name: 'Sale Screen',
    type: 'ui_component',
    description: 'Customize the sale screen layout and components',
    version: '1.0.0'
  },
  {
    id: 'ui.payment.screen',
    name: 'Payment Screen',
    type: 'ui_component',
    description: 'Customize the payment screen',
    version: '1.0.0'
  },
  {
    id: 'ui.customer.screen',
    name: 'Customer Screen',
    type: 'ui_component',
    description: 'Customize the customer lookup/management screen',
    version: '1.0.0'
  },
  {
    id: 'business.sale.process',
    name: 'Sale Processing',
    type: 'business_logic',
    description: 'Hook into the sale processing pipeline',
    version: '1.0.0'
  },
  {
    id: 'business.payment.process',
    name: 'Payment Processing',
    type: 'business_logic',
    description: 'Hook into the payment processing pipeline',
    version: '1.0.0'
  },
  {
    id: 'business.refund.process',
    name: 'Refund Processing',
    type: 'business_logic',
    description: 'Hook into the refund processing pipeline',
    version: '1.0.0'
  },
  {
    id: 'data.customer.transform',
    name: 'Customer Data Transform',
    type: 'data_transform',
    description: 'Transform customer data before display or storage',
    version: '1.0.0'
  },
  {
    id: 'data.product.transform',
    name: 'Product Data Transform',
    type: 'data_transform',
    description: 'Transform product data before display or storage',
    version: '1.0.0'
  },
  {
    id: 'validation.order',
    name: 'Order Validation',
    type: 'validation',
    description: 'Custom order validation rules',
    version: '1.0.0'
  },
  {
    id: 'validation.payment',
    name: 'Payment Validation',
    type: 'validation',
    description: 'Custom payment validation rules',
    version: '1.0.0'
  },
  {
    id: 'payment.gateway',
    name: 'Payment Gateway',
    type: 'payment_gateway',
    description: 'Custom payment gateway integration',
    version: '1.0.0'
  },
  {
    id: 'printer.driver',
    name: 'Printer Driver',
    type: 'printer_driver',
    description: 'Custom printer driver',
    version: '1.0.0'
  },
  {
    id: 'loyalty.provider',
    name: 'Loyalty Provider',
    type: 'loyalty_provider',
    description: 'Custom loyalty program provider',
    version: '1.0.0'
  },
  {
    id: 'tax.calculator',
    name: 'Tax Calculator',
    type: 'tax_calculator',
    description: 'Custom tax calculation logic',
    version: '1.0.0'
  },
  {
    id: 'discount.engine',
    name: 'Discount Engine',
    type: 'discount_engine',
    description: 'Custom discount calculation logic',
    version: '1.0.0'
  },
  {
    id: 'report.generator',
    name: 'Report Generator',
    type: 'report_generator',
    description: 'Custom report generation',
    version: '1.0.0'
  },
  {
    id: 'ui.menu.main',
    name: 'Main Menu',
    type: 'menu_item',
    description: 'Add items to the main menu',
    version: '1.0.0'
  },
  {
    id: 'ui.menu.manager',
    name: 'Manager Menu',
    type: 'menu_item',
    description: 'Add items to the manager menu',
    version: '1.0.0'
  },
  {
    id: 'shortcut.global',
    name: 'Global Shortcuts',
    type: 'keyboard_shortcut',
    description: 'Add global keyboard shortcuts',
    version: '1.0.0'
  },
  {
    id: 'api.custom',
    name: 'Custom API Endpoints',
    type: 'api_endpoint',
    description: 'Add custom API endpoints',
    version: '1.0.0'
  }
];

export function registerBuiltInExtensionPoints(): void {
  for (const point of builtInExtensionPoints) {
    extensionManager.registerExtensionPoint(point);
  }
}

import { TaxCalculator } from './core/TaxCalculator';
import { DiscountEngine } from './core/DiscountEngine';
import { LoyaltyProvider } from './core/LoyaltyProvider';
import { ReceiptGenerator } from './core/ReceiptGenerator';

// Create initialize functions for core extensions
const initTaxCalculator = async (context: any) => {
  context.services.set('taxCalculator', TaxCalculator);
};

const initDiscountEngine = async (context: any) => {
  context.services.set('discountEngine', DiscountEngine);
};

const initLoyaltyProvider = async (context: any) => {
  context.services.set('loyaltyProvider', LoyaltyProvider);
};

const initReceiptGenerator = async (context: any) => {
  context.services.set('receiptGenerator', ReceiptGenerator);
};

export const coreExtensions: Extension[] = [
  {
    id: 'commerceedge.core.tax',
    name: 'Core Tax Calculator',
    version: '1.0.0',
    description: 'Built-in tax calculation engine',
    author: 'CommerceEdge',
    license: 'Proprietary',
    entryPoint: '../core/TaxCalculator',
    extensionPoints: ['tax.calculator'],
    enabled: true,
    installedAt: new Date(),
    module: {
      initialize: initTaxCalculator
    }
  },
  {
    id: 'commerceedge.core.discount',
    name: 'Core Discount Engine',
    version: '1.0.0',
    description: 'Built-in discount calculation engine',
    author: 'CommerceEdge',
    license: 'Proprietary',
    entryPoint: '../core/DiscountEngine',
    extensionPoints: ['discount.engine'],
    enabled: true,
    installedAt: new Date(),
    module: {
      initialize: initDiscountEngine
    }
  },
  {
    id: 'commerceedge.core.loyalty',
    name: 'Core Loyalty Provider',
    version: '1.0.0',
    description: 'Built-in loyalty program provider',
    author: 'CommerceEdge',
    license: 'Proprietary',
    entryPoint: '../core/LoyaltyProvider',
    extensionPoints: ['loyalty.provider'],
    enabled: true,
    installedAt: new Date(),
    module: {
      initialize: initLoyaltyProvider
    }
  },
  {
    id: 'commerceedge.core.receipt',
    name: 'Core Receipt Generator',
    version: '1.0.0',
    description: 'Built-in receipt generation',
    author: 'CommerceEdge',
    license: 'Proprietary',
    entryPoint: '../core/ReceiptGenerator',
    extensionPoints: ['report.generator'],
    enabled: true,
    installedAt: new Date(),
    module: {
      initialize: initReceiptGenerator
    }
  }
];

export function registerCoreExtensions(): void {
  for (const ext of coreExtensions) {
    extensionManager.loadExtension(ext);
  }
}

export interface TaxCalculatorExtension {
  calculateTax(subtotal: number, items: Array<{ amount: number; taxRate: number; taxExempt?: boolean }>): number;
  getTaxRates(): Map<string, number>;
  isTaxExempt(customerId?: string, productId?: string): boolean;
}

export interface DiscountEngineExtension {
  calculateDiscounts(items: Array<{ price: number; quantity: number; discounts?: Array<{ type: string; value: number }> }>, customerId?: string): Array<{ type: string; amount: number; description: string }>;
  getAvailableDiscounts(customerId?: string): Array<{ id: string; name: string; type: string; value: number }>;
}

export interface LoyaltyProviderExtension {
  getCustomerBalance(customerId: string): Promise<{ points: number; tier: string }>;
  addPoints(customerId: string, points: number, reason: string): Promise<void>;
  redeemPoints(customerId: string, points: number): Promise<number>;
  getRewards(): Array<{ id: string; name: string; pointsCost: number; description: string }>;
}

export interface ReceiptGeneratorExtension {
  generateReceipt(order: any, payments: any[], options: any): string;
  getSupportedFormats(): string[];
}