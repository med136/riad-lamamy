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
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          country: string | null
          city: string | null
          address: string | null
          postal_code: string | null
          date_of_birth: string | null
          preferences: Json | null
          loyalty_points: number | null
          is_vip: boolean | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          country?: string | null
          city?: string | null
          address?: string | null
          postal_code?: string | null
          date_of_birth?: string | null
          preferences?: Json | null
          loyalty_points?: number | null
          is_vip?: boolean | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          country?: string | null
          city?: string | null
          address?: string | null
          postal_code?: string | null
          date_of_birth?: string | null
          preferences?: Json | null
          loyalty_points?: number | null
          is_vip?: boolean | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rooms: {
        Row: {
          id: number
          room_number: string | null
          name: string
          description: string | null
          category: 'standard' | 'deluxe' | 'suite' | 'family'
          price: number
          size_m2: number | null
          capacity: number
          amenities: string[]
          images: string[]
          is_available: boolean
          bed_type: string | null
          has_balcony: boolean | null
          has_terrace: boolean | null
          has_jacuzzi: boolean | null
          featured_image_url: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: number
          room_number?: string | null
          name: string
          description?: string | null
          category: 'standard' | 'deluxe' | 'suite' | 'family'
          price: number
          size_m2?: number | null
          capacity?: number
          amenities?: string[]
          images?: string[]
          is_available?: boolean
          bed_type?: string | null
          has_balcony?: boolean | null
          has_terrace?: boolean | null
          has_jacuzzi?: boolean | null
          featured_image_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: number
          room_number?: string | null
          name?: string
          description?: string | null
          category?: 'standard' | 'deluxe' | 'suite' | 'family'
          price?: number
          size_m2?: number | null
          capacity?: number
          amenities?: string[]
          images?: string[]
          is_available?: boolean
          bed_type?: string | null
          has_balcony?: boolean | null
          has_terrace?: boolean | null
          has_jacuzzi?: boolean | null
          featured_image_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      bookings: {
        Row: {
          id: number
          booking_code: string
          customer_name: string
          customer_email: string
          customer_phone: string
          customer_country: string | null
          check_in: string
          check_out: string
          room_type: string
          adults: number
          children: number
          total_price: number
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          special_requests: string | null
          language: string
          guest_first_name: string | null
          guest_last_name: string | null
          profile_id: string | null
          room_id: number | null
          payment_status: string | null
          amount_paid: number | null
          confirmed_at: string | null
          checked_in_at: string | null
          checked_out_at: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: number
          booking_code?: string
          customer_name: string
          customer_email: string
          customer_phone: string
          customer_country?: string | null
          check_in: string
          check_out: string
          room_type: string
          adults?: number
          children?: number
          total_price: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          special_requests?: string | null
          language?: string
          guest_first_name?: string | null
          guest_last_name?: string | null
          profile_id?: string | null
          room_id?: number | null
          payment_status?: string | null
          amount_paid?: number | null
          confirmed_at?: string | null
          checked_in_at?: string | null
          checked_out_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: number
          booking_code?: string
          customer_name?: string
          customer_email?: string
          customer_phone?: string
          customer_country?: string | null
          check_in?: string
          check_out?: string
          room_type?: string
          adults?: number
          children?: number
          total_price?: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          special_requests?: string | null
          language?: string
          guest_first_name?: string | null
          guest_last_name?: string | null
          profile_id?: string | null
          room_id?: number | null
          payment_status?: string | null
          amount_paid?: number | null
          confirmed_at?: string | null
          checked_in_at?: string | null
          checked_out_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      contact_messages: {
        Row: {
          id: number
          name: string
          email: string
          phone: string | null
          subject: string
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          email: string
          phone?: string | null
          subject: string
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          email?: string
          phone?: string | null
          subject?: string
          message?: string
          is_read?: boolean
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: number
          author_name: string
          rating: number
          comment: string
          author_country: string | null
          is_featured: boolean
          is_approved: boolean
          created_at: string
        }
        Insert: {
          id?: number
          author_name: string
          rating: number
          comment: string
          author_country?: string | null
          is_featured?: boolean
          is_approved?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          author_name?: string
          rating?: number
          comment?: string
          author_country?: string | null
          is_featured?: boolean
          is_approved?: boolean
          created_at?: string
        }
      }
      services: {
        Row: {
          id: number
          name: string
          description: string | null
          price: number
          category: string
          duration_minutes: number | null
          is_active: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          price: number
          category: string
          duration_minutes?: number | null
          is_active?: boolean
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          price?: number
          category?: string
          duration_minutes?: number | null
          is_active?: boolean
          display_order?: number
          created_at?: string
        }
      }
      availability: {
        Row: {
          id: number
          room_id: number | null
          date: string
          price: number | null
          is_available: boolean
        }
        Insert: {
          id?: number
          room_id?: number | null
          date: string
          price?: number | null
          is_available?: boolean
        }
        Update: {
          id?: number
          room_id?: number | null
          date?: string
          price?: number | null
          is_available?: boolean
        }
      }
      booking_services: {
        Row: {
          id: string
          booking_id: number
          service_id: number
          service_date: string
          service_time: string | null
          participants_count: number
          unit_price: number
          total_price: number
          status: string | null
          special_requests: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: number
          service_id: number
          service_date: string
          service_time?: string | null
          participants_count?: number
          unit_price: number
          status?: string | null
          special_requests?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: number
          service_id?: number
          service_date?: string
          service_time?: string | null
          participants_count?: number
          unit_price?: number
          status?: string | null
          special_requests?: string | null
          created_at?: string
        }
      }
      gallery: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string
          image_url: string
          thumbnail_url: string | null
          alt_text: string | null
          width: number | null
          height: number | null
          size_bytes: number | null
          display_order: number | null
          is_featured: boolean | null
          is_published: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: string
          image_url: string
          thumbnail_url?: string | null
          alt_text?: string | null
          width?: number | null
          height?: number | null
          size_bytes?: number | null
          display_order?: number | null
          is_featured?: boolean | null
          is_published?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string
          image_url?: string
          thumbnail_url?: string | null
          alt_text?: string | null
          width?: number | null
          height?: number | null
          size_bytes?: number | null
          display_order?: number | null
          is_featured?: boolean | null
          is_published?: boolean | null
          created_at?: string
        }
      }
      discounts: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          discount_type: string
          value: number
          applies_to: string | null
          min_stay_nights: number | null
          max_stay_nights: number | null
          min_amount: number | null
          valid_from: string
          valid_until: string
          usage_limit: number | null
          times_used: number | null
          is_active: boolean | null
          is_public: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          discount_type: string
          value: number
          applies_to?: string | null
          min_stay_nights?: number | null
          max_stay_nights?: number | null
          min_amount?: number | null
          valid_from: string
          valid_until: string
          usage_limit?: number | null
          times_used?: number | null
          is_active?: boolean | null
          is_public?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          discount_type?: string
          value?: number
          applies_to?: string | null
          min_stay_nights?: number | null
          max_stay_nights?: number | null
          min_amount?: number | null
          valid_from?: string
          valid_until?: string
          usage_limit?: number | null
          times_used?: number | null
          is_active?: boolean | null
          is_public?: boolean | null
          created_at?: string
        }
      }
      configurations: {
        Row: {
          key: string
          value: Json
          description: string | null
          category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          description?: string | null
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          description?: string | null
          category?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      pages: {
        Row: {
          id: string
          slug: string
          title: string
          content: string
          meta_title: string | null
          meta_description: string | null
          meta_keywords: string[] | null
          is_published: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          content: string
          meta_title?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          is_published?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          content?: string
          meta_title?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          is_published?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      available_rooms: {
        Row: {
          id: number | null
          room_number: string | null
          name: string | null
          description: string | null
          category: string | null
          price: number | null
          size_m2: number | null
          capacity: number | null
          amenities: string[] | null
          images: string[] | null
          is_available: boolean | null
          bed_type: string | null
          has_balcony: boolean | null
          has_terrace: boolean | null
          has_jacuzzi: boolean | null
          featured_image_url: string | null
          created_at: string | null
          updated_at: string | null
          date: string | null
          daily_price: number | null
        }
      }
    }
    Functions: {
      check_room_availability: {
        Args: {
          p_room_id: number
          p_check_in: string
          p_check_out: string
        }
        Returns: boolean
      }
      calculate_booking_price: {
        Args: {
          p_room_id: number
          p_check_in: string
          p_check_out: string
          p_adults_count?: number
          p_children_count?: number
        }
        Returns: number
      }
    }
  }
}
