import { Shift, ShiftStatus, ShiftSalesSummary, ShiftCashSummary, ShiftPaymentsSummary, ShiftOpenRequest, ShiftCloseRequest, ShiftReconcileRequest, ShiftSearchCriteria, ShiftSearchResult } from '../../../src/models/Shift';

describe('Shift Model', () => {
  const createValidShift = (overrides: Partial<Shift> = {}): Shift => ({
    shiftId: 'SHIFT-001',
    registerId: 'REG-001',
    operatorId: 'OP-001',
    operatorName: 'John Cashier',
    status: 'open',
    startTime: new Date('2024-01-01T08:00:00'),
    openingFloat: 100.00,
    expectedFloat: 100.00,
    salesSummary: {
      grossSales: 1000.00,
      netSales: 950.00,
      returns: 25.00,
      voids: 10.00,
      discounts: 15.00,
      taxCollected: 80.00,
      transactionCount: 50,
      itemCount: 120,
      averageTransactionValue: 19.00
    },
    cashSummary: {
      openingFloat: 100.00,
      cashSales: 400.00,
      cashRefunds: 25.00,
      cashPaidOut: 50.00,
      cashReceived: 0,
      expectedCash: 425.00
    },
    paymentsSummary: {
      cash: 400.00,
      card: 400.00,
      mobile: 100.00,
      giftCard: 50.00,
      loyaltyPoints: 25.00,
      storeCredit: 25.00,
      total: 1000.00
    },
    ...overrides
  });

  describe('Shift interface', () => {
    it('should create a valid shift', () => {
      const shift = createValidShift();
      expect(shift.shiftId).toBe('SHIFT-001');
      expect(shift.registerId).toBe('REG-001');
      expect(shift.operatorId).toBe('OP-001');
      expect(shift.status).toBe('open');
      expect(shift.openingFloat).toBe(100.00);
    });

    it('should support all shift statuses', () => {
      const statuses: ShiftStatus[] = ['open', 'closed', 'paused', 'reconciled'];
      
      for (const status of statuses) {
        const shift = createValidShift({ status });
        expect(shift.status).toBe(status);
      }
    });

    it('should handle closed shift', () => {
      const shift = createValidShift({
        status: 'closed',
        endTime: new Date('2024-01-01T16:00:00'),
        closingFloat: 125.00,
        closedBy: 'OP-001',
        closedAt: new Date('2024-01-01T16:00:00')
      });
      
      expect(shift.status).toBe('closed');
      expect(shift.endTime).toBeDefined();
      expect(shift.closingFloat).toBe(125.00);
    });

    it('should handle reconciled shift with variance', () => {
      const shift = createValidShift({
        status: 'reconciled',
        closingFloat: 120.00,
        actualFloat: 120.00,
        variance: -5.00
      });
      
      expect(shift.variance).toBe(-5.00);
    });

    it('should have valid sales summary', () => {
      const shift = createValidShift();
      expect(shift.salesSummary.grossSales).toBe(1000.00);
      expect(shift.salesSummary.transactionCount).toBe(50);
      expect(shift.salesSummary.averageTransactionValue).toBe(19.00);
    });

    it('should have valid cash summary', () => {
      const shift = createValidShift();
      expect(shift.cashSummary.openingFloat).toBe(100.00);
      expect(shift.cashSummary.expectedCash).toBe(425.00);
    });

    it('should have valid payments summary', () => {
      const shift = createValidShift();
      expect(shift.paymentsSummary.total).toBe(1000.00);
      expect(shift.paymentsSummary.cash).toBe(400.00);
      expect(shift.paymentsSummary.card).toBe(400.00);
    });
  });

  describe('ShiftOpenRequest', () => {
    it('should create valid open request', () => {
      const request: ShiftOpenRequest = {
        registerId: 'REG-001',
        operatorId: 'OP-001',
        openingFloat: 100.00,
        notes: 'Morning shift'
      };
      
      expect(request.registerId).toBe('REG-001');
      expect(request.openingFloat).toBe(100.00);
    });
  });

  describe('ShiftCloseRequest', () => {
    it('should create valid close request', () => {
      const request: ShiftCloseRequest = {
        shiftId: 'SHIFT-001',
        closingFloat: 125.00,
        actualCashCounted: 125.00,
        notes: 'End of day'
      };
      
      expect(request.shiftId).toBe('SHIFT-001');
      expect(request.closingFloat).toBe(125.00);
    });
  });

  describe('ShiftReconcileRequest', () => {
    it('should create valid reconcile request', () => {
      const request: ShiftReconcileRequest = {
        shiftId: 'SHIFT-001',
        closingFloat: 125.00,
        countedCash: 125.00,
        countedCard: 400.00,
        countedMobile: 100.00,
        countedGiftCard: 50.00,
        countedLoyalty: 25.00,
        countedStoreCredit: 25.00,
        notes: 'Reconciled'
      };
      
      expect(request.shiftId).toBe('SHIFT-001');
    });
  });

  describe('ShiftSearchCriteria', () => {
    it('should create valid search criteria', () => {
      const criteria: ShiftSearchCriteria = {
        registerId: 'REG-001',
        operatorId: 'OP-001',
        status: 'open',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        page: 1,
        pageSize: 20
      };
      
      expect(criteria.registerId).toBe('REG-001');
      expect(criteria.status).toBe('open');
    });
  });

  describe('ShiftSearchResult', () => {
    it('should create valid search result', () => {
      const shifts = [createValidShift({ shiftId: 'SHIFT-001' })];
      const result: ShiftSearchResult = {
        shifts,
        totalCount: 1,
        page: 1,
        pageSize: 20
      };
      
      expect(result.shifts).toHaveLength(1);
      expect(result.totalCount).toBe(1);
    });
  });
});