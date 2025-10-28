import { apiClient } from './apiClient';
import { type Solution } from '../types';

export interface ManuscriptHistoryEntry {
  _id: string;
  userId: string;
  problem: string;
  solutions: Solution[];
  language: 'English' | 'Hindi' | 'Telugu';
  tags: string[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  pagination: {
    current: number;
    total: number;
    count: number;
  };
}

export interface ManuscriptHistoryResponse extends PaginatedResponse<ManuscriptHistoryEntry> {
  history: ManuscriptHistoryEntry[];
}

class ManuscriptService {
  async getHistory(page: number = 1, limit: number = 10, tags?: string[]): Promise<ManuscriptHistoryResponse> {
    const params: any = { page, limit };
    if (tags && tags.length > 0) {
      params.tags = tags.join(',');
    }
    
    return apiClient.get<ManuscriptHistoryResponse>('/manuscript', params);
  }

  async saveHistory(problem: string, solutions: Solution[], language: 'English' | 'Hindi' | 'Telugu', tags: string[] = []): Promise<{ message: string; entry: ManuscriptHistoryEntry }> {
    return apiClient.post<{ message: string; entry: ManuscriptHistoryEntry }>('/manuscript', {
      problem,
      solutions,
      language,
      tags
    });
  }

  async getEntry(id: string): Promise<{ entry: ManuscriptHistoryEntry }> {
    return apiClient.get<{ entry: ManuscriptHistoryEntry }>(`/manuscript/${id}`);
  }

  async deleteEntry(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/manuscript/${id}`);
  }

  async archiveEntry(id: string): Promise<{ message: string; entry: ManuscriptHistoryEntry }> {
    return apiClient.put<{ message: string; entry: ManuscriptHistoryEntry }>(`/manuscript/${id}/archive`);
  }

  async clearHistory(): Promise<{ message: string; deletedCount: number }> {
    return apiClient.delete<{ message: string; deletedCount: number }>('/manuscript');
  }

  // Migration helper for localStorage data
  async migrateFromLocalStorage(): Promise<void> {
    try {
      const localHistory = localStorage.getItem('manuscriptHistory');
      if (!localHistory) return;

      const historyData: any[] = JSON.parse(localHistory);
      
      for (const item of historyData) {
        await this.saveHistory(
          item.problem,
          item.solutions,
          'English', // Default language for migration
          []
        );
      }

      // Clear localStorage after successful migration
      localStorage.removeItem('manuscriptHistory');
      console.log('✅ Manuscript history migrated successfully');
    } catch (error) {
      console.error('❌ Failed to migrate manuscript history:', error);
      throw error;
    }
  }
}

export const manuscriptService = new ManuscriptService();