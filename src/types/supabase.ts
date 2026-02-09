export type Database = {
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          id: string
          role: 'super_admin' | 'admin' | 'manager' | 'staff'
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'super_admin' | 'admin' | 'manager' | 'staff'
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'super_admin' | 'admin' | 'manager' | 'staff'
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reservations: {
        Row: {
          id: string
          reference: string
          guest_name: string
          guest_email: string
          guest_phone: string | null
          guest_count: number
          room_id: string | null
          check_in: string
          check_out: string
          total_amount: number
          paid_amount: number
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          special_requests: string | null
          admin_notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reference: string
          guest_name: string
          guest_email: string
          guest_phone?: string | null
          guest_count?: number
          room_id?: string | null
          check_in: string
          check_out: string
          total_amount: number
          paid_amount?: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          special_requests?: string | null
          admin_notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reference?: string
          guest_name?: string
          guest_email?: string
          guest_phone?: string | null
          guest_count?: number
          room_id?: string | null
          check_in?: string
          check_out?: string
          total_amount?: number
          paid_amount?: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          special_requests?: string | null
          admin_notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          max_guests: number
          base_price: number
          seasonal_prices: any
          amenities: string[]
          images: string[]
          status: 'available' | 'maintenance' | 'cleaning' | 'occupied'
          featured: boolean
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          max_guests?: number
          base_price: number
          seasonal_prices?: any
          amenities?: string[]
          images?: string[]
          status?: 'available' | 'maintenance' | 'cleaning' | 'occupied'
          featured?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          max_guests?: number
          base_price?: number
          seasonal_prices?: any
          amenities?: string[]
          images?: string[]
          status?: 'available' | 'maintenance' | 'cleaning' | 'occupied'
          featured?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
