import { createClient } from '../client'

export class ReservationService {
  static async getAll(filters?: {
    status?: string
    startDate?: Date
    endDate?: Date
  }) {
    const supabase = createClient()
    let query = supabase.from('reservations').select('*')
    
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters?.startDate) {
      query = query.gte('check_in', filters.startDate.toISOString())
    }
    
    if (filters?.endDate) {
      query = query.lte('check_out', filters.endDate.toISOString())
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  static async getById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  static async create(reservation: any) {
    const supabase = createClient()
    
    // Générer une référence unique
    const reference = `RES${Date.now()}${Math.floor(Math.random() * 1000)}`
    
    const { data, error } = await supabase
      .from('reservations')
      .insert({
        ...reservation,
        reference
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async update(id: string, updates: any) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('reservations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async delete(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  static async getStats() {
    const supabase = createClient()
    
    const { count: total } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
    
    const { count: pending } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
    
    const { count: confirmed } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'confirmed')
    
    const { data: revenueData } = await supabase
      .from('reservations')
      .select('total_amount')
      .eq('status', 'completed')
    
    const totalRevenue = revenueData?.reduce(
      (sum, item) => sum + (item.total_amount || 0), 0
    ) || 0
    
    return {
      total,
      pending,
      confirmed,
      totalRevenue
    }
  }
}
