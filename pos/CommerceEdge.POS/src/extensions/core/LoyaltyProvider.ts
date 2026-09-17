import { LoyaltyProviderExtension } from '../BuiltInExtensions';

export const LoyaltyProvider: LoyaltyProviderExtension = {
  async getCustomerBalance(customerId: string): Promise<{ points: number; tier: string }> {
    return { points: 1000, tier: 'silver' };
  },
  async addPoints(customerId: string, points: number, reason: string): Promise<void> {
    // Implementation would update customer loyalty points
  },
  async redeemPoints(customerId: string, points: number): Promise<number> {
    return points;
  },
  getRewards(): Array<{ id: string; name: string; pointsCost: number; description: string }> {
    return [
      { id: 'reward1', name: '$5 Off', pointsCost: 500, description: 'Get $5 off your next purchase' },
      { id: 'reward2', name: 'Free Coffee', pointsCost: 300, description: 'Free coffee with any purchase' },
      { id: 'reward3', name: '10% Off', pointsCost: 1000, description: '10% off entire purchase' }
    ];
  }
};

export default LoyaltyProvider;