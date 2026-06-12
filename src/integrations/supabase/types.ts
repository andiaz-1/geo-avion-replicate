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
          location_id: string | null
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
          location_id?: string | null
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
          location_id?: string | null
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
          {
            foreignKeyName: "contracts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_messages: {
        Row: {
          audience: string
          author_name: string | null
          body: string
          created_at: string
          discussion_id: string
          event_id: string
          id: string
        }
        Insert: {
          audience?: string
          author_name?: string | null
          body: string
          created_at?: string
          discussion_id: string
          event_id: string
          id?: string
        }
        Update: {
          audience?: string
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
          audience: string
          author_name: string | null
          created_at: string
          event_id: string
          id: string
          location_id: string | null
          message_count: number
          title: string
          updated_at: string
        }
        Insert: {
          audience?: string
          author_name?: string | null
          created_at?: string
          event_id: string
          id?: string
          location_id?: string | null
          message_count?: number
          title: string
          updated_at?: string
        }
        Update: {
          audience?: string
          author_name?: string | null
          created_at?: string
          event_id?: string
          id?: string
          location_id?: string | null
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
          {
            foreignKeyName: "discussions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
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
          location_id: string | null
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
          location_id?: string | null
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
          location_id?: string | null
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
          {
            foreignKeyName: "event_contacts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
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
          area: string | null
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
          location_id: string | null
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
          portal_unlocked: boolean
          quote: Json | null
          service_charge: number | null
          signature_name: string | null
          special_requests: string | null
          status: Database["public"]["Enums"]["event_status"]
          subtotal: number | null
          tax_amount: number | null
          updated_at: string
          venue: string | null
          venue_fee: number | null
          wants_private_room: boolean | null
        }
        Insert: {
          addons?: Json | null
          adult_count?: number
          allergens?: string | null
          antipasti_selections?: string[] | null
          area?: string | null
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
          location_id?: string | null
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
          portal_unlocked?: boolean
          quote?: Json | null
          service_charge?: number | null
          signature_name?: string | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          subtotal?: number | null
          tax_amount?: number | null
          updated_at?: string
          venue?: string | null
          venue_fee?: number | null
          wants_private_room?: boolean | null
        }
        Update: {
          addons?: Json | null
          adult_count?: number
          allergens?: string | null
          antipasti_selections?: string[] | null
          area?: string | null
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
          location_id?: string | null
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
          portal_unlocked?: boolean
          quote?: Json | null
          service_charge?: number | null
          signature_name?: string | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          subtotal?: number | null
          tax_amount?: number | null
          updated_at?: string
          venue?: string | null
          venue_fee?: number | null
          wants_private_room?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "events_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      location_addons: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          location_id: string
          max_qty: number | null
          name: string
          photo_url: string | null
          price: number
          price_type: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          location_id: string
          max_qty?: number | null
          name: string
          photo_url?: string | null
          price?: number
          price_type?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          location_id?: string
          max_qty?: number | null
          name?: string
          photo_url?: string | null
          price?: number
          price_type?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_addons_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      location_areas: {
        Row: {
          base_fee: number | null
          created_at: string
          description: string | null
          fnb_minimum: number | null
          id: string
          is_active: boolean
          location_id: string
          max_guests: number | null
          min_guests: number | null
          name: string
          photo_url: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          base_fee?: number | null
          created_at?: string
          description?: string | null
          fnb_minimum?: number | null
          id?: string
          is_active?: boolean
          location_id: string
          max_guests?: number | null
          min_guests?: number | null
          name: string
          photo_url?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          base_fee?: number | null
          created_at?: string
          description?: string | null
          fnb_minimum?: number | null
          id?: string
          is_active?: boolean
          location_id?: string
          max_guests?: number | null
          min_guests?: number | null
          name?: string
          photo_url?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_areas_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      location_beverage_packages: {
        Row: {
          created_at: string
          description: string | null
          duration_hours: number | null
          id: string
          inclusions: string[]
          is_active: boolean
          location_id: string
          min_spend: number | null
          name: string
          package_type: string
          price_per_person: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          inclusions?: string[]
          is_active?: boolean
          location_id: string
          min_spend?: number | null
          name: string
          package_type?: string
          price_per_person?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          inclusions?: string[]
          is_active?: boolean
          location_id?: string
          min_spend?: number | null
          name?: string
          package_type?: string
          price_per_person?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_beverage_packages_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      location_contract_templates: {
        Row: {
          body: string
          created_at: string
          deposit_required: boolean
          id: string
          is_default: boolean
          location_id: string | null
          name: string
          signature_required: boolean
          source: string
          terms: string | null
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          deposit_required?: boolean
          id?: string
          is_default?: boolean
          location_id?: string | null
          name: string
          signature_required?: boolean
          source?: string
          terms?: string | null
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          deposit_required?: boolean
          id?: string
          is_default?: boolean
          location_id?: string | null
          name?: string
          signature_required?: boolean
          source?: string
          terms?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_contract_templates_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      location_faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          id: string
          is_active: boolean
          location_id: string
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          location_id: string
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          location_id?: string
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_faqs_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      location_form_config: {
        Row: {
          allergies_enabled: boolean
          created_at: string
          custom_fields: Json
          dietary_enabled: boolean
          id: string
          location_id: string
          special_requests_enabled: boolean
          steps: Json
          updated_at: string
        }
        Insert: {
          allergies_enabled?: boolean
          created_at?: string
          custom_fields?: Json
          dietary_enabled?: boolean
          id?: string
          location_id: string
          special_requests_enabled?: boolean
          steps?: Json
          updated_at?: string
        }
        Update: {
          allergies_enabled?: boolean
          created_at?: string
          custom_fields?: Json
          dietary_enabled?: boolean
          id?: string
          location_id?: string
          special_requests_enabled?: boolean
          steps?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_form_config_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: true
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      location_menu_courses: {
        Row: {
          created_at: string
          id: string
          location_id: string
          max_selections: number
          name: string
          sort_order: number
          tier_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_id: string
          max_selections?: number
          name: string
          sort_order?: number
          tier_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          location_id?: string
          max_selections?: number
          name?: string
          sort_order?: number
          tier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_menu_courses_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_menu_courses_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "location_menu_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      location_menu_items: {
        Row: {
          allergens: string[]
          course_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          location_id: string
          name: string
          photo_url: string | null
          sort_order: number
          upcharge: number
          updated_at: string
        }
        Insert: {
          allergens?: string[]
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          location_id: string
          name: string
          photo_url?: string | null
          sort_order?: number
          upcharge?: number
          updated_at?: string
        }
        Update: {
          allergens?: string[]
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          location_id?: string
          name?: string
          photo_url?: string | null
          sort_order?: number
          upcharge?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_menu_items_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "location_menu_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_menu_items_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      location_menu_tiers: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          location_id: string
          name: string
          photo_url: string | null
          price_per_person: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          location_id: string
          name: string
          photo_url?: string | null
          price_per_person?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          location_id?: string
          name?: string
          photo_url?: string | null
          price_per_person?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_menu_tiers_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          about_text: string | null
          address: string | null
          buyout_threshold: number | null
          color_accent: string
          color_bg: string
          color_primary: string
          color_secondary: string
          color_text: string
          created_at: string
          deposit_pct: number
          email: string | null
          favicon_url: string | null
          font_body: string
          font_subtitle: string
          font_title: string
          gallery: Json
          hero_image_url: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          max_guests: number
          min_guests: number
          name: string
          phone: string | null
          published: boolean
          service_charge_pct: number
          slug: string
          tagline: string | null
          tax_pct: number
          timezone: string
          updated_at: string
        }
        Insert: {
          about_text?: string | null
          address?: string | null
          buyout_threshold?: number | null
          color_accent?: string
          color_bg?: string
          color_primary?: string
          color_secondary?: string
          color_text?: string
          created_at?: string
          deposit_pct?: number
          email?: string | null
          favicon_url?: string | null
          font_body?: string
          font_subtitle?: string
          font_title?: string
          gallery?: Json
          hero_image_url?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          max_guests?: number
          min_guests?: number
          name: string
          phone?: string | null
          published?: boolean
          service_charge_pct?: number
          slug: string
          tagline?: string | null
          tax_pct?: number
          timezone?: string
          updated_at?: string
        }
        Update: {
          about_text?: string | null
          address?: string | null
          buyout_threshold?: number | null
          color_accent?: string
          color_bg?: string
          color_primary?: string
          color_secondary?: string
          color_text?: string
          created_at?: string
          deposit_pct?: number
          email?: string | null
          favicon_url?: string | null
          font_body?: string
          font_subtitle?: string
          font_title?: string
          gallery?: Json
          hero_image_url?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          max_guests?: number
          min_guests?: number
          name?: string
          phone?: string | null
          published?: boolean
          service_charge_pct?: number
          slug?: string
          tagline?: string | null
          tax_pct?: number
          timezone?: string
          updated_at?: string
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
          location_id: string | null
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
          location_id?: string | null
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
          location_id?: string | null
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
          {
            foreignKeyName: "payment_authorizations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          location_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location_id?: string | null
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
      has_location_access: {
        Args: { _location_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "super_admin" | "location_admin"
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
      app_role: ["admin", "super_admin", "location_admin"],
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
