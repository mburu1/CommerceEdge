import { DiscountEngineExtension } from '../BuiltInExtensions';

export const DiscountEngine: DiscountEngineExtension = {
  calculateDiscounts(
    items: Array<{ price: number; quantity: number; discounts?: Array<{ type: string; value: number }> }>,
    customerId?: string
  ): Array<{ type: string; amount: number; description: string }> {
    const discounts: Array<{ type: string; amount: number; description: string }> = [];
    
    for (const item of items) {
      if (item.discounts) {
        for (const discount of item.discounts) {
          if (discount.type === 'percentage') {
            discounts.push({
              type: 'percentage',
              amount: item.price * item.quantity * (discount.value / 100),
              description: `${discount.value}% discount`
            });
          } else if (discount.type === 'fixed') {
            discounts.push({
              type: 'fixed',
              amount: discount.value,
              description: `Fixed discount: ${discount.value}`
            });
          }
        }
      }
    }
    
    return discounts;
  },
  getAvailableDiscounts(customerId?: string): Array<{ id: string; name: string; type: string; value: number }> {
    return [
      { id: 'senior', name: 'Senior Discount', type: 'percentage', value: 10 },
      { id: 'student', name: 'Student Discount', type: 'percentage', value: 15 },
      { id: 'loyalty', name: 'Loyalty Discount', type: 'percentage', value: 5 }
    ];
  }
};

export default DiscountEngine;