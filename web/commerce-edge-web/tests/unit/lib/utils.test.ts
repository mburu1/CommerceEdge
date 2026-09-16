import { formatMoney } from '@/lib/utils';

describe('formatMoney', () => {
  it('formats USD amounts correctly', () => {
    expect(formatMoney(1234.56, 'USD')).toBe('$1,234.56');
  });

  it('formats zero correctly', () => {
    expect(formatMoney(0, 'USD')).toBe('$0.00');
  });

  it('formats negative amounts correctly', () => {
    expect(formatMoney(-50, 'USD')).toBe('-$50.00');
  });

  it('formats EUR amounts correctly', () => {
    const result = formatMoney(1234.56, 'EUR');
    expect(result).toContain('1,234.56');
    expect(result).toContain('€');
  });

  it('formats large amounts with proper separators', () => {
    expect(formatMoney(1000000, 'USD')).toBe('$1,000,000.00');
  });

  it('formats small fractional amounts', () => {
    expect(formatMoney(0.01, 'USD')).toBe('$0.01');
  });
});
