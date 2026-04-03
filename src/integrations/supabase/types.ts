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
      families: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      family_members: {
        Row: {
          avatar_url: string | null
          birth_year: number | null
          display_name: string
          family_id: string
          id: string
          joined_at: string
          relationship: string | null
          role: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          birth_year?: number | null
          display_name: string
          family_id: string
          id?: string
          joined_at?: string
          relationship?: string | null
          role?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          birth_year?: number | null
          display_name?: string
          family_id?: string
          id?: string
          joined_at?: string
          relationship?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      family_relationships: {
        Row: {
          child_member_id: string
          created_at: string
          family_id: string
          id: string
          parent_member_id: string
        }
        Insert: {
          child_member_id: string
          created_at?: string
          family_id: string
          id?: string
          parent_member_id: string
        }
        Update: {
          child_member_id?: string
          created_at?: string
          family_id?: string
          id?: string
          parent_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_relationships_child_member_id_fkey"
            columns: ["child_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_relationships_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_relationships_parent_member_id_fkey"
            columns: ["parent_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string
          expires_at: string | null
          family_id: string
          id: string
          max_uses: number | null
          use_count: number
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          family_id: string
          id?: string
          max_uses?: number | null
          use_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          family_id?: string
          id?: string
          max_uses?: number | null
          use_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "invite_codes_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_capsules: {
        Row: {
          author_id: string
          created_at: string
          family_id: string
          id: string
          is_unlocked: boolean
          message: string
          recipient_ids: string[]
          unlock_date: string
        }
        Insert: {
          author_id: string
          created_at?: string
          family_id: string
          id?: string
          is_unlocked?: boolean
          message: string
          recipient_ids?: string[]
          unlock_date: string
        }
        Update: {
          author_id?: string
          created_at?: string
          family_id?: string
          id?: string
          is_unlocked?: boolean
          message?: string
          recipient_ids?: string[]
          unlock_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_capsules_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          family_id: string
          id: string
          is_read: boolean
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          family_id: string
          id?: string
          is_read?: boolean
          related_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          family_id?: string
          id?: string
          is_read?: boolean
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          author_id: string
          content: string
          created_at: string
          decade: string | null
          family_id: string
          id: string
          photo_urls: string[] | null
          privacy: string
          tagged_members: string[] | null
          title: string
          updated_at: string
          year: number | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          decade?: string | null
          family_id: string
          id?: string
          photo_urls?: string[] | null
          privacy?: string
          tagged_members?: string[] | null
          title: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          decade?: string | null
          family_id?: string
          id?: string
          photo_urls?: string[] | null
          privacy?: string
          tagged_members?: string[] | null
          title?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stories_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      story_likes: {
        Row: {
          created_at: string
          family_id: string
          id: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          family_id: string
          id?: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          family_id?: string
          id?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_likes_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_likes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_notification: {
        Args: {
          _body?: string
          _family_id: string
          _related_id?: string
          _title: string
          _type: string
          _user_id: string
        }
        Returns: string
      }
      is_family_member: {
        Args: { _family_id: string; _user_id: string }
        Returns: boolean
      }
      lookup_invite_code: {
        Args: { _code: string }
        Returns: {
          family_id: string
          family_name: string
        }[]
      }
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
