export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      folders: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          name: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          name?: string
        }
        Relationships: []
      }
      keyword_styles: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
          prompt: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          name: string
          prompt: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          name?: string
          prompt?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          gemini_api_key: string | null
          openrouter_api_key: string | null
          primary_provider: "gemini" | "openrouter" | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          gemini_api_key?: string | null
          openrouter_api_key?: string | null
          primary_provider?: "gemini" | "openrouter" | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          gemini_api_key?: string | null
          openrouter_api_key?: string | null
          primary_provider?: "gemini" | "openrouter" | null
        }
        Relationships: []
      },
      scripts: {
        Row: {
          id: string
          created_at: string
          user_id: string
          title: string
          ai_title: string | null
          summary: string
          script: string
          timeline: Json | null
          mode: "generate" | "rewrite" | "keyword" | null
          idea_prompt: string | null
          generated_outline: string | null
          script_prompt: string | null
          original_script: string | null
          folder_id: string | null
          split_script: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          title?: string
          ai_title?: string | null
          summary?: string
          script?: string
          timeline?: Json | null
          mode?: "generate" | "rewrite" | "keyword" | null
          idea_prompt?: string | null
          generated_outline?: string | null
          script_prompt?: string | null
          original_script?: string | null
          folder_id?: string | null
          split_script?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          title?: string
          ai_title?: string | null
          summary?: string
          script?: string
          timeline?: Json | null
          mode?: "generate" | "rewrite" | "keyword" | null
          idea_prompt?: string | null
          generated_outline?: string | null
          script_prompt?: string | null
          original_script?: string | null
          folder_id?: string | null
          split_script?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "scripts_folder_id_fkey",
            columns: ["folder_id"],
            referencedRelation: "folders",
            referencedColumns: ["id"]
          }
        ]
      }
      styles: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
          prompt: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          name: string
          prompt: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          name?: string
          prompt?: string
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