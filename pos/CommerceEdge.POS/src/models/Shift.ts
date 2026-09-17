export interface Shift {
  shiftId: string;
  registerId: string;
  operatorId: string;
  operatorName?: string;
  status: ShiftStatus;
  startTime: Date;
  endTime?: Date;
  openingFloat: number;
  closingFloat?: number;
  expectedFloat: number;
  actualFloat?: number;
  variance?: number;
  salesSummary: ShiftSalesSummary;
  cashSummary: ShiftCashSummary;
  paymentsSummary: ShiftPaymentsSummary;
  notes?: string;
  closedBy?: string;
  closedAt?: Date;
}

export type ShiftStatus = 'open' | 'closed' | 'paused' | 'reconciled';

export interface ShiftSalesSummary {
  grossSales: number;
  netSales: number;
  returns: number;
  voids: number;
  discounts: number;
  taxCollected: number;
  transactionCount: number;
  itemCount: number;
  averageTransactionValue: number;
}

export interface ShiftCashSummary {
  openingFloat: number;
  cashSales: number;
  cashRefunds: number;
  cashPaidOut: number;
  cashReceived: number;
  expectedCash: number;
  actualCash?: number;
  cashVariance?: number;
}

export interface ShiftPaymentsSummary {
  cash: number;
  card: number;
  mobile: number;
  giftCard: number;
  loyaltyPoints: number;
  storeCredit: number;
  total: number;
}

export interface ShiftOpenRequest {
  registerId: string;
  operatorId: string;
  openingFloat: number;
  notes?: string;
}

export interface ShiftCloseRequest {
  shiftId: string;
  closingFloat: number;
  actualCashCounted?: number;
  notes?: string;
}

export interface ShiftReconcileRequest {
  shiftId: string;
  closingFloat: number;
  countedCash: number;
  countedCard: number;
  countedMobile: number;
  countedGiftCard: number;
  countedLoyalty: number;
  countedStoreCredit: number;
  notes?: string;
}

export interface ShiftSearchCriteria {
  registerId?: string;
  operatorId?: string;
  status?: ShiftStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}

export interface ShiftSearchResult {
  shifts: Shift[];
  totalCount: number;
  page: number;
  pageSize: number;
}