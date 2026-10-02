// Types Supabase écrits à la main pour coller au schéma des migrations
// supabase/migrations/000*.sql. A régénérer plus tard avec
// `supabase gen types typescript --linked` une fois le CLI lié au projet.

export type MatchStatus = "upcoming" | "running" | "finished" | "canceled";
export type BetOutcome = "pending" | "won" | "lost" | "void";
export type LedgerReason =
  | "quiz_reward"
  | "login_bonus"
  | "bet_stake"
  | "bet_payout"
  | "bet_refund"
  | "admin_adjustment";

export interface QuizAnswer {
  question_id: number;
  chosen_index: number;
}

export interface Database {
  public: {
    Tables: {
      games: {
        Row: { id: number; slug: string; name: string };
        Insert: { id: number; slug: string; name: string };
        Update: Partial<{ id: number; slug: string; name: string }>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          bio: string | null;
          avatar_url: string | null;
          points_balance: number;
          is_admin: boolean;
          created_at: string;
        };
        Insert: never;
        Update: Partial<{ username: string; bio: string | null; avatar_url: string | null }>;
        Relationships: [];
      };
      teams: {
        Row: {
          id: number;
          game_id: number;
          name: string;
          logo_url: string | null;
          rating: number;
          rating_updated_at: string | null;
        };
        Insert: {
          id: number;
          game_id: number;
          name: string;
          logo_url?: string | null;
        };
        Update: never;
        Relationships: [];
      };
      matches: {
        Row: {
          id: number;
          game_id: number;
          team_a_id: number;
          team_b_id: number;
          status: MatchStatus;
          scheduled_at: string | null;
          winner_team_id: number | null;
          odds_a: number | null;
          odds_b: number | null;
          betting_locked_at: string | null;
          settled_at: string | null;
          raw: Record<string, unknown> | null;
          updated_at: string | null;
        };
        Insert: {
          id: number;
          game_id: number;
          team_a_id: number;
          team_b_id: number;
          status: MatchStatus;
          scheduled_at?: string | null;
          odds_a?: number | null;
          odds_b?: number | null;
          betting_locked_at?: string | null;
          raw?: Record<string, unknown> | null;
          updated_at?: string | null;
        };
        Update: Partial<{
          status: MatchStatus;
          scheduled_at: string | null;
          odds_a: number | null;
          odds_b: number | null;
          betting_locked_at: string | null;
          raw: Record<string, unknown> | null;
          updated_at: string | null;
        }>;
        Relationships: [];
      };
      team_rating_history: {
        Row: {
          id: number;
          team_id: number;
          match_id: number;
          rating_before: number;
          rating_after: number;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      bets: {
        Row: {
          id: string;
          user_id: string;
          match_id: number;
          chosen_team_id: number;
          stake: number;
          odds: number;
          outcome: BetOutcome;
          payout: number | null;
          idempotency_key: string;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      point_ledger: {
        Row: {
          id: number;
          user_id: string;
          amount: number;
          balance_after: number;
          reason: LedgerReason;
          ref_bet_id: string | null;
          ref_quiz_attempt_id: number | null;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      quiz_questions: {
        Row: {
          id: number;
          game_id: number;
          question: string;
          choices: string[];
          correct_index: number;
          difficulty: number;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          game_id: number;
          question: string;
          choices: string[];
          correct_index: number;
          difficulty?: number;
          is_active?: boolean;
        };
        Update: Partial<{
          question: string;
          choices: string[];
          correct_index: number;
          difficulty: number;
          is_active: boolean;
        }>;
        Relationships: [];
      };
      daily_quiz: {
        Row: { quiz_date: string; question_ids: number[] };
        Insert: { quiz_date: string; question_ids: number[] };
        Update: never;
        Relationships: [];
      };
      quiz_attempts: {
        Row: {
          id: number;
          user_id: string;
          quiz_date: string;
          answers: QuizAnswer[];
          score: number;
          points_awarded: number;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      groups: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          invite_code: string;
          tournament_start: string | null;
          tournament_end: string | null;
          created_at: string;
        };
        Insert: {
          name: string;
          owner_id: string;
          tournament_start?: string | null;
          tournament_end?: string | null;
        };
        Update: Partial<{
          name: string;
          tournament_start: string | null;
          tournament_end: string | null;
        }>;
        Relationships: [];
      };
      group_members: {
        Row: { group_id: string; user_id: string; joined_at: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      group_tournament_snapshot: {
        Row: { group_id: string; user_id: string; points_delta: number; computed_at: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: {
      quiz_questions_public: {
        Row: {
          id: number;
          game_id: number;
          question: string;
          choices: string[];
          difficulty: number;
        };
        Relationships: [];
      };
      leaderboard: {
        Row: {
          user_id: string;
          username: string;
          avatar_url: string | null;
          points_balance: number;
          bets_settled: number;
          bets_won: number;
          win_rate_pct: number;
          total_points_won: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      settle_match: {
        Args: { p_match_id: number; p_winner_team_id: number };
        Returns: void;
      };
      place_bet: {
        Args: {
          p_match_id: number;
          p_team_id: number;
          p_stake: number;
          p_idempotency_key: string;
        };
        Returns: Database["public"]["Tables"]["bets"]["Row"];
      };
      submit_quiz: {
        Args: { p_quiz_date: string; p_answers: QuizAnswer[] };
        Returns: Database["public"]["Tables"]["quiz_attempts"]["Row"];
      };
      join_group: {
        Args: { p_invite_code: string };
        Returns: Database["public"]["Tables"]["group_members"]["Row"];
      };
      claim_login_bonus: {
        Args: Record<string, never>;
        Returns: number;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      get_group_leaderboard: {
        Args: { p_group_id: string };
        Returns: { user_id: string; username: string; avatar_url: string | null; points_delta: number }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
