import { useState, useCallback } from 'react'
import { Reservation, ReservationFilters, ReservationStats } from '@/types'

export function useReservations() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReservations = useCallback(
    async (filters?: ReservationFilters) => {
      setIsLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (filters?.status) params.append('status', filters.status)
        if (filters?.room_id) params.append('room_id', filters.room_id)
        if (filters?.guest_email) params.append('guest_email', filters.guest_email)
        if (filters?.page) params.append('page', filters.page.toString())
        if (filters?.limit) params.append('limit', filters.limit.toString())

        const response = await fetch(`/api/reservations?${params}`)
        if (!response.ok) throw new Error('Failed to fetch reservations')
        return await response.json()
      } catch (err: any) {
        setError(err.message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const fetchReservation = useCallback(
    async (id: string): Promise<Reservation> => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/reservations/${id}`)
        if (!response.ok) throw new Error('Failed to fetch reservation')
        return await response.json()
      } catch (err: any) {
        setError(err.message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const createReservation = useCallback(
    async (data: Partial<Reservation>): Promise<Reservation> => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/reservations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.error || 'Failed to create reservation')
        }
        return await response.json()
      } catch (err: any) {
        setError(err.message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const updateReservation = useCallback(
    async (id: string, data: Partial<Reservation>): Promise<Reservation> => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/reservations/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.error || 'Failed to update reservation')
        }
        return await response.json()
      } catch (err: any) {
        setError(err.message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const deleteReservation = useCallback(
    async (id: string): Promise<void> => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/reservations/${id}`, {
          method: 'DELETE'
        })
        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.error || 'Failed to delete reservation')
        }
      } catch (err: any) {
        setError(err.message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const checkAvailability = useCallback(
    async (roomId: string, checkIn: string, checkOut: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/reservations/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ room_id: roomId, check_in: checkIn, check_out: checkOut })
        })
        if (!response.ok) throw new Error('Failed to check availability')
        return await response.json()
      } catch (err: any) {
        setError(err.message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const getPricing = useCallback(
    async (roomId: string, checkIn: string, checkOut: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/reservations/pricing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ room_id: roomId, check_in: checkIn, check_out: checkOut })
        })
        if (!response.ok) throw new Error('Failed to get pricing')
        return await response.json()
      } catch (err: any) {
        setError(err.message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const getStats = useCallback(
    async (period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<ReservationStats> => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/reservations/stats?period=${period}`)
        if (!response.ok) throw new Error('Failed to fetch stats')
        return await response.json()
      } catch (err: any) {
        setError(err.message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return {
    isLoading,
    error,
    fetchReservations,
    fetchReservation,
    createReservation,
    updateReservation,
    deleteReservation,
    checkAvailability,
    getPricing,
    getStats
  }
}
