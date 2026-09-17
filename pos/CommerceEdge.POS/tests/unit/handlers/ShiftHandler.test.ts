import { ShiftHandler, OpenShiftRequest, OpenShiftResponse, CloseShiftRequest, CloseShiftResponse, ReconcileShiftRequest, ReconcileShiftResponse, GetShiftRequest, GetShiftResponse, GetCurrentShiftRequest, GetCurrentShiftResponse, SearchShiftsRequest, SearchShiftsResponse, PauseShiftRequest, PauseShiftResponse, ResumeShiftRequest, ResumeShiftResponse } from '../../../src/handlers/ShiftHandler';
import { Shift, ShiftStatus } from '../../../src/models/Shift';

describe('ShiftHandler', () => {
  let handler: ShiftHandler;
  const mockRepository = new Map<string, Shift>();

  beforeEach(() => {
    mockRepository.clear();
    handler = new ShiftHandler(mockRepository);
  });

  const createValidOpenRequest = (overrides: Partial<OpenShiftRequest> = {}): OpenShiftRequest => ({
    registerId: 'REG-001',
    operatorId: 'OP-001',
    openingFloat: 100.00,
    ...overrides
  });

  let openShift: Shift;

  describe('open', () => {
    it('should successfully open a new shift', () => {
      const request = createValidOpenRequest();
      const result = handler.open(request);

      expect(result.success).toBe(true);
      expect(result.shift).toBeDefined();
      expect(result.shift!.shiftId).toMatch(/^SHIFT-\d{6}$/);
      expect(result.shift!.registerId).toBe('REG-001');
      expect(result.shift!.operatorId).toBe('OP-001');
      expect(result.shift!.openingFloat).toBe(100.00);
      expect(result.shift!.status).toBe('open');
      expect(result.shift!.startTime).toBeDefined();
      expect(result.message).toBe('Shift opened successfully');
    });

    it('should fail when operatorId is missing', () => {
      const request = createValidOpenRequest({ operatorId: '' });
      const result = handler.open(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Operator ID and Register ID are required');
    });

    it('should fail when registerId is missing', () => {
      const request = createValidOpenRequest({ registerId: '' });
      const result = handler.open(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Operator ID and Register ID are required');
    });

    it('should fail when openingFloat is negative', () => {
      const request = createValidOpenRequest({ openingFloat: -50 });
      const result = handler.open(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Opening float cannot be negative');
    });

    it('should fail when register already has an open shift', () => {
      const request1 = createValidOpenRequest();
      handler.open(request1);

      const request2 = createValidOpenRequest({ operatorId: 'OP-002' });
      const result = handler.open(request2);

      expect(result.success).toBe(false);
      expect(result.error).toContain('already has an open shift');
    });

    it('should allow opening shift on different register', () => {
      const request1 = createValidOpenRequest({ registerId: 'REG-001' });
      const request2 = createValidOpenRequest({ registerId: 'REG-002', operatorId: 'OP-002' });

      const result1 = handler.open(request1);
      const result2 = handler.open(request2);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.shift!.registerId).toBe('REG-001');
      expect(result2.shift!.registerId).toBe('REG-002');
    });

    it('should generate sequential shift IDs', () => {
      const request1 = createValidOpenRequest({ registerId: 'REG-001' });
      const request2 = createValidOpenRequest({ registerId: 'REG-002', operatorId: 'OP-002' });
      const request3 = createValidOpenRequest({ registerId: 'REG-003', operatorId: 'OP-003' });

      const result1 = handler.open(request1);
      const result2 = handler.open(request2);
      const result3 = handler.open(request3);

      const id1 = parseInt(result1.shift!.shiftId.split('-')[1], 10);
      const id2 = parseInt(result2.shift!.shiftId.split('-')[1], 10);
      const id3 = parseInt(result3.shift!.shiftId.split('-')[1], 10);

      expect(id2).toBe(id1 + 1);
      expect(id3).toBe(id2 + 1);
    });

    it('should initialize sales summary correctly', () => {
      const request = createValidOpenRequest();
      const result = handler.open(request);

      expect(result.shift!.salesSummary.grossSales).toBe(0);
      expect(result.shift!.salesSummary.netSales).toBe(0);
      expect(result.shift!.salesSummary.transactionCount).toBe(0);
    });

    it('should initialize cash summary correctly', () => {
      const request = createValidOpenRequest();
      const result = handler.open(request);

      expect(result.shift!.cashSummary.openingFloat).toBe(100.00);
      expect(result.shift!.cashSummary.cashSales).toBe(0);
      expect(result.shift!.cashSummary.expectedCash).toBe(100.00);
    });

    it('should initialize payments summary correctly', () => {
      const request = createValidOpenRequest();
      const result = handler.open(request);

      expect(result.shift!.paymentsSummary.cash).toBe(0);
      expect(result.shift!.paymentsSummary.card).toBe(0);
      expect(result.shift!.paymentsSummary.total).toBe(0);
    });
  });

  describe('close', () => {
    beforeEach(() => {
      const request = createValidOpenRequest();
      const result = handler.open(request);
      openShift = result.shift!;
    });

    it('should successfully close an open shift', () => {
      const request: CloseShiftRequest = { shiftId: openShift.shiftId, closingFloat: 125.00 };
      const result = handler.close(request);

      expect(result.success).toBe(true);
      expect(result.shift!.status).toBe('closed');
      expect(result.shift!.closingFloat).toBe(125.00);
      expect(result.shift!.endTime).toBeDefined();
      expect(result.shift!.cashSummary.actualCash).toBe(125.00);
      expect(result.message).toBe('Shift closed successfully');
    });

    it('should fail when shift not found', () => {
      const request: CloseShiftRequest = { shiftId: 'SHIFT-999999', closingFloat: 100.00 };
      const result = handler.close(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Shift not found');
    });

    it('should fail when shift not open', () => {
      const request1: CloseShiftRequest = { shiftId: openShift.shiftId, closingFloat: 125.00 };
      handler.close(request1);

      const request2: CloseShiftRequest = { shiftId: openShift.shiftId, closingFloat: 130.00 };
      const result = handler.close(request2);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot close shift with status');
    });

    it('should fail when closingFloat is negative', () => {
      const request: CloseShiftRequest = { shiftId: openShift.shiftId, closingFloat: -50 };
      const result = handler.close(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Closing float cannot be negative');
    });

    it('should calculate expected cash correctly', () => {
      openShift.cashSummary.cashSales = 500;
      openShift.cashSummary.cashRefunds = 50;
      openShift.cashSummary.cashPaidOut = 20;
      openShift.cashSummary.cashReceived = 0;

      const request: CloseShiftRequest = { shiftId: openShift.shiftId, closingFloat: 530 };
      const result = handler.close(request);

      expect(result.shift!.cashSummary.expectedCash).toBe(530);
      expect(result.shift!.cashSummary.cashVariance).toBe(0);
    });

    it('should calculate cash variance', () => {
      openShift.cashSummary.cashSales = 500;

      const request: CloseShiftRequest = { shiftId: openShift.shiftId, closingFloat: 550 };
      const result = handler.close(request);

      // variance = actual - expected = 550 - 600 = -50 (shortage)
      expect(result.shift!.cashSummary.cashVariance).toBe(-50);
    });
  });

  describe('reconcile', () => {
    let closedShift: Shift;

    beforeEach(() => {
      const request = createValidOpenRequest();
      const result = handler.open(request);
      openShift = result.shift!;

      const closeRequest: CloseShiftRequest = { shiftId: openShift.shiftId, closingFloat: 125.00 };
      const closeResult = handler.close(closeRequest);
      closedShift = closeResult.shift!;
    });

    it('should successfully reconcile a closed shift', () => {
      const request: ReconcileShiftRequest = {
        shiftId: closedShift.shiftId,
        countedCash: 125.00,
        countedCard: 400.00,
        countedMobile: 100.00,
        countedGiftCard: 50.00,
        countedLoyalty: 25.00,
        countedStoreCredit: 25.00
      };
      const result = handler.reconcile(request);

      expect(result.success).toBe(true);
      expect(result.shift!.status).toBe('reconciled');
      expect(result.variances).toBeDefined();
      expect(result.message).toBe('Shift reconciled successfully');
    });

    it('should fail when shift not found', () => {
      const request: ReconcileShiftRequest = {
        shiftId: 'SHIFT-999999',
        countedCash: 100,
        countedCard: 100,
        countedMobile: 100,
        countedGiftCard: 100,
        countedLoyalty: 100,
        countedStoreCredit: 100
      };
      const result = handler.reconcile(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Shift not found');
    });

    it('should fail when shift not closed', () => {
      const request = createValidOpenRequest({ registerId: 'REG-002', operatorId: 'OP-002' });
      const openResult = handler.open(request);

      const reconcileRequest: ReconcileShiftRequest = {
        shiftId: openResult.shift!.shiftId,
        countedCash: 100,
        countedCard: 100,
        countedMobile: 100,
        countedGiftCard: 100,
        countedLoyalty: 100,
        countedStoreCredit: 100
      };
      const result = handler.reconcile(reconcileRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Can only reconcile closed shifts');
    });

    it('should calculate variances correctly', () => {
      closedShift.cashSummary.expectedCash = 100;
      closedShift.paymentsSummary.card = 400;
      closedShift.paymentsSummary.mobile = 100;

      const request: ReconcileShiftRequest = {
        shiftId: closedShift.shiftId,
        countedCash: 105,
        countedCard: 395,
        countedMobile: 100,
        countedGiftCard: 50,
        countedLoyalty: 25,
        countedStoreCredit: 25
      };
      const result = handler.reconcile(request);

      expect(result.variances!.cash).toBe(5);
      expect(result.variances!.card).toBe(-5);
      expect(result.variances!.mobile).toBe(0);
    });
  });

  describe('get', () => {
    it('should return shift by ID', () => {
      const request = createValidOpenRequest();
      const openResult = handler.open(request);

      const getRequest: GetShiftRequest = { shiftId: openResult.shift!.shiftId };
      const result = handler.get(getRequest);

      expect(result.success).toBe(true);
      expect(result.shift).toBeDefined();
      expect(result.shift!.shiftId).toBe(openResult.shift!.shiftId);
    });

    it('should return error for non-existent shift', () => {
      const request: GetShiftRequest = { shiftId: 'SHIFT-999999' };
      const result = handler.get(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Shift not found');
    });
  });

  describe('getCurrent', () => {
    it('should return current open shift for register', () => {
      const request = createValidOpenRequest();
      const openResult = handler.open(request);

      const getRequest: GetCurrentShiftRequest = { registerId: 'REG-001' };
      const result = handler.getCurrent(getRequest);

      expect(result.success).toBe(true);
      expect(result.shift).toBeDefined();
      expect(result.shift!.shiftId).toBe(openResult.shift!.shiftId);
    });

    it('should return null when no open shift for register', () => {
      const request: GetCurrentShiftRequest = { registerId: 'REG-999' };
      const result = handler.getCurrent(request);

      expect(result.success).toBe(true);
      expect(result.shift).toBeNull();
    });
  });

  describe('search', () => {
    beforeEach(() => {
      const request1 = createValidOpenRequest({ registerId: 'REG-001', operatorId: 'OP-001' });
      const request2 = createValidOpenRequest({ registerId: 'REG-002', operatorId: 'OP-002' });
      handler.open(request1);
      handler.open(request2);
    });

    it('should return all shifts', () => {
      const request: SearchShiftsRequest = {};
      const result = handler.search(request);

      expect(result.success).toBe(true);
      expect(result.shifts!.shifts).toHaveLength(2);
      expect(result.shifts!.totalCount).toBe(2);
    });

    it('should filter by registerId', () => {
      const request: SearchShiftsRequest = { criteria: { registerId: 'REG-001' } };
      const result = handler.search(request);

      expect(result.success).toBe(true);
      expect(result.shifts!.shifts).toHaveLength(1);
      expect(result.shifts!.shifts[0].registerId).toBe('REG-001');
    });

    it('should filter by operatorId', () => {
      const request: SearchShiftsRequest = { criteria: { operatorId: 'OP-002' } };
      const result = handler.search(request);

      expect(result.success).toBe(true);
      expect(result.shifts!.shifts).toHaveLength(1);
      expect(result.shifts!.shifts[0].operatorId).toBe('OP-002');
    });

    it('should filter by status', () => {
      const request: SearchShiftsRequest = { criteria: { status: 'open' } };
      const result = handler.search(request);

      expect(result.success).toBe(true);
      expect(result.shifts!.shifts).toHaveLength(2);
    });

    it('should paginate results', () => {
      const request: SearchShiftsRequest = { criteria: { page: 1, pageSize: 1 } };
      const result = handler.search(request);

      expect(result.success).toBe(true);
      expect(result.shifts!.shifts).toHaveLength(1);
      expect(result.shifts!.page).toBe(1);
      expect(result.shifts!.pageSize).toBe(1);
      expect(result.shifts!.totalCount).toBe(2);
    });
  });

  describe('pause', () => {
    it('should pause an open shift', () => {
      const request = createValidOpenRequest();
      const openResult = handler.open(request);

      const pauseRequest: PauseShiftRequest = { shiftId: openResult.shift!.shiftId, reason: 'Lunch break' };
      const result = handler.pause(pauseRequest);

      expect(result.success).toBe(true);
      expect(result.shift!.status).toBe('paused');
      expect(result.shift!.notes).toContain('PAUSED: Lunch break');
    });

    it('should fail when shift not found', () => {
      const request: PauseShiftRequest = { shiftId: 'SHIFT-999999', reason: 'Test' };
      const result = handler.pause(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Shift not found');
    });

    it('should fail when shift not open', () => {
      const request = createValidOpenRequest();
      const openResult = handler.open(request);
      handler.close({ shiftId: openResult.shift!.shiftId, closingFloat: 100 });

      const pauseRequest: PauseShiftRequest = { shiftId: openResult.shift!.shiftId, reason: 'Test' };
      const result = handler.pause(pauseRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Can only pause open shifts');
    });
  });

  describe('resume', () => {
    it('should resume a paused shift', () => {
      const request = createValidOpenRequest();
      const openResult = handler.open(request);
      handler.pause({ shiftId: openResult.shift!.shiftId, reason: 'Lunch break' });

      const resumeRequest: ResumeShiftRequest = { shiftId: openResult.shift!.shiftId };
      const result = handler.resume(resumeRequest);

      expect(result.success).toBe(true);
      expect(result.shift!.status).toBe('open');
      expect(result.shift!.notes).not.toContain('PAUSED');
    });

    it('should fail when shift not found', () => {
      const request: ResumeShiftRequest = { shiftId: 'SHIFT-999999' };
      const result = handler.resume(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Shift not found');
    });

    it('should fail when shift not paused', () => {
      const request = createValidOpenRequest();
      const openResult = handler.open(request);

      const resumeRequest: ResumeShiftRequest = { shiftId: openResult.shift!.shiftId };
      const result = handler.resume(resumeRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Can only resume paused shifts');
    });
  });

  describe('getShift', () => {
    it('should return shift by ID', () => {
      const request = createValidOpenRequest();
      const openResult = handler.open(request);

      const shift = handler.getShift(openResult.shift!.shiftId);
      expect(shift).toBeDefined();
      expect(shift!.shiftId).toBe(openResult.shift!.shiftId);
    });
  });

  describe('getAllShifts', () => {
    it('should return all shifts', () => {
      const request1 = createValidOpenRequest({ registerId: 'REG-001' });
      const request2 = createValidOpenRequest({ registerId: 'REG-002', operatorId: 'OP-002' });
      handler.open(request1);
      handler.open(request2);

      const shifts = handler.getAllShifts();
      expect(shifts).toHaveLength(2);
    });
  });

  describe('getOpenShifts', () => {
    it('should return only open shifts', () => {
      const request1 = createValidOpenRequest({ registerId: 'REG-001' });
      const request2 = createValidOpenRequest({ registerId: 'REG-002', operatorId: 'OP-002' });
      handler.open(request1);
      const openResult2 = handler.open(request2);
      handler.close({ shiftId: openResult2.shift!.shiftId, closingFloat: 100 });

      const openShifts = handler.getOpenShifts();
      expect(openShifts).toHaveLength(1);
      expect(openShifts[0].status).toBe('open');
    });
  });
});