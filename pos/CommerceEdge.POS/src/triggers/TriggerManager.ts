import { Order, OrderItem, Payment, Customer, Product, Shift, Employee } from '../models';

export type TriggerPhase = 'before' | 'after';
export type TriggerPriority = 'high' | 'normal' | 'low';

export interface TriggerContext {
  registerId: string;
  operatorId: string;
  shiftId: string;
  storeId: string;
  timestamp: Date;
  correlationId: string;
}

export interface TriggerResult {
  success: boolean;
  message?: string;
  data?: Record<string, unknown>;
  shouldContinue: boolean;
  modifications?: Record<string, unknown>;
}

export type TriggerHandler<TContext extends TriggerContext = TriggerContext, TData = unknown> = (
  context: TContext,
  data: TData
) => Promise<TriggerResult> | TriggerResult;

export interface TriggerRegistration<TContext extends TriggerContext = TriggerContext, TData = unknown> {
  name: string;
  phase: TriggerPhase;
  priority: TriggerPriority;
  handler: TriggerHandler<TContext, TData>;
  description?: string;
  enabled: boolean;
}

export class TriggerManager<TContext extends TriggerContext = TriggerContext> {
  private triggers: Map<string, TriggerRegistration<TContext>[]> = new Map();

  register<TData>(
    eventName: string,
    registration: TriggerRegistration<TContext, TData>
  ): void {
    const existing = this.triggers.get(eventName) || [];
    existing.push(registration as TriggerRegistration<TContext>);
    existing.sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));
    this.triggers.set(eventName, existing);
  }

  unregister(eventName: string, triggerName: string): boolean {
    const existing = this.triggers.get(eventName);
    if (!existing) return false;

    const index = existing.findIndex(t => t.name === triggerName);
    if (index === -1) return false;

    existing.splice(index, 1);
    return true;
  }

  async execute<TData>(
    eventName: string,
    context: TContext,
    data: TData
  ): Promise<TriggerResult> {
    const triggers = this.triggers.get(eventName) || [];
    let result: TriggerResult = { success: true, shouldContinue: true };

    for (const trigger of triggers) {
      if (!trigger.enabled) continue;

      try {
        const triggerResult = await trigger.handler(context, data);
        result = this.mergeResults(result, triggerResult);

        if (!triggerResult.shouldContinue) {
          break;
        }
      } catch (error) {
        result = {
          success: false,
          message: `Trigger ${trigger.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          shouldContinue: false
        };
        break;
      }
    }

    return result;
  }

  getRegisteredTriggers(eventName: string): TriggerRegistration<TContext>[] {
    return this.triggers.get(eventName) || [];
  }

  enableTrigger(eventName: string, triggerName: string): boolean {
    const triggers = this.triggers.get(eventName);
    if (!triggers) return false;

    const trigger = triggers.find(t => t.name === triggerName);
    if (!trigger) return false;

    trigger.enabled = true;
    return true;
  }

  disableTrigger(eventName: string, triggerName: string): boolean {
    const triggers = this.triggers.get(eventName);
    if (!triggers) return false;

    const trigger = triggers.find(t => t.name === triggerName);
    if (!trigger) return false;

    trigger.enabled = false;
    return true;
  }

  private mergeResults(current: TriggerResult, next: TriggerResult): TriggerResult {
    return {
      success: current.success && next.success,
      message: next.message || current.message,
      data: { ...current.data, ...next.data },
      shouldContinue: current.shouldContinue && next.shouldContinue,
      modifications: { ...current.modifications, ...next.modifications }
    };
  }

  private getPriorityValue(priority: TriggerPriority): number {
    switch (priority) {
      case 'high': return 3;
      case 'normal': return 2;
      case 'low': return 1;
    }
  }
}

export const triggerManager = new TriggerManager<TriggerContext>();