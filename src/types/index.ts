export interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  size: number;
  capacity: number;
  features: string[];
  images: string[];
  amenities: string[];
  category: 'standard' | 'deluxe' | 'suite';
  rating?: number;
  popular?: boolean;
  luxury?: boolean;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  included: boolean;
  price?: string;
  category: 'restauration' | 'transport' | 'activités' | 'sur-mesure';
}

export interface GalleryImage {
  id: number;
  title: string;
  category: 'architecture' | 'chambres' | 'jardin' | 'restauration' | 'spa';
  description: string;
  featured?: boolean;
}
export interface Testimonial {
  id: number;
  name: string;
  location: string;
  date: string;
  rating: number;
  text: string;
  avatar: string;
  stay: string;
  featured?: boolean;
}

export interface ReservationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  newsletter: boolean;
}

export interface ContactInfo {
  phone: string[];
  email: string[];
  address: string[];
  hours: string[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface BookingData {
  checkIn: Date;
  checkOut: Date;
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
  roomType: string;
  promoCode?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  preferences?: {
    newsletter: boolean;
    language: string;
  };
}
export interface Reservation {
  id: string;
  reference: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  guest_count: number;
  room_id: string;
  check_in: string; // ISO date
  check_out: string; // ISO date
  total_amount: number;
  paid_amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  special_requests?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ReservationFilters {
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  room_id?: string;
  guest_email?: string;
  page?: number;
  limit?: number;
}

export interface ReservationStats {
  total_reservations: number;
  total_revenue: number;
  total_paid: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  average_reservation_value: number;
}