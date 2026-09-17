import { TaxCalculatorExtension } from '../BuiltInExtensions';

export const TaxCalculator: TaxCalculatorExtension = {
  calculateTax(subtotal: number, items: Array<{ amount: number; taxRate: number; taxExempt?: boolean }>): number {
    return items
      .filter(item => !item.taxExempt)
      .reduce((sum, item) => sum + item.amount * (item.taxRate / 100), 0);
  },
  getTaxRates(): Map<string, number> {
    const rates = new Map<string, number>();
    rates.set('standard', 8.5);
    rates.set('reduced', 4.0);
    rates.set('zero', 0);
    return rates;
  },
  isTaxExempt(customerId?: string, productId?: string): boolean {
    return false;
  }
};

export default TaxCalculator;