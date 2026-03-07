'use client'

import { useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

interface Booking {
  id: string
  created_at: string
  booking_type: 'transport' | 'experience'
  status: string
  total_price: number
  payment_status: string
  scheduled_date: string
  passenger_count: number
}

interface Transaction {
  id: string
  created_at: string
  type: string
  amount: number
  payment_method: string
  status: string
}

interface AnalyticsChartsProps {
  bookings: Booking[]
  transactions: Transaction[]
}

const STATUS_COLORS: Record<string, string> = {
  completed: '#10b981',
  approved: '#3b82f6',
  assigned: '#6366f1',
  accepted: '#8b5cf6',
  pending: '#f59e0b',
  cancelled: '#ef4444',
  needs_revision: '#f97316',
}

const PAYMENT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']

export default function AnalyticsCharts({ bookings, transactions }: AnalyticsChartsProps) {
  // Revenue trend by month
  const revenueByMonth = useMemo(() => {
    const months: Record<string, { month: string, revenue: number, bookings: number }> = {}

    bookings.forEach(b => {
      if (!b.created_at) return
      const date = new Date(b.created_at)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })

      if (!months[key]) {
        months[key] = { month: label, revenue: 0, bookings: 0 }
      }
      months[key].bookings++
      if (b.status === 'completed' || b.payment_status === 'paid') {
        months[key].revenue += b.total_price || 0
      }
    })

    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // Last 12 months
      .map(([, v]) => v)
  }, [bookings])

  // Booking status distribution
  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {}
    bookings.forEach(b => {
      counts[b.status] = (counts[b.status] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
      value,
      color: STATUS_COLORS[name] || '#94a3b8'
    }))
  }, [bookings])

  // Booking type split (transport vs experience)
  const typeDistribution = useMemo(() => {
    let transport = 0, experience = 0
    bookings.forEach(b => {
      if (b.booking_type === 'experience') experience++
      else transport++
    })
    return [
      { name: 'Transport', value: transport, color: '#3b82f6' },
      { name: 'Experience', value: experience, color: '#10b981' },
    ].filter(d => d.value > 0)
  }, [bookings])

  // Payment method breakdown from transactions
  const paymentMethods = useMemo(() => {
    const counts: Record<string, number> = {}
    transactions.forEach(t => {
      const method = t.payment_method || 'unknown'
      const label = method.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      counts[label] = (counts[label] || 0) + 1
    })
    return Object.entries(counts).map(([name, value], i) => ({
      name,
      value,
      color: PAYMENT_COLORS[i % PAYMENT_COLORS.length]
    }))
  }, [transactions])

  // Passengers per month trend
  const passengersByMonth = useMemo(() => {
    const months: Record<string, { month: string, passengers: number }> = {}
    bookings.forEach(b => {
      if (!b.created_at) return
      const date = new Date(b.created_at)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      if (!months[key]) months[key] = { month: label, passengers: 0 }
      months[key].passengers += b.passenger_count || 0
    })
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([, v]) => v)
  }, [bookings])

  // Recent activity from real data
  const recentActivity = useMemo(() => {
    const allEvents: { text: string, time: Date, type: string }[] = []

    bookings.slice(0, 20).forEach(b => {
      allEvents.push({
        text: `Booking #${b.id.slice(-6)} - ${b.status}`,
        time: new Date(b.created_at),
        type: b.status
      })
    })

    transactions.slice(0, 10).forEach(t => {
      allEvents.push({
        text: `${t.type} - $${t.amount.toFixed(2)} (${t.status})`,
        time: new Date(t.created_at),
        type: t.status
      })
    })

    return allEvents
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 8)
  }, [bookings, transactions])

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-sm" style={{ color: p.color }}>
            {p.name}: {p.name.toLowerCase().includes('revenue') ? `$${p.value.toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    )
  }

  const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    if (percent < 0.05) return null
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="card-luxury text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No booking data available for charts yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Revenue & Bookings Trend */}
      <div className="card-luxury">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue & Booking Trends</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueByMonth} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" fill="url(#colorRevenue)" strokeWidth={2} />
              <Area yAxisId="right" type="monotone" dataKey="bookings" name="Bookings" stroke="#3b82f6" fill="url(#colorBookings)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status & Type Distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Booking Status */}
        <div className="card-luxury">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Booking Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={PieLabel}
                  outerRadius={90}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Type */}
        <div className="card-luxury">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transport vs Experience</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={PieLabel}
                  outerRadius={90}
                  dataKey="value"
                >
                  {typeDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Passengers Trend */}
      {passengersByMonth.length > 0 && (
        <div className="card-luxury">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Passengers per Month</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={passengersByMonth} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="passengers" name="Passengers" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Payment Methods & Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Payment Methods */}
        {paymentMethods.length > 0 && (
          <div className="card-luxury">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Methods</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethods}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={PieLabel}
                    outerRadius={90}
                    dataKey="value"
                  >
                    {paymentMethods.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Real Recent Activity */}
        <div className="card-luxury">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No recent activity</p>
            ) : (
              recentActivity.map((event, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{event.text}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">{formatTimeAgo(event.time)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
