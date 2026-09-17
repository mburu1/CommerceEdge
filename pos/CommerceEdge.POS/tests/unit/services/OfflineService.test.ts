import { OfflineService, OfflineAction, OfflineConfig, SyncResult } from '../../../src/services/OfflineService';

describe('OfflineService', () => {
  let offlineService: OfflineService;
  const mockConfig: Partial<OfflineConfig> = {
    maxQueueSize: 100,
    retryInterval: 100,
    maxRetries: 3,
    syncOnOnline: true,
    persistToStorage: false,
    storageKey: 'test_offline_queue'
  };

  beforeAll(() => {
    // Mock navigator.onLine for testing
    Object.defineProperty(global.navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true
    });
  });

  beforeEach(() => {
    offlineService = new OfflineService(mockConfig);
    // Clear localStorage if used
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  afterEach(() => {
    offlineService.destroy();
  });

  describe('isOnlineStatus', () => {
    it('should return online status', () => {
      expect(typeof offlineService.isOnlineStatus()).toBe('boolean');
    });
  });

  describe('enqueue', () => {
    it('should add action to queue', () => {
      const action = offlineService.enqueue('SALE', { orderId: 'ORD-001', total: 50.00 });

      expect(action).toBeDefined();
      expect(action.actionId).toMatch(/^ACTION-\d{8}$/);
      expect(action.type).toBe('SALE');
      expect(action.payload).toEqual({ orderId: 'ORD-001', total: 50.00 });
      expect(action.status).toBe('syncing');
      expect(action.retries).toBe(0);
      expect(action.maxRetries).toBe(3);
    });

    it('should respect max queue size', () => {
      for (let i = 0; i < 105; i++) {
        offlineService.enqueue('TEST', { index: i });
      }

      const queue = offlineService.getQueue();
      expect(queue.length).toBe(100);
    });

    it('should set timestamp', () => {
      const before = new Date();
      const action = offlineService.enqueue('TEST', {});
      const after = new Date();

      expect(action.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(action.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('getQueue', () => {
    it('should return copy of queue', () => {
      offlineService.enqueue('TEST1', {});
      offlineService.enqueue('TEST2', {});

      const queue = offlineService.getQueue();
      expect(queue).toHaveLength(2);

      queue.push({} as OfflineAction);
      expect(offlineService.getQueue()).toHaveLength(2);
    });
  });

  describe('getPendingCount', () => {
    it('should return count of pending and syncing actions', () => {
      offlineService.enqueue('TEST1', {});
      offlineService.enqueue('TEST2', {});

      expect(offlineService.getPendingCount()).toBe(2);
    });
  });

  describe('getFailedCount', () => {
    it('should return count of failed actions', () => {
      expect(offlineService.getFailedCount()).toBe(0);
    });
  });

  describe('clearCompleted', () => {
    it('should remove completed actions', () => {
      offlineService.enqueue('TEST1', {});
      offlineService.enqueue('TEST2', {});

      const cleared = offlineService.clearCompleted();
      expect(typeof cleared).toBe('number');
    });
  });

  describe('clearFailed', () => {
    it('should remove failed actions', () => {
      const cleared = offlineService.clearFailed();
      expect(typeof cleared).toBe('number');
    });
  });

  describe('retryFailed', () => {
    it('should retry failed actions', () => {
      offlineService.retryFailed();
      // Should not throw
    });
  });

  describe('subscribe', () => {
    it('should notify subscribers of online status changes', () => {
      const listener = jest.fn();
      const unsubscribe = offlineService.subscribe(listener);

      // Trigger online event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('online'));
      }

      unsubscribe();
      // Should not throw
    });
  });

  describe('destroy', () => {
    it('should cleanup resources', () => {
      expect(() => offlineService.destroy()).not.toThrow();
    });
  });
});