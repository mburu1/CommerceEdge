export interface POSRequest<T = unknown> {
  requestId: string;
  timestamp: Date;
  version: string;
  source: 'pos' | 'scale_unit' | 'commerce_engine';
  payload: T;
  metadata?: RequestMetadata;
}

export interface POSResponse<T = unknown> {
  requestId: string;
  timestamp: Date;
  success: boolean;
  payload?: T;
  error?: POSError;
  metadata?: ResponseMetadata;
}

export interface RequestMetadata {
  registerId?: string;
  operatorId?: string;
  shiftId?: string;
  storeId?: string;
  correlationId?: string;
  traceId?: string;
}

export interface ResponseMetadata {
  processingTimeMs: number;
  serverVersion: string;
  warnings?: string[];
}

export interface POSError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  severity: 'error' | 'warning' | 'info';
  retryable: boolean;
  helpUrl?: string;
}

export interface PaginatedRequest {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function createPOSRequest<T>(payload: T, metadata?: RequestMetadata): POSRequest<T> {
  return {
    requestId: generateRequestId(),
    timestamp: new Date(),
    version: '1.0',
    source: 'pos',
    payload,
    metadata
  };
}

export function createPOSResponse<T>(
  requestId: string,
  success: boolean,
  payload?: T,
  error?: POSError,
  processingTimeMs: number = 0
): POSResponse<T> {
  return {
    requestId,
    timestamp: new Date(),
    success,
    payload,
    error,
    metadata: {
      processingTimeMs,
      serverVersion: '1.0.0'
    }
  };
}

function generateRequestId(): string {
  return `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
}