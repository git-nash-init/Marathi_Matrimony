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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["admin_role_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["admin_role_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["admin_role_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_role: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_entity: string
          target_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_role?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_entity: string
          target_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_role?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_entity?: string
          target_id?: string
        }
        Relationships: []
      }
      contact_inquiries: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_unlocks: {
        Row: {
          created_at: string
          id: string
          subscription_id: string | null
          unlocked_profile_id: string
          unlocker_profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          subscription_id?: string | null
          unlocked_profile_id: string
          unlocker_profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          subscription_id?: string | null
          unlocked_profile_id?: string
          unlocker_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_unlocks_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_unlocks_unlocked_profile_id_fkey"
            columns: ["unlocked_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_unlocks_unlocker_profile_id_fkey"
            columns: ["unlocker_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          last_read_at: string
          profile_id: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          last_read_at?: string
          profile_id: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          last_read_at?: string
          profile_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          last_message_text: string | null
          participant_one_id: string
          participant_two_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          last_message_text?: string | null
          participant_one_id: string
          participant_two_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          last_message_text?: string | null
          participant_one_id?: string
          participant_two_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_participant_one_id_fkey"
            columns: ["participant_one_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_two_id_fkey"
            columns: ["participant_two_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_type: Database["public"]["Enums"]["discount_type_enum"]
          discount_value: number
          id: string
          is_active: boolean
          max_uses: number
          updated_at: string
          used_count: number
          valid_from: string
          valid_until: string
        }
        Insert: {
          code: string
          created_at?: string
          discount_type?: Database["public"]["Enums"]["discount_type_enum"]
          discount_value: number
          id?: string
          is_active?: boolean
          max_uses?: number
          updated_at?: string
          used_count?: number
          valid_from?: string
          valid_until: string
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: Database["public"]["Enums"]["discount_type_enum"]
          discount_value?: number
          id?: string
          is_active?: boolean
          max_uses?: number
          updated_at?: string
          used_count?: number
          valid_from?: string
          valid_until?: string
        }
        Relationships: []
      }
      interests: {
        Row: {
          created_at: string
          custom_message: string | null
          id: string
          receiver_profile_id: string
          sender_profile_id: string
          status: Database["public"]["Enums"]["interest_status_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_message?: string | null
          id?: string
          receiver_profile_id: string
          sender_profile_id: string
          status?: Database["public"]["Enums"]["interest_status_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_message?: string | null
          id?: string
          receiver_profile_id?: string
          sender_profile_id?: string
          status?: Database["public"]["Enums"]["interest_status_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interests_receiver_profile_id_fkey"
            columns: ["receiver_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interests_sender_profile_id_fkey"
            columns: ["sender_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          conversation_id: string
          created_at: string
          deleted_at: string | null
          id: string
          is_deleted: boolean
          message_text: string
          message_type: string
          sender_id: string
          sender_profile_id: string
          updated_at: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean
          message_text: string
          message_type?: string
          sender_id: string
          sender_profile_id: string
          updated_at?: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean
          message_text?: string
          message_type?: string
          sender_id?: string
          sender_profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_profile_id_fkey"
            columns: ["sender_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_reports: {
        Row: {
          conversation_id: string | null
          created_at: string
          details: string | null
          id: string
          message_id: string | null
          reason: string
          reported_profile_id: string
          reporter_profile_id: string
          status: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          details?: string | null
          id?: string
          message_id?: string | null
          reason: string
          reported_profile_id: string
          reporter_profile_id: string
          status?: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          details?: string | null
          id?: string
          message_id?: string | null
          reason?: string
          reported_profile_id?: string
          reporter_profile_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_reports_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_reports_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_reports_reported_profile_id_fkey"
            columns: ["reported_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_reports_reporter_profile_id_fkey"
            columns: ["reporter_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_preferences: {
        Row: {
          created_at: string
          id: string
          max_age: number
          max_height: number
          min_age: number
          min_height: number
          other_preferences: string | null
          preferred_cities: string[] | null
          preferred_community: string[] | null
          preferred_education: string[] | null
          preferred_marital_status:
            | Database["public"]["Enums"]["marital_status_type"][]
            | null
          preferred_occupation: string[] | null
          preferred_religion: string[] | null
          preferred_states: string[] | null
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_age?: number
          max_height?: number
          min_age?: number
          min_height?: number
          other_preferences?: string | null
          preferred_cities?: string[] | null
          preferred_community?: string[] | null
          preferred_education?: string[] | null
          preferred_marital_status?:
            | Database["public"]["Enums"]["marital_status_type"][]
            | null
          preferred_occupation?: string[] | null
          preferred_religion?: string[] | null
          preferred_states?: string[] | null
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          max_age?: number
          max_height?: number
          min_age?: number
          min_height?: number
          other_preferences?: string | null
          preferred_cities?: string[] | null
          preferred_community?: string[] | null
          preferred_education?: string[] | null
          preferred_marital_status?:
            | Database["public"]["Enums"]["marital_status_type"][]
            | null
          preferred_occupation?: string[] | null
          preferred_religion?: string[] | null
          preferred_states?: string[] | null
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          gateway: string
          gateway_order_id: string
          gateway_payment_id: string | null
          id: string
          paid_at: string | null
          payment_method: string | null
          plan_id: string | null
          raw_response: Json | null
          status: Database["public"]["Enums"]["payment_status_type"]
          subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          gateway?: string
          gateway_order_id: string
          gateway_payment_id?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          plan_id?: string | null
          raw_response?: Json | null
          status?: Database["public"]["Enums"]["payment_status_type"]
          subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          gateway?: string
          gateway_order_id?: string
          gateway_payment_id?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          plan_id?: string | null
          raw_response?: Json | null
          status?: Database["public"]["Enums"]["payment_status_type"]
          subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      profile_boosts: {
        Row: {
          created_at: string
          end_date: string
          id: string
          start_date: string
          status: Database["public"]["Enums"]["boost_status_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["boost_status_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["boost_status_type"]
          user_id?: string
        }
        Relationships: []
      }
      profile_contacts: {
        Row: {
          address_line: string | null
          contact_person: string | null
          convenient_time_to_call: string | null
          created_at: string
          email: string
          id: string
          phone_number: string | null
          profile_id: string
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          address_line?: string | null
          contact_person?: string | null
          convenient_time_to_call?: string | null
          created_at?: string
          email: string
          id?: string
          phone_number?: string | null
          profile_id: string
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          address_line?: string | null
          contact_person?: string | null
          convenient_time_to_call?: string | null
          created_at?: string
          email?: string
          id?: string
          phone_number?: string | null
          profile_id?: string
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_contacts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_photos: {
        Row: {
          approval_status: Database["public"]["Enums"]["photo_approval_type"]
          created_at: string
          display_order: number
          id: string
          is_primary: boolean
          photo_type: string
          profile_id: string
          storage_path: string
          updated_at: string
          visibility: Database["public"]["Enums"]["photo_visibility_type"]
        }
        Insert: {
          approval_status?: Database["public"]["Enums"]["photo_approval_type"]
          created_at?: string
          display_order?: number
          id?: string
          is_primary?: boolean
          photo_type?: string
          profile_id: string
          storage_path: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["photo_visibility_type"]
        }
        Update: {
          approval_status?: Database["public"]["Enums"]["photo_approval_type"]
          created_at?: string
          display_order?: number
          id?: string
          is_primary?: boolean
          photo_type?: string
          profile_id?: string
          storage_path?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["photo_visibility_type"]
        }
        Relationships: [
          {
            foreignKeyName: "profile_photos_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          created_at: string
          id: string
          viewed_profile_id: string
          viewer_profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          viewed_profile_id: string
          viewer_profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          viewed_profile_id?: string
          viewer_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_views_viewed_profile_id_fkey"
            columns: ["viewed_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_views_viewer_profile_id_fkey"
            columns: ["viewer_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          about_me: string | null
          additional_qualifications: string | null
          age: number | null
          brothers_count: number | null
          city: string | null
          college: string | null
          community: string | null
          company: string | null
          completion_percentage: number | null
          country: string
          created_at: string
          created_by: string
          date_of_birth: string | null
          diet: string
          drinking: string | null
          education: string | null
          education_detail: string | null
          employed_in: string
          family_description: string | null
          family_location: string | null
          family_status: string | null
          family_type: string | null
          father_occupation: string | null
          featured_until: string | null
          first_name: string
          gender: Database["public"]["Enums"]["gender_type"]
          gothra: string | null
          height: number | null
          hobbies: string[] | null
          id: string
          income: string | null
          is_featured: boolean
          languages_spoken: string[] | null
          last_name: string
          lifestyle_interests: string[] | null
          marital_status: Database["public"]["Enums"]["marital_status_type"]
          married_brothers_count: number | null
          married_sisters_count: number | null
          mother_occupation: string | null
          mother_tongue: string
          occupation: string | null
          profile_id: string
          profile_status: Database["public"]["Enums"]["profile_status_type"]
          profile_visibility: Database["public"]["Enums"]["profile_visibility_type"]
          rejection_reason: string | null
          religion: string
          sisters_count: number | null
          smoking: string | null
          state: string
          sub_community: string | null
          updated_at: string
          user_id: string
          verification_status: Database["public"]["Enums"]["verification_status_type"]
          work_location: string | null
        }
        Insert: {
          about_me?: string | null
          additional_qualifications?: string | null
          age?: number | null
          brothers_count?: number | null
          city?: string | null
          college?: string | null
          community?: string | null
          company?: string | null
          completion_percentage?: number | null
          country?: string
          created_at?: string
          created_by?: string
          date_of_birth?: string | null
          diet?: string
          drinking?: string | null
          education?: string | null
          education_detail?: string | null
          employed_in?: string
          family_description?: string | null
          family_location?: string | null
          family_status?: string | null
          family_type?: string | null
          father_occupation?: string | null
          featured_until?: string | null
          first_name: string
          gender: Database["public"]["Enums"]["gender_type"]
          gothra?: string | null
          height?: number | null
          hobbies?: string[] | null
          id?: string
          income?: string | null
          is_featured?: boolean
          languages_spoken?: string[] | null
          last_name: string
          lifestyle_interests?: string[] | null
          marital_status?: Database["public"]["Enums"]["marital_status_type"]
          married_brothers_count?: number | null
          married_sisters_count?: number | null
          mother_occupation?: string | null
          mother_tongue?: string
          occupation?: string | null
          profile_id?: string
          profile_status?: Database["public"]["Enums"]["profile_status_type"]
          profile_visibility?: Database["public"]["Enums"]["profile_visibility_type"]
          rejection_reason?: string | null
          religion?: string
          sisters_count?: number | null
          smoking?: string | null
          state?: string
          sub_community?: string | null
          updated_at?: string
          user_id: string
          verification_status?: Database["public"]["Enums"]["verification_status_type"]
          work_location?: string | null
        }
        Update: {
          about_me?: string | null
          additional_qualifications?: string | null
          age?: number | null
          brothers_count?: number | null
          city?: string | null
          college?: string | null
          community?: string | null
          company?: string | null
          completion_percentage?: number | null
          country?: string
          created_at?: string
          created_by?: string
          date_of_birth?: string | null
          diet?: string
          drinking?: string | null
          education?: string | null
          education_detail?: string | null
          employed_in?: string
          family_description?: string | null
          family_location?: string | null
          family_status?: string | null
          family_type?: string | null
          father_occupation?: string | null
          featured_until?: string | null
          first_name?: string
          gender?: Database["public"]["Enums"]["gender_type"]
          gothra?: string | null
          height?: number | null
          hobbies?: string[] | null
          id?: string
          income?: string | null
          is_featured?: boolean
          languages_spoken?: string[] | null
          last_name?: string
          lifestyle_interests?: string[] | null
          marital_status?: Database["public"]["Enums"]["marital_status_type"]
          married_brothers_count?: number | null
          married_sisters_count?: number | null
          mother_occupation?: string | null
          mother_tongue?: string
          occupation?: string | null
          profile_id?: string
          profile_status?: Database["public"]["Enums"]["profile_status_type"]
          profile_visibility?: Database["public"]["Enums"]["profile_visibility_type"]
          rejection_reason?: string | null
          religion?: string
          sisters_count?: number | null
          smoking?: string | null
          state?: string
          sub_community?: string | null
          updated_at?: string
          user_id?: string
          verification_status?: Database["public"]["Enums"]["verification_status_type"]
          work_location?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string | null
          id: string
          reason: string
          reported_user_id: string
          reporter_user_id: string
          reviewed_by: string | null
          status: Database["public"]["Enums"]["report_status_type"]
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reported_user_id: string
          reporter_user_id: string
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status_type"]
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reported_user_id?: string
          reporter_user_id?: string
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status_type"]
          updated_at?: string
        }
        Relationships: []
      }
      shortlists: {
        Row: {
          created_at: string
          id: string
          shortlisted_profile_id: string
          user_profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          shortlisted_profile_id: string
          user_profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          shortlisted_profile_id?: string
          user_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shortlists_shortlisted_profile_id_fkey"
            columns: ["shortlisted_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shortlists_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          discounted_price: number | null
          duration_days: number
          features: Json
          id: string
          is_active: boolean
          name: string
          price: number
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discounted_price?: number | null
          duration_days: number
          features?: Json
          id?: string
          is_active?: boolean
          name: string
          price: number
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discounted_price?: number | null
          duration_days?: number
          features?: Json
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          auto_renew: boolean
          created_at: string
          end_date: string
          feature_usage: Json
          id: string
          payment_id: string | null
          plan_id: string
          start_date: string
          status: Database["public"]["Enums"]["subscription_status_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_renew?: boolean
          created_at?: string
          end_date: string
          feature_usage?: Json
          id?: string
          payment_id?: string | null
          plan_id: string
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_renew?: boolean
          created_at?: string
          end_date?: string
          feature_usage?: Json
          id?: string
          payment_id?: string | null
          plan_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_blocks: {
        Row: {
          blocked_profile_id: string
          blocker_profile_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_profile_id: string
          blocker_profile_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_profile_id?: string
          blocker_profile_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_blocks_blocked_profile_id_fkey"
            columns: ["blocked_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_blocks_blocker_profile_id_fkey"
            columns: ["blocker_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verifications: {
        Row: {
          document_paths: string[]
          id: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["verification_status_type"]
          submitted_at: string
          user_id: string
          verification_type: Database["public"]["Enums"]["verification_type_enum"]
        }
        Insert: {
          document_paths?: string[]
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_status_type"]
          submitted_at?: string
          user_id: string
          verification_type?: Database["public"]["Enums"]["verification_type_enum"]
        }
        Update: {
          document_paths?: string[]
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_status_type"]
          submitted_at?: string
          user_id?: string
          verification_type?: Database["public"]["Enums"]["verification_type_enum"]
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string
          error_message: string | null
          event_id: string
          event_type: string
          gateway: string
          id: string
          payload: Json
          processed_at: string
          status: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_id: string
          event_type: string
          gateway?: string
          id?: string
          payload: Json
          processed_at?: string
          status?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_id?: string
          event_type?: string
          gateway?: string
          id?: string
          payload?: Json
          processed_at?: string
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_user_subscription: {
        Args: { p_payment_id?: string; p_plan_id: string; p_user_id: string }
        Returns: string
      }
      admin_approve_profile: {
        Args: {
          p_admin_user_id: string
          p_notes?: string
          p_profile_id: string
        }
        Returns: boolean
      }
      admin_moderate_photo: {
        Args: {
          p_admin_user_id: string
          p_notes?: string
          p_photo_id: string
          p_status: string
        }
        Returns: boolean
      }
      admin_reject_profile: {
        Args: {
          p_admin_user_id: string
          p_profile_id: string
          p_reason: string
        }
        Returns: boolean
      }
      admin_resolve_report: {
        Args: {
          p_action_taken?: string
          p_admin_user_id: string
          p_notes?: string
          p_report_id: string
          p_status: string
        }
        Returns: boolean
      }
      admin_toggle_user_suspension: {
        Args: {
          p_admin_user_id: string
          p_profile_id: string
          p_reason?: string
          p_suspend: boolean
        }
        Returns: boolean
      }
      check_user_entitlement: {
        Args: { p_feature_key: string; p_user_id: string }
        Returns: Json
      }
      generate_public_profile_id: { Args: never; Returns: string }
      get_my_profile_id: { Args: never; Returns: string }
      get_or_create_conversation: {
        Args: { p_caller_user_id: string; p_target_profile_id: string }
        Returns: string
      }
      is_admin: { Args: { p_user_id?: string }; Returns: boolean }
      is_profile_complete: { Args: { p_user_id: string }; Returns: boolean }
      record_profile_view: {
        Args: { p_viewed_profile_id: string; p_viewer_profile_id: string }
        Returns: boolean
      }
      submit_profile_for_approval: {
        Args: { p_user_id: string }
        Returns: Json
      }
      unlock_profile_contact: {
        Args: { p_target_profile_id: string }
        Returns: Json
      }
    }
    Enums: {
      admin_role_type: "super_admin" | "admin" | "moderator" | "support"
      boost_status_type: "active" | "expired" | "cancelled"
      discount_type_enum: "percentage" | "fixed_amount"
      gender_type: "male" | "female" | "other"
      interest_status_type:
        | "pending"
        | "accepted"
        | "declined"
        | "withdrawn"
        | "cancelled"
      marital_status_type:
        | "never_married"
        | "divorced"
        | "widowed"
        | "awaiting_divorce"
      payment_status_type:
        | "created"
        | "pending"
        | "authorized"
        | "captured"
        | "failed"
        | "refunded"
      photo_approval_type: "pending" | "approved" | "rejected"
      photo_visibility_type:
        | "public"
        | "accepted_interests_only"
        | "blurred"
        | "private"
      profile_status_type:
        | "draft"
        | "pending_approval"
        | "approved"
        | "rejected"
        | "suspended"
        | "deactivated"
      profile_visibility_type:
        | "public"
        | "registered_only"
        | "premium_only"
        | "hidden"
      report_status_type: "pending" | "under_review" | "resolved" | "dismissed"
      subscription_status_type:
        | "active"
        | "expired"
        | "cancelled"
        | "past_due"
        | "trialing"
      verification_status_type:
        | "unverified"
        | "pending"
        | "verified"
        | "rejected"
      verification_type_enum:
        | "government_id"
        | "selfie"
        | "education"
        | "income"
        | "address"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      admin_role_type: ["super_admin", "admin", "moderator", "support"],
      boost_status_type: ["active", "expired", "cancelled"],
      discount_type_enum: ["percentage", "fixed_amount"],
      gender_type: ["male", "female", "other"],
      interest_status_type: [
        "pending",
        "accepted",
        "declined",
        "withdrawn",
        "cancelled",
      ],
      marital_status_type: [
        "never_married",
        "divorced",
        "widowed",
        "awaiting_divorce",
      ],
      payment_status_type: [
        "created",
        "pending",
        "authorized",
        "captured",
        "failed",
        "refunded",
      ],
      photo_approval_type: ["pending", "approved", "rejected"],
      photo_visibility_type: [
        "public",
        "accepted_interests_only",
        "blurred",
        "private",
      ],
      profile_status_type: [
        "draft",
        "pending_approval",
        "approved",
        "rejected",
        "suspended",
        "deactivated",
      ],
      profile_visibility_type: [
        "public",
        "registered_only",
        "premium_only",
        "hidden",
      ],
      report_status_type: ["pending", "under_review", "resolved", "dismissed"],
      subscription_status_type: [
        "active",
        "expired",
        "cancelled",
        "past_due",
        "trialing",
      ],
      verification_status_type: [
        "unverified",
        "pending",
        "verified",
        "rejected",
      ],
      verification_type_enum: [
        "government_id",
        "selfie",
        "education",
        "income",
        "address",
      ],
    },
  },
} as const
