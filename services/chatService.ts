import { apiClient } from './apiClient';
import { type ChatMessage } from '../types';

export interface ChatSessionEntry {
  _id: string;
  userId: string;
  sessionType: 'quickChat' | 'analysis' | 'journeySession';
  title: string;
  messages: (ChatMessage & { timestamp: string })[];
  language: 'English' | 'Hindi' | 'Telugu';
  metadata: {
    journeyPlanId?: string;
    dayNumber?: number;
    topic?: string;
    analysisType?: string;
    symptoms?: string[];
    tags?: string[];
    originalProblem?: string;
  };
  isActive: boolean;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSessionsResponse {
  chatSessions: ChatSessionEntry[];
  pagination: {
    current: number;
    total: number;
    count: number;
  };
}

class ChatService {
  async getChatSessions(sessionType?: string, page: number = 1, limit: number = 10, isActive: boolean = true): Promise<ChatSessionsResponse> {
    const params: any = { page, limit, isActive };
    if (sessionType) {
      params.sessionType = sessionType;
    }
    
    return apiClient.get<ChatSessionsResponse>('/chat-sessions', params);
  }

  async createChatSession(sessionType: 'quickChat' | 'analysis' | 'journeySession', title?: string, language?: 'English' | 'Hindi' | 'Telugu', metadata: any = {}): Promise<{ message: string; chatSession: ChatSessionEntry }> {
    return apiClient.post<{ message: string; chatSession: ChatSessionEntry }>('/chat-sessions', {
      sessionType,
      title,
      language,
      metadata
    });
  }

  async getChatSession(id: string): Promise<{ chatSession: ChatSessionEntry }> {
    return apiClient.get<{ chatSession: ChatSessionEntry }>(`/chat-sessions/${id}`);
  }

  async addMessage(id: string, role: 'user' | 'model', content: string): Promise<{ message: string; chatSession: ChatSessionEntry }> {
    return apiClient.post<{ message: string; chatSession: ChatSessionEntry }>(`/chat-sessions/${id}/messages`, {
      role,
      content
    });
  }

  async updateChatSession(id: string, updates: { title?: string; metadata?: any; isActive?: boolean }): Promise<{ message: string; chatSession: ChatSessionEntry }> {
    return apiClient.put<{ message: string; chatSession: ChatSessionEntry }>(`/chat-sessions/${id}`, updates);
  }

  async deleteChatSession(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/chat-sessions/${id}`);
  }

  async archiveChatSession(id: string): Promise<{ message: string; chatSession: ChatSessionEntry }> {
    return apiClient.patch<{ message: string; chatSession: ChatSessionEntry }>(`/chat-sessions/${id}/archive`);
  }

  // Helper methods for specific session types
  async createQuickChatSession(language?: 'English' | 'Hindi' | 'Telugu'): Promise<ChatSessionEntry> {
    const response = await this.createChatSession('quickChat', 'Quick Chat', language);
    return response.chatSession;
  }

  async createAnalysisSession(analysisType: string, symptoms: string[], language?: 'English' | 'Hindi' | 'Telugu'): Promise<ChatSessionEntry> {
    const response = await this.createChatSession('analysis', 'Vedic Analysis', language, {
      analysisType,
      symptoms
    });
    return response.chatSession;
  }

  async createJourneySession(journeyPlanId: string, dayNumber: number, topic: string, originalProblem: string, language?: 'English' | 'Hindi' | 'Telugu'): Promise<ChatSessionEntry> {
    const response = await this.createChatSession('journeySession', `Day ${dayNumber}: ${topic}`, language, {
      journeyPlanId,
      dayNumber,
      topic,
      originalProblem
    });
    return response.chatSession;
  }
}

export const chatService = new ChatService();