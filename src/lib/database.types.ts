// Tipos de la base de datos de Supabase. Escritos a mano para coincidir con
// supabase/migrations; con acceso al proyecto se regeneran con
//   supabase gen types typescript --project-id <id> > src/lib/database.types.ts
// (la salida generada es intercambiable con este archivo).

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          has_chosen_username: boolean;
          total_games_played: number;
          total_wins: number;
          created_at: string;
          updated_at: string;
        };
        // Solo se escribe desde funciones del servidor (set_username, record_game_result…).
        Insert: never;
        Update: never;
        Relationships: [];
      };
      high_scores: {
        Row: {
          id: number;
          user_id: string;
          topic: string;
          subtopic: string;
          game: string;
          difficulty: string;
          best_score: number;
          attempts: number;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      game_history: {
        Row: {
          id: number;
          user_id: string;
          topic: string;
          subtopic: string;
          game: string;
          difficulty: string;
          score: number;
          won: boolean;
          played_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      record_game_result: {
        Args: {
          p_topic: string;
          p_subtopic: string;
          p_game: string;
          p_difficulty: string;
          p_score: number;
          p_won: boolean;
        };
        Returns: Json;
      };
      set_username: { Args: { p_username: string }; Returns: string };
      get_leaderboard: {
        Args: {
          p_topic: string;
          p_subtopic: string;
          p_game: string;
          p_difficulty: string;
          p_limit?: number;
        };
        Returns: {
          rank: number;
          username: string;
          best_score: number;
          is_me: boolean;
        }[];
      };
      import_best_scores: { Args: { p_records: Json }; Returns: Json };
      clear_my_progress: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      delete_my_account: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
