'use client'

import { useI18n } from '@/lib/i18n'

export type StatusType = 'pending' | 'approved' | 'assigned' | 'completed' | 'cancelled' | 'rejected'

interface StatusBadgeProps {
  status: StatusType
  size?: 'sm' | 'md'
  className?: string
}

const statusConfig: Record<StatusType, { bg: string; text: string; border: string }> = {
  pending: {
    bg: 'bg-[#fef3c7]',
    text: 'text-[#92400e]',
    border: 'border-[#fcd34d]',
  },
  approved: {
    bg: 'bg-[#dbeafe]',
    text: 'text-[#1e40af]',
    border: 'border-[#93c5fd]',
  },
  assigned: {
    bg: 'bg-[#e9d5ff]',
    text: 'text-[#6b21a8]',
    border: 'border-[#c4b5fd]',
  },
  completed: {
    bg: 'bg-[#dcfce7]',
    text: 'text-[#166534]',
    border: 'border-[#86efac]',
  },
  cancelled: {
    bg: 'bg-[#fee2e2]',
    text: 'text-[#991b1b]',
    border: 'border-[#fca5a5]',
  },
  rejected: {
    bg: 'bg-[#fef2f2]',
    text: 'text-[#b91c1c]',
    border: 'border-[#fecaca]',
  },
}

const statusLabels: Record<StatusType, { en: string; es: string }> = {
  pending: { en: 'Pending', es: 'Pendiente' },
  approved: { en: 'Approved', es: 'Aprobado' },
  assigned: { en: 'Assigned', es: 'Asignado' },
  completed: { en: 'Completed', es: 'Completado' },
  cancelled: { en: 'Cancelled', es: 'Cancelado' },
  rejected: { en: 'Rejected', es: 'Rechazado' },
}

export function StatusBadge({ status, size = 'md', className = '' }: StatusBadgeProps) {
  const { locale } = useI18n()
  const config = statusConfig[status] || statusConfig.pending
  const label = statusLabels[status] || statusLabels.pending

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : 'px-2.5 py-1 text-sm'

  return (
    <span
      className={`
        inline-flex items-center rounded font-medium border
        ${config.bg} ${config.text} ${config.border}
        ${sizeClasses}
        ${className}
      `}
    >
      {locale === 'es' ? label.es : label.en}
    </span>
  )
}

export default StatusBadge
