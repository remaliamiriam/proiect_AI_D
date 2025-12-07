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
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          county: string | null;
          show_real_name: boolean;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          county?: string | null;
          show_real_name?: boolean;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          county?: string | null;
          show_real_name?: boolean;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          title: string | null;
          body: string;
          hospital_name: string;
          locality: string;
          county: string;
          incident_date: string | null;
          status: 'pending' | 'approved' | 'rejected';
          display_name: string;
          is_anonymous: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          title?: string | null;
          body: string;
          hospital_name: string;
          locality: string;
          county: string;
          incident_date?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          display_name: string;
          is_anonymous?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          title?: string | null;
          body?: string;
          hospital_name?: string;
          locality?: string;
          county?: string;
          incident_date?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          display_name?: string;
          is_anonymous?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      attachments: {
        Row: {
          id: string;
          post_id: string;
          file_path: string;
          file_name: string;
          file_size: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          file_path: string;
          file_name: string;
          file_size: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          file_path?: string;
          file_name?: string;
          file_size?: number;
          created_at?: string;
        };
      };
      replies: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          body: string;
          display_name: string;
          is_anonymous: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          body: string;
          display_name: string;
          is_anonymous?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          author_id?: string;
          body?: string;
          display_name?: string;
          is_anonymous?: boolean;
          created_at?: string;
        };
      };
    };
  };
}
