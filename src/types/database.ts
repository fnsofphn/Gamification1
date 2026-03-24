export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: string;
          slug: string;
          title: string;
          short_description: string;
          instructions: string;
          duration_seconds: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          slug: string;
          title: string;
          short_description: string;
          instructions: string;
          duration_seconds: number;
          is_active?: boolean;
        };
        Update: Partial<Database['public']['Tables']['games']['Insert']>;
        Relationships: [];
      };
      game_questions: {
        Row: {
          id: string;
          game_id: string;
          question_order: number;
          question_text: string;
          question_type: string;
          options: string[] | null;
          correct_answer: string | null;
          is_required: boolean;
          created_at: string;
        };
        Insert: {
          game_id: string;
          question_order: number;
          question_text: string;
          question_type: string;
          options?: string[] | null;
          correct_answer?: string | null;
          is_required?: boolean;
        };
        Update: Partial<Database['public']['Tables']['game_questions']['Insert']>;
        Relationships: [];
      };
      participants: {
        Row: {
          id: string;
          display_name: string;
          unit_name: string | null;
          created_at: string;
        };
        Insert: {
          display_name: string;
          unit_name?: string | null;
        };
        Update: Partial<Database['public']['Tables']['participants']['Insert']>;
        Relationships: [];
      };
      game_sessions: {
        Row: {
          id: string;
          game_id: string;
          participant_id: string;
          started_at: string;
          submitted_at: string | null;
          status: 'playing' | 'completed' | 'timeout';
          time_limit_seconds: number;
          score: number | null;
        };
        Insert: {
          game_id: string;
          participant_id: string;
          submitted_at?: string | null;
          status: 'playing' | 'completed' | 'timeout';
          time_limit_seconds: number;
          score?: number | null;
        };
        Update: Partial<Database['public']['Tables']['game_sessions']['Insert']>;
        Relationships: [];
      };
      game_answers: {
        Row: {
          id: string;
          session_id: string;
          question_id: string;
          answer_text: string;
          is_correct: boolean | null;
          created_at: string;
        };
        Insert: {
          session_id: string;
          question_id: string;
          answer_text: string;
          is_correct?: boolean | null;
        };
        Update: Partial<Database['public']['Tables']['game_answers']['Insert']>;
        Relationships: [];
      };
      game_ai_analyses: {
        Row: {
          id: string;
          game_id: string;
          session_id: string | null;
          analysis_type: 'submission' | 'game_summary';
          summary: string;
          keywords: string[];
          recommendations: string[];
          raw_json: Json;
          created_at: string;
        };
        Insert: {
          game_id: string;
          session_id?: string | null;
          analysis_type: 'submission' | 'game_summary';
          summary: string;
          keywords?: string[];
          recommendations?: string[];
          raw_json?: Json;
        };
        Update: Partial<Database['public']['Tables']['game_ai_analyses']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
