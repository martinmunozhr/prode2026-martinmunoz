export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      api_sync_logs: {
        Row: {
          created_at: string
          details: Json | null
          error: string | null
          id: string
          requests_used: number
          status: string
          sync_type: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          error?: string | null
          id?: string
          requests_used?: number
          status: string
          sync_type: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          error?: string | null
          id?: string
          requests_used?: number
          status?: string
          sync_type?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          is_public: boolean
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          is_public?: boolean
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          is_public?: boolean
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      crystal_ball: {
        Row: {
          campeon_id: string | null
          created_at: string
          fair_play_id: string | null
          goleador_nombre: string | null
          id: string
          locked: boolean
          mejor_arquero_nombre: string | null
          mejor_jugador_nombre: string | null
          points_earned: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          campeon_id?: string | null
          created_at?: string
          fair_play_id?: string | null
          goleador_nombre?: string | null
          id?: string
          locked?: boolean
          mejor_arquero_nombre?: string | null
          mejor_jugador_nombre?: string | null
          points_earned?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          campeon_id?: string | null
          created_at?: string
          fair_play_id?: string | null
          goleador_nombre?: string | null
          id?: string
          locked?: boolean
          mejor_arquero_nombre?: string | null
          mejor_jugador_nombre?: string | null
          points_earned?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      goalscorer_predictions: {
        Row: {
          created_at: string
          goals_predicted: number
          id: string
          match_id: string
          player_id: string
          points_earned: number | null
          team_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goals_predicted?: number
          id?: string
          match_id: string
          player_id: string
          points_earned?: number | null
          team_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          goals_predicted?: number
          id?: string
          match_id?: string
          player_id?: string
          points_earned?: number | null
          team_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      match_events: {
        Row: {
          created_at: string
          detail: string | null
          event_type: string
          id: string
          match_id: string
          minute: number | null
          player_id: string | null
          player_name: string | null
          team_id: string
        }
        Insert: {
          created_at?: string
          detail?: string | null
          event_type: string
          id?: string
          match_id: string
          minute?: number | null
          player_id?: string | null
          player_name?: string | null
          team_id: string
        }
        Update: {
          created_at?: string
          detail?: string | null
          event_type?: string
          id?: string
          match_id?: string
          minute?: number | null
          player_id?: string | null
          player_name?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_events_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          away_id: string
          away_score: number | null
          city: string
          created_at: string
          group_letter: string | null
          home_id: string
          home_score: number | null
          id: string
          match_date: string
          stadium: string
          stage: Database["public"]["Enums"]["match_stage"]
          status: Database["public"]["Enums"]["match_status"]
          updated_at: string
        }
        Insert: {
          away_id: string
          away_score?: number | null
          city: string
          created_at?: string
          group_letter?: string | null
          home_id: string
          home_score?: number | null
          id: string
          match_date: string
          stadium: string
          stage: Database["public"]["Enums"]["match_stage"]
          status?: Database["public"]["Enums"]["match_status"]
          updated_at?: string
        }
        Update: {
          away_id?: string
          away_score?: number | null
          city?: string
          created_at?: string
          group_letter?: string | null
          home_id?: string
          home_score?: number | null
          id?: string
          match_date?: string
          stadium?: string
          stage?: Database["public"]["Enums"]["match_stage"]
          status?: Database["public"]["Enums"]["match_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_away_id_fkey"
            columns: ["away_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_id_fkey"
            columns: ["home_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          api_player_id: number | null
          club: string | null
          created_at: string
          id: string
          is_captain: boolean
          jersey_number: number | null
          name: string
          position: string
          team_id: string
          updated_at: string
        }
        Insert: {
          api_player_id?: number | null
          club?: string | null
          created_at?: string
          id?: string
          is_captain?: boolean
          jersey_number?: number | null
          name: string
          position: string
          team_id: string
          updated_at?: string
        }
        Update: {
          api_player_id?: number | null
          club?: string | null
          created_at?: string
          id?: string
          is_captain?: boolean
          jersey_number?: number | null
          name?: string
          position?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      power_rankings: {
        Row: {
          draws: number
          elo_rating: number
          goals_against: number
          goals_for: number
          losses: number
          matches_played: number
          team_id: string
          updated_at: string
          wins: number
        }
        Insert: {
          draws?: number
          elo_rating?: number
          goals_against?: number
          goals_for?: number
          losses?: number
          matches_played?: number
          team_id: string
          updated_at?: string
          wins?: number
        }
        Update: {
          draws?: number
          elo_rating?: number
          goals_against?: number
          goals_for?: number
          losses?: number
          matches_played?: number
          team_id?: string
          updated_at?: string
          wins?: number
        }
        Relationships: [
          {
            foreignKeyName: "power_rankings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions: {
        Row: {
          away_score: number
          created_at: string
          home_score: number
          id: string
          match_id: string
          points_earned: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          away_score: number
          created_at?: string
          home_score: number
          id?: string
          match_id: string
          points_earned?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          away_score?: number
          created_at?: string
          home_score?: number
          id?: string
          match_id?: string
          points_earned?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_color: string
          created_at: string
          favorite_team_id: string | null
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          avatar_color?: string
          created_at?: string
          favorite_team_id?: string | null
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          avatar_color?: string
          created_at?: string
          favorite_team_id?: string | null
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          code: string
          confederation: string
          created_at: string
          flag: string
          group_letter: string
          id: string
          name: string
        }
        Insert: {
          code: string
          confederation: string
          created_at?: string
          flag: string
          group_letter: string
          id: string
          name: string
        }
        Update: {
          code?: string
          confederation?: string
          created_at?: string
          flag?: string
          group_letter?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      tournament_awards: {
        Row: {
          campeon_id: string | null
          fair_play_id: string | null
          finalized: boolean
          goleador_nombre: string | null
          id: number
          mejor_arquero_nombre: string | null
          mejor_jugador_nombre: string | null
          subcampeon_id: string | null
          tercer_puesto_id: string | null
          updated_at: string
        }
        Insert: {
          campeon_id?: string | null
          fair_play_id?: string | null
          finalized?: boolean
          goleador_nombre?: string | null
          id?: number
          mejor_arquero_nombre?: string | null
          mejor_jugador_nombre?: string | null
          subcampeon_id?: string | null
          tercer_puesto_id?: string | null
          updated_at?: string
        }
        Update: {
          campeon_id?: string | null
          fair_play_id?: string | null
          finalized?: boolean
          goleador_nombre?: string | null
          id?: number
          mejor_arquero_nombre?: string | null
          mejor_jugador_nombre?: string | null
          subcampeon_id?: string | null
          tercer_puesto_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_awards_campeon_id_fkey"
            columns: ["campeon_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_awards_fair_play_id_fkey"
            columns: ["fair_play_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_awards_subcampeon_id_fkey"
            columns: ["subcampeon_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_awards_tercer_puesto_id_fkey"
            columns: ["tercer_puesto_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calc_prediction_points: {
        Args: {
          _pred_away: number
          _pred_home: number
          _real_away: number
          _real_home: number
          _stage: Database["public"]["Enums"]["match_stage"]
        }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      predict_match: {
        Args: { _away_id: string; _home_id: string }
        Returns: {
          away_score: number
          home_score: number
          probability: number
        }[]
      }
      recalc_goalscorer_points: {
        Args: { _match_id: string }
        Returns: undefined
      }
      stage_multiplier: {
        Args: { _stage: Database["public"]["Enums"]["match_stage"] }
        Returns: number
      }
    }
    Enums: {
      app_role: "admin" | "user"
      match_stage:
        | "Grupos"
        | "Dieciseisavos"
        | "Octavos"
        | "Cuartos"
        | "Semifinal"
        | "Tercer Puesto"
        | "Final"
      match_status: "scheduled" | "live" | "finished"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
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
    },
  },
} as const
