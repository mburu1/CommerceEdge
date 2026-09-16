import { OpenShiftHandler, OpenShiftRequest, OpenShiftResponse, ShiftData } from '../../../src/handlers/OpenShiftHandler';

describe('OpenShiftHandler', () => {
  let handler: OpenShiftHandler;
  let mockShiftRepository: Map<string, ShiftData>;

  beforeEach(() => {
    mockShiftRepository = new Map();
    handler = new OpenShiftHandler(mockShiftRepository);
  });

  describe('handle', () => {
    it('should successfully open a new shift with valid data', () => {
      const request: OpenShiftRequest = {
        operatorId: 'OP001',
        registerId: 'REG001',
        openingFloat: 100.00
      };

      const result: OpenShiftResponse = handler.handle(request);

      expect(result.success).toBe(true);
      expect(result.shiftId).toMatch(/^SHIFT-\d{6}$/);
      expect(result.message).toBe('Shift opened successfully');
      expect(result.shift).toBeDefined();
      expect(result.shift!.operatorId).toBe('OP001');
      expect(result.shift!.registerId).toBe('REG001');
      expect(result.shift!.openingFloat).toBe(100.00);
      expect(result.shift!.status).toBe('open');
      expect(result.shift!.startTime).toBeInstanceOf(Date);
    });

    it('should generate unique shift IDs for each new shift', () => {
      const request1: OpenShiftRequest = { operatorId: 'OP001', registerId: 'REG001', openingFloat: 100 };
      const request2: OpenShiftRequest = { operatorId: 'OP002', registerId: 'REG002', openingFloat: 200 };

      const result1 = handler.handle(request1);
      const result2 = handler.handle(request2);

      expect(result1.shiftId).not.toBe(result2.shiftId);
      expect(result1.shiftId).toMatch(/^SHIFT-\d{6}$/);
      expect(result2.shiftId).toMatch(/^SHIFT-\d{6}$/);
    });

    it('should fail when operatorId is missing', () => {
      const request: OpenShiftRequest = {
        operatorId: '',
        registerId: 'REG001',
        openingFloat: 100
      };

      const result = handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.shiftId).toBe('');
      expect(result.message).toBe('Operator ID and Register ID are required');
    });

    it('should fail when registerId is missing', () => {
      const request: OpenShiftRequest = {
        operatorId: 'OP001',
        registerId: '',
        openingFloat: 100
      };

      const result = handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.shiftId).toBe('');
      expect(result.message).toBe('Operator ID and Register ID are required');
    });

    it('should fail when openingFloat is negative', () => {
      const request: OpenShiftRequest = {
        operatorId: 'OP001',
        registerId: 'REG001',
        openingFloat: -50
      };

      const result = handler.handle(request);

      expect(result.success).toBe(false);
      expect(result.shiftId).toBe('');
      expect(result.message).toBe('Opening float cannot be negative');
    });

    it('should fail when register already has an open shift', () => {
      const request1: OpenShiftRequest = { operatorId: 'OP001', registerId: 'REG001', openingFloat: 100 };
      const request2: OpenShiftRequest = { operatorId: 'OP002', registerId: 'REG001', openingFloat: 200 };

      handler.handle(request1);
      const result = handler.handle(request2);

      expect(result.success).toBe(false);
      expect(result.shiftId).toBe('');
      expect(result.message).toBe('Register REG001 already has an open shift');
    });

    it('should allow opening shift on different register', () => {
      const request1: OpenShiftRequest = { operatorId: 'OP001', registerId: 'REG001', openingFloat: 100 };
      const request2: OpenShiftRequest = { operatorId: 'OP002', registerId: 'REG002', openingFloat: 200 };

      const result1 = handler.handle(request1);
      const result2 = handler.handle(request2);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });

    it('should store shift in repository', () => {
      const request: OpenShiftRequest = { operatorId: 'OP001', registerId: 'REG001', openingFloat: 100 };
      const result = handler.handle(request);

      const storedShift = mockShiftRepository.get(result.shiftId);
      expect(storedShift).toBeDefined();
      expect(storedShift!.operatorId).toBe('OP001');
      expect(storedShift!.registerId).toBe('REG001');
    });
  });

  describe('getShift', () => {
    it('should return shift when it exists', () => {
      const request: OpenShiftRequest = { operatorId: 'OP001', registerId: 'REG001', openingFloat: 100 };
      const result = handler.handle(request);

      const shift = handler.getShift(result.shiftId);

      expect(shift).toBeDefined();
      expect(shift!.shiftId).toBe(result.shiftId);
    });

    it('should return undefined for non-existent shift', () => {
      const shift = handler.getShift('SHIFT-999999');
      expect(shift).toBeUndefined();
    });
  });

  describe('getAllShifts', () => {
    it('should return all shifts', () => {
      const request1: OpenShiftRequest = { operatorId: 'OP001', registerId: 'REG001', openingFloat: 100 };
      const request2: OpenShiftRequest = { operatorId: 'OP002', registerId: 'REG002', openingFloat: 200 };

      handler.handle(request1);
      handler.handle(request2);

      const allShifts = handler.getAllShifts();
      expect(allShifts).toHaveLength(2);
    });

    it('should return empty array when no shifts', () => {
      const allShifts = handler.getAllShifts();
      expect(allShifts).toEqual([]);
    });
  });

  describe('getOpenShifts', () => {
    it('should return only open shifts', () => {
      const request1: OpenShiftRequest = { operatorId: 'OP001', registerId: 'REG001', openingFloat: 100 };
      const request2: OpenShiftRequest = { operatorId: 'OP002', registerId: 'REG002', openingFloat: 200 };

      handler.handle(request1);
      handler.handle(request2);

      const openShifts = handler.getOpenShifts();
      expect(openShifts).toHaveLength(2);
      expect(openShifts.every(s => s.status === 'open')).toBe(true);
    });
  });

  describe('shift ID format', () => {
    it('should generate sequential shift IDs', () => {
      const requests: OpenShiftRequest[] = [
        { operatorId: 'OP001', registerId: 'REG001', openingFloat: 100 },
        { operatorId: 'OP002', registerId: 'REG002', openingFloat: 200 },
        { operatorId: 'OP003', registerId: 'REG003', openingFloat: 300 }
      ];

      const results = requests.map(req => handler.handle(req));
      const shiftNumbers = results.map(r => parseInt(r.shiftId.split('-')[1], 10));

      expect(shiftNumbers[1]).toBe(shiftNumbers[0] + 1);
      expect(shiftNumbers[2]).toBe(shiftNumbers[1] + 1);
    });
  });
});