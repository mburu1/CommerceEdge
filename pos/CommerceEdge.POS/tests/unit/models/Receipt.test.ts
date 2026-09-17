import { Receipt, ReceiptType, ReceiptFormat, ReceiptContent, ReceiptHeader, ReceiptBody, ReceiptFooter, ReceiptItem, ReceiptDiscount, ReceiptTax, ReceiptPayment, ReceiptPrintOptions } from '../../../src/models/Receipt';

describe('Receipt Model', () => {
  const createValidReceiptItem = (overrides: Partial<ReceiptItem> = {}): ReceiptItem => ({
    lineNumber: 1,
    productName: 'Test Product',
    sku: 'SKU-001',
    quantity: 2,
    unitPrice: 19.99,
    discountPercent: 0,
    discountAmount: 0,
    taxRate: 8.5,
    taxAmount: 3.40,
    lineTotal: 43.38,
    isVoided: false,
    ...overrides
  });

  const createValidReceiptPayment = (overrides: Partial<ReceiptPayment> = {}): ReceiptPayment => ({
    method: 'card',
    amount: 43.38,
    reference: 'REF-123',
    cardLastFour: '1234',
    cardType: 'visa',
    ...overrides
  });

  const createValidReceipt = (overrides: Partial<Receipt> = {}): Receipt => ({
    receiptId: 'RCT-001',
    receiptNumber: 'RCT-001',
    orderId: 'ORD-001',
    type: 'sale',
    format: 'thermal',
    content: {
      header: {
        storeName: 'Test Store',
        storeAddress: '123 Test St',
        storePhone: '555-1234',
        storeEmail: 'test@store.com',
        vatNumber: 'VAT123',
        receiptNumber: 'RCT-001',
        date: new Date(),
        time: '12:00:00',
        registerId: 'REG-001',
        operatorId: 'OP-001',
        operatorName: 'John Cashier',
        customerId: 'CUST-001',
        customerName: 'Jane Customer',
        loyaltyTier: 'gold',
        loyaltyPoints: 1500
      },
      body: {
        items: [createValidReceiptItem()],
        subtotal: 39.98,
        discounts: [],
        taxes: [{ name: 'Sales Tax', rate: 8.5, amount: 3.40 }],
        total: 43.38,
        payments: [createValidReceiptPayment()],
        changeDue: 0
      },
      footer: {
        returnPolicy: 'Returns within 30 days',
        loyaltyMessage: 'Thanks for shopping!',
        surveyUrl: 'https://survey.com',
        thankYouMessage: 'Thank you!'
      }
    },
    printedAt: new Date(),
    printedBy: 'OP-001',
    printerId: 'PRINTER-001',
    copyCount: 1,
    isReprint: false,
    ...overrides
  });

  describe('Receipt interface', () => {
    it('should create a valid receipt', () => {
      const receipt = createValidReceipt();
      expect(receipt.receiptId).toBe('RCT-001');
      expect(receipt.type).toBe('sale');
      expect(receipt.format).toBe('thermal');
      expect(receipt.content.header.storeName).toBe('Test Store');
      expect(receipt.content.body.items).toHaveLength(1);
    });

    it('should support all receipt types', () => {
      const types: ReceiptType[] = ['sale', 'refund', 'void', 'gift_receipt', 'exchange', 'quote', 'layby'];
      
      for (const type of types) {
        const receipt = createValidReceipt({ type });
        expect(receipt.type).toBe(type);
      }
    });

    it('should support all receipt formats', () => {
      const formats: ReceiptFormat[] = ['thermal', 'a4', 'email', 'sms', 'digital'];
      
      for (const format of formats) {
        const receipt = createValidReceipt({ format });
        expect(receipt.format).toBe(format);
      }
    });

    it('should handle voided items', () => {
      const receipt = createValidReceipt({
        content: {
          ...createValidReceipt().content,
          body: {
            ...createValidReceipt().content.body,
            items: [
              createValidReceiptItem({ lineNumber: 1, isVoided: false }),
              createValidReceiptItem({ lineNumber: 2, isVoided: true })
            ]
          }
        }
      });
      
      expect(receipt.content.body.items[0].isVoided).toBe(false);
      expect(receipt.content.body.items[1].isVoided).toBe(true);
    });

    it('should handle discounts', () => {
      const receipt = createValidReceipt({
        content: {
          ...createValidReceipt().content,
          body: {
            ...createValidReceipt().content.body,
            discounts: [
              { description: 'Loyalty Discount', amount: 5.00, type: 'loyalty' },
              { description: 'Promo Discount', amount: 2.00, type: 'promotion' }
            ]
          }
        }
      });
      
      expect(receipt.content.body.discounts).toHaveLength(2);
      expect(receipt.content.body.discounts[0].type).toBe('loyalty');
    });

    it('should handle multiple taxes', () => {
      const receipt = createValidReceipt({
        content: {
          ...createValidReceipt().content,
          body: {
            ...createValidReceipt().content.body,
            taxes: [
              { name: 'State Tax', rate: 6.0, amount: 2.40 },
              { name: 'City Tax', rate: 2.5, amount: 1.00 }
            ]
          }
        }
      });
      
      expect(receipt.content.body.taxes).toHaveLength(2);
    });

    it('should handle reprint flag', () => {
      const receipt = createValidReceipt({ isReprint: true, originalReceiptId: 'RCT-000' });
      expect(receipt.isReprint).toBe(true);
      expect(receipt.originalReceiptId).toBe('RCT-000');
    });
  });

  describe('ReceiptPrintOptions', () => {
    it('should create valid print options', () => {
      const options: ReceiptPrintOptions = {
        format: 'thermal',
        copies: 2,
        includeLogo: true,
        includeQRCode: true,
        language: 'en'
      };
      
      expect(options.format).toBe('thermal');
      expect(options.copies).toBe(2);
      expect(options.includeLogo).toBe(true);
      expect(options.includeQRCode).toBe(true);
      expect(options.language).toBe('en');
    });
  });
});