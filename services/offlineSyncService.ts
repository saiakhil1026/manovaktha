import { errorHandler } from './errorHandler';
import { authService } from './authService';

interface OfflineOperation {
  id: string;
  type: 'manuscript' | 'savedSolution' | 'journeyPlan' | 'chatSession';
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  userId?: string;
}

class OfflineSyncService {
  private static instance: OfflineSyncService;
  private operationQueue: OfflineOperation[] = [];
  private syncInProgress: boolean = false;
  private readonly STORAGE_KEY = 'offline_operations';

  constructor() {
    if (OfflineSyncService.instance) {
      return OfflineSyncService.instance;
    }

    OfflineSyncService.instance = this;
    this.loadOperationsFromStorage();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      console.log('🔄 Back online - starting sync process');
      this.syncOfflineOperations();
    });
  }

  private loadOperationsFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.operationQueue = JSON.parse(stored);
        console.log(`📂 Loaded ${this.operationQueue.length} offline operations`);
      }
    } catch (error) {
      console.error('Failed to load offline operations:', error);
      this.operationQueue = [];
    }
  }

  private saveOperationsToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.operationQueue));
    } catch (error) {
      console.error('Failed to save offline operations:', error);
    }
  }

  public queueOperation(operation: Omit<OfflineOperation, 'id' | 'timestamp'>): void {
    const id = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const offlineOperation: OfflineOperation = {
      ...operation,
      id,
      timestamp: Date.now()
    };

    this.operationQueue.push(offlineOperation);
    this.saveOperationsToStorage();
    
    console.log(`📝 Queued offline operation: ${operation.type} ${operation.operation}`);
  }

  public async syncOfflineOperations(): Promise<void> {
    if (this.syncInProgress || this.operationQueue.length === 0 || !navigator.onLine) {
      return;
    }

    if (!authService.isAuthenticated()) {
      console.log('👤 User not authenticated - skipping offline sync');
      return;
    }

    this.syncInProgress = true;
    console.log(`🔄 Starting sync of ${this.operationQueue.length} operations`);

    const operations = [...this.operationQueue];
    const successfulOps: string[] = [];

    for (const operation of operations) {
      try {
        await this.syncSingleOperation(operation);
        successfulOps.push(operation.id);
        console.log(`✅ Synced: ${operation.type} ${operation.operation}`);
      } catch (error) {
        console.error(`❌ Failed to sync: ${operation.type} ${operation.operation}`, error);
        errorHandler.logError(error as Error, `Offline Sync - ${operation.type}`);
      }
    }

    // Remove successful operations from queue
    this.operationQueue = this.operationQueue.filter(op => !successfulOps.includes(op.id));
    this.saveOperationsToStorage();

    console.log(`🎉 Sync completed. ${successfulOps.length} successful, ${this.operationQueue.length} remaining`);
    this.syncInProgress = false;

    // Show user notification if there were successful syncs
    if (successfulOps.length > 0) {
      this.showSyncNotification(`Synced ${successfulOps.length} offline changes`);
    }
  }

  private async syncSingleOperation(operation: OfflineOperation): Promise<void> {
    const { manuscriptService, savedSolutionsService, journeyService, chatService } = await import('./index');

    switch (operation.type) {
      case 'manuscript':
        if (operation.operation === 'create') {
          await manuscriptService.saveHistory(
            operation.data.problem,
            operation.data.solutions,
            operation.data.language,
            operation.data.tags || []
          );
        }
        break;

      case 'savedSolution':
        if (operation.operation === 'create') {
          await savedSolutionsService.saveSolution(
            operation.data.solution,
            operation.data.originalProblem,
            operation.data.notes || '',
            operation.data.tags || []
          );
        } else if (operation.operation === 'delete') {
          await savedSolutionsService.deleteSavedSolution(operation.data.id);
        }
        break;

      case 'journeyPlan':
        if (operation.operation === 'create') {
          await journeyService.createJourneyPlan(
            operation.data.title,
            operation.data.originalProblem,
            operation.data.days,
            operation.data.language
          );
        } else if (operation.operation === 'update') {
          if (operation.data.dayComplete) {
            await journeyService.markDayComplete(
              operation.data.id,
              operation.data.dayNumber,
              operation.data.notes
            );
          }
        }
        break;

      case 'chatSession':
        if (operation.operation === 'create') {
          await chatService.createChatSession(
            operation.data.sessionType,
            operation.data.title,
            operation.data.language,
            operation.data.metadata
          );
        }
        break;

      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  private showSyncNotification(message: string): void {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-sm';
    toast.innerHTML = `
      <div class=\"flex items-center\">
        <span class=\"mr-2\">🔄</span>
        <span>${message}</span>
        <button class=\"ml-3 text-white hover:text-green-200\" onclick=\"this.parentElement.parentElement.remove()\">✕</button>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 4000);
  }

  public getQueueStats(): { total: number; pending: number; types: Record<string, number> } {
    const types: Record<string, number> = {};
    
    this.operationQueue.forEach(op => {
      types[op.type] = (types[op.type] || 0) + 1;
    });

    return {
      total: this.operationQueue.length,
      pending: this.operationQueue.length,
      types
    };
  }

  public clearQueue(): void {
    this.operationQueue = [];
    this.saveOperationsToStorage();
    console.log('🗑️ Offline operation queue cleared');
  }

  public getOperations(): OfflineOperation[] {
    return [...this.operationQueue];
  }

  // Utility method to check if we should use offline mode
  public shouldUseOfflineMode(): boolean {
    return !navigator.onLine || !authService.isAuthenticated();
  }
}

export const offlineSyncService = new OfflineSyncService();