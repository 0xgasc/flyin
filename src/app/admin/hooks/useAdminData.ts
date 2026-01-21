'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAuthHeaders } from '@/lib/auth-client'
import type { Booking, Pilot, User, Transaction, Experience, Destination } from '../types'

interface UseAdminDataReturn {
  // Data
  bookings: Booking[]
  pilots: Pilot[]
  users: User[]
  transactions: Transaction[]
  experiences: Experience[]
  destinations: Destination[]

  // Loading states
  loading: boolean
  bookingsLoading: boolean
  usersLoading: boolean
  transactionsLoading: boolean

  // Counts for badges
  pendingBookings: number
  pendingTransactions: number

  // Fetch functions
  fetchBookings: () => Promise<void>
  fetchPilots: () => Promise<void>
  fetchUsers: () => Promise<void>
  fetchTransactions: () => Promise<void>
  fetchExperiences: () => Promise<void>
  fetchDestinations: () => Promise<void>
  refreshAll: () => Promise<void>

  // Action functions
  updateBookingStatus: (id: string, status: string, adminNotes?: string) => Promise<boolean>
  assignPilot: (bookingId: string, pilotId: string) => Promise<boolean>
  updateTransactionStatus: (id: string, status: string) => Promise<boolean>
  createUser: (userData: Partial<User>) => Promise<boolean>
  updateUser: (id: string, userData: Partial<User>) => Promise<boolean>
  deleteUser: (id: string) => Promise<boolean>
}

export function useAdminData(): UseAdminDataReturn {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [pilots, setPilots] = useState<Pilot[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])

  const [loading, setLoading] = useState(true)
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [usersLoading, setUsersLoading] = useState(false)
  const [transactionsLoading, setTransactionsLoading] = useState(false)

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    setBookingsLoading(true)
    try {
      const res = await fetch('/api/bookings?limit=100', {
        headers: getAuthHeaders()
      })
      if (res.ok) {
        const data = await res.json()
        setBookings(data.bookings || [])
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setBookingsLoading(false)
    }
  }, [])

  // Fetch pilots
  const fetchPilots = useCallback(async () => {
    try {
      const res = await fetch('/api/pilots', {
        headers: getAuthHeaders()
      })
      if (res.ok) {
        const data = await res.json()
        setPilots(data.pilots || [])
      }
    } catch (error) {
      console.error('Error fetching pilots:', error)
    }
  }, [])

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true)
    try {
      const res = await fetch('/api/users', {
        headers: getAuthHeaders()
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setUsersLoading(false)
    }
  }, [])

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    setTransactionsLoading(true)
    try {
      const res = await fetch('/api/transactions', {
        headers: getAuthHeaders()
      })
      if (res.ok) {
        const data = await res.json()
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setTransactionsLoading(false)
    }
  }, [])

  // Fetch experiences
  const fetchExperiences = useCallback(async () => {
    try {
      const res = await fetch('/api/experiences?include_inactive=true', {
        headers: getAuthHeaders()
      })
      if (res.ok) {
        const data = await res.json()
        setExperiences(data.experiences || [])
      }
    } catch (error) {
      console.error('Error fetching experiences:', error)
    }
  }, [])

  // Fetch destinations
  const fetchDestinations = useCallback(async () => {
    try {
      const res = await fetch('/api/destinations?include_inactive=true', {
        headers: getAuthHeaders()
      })
      if (res.ok) {
        const data = await res.json()
        setDestinations(data.destinations || [])
      }
    } catch (error) {
      console.error('Error fetching destinations:', error)
    }
  }, [])

  // Refresh all data
  const refreshAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([
      fetchBookings(),
      fetchPilots(),
      fetchUsers(),
      fetchTransactions(),
      fetchExperiences(),
      fetchDestinations()
    ])
    setLoading(false)
  }, [fetchBookings, fetchPilots, fetchUsers, fetchTransactions, fetchExperiences, fetchDestinations])

  // Update booking status
  const updateBookingStatus = useCallback(async (id: string, status: string, adminNotes?: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ status, admin_notes: adminNotes })
      })
      if (res.ok) {
        await fetchBookings()
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating booking status:', error)
      return false
    }
  }, [fetchBookings])

  // Assign pilot to booking
  const assignPilot = useCallback(async (bookingId: string, pilotId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ pilot_id: pilotId, status: 'assigned' })
      })
      if (res.ok) {
        await fetchBookings()
        return true
      }
      return false
    } catch (error) {
      console.error('Error assigning pilot:', error)
      return false
    }
  }, [fetchBookings])

  // Update transaction status
  const updateTransactionStatus = useCallback(async (id: string, status: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        await fetchTransactions()
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating transaction:', error)
      return false
    }
  }, [fetchTransactions])

  // Create user
  const createUser = useCallback(async (userData: Partial<User>): Promise<boolean> => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(userData)
      })
      if (res.ok) {
        await fetchUsers()
        return true
      }
      return false
    } catch (error) {
      console.error('Error creating user:', error)
      return false
    }
  }, [fetchUsers])

  // Update user
  const updateUser = useCallback(async (id: string, userData: Partial<User>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(userData)
      })
      if (res.ok) {
        await fetchUsers()
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating user:', error)
      return false
    }
  }, [fetchUsers])

  // Delete user
  const deleteUser = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      if (res.ok) {
        await fetchUsers()
        return true
      }
      return false
    } catch (error) {
      console.error('Error deleting user:', error)
      return false
    }
  }, [fetchUsers])

  // Initial data fetch
  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  // Calculate pending counts
  const pendingBookings = bookings.filter(b => b.status === 'pending').length
  const pendingTransactions = transactions.filter(t => t.status === 'pending').length

  return {
    bookings,
    pilots,
    users,
    transactions,
    experiences,
    destinations,
    loading,
    bookingsLoading,
    usersLoading,
    transactionsLoading,
    pendingBookings,
    pendingTransactions,
    fetchBookings,
    fetchPilots,
    fetchUsers,
    fetchTransactions,
    fetchExperiences,
    fetchDestinations,
    refreshAll,
    updateBookingStatus,
    assignPilot,
    updateTransactionStatus,
    createUser,
    updateUser,
    deleteUser
  }
}

export default useAdminData
