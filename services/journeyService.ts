import { apiClient } from './apiClient';
import { type JourneyPlan, type JourneyDay } from '../types';

export interface JourneyPlanEntry {
  _id: string;
  userId: string;
  title: string;
  originalProblem: string;
  days: (JourneyDay & { 
    notes?: string; 
    completedAt?: string; 
  })[];
  language: 'English' | 'Hindi' | 'Telugu';
  status: 'active' | 'completed' | 'paused' | 'abandoned';
  progress: number;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JourneyPlansResponse {
  journeyPlans: JourneyPlanEntry[];
  pagination: {
    current: number;
    total: number;
    count: number;
  };
}

class JourneyService {
  async getJourneyPlans(status?: string, page: number = 1, limit: number = 10): Promise<JourneyPlansResponse> {
    const params: any = { page, limit };
    if (status) {
      params.status = status;
    }
    
    return apiClient.get<JourneyPlansResponse>('/journey-plans', params);
  }

  async getCurrentJourney(): Promise<{ journeyPlan: JourneyPlanEntry | null }> {
    return apiClient.get<{ journeyPlan: JourneyPlanEntry | null }>('/journey-plans/current');
  }

  async createJourneyPlan(title: string, originalProblem: string, days: JourneyDay[], language: 'English' | 'Hindi' | 'Telugu'): Promise<{ message: string; journeyPlan: JourneyPlanEntry }> {
    return apiClient.post<{ message: string; journeyPlan: JourneyPlanEntry }>('/journey-plans', {
      title,
      originalProblem,
      days,
      language
    });
  }

  async getJourneyPlan(id: string): Promise<{ journeyPlan: JourneyPlanEntry }> {
    return apiClient.get<{ journeyPlan: JourneyPlanEntry }>(`/journey-plans/${id}`);
  }

  async updateJourneyStatus(id: string, status: 'active' | 'paused' | 'completed' | 'abandoned'): Promise<{ message: string; journeyPlan: JourneyPlanEntry }> {
    return apiClient.patch<{ message: string; journeyPlan: JourneyPlanEntry }>(`/journey-plans/${id}/status`, {
      status
    });
  }

  async markDayComplete(id: string, dayNumber: number, notes?: string): Promise<{ message: string; journeyPlan: JourneyPlanEntry }> {
    return apiClient.patch<{ message: string; journeyPlan: JourneyPlanEntry }>(`/journey-plans/${id}/days/${dayNumber}/complete`, {
      notes
    });
  }

  async updateDayNotes(id: string, dayNumber: number, notes: string): Promise<{ message: string; journeyPlan: JourneyPlanEntry }> {
    return apiClient.patch<{ message: string; journeyPlan: JourneyPlanEntry }>(`/journey-plans/${id}/days/${dayNumber}/notes`, {
      notes
    });
  }

  async deleteJourneyPlan(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/journey-plans/${id}`);
  }

  // Migration helper for localStorage data
  async migrateFromLocalStorage(): Promise<void> {
    try {
      const localJourney = localStorage.getItem('journeyPlan');
      if (!localJourney) return;

      const journeyData: JourneyPlan = JSON.parse(localJourney);
      
      await this.createJourneyPlan(
        journeyData.title,
        journeyData.originalProblem,
        journeyData.days,
        'English' // Default language for migration
      );

      // Clear localStorage after successful migration
      localStorage.removeItem('journeyPlan');
      console.log('✅ Journey plan migrated successfully');
    } catch (error) {
      console.error('❌ Failed to migrate journey plan:', error);
      // Don't throw error for journey migration as it's not critical
    }
  }
}

export const journeyService = new JourneyService();