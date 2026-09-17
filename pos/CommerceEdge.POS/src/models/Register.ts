export interface Register {
  registerId: string;
  name: string;
  description?: string;
  storeId: string;
  deviceId?: string;
  ipAddress?: string;
  macAddress?: string;
  status: RegisterStatus;
  isActive: boolean;
  hardwareProfile: HardwareProfile;
  paymentTerminal?: PaymentTerminalConfig;
  receiptPrinter?: ReceiptPrinterConfig;
  cashDrawer?: CashDrawerConfig;
  barcodeScanner?: BarcodeScannerConfig;
  customerDisplay?: CustomerDisplayConfig;
  scale?: ScaleConfig;
  lastHeartbeat?: Date;
  lastSync?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type RegisterStatus = 'online' | 'offline' | 'maintenance' | 'error' | 'unconfigured';

export interface HardwareProfile {
  profileId: string;
  name: string;
  description?: string;
  supportedPeripherals: PeripheralType[];
}

export type PeripheralType = 
  | 'receipt_printer' 
  | 'cash_drawer' 
  | 'barcode_scanner' 
  | 'customer_display' 
  | 'payment_terminal' 
  | 'scale' 
  | 'signature_capture' 
  | 'pin_pad';

export interface PaymentTerminalConfig {
  terminalId: string;
  provider: 'adyen' | 'verifone' | 'ingenico' | 'pax' | 'square' | 'stripe' | 'custom';
  connectionType: 'usb' | 'ethernet' | 'bluetooth' | 'wifi' | 'serial';
  ipAddress?: string;
  port?: number;
  serialPort?: string;
  merchantId: string;
  terminalSerialNumber?: string;
  supportedPaymentMethods: PaymentMethod[];
  isContactlessEnabled: boolean;
  isChipEnabled: boolean;
  isSwipeEnabled: boolean;
}

export type PaymentMethod = 'credit' | 'debit' | 'contactless' | 'mobile_wallet' | 'gift_card' | 'loyalty';

export interface ReceiptPrinterConfig {
  printerId: string;
  model: string;
  connectionType: 'usb' | 'ethernet' | 'bluetooth' | 'wifi' | 'serial';
  ipAddress?: string;
  port?: number;
  serialPort?: string;
  paperWidth: 58 | 80;
  printSpeed: 'low' | 'medium' | 'high';
  density: 'light' | 'medium' | 'dark';
  isDefault: boolean;
}

export interface CashDrawerConfig {
  drawerId: string;
  connectionType: 'usb' | 'serial' | 'printer_driven' | 'network';
  ipAddress?: string;
  port?: number;
  serialPort?: string;
  printerPort?: string;
  hasLock: boolean;
  currency: string;
}

export interface BarcodeScannerConfig {
  scannerId: string;
  model: string;
  connectionType: 'usb' | 'bluetooth' | 'wifi' | 'serial';
  ipAddress?: string;
  port?: number;
  serialPort?: string;
  scanMode: 'trigger' | 'continuous' | 'presentation';
  symbologies: string[];
}

export interface CustomerDisplayConfig {
  displayId: string;
  model: string;
  connectionType: 'usb' | 'serial' | 'network';
  ipAddress?: string;
  port?: number;
  serialPort?: string;
  lines: number;
  charactersPerLine: number;
  brightness: number;
}

export interface ScaleConfig {
  scaleId: string;
  model: string;
  connectionType: 'usb' | 'serial' | 'network';
  ipAddress?: string;
  port?: number;
  serialPort?: string;
  capacity: number;
  unit: 'kg' | 'lb' | 'g' | 'oz';
  precision: number;
  isLegalForTrade: boolean;
}

export interface RegisterSearchCriteria {
  storeId?: string;
  status?: RegisterStatus;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface RegisterSearchResult {
  registers: Register[];
  totalCount: number;
  page: number;
  pageSize: number;
}