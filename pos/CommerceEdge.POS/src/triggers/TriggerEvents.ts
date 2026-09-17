import { TriggerContext, TriggerManager, TriggerRegistration, triggerManager } from './TriggerManager';
import { Order, OrderItem, Payment, Customer, Product, Shift, Employee } from '../models';

export interface BeforeSaleContext extends TriggerContext {
  order: Order;
  items: OrderItem[];
  customer?: Customer;
}

export interface AfterSaleContext extends TriggerContext {
  order: Order;
  payments: Payment[];
}

export interface BeforePaymentContext extends TriggerContext {
  order: Order;
  payment: Payment;
}

export interface AfterPaymentContext extends TriggerContext {
  order: Order;
  payment: Payment;
  authorizationCode?: string;
}

export interface BeforeRefundContext extends TriggerContext {
  order: Order;
  originalPayment: Payment;
  refundAmount: number;
  reason: string;
}

export interface AfterRefundContext extends TriggerContext {
  order: Order;
  refundPayment: Payment;
}

export interface BeforeVoidContext extends TriggerContext {
  order: Order;
  items: OrderItem[];
  reason: string;
}

export interface AfterVoidContext extends TriggerContext {
  order: Order;
}

export interface BeforeDiscountContext extends TriggerContext {
  order: Order;
  discountPercent: number;
  discountAmount: number;
  reason?: string;
}

export interface AfterDiscountContext extends TriggerContext {
  order: Order;
}

export interface BeforeCustomerAddContext extends TriggerContext {
  customer: Customer;
}

export interface AfterCustomerAddContext extends TriggerContext {
  customer: Customer;
}

export interface BeforeCustomerUpdateContext extends TriggerContext {
  customer: Customer;
  updates: Partial<Customer>;
}

export interface AfterCustomerUpdateContext extends TriggerContext {
  customer: Customer;
}

export interface BeforeShiftOpenContext extends TriggerContext {
  shift: Shift;
  openingFloat: number;
}

export interface AfterShiftOpenContext extends TriggerContext {
  shift: Shift;
}

export interface BeforeShiftCloseContext extends TriggerContext {
  shift: Shift;
  closingFloat: number;
}

export interface AfterShiftCloseContext extends TriggerContext {
  shift: Shift;
}

export interface BeforeShiftReconcileContext extends TriggerContext {
  shift: Shift;
  countedAmounts: Record<string, number>;
}

export interface AfterShiftReconcileContext extends TriggerContext {
  shift: Shift;
  variances: Record<string, number>;
}

export interface BeforeProductScanContext extends TriggerContext {
  product: Product;
  quantity: number;
}

export interface AfterProductScanContext extends TriggerContext {
  product: Product;
  quantity: number;
  orderItem: OrderItem;
}

export interface BeforePriceOverrideContext extends TriggerContext {
  order: Order;
  orderItem: OrderItem;
  originalPrice: number;
  newPrice: number;
  reason: string;
}

export interface AfterPriceOverrideContext extends TriggerContext {
  order: Order;
  orderItem: OrderItem;
}

export interface BeforeLoginContext extends TriggerContext {
  employee: Employee;
  registerId: string;
}

export interface AfterLoginContext extends TriggerContext {
  employee: Employee;
  registerId: string;
}

export interface BeforeLogoutContext extends TriggerContext {
  employee: Employee;
  registerId: string;
}

export interface AfterLogoutContext extends TriggerContext {
  employee: Employee;
  registerId: string;
}

export type TriggerEventName =
  | 'beforeSale'
  | 'afterSale'
  | 'beforePayment'
  | 'afterPayment'
  | 'beforeRefund'
  | 'afterRefund'
  | 'beforeVoid'
  | 'afterVoid'
  | 'beforeDiscount'
  | 'afterDiscount'
  | 'beforeCustomerAdd'
  | 'afterCustomerAdd'
  | 'beforeCustomerUpdate'
  | 'afterCustomerUpdate'
  | 'beforeShiftOpen'
  | 'afterShiftOpen'
  | 'beforeShiftClose'
  | 'afterShiftClose'
  | 'beforeShiftReconcile'
  | 'afterShiftReconcile'
  | 'beforeProductScan'
  | 'afterProductScan'
  | 'beforePriceOverride'
  | 'afterPriceOverride'
  | 'beforeLogin'
  | 'afterLogin'
  | 'beforeLogout'
  | 'afterLogout';

export const triggerEvents: Record<TriggerEventName, string> = {
  beforeSale: 'beforeSale',
  afterSale: 'afterSale',
  beforePayment: 'beforePayment',
  afterPayment: 'afterPayment',
  beforeRefund: 'beforeRefund',
  afterRefund: 'afterRefund',
  beforeVoid: 'beforeVoid',
  afterVoid: 'afterVoid',
  beforeDiscount: 'beforeDiscount',
  afterDiscount: 'afterDiscount',
  beforeCustomerAdd: 'beforeCustomerAdd',
  afterCustomerAdd: 'afterCustomerAdd',
  beforeCustomerUpdate: 'beforeCustomerUpdate',
  afterCustomerUpdate: 'afterCustomerUpdate',
  beforeShiftOpen: 'beforeShiftOpen',
  afterShiftOpen: 'afterShiftOpen',
  beforeShiftClose: 'beforeShiftClose',
  afterShiftClose: 'afterShiftClose',
  beforeShiftReconcile: 'beforeShiftReconcile',
  afterShiftReconcile: 'afterShiftReconcile',
  beforeProductScan: 'beforeProductScan',
  afterProductScan: 'afterProductScan',
  beforePriceOverride: 'beforePriceOverride',
  afterPriceOverride: 'afterPriceOverride',
  beforeLogin: 'beforeLogin',
  afterLogin: 'afterLogin',
  beforeLogout: 'beforeLogout',
  afterLogout: 'afterLogout'
};

export function registerTrigger<TData>(
  eventName: TriggerEventName,
  registration: TriggerRegistration<TriggerContext, TData>
): void {
  triggerManager.register(eventName, registration);
}

export function unregisterTrigger(eventName: TriggerEventName, triggerName: string): boolean {
  return triggerManager.unregister(eventName, triggerName);
}

export async function executeTrigger<TContext extends TriggerContext, TData>(
  eventName: TriggerEventName,
  context: TContext,
  data: TData
): Promise<{ success: boolean; message?: string; data?: Record<string, unknown>; shouldContinue: boolean }> {
  return triggerManager.execute(eventName, context, data);
}