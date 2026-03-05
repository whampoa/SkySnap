export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type JobCategory = 'Real Estate' | 'Roof Check' | 'Agriculture'
export type JobStatus = 'open' | 'assigned' | 'completed'
export type BidStatus = 'pending' | 'accepted' | 'rejected'
export type UserRole = 'client' | 'pilot'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: UserRole
          full_name: string | null
          bio: string | null
          location: string | null
          avatar_url: string | null
          arn_number: string | null
          is_repl_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role: UserRole
          full_name?: string | null
          bio?: string | null
          location?: string | null
          avatar_url?: string | null
          arn_number?: string | null
          is_repl_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: UserRole
          full_name?: string | null
          bio?: string | null
          location?: string | null
          avatar_url?: string | null
          arn_number?: string | null
          is_repl_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          client_id: string
          title: string
          description: string | null
          category: JobCategory
          status: JobStatus
          location_name: string
          coordinates: unknown
          budget_min: number
          budget_max: number
          deadline: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          title: string
          description?: string | null
          category: JobCategory
          status?: JobStatus
          location_name: string
          coordinates: unknown
          budget_min: number
          budget_max: number
          deadline?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          title?: string
          description?: string | null
          category?: JobCategory
          status?: JobStatus
          location_name?: string
          coordinates?: unknown
          budget_min?: number
          budget_max?: number
          deadline?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bids: {
        Row: {
          id: string
          job_id: string
          pilot_id: string
          amount: number
          message: string | null
          delivery_days: number
          status: BidStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          pilot_id: string
          amount: number
          message?: string | null
          delivery_days: number
          status?: BidStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          pilot_id?: string
          amount?: number
          message?: string | null
          delivery_days?: number
          status?: BidStatus
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      job_category: JobCategory
      job_status: JobStatus
      bid_status: BidStatus
      user_role: UserRole
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Job = Database['public']['Tables']['jobs']['Row']
export type Bid = Database['public']['Tables']['bids']['Row']

export type JobWithClient = Job & {
  profiles: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}

export type BidWithPilot = Bid & {
  profiles: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'is_repl_verified' | 'arn_number'>
}

export type JobWithBids = Job & {
  profiles: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  bids: BidWithPilot[]
}
