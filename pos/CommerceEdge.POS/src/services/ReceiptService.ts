import { Receipt, ReceiptType, ReceiptFormat, ReceiptPrintOptions, ReceiptContent } from '../models/Receipt';
import { Order, Payment } from '../models/Order';
import { Customer } from '../models/Customer';
import { Shift } from '../models/Shift';
import { Employee } from '../models/Employee';
import { Register } from '../models/Register';

export interface PrintJob {
  jobId: string;
  receipt: Receipt;
  options: ReceiptPrintOptions;
  status: 'pending' | 'printing' | 'completed' | 'failed';
  attempts: number;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface PrinterConfig {
  printerId: string;
  name: string;
  type: 'thermal' | 'inkjet' | 'laser';
  connection: 'usb' | 'network' | 'bluetooth' | 'serial';
  ipAddress?: string;
  port?: number;
  paperWidth: 58 | 80;
  enabled: boolean;
}

export class ReceiptService {
  private printers: Map<string, PrinterConfig> = new Map();
  private printQueue: PrintJob[] = [];
  private jobCounter: number = 0;
  private isProcessing: boolean = false;
  private defaultPrinterId?: string;

  constructor() {
    this.registerDefaultPrinters();
  }

  private registerDefaultPrinters(): void {
    this.registerPrinter({
      printerId: 'default-thermal',
      name: 'Default Thermal Printer',
      type: 'thermal',
      connection: 'usb',
      paperWidth: 80,
      enabled: true
    });
  }

  registerPrinter(config: PrinterConfig): void {
    this.printers.set(config.printerId, config);
    if (!this.defaultPrinterId) {
      this.defaultPrinterId = config.printerId;
    }
  }

  unregisterPrinter(printerId: string): boolean {
    const deleted = this.printers.delete(printerId);
    if (this.defaultPrinterId === printerId) {
      this.defaultPrinterId = this.printers.keys().next().value;
    }
    return deleted;
  }

  setDefaultPrinter(printerId: string): boolean {
    if (this.printers.has(printerId)) {
      this.defaultPrinterId = printerId;
      return true;
    }
    return false;
  }

  getPrinters(): PrinterConfig[] {
    return Array.from(this.printers.values());
  }

  getDefaultPrinter(): PrinterConfig | undefined {
    return this.defaultPrinterId ? this.printers.get(this.defaultPrinterId) : undefined;
  }

  async printReceipt(
    order: Order,
    payments: Payment[],
    type: ReceiptType = 'sale',
    options: Partial<ReceiptPrintOptions> = {},
    customer?: Customer,
    shift?: Shift,
    operator?: Employee,
    register?: Register
  ): Promise<Receipt> {
    const receipt = this.generateReceipt(order, payments, type, customer, shift, operator, register);
    const printOptions: ReceiptPrintOptions = {
      format: 'thermal',
      copies: 1,
      includeLogo: true,
      includeQRCode: false,
      ...options
    };

    const job = await this.queuePrintJob(receipt, printOptions);
    await this.processPrintJob(job);

    return receipt;
  }

  async reprintReceipt(receipt: Receipt, options: Partial<ReceiptPrintOptions> = {}): Promise<void> {
    const printOptions: ReceiptPrintOptions = {
      format: receipt.format,
      copies: 1,
      includeLogo: true,
      includeQRCode: false,
      ...options
    };

    const job = await this.queuePrintJob({ ...receipt, isReprint: true }, printOptions);
    await this.processPrintJob(job);
  }

  private async queuePrintJob(receipt: Receipt, options: ReceiptPrintOptions): Promise<PrintJob> {
    this.jobCounter++;
    const job: PrintJob = {
      jobId: `PRINT-${this.jobCounter.toString().padStart(8, '0')}`,
      receipt,
      options,
      status: 'pending',
      attempts: 0,
      createdAt: new Date()
    };

    this.printQueue.push(job);
    return job;
  }

  private async processPrintJob(job: PrintJob): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      job.status = 'printing';
      job.attempts++;

      const printer = this.getDefaultPrinter();
      if (!printer) {
        throw new Error('No printer available');
      }

      await this.sendToPrinter(job.receipt, printer, job.options);
      
      job.status = 'completed';
      job.completedAt = new Date();
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';

      if (job.attempts < 3) {
        setTimeout(() => this.processPrintJob(job), 1000 * job.attempts);
      }
    } finally {
      this.isProcessing = false;
      this.processNextJob();
    }
  }

  private processNextJob(): void {
    const nextJob = this.printQueue.find(j => j.status === 'pending');
    if (nextJob) {
      this.processPrintJob(nextJob);
    }
  }

  private async sendToPrinter(receipt: Receipt, printer: PrinterConfig, options: ReceiptPrintOptions): Promise<void> {
    const content = this.formatReceipt(receipt, options);
    
    switch (printer.connection) {
      case 'network':
        await this.sendNetworkPrint(printer, content);
        break;
      case 'usb':
        await this.sendUSBPrint(printer, content);
        break;
      case 'bluetooth':
        await this.sendBluetoothPrint(printer, content);
        break;
      default:
        console.log('Printing to console (simulated):', content);
    }
  }

  private async sendNetworkPrint(printer: PrinterConfig, content: string): Promise<void> {
    // In a real implementation, this would send raw ESC/POS commands to the printer
    // For now, simulate network print
    console.log(`Sending to network printer ${printer.ipAddress}:${printer.port}`, content.substring(0, 100) + '...');
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async sendUSBPrint(printer: PrinterConfig, content: string): Promise<void> {
    // In a real implementation, this would use WebUSB or a native bridge
    console.log(`Sending to USB printer`, content.substring(0, 100) + '...');
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async sendBluetoothPrint(printer: PrinterConfig, content: string): Promise<void> {
    // In a real implementation, this would use Web Bluetooth API
    console.log(`Sending to Bluetooth printer`, content.substring(0, 100) + '...');
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private generateReceipt(
    order: Order,
    payments: Payment[],
    type: ReceiptType,
    customer?: Customer,
    shift?: Shift,
    operator?: Employee,
    register?: Register
  ): Receipt {
    const receiptId = `RCT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const receiptNumber = `${type.charAt(0).toUpperCase()}${Date.now().toString().slice(-8)}`;

    return {
      receiptId,
      receiptNumber,
      orderId: order.orderId,
      type,
      format: 'thermal',
      content: this.buildReceiptContent(order, payments, customer, shift, operator, register),
      printedAt: new Date(),
      printedBy: operator?.employeeId,
      printerId: this.defaultPrinterId,
      copyCount: 1,
      isReprint: false
    };
  }

  private buildReceiptContent(
    order: Order,
    payments: Payment[],
    customer?: Customer,
    shift?: Shift,
    operator?: Employee,
    register?: Register
  ): ReceiptContent {
    return {
      header: {
        storeName: 'CommerceEdge Store',
        storeAddress: '123 Commerce St, City, State 12345',
        storePhone: '+1 (555) 123-4567',
        vatNumber: 'VAT123456789',
        receiptNumber: `RCT-${order.orderId}`,
        date: new Date(),
        time: new Date().toLocaleTimeString(),
        registerId: register?.registerId || order.registerId,
        operatorId: operator?.employeeId || order.operatorId,
        operatorName: operator ? `${operator.firstName} ${operator.lastName}` : undefined,
        customerId: customer?.customerId,
        customerName: customer ? `${customer.firstName} ${customer.lastName}` : undefined,
        loyaltyTier: customer?.loyaltyTier,
        loyaltyPoints: customer?.loyaltyPoints
      },
      body: {
        items: order.items.map((item, index) => ({
          lineNumber: index + 1,
          productName: item.productName,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent,
          discountAmount: item.discountAmount,
          taxRate: item.taxRate,
          taxAmount: item.taxAmount,
          lineTotal: item.lineTotal,
          isVoided: item.isVoided
        })),
        subtotal: order.subtotal,
        discounts: order.discount > 0 ? [{
          description: 'Order Discount',
          amount: order.discount,
          type: 'order' as const
        }] : [],
        taxes: [{
          name: 'Sales Tax',
          rate: order.tax > 0 && order.subtotal > 0 ? (order.tax / (order.subtotal - order.discount)) * 100 : 0,
          amount: order.tax
        }],
        total: order.total,
        payments: payments.map(p => ({
          method: p.method,
          amount: p.amount,
          reference: p.reference,
          cardLastFour: p.cardDetails?.lastFourDigits,
          cardType: p.cardDetails?.cardType
        })),
        changeDue: Math.max(0, payments.reduce((sum, p) => sum + p.amount, 0) - order.total)
      },
      footer: {
        returnPolicy: 'Returns accepted within 30 days with receipt',
        loyaltyMessage: customer ? `You earned ${Math.floor(order.total * 10)} points!` : 'Join our loyalty program today!',
        surveyUrl: 'https://survey.commerceedge.com',
        thankYouMessage: 'Thank you for shopping with us!'
      }
    };
  }

  private formatReceipt(receipt: Receipt, options: ReceiptPrintOptions): string {
    const { header, body, footer } = receipt.content;
    const width = options.format === 'thermal' ? 32 : 80;
    const lines: string[] = [];

    const center = (text: string) => text.padStart((width + text.length) / 2).padEnd(width);
    const right = (text: string) => text.padStart(width);
    const leftRight = (left: string, right: string) => left + ' '.repeat(width - left.length - right.length) + right;

    lines.push(center(header.storeName));
    if (header.storeAddress) lines.push(center(header.storeAddress));
    if (header.storePhone) lines.push(center(header.storePhone));
    if (header.vatNumber) lines.push(center(`VAT: ${header.vatNumber}`));
    lines.push('-'.repeat(width));
    lines.push(center(`${receipt.type.toUpperCase()} RECEIPT`));
    lines.push(center(`#${receipt.receiptNumber}`));
    lines.push(leftRight(`Date: ${header.date.toLocaleDateString()}`, `Time: ${header.time}`));
    lines.push(leftRight(`Register: ${header.registerId}`, `Cashier: ${header.operatorName || header.operatorId}`));
    if (header.customerName) lines.push(leftRight(`Customer: ${header.customerName}`, `Tier: ${header.loyaltyTier || 'N/A'}`));
    lines.push('='.repeat(width));

    lines.push(leftRight('ITEM', 'TOTAL'));
    for (const item of body.items) {
      const name = item.productName.length > width - 10 ? item.productName.substring(0, width - 13) + '...' : item.productName;
      lines.push(`  ${name}`);
      const qtyPrice = `${item.quantity} x ${item.unitPrice.toFixed(2)}`;
      const lineTotal = item.lineTotal.toFixed(2);
      lines.push(leftRight(`    ${qtyPrice}`, lineTotal));
      if (item.discountAmount > 0) {
        lines.push(leftRight(`    Discount: ${item.discountPercent}%`, `-${item.discountAmount.toFixed(2)}`));
      }
      if (item.taxAmount > 0) {
        lines.push(leftRight(`    Tax: ${item.taxRate}%`, `${item.taxAmount.toFixed(2)}`));
      }
    }

    lines.push('-'.repeat(width));
    lines.push(leftRight('Subtotal', body.subtotal.toFixed(2)));
    for (const discount of body.discounts) {
      lines.push(leftRight(`Discount (${discount.type})`, `-${discount.amount.toFixed(2)}`));
    }
    for (const tax of body.taxes) {
      lines.push(leftRight(`${tax.name} (${tax.rate.toFixed(2)}%)`, tax.amount.toFixed(2)));
    }
    lines.push('='.repeat(width));
    lines.push(leftRight('TOTAL', body.total.toFixed(2)));
    lines.push('='.repeat(width));

    for (const payment of body.payments) {
      const methodLabel = payment.method.charAt(0).toUpperCase() + payment.method.slice(1).replace('_', ' ');
      const cardInfo = payment.cardLastFour ? ` (${payment.cardType?.toUpperCase()} ****${payment.cardLastFour})` : '';
      lines.push(leftRight(methodLabel + cardInfo, payment.amount.toFixed(2)));
    }
    if (body.changeDue > 0) {
      lines.push(leftRight('Change Due', body.changeDue.toFixed(2)));
    }

    lines.push('-'.repeat(width));
    if (footer.returnPolicy) lines.push(center(footer.returnPolicy));
    if (footer.loyaltyMessage) lines.push(center(footer.loyaltyMessage));
    if (footer.surveyUrl) lines.push(center(`Survey: ${footer.surveyUrl}`));
    lines.push('');
    lines.push(center(footer.thankYouMessage));
    lines.push('');
    lines.push('\n\n\n'); // Cut paper

    return lines.join('\n');
  }

  getPrintQueue(): PrintJob[] {
    return [...this.printQueue];
  }

  getJob(jobId: string): PrintJob | undefined {
    return this.printQueue.find(j => j.jobId === jobId);
  }

  clearCompletedJobs(): number {
    const initialLength = this.printQueue.length;
    this.printQueue = this.printQueue.filter(j => j.status !== 'completed');
    return initialLength - this.printQueue.length;
  }
}