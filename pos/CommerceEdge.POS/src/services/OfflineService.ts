export interface OfflineAction {
  actionId: string;
  type: string;
  payload: unknown;
  timestamp: Date;
  retries: number;
  maxRetries: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  error?: string;
}

export interface SyncResult {
  synced: number;
  failed: number;
  errors: Array<{ actionId: string; error: string }>;
}

export interface OfflineConfig {
  maxQueueSize: number;
  retryInterval: number;
  maxRetries: number;
  syncOnOnline: boolean;
  persistToStorage: boolean;
  storageKey: string;
}

export class OfflineService {
  private queue: OfflineAction[] = [];
  private config: Required<OfflineConfig>;
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private syncTimer: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<(online: boolean) => void> = new Set();
  private actionCounter: number = 0;

  constructor(config: Partial<OfflineConfig> = {}) {
    this.config = {
      maxQueueSize: config.maxQueueSize ?? 1000,
      retryInterval: config.retryInterval ?? 30000,
      maxRetries: config.maxRetries ?? 5,
      syncOnOnline: config.syncOnOnline ?? true,
      persistToStorage: config.persistToStorage ?? true,
      storageKey: config.storageKey ?? 'pos_offline_queue'
    };

    this.loadFromStorage();
    this.setupNetworkListeners();
    this.startSyncTimer();
  }

  private setupNetworkListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
    }
  }

  private handleOnline(): void {
    this.isOnline = true;
    this.notifyListeners(true);
    if (this.config.syncOnOnline) {
      this.sync();
    }
  }

  private handleOffline(): void {
    this.isOnline = false;
    this.notifyListeners(false);
  }

  isOnlineStatus(): boolean {
    return this.isOnline;
  }

  subscribe(listener: (online: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(online: boolean): void {
    for (const listener of this.listeners) {
      listener(online);
    }
  }

  enqueue(type: string, payload: unknown): OfflineAction {
    if (this.queue.length >= this.config.maxQueueSize) {
      this.queue.shift();
    }

    this.actionCounter++;
    const action: OfflineAction = {
      actionId: `ACTION-${this.actionCounter.toString().padStart(8, '0')}`,
      type,
      payload,
      timestamp: new Date(),
      retries: 0,
      maxRetries: this.config.maxRetries,
      status: 'pending'
    };

    this.queue.push(action);
    this.persistToStorage();

    if (this.isOnline) {
      this.processAction(action);
    }

    return action;
  }

  private async processAction(action: OfflineAction): Promise<void> {
    action.status = 'syncing';
    this.persistToStorage();

    try {
      await this.executeAction(action);
      action.status = 'completed';
      this.removeAction(action.actionId);
    } catch (error) {
      action.retries++;
      action.error = error instanceof Error ? error.message : 'Unknown error';
      
      if (action.retries >= action.maxRetries) {
        action.status = 'failed';
      } else {
        action.status = 'pending';
      }
    }

    this.persistToStorage();
  }

  protected async executeAction(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case 'SALE':
      case 'REFUND':
      case 'VOID':
      case 'CUSTOMER_CREATE':
      case 'CUSTOMER_UPDATE':
      case 'INVENTORY_ADJUSTMENT':
      case 'SHIFT_OPEN':
      case 'SHIFT_CLOSE':
      case 'SHIFT_RECONCILE':
        await this.sendToServer(action);
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  protected async sendToServer(action: OfflineAction): Promise<void> {
    const response = await fetch('/api/offline/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action)
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
  }

  async sync(): Promise<SyncResult> {
    if (!this.isOnline) {
      return { synced: 0, failed: 0, errors: [] };
    }

    const pendingActions = this.queue.filter(a => a.status === 'pending' || a.status === 'failed');
    let synced = 0;
    let failed = 0;
    const errors: Array<{ actionId: string; error: string }> = [];

    for (const action of pendingActions) {
      await this.processAction(action);
      
      if (action.status === 'completed') {
        synced++;
      } else if (action.status === 'failed') {
        failed++;
        errors.push({ actionId: action.actionId, error: action.error || 'Unknown error' });
      }
    }

    return { synced, failed, errors };
  }

  private removeAction(actionId: string): void {
    this.queue = this.queue.filter(a => a.actionId !== actionId);
  }

  getQueue(): OfflineAction[] {
    return [...this.queue];
  }

  getPendingCount(): number {
    return this.queue.filter(a => a.status === 'pending' || a.status === 'syncing').length;
  }

  getFailedCount(): number {
    return this.queue.filter(a => a.status === 'failed').length;
  }

  clearCompleted(): number {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(a => a.status !== 'completed');
    this.persistToStorage();
    return initialLength - this.queue.length;
  }

  clearFailed(): number {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(a => a.status !== 'failed');
    this.persistToStorage();
    return initialLength - this.queue.length;
  }

  retryFailed(): void {
    for (const action of this.queue) {
      if (action.status === 'failed') {
        action.status = 'pending';
        action.retries = 0;
        action.error = undefined;
      }
    }
    this.persistToStorage();
    
    if (this.isOnline) {
      this.sync();
    }
  }

  private persistToStorage(): void {
    if (!this.config.persistToStorage || typeof localStorage === 'undefined') return;
    
    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(this.queue));
    } catch {
      // Storage full or unavailable
    }
  }

  private loadFromStorage(): void {
    if (!this.config.persistToStorage || typeof localStorage === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        this.queue = JSON.parse(stored).map((a: any) => ({
          ...a,
          timestamp: new Date(a.timestamp)
        }));
      }
    } catch {
      this.queue = [];
    }
  }

  private startSyncTimer(): void {
    this.syncTimer = setInterval(() => {
      if (this.isOnline) {
        this.sync();
      }
    }, this.config.retryInterval);
  }

  destroy(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline.bind(this));
      window.removeEventListener('offline', this.handleOffline.bind(this));
    }
  }
}