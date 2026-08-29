export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          event_date: string;
          venue: string | null;
          memo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          event_date: string;
          venue?: string | null;
          memo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          event_date?: string;
          venue?: string | null;
          memo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      circles: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          name: string;
          space_number: string;
          x_url: string | null;
          web_url: string | null;
          memo: string | null;
          priority: "must" | "want" | "if_time";
          assignee: string | null;
          visit_status: "unvisited" | "purchased" | "sold_out" | "skipped";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          name: string;
          space_number: string;
          x_url?: string | null;
          web_url?: string | null;
          memo?: string | null;
          priority?: "must" | "want" | "if_time";
          assignee?: string | null;
          visit_status?: "unvisited" | "purchased" | "sold_out" | "skipped";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          name?: string;
          space_number?: string;
          x_url?: string | null;
          web_url?: string | null;
          memo?: string | null;
          priority?: "must" | "want" | "if_time";
          assignee?: string | null;
          visit_status?: "unvisited" | "purchased" | "sold_out" | "skipped";
          created_at?: string;
          updated_at?: string;
        };
      };
      items: {
        Row: {
          id: string;
          circle_id: string;
          user_id: string;
          name: string;
          price: number;
          quantity: number;
          memo: string | null;
          purchased: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          circle_id: string;
          user_id: string;
          name: string;
          price?: number;
          quantity?: number;
          memo?: string | null;
          purchased?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          circle_id?: string;
          user_id?: string;
          name?: string;
          price?: number;
          quantity?: number;
          memo?: string | null;
          purchased?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
