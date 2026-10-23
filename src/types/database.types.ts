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
      profiles: {
        Row: {
          id: string;
          user_id: string | null;
          profile_id: string;
          profile_for: string | null;
          gender: string | null;
          date_of_birth: string | null;
          first_name: string | null;
          last_name: string | null;
          display_name: string | null;
          height_cm: number | null;
          marital_status: string | null;
          mother_tongue: string | null;
          religion: string | null;
          community: string | null;
          sub_community: string | null;
          manglik_status: string | null;
          horoscope_available: boolean;
          about_me: string | null;
          city: string | null;
          district: string | null;
          state: string | null;
          country: string | null;
          education: string | null;
          college: string | null;
          occupation: string | null;
          company: string | null;
          annual_income: number | null;
          employment_type: string | null;
          diet: string | null;
          smoking: string | null;
          drinking: string | null;
          fitness: string | null;
          family_type: string | null;
          family_values: string | null;
          father_occupation: string | null;
          mother_occupation: string | null;
          siblings_count: number;
          brothers_count?: number;
          sisters_count?: number;
          native_place?: string | null;
          native_city?: string | null;
          native_district?: string | null;
          native_state?: string | null;
          hobbies?: string | null;
          work_location?: string | null;
          personality?: string | null;
          completion_percentage?: number;
          profile_photo_url: string | null;
          profile_status: string;
          verification_status: string;
          is_active: boolean;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>> & {
          profile_id: string;
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
        Relationships: [];
      };
      profile_photos: {
        Row: {
          id: string;
          profile_id: string;
          storage_path: string;
          photo_url: string | null;
          is_primary: boolean;
          is_approved: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profile_photos']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profile_photos']['Insert']>;
      };
      partner_preferences: {
        Row: {
          id: string;
          profile_id: string;
          min_age: number | null;
          max_age: number | null;
          min_height_cm: number | null;
          max_height_cm: number | null;
          marital_status: string | null;
          religion: string | null;
          community: string | null;
          sub_community: string | null;
          education: string | null;
          occupation: string | null;
          min_income: number | null;
          max_income: number | null;
          country: string | null;
          state: string | null;
          city: string | null;
          diet: string | null;
          smoking: string | null;
          drinking: string | null;
          manglik_status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['partner_preferences']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['partner_preferences']['Insert']>;
      };
      education_options: {
        Row: {
          id: string;
          name_en: string;
          name_mr: string;
          is_active: boolean;
          sort_order: number;
        };
      };
      occupation_options: {
        Row: {
          id: string;
          name_en: string;
          name_mr: string;
          is_active: boolean;
          sort_order: number;
        };
      };
      location_options: {
        Row: {
          id: string;
          country: string | null;
          state: string | null;
          district: string | null;
          city: string | null;
          name_en: string | null;
          name_mr: string | null;
          is_active: boolean;
        };
      };
      community_options: {
        Row: {
          id: string;
          name_en: string;
          name_mr: string;
          is_active: boolean;
          sort_order: number;
        };
      };
      interests: {
        Row: {
          id: string;
          sender_profile_id: string;
          receiver_profile_id: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['interests']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['interests']['Insert']>;
      };
      shortlists: {
        Row: {
          id: string;
          profile_id: string;
          shortlisted_profile_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['shortlists']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['shortlists']['Insert']>;
      };
      profile_views: {
        Row: {
          id: string;
          viewer_profile_id: string;
          viewed_profile_id: string;
          viewed_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profile_views']['Row'], 'id' | 'viewed_at'> & {
          id?: string;
          viewed_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profile_views']['Insert']>;
      };
      blocked_profiles: {
        Row: {
          id: string;
          profile_id: string;
          blocked_profile_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['blocked_profiles']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['blocked_profiles']['Insert']>;
      };
      profile_reports: {
        Row: {
          id: string;
          reporter_profile_id: string;
          reported_profile_id: string;
          reason: string | null;
          description: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profile_reports']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profile_reports']['Insert']>;
      };
      subscription_plans: {
        Row: {
          id: string;
          name_en: string;
          name_mr: string;
          description_en: string | null;
          description_mr: string | null;
          duration_days: number;
          price: number;
          currency: string;
          max_interests: number | null;
          can_view_contact: boolean;
          can_send_unlimited_interest: boolean;
          can_view_profile_views: boolean;
          can_use_advanced_search: boolean;
          can_send_messages: boolean;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          profile_id: string;
          plan_id: string;
          status: string;
          start_date: string | null;
          end_date: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      payments: {
        Row: {
          id: string;
          profile_id: string;
          subscription_id: string | null;
          amount: number;
          currency: string;
          payment_status: string;
          payment_gateway: string | null;
          gateway_order_id: string | null;
          gateway_payment_id: string | null;
          gateway_signature: string | null;
          paid_at: string | null;
          created_at: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          profile_id: string;
          type: string;
          title_en: string | null;
          title_mr: string | null;
          message_en: string | null;
          message_mr: string | null;
          is_read: boolean;
          created_at: string;
        };
      };
      success_stories: {
        Row: {
          id: string;
          title_en: string | null;
          title_mr: string | null;
          description_en: string | null;
          description_mr: string | null;
          image_url: string | null;
          is_published: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
