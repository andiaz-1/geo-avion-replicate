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
      admin_notifications: {
        Row: {
          created_at: string
          event_id: string | null
          id: string
          kind: string
          message: string
          read: boolean
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          id?: string
          kind: string
          message: string
          read?: boolean
        }
        Update: {
          created_at?: string
          event_id?: string | null
          id?: string
          kind?: string
          message?: string
          read?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          content: Json
          created_at: string
          event_id: string
          id: string
          signature_type: string | null
          signature_value: string | null
          signed_at: string | null
          signer_name: string | null
        }
        Insert: {
          content?: Json
          created_at?: string
          event_id: string
          id?: string
          signature_type?: string | null
          signature_value?: string | null
          signed_at?: string | null
          signer_name?: string | null
        }
        Update: {
          content?: Json
          created_at?: string
          event_id?: string
          id?: string
          signature_type?: string | null
          signature_value?: string | null
          signed_at?: string | null
          signer_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          addons: Json | null
          adult_count: number
          allergens: string | null
          bar_duration: string | null
          bar_type: string | null
          beverage_strategy: string | null
          bringing_cake: boolean | null
          bringing_decor: boolean | null
          company: string | null
          contract_sent_at: string | null
          contract_signed_at: string | null
          course_choice: string | null
          created_at: string
          decide_later: boolean | null
          email: string
          event_date: string | null
          event_time: string | null
          full_name: string
          guest_count: number
          id: string
          internal_notes: string | null
          is_lunch: boolean | null
          kids_count: number
          menu_header_at: string | null
          menu_selections: Json | null
          menu_tier: string | null
          payment_auth_at: string | null
          phone: string | null
          portal_token: string
          quote: Json | null
          special_requests: string | null
          status: Database["public"]["Enums"]["event_status"]
          updated_at: string
          venue: string | null
          wants_private_room: boolean | null
        }
        Insert: {
          addons?: Json | null
          adult_count?: number
          allergens?: string | null
          bar_duration?: string | null
          bar_type?: string | null
          beverage_strategy?: string | null
          bringing_cake?: boolean | null
          bringing_decor?: boolean | null
          company?: string | null
          contract_sent_at?: string | null
          contract_signed_at?: string | null
          course_choice?: string | null
          created_at?: string
          decide_later?: boolean | null
          email: string
          event_date?: string | null
          event_time?: string | null
          full_name: string
          guest_count?: number
          id?: string
          internal_notes?: string | null
          is_lunch?: boolean | null
          kids_count?: number
          menu_header_at?: string | null
          menu_selections?: Json | null
          menu_tier?: string | null
          payment_auth_at?: string | null
          phone?: string | null
          portal_token?: string
          quote?: Json | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          updated_at?: string
          venue?: string | null
          wants_private_room?: boolean | null
        }
        Update: {
          addons?: Json | null
          adult_count?: number
          allergens?: string | null
          bar_duration?: string | null
          bar_type?: string | null
          beverage_strategy?: string | null
          bringing_cake?: boolean | null
          bringing_decor?: boolean | null
          company?: string | null
          contract_sent_at?: string | null
          contract_signed_at?: string | null
          course_choice?: string | null
          created_at?: string
          decide_later?: boolean | null
          email?: string
          event_date?: string | null
          event_time?: string | null
          full_name?: string
          guest_count?: number
          id?: string
          internal_notes?: string | null
          is_lunch?: boolean | null
          kids_count?: number
          menu_header_at?: string | null
          menu_selections?: Json | null
          menu_tier?: string | null
          payment_auth_at?: string | null
          phone?: string | null
          portal_token?: string
          quote?: Json | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          updated_at?: string
          venue?: string | null
          wants_private_room?: boolean | null
        }
        Relationships: []
      }
      menu_headers: {
        Row: {
          created_at: string
          event_id: string
          header_type: string
          id: string
          value: string | null
        }
        Insert: {
          created_at?: string
          event_id: string
          header_type: string
          id?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string
          header_type?: string
          id?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_headers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_authorizations: {
        Row: {
          card_last4: string
          cardholder_name: string
          created_at: string
          event_id: string
          exp_month: string
          exp_year: string
          id: string
          status: string
        }
        Insert: {
          card_last4: string
          cardholder_name: string
          created_at?: string
          event_id: string
          exp_month: string
          exp_year: string
          id?: string
          status?: string
        }
        Update: {
          card_last4?: string
          cardholder_name?: string
          created_at?: string
          event_id?: string
          exp_month?: string
          exp_year?: string
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_authorizations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
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
          role: Database["public"]["Enums"]["app_role"]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
      event_status:
        | "new_lead"
        | "quote_sent"
        | "contract_sent"
        | "confirmed"
        | "completed"
        | "cancelled"
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
      app_role: ["admin"],
      event_status: [
        "new_lead",
        "quote_sent",
        "contract_sent",
        "confirmed",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
