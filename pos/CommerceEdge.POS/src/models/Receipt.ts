export interface Receipt {
  receiptId: string;
  receiptNumber: string;
  orderId: string;
  type: ReceiptType;
  format: ReceiptFormat;
  content: ReceiptContent;
  printedAt?: Date;
  printedBy?: string;
  printerId?: string;
  copyCount: number;
  isReprint: boolean;
  originalReceiptId?: string;
}

export type ReceiptType = 'sale' | 'refund' | 'void' | 'gift_receipt' | 'exchange' | 'quote' | 'layby';

export type ReceiptFormat = 'thermal' | 'a4' | 'email' | 'sms' | 'digital';

export interface ReceiptContent {
  header: ReceiptHeader;
  body: ReceiptBody;
  footer: ReceiptFooter;
}

export interface ReceiptHeader {
  storeName: string;
  storeAddress: string;
  storePhone?: string;
  storeEmail?: string;
  vatNumber?: string;
  receiptNumber: string;
  date: Date;
  time: string;
  registerId: string;
  operatorId: string;
  operatorName?: string;
  customerId?: string;
  customerName?: string;
  loyaltyTier?: string;
  loyaltyPoints?: number;
}

export interface ReceiptBody {
  items: ReceiptItem[];
  subtotal: number;
  discounts: ReceiptDiscount[];
  taxes: ReceiptTax[];
  total: number;
  payments: ReceiptPayment[];
  changeDue: number;
}

export interface ReceiptItem {
  lineNumber: number;
  productName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
  isVoided: boolean;
}

export interface ReceiptDiscount {
  description: string;
  amount: number;
  type: 'item' | 'order' | 'loyalty' | 'promotion';
}

export interface ReceiptTax {
  name: string;
  rate: number;
  amount: number;
}

export interface ReceiptPayment {
  method: string;
  amount: number;
  reference?: string;
  cardLastFour?: string;
  cardType?: string;
}

export interface ReceiptFooter {
  returnPolicy?: string;
  loyaltyMessage?: string;
  surveyUrl?: string;
  qrCode?: string;
  thankYouMessage: string;
}

export interface ReceiptPrintOptions {
  format: ReceiptFormat;
  copies: number;
  includeLogo: boolean;
  includeQRCode: boolean;
  language?: string;
}