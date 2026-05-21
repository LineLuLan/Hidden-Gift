/**
 * @file lib/supabase/types.ts
 * @description Hand-written Database types matching the migrations in
 *              supabase/migrations/20260519*.sql. REGENERATE against the live
 *              project after applying migrations with: `pnpm db:types`.
 *
 *              Pattern follows Supabase's auto-generated output so it can be
 *              swapped in-place by `db:types` later.
 * @phase 1
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AccountKind = "solo" | "couple" | "squad" | "family";
export type AccountRole = "owner" | "partner" | "member";
export type SecretStatus = "preparing" | "ready" | "delivered";
export type MediaType = "image" | "video";

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string;
          kind: AccountKind;
          display_name: string | null;
          invite_code: string | null;
          feature_flags: Json;
          pro_until: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          kind?: AccountKind;
          display_name?: string | null;
          invite_code?: string | null;
          feature_flags?: Json;
          pro_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          kind?: AccountKind;
          display_name?: string | null;
          invite_code?: string | null;
          feature_flags?: Json;
          pro_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      account_members: {
        Row: {
          id: string;
          account_id: string;
          user_id: string;
          role: AccountRole;
          display_name: string | null;
          avatar_url: string | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          user_id: string;
          role?: AccountRole;
          display_name?: string | null;
          avatar_url?: string | null;
          joined_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          user_id?: string;
          role?: AccountRole;
          display_name?: string | null;
          avatar_url?: string | null;
          joined_at?: string;
        };
        Relationships: [];
      };
      wishes: {
        Row: {
          id: string;
          account_id: string;
          user_id: string;
          title: string;
          description: string | null;
          emoji: string | null;
          image_url: string | null;
          priority: number;
          is_fulfilled: boolean;
          fulfilled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          user_id: string;
          title: string;
          description?: string | null;
          emoji?: string | null;
          image_url?: string | null;
          priority?: number;
          is_fulfilled?: boolean;
          fulfilled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          emoji?: string | null;
          image_url?: string | null;
          priority?: number;
          is_fulfilled?: boolean;
          fulfilled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      secrets: {
        Row: {
          id: string;
          account_id: string;
          prepared_by: string;
          recipient_id: string;
          linked_wish_id: string | null;
          title: string;
          description: string | null;
          image_url: string | null;
          status: SecretStatus;
          reveal_at: string | null;
          delivered_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          prepared_by: string;
          recipient_id: string;
          linked_wish_id?: string | null;
          title: string;
          description?: string | null;
          image_url?: string | null;
          status?: SecretStatus;
          reveal_at?: string | null;
          delivered_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          prepared_by?: string;
          recipient_id?: string;
          linked_wish_id?: string | null;
          title?: string;
          description?: string | null;
          image_url?: string | null;
          status?: SecretStatus;
          reveal_at?: string | null;
          delivered_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      letters: {
        Row: {
          id: string;
          account_id: string;
          sender_id: string;
          recipient_id: string;
          subject: string;
          body: Json;
          scheduled_for: string;
          delivered_at: string | null;
          is_draft: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          sender_id: string;
          recipient_id: string;
          subject: string;
          body: Json;
          scheduled_for: string;
          delivered_at?: string | null;
          is_draft?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          sender_id?: string;
          recipient_id?: string;
          subject?: string;
          body?: Json;
          scheduled_for?: string;
          delivered_at?: string | null;
          is_draft?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      memories: {
        Row: {
          id: string;
          account_id: string;
          uploaded_by: string;
          title: string | null;
          description: string | null;
          media_url: string;
          media_type: MediaType;
          media_size: number | null;
          taken_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          uploaded_by: string;
          title?: string | null;
          description?: string | null;
          media_url: string;
          media_type: MediaType;
          media_size?: number | null;
          taken_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          uploaded_by?: string;
          title?: string | null;
          description?: string | null;
          media_url?: string;
          media_type?: MediaType;
          media_size?: number | null;
          taken_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      emoji_pings: {
        Row: {
          id: string;
          account_id: string;
          sender_id: string;
          recipient_id: string;
          emoji: string;
          message: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          sender_id: string;
          recipient_id: string;
          emoji: string;
          message?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          sender_id?: string;
          recipient_id?: string;
          emoji?: string;
          message?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      gift_ideas: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category: string;
          occasion: string[] | null;
          price_min: number | null;
          price_max: number | null;
          persona_fit: string[] | null;
          emoji: string | null;
          image_url: string | null;
          popularity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          category: string;
          occasion?: string[] | null;
          price_min?: number | null;
          price_max?: number | null;
          persona_fit?: string[] | null;
          emoji?: string | null;
          image_url?: string | null;
          popularity?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          occasion?: string[] | null;
          price_min?: number | null;
          price_max?: number | null;
          persona_fit?: string[] | null;
          emoji?: string | null;
          image_url?: string | null;
          popularity?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      my_account: {
        Row: {
          id: string | null;
          kind: AccountKind | null;
          display_name: string | null;
          invite_code: string | null;
          feature_flags: Json | null;
          pro_until: string | null;
          my_role: AccountRole | null;
          my_display_name: string | null;
          my_avatar_url: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_account_member: {
        Args: { p_account_id: string };
        Returns: boolean;
      };
      accept_invite: {
        Args: { p_code: string };
        Returns: { joined_account_id: string; joined_role: string }[];
      };
      rotate_invite_code: {
        Args: { p_account_id: string; p_new_code: string };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
