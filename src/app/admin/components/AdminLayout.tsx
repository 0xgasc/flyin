'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { logout } from '@/lib/auth-client'
import { useTranslation } from '@/lib/i18n'
import {
  Plane, Calendar, Users, UserCheck, DollarSign, BarChart3,
  MapPin, Image as ImageIcon, Menu, X, LogOut, Home, ChevronLeft, ChevronRight
} from 'lucide-react'
import type { AdminTab } from '../types'

interface AdminLayoutProps {
  activeTab: AdminTab
  onTabChange: (tab: AdminTab) => void
  pendingBookings?: number
  pendingTransactions?: number
  children: React.ReactNode
}

const navItemDefs: { id: AdminTab; labelKey: string; icon: React.ElementType; groupKey: string }[] = [
  { id: 'bookings', labelKey: 'admin.bookings', icon: Plane, groupKey: 'admin.group_operations' },
  { id: 'calendar', labelKey: 'admin.calendar', icon: Calendar, groupKey: 'admin.group_operations' },
  { id: 'users', labelKey: 'admin.users', icon: Users, groupKey: 'admin.group_people' },
  { id: 'pilots', labelKey: 'admin.pilots', icon: UserCheck, groupKey: 'admin.group_people' },
  { id: 'transactions', labelKey: 'admin.transactions', icon: DollarSign, groupKey: 'admin.group_finance' },
  { id: 'analytics', labelKey: 'admin.analytics', icon: BarChart3, groupKey: 'admin.group_finance' },
  { id: 'experiences', labelKey: 'admin.experiences', icon: ImageIcon, groupKey: 'admin.group_content' },
  { id: 'destinations', labelKey: 'admin.destinations', icon: MapPin, groupKey: 'admin.group_content' },
  { id: 'aircrafts', labelKey: 'admin.aircrafts', icon: Plane, groupKey: 'admin.group_assets' },
]

export function AdminLayout({
  activeTab,
  onTabChange,
  pendingBookings = 0,
  pendingTransactions = 0,
  children
}: AdminLayoutProps) {
  const router = useRouter()
  const { t } = useTranslation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await logout()
    router.push('/')
  }

  // Resolve nav items with translations
  const navItems = navItemDefs.map(item => ({
    ...item,
    label: t(item.labelKey),
    group: t(item.groupKey),
  }))

  // Group nav items
  const groups = navItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {} as Record<string, typeof navItems>)

  const NavContent = () => (
    <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
      {Object.entries(groups).map(([group, items]) => (
        <div key={group}>
          {sidebarOpen && (
            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-3">
              {group}
            </h3>
          )}
          <div className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              const badge = item.id === 'bookings' ? pendingBookings :
                           item.id === 'transactions' ? pendingTransactions : 0

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id)
                    setMobileMenuOpen(false)
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-soft text-sm font-medium
                    transition-colors duration-150
                    ${isActive
                      ? 'bg-primary-50 dark:bg-gold-500/10 text-primary-700 dark:text-gold-400 border-l-4 border-primary-500 dark:border-gold-500'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-600 dark:text-gold-500' : 'text-gray-400 dark:text-gray-500'}`} />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {badge > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                  {!sidebarOpen && badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-luxury-black flex">
      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden md:flex flex-col bg-white dark:bg-luxury-charcoal border-r border-gray-200 dark:border-gray-800 transition-all duration-300
          ${sidebarOpen ? 'w-64' : 'w-20'}
        `}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
          {sidebarOpen && (
            <Link href="/" className="flex items-center gap-2">
              <span className="font-bold text-gray-900 dark:text-white">FlyInGuate Admin</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-soft"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        <NavContent />

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
          <button
            onClick={handleSignOut}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-soft text-sm font-medium
              text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors
            `}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>{t('nav.sign_out')}</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-luxury-charcoal border-b border-gray-200 dark:border-gray-800 z-40 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-gray-900 dark:text-white">FlyInGuate Admin</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-soft"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <aside
            className="absolute top-16 left-0 bottom-0 w-64 bg-white dark:bg-luxury-charcoal border-r border-gray-200 dark:border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <NavContent />
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-soft text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <LogOut className="w-5 h-5" />
                <span>{t('nav.sign_out')}</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:pt-0 pt-16 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

export default AdminLayout
