import { TriggerRegistration, TriggerContext, TriggerResult, TriggerPhase, TriggerPriority } from './TriggerManager';
import { registerTrigger } from './TriggerEvents';
import { Order, Payment, Customer, Product, OrderItem, Shift, Employee, PermissionAction } from '../models';

export const defaultTriggers = [
  {
    name: 'validateOrderItems',
    phase: 'before' as TriggerPhase,
    priority: 'high' as TriggerPriority,
    description: 'Validates order items before sale',
    enabled: true,
    handler: async (context: TriggerContext, data: { order: Order; items: OrderItem[] }): Promise<TriggerResult> => {
      if (!data.items || data.items.length === 0) {
        return {
          success: false,
          message: 'Order must contain at least one item',
          shouldContinue: false
        };
      }

      for (const item of data.items) {
        if (item.quantity <= 0) {
          return {
            success: false,
            message: `Invalid quantity for ${item.productName}`,
            shouldContinue: false
          };
        }
        if (item.unitPrice < 0) {
          return {
            success: false,
            message: `Invalid price for ${item.productName}`,
            shouldContinue: false
          };
        }
      }

      return { success: true, shouldContinue: true };
    }
  },
  {
    name: 'applyAutomaticDiscounts',
    phase: 'before' as TriggerPhase,
    priority: 'normal' as TriggerPriority,
    description: 'Applies automatic discounts based on loyalty tier',
    enabled: true,
    handler: async (context: TriggerContext, data: { order: Order; items: OrderItem[]; customer?: Customer }): Promise<TriggerResult> => {
      if (data.customer && data.customer.loyaltyTier === 'platinum') {
        return {
          success: true,
          shouldContinue: true,
          modifications: { loyaltyDiscount: 10 }
        };
      } else if (data.customer && data.customer.loyaltyTier === 'gold') {
        return {
          success: true,
          shouldContinue: true,
          modifications: { loyaltyDiscount: 5 }
        };
      }

      return { success: true, shouldContinue: true };
    }
  },
  {
    name: 'validatePaymentAmount',
    phase: 'before',
    priority: 'high',
    description: 'Validates payment amount matches order total',
    enabled: true,
    handler: async (context: TriggerContext, data: { order: Order; payment: Payment }): Promise<TriggerResult> => {
      if (data.payment.amount <= 0) {
        return {
          success: false,
          message: 'Payment amount must be greater than zero',
          shouldContinue: false
        };
      }

      const totalPaid = data.order.payments.reduce((sum, p) => sum + p.amount, 0);
      const newTotal = totalPaid + data.payment.amount;

      if (newTotal > data.order.total + 0.01) {
        return {
          success: false,
          message: 'Payment amount exceeds order total',
          shouldContinue: false
        };
      }

      return { success: true, shouldContinue: true };
    }
  },
  {
    name: 'processPaymentAuthorization',
    phase: 'after',
    priority: 'high',
    description: 'Handles payment authorization response',
    enabled: true,
    handler: async (context: TriggerContext, data: { order: Order; payment: Payment; authorizationCode?: string }): Promise<TriggerResult> => {
      if (data.authorizationCode) {
        return {
          success: true,
          shouldContinue: true,
          modifications: { authorizationCode: data.authorizationCode }
        };
      }
      return { success: true, shouldContinue: true };
    }
  },
  {
    name: 'updateInventoryOnSale',
    phase: 'after',
    priority: 'normal',
    description: 'Updates inventory levels after completed sale',
    enabled: true,
    handler: async (context: TriggerContext, data: { order: Order; payments: Payment[] }): Promise<TriggerResult> => {
      return {
        success: true,
        shouldContinue: true,
        data: { inventoryUpdated: true, orderId: data.order.orderId }
      };
    }
  },
  {
    name: 'validateRefundAmount',
    phase: 'before',
    priority: 'high',
    description: 'Validates refund amount does not exceed original payment',
    enabled: true,
    handler: async (context: TriggerContext, data: { order: Order; originalPayment: Payment; refundAmount: number }): Promise<TriggerResult> => {
      if (data.refundAmount <= 0) {
        return {
          success: false,
          message: 'Refund amount must be greater than zero',
          shouldContinue: false
        };
      }

      if (data.refundAmount > data.originalPayment.amount) {
        return {
          success: false,
          message: 'Refund amount cannot exceed original payment amount',
          shouldContinue: false
        };
      }

      return { success: true, shouldContinue: true };
    }
  },
  {
    name: 'validateShiftFloat',
    phase: 'before',
    priority: 'high',
    description: 'Validates opening/closing float amounts',
    enabled: true,
    handler: async (context: TriggerContext, data: { shift: Shift; openingFloat?: number; closingFloat?: number }): Promise<TriggerResult> => {
      if (data.openingFloat !== undefined && data.openingFloat < 0) {
        return {
          success: false,
          message: 'Opening float cannot be negative',
          shouldContinue: false
        };
      }

      if (data.closingFloat !== undefined && data.closingFloat < 0) {
        return {
          success: false,
          message: 'Closing float cannot be negative',
          shouldContinue: false
        };
      }

      return { success: true, shouldContinue: true };
    }
  },
  {
    name: 'calculateShiftVariance',
    phase: 'after',
    priority: 'normal',
    description: 'Calculates cash variance on shift reconcile',
    enabled: true,
    handler: async (context: TriggerContext, data: { shift: Shift; countedAmounts: Record<string, number> }): Promise<TriggerResult> => {
      const expected = data.shift.cashSummary.expectedCash;
      const actual = data.countedAmounts.cash || 0;
      const variance = actual - expected;

      return {
        success: true,
        shouldContinue: true,
        data: { variance, expected, actual }
      };
    }
  },
  {
    name: 'validateEmployeePermissions',
    phase: 'before',
    priority: 'high',
    description: 'Validates employee has required permissions',
    enabled: true,
    handler: async (context: TriggerContext, data: { employee: Employee; requiredPermission?: string }): Promise<TriggerResult> => {
      if (!data.employee.isActive) {
        return {
          success: false,
          message: 'Employee account is inactive',
          shouldContinue: false
        };
      }

      if (data.requiredPermission) {
        const hasPermission = data.employee.permissions.some(
          p => p.name === data.requiredPermission || p.resource === 'admin' || data.employee.role === 'system_admin'
        );
        if (!hasPermission) {
          return {
            success: false,
            message: `Employee lacks required permission: ${data.requiredPermission}`,
            shouldContinue: false
          };
        }
      }

      return { success: true, shouldContinue: true };
    }
  },
  {
    name: 'logTransaction',
    phase: 'after',
    priority: 'low',
    description: 'Logs transaction for audit trail',
    enabled: true,
    handler: async (context: TriggerContext, data: { order?: Order; payment?: Payment; shift?: Shift }): Promise<TriggerResult> => {
      return {
        success: true,
        shouldContinue: true,
        data: { logged: true, timestamp: new Date().toISOString() }
      };
    }
  }
];

export function registerDefaultTriggers(): void {
  defaultTriggers.forEach(trigger => {
    const registration = trigger as TriggerRegistration<TriggerContext, any>;
    if (trigger.name.includes('Sale') || trigger.name.includes('OrderItems') || trigger.name.includes('AutomaticDiscounts')) {
      registerTrigger('beforeSale', registration);
    } else if (trigger.name.includes('Payment') && trigger.name.includes('validate')) {
      registerTrigger('beforePayment', registration);
    } else if (trigger.name.includes('Payment') && trigger.name.includes('authorization')) {
      registerTrigger('afterPayment', registration);
    } else if (trigger.name.includes('Inventory')) {
      registerTrigger('afterSale', registration);
    } else if (trigger.name.includes('Refund')) {
      registerTrigger('beforeRefund', registration);
    } else if (trigger.name.includes('Float') || trigger.name.includes('Variance')) {
      registerTrigger('beforeShiftClose', registration);
    } else if (trigger.name.includes('Permissions') || trigger.name.includes('Login')) {
      registerTrigger('beforeLogin', registration);
    } else if (trigger.name.includes('Log')) {
      registerTrigger('afterSale', registration);
      registerTrigger('afterPayment', registration);
      registerTrigger('afterShiftClose', registration);
    }
  });
}