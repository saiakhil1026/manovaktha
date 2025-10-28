class ErrorHandler {
  private static instance: ErrorHandler;
  private errorQueue: Array<{ error: Error; context: string; timestamp: number }> = [];
  private isOnline: boolean = navigator.onLine;
  private retryQueue: Array<{ fn: Function; context: string; maxRetries: number; currentRetries: number }> = [];

  constructor() {
    if (ErrorHandler.instance) {
      return ErrorHandler.instance;
    }

    ErrorHandler.instance = this;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Back online - processing retry queue');
      this.processRetryQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📵 Gone offline - will queue operations');
    });

    // Global error handler
    window.addEventListener('error', (event) => {
      this.logError(new Error(event.message), 'Global Error Handler', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.logError(new Error(event.reason), 'Unhandled Promise Rejection');
    });
  }

  public logError(error: Error, context: string, additionalInfo?: any): void {
    const errorInfo = {
      error,
      context,
      timestamp: Date.now(),
      additionalInfo,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error(`❌ [${context}]`, error, additionalInfo);
    
    this.errorQueue.push({
      error,
      context,
      timestamp: Date.now()
    });

    // Keep only last 50 errors
    if (this.errorQueue.length > 50) {
      this.errorQueue = this.errorQueue.slice(-50);
    }
  }

  public async handleApiError(error: any, context: string): Promise<void> {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.error || error.message;
      
      switch (status) {
        case 401:
          console.warn('🔒 Authentication required - redirecting to login');
          // Clear auth token and redirect
          localStorage.removeItem('authToken');
          window.location.href = '/auth';
          break;
        case 403:
          console.warn('🚫 Access forbidden');
          this.showUserError('Access denied. Please check your permissions.');
          break;
        case 404:
          console.warn('🔍 Resource not found');
          this.showUserError('The requested resource was not found.');
          break;
        case 429:
          console.warn('⏱️ Rate limit exceeded');
          this.showUserError('Too many requests. Please try again in a moment.');
          break;
        case 500:
          console.error('🔥 Server error');
          this.showUserError('Server error. Please try again later.');
          break;
        default:
          this.showUserError(message || 'An unexpected error occurred.');
      }
      
      this.logError(new Error(`API Error ${status}: ${message}`), context);
    } else if (error.request) {
      // Network error
      console.warn('🌐 Network error detected');
      if (!this.isOnline) {
        this.showUserError('You are offline. Changes will be saved when you reconnect.');
      } else {
        this.showUserError('Network error. Please check your connection and try again.');
      }
      this.logError(new Error('Network Error'), context);
    } else {
      // Other error
      this.logError(error, context);
      this.showUserError('An unexpected error occurred.');
    }
  }

  public addToRetryQueue(fn: Function, context: string, maxRetries: number = 3): void {
    this.retryQueue.push({
      fn,
      context,
      maxRetries,
      currentRetries: 0
    });
  }

  private async processRetryQueue(): Promise<void> {
    if (!this.isOnline || this.retryQueue.length === 0) {
      return;
    }

    const queue = [...this.retryQueue];
    this.retryQueue = [];

    for (const item of queue) {
      try {
        await item.fn();
        console.log(`✅ Retry successful for ${item.context}`);
      } catch (error) {
        item.currentRetries++;
        
        if (item.currentRetries < item.maxRetries) {
          console.log(`⏭️ Retry ${item.currentRetries}/${item.maxRetries} failed for ${item.context}, will retry`);
          this.retryQueue.push(item);
        } else {
          console.error(`💀 Max retries reached for ${item.context}`);
          this.logError(error as Error, `Max Retries - ${item.context}`);
        }
      }
    }
  }

  private showUserError(message: string): void {
    // Create a temporary toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-sm';
    toast.innerHTML = `
      <div class=\"flex items-center\">
        <span class=\"mr-2\">⚠️</span>
        <span>${message}</span>
        <button class=\"ml-3 text-white hover:text-red-200\" onclick=\"this.parentElement.parentElement.remove()\">✕</button>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 5000);
  }

  public getErrorStats(): { total: number; recent: number; isOnline: boolean } {
    const recentErrors = this.errorQueue.filter(e => Date.now() - e.timestamp < 60000).length;
    return {
      total: this.errorQueue.length,
      recent: recentErrors,
      isOnline: this.isOnline
    };
  }

  public clearErrors(): void {
    this.errorQueue = [];
  }
}

export const errorHandler = new ErrorHandler();