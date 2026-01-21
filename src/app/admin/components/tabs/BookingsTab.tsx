'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { useTranslation } from '@/lib/i18n'
import { StatusBadge, type StatusType } from '@/components/ui/StatusBadge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Booking, Pilot } from '../../types'

interface BookingsTabProps {
  bookings: Booking[]
  pilots: Pilot[]
  loading: boolean
  refreshing: boolean
  onApproveAsIs: (bookingId: string) => Promise<void>
  onApproveWithChanges: (booking: Booking) => void
  onCancel: (bookingId: string) => Promise<void>
  onAssignPilot: (booking: Booking) => void
  onUpdateStatus: (bookingId: string, status: string) => Promise<void>
  onFilterChange: (filter: string) => void
  statusFilter: string
}

export function BookingsTab({
  bookings,
  pilots,
  loading,
  refreshing,
  onApproveAsIs,
  onApproveWithChanges,
  onCancel,
  onAssignPilot,
  onUpdateStatus,
  onFilterChange,
  statusFilter
}: BookingsTabProps) {
  const { t } = useTranslation()

  const getPaymentStatusColor = (status: string) => {
    return status === 'paid'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.booking_management')}</h1>
        <select
          value={statusFilter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-none">
          <p className="text-gray-500">{t('admin.no_bookings')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              refreshing={refreshing}
              onApproveAsIs={onApproveAsIs}
              onApproveWithChanges={onApproveWithChanges}
              onCancel={onCancel}
              onAssignPilot={onAssignPilot}
              onUpdateStatus={onUpdateStatus}
              t={t}
              getPaymentStatusColor={getPaymentStatusColor}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface BookingCardProps {
  booking: Booking
  refreshing: boolean
  onApproveAsIs: (bookingId: string) => Promise<void>
  onApproveWithChanges: (booking: Booking) => void
  onCancel: (bookingId: string) => Promise<void>
  onAssignPilot: (booking: Booking) => void
  onUpdateStatus: (bookingId: string, status: string) => Promise<void>
  t: (key: string) => string
  getPaymentStatusColor: (status: string) => string
}

function BookingCard({
  booking,
  refreshing,
  onApproveAsIs,
  onApproveWithChanges,
  onCancel,
  onAssignPilot,
  onUpdateStatus,
  t,
  getPaymentStatusColor
}: BookingCardProps) {
  return (
    <div className="card-luxury">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <h3 className="text-lg font-semibold truncate">
              {booking.booking_type === 'transport'
                ? `${booking.from_location} → ${booking.to_location}`
                : booking.experiences?.name
              }
            </h3>
            <StatusBadge status={booking.status as StatusType} />
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(booking.payment_status)}`}>
              Payment: {booking.payment_status}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="space-y-1">
              <p>
                <span className="font-medium">Client:</span>{' '}
                {booking.client?.full_name || 'N/A'} ({booking.client?.email || 'N/A'})
              </p>
              <p>
                <span className="font-medium">Date:</span>{' '}
                {format(new Date(booking.scheduled_date), 'MMM dd, yyyy')} at {booking.scheduled_time}
              </p>
              <p>
                <span className="font-medium">Passengers:</span> {booking.passenger_count}
              </p>
            </div>
            <div className="space-y-1">
              <p>
                <span className="font-medium">Price:</span> ${booking.total_price}
              </p>
              {booking.pilot && (
                <p>
                  <span className="font-medium">Pilot:</span> {booking.pilot?.full_name || 'N/A'}
                </p>
              )}
              {booking.notes && (
                <p>
                  <span className="font-medium">Notes:</span> {booking.notes}
                </p>
              )}
            </div>
          </div>

          {/* Add-ons if present */}
          {booking.selected_addons && booking.selected_addons.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700">Add-ons:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {booking.selected_addons.map((addon: any, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {addon.name} (+${addon.price})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 w-full lg:w-auto lg:min-w-[180px]">
          {booking.status === 'pending' && (
            <>
              <button
                onClick={() => onApproveAsIs(booking.id)}
                disabled={refreshing}
                className="w-full px-3 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {refreshing ? '...' : `✓ ${t('admin.approve_as_is')}`}
              </button>
              <button
                onClick={() => onApproveWithChanges(booking)}
                disabled={refreshing}
                className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                ✏️ {t('admin.approve_with_changes')}
              </button>
              <button
                onClick={() => onCancel(booking.id)}
                disabled={refreshing}
                className="w-full px-3 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                ✗ {t('admin.cancel')}
              </button>
            </>
          )}

          {booking.status === 'needs_revision' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-xs text-yellow-800 font-medium text-center">
                📝 Awaiting Client Review
              </p>
              <p className="text-xs text-yellow-600 text-center mt-1">
                Changes requested
              </p>
            </div>
          )}

          {booking.status === 'approved' && booking.payment_status !== 'paid' && (
            <button
              onClick={() => onUpdateStatus(booking.id, 'pending_payment')}
              disabled={refreshing}
              className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              💳 Awaiting Payment
            </button>
          )}

          {booking.status === 'approved' && !booking.pilot_id && (
            <button
              onClick={() => onAssignPilot(booking)}
              disabled={refreshing}
              className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {t('admin.assign_pilot_aircraft')}
            </button>
          )}

          {booking.status === 'assigned' && (
            <button
              onClick={() => onUpdateStatus(booking.id, 'completed')}
              disabled={refreshing}
              className="w-full px-3 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              ✓ Mark Completed
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookingsTab
