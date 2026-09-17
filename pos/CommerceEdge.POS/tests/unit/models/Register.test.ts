import { Register, RegisterStatus, HardwareProfile, PaymentTerminalConfig, ReceiptPrinterConfig, CashDrawerConfig, BarcodeScannerConfig, CustomerDisplayConfig, ScaleConfig, PeripheralType, PaymentMethod, RegisterSearchCriteria, RegisterSearchResult } from '../../../src/models/Register';

describe('Register Model', () => {
  const createValidRegister = (overrides: Partial<Register> = {}): Register => ({
    registerId: 'REG-001',
    name: 'Register 1',
    description: 'Main register',
    storeId: 'STORE-001',
    deviceId: 'DEV-001',
    ipAddress: '192.168.1.100',
    macAddress: '00:11:22:33:44:55',
    status: 'online',
    isActive: true,
    hardwareProfile: {
      profileId: 'HW-001',
      name: 'Standard POS',
      description: 'Standard hardware profile',
      supportedPeripherals: ['receipt_printer', 'cash_drawer', 'barcode_scanner']
    },
    paymentTerminal: {
      terminalId: 'TERM-001',
      provider: 'adyen',
      connectionType: 'ethernet',
      ipAddress: '192.168.1.101',
      port: 8080,
      merchantId: 'MERCH-001',
      terminalSerialNumber: 'SN123456',
      supportedPaymentMethods: ['credit', 'debit', 'contactless'],
      isContactlessEnabled: true,
      isChipEnabled: true,
      isSwipeEnabled: true
    },
    receiptPrinter: {
      printerId: 'PRINT-001',
      model: 'Epson TM-T88VI',
      connectionType: 'usb',
      paperWidth: 80,
      printSpeed: 'high',
      density: 'medium',
      isDefault: true
    },
    cashDrawer: {
      drawerId: 'DRAWER-001',
      connectionType: 'printer_driven',
      hasLock: true,
      currency: 'USD'
    },
    barcodeScanner: {
      scannerId: 'SCANNER-001',
      model: 'Symbol LS2208',
      connectionType: 'usb',
      scanMode: 'trigger',
      symbologies: ['EAN13', 'UPC', 'Code128']
    },
    customerDisplay: {
      displayId: 'DISPLAY-001',
      model: 'Epson DM-D30',
      connectionType: 'serial',
      lines: 2,
      charactersPerLine: 20,
      brightness: 80
    },
    scale: {
      scaleId: 'SCALE-001',
      model: 'Mettler Toledo',
      connectionType: 'usb',
      capacity: 15,
      unit: 'kg',
      precision: 0.005,
      isLegalForTrade: true
    },
    lastHeartbeat: new Date(),
    lastSync: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  });

  describe('Register interface', () => {
    it('should create a valid register', () => {
      const register = createValidRegister();
      expect(register.registerId).toBe('REG-001');
      expect(register.name).toBe('Register 1');
      expect(register.storeId).toBe('STORE-001');
      expect(register.status).toBe('online');
      expect(register.isActive).toBe(true);
    });

    it('should support all register statuses', () => {
      const statuses: RegisterStatus[] = ['online', 'offline', 'maintenance', 'error', 'unconfigured'];
      
      for (const status of statuses) {
        const register = createValidRegister({ status });
        expect(register.status).toBe(status);
      }
    });

    it('should handle hardware profile', () => {
      const register = createValidRegister();
      expect(register.hardwareProfile.profileId).toBe('HW-001');
      expect(register.hardwareProfile.supportedPeripherals).toContain('receipt_printer');
    });

    it('should handle payment terminal config', () => {
      const register = createValidRegister();
      expect(register.paymentTerminal?.provider).toBe('adyen');
      expect(register.paymentTerminal?.isContactlessEnabled).toBe(true);
    });

    it('should handle all peripheral types', () => {
      const peripherals: PeripheralType[] = [
        'receipt_printer', 'cash_drawer', 'barcode_scanner', 
        'customer_display', 'payment_terminal', 'scale', 
        'signature_capture', 'pin_pad'
      ];
      
      const register = createValidRegister({
        hardwareProfile: {
          profileId: 'HW-002',
          name: 'Full Profile',
          supportedPeripherals: peripherals
        }
      });
      
      expect(register.hardwareProfile.supportedPeripherals).toHaveLength(8);
    });

    it('should support all payment methods', () => {
      const methods: PaymentMethod[] = ['credit', 'debit', 'contactless', 'mobile_wallet', 'gift_card', 'loyalty'];
      
      const register = createValidRegister({
        paymentTerminal: {
          ...createValidRegister().paymentTerminal!,
          supportedPaymentMethods: methods
        }
      });
      
      expect(register.paymentTerminal?.supportedPaymentMethods).toHaveLength(6);
    });

    it('should support all payment terminal providers', () => {
      const providers: PaymentTerminalConfig['provider'][] = ['adyen', 'verifone', 'ingenico', 'pax', 'square', 'stripe', 'custom'];
      
      for (const provider of providers) {
        const register = createValidRegister({
          paymentTerminal: {
            ...createValidRegister().paymentTerminal!,
            provider
          }
        });
        expect(register.paymentTerminal?.provider).toBe(provider);
      }
    });

    it('should support all connection types', () => {
      const types: PaymentTerminalConfig['connectionType'][] = ['usb', 'ethernet', 'bluetooth', 'wifi', 'serial'];
      
      for (const type of types) {
        const register = createValidRegister({
          paymentTerminal: {
            ...createValidRegister().paymentTerminal!,
            connectionType: type
          }
        });
        expect(register.paymentTerminal?.connectionType).toBe(type);
      }
    });
  });

  describe('ReceiptPrinterConfig', () => {
    it('should create valid printer config', () => {
      const config: ReceiptPrinterConfig = {
        printerId: 'PRINT-001',
        model: 'Epson TM-T88VI',
        connectionType: 'usb',
        paperWidth: 80,
        printSpeed: 'high',
        density: 'medium',
        isDefault: true
      };
      
      expect(config.paperWidth).toBe(80);
      expect(config.printSpeed).toBe('high');
      expect(config.isDefault).toBe(true);
    });

    it('should support both paper widths', () => {
      const widths: ReceiptPrinterConfig['paperWidth'][] = [58, 80];
      
      for (const width of widths) {
        const config: ReceiptPrinterConfig = {
          printerId: 'PRINT-001',
          model: 'Test',
          connectionType: 'usb',
          paperWidth: width,
          printSpeed: 'medium',
          density: 'medium',
          isDefault: false
        };
        expect(config.paperWidth).toBe(width);
      }
    });
  });

  describe('CashDrawerConfig', () => {
    it('should create valid cash drawer config', () => {
      const config: CashDrawerConfig = {
        drawerId: 'DRAWER-001',
        connectionType: 'printer_driven',
        hasLock: true,
        currency: 'USD'
      };
      
      expect(config.hasLock).toBe(true);
      expect(config.currency).toBe('USD');
    });
  });

  describe('RegisterSearchCriteria', () => {
    it('should create valid search criteria', () => {
      const criteria: RegisterSearchCriteria = {
        storeId: 'STORE-001',
        status: 'online',
        isActive: true,
        page: 1,
        pageSize: 20
      };
      
      expect(criteria.storeId).toBe('STORE-001');
      expect(criteria.status).toBe('online');
    });
  });

  describe('RegisterSearchResult', () => {
    it('should create valid search result', () => {
      const registers = [createValidRegister({ registerId: 'REG-001' })];
      const result: RegisterSearchResult = {
        registers,
        totalCount: 1,
        page: 1,
        pageSize: 20
      };
      
      expect(result.registers).toHaveLength(1);
      expect(result.totalCount).toBe(1);
    });
  });
});