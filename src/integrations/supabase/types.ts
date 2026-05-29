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
      discussion_messages: {
        Row: {
          author_name: string | null
          body: string
          created_at: string
          discussion_id: string
          event_id: string
          id: string
        }
        Insert: {
          author_name?: string | null
          body: string
          created_at?: string
          discussion_id: string
          event_id: string
          id?: string
        }
        Update: {
          author_name?: string | null
          body?: string
          created_at?: string
          discussion_id?: string
          event_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_messages_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_messages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      discussions: {
        Row: {
          author_name: string | null
          created_at: string
          event_id: string
          id: string
          message_count: number
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string | null
          created_at?: string
          event_id: string
          id?: string
          message_count?: number
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string | null
          created_at?: string
          event_id?: string
          id?: string
          message_count?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_contacts: {
        Row: {
          company_name: string | null
          created_at: string
          email_1: string | null
          email_2: string | null
          event_id: string
          first_name: string
          id: string
          is_main: boolean | null
          last_name: string | null
          phone: string | null
          position: string | null
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email_1?: string | null
          email_2?: string | null
          event_id: string
          first_name: string
          id?: string
          is_main?: boolean | null
          last_name?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email_1?: string | null
          email_2?: string | null
          event_id?: string
          first_name?: string
          id?: string
          is_main?: boolean | null
          last_name?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_contacts_event_id_fkey"
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
          antipasti_selections: string[] | null
          bar_duration: string | null
          bar_type: string | null
          beverage_package: string | null
          beverage_strategy: string | null
          bringing_cake: boolean | null
          bringing_decor: boolean | null
          cc_auth_date: string | null
          cc_auth_status: string | null
          cc_last_four: string | null
          children_attending: boolean | null
          client_first_name: string | null
          client_last_name: string | null
          company: string | null
          contract_sent_at: string | null
          contract_signed_at: string | null
          contract_status: string | null
          course_choice: string | null
          created_at: string
          decide_later: boolean | null
          deposit_amount: number | null
          dessert_selections: string[] | null
          email: string
          entree_selections: string[] | null
          estimated_total: number | null
          event_date: string | null
          event_name: string | null
          event_time: string | null
          event_type: string | null
          fnb_minimum: number | null
          full_name: string
          guest_count: number
          id: string
          internal_notes: string | null
          is_lunch: boolean | null
          kids_count: number
          menu_header_at: string | null
          menu_header_file: string | null
          menu_header_text: string | null
          menu_header_type: string | null
          menu_selections: Json | null
          menu_tier: string | null
          notes: string | null
          payment_auth_at: string | null
          phone: string | null
          portal_token: string
          quote: Json | null
          service_charge: number | null
          signature_name: string | null
          special_requests: string | null
          status: Database["public"]["Enums"]["event_status"]
          subtotal: number | null
          tax_amount: number | null
          updated_at: string
          venue: string | null
          wants_private_room: boolean | null
        }
        Insert: {
          addons?: Json | null
          adult_count?: number
          allergens?: string | null
          antipasti_selections?: string[] | null
          bar_duration?: string | null
          bar_type?: string | null
          beverage_package?: string | null
          beverage_strategy?: string | null
          bringing_cake?: boolean | null
          bringing_decor?: boolean | null
          cc_auth_date?: string | null
          cc_auth_status?: string | null
          cc_last_four?: string | null
          children_attending?: boolean | null
          client_first_name?: string | null
          client_last_name?: string | null
          company?: string | null
          contract_sent_at?: string | null
          contract_signed_at?: string | null
          contract_status?: string | null
          course_choice?: string | null
          created_at?: string
          decide_later?: boolean | null
          deposit_amount?: number | null
          dessert_selections?: string[] | null
          email: string
          entree_selections?: string[] | null
          estimated_total?: number | null
          event_date?: string | null
          event_name?: string | null
          event_time?: string | null
          event_type?: string | null
          fnb_minimum?: number | null
          full_name: string
          guest_count?: number
          id?: string
          internal_notes?: string | null
          is_lunch?: boolean | null
          kids_count?: number
          menu_header_at?: string | null
          menu_header_file?: string | null
          menu_header_text?: string | null
          menu_header_type?: string | null
          menu_selections?: Json | null
          menu_tier?: string | null
          notes?: string | null
          payment_auth_at?: string | null
          phone?: string | null
          portal_token?: string
          quote?: Json | null
          service_charge?: number | null
          signature_name?: string | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          subtotal?: number | null
          tax_amount?: number | null
          updated_at?: string
          venue?: string | null
          wants_private_room?: boolean | null
        }
        Update: {
          addons?: Json | null
          adult_count?: number
          allergens?: string | null
          antipasti_selections?: string[] | null
          bar_duration?: string | null
          bar_type?: string | null
          beverage_package?: string | null
          beverage_strategy?: string | null
          bringing_cake?: boolean | null
          bringing_decor?: boolean | null
          cc_auth_date?: string | null
          cc_auth_status?: string | null
          cc_last_four?: string | null
          children_attending?: boolean | null
          client_first_name?: string | null
          client_last_name?: string | null
          company?: string | null
          contract_sent_at?: string | null
          contract_signed_at?: string | null
          contract_status?: string | null
          course_choice?: string | null
          created_at?: string
          decide_later?: boolean | null
          deposit_amount?: number | null
          dessert_selections?: string[] | null
          email?: string
          entree_selections?: string[] | null
          estimated_total?: number | null
          event_date?: string | null
          event_name?: string | null
          event_time?: string | null
          event_type?: string | null
          fnb_minimum?: number | null
          full_name?: string
          guest_count?: number
          id?: string
          internal_notes?: string | null
          is_lunch?: boolean | null
          kids_count?: number
          menu_header_at?: string | null
          menu_header_file?: string | null
          menu_header_text?: string | null
          menu_header_type?: string | null
          menu_selections?: Json | null
          menu_tier?: string | null
          notes?: string | null
          payment_auth_at?: string | null
          phone?: string | null
          portal_token?: string
          quote?: Json | null
          service_charge?: number | null
          signature_name?: string | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          subtotal?: number | null
          tax_amount?: number | null
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
