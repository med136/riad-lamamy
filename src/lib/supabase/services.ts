import { createClient } from './client'

// Service pour les chambres
export const roomService = {
  async getAvailableRooms(checkIn: string, checkOut: string, guests: number = 2) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('available_rooms')
      .select('*')
      .gte('date', checkIn)
      .lt('date', checkOut)
      .eq('is_available', true)
      .gte('capacity', guests)
    
    if (error) throw error
    return data
  },
  
  async getRoomDetails(roomId: number) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()
    
    if (error) throw error
    return data
  }
}

// Service pour les réservations
export const bookingService = {
  async createBooking(bookingData: any) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Service pour les contacts
export const contactService = {
  async sendMessage(messageData: any) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([messageData])
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}
