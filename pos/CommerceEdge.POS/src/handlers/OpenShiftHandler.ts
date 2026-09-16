export interface ShiftData {
  shiftId: string;
  operatorId: string;
  startTime: Date;
  endTime?: Date;
  status: 'open' | 'closed' | 'paused';
  registerId: string;
  openingFloat: number;
  closingFloat?: number;
}

export interface OpenShiftRequest {
  operatorId: string;
  registerId: string;
  openingFloat: number;
}

export interface OpenShiftResponse {
  success: boolean;
  shiftId: string;
  message: string;
  shift?: ShiftData;
}

export class OpenShiftHandler {
  private shifts: Map<string, ShiftData> = new Map();
  private shiftCounter: number = 0;

  constructor(private readonly shiftRepository?: Map<string, ShiftData>) {
    if (shiftRepository) {
      this.shifts = shiftRepository;
    }
  }

  handle(request: OpenShiftRequest): OpenShiftResponse {
    if (!request.operatorId || !request.registerId) {
      return {
        success: false,
        shiftId: '',
        message: 'Operator ID and Register ID are required'
      };
    }

    if (request.openingFloat < 0) {
      return {
        success: false,
        shiftId: '',
        message: 'Opening float cannot be negative'
      };
    }

    const existingOpenShift = Array.from(this.shifts.values()).find(
      shift => shift.registerId === request.registerId && shift.status === 'open'
    );

    if (existingOpenShift) {
      return {
        success: false,
        shiftId: '',
        message: `Register ${request.registerId} already has an open shift`
      };
    }

    this.shiftCounter++;
    const shiftId = `SHIFT-${this.shiftCounter.toString().padStart(6, '0')}`;

    const newShift: ShiftData = {
      shiftId,
      operatorId: request.operatorId,
      startTime: new Date(),
      status: 'open',
      registerId: request.registerId,
      openingFloat: request.openingFloat
    };

    this.shifts.set(shiftId, newShift);

    return {
      success: true,
      shiftId,
      message: 'Shift opened successfully',
      shift: newShift
    };
  }

  getShift(shiftId: string): ShiftData | undefined {
    return this.shifts.get(shiftId);
  }

  getAllShifts(): ShiftData[] {
    return Array.from(this.shifts.values());
  }

  getOpenShifts(): ShiftData[] {
    return Array.from(this.shifts.values()).filter(shift => shift.status === 'open');
  }
}