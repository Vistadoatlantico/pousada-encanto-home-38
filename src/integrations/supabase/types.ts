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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      about_content: {
        Row: {
          created_at: string
          footer_text: string
          highlight_text: string
          id: string
          main_text: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          footer_text: string
          highlight_text: string
          id?: string
          main_text: string
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          footer_text?: string
          highlight_text?: string
          id?: string
          main_text?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      birthday_modal_config: {
        Row: {
          available_month: number
          available_year: number
          benefits: Json
          created_at: string
          id: string
          important_info: Json
          is_active: boolean
          subtitle: string
          title: string
          updated_at: string
        }
        Insert: {
          available_month?: number
          available_year?: number
          benefits?: Json
          created_at?: string
          id?: string
          important_info?: Json
          is_active?: boolean
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Update: {
          available_month?: number
          available_year?: number
          benefits?: Json
          created_at?: string
          id?: string
          important_info?: Json
          is_active?: boolean
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      birthday_reservations: {
        Row: {
          birth_date: string
          companion_names: Json | null
          companions: number | null
          cpf: string
          created_at: string
          email: string
          full_name: string
          id: string
          notes: string | null
          status: string
          updated_at: string
          visit_date: string
          whatsapp: string
        }
        Insert: {
          birth_date: string
          companion_names?: Json | null
          companions?: number | null
          cpf: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          visit_date: string
          whatsapp: string
        }
        Update: {
          birth_date?: string
          companion_names?: Json | null
          companions?: number | null
          cpf?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          visit_date?: string
          whatsapp?: string
        }
        Relationships: []
      }
      carousel_images: {
        Row: {
          alt_text: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          media_type: string
          media_url: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          media_type: string
          media_url: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          media_type?: string
          media_url?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      hero_content: {
        Row: {
          background_image_url: string | null
          created_at: string
          cta_text: string
          id: string
          logo_text: string
          main_title: string
          subtitle: string
          updated_at: string
        }
        Insert: {
          background_image_url?: string | null
          created_at?: string
          cta_text?: string
          id?: string
          logo_text?: string
          main_title?: string
          subtitle?: string
          updated_at?: string
        }
        Update: {
          background_image_url?: string | null
          created_at?: string
          cta_text?: string
          id?: string
          logo_text?: string
          main_title?: string
          subtitle?: string
          updated_at?: string
        }
        Relationships: []
      }
      location_content: {
        Row: {
          address: string
          created_at: string
          cta_text: string
          description: string
          email: string
          id: string
          location_name: string
          rating: string
          reviews_count: string
          title: string
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          cta_text?: string
          description: string
          email?: string
          id?: string
          location_name?: string
          rating?: string
          reviews_count?: string
          title?: string
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          cta_text?: string
          description?: string
          email?: string
          id?: string
          location_name?: string
          rating?: string
          reviews_count?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          price: number
          stock_quantity: number | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          price: number
          stock_quantity?: number | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          price?: number
          stock_quantity?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          amenities: string[] | null
          created_at: string
          description: string
          display_order: number | null
          id: string
          images: string[] | null
          is_active: boolean | null
          name: string
          price: string
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          created_at?: string
          description: string
          display_order?: number | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          name: string
          price: string
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          created_at?: string
          description?: string
          display_order?: number | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          name?: string
          price?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          active: boolean | null
          created_at: string
          description: string
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string | null
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string | null
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string | null
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      services_page_content: {
        Row: {
          categories: Json
          created_at: string
          description: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          categories?: Json
          created_at?: string
          description?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Update: {
          categories?: Json
          created_at?: string
          description?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content: Json
          created_at: string
          id: string
          section_name: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          section_name: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          section_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      visitor_analytics: {
        Row: {
          city: string | null
          country: string
          created_at: string
          id: string
          ip_address: string
          page_path: string
          state: string | null
          user_agent: string | null
        }
        Insert: {
          city?: string | null
          country?: string
          created_at?: string
          id?: string
          ip_address: string
          page_path?: string
          state?: string | null
          user_agent?: string | null
        }
        Update: {
          city?: string | null
          country?: string
          created_at?: string
          id?: string
          ip_address?: string
          page_path?: string
          state?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
