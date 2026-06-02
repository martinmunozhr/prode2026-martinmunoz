export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      api_sync_logs: {
        Row: {
          created_at: string;
          details: Json | null;
          error: string | null;
          id: string;
          requests_used: number;
          status: string;
          sync_type: string;
        };
        Insert: {
          created_at?: string;
          details?: Json | null;
          error?: string | null;
          id?: string;
          requests_used?: number;
          status: string;
          sync_type: string;
        };
        Update: {
          created_at?: string;
          details?: Json | null;
          error?: string | null;
          id?: string;
          requests_used?: number;
          status?: string;
          sync_type?: string;
        };
        Relationships: [];
      };
      app_settings: {
        Row: {
          is_public: boolean;
          key: string;
          updated_at: string;
          value: Json;
        };
        Insert: {
          is_public?: boolean;
          key: string;
          updated_at?: string;
          value: Json;
        };
        Update: {
          is_public?: boolean;
          key?: string;
          updated_at?: string;
          value?: Json;
        };
        Relationships: [];
      };
      challenges: {
        Row: {
          bonus_points: number | null;
          challenger_id: string;
          challenger_points: number | null;
          created_at: string;
          id: string;
          is_draw: boolean;
          opponent_id: string;
          opponent_points: number | null;
          resolved_at: string | null;
          round_id: string;
          status: Database["public"]["Enums"]["challenge_status"];
          updated_at: string;
          winner_id: string | null;
        };
        Insert: {
          bonus_points?: number | null;
          challenger_id: string;
          challenger_points?: number | null;
          created_at?: string;
          id?: string;
          is_draw?: boolean;
          opponent_id: string;
          opponent_points?: number | null;
          resolved_at?: string | null;
          round_id: string;
          status?: Database["public"]["Enums"]["challenge_status"];
          updated_at?: string;
          winner_id?: string | null;
        };
        Update: {
          bonus_points?: number | null;
          challenger_id?: string;
          challenger_points?: number | null;
          created_at?: string;
          id?: string;
          is_draw?: boolean;
          opponent_id?: string;
          opponent_points?: number | null;
          resolved_at?: string | null;
          round_id?: string;
          status?: Database["public"]["Enums"]["challenge_status"];
          updated_at?: string;
          winner_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "challenges_round_id_fkey";
            columns: ["round_id"];
            isOneToOne: false;
            referencedRelation: "rounds";
            referencedColumns: ["id"];
          },
        ];
      };
      coin_transactions: {
        Row: {
          amount: number;
          created_at: string;
          description: string | null;
          id: string;
          metadata: Json | null;
          tx_type: Database["public"]["Enums"]["coin_tx_type"];
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          description?: string | null;
          id?: string;
          metadata?: Json | null;
          tx_type: Database["public"]["Enums"]["coin_tx_type"];
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          description?: string | null;
          id?: string;
          metadata?: Json | null;
          tx_type?: Database["public"]["Enums"]["coin_tx_type"];
          user_id?: string;
        };
        Relationships: [];
      };
      crystal_ball: {
        Row: {
          campeon_id: string | null;
          created_at: string;
          fair_play_id: string | null;
          goleador_nombre: string | null;
          id: string;
          locked: boolean;
          mejor_arquero_nombre: string | null;
          mejor_jugador_nombre: string | null;
          points_earned: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          campeon_id?: string | null;
          created_at?: string;
          fair_play_id?: string | null;
          goleador_nombre?: string | null;
          id?: string;
          locked?: boolean;
          mejor_arquero_nombre?: string | null;
          mejor_jugador_nombre?: string | null;
          points_earned?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          campeon_id?: string | null;
          created_at?: string;
          fair_play_id?: string | null;
          goleador_nombre?: string | null;
          id?: string;
          locked?: boolean;
          mejor_arquero_nombre?: string | null;
          mejor_jugador_nombre?: string | null;
          points_earned?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      goalscorer_predictions: {
        Row: {
          created_at: string;
          goals_predicted: number;
          id: string;
          match_id: string;
          player_id: string;
          points_earned: number | null;
          team_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          goals_predicted?: number;
          id?: string;
          match_id: string;
          player_id: string;
          points_earned?: number | null;
          team_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          goals_predicted?: number;
          id?: string;
          match_id?: string;
          player_id?: string;
          points_earned?: number | null;
          team_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      match_events: {
        Row: {
          created_at: string;
          detail: string | null;
          event_type: string;
          id: string;
          match_id: string;
          minute: number | null;
          player_id: string | null;
          player_name: string | null;
          team_id: string;
        };
        Insert: {
          created_at?: string;
          detail?: string | null;
          event_type: string;
          id?: string;
          match_id: string;
          minute?: number | null;
          player_id?: string | null;
          player_name?: string | null;
          team_id: string;
        };
        Update: {
          created_at?: string;
          detail?: string | null;
          event_type?: string;
          id?: string;
          match_id?: string;
          minute?: number | null;
          player_id?: string | null;
          player_name?: string | null;
          team_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "match_events_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "match_events_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "match_events_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      matches: {
        Row: {
          away_id: string;
          away_score: number | null;
          city: string;
          created_at: string;
          group_letter: string | null;
          home_id: string;
          home_score: number | null;
          id: string;
          match_date: string;
          round_id: string | null;
          stadium: string;
          stage: Database["public"]["Enums"]["match_stage"];
          status: Database["public"]["Enums"]["match_status"];
          updated_at: string;
        };
        Insert: {
          away_id: string;
          away_score?: number | null;
          city: string;
          created_at?: string;
          group_letter?: string | null;
          home_id: string;
          home_score?: number | null;
          id: string;
          match_date: string;
          round_id?: string | null;
          stadium: string;
          stage: Database["public"]["Enums"]["match_stage"];
          status?: Database["public"]["Enums"]["match_status"];
          updated_at?: string;
        };
        Update: {
          away_id?: string;
          away_score?: number | null;
          city?: string;
          created_at?: string;
          group_letter?: string | null;
          home_id?: string;
          home_score?: number | null;
          id?: string;
          match_date?: string;
          round_id?: string | null;
          stadium?: string;
          stage?: Database["public"]["Enums"]["match_stage"];
          status?: Database["public"]["Enums"]["match_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "matches_away_id_fkey";
            columns: ["away_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_home_id_fkey";
            columns: ["home_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_round_id_fkey";
            columns: ["round_id"];
            isOneToOne: false;
            referencedRelation: "rounds";
            referencedColumns: ["id"];
          },
        ];
      };
      pack_openings: {
        Row: {
          cost: number;
          created_at: string;
          duplicates_count: number;
          id: string;
          pack_type: Database["public"]["Enums"]["pack_type"];
          player_ids: string[];
          rarities: Database["public"]["Enums"]["card_rarity"][];
          user_id: string;
        };
        Insert: {
          cost: number;
          created_at?: string;
          duplicates_count?: number;
          id?: string;
          pack_type: Database["public"]["Enums"]["pack_type"];
          player_ids: string[];
          rarities: Database["public"]["Enums"]["card_rarity"][];
          user_id: string;
        };
        Update: {
          cost?: number;
          created_at?: string;
          duplicates_count?: number;
          id?: string;
          pack_type?: Database["public"]["Enums"]["pack_type"];
          player_ids?: string[];
          rarities?: Database["public"]["Enums"]["card_rarity"][];
          user_id?: string;
        };
        Relationships: [];
      };
      players: {
        Row: {
          api_player_id: number | null;
          club: string | null;
          created_at: string;
          id: string;
          image_url: string | null;
          is_captain: boolean;
          jersey_number: number | null;
          name: string;
          position: string;
          rarity: Database["public"]["Enums"]["card_rarity"];
          team_id: string;
          updated_at: string;
        };
        Insert: {
          api_player_id?: number | null;
          club?: string | null;
          created_at?: string;
          id?: string;
          image_url?: string | null;
          is_captain?: boolean;
          jersey_number?: number | null;
          name: string;
          position: string;
          rarity?: Database["public"]["Enums"]["card_rarity"];
          team_id: string;
          updated_at?: string;
        };
        Update: {
          api_player_id?: number | null;
          club?: string | null;
          created_at?: string;
          id?: string;
          image_url?: string | null;
          is_captain?: boolean;
          jersey_number?: number | null;
          name?: string;
          position?: string;
          rarity?: Database["public"]["Enums"]["card_rarity"];
          team_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      power_rankings: {
        Row: {
          draws: number;
          elo_rating: number;
          goals_against: number;
          goals_for: number;
          losses: number;
          matches_played: number;
          team_id: string;
          updated_at: string;
          wins: number;
        };
        Insert: {
          draws?: number;
          elo_rating?: number;
          goals_against?: number;
          goals_for?: number;
          losses?: number;
          matches_played?: number;
          team_id: string;
          updated_at?: string;
          wins?: number;
        };
        Update: {
          draws?: number;
          elo_rating?: number;
          goals_against?: number;
          goals_for?: number;
          losses?: number;
          matches_played?: number;
          team_id?: string;
          updated_at?: string;
          wins?: number;
        };
        Relationships: [
          {
            foreignKeyName: "power_rankings_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: true;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      predictions: {
        Row: {
          away_score: number;
          created_at: string;
          home_score: number;
          id: string;
          match_id: string;
          points_earned: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          away_score: number;
          created_at?: string;
          home_score: number;
          id?: string;
          match_id: string;
          points_earned?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          away_score?: number;
          created_at?: string;
          home_score?: number;
          id?: string;
          match_id?: string;
          points_earned?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "predictions_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_color: string;
          created_at: string;
          favorite_team_id: string | null;
          id: string;
          updated_at: string;
          username: string;
        };
        Insert: {
          avatar_color?: string;
          created_at?: string;
          favorite_team_id?: string | null;
          id: string;
          updated_at?: string;
          username: string;
        };
        Update: {
          avatar_color?: string;
          created_at?: string;
          favorite_team_id?: string | null;
          id?: string;
          updated_at?: string;
          username?: string;
        };
        Relationships: [];
      };
      round_payouts: {
        Row: {
          achievements_paid: Json;
          paid_at: string;
          points_paid: number;
          round_id: string;
          user_id: string;
        };
        Insert: {
          achievements_paid?: Json;
          paid_at?: string;
          points_paid?: number;
          round_id: string;
          user_id: string;
        };
        Update: {
          achievements_paid?: Json;
          paid_at?: string;
          points_paid?: number;
          round_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "round_payouts_round_id_fkey";
            columns: ["round_id"];
            isOneToOne: false;
            referencedRelation: "rounds";
            referencedColumns: ["id"];
          },
        ];
      };
      rounds: {
        Row: {
          created_at: string;
          ends_at: string | null;
          group_matchday: number | null;
          id: string;
          name: string;
          sort_order: number;
          stage: Database["public"]["Enums"]["match_stage"];
          starts_at: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          ends_at?: string | null;
          group_matchday?: number | null;
          id: string;
          name: string;
          sort_order: number;
          stage: Database["public"]["Enums"]["match_stage"];
          starts_at?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          ends_at?: string | null;
          group_matchday?: number | null;
          id?: string;
          name?: string;
          sort_order?: number;
          stage?: Database["public"]["Enums"]["match_stage"];
          starts_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      teams: {
        Row: {
          code: string;
          confederation: string;
          created_at: string;
          description: string | null;
          flag: string;
          group_letter: string;
          id: string;
          name: string;
        };
        Insert: {
          code: string;
          confederation: string;
          created_at?: string;
          description?: string | null;
          flag: string;
          group_letter: string;
          id: string;
          name: string;
        };
        Update: {
          code?: string;
          confederation?: string;
          created_at?: string;
          description?: string | null;
          flag?: string;
          group_letter?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      tournament_awards: {
        Row: {
          campeon_id: string | null;
          fair_play_id: string | null;
          finalized: boolean;
          goleador_nombre: string | null;
          id: number;
          mejor_arquero_nombre: string | null;
          mejor_jugador_nombre: string | null;
          subcampeon_id: string | null;
          tercer_puesto_id: string | null;
          updated_at: string;
        };
        Insert: {
          campeon_id?: string | null;
          fair_play_id?: string | null;
          finalized?: boolean;
          goleador_nombre?: string | null;
          id?: number;
          mejor_arquero_nombre?: string | null;
          mejor_jugador_nombre?: string | null;
          subcampeon_id?: string | null;
          tercer_puesto_id?: string | null;
          updated_at?: string;
        };
        Update: {
          campeon_id?: string | null;
          fair_play_id?: string | null;
          finalized?: boolean;
          goleador_nombre?: string | null;
          id?: number;
          mejor_arquero_nombre?: string | null;
          mejor_jugador_nombre?: string | null;
          subcampeon_id?: string | null;
          tercer_puesto_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tournament_awards_campeon_id_fkey";
            columns: ["campeon_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tournament_awards_fair_play_id_fkey";
            columns: ["fair_play_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tournament_awards_subcampeon_id_fkey";
            columns: ["subcampeon_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tournament_awards_tercer_puesto_id_fkey";
            columns: ["tercer_puesto_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      trade_items: {
        Row: {
          created_at: string;
          from_user_id: string;
          id: string;
          player_id: string;
          quantity: number;
          trade_id: string;
        };
        Insert: {
          created_at?: string;
          from_user_id: string;
          id?: string;
          player_id: string;
          quantity?: number;
          trade_id: string;
        };
        Update: {
          created_at?: string;
          from_user_id?: string;
          id?: string;
          player_id?: string;
          quantity?: number;
          trade_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "trade_items_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "trade_items_trade_id_fkey";
            columns: ["trade_id"];
            isOneToOne: false;
            referencedRelation: "trades";
            referencedColumns: ["id"];
          },
        ];
      };
      trades: {
        Row: {
          created_at: string;
          id: string;
          message: string | null;
          proposer_id: string;
          receiver_id: string;
          resolved_at: string | null;
          status: Database["public"]["Enums"]["trade_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          message?: string | null;
          proposer_id: string;
          receiver_id: string;
          resolved_at?: string | null;
          status?: Database["public"]["Enums"]["trade_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          message?: string | null;
          proposer_id?: string;
          receiver_id?: string;
          resolved_at?: string | null;
          status?: Database["public"]["Enums"]["trade_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      user_coins: {
        Row: {
          balance: number;
          total_earned: number;
          total_spent: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          balance?: number;
          total_earned?: number;
          total_spent?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          balance?: number;
          total_earned?: number;
          total_spent?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_collection: {
        Row: {
          first_obtained_at: string;
          player_id: string;
          quantity: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          first_obtained_at?: string;
          player_id: string;
          quantity?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          first_obtained_at?: string;
          player_id?: string;
          quantity?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_collection_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
        ];
      };
      user_recycle_fragments: {
        Row: {
          fragments: number;
          rarity: Database["public"]["Enums"]["card_rarity"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          fragments?: number;
          rarity: Database["public"]["Enums"]["card_rarity"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          fragments?: number;
          rarity?: Database["public"]["Enums"]["card_rarity"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      user_streaks: {
        Row: {
          best_exact_streak: number;
          exact_streak: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          best_exact_streak?: number;
          exact_streak?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          best_exact_streak?: number;
          exact_streak?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_trade: { Args: { _trade_id: string }; Returns: undefined };
      auto_assign_rarities: { Args: never; Returns: undefined };
      calc_prediction_points: {
        Args: {
          _pred_away: number;
          _pred_home: number;
          _real_away: number;
          _real_home: number;
          _stage: Database["public"]["Enums"]["match_stage"];
        };
        Returns: number;
      };
      ensure_user_coins: { Args: { _user_id: string }; Returns: undefined };
      grant_coins: {
        Args: {
          _amount: number;
          _description?: string;
          _metadata?: Json;
          _tx_type: Database["public"]["Enums"]["coin_tx_type"];
          _user_id: string;
        };
        Returns: number;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_round_finished: { Args: { _round_id: string }; Returns: boolean };
      open_pack: {
        Args: { _pack_type: Database["public"]["Enums"]["pack_type"] };
        Returns: {
          is_duplicate: boolean;
          is_new: boolean;
          player_id: string;
          rarity: Database["public"]["Enums"]["card_rarity"];
        }[];
      };
      points_for_user_in_round: {
        Args: { _round_id: string; _user_id: string };
        Returns: number;
      };
      predict_match: {
        Args: { _away_id: string; _home_id: string };
        Returns: {
          away_score: number;
          home_score: number;
          probability: number;
        }[];
      };
      process_round_payouts: { Args: { _round_id: string }; Returns: undefined };
      recalc_goalscorer_points: {
        Args: { _match_id: string };
        Returns: undefined;
      };
      recycle_card: { Args: { _player_id: string }; Returns: Json };
      refresh_round_dates: { Args: { _round_id: string }; Returns: undefined };
      resolve_challenge: { Args: { _challenge_id: string }; Returns: undefined };
      simulate_pack: {
        Args: {
          _iterations?: number;
          _pack_type: Database["public"]["Enums"]["pack_type"];
        };
        Returns: {
          count: number;
          rarity: Database["public"]["Enums"]["card_rarity"];
        }[];
      };
      stage_multiplier: {
        Args: { _stage: Database["public"]["Enums"]["match_stage"] };
        Returns: number;
      };
    };
    Enums: {
      app_role: "admin" | "user";
      card_rarity: "comun" | "raro" | "epico" | "legendario";
      challenge_status: "pending" | "accepted" | "rejected" | "resolved" | "cancelled";
      coin_tx_type:
        | "round_points"
        | "streak_bonus"
        | "goalscorer_bonus"
        | "challenge_bonus"
        | "round_achievement"
        | "pack_purchase"
        | "recycle"
        | "trade"
        | "admin_grant";
      match_stage:
        | "Grupos"
        | "Dieciseisavos"
        | "Octavos"
        | "Cuartos"
        | "Semifinal"
        | "Tercer Puesto"
        | "Final";
      match_status: "scheduled" | "live" | "finished";
      pack_type: "comun" | "raro" | "epico" | "legendario";
      trade_status: "pending" | "accepted" | "rejected" | "cancelled";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      card_rarity: ["comun", "raro", "epico", "legendario"],
      challenge_status: ["pending", "accepted", "rejected", "resolved", "cancelled"],
      coin_tx_type: [
        "round_points",
        "streak_bonus",
        "goalscorer_bonus",
        "challenge_bonus",
        "round_achievement",
        "pack_purchase",
        "recycle",
        "trade",
        "admin_grant",
      ],
      match_stage: [
        "Grupos",
        "Dieciseisavos",
        "Octavos",
        "Cuartos",
        "Semifinal",
        "Tercer Puesto",
        "Final",
      ],
      match_status: ["scheduled", "live", "finished"],
      pack_type: ["comun", "raro", "epico", "legendario"],
      trade_status: ["pending", "accepted", "rejected", "cancelled"],
    },
  },
} as const;
