import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      folders: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
        }
      }
      bookmarks: {
        Row: {
          id: string
          user_id: string
          folder_id: string | null
          url: string
          title: string
          description: string | null
          memo: string | null
          meta_image: string | null
          last_clicked_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          folder_id?: string | null
          url: string
          title: string
          description?: string | null
          memo?: string | null
          meta_image?: string | null
          last_clicked_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          folder_id?: string | null
          url?: string
          title?: string
          description?: string | null
          memo?: string | null
          meta_image?: string | null
          last_clicked_at?: string
          created_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
        }
      }
      bookmark_tags: {
        Row: {
          bookmark_id: string
          tag_id: string
        }
        Insert: {
          bookmark_id: string
          tag_id: string
        }
        Update: {
          bookmark_id?: string
          tag_id?: string
        }
      }
    }
  }
} 