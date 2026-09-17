import { ReceiptGeneratorExtension } from '../BuiltInExtensions';

export const ReceiptGenerator: ReceiptGeneratorExtension = {
  generateReceipt(order: any, payments: any[], options: any): string {
    let receipt = `=== RECEIPT ===\n`;
    receipt += `Order: ${order.orderId}\n`;
    receipt += `Date: ${new Date().toLocaleString()}\n`;
    receipt += `------------------------\n`;
    
    for (const item of order.items || []) {
      receipt += `${item.productName} x${item.quantity} @ $${item.unitPrice.toFixed(2)} = $${item.lineTotal.toFixed(2)}\n`;
    }
    
    receipt += `------------------------\n`;
    receipt += `Subtotal: $${order.subtotal.toFixed(2)}\n`;
    receipt += `Tax: $${order.tax.toFixed(2)}\n`;
    receipt += `Total: $${order.total.toFixed(2)}\n`;
    receipt += `------------------------\n`;
    
    for (const payment of payments) {
      receipt += `${payment.method}: $${payment.amount.toFixed(2)}\n`;
    }
    
    receipt += `=== THANK YOU ===\n`;
    return receipt;
  },
  getSupportedFormats(): string[] {
    return ['text', 'thermal', 'a4'];
  }
};

export default ReceiptGenerator;