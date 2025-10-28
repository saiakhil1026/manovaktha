export interface Solution {
  title: string;
  story: string;
  reference: string;
}

export interface SolutionResponse {
    solutions: Solution[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  journeyPlan?: JourneyPlan; // Optional journey plan
}

// --- New Types for Language and Journey ---

export type Language = 'English' | 'Hindi' | 'Telugu';

export interface JourneyDay {
  day: number;
  topic: string;
  completed: boolean;
}

export interface JourneyPlan {
  title: string;
  days: JourneyDay[];
  originalProblem: string; // To provide context for daily sessions
}

export interface DailyStory {
  title:string;
  content: string;
  reference: string;
}

export interface JourneyDayContent {
  introduction: string;
  stories: DailyStory[];
}

// --- New Types for Media and Doctors ---

export interface VideoSuggestion {
  title: string;
  description: string;
  youtubeId: string;
  channel: string;
}

export type DoctorSpecialization = 'Psychiatrist' | 'Therapist' | 'Counselor' | 'Life Coach';

export interface DoctorProfile {
  name: string;
  specialization: DoctorSpecialization;
  experience: number;
  rating: number;
  bio: string;
  address: string;
}

// --- New Type for History ---

export interface ManuscriptHistoryItem {
  problem: string;
  solutions: Solution[];
  timestamp: number;
}
