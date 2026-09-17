export interface VoidRequest {
  registerId: string;
  operatorId: string;
  shiftId: string;
  orderId: string;
  reason: string;
  voidType: 'full' | 'partial';
  items?: VoidItem[];
  notes?: string;
}

export interface VoidItem {
  lineId: string;
  quantity: number;
  reason: string;
}

export interface VoidResponse {
  success: boolean;
  voidId?: string;
  voidNumber?: string;
  message?: string;
  error?: string;
}

export class VoidHandler {
  private voids: Map<string, any> = new Map();
  private voidCounter: number = 0;

  constructor(private readonly orderRepository?: Map<string, any>) {}

  handle(request: VoidRequest): VoidResponse {
    if (!request.registerId || !request.operatorId || !request.shiftId) {
      return {
        success: false,
        error: 'Register ID, Operator ID, and Shift ID are required'
      };
    }

    if (!request.orderId) {
      return {
        success: false,
        error: 'Order ID is required'
      };
    }

    const order = this.orderRepository?.get(request.orderId);
    if (!order) {
      return {
        success: false,
        error: 'Order not found'
      };
    }

    if (order.status === 'void' || order.status === 'cancelled') {
      return {
        success: false,
        error: 'Order has already been voided or cancelled'
      };
    }

    if (order.status === 'refunded') {
      return {
        success: false,
        error: 'Cannot void a refunded order'
      };
    }

    if (!request.reason) {
      return {
        success: false,
        error: 'Void reason is required'
      };
    }

    if (request.voidType === 'partial') {
      if (!request.items || request.items.length === 0) {
        return {
          success: false,
          error: 'Partial void requires at least one item'
        };
      }

      for (const item of request.items) {
        const orderItem = order.items.find((i: any) => i.lineId === item.lineId);
        if (!orderItem) {
          return {
            success: false,
            error: `Order item not found: ${item.lineId}`
          };
        }
        if (item.quantity <= 0 || item.quantity > orderItem.quantity) {
          return {
            success: false,
            error: `Invalid void quantity for ${orderItem.productName}`
          };
        }
      }
    }

    this.voidCounter++;
    const voidId = `VOID-${this.voidCounter.toString().padStart(8, '0')}`;
    const voidNumber = `VD-${Date.now().toString().slice(-8)}`;

    const voidRecord = {
      voidId,
      voidNumber,
      orderId: request.orderId,
      registerId: request.registerId,
      operatorId: request.operatorId,
      shiftId: request.shiftId,
      voidType: request.voidType,
      items: request.items,
      reason: request.reason,
      notes: request.notes,
      status: 'completed',
      createdAt: new Date()
    };

    this.voids.set(voidId, voidRecord);

    return {
      success: true,
      voidId,
      voidNumber,
      message: request.voidType === 'full' ? 'Order voided successfully' : 'Partial void completed successfully'
    };
  }

  getVoid(voidId: string): any {
    return this.voids.get(voidId);
  }

  getVoidsByOrder(orderId: string): any[] {
    return Array.from(this.voids.values()).filter(v => v.orderId === orderId);
  }
}