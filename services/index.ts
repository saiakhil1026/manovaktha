import { apiClient } from './apiClient';
import { authService, type User, type AuthResponse } from './authService';
import { manuscriptService, type ManuscriptHistoryEntry, type ManuscriptHistoryResponse } from './manuscriptService';
import { savedSolutionsService, type SavedSolutionEntry, type SavedSolutionsResponse } from './savedSolutionsService';
import { journeyService, type JourneyPlanEntry, type JourneyPlansResponse } from './journeyService';
import { chatService, type ChatSessionEntry, type ChatSessionsResponse } from './chatService';
import { errorHandler } from './errorHandler';
import { offlineSyncService } from './offlineSyncService';

// Database service exports
export { apiClient };
export { authService, type User, type AuthResponse };
export { manuscriptService, type ManuscriptHistoryEntry, type ManuscriptHistoryResponse };
export { savedSolutionsService, type SavedSolutionEntry, type SavedSolutionsResponse };
export { journeyService, type JourneyPlanEntry, type JourneyPlansResponse };
export { chatService, type ChatSessionEntry, type ChatSessionsResponse };
export { errorHandler };
export { offlineSyncService };

// Migration service for all localStorage data
class MigrationService {
  async migrateAllData(): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    console.log('🔄 Starting data migration from localStorage to MongoDB...');

    try {
      // Migrate manuscript history
      await manuscriptService.migrateFromLocalStorage();
    } catch (error) {
      console.error('Manuscript migration failed:', error);
      errors.push('Manuscript history migration failed');
    }

    try {
      // Migrate saved solutions
      await savedSolutionsService.migrateFromLocalStorage();
    } catch (error) {
      console.error('Saved solutions migration failed:', error);
      errors.push('Saved solutions migration failed');
    }

    try {
      // Migrate journey plans
      await journeyService.migrateFromLocalStorage();
    } catch (error) {
      console.error('Journey plan migration failed:', error);
      errors.push('Journey plan migration failed');
    }

    const success = errors.length === 0;
    if (success) {
      console.log('✅ All data migrated successfully!');
    } else {
      console.log('⚠️ Migration completed with errors:', errors);
    }

    return { success, errors };
  }

  hasLocalStorageData(): boolean {
    const keys = ['manuscriptHistory', 'savedSolutions', 'journeyPlan'];
    return keys.some(key => localStorage.getItem(key) !== null);
  }
}

export const migrationService = new MigrationService();

// Import existing gemini service
export * from './geminiService';