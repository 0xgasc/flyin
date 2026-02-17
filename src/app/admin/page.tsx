'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/auth-store'
import { useTranslation } from '@/lib/i18n'
import { logout } from '@/lib/auth-client'
import {
  Plane, Calendar, MapPin, Clock, Users, CheckCircle,
  AlertCircle, XCircle, DollarSign, BarChart3, UserCheck,
  Plus, Edit, Trash2, Upload, Download, Image as ImageIcon, Eye, GripVertical
} from 'lucide-react'
import IrysUpload from '@/components/IrysUpload'
import { AdminWhatsAppButton } from '@/components/whatsapp-contact-button'
import { AdminLayout } from './components/AdminLayout'
import type { AdminTab } from './types'
import { HELICOPTER_FLEET } from '@/types/helicopters'
import { format } from 'date-fns'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';

interface Booking {
  id: string
  created_at: string
  booking_type: 'transport' | 'experience'
  status: string
  from_location: string | null
  to_location: string | null
  scheduled_date: string
  scheduled_time: string
  passenger_count: number
  total_price: number
  notes: string | null
  admin_notes: string | null
  payment_status: string
  pilot_id: string | null
  client: {
    id: string
    full_name: string | null
    email: string
    phone: string | null
  }
  pilot: {
    id: string
    full_name: string | null
    email: string
  } | null
  experiences: {
    name: string
    location: string
  } | null
  passenger_details?: any[]
  selected_addons?: any[]
  addon_total_price?: number
  helicopter_id?: string | null
  return_date?: string | null
  return_time?: string | null
  is_round_trip?: boolean
  revision_requested?: boolean
  revision_notes?: string | null
  revision_data?: any
}

interface Pilot {
  id: string
  full_name: string | null
  email: string
  kyc_verified: boolean
}

export default function AdminDashboard() {
  const router = useRouter()
  const { profile } = useAuthStore()
  const { t } = useTranslation()
  
  // All state hooks must be declared before any conditional returns
  const [activeTab, setActiveTabState] = useState<AdminTab>('bookings')

  // Persist active tab in URL hash
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    const validTabs: AdminTab[] = ['bookings', 'calendar', 'users', 'pilots', 'transactions', 'aircrafts', 'analytics', 'experiences', 'destinations']
    if (hash && validTabs.includes(hash as AdminTab)) {
      setActiveTabState(hash as AdminTab)
    }
  }, [])

  const setActiveTab = (tab: AdminTab) => {
    setActiveTabState(tab)
    window.location.hash = tab
  }
  const [bookings, setBookings] = useState<Booking[]>([])
  const [pilots, setPilots] = useState<Pilot[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [experiences, setExperiences] = useState<any[]>([])
  const [destinations, setDestinations] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0) // 0 = current week, -1 = previous, +1 = next
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [availablePilots, setAvailablePilots] = useState<Pilot[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [selectedHelicopter, setSelectedHelicopter] = useState<string>('')
  const [selectedPilot, setSelectedPilot] = useState<string>('')
  const [showCreateUserModal, setShowCreateUserModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState<Booking | null>(null)
  const [showEditBookingModal, setShowEditBookingModal] = useState(false)
  const [financialSummary, setFinancialSummary] = useState<any>(null)
  const [operationalCosts, setOperationalCosts] = useState<any[]>([])
  const [businessRevenue, setBusinessRevenue] = useState<any[]>([])
  const [newUserData, setNewUserData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'client' as 'client' | 'pilot' | 'admin',
    phone: ''
  })
  const [editUserData, setEditUserData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: '',
    kyc_verified: false,
    account_balance: 0,
    notes: ''
  })
  const [editBookingData, setEditBookingData] = useState({
    from_location: '',
    to_location: '',
    scheduled_date: '',
    scheduled_time: '',
    return_date: '',
    return_time: '',
    passenger_count: 1,
    is_round_trip: false,
    notes: '',
    revision_notes: ''
  })

  // Helicopter and maintenance state
  const [helicopters, setHelicopters] = useState<any[]>([])
  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([])
  const [selectedHelicopterForEdit, setSelectedHelicopterForEdit] = useState<any>(null)
  const [showEditHelicopterModal, setShowEditHelicopterModal] = useState(false)
  const [showAddHelicopterModal, setShowAddHelicopterModal] = useState(false)
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)

  // Pilot-Aircraft Certification state
  const [certifications, setCertifications] = useState<any[]>([])
  const [showCertificationModal, setShowCertificationModal] = useState(false)
  const [certModalPilotId, setCertModalPilotId] = useState<string | null>(null)
  const [certModalHelicopterId, setCertModalHelicopterId] = useState<string | null>(null)
  const [newCertData, setNewCertData] = useState({
    pilot_id: '',
    helicopter_id: '',
    certified_since: new Date().toISOString().split('T')[0],
    flight_hours: 0,
    notes: ''
  })
  const [newHelicopterData, setNewHelicopterData] = useState({
    name: '',
    model: '',
    manufacturer: '',
    year_manufactured: new Date().getFullYear(),
    registration_number: '',
    capacity: 4,
    hourly_rate: 600,
    max_range_km: 500,
    cruise_speed_kmh: 180,
    fuel_capacity_liters: 200,
    fuel_consumption_lph: 50,
    location: 'Guatemala City Base',
    notes: ''
  })

  // Auth guard - redirect if not authenticated or not admin
  useEffect(() => {
    if (profile === null) {
      // Still loading profile
      return
    }
    if (!profile) {
      // No user, redirect to login
      router.push('/login')
      return
    }
    if (profile.role !== 'admin') {
      // Not admin, redirect to home
      router.push('/')
      return
    }
  }, [profile, router])

  // Data fetching effect - MUST be before any early returns (React Rules of Hooks)
  useEffect(() => {
    if (profile?.id && profile.role === 'admin') {
      if (activeTab === 'bookings') {
        fetchBookings()
        fetchCertifications()
      } else if (activeTab === 'pilots') {
        fetchPilots()
        fetchCertifications()
        fetchHelicopters()
      } else if (activeTab === 'users') {
        fetchUsers()
      } else if (activeTab === 'transactions') {
        fetchTransactions()
      } else if (activeTab === 'aircrafts') {
        fetchHelicopters()
        fetchMaintenanceRecords()
        fetchCertifications()
      } else if (activeTab === 'analytics') {
        fetchFinancialData()
      } else if (activeTab === 'experiences') {
        fetchExperiences()
      } else if (activeTab === 'destinations') {
        fetchDestinations()
      }
    }
  }, [profile, activeTab, statusFilter])

  // Don't render anything if not properly authenticated
  if (profile === null) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-4">You need admin permissions to access this page.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-gold-500 text-luxury-black font-semibold px-4 py-2 rounded-soft hover:bg-gold-400"
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }

  const fetchBookings = async () => {
    try {
      let url = '/api/bookings?'
      if (statusFilter !== 'all') {
        url += `status=${statusFilter}`
      }

      const response = await fetch(url, { credentials: 'include' })
      const data = await response.json()

      if (data.success && data.bookings) {
        // Transform the API response to match expected format
        const transformedBookings = data.bookings.map((b: any) => ({
          id: b.id,
          created_at: b.created_at,
          booking_type: b.booking_type,
          status: b.status,
          from_location: b.from_location,
          to_location: b.to_location,
          scheduled_date: b.scheduled_date,
          scheduled_time: b.scheduled_time,
          passenger_count: b.passenger_count,
          total_price: b.total_price,
          notes: b.notes,
          admin_notes: b.admin_notes,
          payment_status: b.payment_status,
          pilot_id: b.pilot_id,
          client: b.client || b.profiles || {
            id: b.client_id,
            full_name: b.profiles?.full_name || null,
            email: b.profiles?.email || '',
            phone: b.profiles?.phone || null
          },
          pilot: b.pilot,
          experiences: b.experiences || b.experience,
          passenger_details: b.passenger_details,
          selected_addons: b.selected_addons,
          addon_total_price: b.addon_total_price,
          helicopter_id: b.helicopter_id,
          return_date: b.return_date,
          return_time: b.return_time,
          is_round_trip: b.is_round_trip,
          revision_requested: b.revision_requested,
          revision_notes: b.revision_notes,
          revision_data: b.revision_data
        }))
        setBookings(transformedBookings)
      } else {
        console.error('Error fetching bookings:', data.error)
        setBookings([])
      }
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPilots = async () => {
    try {
      const response = await fetch('/api/pilots', { credentials: 'include' })
      const data = await response.json()

      if (data.success && data.pilots) {
        const transformedPilots = data.pilots.map((p: any) => ({
          id: p.id,
          full_name: p.full_name,
          email: p.email,
          kyc_verified: p.kyc_verified
        }))
        setPilots(transformedPilots)
        setAvailablePilots(transformedPilots.filter((p: any) => p.kyc_verified))
      } else {
        setPilots([])
        setAvailablePilots([])
      }
    } catch (err) {
      console.error('Error fetching pilots:', err)
      setPilots([])
      setAvailablePilots([])
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      console.log('Fetching all users...')
      const response = await fetch('/api/users', { credentials: 'include' })
      const data = await response.json()

      console.log('Users fetch result:', { data, count: data.users?.length })

      if (data.success && data.users) {
        setUsers(data.users)
      } else {
        console.error('Error fetching users:', data.error)
        setUsers([])
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions', { credentials: 'include' })
      const data = await response.json()

      if (data.success && data.transactions) {
        // Transform camelCase API response to snake_case for frontend
        const transformed = data.transactions.map((t: any) => ({
          id: t.id || t._id,
          created_at: t.createdAt || t.created_at,
          user_id: t.userId || t.user_id,
          type: t.type,
          amount: t.amount,
          payment_method: t.paymentMethod || t.payment_method || 'unknown',
          status: t.status,
          reference: t.reference,
          payment_proof_url: t.paymentProofUrl || t.payment_proof_url,
          processed_at: t.processedAt || t.processed_at,
          admin_notes: t.adminNotes || t.admin_notes,
          user: t.user,
          processed_by: t.processedBy,
        }))
        setTransactions(transformed)
      } else {
        console.error('Error fetching transactions:', data.error)
        setTransactions([])
      }
    } catch (err) {
      console.error('Error:', err)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const fetchFinancialData = async () => {
    try {
      setLoading(true)

      // Compute financial summary from bookings
      const response = await fetch('/api/bookings', { credentials: 'include' })
      const data = await response.json()

      if (data.success && data.bookings) {
        // Calculate financial summary from bookings
        const completedBookings = data.bookings.filter((b: any) => b.status === 'completed')
        const totalRevenue = completedBookings.reduce((sum: number, b: any) => sum + (b.total_price || 0), 0)
        const bookingCount = completedBookings.length

        setFinancialSummary({
          total_revenue: totalRevenue,
          total_bookings: bookingCount,
          average_booking_value: bookingCount > 0 ? totalRevenue / bookingCount : 0,
          pending_payments: data.bookings.filter((b: any) => b.payment_status === 'pending').length
        })

        // Generate revenue entries from completed bookings
        const revenueEntries = completedBookings.slice(0, 50).map((b: any) => ({
          id: b.id,
          amount: b.total_price,
          created_at: b.created_at,
          booking: {
            id: b.id,
            from_location: b.from_location,
            to_location: b.to_location,
            scheduled_date: b.scheduled_date,
            total_price: b.total_price
          }
        }))
        setBusinessRevenue(revenueEntries)
      }

      // Operational costs would need a separate model - set empty for now
      setOperationalCosts([])

    } catch (error) {
      console.error('Error fetching financial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHelicopters = async () => {
    try {
      const response = await fetch('/api/helicopters', { credentials: 'include' })
      const data = await response.json()

      console.log('Fetching helicopters - data:', data)

      if (data.success && data.helicopters) {
        setHelicopters(data.helicopters)
      } else {
        console.error('Error fetching helicopters:', data.error)
        // Demo data if no helicopters exist yet
        setHelicopters([
          {
            id: 'robinson-r44',
            name: 'Robinson R44 II',
            model: 'R44 Raven II',
            manufacturer: 'Robinson Helicopter Company',
            year_manufactured: 2020,
            registration_number: 'TG-ROB44',
            capacity: 3,
            hourly_rate: 600.00,
            max_range_km: 560,
            cruise_speed_kmh: 180,
            fuel_capacity_liters: 114.0,
            fuel_consumption_lph: 45.0,
            total_flight_hours: 245.5,
            last_maintenance_date: '2024-01-15',
            next_maintenance_due: '2024-04-15',
            status: 'active',
            location: 'Guatemala City Base',
            notes: 'Primary training and short-haul helicopter'
          }
        ])
      }
    } catch (err) {
      console.error('Error:', err)
      setHelicopters([])
    }
  }

  const fetchMaintenanceRecords = async () => {
    try {
      const response = await fetch('/api/maintenance', { credentials: 'include' })
      const data = await response.json()

      if (data.success && data.records) {
        setMaintenanceRecords(data.records)
      } else {
        console.warn('Error fetching maintenance records:', data.error)
        setMaintenanceRecords([])
      }
    } catch (err) {
      console.error('Error:', err)
      setMaintenanceRecords([])
    }
  }

  const fetchCertifications = async () => {
    try {
      const response = await fetch('/api/pilot-certifications', { credentials: 'include' })
      const data = await response.json()

      if (data.success && data.certifications) {
        setCertifications(data.certifications)
      } else {
        setCertifications([])
      }
    } catch (err) {
      console.error('Error fetching certifications:', err)
      setCertifications([])
    }
  }

  const createCertification = async () => {
    try {
      const response = await fetch('/api/pilot-certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newCertData)
      })

      const data = await response.json()

      if (!response.ok) {
        alert('Error: ' + (data.error || 'Failed to create certification'))
        return
      }

      alert('Certification created successfully!')
      setShowCertificationModal(false)
      setNewCertData({
        pilot_id: '',
        helicopter_id: '',
        certified_since: new Date().toISOString().split('T')[0],
        flight_hours: 0,
        notes: ''
      })
      fetchCertifications()
    } catch (err) {
      console.error('Error creating certification:', err)
      alert('Error creating certification: ' + err)
    }
  }

  const updateCertification = async (certId: string, updates: any) => {
    try {
      const response = await fetch(`/api/pilot-certifications/${certId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      })

      const data = await response.json()

      if (!response.ok) {
        alert('Error: ' + (data.error || 'Failed to update certification'))
        return
      }

      fetchCertifications()
    } catch (err) {
      console.error('Error updating certification:', err)
      alert('Error updating certification: ' + err)
    }
  }

  const deleteCertification = async (certId: string) => {
    if (!confirm('Remove this certification?')) return

    try {
      const response = await fetch(`/api/pilot-certifications/${certId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        alert('Error: ' + (data.error || 'Failed to delete certification'))
        return
      }

      fetchCertifications()
    } catch (err) {
      console.error('Error deleting certification:', err)
      alert('Error deleting certification: ' + err)
    }
  }

  const openCertModalForPilot = (pilotId: string) => {
    setCertModalPilotId(pilotId)
    setCertModalHelicopterId(null)
    setNewCertData(prev => ({ ...prev, pilot_id: pilotId, helicopter_id: '' }))
    setShowCertificationModal(true)
  }

  const openCertModalForHelicopter = (helicopterId: string) => {
    setCertModalHelicopterId(helicopterId)
    setCertModalPilotId(null)
    setNewCertData(prev => ({ ...prev, helicopter_id: helicopterId, pilot_id: '' }))
    setShowCertificationModal(true)
  }

  const fetchExperiences = async () => {
    try {
      const response = await fetch('/api/experiences?include_inactive=true', { credentials: 'include' })
      const data = await response.json()

      if (data.success && data.experiences) {
        setExperiences(data.experiences)
      } else {
        console.warn('Error fetching experiences:', data.error)
        setExperiences([])
      }
    } catch (err) {
      console.warn('Error fetching experiences:', err)
      setExperiences([])
    } finally {
      setLoading(false)
    }
  }

  const fetchDestinations = async () => {
    try {
      const response = await fetch('/api/destinations?include_inactive=true&include_images=true', { credentials: 'include' })
      const data = await response.json()

      if (data.success && data.destinations) {
        setDestinations(data.destinations)
      } else {
        console.warn('Error fetching destinations:', data.error)
        setDestinations([])
      }
    } catch (err) {
      console.warn('Error fetching destinations:', err)
      setDestinations([])
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, status: string, pilotId?: string, helicopterId?: string) => {
    setRefreshing(true)
    try {
      console.log('Updating booking:', { bookingId, status, pilotId })

      const updates: any = { status }
      if (pilotId) updates.pilot_id = pilotId
      if (helicopterId) updates.helicopter_id = helicopterId
      if (status === 'assigned' && pilotId) updates.status = 'assigned'

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      })

      const data = await response.json()
      console.log('Update result:', data)

      if (!response.ok || !data.success) {
        console.error('Update error:', data.error)
        alert('Error updating booking: ' + (data.error || 'Unknown error'))
        setRefreshing(false)
        return
      }

      // Success - update local state immediately
      setBookings(prev => prev.map(booking =>
        booking.id === bookingId
          ? { ...booking, status, pilot_id: pilotId || null, helicopter_id: helicopterId || null }
          : booking
      ))

      setSelectedBooking(null)
      alert(`Booking ${status} successfully!`)

      // Also refresh from server
      setTimeout(() => {
        fetchBookings()
      }, 500)
    } catch (err) {
      console.error('Error updating booking:', err)
      alert('Error updating booking: ' + err)
    } finally {
      setRefreshing(false)
    }
  }

  const deleteBooking = async (bookingId: string) => {
    setRefreshing(true)
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        console.error('Delete error:', data.error)
        alert('Error deleting booking: ' + (data.error || 'Unknown error'))
        setRefreshing(false)
        return
      }

      // Remove from local state immediately
      setBookings(prev => prev.filter(booking => booking.id !== bookingId))
      alert('Booking deleted successfully!')

    } catch (err) {
      console.error('Error deleting booking:', err)
      alert('Error deleting booking: ' + err)
    } finally {
      setRefreshing(false)
    }
  }

  const updateTransactionStatus = async (transactionId: string, status: 'approved' | 'rejected', notes?: string) => {
    console.log('Updating transaction:', { transactionId, status, notes })

    try {
      const transaction = transactions.find(t => t.id === transactionId)
      if (!transaction) {
        alert('Transaction not found')
        return
      }

      // Update transaction status via API (also handles balance update if approving deposit)
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status,
          admin_notes: notes || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Transaction update error:', data.error)
        alert('Error updating transaction: ' + data.error)
        return
      }

      if (data.balance_updated) {
        console.log('Balance updated to', data.new_balance)
        alert(`Transaction ${status} successfully! User balance updated.`)
      } else {
        alert(`Transaction ${status} successfully!`)
      }

      fetchTransactions()

    } catch (err) {
      console.error('Error updating transaction:', err)
      alert('Error updating transaction: ' + err)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: newRole })
      })

      const data = await response.json()

      if (response.ok) {
        fetchUsers()
        alert(`User role updated to ${newRole}!`)
      } else {
        alert('Error updating user role: ' + data.error)
      }
    } catch (err) {
      console.error('Error updating user role:', err)
      alert('Error updating user role: ' + err)
    }
  }

  const openEditUserModal = (user: any) => {
    setSelectedUser(user)
    setEditUserData({
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || '',
      kyc_verified: user.kyc_verified || false,
      account_balance: user.account_balance || 0,
      notes: user.admin_notes || ''
    })
    setShowEditUserModal(true)
  }

  const updateUserProfile = async () => {
    if (!selectedUser) return

    setLoading(true)
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          full_name: editUserData.full_name,
          phone: editUserData.phone,
          role: editUserData.role,
          kyc_verified: editUserData.kyc_verified,
          account_balance: editUserData.account_balance,
          admin_notes: editUserData.notes
        })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Error updating user:', data.error)
        alert('Error updating user: ' + data.error)
      } else {
        alert('User profile updated successfully!')
        setShowEditUserModal(false)
        setSelectedUser(null)
        fetchUsers()
        if (activeTab === 'pilots') fetchPilots()
      }
    } catch (err) {
      console.error('Error updating user:', err)
      alert('Error updating user: ' + err)
    } finally {
      setLoading(false)
    }
  }

  const openEditBookingModal = (booking: Booking) => {
    setSelectedBookingForEdit(booking)
    setEditBookingData({
      from_location: booking.from_location || '',
      to_location: booking.to_location || '',
      scheduled_date: booking.scheduled_date || '',
      scheduled_time: booking.scheduled_time || '',
      return_date: booking.return_date || '',
      return_time: booking.return_time || '',
      passenger_count: booking.passenger_count || 1,
      is_round_trip: booking.is_round_trip || false,
      notes: booking.notes || '',
      revision_notes: ''
    })
    setShowEditBookingModal(true)
  }

  const approveBookingWithChanges = async () => {
    if (!selectedBookingForEdit) return

    setLoading(true)
    try {
      // Create revision data
      const revisionData = {
        from_location: editBookingData.from_location,
        to_location: editBookingData.to_location,
        scheduled_date: editBookingData.scheduled_date,
        scheduled_time: editBookingData.scheduled_time,
        return_date: editBookingData.return_date,
        return_time: editBookingData.return_time,
        passenger_count: editBookingData.passenger_count,
        is_round_trip: editBookingData.is_round_trip,
        notes: editBookingData.notes
      }

      const response = await fetch(`/api/bookings/${selectedBookingForEdit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: 'needs_revision',
          revision_requested: true,
          revision_notes: editBookingData.revision_notes,
          revision_data: revisionData
        })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Error creating revision:', data.error)
        alert('Error creating revision: ' + data.error)
      } else {
        alert('Revision request created! Client will be notified to review and confirm changes.')
        setShowEditBookingModal(false)
        setSelectedBookingForEdit(null)
        fetchBookings()
      }
    } catch (err) {
      console.error('Error creating revision:', err)
      alert('Error creating revision: ' + err)
    } finally {
      setLoading(false)
    }
  }

  const approveBookingAsIs = async (bookingId: string) => {
    setRefreshing(true)
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'approved' })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Error approving booking:', data.error)
        alert('Error approving booking: ' + data.error)
      } else {
        alert('Booking approved without changes!')
        fetchBookings()
      }
    } catch (err) {
      console.error('Error approving booking:', err)
      alert('Error approving booking: ' + err)
    } finally {
      setRefreshing(false)
    }
  }

  const createNewUser = async () => {
    setLoading(true)
    try {
      // Create user via API
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: newUserData.email,
          password: newUserData.password,
          full_name: newUserData.full_name,
          role: newUserData.role,
          phone: newUserData.phone
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      alert(`${newUserData.role} user created successfully!`)
      setShowCreateUserModal(false)
      setNewUserData({
        email: '',
        password: '',
        full_name: '',
        role: 'client',
        phone: ''
      })
      fetchUsers()
    } catch (error: any) {
      console.error('User creation error:', error)
      alert('Error creating user: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const verifyPilot = async (pilotId: string) => {
    try {
      const response = await fetch(`/api/users/${pilotId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ kyc_verified: true })
      })

      if (response.ok) {
        fetchPilots()
      }
    } catch (err) {
      console.error('Error verifying pilot:', err)
      // Update local state for demo
      setPilots(prev => prev.map(p =>
        p.id === pilotId ? { ...p, kyc_verified: true } : p
      ))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-blue-100 text-blue-800'
      case 'assigned': return 'bg-purple-100 text-purple-800'
      case 'accepted': return 'bg-cyan-100 text-cyan-800'
      case 'needs_revision': return 'bg-orange-100 text-orange-800'
      case 'revision_pending': return 'bg-amber-100 text-amber-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
    }
  }

  // Experiences Management Component
  // Sortable Row Component
const SortableExperienceRow = ({ experience, onDelete, onToggleActive, onImageUpload }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: experience.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className={isDragging ? 'bg-gray-50 dark:bg-gray-800' : ''}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mr-3">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{experience.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{experience.description}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {experience.location}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {experience.duration_hours}h {experience.duration_minutes ? `${experience.duration_minutes}m` : ''}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        ${experience.base_price}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={() => onToggleActive(experience.id, experience.is_active)}
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            experience.is_active
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {experience.is_active ? 'Active' : 'Inactive'}
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {new Date(experience.content_edited_at || experience.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onImageUpload(experience.id)}
            className="text-blue-600 hover:text-blue-900"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <Link
            href={`/admin/experiences/${experience.id}/edit`}
            className="text-indigo-600 hover:text-indigo-900"
          >
            <Edit className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onDelete(experience.id)}
            className="text-red-600 hover:text-red-900"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

const ExperiencesManagement = ({ experiences, fetchExperiences, loading }: any) => {
    const [showImageUpload, setShowImageUpload] = useState(false)
    const [selectedExperienceId, setSelectedExperienceId] = useState<string | null>(null)
    const [importing, setImporting] = useState(false)
    const [exporting, setExporting] = useState(false)

    const handleExport = async (format: 'xlsx' | 'csv' = 'xlsx') => {
      setExporting(true)
      try {
        const response = await fetch(`/api/experiences/bulk-export?format=${format}`, {
          credentials: 'include'
        })
        if (!response.ok) throw new Error('Export failed')

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `experiences-export.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } catch (error) {
        console.error('Export error:', error)
        alert('Failed to export experiences')
      } finally {
        setExporting(false)
      }
    }

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      setImporting(true)
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/experiences/bulk-import', {
          method: 'POST',
          credentials: 'include',
          body: formData
        })

        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Import failed')

        alert(`Import completed!\nCreated: ${result.results.created}\nUpdated: ${result.results.updated}\nDeleted: ${result.results.deleted}${result.results.errors.length > 0 ? '\nErrors: ' + result.results.errors.join(', ') : ''}`)
        await fetchExperiences()
      } catch (error: any) {
        console.error('Import error:', error)
        alert('Failed to import: ' + error.message)
      } finally {
        setImporting(false)
        e.target.value = '' // Reset file input
      }
    }
    
    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 8, // Reduced distance for more responsive drag
        },
      }),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
      const { active, over } = event;

      if (active.id !== over?.id) {
        const oldIndex = experiences.findIndex((exp: any) => exp.id === active.id);
        const newIndex = experiences.findIndex((exp: any) => exp.id === over?.id);
        
        const newOrder = arrayMove(experiences, oldIndex, newIndex);
        
        // Immediately update local state for instant visual feedback
        const optimisticOrder = newOrder.map((exp: any, index: number) => ({
          ...exp,
          order_index: index
        }));
        setExperiences(optimisticOrder);
        
        // Show saving indicator
        const savingToast = document.createElement('div');
        savingToast.innerHTML = '💾 Saving order...';
        savingToast.className = 'fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-none shadow-lg z-50';
        document.body.appendChild(savingToast);
        
        // Update database in background with batch operation
        try {
          const updates = newOrder.map((exp: any, index: number) => ({
            id: exp.id,
            order_index: index
          }));

          // Update each experience order via API
          const results = await Promise.allSettled(
            updates.map(update =>
              fetch(`/api/experiences/${update.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ order_index: update.order_index })
              })
            )
          );

          // Check if any updates failed
          const failures = results.filter(result => result.status === 'rejected');
          const httpErrors = results
            .filter(result => result.status === 'fulfilled')
            .filter(result => !(result as any).value.ok);

          if (failures.length > 0 || httpErrors.length > 0) {
            throw new Error(`Failed to update ${failures.length + httpErrors.length} experiences`);
          }

          // Success - show confirmation
          savingToast.innerHTML = '✅ Order saved!';
          savingToast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-none shadow-lg z-50';
          setTimeout(() => document.body.removeChild(savingToast), 2000);

          console.log('✅ Experience order updated successfully');
        } catch (error) {
          console.error('❌ Error updating experience order:', error);

          // Show error and rollback
          savingToast.innerHTML = '❌ Save failed - reverting';
          savingToast.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-none shadow-lg z-50';
          setTimeout(() => document.body.removeChild(savingToast), 3000);

          // Rollback on failure - refetch to restore correct order
          await fetchExperiences();
          alert('Failed to update experience order - reverted changes. Please try again.');
        }
      }
    };

    const handleDeleteExperience = async (id: string) => {
      if (!confirm('Are you sure you want to delete this experience?')) return

      try {
        // Delete the experience via API (will handle related data)
        const response = await fetch(`/api/experiences/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error)
        }

        await fetchExperiences()
      } catch (error: any) {
        console.error('Error deleting experience:', error)
        alert(`Failed to delete experience: ${error.message || 'Unknown error'}`)
      }
    }

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
      try {
        const response = await fetch(`/api/experiences/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ is_active: !currentStatus })
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error)
        }

        await fetchExperiences()
      } catch (error) {
        console.error('Error updating experience status:', error)
      }
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.experience_management')}</h1>
          <div className="flex gap-3">
            <button
              onClick={() => handleExport('xlsx')}
              disabled={exporting}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-none font-semibold flex items-center space-x-2 disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              <span>{exporting ? 'Exporting...' : 'Download XLSX'}</span>
            </button>
            <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-none font-semibold flex items-center space-x-2 cursor-pointer">
              <Upload className="w-5 h-5" />
              <span>{importing ? 'Importing...' : 'Upload XLSX/CSV'}</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleImport}
                disabled={importing}
                className="hidden"
              />
            </label>
            <Link
              href="/admin/experiences/new"
              prefetch={false}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-none font-semibold flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>New Experience</span>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-luxury-charcoal dark:border dark:border-gray-800 rounded-none shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Experience
                  </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Edited
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <tbody className="bg-white dark:bg-luxury-charcoal divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      Loading experiences...
                    </td>
                  </tr>
                ) : experiences.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No experiences found
                    </td>
                  </tr>
                ) : (
                  <SortableContext
                    items={experiences.map((exp: any) => exp.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {experiences.map((experience: any) => (
                      <SortableExperienceRow
                        key={experience.id}
                        experience={experience}
                        onDelete={handleDeleteExperience}
                        onToggleActive={handleToggleActive}
                        onImageUpload={(id: string) => {
                          setSelectedExperienceId(id)
                          setShowImageUpload(true)
                        }}
                      />
                    ))}
                  </SortableContext>
                )}
              </tbody>
            </DndContext>
            </table>
          </div>
        </div>

        {/* Image Upload Modal */}
        {showImageUpload && selectedExperienceId && (
          <IrysUpload
            onUploadComplete={async (url) => {
              try {
                // Update experience image_url
                await fetch(`/api/experiences/${selectedExperienceId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ image_url: url })
                })

                // Add to experience_images
                await fetch('/api/experience-images', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({
                    experience_id: selectedExperienceId,
                    image_url: url,
                    is_primary: true,
                    order_index: 0
                  })
                })

                await fetchExperiences()
                setShowImageUpload(false)
                setSelectedExperienceId(null)
              } catch (error) {
                console.error('Error updating image:', error)
              }
            }}
            onClose={() => {
              setShowImageUpload(false)
              setSelectedExperienceId(null)
            }}
          />
        )}
      </div>
    )
  }

  // Sortable Destination Row Component
  const SortableDestinationRow = ({ destination, onDelete, onToggleActive }: any) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: destination.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <tr
        ref={setNodeRef}
        style={style}
        className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${isDragging ? 'z-50' : ''}`}
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing mr-3 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-none"
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{destination.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 max-w-md truncate">{destination.description}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1 text-gray-400" />
            {destination.location}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex flex-wrap gap-1">
            {destination.features?.slice(0, 3).map((feature: string, index: number) => (
              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {feature}
              </span>
            ))}
            {destination.features?.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                +{destination.features.length - 3}
              </span>
            )}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <button
            onClick={() => onToggleActive(destination.id, destination.is_active)}
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              destination.is_active 
                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                : 'bg-red-100 text-red-800 hover:bg-red-200'
            }`}
          >
            {destination.is_active ? 'Active' : 'Inactive'}
          </button>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
          {new Date(destination.content_edited_at || destination.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex space-x-2">
            <Link
              href={`/admin/destinations/${destination.id}/edit`}
              className="text-indigo-600 hover:text-indigo-900"
            >
              <Edit className="w-4 h-4" />
            </Link>
            <button
              onClick={() => onDelete(destination.id)}
              className="text-red-600 hover:text-red-900"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  // Destinations Management Component
  const DestinationsManagement = ({ destinations, fetchDestinations, loading }: any) => {
    const [showImageUpload, setShowImageUpload] = useState(false)
    const [selectedDestinationId, setSelectedDestinationId] = useState<string | null>(null)
    const [importing, setImporting] = useState(false)
    const [exporting, setExporting] = useState(false)

    const handleExport = async (format: 'xlsx' | 'csv' = 'xlsx') => {
      setExporting(true)
      try {
        const response = await fetch(`/api/destinations/bulk-export?format=${format}`, {
          credentials: 'include'
        })
        if (!response.ok) throw new Error('Export failed')

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `destinations-export.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } catch (error) {
        console.error('Export error:', error)
        alert('Failed to export destinations')
      } finally {
        setExporting(false)
      }
    }

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      setImporting(true)
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/destinations/bulk-import', {
          method: 'POST',
          credentials: 'include',
          body: formData
        })

        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Import failed')

        alert(`Import completed!\nCreated: ${result.results.created}\nUpdated: ${result.results.updated}\nDeleted: ${result.results.deleted}${result.results.errors.length > 0 ? '\nErrors: ' + result.results.errors.join(', ') : ''}`)
        await fetchDestinations()
      } catch (error: any) {
        console.error('Import error:', error)
        alert('Failed to import: ' + error.message)
      } finally {
        setImporting(false)
        e.target.value = '' // Reset file input
      }
    }
    
    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 8, // Reduced distance for more responsive drag
        },
      }),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    )

    const handleDragEnd = async (event: DragEndEvent) => {
      const { active, over } = event;

      if (active.id !== over?.id) {
        const oldIndex = destinations.findIndex((dest: any) => dest.id === active.id);
        const newIndex = destinations.findIndex((dest: any) => dest.id === over?.id);
        
        const newOrder = arrayMove(destinations, oldIndex, newIndex);
        
        // Immediately update local state for instant visual feedback
        const optimisticOrder = newOrder.map((dest: any, index: number) => ({
          ...dest,
          order_index: index
        }));
        setDestinations(optimisticOrder);
        
        // Show saving indicator
        const savingToast = document.createElement('div');
        savingToast.innerHTML = '💾 Saving order...';
        savingToast.className = 'fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-none shadow-lg z-50';
        document.body.appendChild(savingToast);
        
        // Update database in background with batch operation
        try {
          const updates = newOrder.map((dest: any, index: number) => ({
            id: dest.id,
            order_index: index
          }));

          // Update each destination order via API
          const results = await Promise.allSettled(
            updates.map(update =>
              fetch(`/api/destinations/${update.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ order_index: update.order_index })
              })
            )
          );

          // Check if any updates failed
          const failures = results.filter(result => result.status === 'rejected');
          const httpErrors = results
            .filter(result => result.status === 'fulfilled')
            .filter(result => !(result as any).value.ok);

          if (failures.length > 0 || httpErrors.length > 0) {
            throw new Error(`Failed to update ${failures.length + httpErrors.length} destinations`);
          }

          // Success - show confirmation
          savingToast.innerHTML = '✅ Order saved!';
          savingToast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-none shadow-lg z-50';
          setTimeout(() => document.body.removeChild(savingToast), 2000);

          console.log('✅ Destination order updated successfully');
        } catch (error) {
          console.error('❌ Error updating destination order:', error);

          // Show error and rollback
          savingToast.innerHTML = '❌ Save failed - reverting';
          savingToast.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-none shadow-lg z-50';
          setTimeout(() => document.body.removeChild(savingToast), 3000);

          // Rollback on failure - refetch to restore correct order
          await fetchDestinations();
          alert('Failed to update destination order - reverted changes. Please try again.');
        }
      }
    };

    const handleDeleteDestination = async (id: string) => {
      if (!confirm('Are you sure you want to delete this destination?')) return

      try {
        const response = await fetch(`/api/destinations/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error)
        }

        await fetchDestinations()
      } catch (error: any) {
        console.error('Error deleting destination:', error)
        alert('Failed to delete destination: ' + error.message)
      }
    }

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
      try {
        const response = await fetch(`/api/destinations/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ is_active: !currentStatus })
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error)
        }

        await fetchDestinations()
      } catch (error) {
        console.error('Error updating destination status:', error)
      }
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.destination_management')}</h1>
          <div className="flex gap-3">
            <button
              onClick={() => handleExport('xlsx')}
              disabled={exporting}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-none font-semibold flex items-center space-x-2 disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              <span>{exporting ? 'Exporting...' : 'Download XLSX'}</span>
            </button>
            <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-none font-semibold flex items-center space-x-2 cursor-pointer">
              <Upload className="w-5 h-5" />
              <span>{importing ? 'Importing...' : 'Upload XLSX/CSV'}</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleImport}
                disabled={importing}
                className="hidden"
              />
            </label>
            <Link
              href="/admin/destinations/new"
              prefetch={false}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-none font-semibold flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>New Destination</span>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-luxury-charcoal dark:border dark:border-gray-800 rounded-none shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Destination
                  </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Features
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Edited
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <tbody className="bg-white dark:bg-luxury-charcoal divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      Loading destinations...
                    </td>
                  </tr>
                ) : destinations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No destinations found
                    </td>
                  </tr>
                ) : (
                  <SortableContext items={destinations.map((dest: any) => dest.id)} strategy={verticalListSortingStrategy}>
                    {destinations.map((destination: any) => (
                      <SortableDestinationRow
                        key={destination.id}
                        destination={destination}
                        onDelete={handleDeleteDestination}
                        onToggleActive={handleToggleActive}
                      />
                    ))}
                  </SortableContext>
                )}
              </tbody>
            </DndContext>
            </table>
          </div>
        </div>

        {/* Image Upload Modal */}
        {showImageUpload && selectedDestinationId && (
          <IrysUpload
            onUploadComplete={async (url) => {
              try {
                await fetch('/api/destination-images', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({
                    destination_id: selectedDestinationId,
                    image_url: url,
                    is_primary: true,
                    order_index: 0
                  })
                })

                await fetchDestinations()
                setShowImageUpload(false)
                setSelectedDestinationId(null)
              } catch (error) {
                console.error('Error updating image:', error)
              }
            }}
            onClose={() => {
              setShowImageUpload(false)
              setSelectedDestinationId(null)
            }}
          />
        )}
      </div>
    )
  }

  // Calculate pending counts for badges
  const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length
  const pendingTransactionsCount = transactions.filter(t => t.status === 'pending').length

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      pendingBookings={pendingBookingsCount}
      pendingTransactions={pendingTransactionsCount}
    >
      <div className="p-6">
        {activeTab === 'bookings' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.booking_management')}</h1>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-none"
              >
                <option value="all">{t('admin.filter_by_status')} - {t('status.all')}</option>
                <option value="pending">{t('status.pending')}</option>
                <option value="approved">{t('status.approved')}</option>
                <option value="assigned">{t('status.assigned')}</option>
                <option value="completed">{t('status.completed')}</option>
                <option value="cancelled">{t('status.cancelled')}</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="card-luxury">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-semibold">
                            {booking.booking_type === 'transport' 
                              ? `${booking.from_location} → ${booking.to_location}`
                              : booking.experiences?.name
                            }
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            booking.payment_status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            Payment: {booking.payment_status}
                          </span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div>
                            <p><span className="font-medium">Client:</span> {booking.client?.full_name || 'N/A'} ({booking.client?.email || 'N/A'})</p>
                            <p><span className="font-medium">Date:</span> {format(new Date(booking.scheduled_date), 'MMM dd, yyyy')} at {booking.scheduled_time}</p>
                            <p><span className="font-medium">Passengers:</span> {booking.passenger_count}</p>
                          </div>
                          <div>
                            <p><span className="font-medium">Price:</span> ${booking.total_price}</p>
                            {booking.pilot && (
                              <p><span className="font-medium">Pilot:</span> {booking.pilot?.full_name || 'N/A'}</p>
                            )}
                            {booking.notes && (
                              <p><span className="font-medium">Notes:</span> {booking.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 space-y-2">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => approveBookingAsIs(booking.id)}
                              className="block w-full px-3 py-2 mb-1 bg-green-600 text-white text-sm font-medium rounded-none hover:bg-green-700"
                            >
                              {t('admin.approve_as_is')}
                            </button>
                            <button
                              onClick={() => openEditBookingModal(booking)}
                              className="block w-full px-3 py-2 mb-1 bg-blue-600 text-white text-sm font-medium rounded-none hover:bg-blue-700"
                            >
                              {t('admin.approve_with_changes')}
                            </button>
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              className="block w-full px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-none hover:bg-red-700"
                            >
                              {t('admin.cancel')}
                            </button>
                          </>
                        )}
                        
                        {booking.status === 'needs_revision' && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-none p-2">
                            <p className="text-xs text-yellow-800 font-medium text-center">
                              Awaiting Client Review
                            </p>
                            <p className="text-xs text-yellow-600 text-center">
                              Changes requested
                            </p>
                          </div>
                        )}
                        
                        {booking.status === 'approved' && booking.payment_status !== 'paid' && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'pending_payment')}
                            className="block w-full px-3 py-2 mb-2 bg-blue-600 text-white text-sm font-medium rounded-none hover:bg-blue-700"
                          >
                            Awaiting Payment
                          </button>
                        )}
                        {booking.status === 'approved' && !booking.pilot_id && (
                          <button
                            onClick={() => {
                              console.log('Opening assignment modal for booking:', booking.id)
                              setSelectedBooking(booking)
                            }}
                            className="block w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-none hover:bg-blue-700"
                          >
                            {t('admin.assign_pilot_aircraft')}
                          </button>
                        )}

                        {booking.status === 'assigned' && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'completed')}
                            className="block w-full px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-none hover:bg-green-700"
                          >
                            Mark Completed
                          </button>
                        )}

                        {/* Admin Controls - Always visible */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 space-y-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Admin Actions:</p>

                          {/* WhatsApp quick contact */}
                          <div className="flex gap-2 flex-wrap">
                            {booking.client?.phone && (
                              <AdminWhatsAppButton
                                targetPhone={booking.client.phone}
                                targetName={booking.client?.full_name || 'Client'}
                                role="client"
                                booking={{
                                  id: booking.id,
                                  date: format(new Date(booking.scheduled_date), 'MMM dd, yyyy'),
                                  time: booking.scheduled_time,
                                  type: booking.booking_type,
                                  from: booking.from_location || undefined,
                                  to: booking.to_location || undefined,
                                  experienceName: booking.experiences?.name,
                                  status: booking.status
                                }}
                                variant="button"
                              />
                            )}
                            {booking.pilot?.phone && (
                              <AdminWhatsAppButton
                                targetPhone={booking.pilot.phone}
                                targetName={booking.pilot?.full_name || 'Pilot'}
                                role="pilot"
                                booking={{
                                  id: booking.id,
                                  date: format(new Date(booking.scheduled_date), 'MMM dd, yyyy'),
                                  time: booking.scheduled_time,
                                  type: booking.booking_type,
                                  from: booking.from_location || undefined,
                                  to: booking.to_location || undefined,
                                  experienceName: booking.experiences?.name,
                                  status: booking.status
                                }}
                                variant="button"
                              />
                            )}
                          </div>

                          {/* Edit Button */}
                          <button
                            onClick={() => openEditBookingModal(booking)}
                            className="block w-full px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded-none hover:bg-gray-700"
                          >
                            Edit Booking
                          </button>

                          {/* Cancel Button - for non-cancelled/completed bookings */}
                          {booking.status !== 'cancelled' && booking.status !== 'completed' && booking.status !== 'pending' && (
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              className="block w-full px-3 py-2 bg-orange-600 text-white text-sm font-medium rounded-none hover:bg-orange-700"
                            >
                              Cancel Booking
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to permanently delete this booking? This cannot be undone.')) {
                                deleteBooking(booking.id)
                              }
                            }}
                            className="block w-full px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-none hover:bg-red-700"
                          >
                            Delete Booking
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.flight_calendar_title')}</h1>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setCurrentWeekOffset(0)}
                  className={`px-4 py-2 rounded-none transition-colors ${
                    currentWeekOffset === 0 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  This Week
                </button>
                <button 
                  onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-none hover:bg-gray-300"
                >
                  ← Previous Week
                </button>
                <button 
                  onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-none hover:bg-gray-300"
                >
                  Next Week →
                </button>
              </div>
            </div>

            {/* Aircraft Fleet Status */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {HELICOPTER_FLEET.map((helicopter, index) => {
                const helicopterBookings = bookings.filter(b => b.helicopter_id === helicopter.id && b.status !== 'cancelled')
                const todayBookings = helicopterBookings.filter(b => 
                  new Date(b.scheduled_date).toDateString() === new Date().toDateString()
                )
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500']
                
                return (
                  <div key={helicopter.id} className="card-luxury">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-4 h-4 rounded-full ${colors[index]}`}></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{helicopter.capacity} pax</span>
                    </div>
                    <h3 className="font-bold text-sm mb-1">{helicopter.name}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">${helicopter.hourly_rate}/hr</p>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Today:</span>
                        <span className={todayBookings.length > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                          {todayBookings.length > 0 ? `${todayBookings.length} flights` : 'Available'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>This Week:</span>
                        <span className="text-gray-600 dark:text-gray-400">{helicopterBookings.length} total</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Calendar Grid */}
            <div className="card-luxury">
              <div className="mb-4">
                {(() => {
                  const weekStartDate = new Date()
                  weekStartDate.setDate(weekStartDate.getDate() + (currentWeekOffset * 7))
                  const weekEndDate = new Date(weekStartDate)
                  weekEndDate.setDate(weekEndDate.getDate() + 6)
                  return (
                    <h2 className="text-lg font-bold mb-2">
                      Week View - {format(weekStartDate, 'MMM dd')} to {format(weekEndDate, 'MMM dd, yyyy')}
                    </h2>
                  )
                })()}
                <div className="flex space-x-4 text-sm">
                  <div className="flex items-center"><div className="w-3 h-3 bg-yellow-400 rounded-none mr-2"></div>{t('status.pending')}</div>
                  <div className="flex items-center"><div className="w-3 h-3 bg-blue-400 rounded-none mr-2"></div>{t('status.approved')}</div>
                  <div className="flex items-center"><div className="w-3 h-3 bg-green-400 rounded-none mr-2"></div>{t('status.assigned')}</div>
                  <div className="flex items-center"><div className="w-3 h-3 bg-purple-400 rounded-none mr-2"></div>{t('status.completed')}</div>
                </div>
              </div>
              
              {/* Calendar Header */}
              <div className="grid grid-cols-8 gap-1 mb-2">
                <div className="p-2 text-xs font-medium text-gray-600 dark:text-gray-400">Aircraft</div>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                  const dayDate = new Date()
                  dayDate.setDate(dayDate.getDate() + (currentWeekOffset * 7) + index)
                  return (
                    <div key={day} className="p-2 text-xs font-medium text-gray-600 dark:text-gray-400 text-center border-l">
                      {day}<br/>
                      <span className="text-gray-400">{format(dayDate, 'dd')}</span>
                    </div>
                  )
                })}
              </div>
              
              {/* Calendar Rows */}
              {HELICOPTER_FLEET.map((helicopter, index) => {
                const colors = ['border-l-blue-500', 'border-l-green-500', 'border-l-purple-500', 'border-l-orange-500']
                const bgColors = ['bg-blue-50', 'bg-green-50', 'bg-purple-50', 'bg-orange-50']
                
                return (
                  <div key={helicopter.id} className={`grid grid-cols-8 gap-1 border-t ${bgColors[index]} border-l-4 ${colors[index]}`}>
                    <div className="p-3">
                      <div className="font-medium text-sm">{helicopter.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{helicopter.model}</div>
                    </div>
                    
                    {Array.from({ length: 7 }, (_, dayIndex) => {
                      const currentDate = new Date()
                      currentDate.setDate(currentDate.getDate() + (currentWeekOffset * 7) + dayIndex)
                      const dayBookings = bookings.filter(b => 
                        b.helicopter_id === helicopter.id && 
                        new Date(b.scheduled_date).toDateString() === currentDate.toDateString()
                      )
                      
                      return (
                        <div key={dayIndex} className="p-1 min-h-[80px] border-l border-gray-200 dark:border-gray-700 relative">
                          {dayBookings.map((booking, bookingIndex) => {
                            const statusColors = {
                              'pending': 'bg-yellow-400',
                              'approved': 'bg-blue-400', 
                              'assigned': 'bg-green-400',
                              'completed': 'bg-purple-400',
                              'cancelled': 'bg-gray-400'
                            }
                            
                            return (
                              <div 
                                key={booking.id}
                                className={`text-xs p-1 mb-1 rounded-none text-white cursor-pointer hover:opacity-80 ${
                                  statusColors[booking.status as keyof typeof statusColors] || 'bg-gray-400'
                                }`}
                                title={`${booking.scheduled_time} - ${booking.booking_type === 'transport' ? `${booking.from_location} → ${booking.to_location}` : booking.experiences?.name} (${booking.passenger_count} pax)`}
                              >
                                <div className="truncate font-medium">{booking.scheduled_time}</div>
                                <div className="truncate">
                                  {booking.booking_type === 'transport' 
                                    ? `${booking.from_location} → ${booking.to_location}`
                                    : booking.experiences?.name?.slice(0, 15) + '...'
                                  }
                                </div>
                                <div className="truncate">{booking.passenger_count} pax</div>
                              </div>
                            )
                          })}
                          
                          {dayBookings.length === 0 && (
                            <div className="text-center text-gray-400 mt-6 text-xs">Available</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
            
            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="card-luxury">
                <h3 className="font-semibold mb-2 text-sm">Fleet Utilization Today</h3>
                <div className="text-2xl font-bold text-primary-600">
                  {Math.round((bookings.filter(b => 
                    new Date(b.scheduled_date).toDateString() === new Date().toDateString() &&
                    b.status !== 'cancelled'
                  ).length / HELICOPTER_FLEET.length) * 100)}%
                </div>
              </div>
              
              <div className="card-luxury">
                <h3 className="font-semibold mb-2 text-sm">Conflicts to Resolve</h3>
                <div className="text-2xl font-bold text-red-600">0</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">No scheduling conflicts detected</p>
              </div>
              
              <div className="card-luxury">
                <h3 className="font-semibold mb-2 text-sm">Revenue This Week</h3>
                <div className="text-2xl font-bold text-green-600">
                  ${bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.total_price, 0)}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.user_management')}</h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    console.log('Manual refresh triggered')
                    fetchUsers()
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-none hover:bg-primary-700"
                >
                  🔄 Refresh Users
                </button>
                <button
                  onClick={() => setShowCreateUserModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-none hover:bg-green-700"
                >
                  ➕ Create New User
                </button>
              </div>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="card-luxury">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-semibold">{user.full_name || 'Unnamed User'}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'pilot' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.role}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            user.kyc_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.kyc_verified ? 'Verified' : 'Pending KYC'}
                          </span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div>
                            <p><span className="font-medium">{t('form.email')}:</span> {user.email}</p>
                            <p><span className="font-medium">{t('form.phone')}:</span> {user.phone || 'N/A'}</p>
                            <p><span className="font-medium">Created:</span> {new Date(user.created_at).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p><span className="font-medium">Balance:</span> ${user.account_balance?.toFixed(2) || '0.00'}</p>
                            <p><span className="font-medium">{t('form.role')}:</span> {user.role}</p>
                            <p><span className="font-medium">Status:</span> {user.kyc_verified ? 'Active' : 'Pending'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 space-y-2">
                        <button
                          onClick={() => openEditUserModal(user)}
                          className="block w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-none hover:bg-blue-700"
                        >
                          Edit Profile
                        </button>
                        {!user.kyc_verified && (
                          <button
                            onClick={() => {
                              // Verify user
                              updateUserRole(user.id, user.role)
                            }}
                            className="block w-full px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-none hover:bg-green-700"
                          >
                            Verify KYC
                          </button>
                        )}
                        {user.role !== 'admin' && (
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(user.id, e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-none text-sm"
                          >
                            <option value="client">{t('form.client')}</option>
                            <option value="pilot">{t('form.pilot')}</option>
                            <option value="admin">{t('form.admin')}</option>
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'transactions' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.topup_approval')}</h1>
              <div className="flex space-x-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-none"></div>
                  <span>Pending Review</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-none"></div>
                  <span>Approved</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-none"></div>
                  <span>Rejected</span>
                </div>
              </div>
            </div>

            {/* Pending Top-ups Summary */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="card-luxury bg-yellow-50 border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-800 text-sm font-medium">Pending Reviews</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {transactions.filter(t => t.status === 'pending').length}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="mt-2 text-sm text-yellow-700">
                  Total: ${transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0)}
                </div>
              </div>
              
              <div className="card-luxury bg-green-50 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-800 text-sm font-medium">Approved Today</p>
                    <p className="text-2xl font-bold text-green-900">
                      {transactions.filter(t => t.status === 'approved' && 
                        new Date(t.processed_at || t.created_at).toDateString() === new Date().toDateString()
                      ).length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <div className="card-luxury bg-blue-50 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-800 text-sm font-medium">Payment Methods</p>
                    <p className="text-sm text-blue-700">
                      Bank: {transactions.filter(t => t.payment_method === 'bank_transfer').length} | 
                      Crypto: {transactions.filter(t => t.payment_method === 'cryptocurrency').length}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="card-luxury text-center py-12">
                <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No transactions found</h3>
                <p className="text-gray-500 dark:text-gray-400">Top-up requests will appear here for approval</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="card-luxury border-l-4 border-l-yellow-400">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-4 mb-3">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            ${transaction.amount} Top-up Request
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            transaction.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {transaction.status.toUpperCase()}
                          </span>
                          {transaction.payment_method === 'cryptocurrency' && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-none">
                              🪙 Stablecoin Ready
                            </span>
                          )}
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <div>
                            <p><span className="font-medium">Client:</span> {transaction.user?.full_name || 'Unknown'}</p>
                            <p><span className="font-medium">{t('form.email')}:</span> {transaction.user?.email || '—'}</p>
                            <p><span className="font-medium">Method:</span> {(transaction.payment_method || 'unknown').replace('_', ' ').toUpperCase()}</p>
                          </div>
                          <div>
                            <p><span className="font-medium">Reference:</span> {transaction.reference}</p>
                            <p><span className="font-medium">Submitted:</span> {new Date(transaction.created_at).toLocaleString()}</p>
                            {transaction.processed_at && (
                              <p><span className="font-medium">Processed:</span> {new Date(transaction.processed_at).toLocaleString()}</p>
                            )}
                            {transaction.processed_by && (
                              <p><span className="font-medium">Approved by:</span> {transaction.processed_by.full_name || transaction.processed_by.email}</p>
                            )}
                          </div>
                          <div>
                            <p><span className="font-medium">Type:</span> Account Funding</p>
                            {transaction.admin_notes && (
                              <p><span className="font-medium">Admin Notes:</span> {transaction.admin_notes}</p>
                            )}
                          </div>
                        </div>

                        {/* Payment Proof Section */}
                        {transaction.payment_proof_url && (
                          <div className="bg-gray-50 dark:bg-gray-900 rounded-none p-3 mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Proof Submitted:</span>
                              <button
                                onClick={() => setSelectedTransaction(transaction)}
                                className="text-sm text-blue-600 hover:text-blue-800 underline"
                              >
                                🔍 View Full Size
                              </button>
                            </div>
                            <div className="flex space-x-3">
                              <img
                                src={transaction.payment_proof_url}
                                alt="Payment proof"
                                className="w-24 h-32 object-cover rounded-none border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80"
                                onClick={() => setSelectedTransaction(transaction)}
                              />
                              <div className="flex-1 text-xs text-gray-600 dark:text-gray-400">
                                <p className="mb-1">📄 Payment verification document</p>
                                <p className="mb-1">Uploaded with transaction</p>
                                <p>🔍 Click to enlarge and verify details</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="ml-0 sm:ml-6 mt-4 sm:mt-0 space-y-2 min-w-[200px]">
                        {transaction.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateTransactionStatus(transaction.id, 'approved')}
                              className="block w-full px-4 py-3 bg-green-600 text-white text-sm font-medium rounded-none hover:bg-green-700 transition-colors min-h-[44px]"
                            >
                              ✅ {t('admin.approve_fund_account')}
                            </button>
                            <button
                              onClick={() => {
                                const notes = prompt('Why are you rejecting this transaction?')
                                if (notes && notes.trim()) {
                                  updateTransactionStatus(transaction.id, 'rejected', notes)
                                }
                              }}
                              className="block w-full px-4 py-3 bg-red-600 text-white text-sm font-medium rounded-none hover:bg-red-700 transition-colors min-h-[44px]"
                            >
                              ❌ {t('admin.reject_request')}
                            </button>
                            {transaction.payment_proof_url && (
                              <button
                                onClick={() => setSelectedTransaction(transaction)}
                                className="block w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-none hover:bg-blue-700 transition-colors"
                              >
                                🔍 Review Proof
                              </button>
                            )}
                          </>
                        )}
                        
                        {transaction.status === 'approved' && (
                          <div className="text-center p-3 bg-green-50 rounded-none border border-green-200">
                            <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                            <p className="text-xs text-green-800 font-medium">Funds Added</p>
                          </div>
                        )}
                        
                        {transaction.status === 'rejected' && (
                          <div className="text-center p-3 bg-red-50 rounded-none border border-red-200">
                            <XCircle className="h-6 w-6 text-red-600 mx-auto mb-1" />
                            <p className="text-xs text-red-800 font-medium">Request Denied</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'pilots' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('admin.pilot_management')}</h1>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pilots.map((pilot) => {
                  const pilotCerts = certifications.filter(c => c.pilot_id === pilot.id)
                  return (
                  <div key={pilot.id} className="card-luxury">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">{pilot.full_name || 'Unnamed Pilot'}</h3>
                      {pilot.kyc_verified ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{pilot.email}</p>

                    {/* Aircraft Certifications */}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Certified Aircraft</p>
                      {pilotCerts.length > 0 ? (
                        <div className="space-y-2">
                          {pilotCerts.map((cert) => (
                            <div key={cert.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded text-sm">
                              <div>
                                <span className="font-medium">{cert.helicopter?.name || 'Unknown'}</span>
                                <span className="text-gray-500 dark:text-gray-400 ml-1 text-xs">
                                  ({cert.helicopter?.registration_number})
                                </span>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {cert.flight_hours}h &middot; Since {format(new Date(cert.certified_since), 'MMM yyyy')}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                  cert.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                  cert.status === 'expired' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                }`}>
                                  {cert.status}
                                </span>
                                <button
                                  onClick={() => deleteCertification(cert.id)}
                                  className="text-red-500 hover:text-red-700 ml-1"
                                  title="Remove certification"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No aircraft certifications</p>
                      )}
                      <button
                        onClick={() => openCertModalForPilot(pilot.id)}
                        className="mt-2 text-primary-600 hover:text-primary-700 text-xs font-medium flex items-center"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Aircraft Certification
                      </button>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => openEditUserModal(pilot)}
                        className="bg-blue-600 text-white text-sm px-3 py-2 rounded-none hover:bg-blue-700 w-full"
                      >
                        Edit Profile
                      </button>
                      {!pilot.kyc_verified && (
                        <button
                          onClick={() => verifyPilot(pilot.id)}
                          className="btn-primary text-sm w-full"
                        >
                          Verify KYC
                        </button>
                      )}
                    </div>
                  </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'aircrafts' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.fleet_management')}</h1>
              <button
                onClick={() => setShowAddHelicopterModal(true)}
                className="btn-primary flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Helicopter
              </button>
            </div>

            {/* Fleet Overview Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="card-luxury">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Total Aircraft</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{helicopters.length}</p>
                  </div>
                  <Plane className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <div className="card-luxury">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Active Fleet</p>
                    <p className="text-3xl font-bold text-green-600">
                      {helicopters.filter(h => h.status === 'active').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="card-luxury">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">In Maintenance</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {helicopters.filter(h => h.status === 'maintenance').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              <div className="card-luxury">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Avg. Rate</p>
                    <p className="text-3xl font-bold text-primary-600">
                      ${helicopters.length > 0 ? Math.round(helicopters.reduce((sum, h) => sum + h.hourly_rate, 0) / helicopters.length) : 0}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-primary-600" />
                </div>
              </div>
            </div>

            {/* Helicopters Table */}
            <div className="card-luxury">
              <h2 className="text-xl font-semibold mb-4">Aircraft Fleet</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4">Aircraft</th>
                      <th className="text-left py-3 px-4">Registration</th>
                      <th className="text-left py-3 px-4">Capacity</th>
                      <th className="text-left py-3 px-4">Rate/Hour</th>
                      <th className="text-left py-3 px-4">Flight Hours</th>
                      <th className="text-left py-3 px-4">Certified Pilots</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Next Maintenance</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {helicopters.map((helicopter) => (
                      <tr key={helicopter.id} className="border-b border-gray-100 dark:border-gray-700 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{helicopter.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{helicopter.model}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-sm">{helicopter.registration_number}</td>
                        <td className="py-3 px-4">{helicopter.capacity} pax</td>
                        <td className="py-3 px-4">${helicopter.hourly_rate}/hr</td>
                        <td className="py-3 px-4">{helicopter.total_flight_hours || 0}h</td>
                        <td className="py-3 px-4">
                          {(() => {
                            const heliCerts = certifications.filter(c => c.helicopter_id === helicopter.id && c.status === 'active')
                            return (
                              <div>
                                <span className="font-medium">{heliCerts.length}</span>
                                <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">pilot{heliCerts.length !== 1 ? 's' : ''}</span>
                                {heliCerts.length > 0 && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {heliCerts.map(c => c.pilot?.full_name || c.pilot?.email || '?').join(', ')}
                                  </div>
                                )}
                              </div>
                            )
                          })()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            helicopter.status === 'active' ? 'bg-green-100 text-green-800' :
                            helicopter.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                            helicopter.status === 'inspection' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {helicopter.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {helicopter.next_maintenance_due ? format(new Date(helicopter.next_maintenance_due), 'MMM dd, yyyy') : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedHelicopterForEdit(helicopter)
                                setShowEditHelicopterModal(true)
                              }}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setSelectedHelicopterForEdit(helicopter)
                                setShowMaintenanceModal(true)
                              }}
                              className="text-green-600 hover:text-green-700 text-sm"
                            >
                              Maintenance
                            </button>
                            <button
                              onClick={() => openCertModalForHelicopter(helicopter.id)}
                              className="text-purple-600 hover:text-purple-700 text-sm"
                            >
                              Pilots
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Maintenance */}
            <div className="card-luxury mt-6">
              <h2 className="text-xl font-semibold mb-4">Recent Maintenance Records</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4">Aircraft</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Description</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceRecords.slice(0, 10).map((record) => (
                      <tr key={record.id} className="border-b border-gray-100 dark:border-gray-700 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4">
                          <div className="font-medium">{record.helicopter?.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{record.helicopter?.registration_number}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="capitalize">{record.maintenance_type}</span>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate">{record.description}</td>
                        <td className="py-3 px-4 text-sm">
                          {format(new Date(record.start_date), 'MMM dd, yyyy')}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.status === 'completed' ? 'bg-green-100 text-green-800' :
                            record.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            record.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {(record.status || 'unknown').replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4">{record.cost ? `$${record.cost}` : 'N/A'}</td>
                      </tr>
                    ))}
                    {maintenanceRecords.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                          No maintenance records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('admin.analytics_dashboard')}</h1>
            
            {/* Financial Overview */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Client Balances (Trust Funds) */}
              <div className="card-luxury bg-blue-50 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-800 text-sm font-medium">{t('finance.client_balances')}</p>
                    <p className="text-2xl font-bold text-blue-900">
                      ${financialSummary?.client_trust_funds?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">Trust funds held for clients</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              {/* Business Revenue (From database) */}
              <div className="card-luxury bg-green-50 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-800 text-sm font-medium">{t('finance.business_revenue')}</p>
                    <p className="text-2xl font-bold text-green-900">
                      ${financialSummary?.total_business_revenue?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-xs text-green-600 mt-1">{t('finance.service_fees')}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
              </div>

              {/* Pending Revenue */}
              <div className="card-luxury bg-yellow-50 border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-800 text-sm font-medium">{t('finance.pending_payments')}</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      ${financialSummary?.pending_revenue?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">From active bookings</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                </div>
              </div>

              {/* Operational Costs (From database) */}
              <div className="card-luxury bg-red-50 border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-800 text-sm font-medium">{t('finance.operational_costs')}</p>
                    <p className="text-2xl font-bold text-red-900">
                      ${financialSummary?.total_operational_costs?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-xs text-red-600 mt-1">Fuel, pilot costs, etc.</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </div>

            {/* Net Revenue Summary */}
            <div className="card-luxury bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-800 text-lg font-semibold">{t('finance.net_revenue')}</p>
                  <p className="text-4xl font-bold text-green-900">
                    ${financialSummary?.net_revenue?.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-sm text-green-600 mt-1">Revenue minus operational costs</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Revenue: ${financialSummary?.total_business_revenue?.toFixed(2) || '0.00'}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Costs: ${financialSummary?.total_operational_costs?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </div>

            {/* Business Metrics */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="card-luxury">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{users.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <div className="card-luxury">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Total Bookings</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{bookings.length}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <div className="card-luxury">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Completed Flights</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {bookings.filter(b => b.status === 'completed').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="card-luxury">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Active Pilots</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {pilots.filter(p => p.kyc_verified).length}
                    </p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Recent Revenue */}
              <div className="card-luxury">
                <h3 className="text-lg font-semibold mb-4 text-green-800">Recent Business Revenue</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {businessRevenue.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No revenue records yet</p>
                  ) : (
                    businessRevenue.slice(0, 10).map((revenue) => (
                      <div key={revenue.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{(revenue.revenue_type || 'revenue').replace('_', ' ').toUpperCase()}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {revenue.booking?.from_location} → {revenue.booking?.to_location}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(revenue.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-600">+${revenue.amount}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{revenue.status}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Operational Costs */}
              <div className="card-luxury">
                <h3 className="text-lg font-semibold mb-4 text-red-800">Recent Operational Costs</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {operationalCosts.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No cost records yet</p>
                  ) : (
                    operationalCosts.slice(0, 10).map((cost) => (
                      <div key={cost.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{(cost.cost_type || 'cost').replace('_', ' ').toUpperCase()}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">By: {cost.pilot?.full_name || 'System'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(cost.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-red-600">-${cost.amount}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{cost.status}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card-luxury">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm">New booking from John Doe</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm">Payment approved for Ana Rodriguez</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">5 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm">New pilot registered: Miguel Santos</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">1 day ago</span>
                  </div>
                </div>
              </div>
              
              <div className="card-luxury">
                <h3 className="text-lg font-semibold mb-4">Pending Actions</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-yellow-600">{bookings.filter(b => b.status === 'pending').length} bookings awaiting approval</span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-none">Action needed</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-blue-600">{transactions.filter(t => t.status === 'pending').length} payments to review</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-none">Review</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-purple-600">{pilots.filter(p => !p.kyc_verified).length} pilots awaiting verification</span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-none">KYC</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Experiences Tab */}
        {activeTab === 'experiences' && (
          <ExperiencesManagement 
            experiences={experiences}
            fetchExperiences={fetchExperiences}
            loading={loading}
          />
        )}

        {/* Destinations Tab */}
        {activeTab === 'destinations' && (
          <DestinationsManagement
            destinations={destinations}
            fetchDestinations={fetchDestinations}
            loading={loading}
          />
        )}
      </div>

      {/* Pilot Assignment Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-luxury-charcoal dark:border dark:border-gray-800 rounded-none p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6 flex items-center text-gray-900 dark:text-white">
              <Plane className="h-6 w-6 mr-2 text-primary-600" />
              {t('admin.assign_flight_crew')}
            </h3>
            
            {/* Booking Details */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-none p-4 mb-6">
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Booking Details:</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedBooking.booking_type === 'transport' 
                  ? `${selectedBooking.from_location} → ${selectedBooking.to_location}`
                  : selectedBooking.experiences?.name
                }
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Date: {format(new Date(selectedBooking.scheduled_date), 'MMM dd, yyyy')} at {selectedBooking.scheduled_time}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Passengers: {selectedBooking.passenger_count} | Base Price: ${selectedBooking.total_price - (selectedBooking.addon_total_price || 0)}
                {(selectedBooking.addon_total_price || 0) > 0 && (
                  <span> | Add-ons: ${selectedBooking.addon_total_price} | Total: ${selectedBooking.total_price}</span>
                )}
              </p>
              
              {/* Passenger Details */}
              {selectedBooking.passenger_details && selectedBooking.passenger_details.length > 0 && (
                <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                  <h5 className="font-medium text-sm mb-2">Passenger Information:</h5>
                  <div className="space-y-2">
                    {selectedBooking.passenger_details.map((passenger: any, index: number) => (
                      <div key={index} className="text-xs bg-white dark:bg-gray-800 rounded-none p-2 text-gray-900 dark:text-white">
                        <div className="font-medium">{passenger.name} (Age: {passenger.age})</div>
                        {passenger.passport && <div>ID: {passenger.passport}</div>}
                        {passenger.emergency_contact && <div>Emergency: {passenger.emergency_contact}</div>}
                        {passenger.dietary_restrictions && <div>Dietary: {passenger.dietary_restrictions}</div>}
                        {passenger.special_requests && <div>Special: {passenger.special_requests}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Selected Add-ons */}
              {selectedBooking.selected_addons && selectedBooking.selected_addons.length > 0 && (
                <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                  <h5 className="font-medium text-sm mb-2">Selected Add-ons:</h5>
                  <div className="space-y-1">
                    {selectedBooking.selected_addons.map((addon: any, index: number) => (
                      <div key={index} className="text-xs flex justify-between bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-none p-2">
                        <span>{addon.addon_id} × {addon.quantity}</span>
                        <span>${(addon.quantity * addon.unit_price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Helicopter Selection */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Plane className="h-5 w-5 mr-2 text-blue-600" />
                  Select Helicopter
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {HELICOPTER_FLEET.map((helicopter) => (
                    <div
                      key={helicopter.id}
                      className={`p-3 border rounded-none cursor-pointer transition-all ${
                        selectedHelicopter === helicopter.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedHelicopter(helicopter.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium">{helicopter.name}</h5>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{helicopter.capacity} passengers</p>
                        </div>
                        <span className="text-sm font-medium text-green-600">
                          ${helicopter.hourly_rate}/hr
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pilot Selection */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  {t('admin.assign_pilot')}
                </h4>
                {selectedHelicopter && (() => {
                  const certifiedPilotIds = certifications
                    .filter(c => c.helicopter_id === selectedHelicopter && c.status === 'active')
                    .map(c => c.pilot_id)
                  const uncertifiedCount = availablePilots.filter(p => !certifiedPilotIds.includes(p.id)).length
                  if (certifiedPilotIds.length > 0 && uncertifiedCount > 0) {
                    return (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">
                        Showing {certifiedPilotIds.length} certified pilot{certifiedPilotIds.length !== 1 ? 's' : ''} for this aircraft. {uncertifiedCount} uncertified hidden.
                      </p>
                    )
                  }
                  return null
                })()}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(() => {
                    const certifiedPilotIds = selectedHelicopter
                      ? certifications
                          .filter(c => c.helicopter_id === selectedHelicopter && c.status === 'active')
                          .map(c => c.pilot_id)
                      : []
                    const filteredPilots = selectedHelicopter && certifiedPilotIds.length > 0
                      ? availablePilots.filter(p => certifiedPilotIds.includes(p.id))
                      : availablePilots

                    return filteredPilots.map((pilot) => (
                    <div
                      key={pilot.id}
                      className={`p-3 border rounded-none cursor-pointer transition-all ${
                        selectedPilot === pilot.id
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedPilot(pilot.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h5 className="font-medium">{pilot.full_name || 'Unnamed Pilot'}</h5>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{pilot.email}</p>
                        </div>
                        {pilot.kyc_verified && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                    ))
                  })()}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  setSelectedBooking(null)
                  setSelectedHelicopter('')
                  setSelectedPilot('')
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-none hover:bg-gray-300"
              >
                {t('admin.cancel')}
              </button>
              <button
                onClick={() => {
                  if (!selectedPilot || !selectedHelicopter) {
                    alert('Please select both a pilot and helicopter')
                    return
                  }
                  updateBookingStatus(selectedBooking.id, 'assigned', selectedPilot, selectedHelicopter)
                  setSelectedHelicopter('')
                  setSelectedPilot('')
                }}
                disabled={!selectedPilot || !selectedHelicopter}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-none hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('admin.assign_flight')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-luxury-charcoal dark:border dark:border-gray-800 rounded-none p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-6 flex items-center text-gray-900 dark:text-white">
              <Users className="h-6 w-6 mr-2 text-green-600" />
              Create New User
            </h3>
            
            <form onSubmit={(e) => { e.preventDefault(); createNewUser(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('form.email')} *
                </label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary-500"
                  placeholder="user@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('form.password')} *
                </label>
                <input
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('form.full_name')} *
                </label>
                <input
                  type="text"
                  value={newUserData.full_name}
                  onChange={(e) => setNewUserData({ ...newUserData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary-500"
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('form.phone')}
                </label>
                <input
                  type="tel"
                  value={newUserData.phone}
                  onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary-500"
                  placeholder="+502 5555 5555"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('form.role')} *
                </label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as 'client' | 'pilot' | 'admin' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="client">{t('form.client')}</option>
                  <option value="pilot">{t('form.pilot')}</option>
                  <option value="admin">{t('form.admin')}</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {newUserData.role === 'client' && 'Can book flights and manage profile'}
                  {newUserData.role === 'pilot' && 'Can access pilot dashboard and manage flights'}
                  {newUserData.role === 'admin' && 'Full access to admin panel and all features'}
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-none p-3">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> User will be created and can login immediately. 
                  {newUserData.role === 'admin' ? ' Admin users are auto-verified.' : 
                   newUserData.role === 'pilot' ? ' Pilot users need KYC verification.' : 
                   ' Client users can start booking immediately.'}
                </p>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateUserModal(false)
                    setNewUserData({
                      email: '',
                      password: '',
                      full_name: '',
                      role: 'client',
                      phone: ''
                    })
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-none hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-none hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Proof Viewer Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-luxury-charcoal dark:border dark:border-gray-800 rounded-none p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center text-gray-900 dark:text-white">
                <DollarSign className="h-6 w-6 mr-2 text-green-600" />
                Payment Proof Review - ${selectedTransaction.amount}
              </h3>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>
            
            {/* Transaction Details */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-none p-4 mb-6">
              <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Transaction Details:</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><span className="font-medium">Client:</span> {selectedTransaction.user?.full_name}</p>
                  <p><span className="font-medium">{t('form.email')}:</span> {selectedTransaction.user?.email}</p>
                  <p><span className="font-medium">Amount:</span> ${selectedTransaction.amount}</p>
                </div>
                <div>
                  <p><span className="font-medium">Method:</span> {(selectedTransaction.payment_method || 'unknown').replace('_', ' ').toUpperCase()}</p>
                  <p><span className="font-medium">Reference:</span> {selectedTransaction.reference}</p>
                  <p><span className="font-medium">Submitted:</span> {new Date(selectedTransaction.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Payment Proof Image */}
            <div className="text-center mb-6">
              <h4 className="font-semibold mb-3">Payment Proof Document:</h4>
              {selectedTransaction.payment_proof_url ? (
                <div className="border rounded-none overflow-hidden">
                  <img
                    src={selectedTransaction.payment_proof_url}
                    alt="Payment proof document"
                    className="max-w-full max-h-96 mx-auto object-contain"
                  />
                </div>
              ) : (
                <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-none">
                  <p className="text-gray-600 dark:text-gray-400">No payment proof attached to this transaction</p>
                </div>
              )}
            </div>

            {/* Stablecoin Integration Notice */}
            {selectedTransaction.payment_method === 'cryptocurrency' && (
              <div className="bg-blue-50 border border-blue-200 rounded-none p-4 mb-6">
                <div className="flex items-center mb-2">
                  <span className="text-blue-800 font-medium">🪙 Stablecoin Payment Integration</span>
                </div>
                <p className="text-sm text-blue-700">
                  This transaction uses cryptocurrency payment method. Future stablecoin integration will enable:
                </p>
                <ul className="text-sm text-blue-700 mt-2 ml-4 list-disc">
                  <li>Automatic verification via blockchain transaction hash</li>
                  <li>Real-time balance updates upon confirmation</li>
                  <li>Multi-chain support (USDC, USDT, DAI)</li>
                  <li>Reduced manual approval time</li>
                </ul>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-none hover:bg-gray-300"
              >
                {t('admin.close')}
              </button>
              
              {selectedTransaction.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      updateTransactionStatus(selectedTransaction.id, 'approved')
                      setSelectedTransaction(null)
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-none hover:bg-green-700"
                  >
                    ✅ {t('admin.approve_fund_account')}
                  </button>
                  <button
                    onClick={() => {
                      const notes = prompt('Why are you rejecting this transaction?')
                      if (notes && notes.trim()) {
                        updateTransactionStatus(selectedTransaction.id, 'rejected', notes)
                        setSelectedTransaction(null)
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-none hover:bg-red-700"
                  >
                    ❌ {t('admin.reject_request')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit User/Pilot Modal */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-luxury-charcoal dark:border dark:border-gray-800 rounded-none p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center text-gray-900 dark:text-white">
                <Users className="h-6 w-6 mr-2 text-blue-600" />
                Edit {selectedUser.role === 'pilot' ? 'Pilot' : 'User'} Profile
              </h3>
              <button
                onClick={() => {
                  setShowEditUserModal(false)
                  setSelectedUser(null)
                }}
                className="text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>
            
            {/* User Details Summary */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-none p-4 mb-6">
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Current Profile:</h4>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p><span className="font-medium">User ID:</span> {selectedUser.id}</p>
                <p><span className="font-medium">Created:</span> {new Date(selectedUser.created_at).toLocaleDateString()}</p>
                <p><span className="font-medium">Current Role:</span> {selectedUser.role}</p>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); updateUserProfile(); }} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('form.full_name')} *
                  </label>
                  <input
                    type="text"
                    value={editUserData.full_name}
                    onChange={(e) => setEditUserData({ ...editUserData, full_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editUserData.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-none bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                    title="Email cannot be changed"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('form.phone')}
                  </label>
                  <input
                    type="tel"
                    value={editUserData.phone}
                    onChange={(e) => setEditUserData({ ...editUserData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary-500"
                    placeholder="+502 5555 5555"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role *
                  </label>
                  <select
                    value={editUserData.role}
                    onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="client">{t('form.client')}</option>
                    <option value="pilot">{t('form.pilot')}</option>
                    <option value="admin">{t('form.admin')}</option>
                  </select>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Balance (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editUserData.account_balance}
                    onChange={(e) => setEditUserData({ ...editUserData, account_balance: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manually adjust user balance</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Verification Status
                  </label>
                  <div className="flex items-center space-x-4 pt-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="kyc_verified"
                        checked={editUserData.kyc_verified}
                        onChange={() => setEditUserData({ ...editUserData, kyc_verified: true })}
                        className="mr-2"
                      />
                      <span className="text-sm text-green-700">Verified</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="kyc_verified"
                        checked={!editUserData.kyc_verified}
                        onChange={() => setEditUserData({ ...editUserData, kyc_verified: false })}
                        className="mr-2"
                      />
                      <span className="text-sm text-yellow-700">Pending</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Admin Notes
                </label>
                <textarea
                  value={editUserData.notes}
                  onChange={(e) => setEditUserData({ ...editUserData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Internal notes about this user (not visible to user)"
                />
              </div>
              
              {/* Warning for role changes */}
              {editUserData.role !== selectedUser.role && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-none p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Warning:</strong> Changing the user role will affect their access permissions.
                  </p>
                </div>
              )}
              
              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditUserModal(false)
                    setSelectedUser(null)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-none hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-none hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : t('admin.save_changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {showEditBookingModal && selectedBookingForEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-luxury-charcoal dark:border dark:border-gray-800 rounded-none p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center text-gray-900 dark:text-white">
                <Calendar className="h-6 w-6 mr-2 text-blue-600" />
                Review & Edit Booking
              </h3>
              <button
                onClick={() => {
                  setShowEditBookingModal(false)
                  setSelectedBookingForEdit(null)
                }}
                className="text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>
            
            {/* Current Booking Details */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-none p-4 mb-6">
              <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Original Booking:</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <p><span className="font-medium">Client:</span> {selectedBookingForEdit.client?.full_name}</p>
                  <p><span className="font-medium">Route:</span> {selectedBookingForEdit.from_location} → {selectedBookingForEdit.to_location}</p>
                  <p><span className="font-medium">Date:</span> {selectedBookingForEdit.scheduled_date}</p>
                </div>
                <div>
                  <p><span className="font-medium">Time:</span> {selectedBookingForEdit.scheduled_time}</p>
                  <p><span className="font-medium">Passengers:</span> {selectedBookingForEdit.passenger_count}</p>
                  <p><span className="font-medium">Price:</span> ${selectedBookingForEdit.total_price}</p>
                </div>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); approveBookingWithChanges(); }} className="space-y-4">
              {/* Route */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    From Location
                  </label>
                  <input
                    type="text"
                    value={editBookingData.from_location}
                    onChange={(e) => setEditBookingData({ ...editBookingData, from_location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    To Location
                  </label>
                  <input
                    type="text"
                    value={editBookingData.to_location}
                    onChange={(e) => setEditBookingData({ ...editBookingData, to_location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
              
              {/* Date and Time */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    value={editBookingData.scheduled_date}
                    onChange={(e) => setEditBookingData({ ...editBookingData, scheduled_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Departure Time
                  </label>
                  <input
                    type="time"
                    value={editBookingData.scheduled_time}
                    onChange={(e) => setEditBookingData({ ...editBookingData, scheduled_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              {/* Round Trip Toggle */}
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editBookingData.is_round_trip}
                    onChange={(e) => setEditBookingData({ 
                      ...editBookingData, 
                      is_round_trip: e.target.checked,
                      return_date: e.target.checked ? editBookingData.return_date : '',
                      return_time: e.target.checked ? editBookingData.return_time : ''
                    })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">Round Trip</span>
                </label>
              </div>

              {/* Return Details - Only show if round trip */}
              {editBookingData.is_round_trip && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Return Date
                    </label>
                    <input
                      type="date"
                      value={editBookingData.return_date}
                      onChange={(e) => setEditBookingData({ ...editBookingData, return_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Return Time
                    </label>
                    <input
                      type="time"
                      value={editBookingData.return_time}
                      onChange={(e) => setEditBookingData({ ...editBookingData, return_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>
              )}
              
              {/* Passengers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Number of Passengers
                </label>
                <select
                  value={editBookingData.passenger_count}
                  onChange={(e) => setEditBookingData({ ...editBookingData, passenger_count: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary-500"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Passenger' : 'Passengers'}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Booking Notes
                </label>
                <textarea
                  value={editBookingData.notes}
                  onChange={(e) => setEditBookingData({ ...editBookingData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Special requests or preferences..."
                />
              </div>
              
              {/* Revision Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Revision Notes (Required) *
                </label>
                <textarea
                  value={editBookingData.revision_notes}
                  onChange={(e) => setEditBookingData({ ...editBookingData, revision_notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Explain the changes you're making and why (client will see this)..."
                  required
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-none p-3">
                <p className="text-sm text-blue-800">
                  💡 <strong>How this works:</strong> Your changes will be sent to the client for review. They can accept the changes and proceed with payment, or request further modifications.
                </p>
              </div>
              
              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditBookingModal(false)
                    setSelectedBookingForEdit(null)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-none hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-none hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Revision to Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Helicopter Modal */}
      {showAddHelicopterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-luxury-charcoal dark:border dark:border-gray-800 rounded-none p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Add New Helicopter</h3>
            
            <form onSubmit={async (e) => {
              e.preventDefault()
              try {
                const response = await fetch('/api/helicopters', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify(newHelicopterData)
                })

                const data = await response.json()
                if (!response.ok) throw new Error(data.error)

                setShowAddHelicopterModal(false)
                setNewHelicopterData({
                  name: '',
                  model: '',
                  manufacturer: '',
                  year_manufactured: new Date().getFullYear(),
                  registration_number: '',
                  capacity: 4,
                  hourly_rate: 600,
                  max_range_km: 500,
                  cruise_speed_kmh: 180,
                  fuel_capacity_liters: 200,
                  fuel_consumption_lph: 50,
                  location: 'Guatemala City Base',
                  notes: ''
                })
                fetchHelicopters()
                alert('Helicopter added successfully!')
              } catch (error: any) {
                alert('Error adding helicopter: ' + error.message)
              }
            }} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={newHelicopterData.name}
                    onChange={(e) => setNewHelicopterData({ ...newHelicopterData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model</label>
                  <input
                    type="text"
                    value={newHelicopterData.model}
                    onChange={(e) => setNewHelicopterData({ ...newHelicopterData, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={newHelicopterData.manufacturer}
                    onChange={(e) => setNewHelicopterData({ ...newHelicopterData, manufacturer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Registration Number</label>
                  <input
                    type="text"
                    value={newHelicopterData.registration_number}
                    onChange={(e) => setNewHelicopterData({ ...newHelicopterData, registration_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                  <input
                    type="number"
                    value={newHelicopterData.year_manufactured}
                    onChange={(e) => setNewHelicopterData({ ...newHelicopterData, year_manufactured: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={newHelicopterData.capacity}
                    onChange={(e) => setNewHelicopterData({ ...newHelicopterData, capacity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hourly Rate ($)</label>
                  <input
                    type="number"
                    value={newHelicopterData.hourly_rate}
                    onChange={(e) => setNewHelicopterData({ ...newHelicopterData, hourly_rate: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Range (km)</label>
                  <input
                    type="number"
                    value={newHelicopterData.max_range_km}
                    onChange={(e) => setNewHelicopterData({ ...newHelicopterData, max_range_km: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={newHelicopterData.location}
                    onChange={(e) => setNewHelicopterData({ ...newHelicopterData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  value={newHelicopterData.notes}
                  onChange={(e) => setNewHelicopterData({ ...newHelicopterData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddHelicopterModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-none"
                >
                  Add Helicopter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Helicopter Modal */}
      {showEditHelicopterModal && selectedHelicopterForEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-luxury-charcoal dark:border dark:border-gray-800 rounded-none p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Edit Helicopter</h3>
            
            <form onSubmit={async (e) => {
              e.preventDefault()
              try {
                const response = await fetch(`/api/helicopters/${selectedHelicopterForEdit.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({
                    name: selectedHelicopterForEdit.name,
                    model: selectedHelicopterForEdit.model,
                    manufacturer: selectedHelicopterForEdit.manufacturer,
                    year_manufactured: selectedHelicopterForEdit.year_manufactured,
                    registration_number: selectedHelicopterForEdit.registration_number,
                    capacity: selectedHelicopterForEdit.capacity,
                    hourly_rate: selectedHelicopterForEdit.hourly_rate,
                    max_range_km: selectedHelicopterForEdit.max_range_km,
                    cruise_speed_kmh: selectedHelicopterForEdit.cruise_speed_kmh,
                    fuel_capacity_liters: selectedHelicopterForEdit.fuel_capacity_liters,
                    fuel_consumption_lph: selectedHelicopterForEdit.fuel_consumption_lph,
                    status: selectedHelicopterForEdit.status,
                    location: selectedHelicopterForEdit.location,
                    notes: selectedHelicopterForEdit.notes,
                    total_flight_hours: selectedHelicopterForEdit.total_flight_hours,
                    last_maintenance_date: selectedHelicopterForEdit.last_maintenance_date,
                    next_maintenance_due: selectedHelicopterForEdit.next_maintenance_due,
                    insurance_expiry: selectedHelicopterForEdit.insurance_expiry
                  })
                })

                const data = await response.json()
                if (!response.ok) throw new Error(data.error)

                setShowEditHelicopterModal(false)
                fetchHelicopters()
                alert('Helicopter updated successfully!')
              } catch (error: any) {
                alert('Error updating helicopter: ' + error.message)
              }
            }} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={selectedHelicopterForEdit.name}
                    onChange={(e) => setSelectedHelicopterForEdit({ ...selectedHelicopterForEdit, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model</label>
                  <input
                    type="text"
                    value={selectedHelicopterForEdit.model}
                    onChange={(e) => setSelectedHelicopterForEdit({ ...selectedHelicopterForEdit, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={selectedHelicopterForEdit.status}
                    onChange={(e) => setSelectedHelicopterForEdit({ ...selectedHelicopterForEdit, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-none"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inspection">Inspection</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hourly Rate ($)</label>
                  <input
                    type="number"
                    value={selectedHelicopterForEdit.hourly_rate}
                    onChange={(e) => setSelectedHelicopterForEdit({ ...selectedHelicopterForEdit, hourly_rate: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Flight Hours</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedHelicopterForEdit.total_flight_hours || 0}
                    onChange={(e) => setSelectedHelicopterForEdit({ ...selectedHelicopterForEdit, total_flight_hours: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={selectedHelicopterForEdit.location}
                    onChange={(e) => setSelectedHelicopterForEdit({ ...selectedHelicopterForEdit, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Next Maintenance Due</label>
                  <input
                    type="date"
                    value={selectedHelicopterForEdit.next_maintenance_due || ''}
                    onChange={(e) => setSelectedHelicopterForEdit({ ...selectedHelicopterForEdit, next_maintenance_due: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Insurance Expiry</label>
                  <input
                    type="date"
                    value={selectedHelicopterForEdit.insurance_expiry || ''}
                    onChange={(e) => setSelectedHelicopterForEdit({ ...selectedHelicopterForEdit, insurance_expiry: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  value={selectedHelicopterForEdit.notes || ''}
                  onChange={(e) => setSelectedHelicopterForEdit({ ...selectedHelicopterForEdit, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditHelicopterModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-none"
                >
                  Update Helicopter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && selectedHelicopterForEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-luxury-charcoal dark:border dark:border-gray-800 rounded-none p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Schedule Maintenance</h3>
            
            <form onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)

              try {
                const maintenanceType = formData.get('maintenance_type') as string
                const response = await fetch('/api/maintenance', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({
                    helicopter_id: selectedHelicopterForEdit.id,
                    type: maintenanceType,
                    description: formData.get('description'),
                    start_date: formData.get('start_date'),
                    status: maintenanceType !== 'inspection' ? 'in_progress' : 'scheduled',
                    technician: formData.get('performed_by'),
                    cost: formData.get('cost') ? parseFloat(formData.get('cost') as string) : 0,
                    notes: formData.get('notes')
                  })
                })

                const data = await response.json()
                if (!response.ok) throw new Error(data.error)

                // Update helicopter status if going into maintenance
                if (maintenanceType !== 'inspection') {
                  await fetch(`/api/helicopters/${selectedHelicopterForEdit.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ status: 'maintenance' })
                  })
                }

                setShowMaintenanceModal(false)
                fetchHelicopters()
                fetchMaintenanceRecords()
                alert('Maintenance scheduled successfully!')
              } catch (error: any) {
                alert('Error scheduling maintenance: ' + error.message)
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Maintenance Type</label>
                <select
                  name="maintenance_type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-none"
                  required
                >
                  <option value="scheduled">Scheduled Maintenance</option>
                  <option value="unscheduled">Unscheduled Repair</option>
                  <option value="inspection">Inspection</option>
                  <option value="upgrade">Upgrade</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  name="description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-none"
                  rows={3}
                  required
                  placeholder="Describe the maintenance work..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Performed By</label>
                <input
                  type="text"
                  name="performed_by"
                  className="w-full px-3 py-2 border border-gray-300 rounded-none"
                  placeholder="Technician or company name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Cost ($)</label>
                <input
                  type="number"
                  name="cost"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-none"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  name="notes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-none"
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowMaintenanceModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-none"
                >
                  Schedule Maintenance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pilot-Aircraft Certification Modal */}
      {showCertificationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {certModalPilotId ? 'Add Aircraft Certification' : certModalHelicopterId ? 'Manage Certified Pilots' : 'New Certification'}
              </h2>
              <button
                onClick={() => {
                  setShowCertificationModal(false)
                  setCertModalPilotId(null)
                  setCertModalHelicopterId(null)
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Existing certifications for context */}
            {(certModalPilotId || certModalHelicopterId) && (() => {
              const contextCerts = certModalPilotId
                ? certifications.filter(c => c.pilot_id === certModalPilotId)
                : certifications.filter(c => c.helicopter_id === certModalHelicopterId)

              if (contextCerts.length === 0) return null

              return (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    {certModalPilotId ? 'Current Certifications' : 'Certified Pilots'}
                  </p>
                  <div className="space-y-2">
                    {contextCerts.map((cert) => (
                      <div key={cert.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded">
                        <div className="text-sm">
                          <span className="font-medium">
                            {certModalPilotId
                              ? (cert.helicopter?.name || 'Unknown Aircraft')
                              : (cert.pilot?.full_name || cert.pilot?.email || 'Unknown Pilot')
                            }
                          </span>
                          {certModalPilotId && cert.helicopter?.registration_number && (
                            <span className="text-gray-500 dark:text-gray-400 ml-1">({cert.helicopter.registration_number})</span>
                          )}
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {cert.flight_hours}h &middot; Since {format(new Date(cert.certified_since), 'MMM yyyy')}
                            <span className={`ml-2 px-1.5 py-0.5 rounded text-xs font-medium ${
                              cert.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                              cert.status === 'expired' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>
                              {cert.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={cert.flight_hours}
                            onChange={(e) => updateCertification(cert.id, { flight_hours: parseFloat(e.target.value) || 0 })}
                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm rounded"
                            title="Flight hours"
                          />
                          <select
                            value={cert.status}
                            onChange={(e) => updateCertification(cert.id, { status: e.target.value })}
                            className="px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm rounded"
                          >
                            <option value="active">Active</option>
                            <option value="expired">Expired</option>
                            <option value="suspended">Suspended</option>
                          </select>
                          <button
                            onClick={() => deleteCertification(cert.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* Add new certification form */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Add New Certification</p>
              <div className="space-y-3">
                {!certModalPilotId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pilot</label>
                    <select
                      value={newCertData.pilot_id}
                      onChange={(e) => setNewCertData(prev => ({ ...prev, pilot_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-none"
                    >
                      <option value="">Select pilot...</option>
                      {pilots.filter(p => p.kyc_verified).map(p => (
                        <option key={p.id} value={p.id}>{p.full_name || p.email}</option>
                      ))}
                    </select>
                  </div>
                )}

                {!certModalHelicopterId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aircraft</label>
                    <select
                      value={newCertData.helicopter_id}
                      onChange={(e) => setNewCertData(prev => ({ ...prev, helicopter_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-none"
                    >
                      <option value="">Select aircraft...</option>
                      {helicopters.map(h => (
                        <option key={h.id} value={h.id}>{h.name} ({h.registration_number})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Certified Since</label>
                  <input
                    type="date"
                    value={newCertData.certified_since}
                    onChange={(e) => setNewCertData(prev => ({ ...prev, certified_since: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Flight Hours</label>
                  <input
                    type="number"
                    value={newCertData.flight_hours}
                    onChange={(e) => setNewCertData(prev => ({ ...prev, flight_hours: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-none"
                    min="0"
                    step="0.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                  <textarea
                    value={newCertData.notes}
                    onChange={(e) => setNewCertData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-none"
                    rows={2}
                    placeholder="Optional notes..."
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCertificationModal(false)
                      setCertModalPilotId(null)
                      setCertModalHelicopterId(null)
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={createCertification}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-none hover:bg-primary-700"
                  >
                    Add Certification
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}