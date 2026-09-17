import { Shift, ShiftStatus, ShiftOpenRequest, ShiftCloseRequest, ShiftSearchCriteria, ShiftSearchResult } from '../models/Shift';

export interface OpenShiftRequest extends ShiftOpenRequest {}
export interface OpenShiftResponse {
  success: boolean;
  shift?: Shift;
  message?: string;
  error?: string;
}

export interface CloseShiftRequest extends ShiftCloseRequest {}
export interface CloseShiftResponse {
  success: boolean;
  shift?: Shift;
  message?: string;
  error?: string;
}

export interface ReconcileShiftRequest {
  shiftId: string;
  countedCash: number;
  countedCard: number;
  countedMobile: number;
  countedGiftCard: number;
  countedLoyalty: number;
  countedStoreCredit: number;
  notes?: string;
}

export interface ReconcileShiftResponse {
  success: boolean;
  shift?: Shift;
  variances?: Record<string, number>;
  message?: string;
  error?: string;
}

export interface GetShiftRequest {
  shiftId: string;
}

export interface GetShiftResponse {
  success: boolean;
  shift?: Shift;
  message?: string;
  error?: string;
}

export interface GetCurrentShiftRequest {
  registerId: string;
}

export interface GetCurrentShiftResponse {
  success: boolean;
  shift?: Shift | null;
  message?: string;
  error?: string;
}

export interface SearchShiftsRequest {
  criteria?: ShiftSearchCriteria;
}

export interface SearchShiftsResponse {
  success: boolean;
  shifts?: ShiftSearchResult;
  message?: string;
  error?: string;
}

export interface PauseShiftRequest {
  shiftId: string;
  reason: string;
}

export interface PauseShiftResponse {
  success: boolean;
  shift?: Shift;
  message?: string;
  error?: string;
}

export interface ResumeShiftRequest {
  shiftId: string;
}

export interface ResumeShiftResponse {
  success: boolean;
  shift?: Shift;
  message?: string;
  error?: string;
}

export class ShiftHandler {
  private shifts: Map<string, Shift> = new Map();
  private shiftCounter: number = 0;

  constructor(private readonly shiftRepository?: Map<string, Shift>) {
    if (shiftRepository) {
      this.shifts = shiftRepository;
    }
  }

  open(request: OpenShiftRequest): OpenShiftResponse {
    if (!request.operatorId || !request.registerId) {
      return {
        success: false,
        error: 'Operator ID and Register ID are required'
      };
    }

    if (request.openingFloat < 0) {
      return {
        success: false,
        error: 'Opening float cannot be negative'
      };
    }

    const existingOpenShift = Array.from(this.shifts.values()).find(
      shift => shift.registerId === request.registerId && shift.status === 'open'
    );

    if (existingOpenShift) {
      return {
        success: false,
        error: `Register ${request.registerId} already has an open shift`
      };
    }

    this.shiftCounter++;
    const shiftId = `SHIFT-${this.shiftCounter.toString().padStart(6, '0')}`;

    const newShift: Shift = {
      shiftId,
      registerId: request.registerId,
      operatorId: request.operatorId,
      status: 'open',
      startTime: new Date(),
      openingFloat: request.openingFloat,
      expectedFloat: request.openingFloat,
      salesSummary: {
        grossSales: 0,
        netSales: 0,
        returns: 0,
        voids: 0,
        discounts: 0,
        taxCollected: 0,
        transactionCount: 0,
        itemCount: 0,
        averageTransactionValue: 0
      },
      cashSummary: {
        openingFloat: request.openingFloat,
        cashSales: 0,
        cashRefunds: 0,
        cashPaidOut: 0,
        cashReceived: 0,
        expectedCash: request.openingFloat
      },
      paymentsSummary: {
        cash: 0,
        card: 0,
        mobile: 0,
        giftCard: 0,
        loyaltyPoints: 0,
        storeCredit: 0,
        total: 0
      },
      notes: request.notes
    };

    this.shifts.set(shiftId, newShift);

    return {
      success: true,
      shift: newShift,
      message: 'Shift opened successfully'
    };
  }

  close(request: CloseShiftRequest): CloseShiftResponse {
    const shift = this.shifts.get(request.shiftId);
    if (!shift) {
      return {
        success: false,
        error: 'Shift not found'
      };
    }

    if (shift.status !== 'open') {
      return {
        success: false,
        error: `Cannot close shift with status: ${shift.status}`
      };
    }

    if (request.closingFloat < 0) {
      return {
        success: false,
        error: 'Closing float cannot be negative'
      };
    }

    shift.status = 'closed';
    shift.endTime = new Date();
    shift.closingFloat = request.closingFloat;
    shift.closedAt = new Date();
    shift.notes = request.notes;

    shift.cashSummary.actualCash = request.closingFloat;
    shift.cashSummary.expectedCash = shift.cashSummary.openingFloat + shift.cashSummary.cashSales - shift.cashSummary.cashRefunds - shift.cashSummary.cashPaidOut + shift.cashSummary.cashReceived;
    shift.cashSummary.cashVariance = shift.cashSummary.actualCash - shift.cashSummary.expectedCash;

    return {
      success: true,
      shift,
      message: 'Shift closed successfully'
    };
  }

  reconcile(request: ReconcileShiftRequest): ReconcileShiftResponse {
    const shift = this.shifts.get(request.shiftId);
    if (!shift) {
      return {
        success: false,
        error: 'Shift not found'
      };
    }

    if (shift.status !== 'closed') {
      return {
        success: false,
        error: 'Can only reconcile closed shifts'
      };
    }

    const countedAmounts = {
      cash: request.countedCash,
      card: request.countedCard,
      mobile: request.countedMobile,
      giftCard: request.countedGiftCard,
      loyalty: request.countedLoyalty,
      storeCredit: request.countedStoreCredit
    };

    const variances: Record<string, number> = {
      cash: countedAmounts.cash - shift.cashSummary.expectedCash,
      card: countedAmounts.card - shift.paymentsSummary.card,
      mobile: countedAmounts.mobile - shift.paymentsSummary.mobile,
      giftCard: countedAmounts.giftCard - shift.paymentsSummary.giftCard,
      loyalty: countedAmounts.loyalty - shift.paymentsSummary.loyaltyPoints,
      storeCredit: countedAmounts.storeCredit - shift.paymentsSummary.storeCredit
    };

    shift.status = 'reconciled';
    shift.closingFloat = request.countedCash;
    shift.actualFloat = request.countedCash;
    shift.variance = Object.values(variances).reduce((sum, v) => sum + v, 0);
    shift.notes = request.notes;

    return {
      success: true,
      shift,
      variances,
      message: 'Shift reconciled successfully'
    };
  }

  get(request: GetShiftRequest): GetShiftResponse {
    const shift = this.shifts.get(request.shiftId);
    if (!shift) {
      return {
        success: false,
        error: 'Shift not found'
      };
    }

    return {
      success: true,
      shift,
      message: 'Shift retrieved'
    };
  }

  getCurrent(request: GetCurrentShiftRequest): GetCurrentShiftResponse {
    const shift = Array.from(this.shifts.values()).find(
      s => s.registerId === request.registerId && s.status === 'open'
    );

    return {
      success: true,
      shift: shift || null,
      message: shift ? 'Current shift found' : 'No open shift for this register'
    };
  }

  search(request: SearchShiftsRequest): SearchShiftsResponse {
    let results = Array.from(this.shifts.values());

    if (request.criteria) {
      if (request.criteria.registerId) {
        results = results.filter(s => s.registerId === request.criteria!.registerId);
      }
      if (request.criteria.operatorId) {
        results = results.filter(s => s.operatorId === request.criteria!.operatorId);
      }
      if (request.criteria.status) {
        results = results.filter(s => s.status === request.criteria!.status);
      }
      if (request.criteria.startDate) {
        results = results.filter(s => s.startTime >= request.criteria!.startDate!);
      }
      if (request.criteria.endDate) {
        results = results.filter(s => s.startTime <= request.criteria!.endDate!);
      }
    }

    const page = request.criteria?.page || 1;
    const pageSize = request.criteria?.pageSize || 20;
    const start = (page - 1) * pageSize;
    const paginated = results.slice(start, start + pageSize);

    return {
      success: true,
      shifts: {
        shifts: paginated,
        totalCount: results.length,
        page,
        pageSize
      },
      message: 'Search completed'
    };
  }

  pause(request: PauseShiftRequest): PauseShiftResponse {
    const shift = this.shifts.get(request.shiftId);
    if (!shift) {
      return { success: false, error: 'Shift not found' };
    }

    if (shift.status !== 'open') {
      return { success: false, error: 'Can only pause open shifts' };
    }

    shift.status = 'paused';
    shift.notes = `${shift.notes || ''} [PAUSED: ${request.reason}]`;

    return {
      success: true,
      shift,
      message: 'Shift paused successfully'
    };
  }

  resume(request: ResumeShiftRequest): ResumeShiftResponse {
    const shift = this.shifts.get(request.shiftId);
    if (!shift) {
      return { success: false, error: 'Shift not found' };
    }

    if (shift.status !== 'paused') {
      return { success: false, error: 'Can only resume paused shifts' };
    }

    shift.status = 'open';
    shift.notes = shift.notes?.replace(/ \[PAUSED: [^\]]*\]/, '') || '';

    return {
      success: true,
      shift,
      message: 'Shift resumed successfully'
    };
  }

  getShift(shiftId: string): Shift | undefined {
    return this.shifts.get(shiftId);
  }

  getAllShifts(): Shift[] {
    return Array.from(this.shifts.values());
  }

  getOpenShifts(): Shift[] {
    return Array.from(this.shifts.values()).filter(s => s.status === 'open');
  }
}