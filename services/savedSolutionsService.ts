import { apiClient } from './apiClient';
import { type Solution } from '../types';

export interface SavedSolutionEntry {
  _id: string;
  userId: string;
  solution: Solution;
  originalProblem: string;
  notes: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavedSolutionsResponse {
  savedSolutions: SavedSolutionEntry[];
  pagination: {
    current: number;
    total: number;
    count: number;
  };
}

class SavedSolutionsService {
  async getSavedSolutions(page: number = 1, limit: number = 10, tags?: string[], isFavorite?: boolean): Promise<SavedSolutionsResponse> {
    const params: any = { page, limit };
    if (tags && tags.length > 0) {
      params.tags = tags.join(',');
    }
    if (isFavorite !== undefined) {
      params.isFavorite = isFavorite;
    }
    
    return apiClient.get<SavedSolutionsResponse>('/saved-solutions', params);
  }

  async saveSolution(solution: Solution, originalProblem: string, notes: string = '', tags: string[] = []): Promise<{ message: string; savedSolution: SavedSolutionEntry }> {
    return apiClient.post<{ message: string; savedSolution: SavedSolutionEntry }>('/saved-solutions', {
      solution,
      originalProblem,
      notes,
      tags
    });
  }

  async getSavedSolution(id: string): Promise<{ savedSolution: SavedSolutionEntry }> {
    return apiClient.get<{ savedSolution: SavedSolutionEntry }>(`/saved-solutions/${id}`);
  }

  async updateSavedSolution(id: string, updates: { notes?: string; tags?: string[]; isFavorite?: boolean }): Promise<{ message: string; savedSolution: SavedSolutionEntry }> {
    return apiClient.put<{ message: string; savedSolution: SavedSolutionEntry }>(`/saved-solutions/${id}`, updates);
  }

  async deleteSavedSolution(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/saved-solutions/${id}`);
  }

  async toggleFavorite(id: string): Promise<{ message: string; savedSolution: SavedSolutionEntry }> {
    return apiClient.patch<{ message: string; savedSolution: SavedSolutionEntry }>(`/saved-solutions/${id}/favorite`);
  }

  async isSolutionSaved(solution: Solution): Promise<boolean> {
    try {
      const response = await this.getSavedSolutions(1, 100);
      return response.savedSolutions.some(saved => 
        saved.solution.title === solution.title && 
        saved.solution.reference === solution.reference
      );
    } catch (error) {
      console.error('Error checking if solution is saved:', error);
      return false;
    }
  }

  // Migration helper for localStorage data
  async migrateFromLocalStorage(): Promise<void> {
    try {
      const localSolutions = localStorage.getItem('savedSolutions');
      if (!localSolutions) return;

      const solutionsData: Solution[] = JSON.parse(localSolutions);
      
      for (const solution of solutionsData) {
        try {
          await this.saveSolution(
            solution,
            'Migrated from local storage', // Default problem for migration
            '',
            []
          );
        } catch (error) {
          // Skip if already exists
          if (!error.response?.data?.error?.includes('already saved')) {
            throw error;
          }
        }
      }

      // Clear localStorage after successful migration
      localStorage.removeItem('savedSolutions');
      console.log('✅ Saved solutions migrated successfully');
    } catch (error) {
      console.error('❌ Failed to migrate saved solutions:', error);
      throw error;
    }
  }
}

export const savedSolutionsService = new SavedSolutionsService();