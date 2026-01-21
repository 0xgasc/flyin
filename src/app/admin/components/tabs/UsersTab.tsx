'use client'

import { useTranslation } from '@/lib/i18n'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { User } from '../../types'

interface UsersTabProps {
  users: User[]
  loading: boolean
  onRefresh: () => void
  onCreateUser: () => void
  onEditUser: (user: User) => void
  onVerifyKYC: (userId: string) => Promise<void>
  onUpdateRole: (userId: string, newRole: string) => Promise<void>
}

export function UsersTab({
  users,
  loading,
  onRefresh,
  onCreateUser,
  onEditUser,
  onVerifyKYC,
  onUpdateRole
}: UsersTabProps) {
  const { t } = useTranslation()

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800'
      case 'pilot':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.user_management')}</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
          >
            🔄 Refresh Users
          </button>
          <button
            onClick={onCreateUser}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            ➕ Create New User
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded">
          <p className="text-gray-500">No users found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="card-luxury">
              <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h3 className="text-lg font-semibold">{user.full_name || 'Unnamed User'}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.kyc_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.kyc_verified ? 'Verified' : 'Pending KYC'}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="space-y-1">
                      <p>
                        <span className="font-medium">{t('form.email')}:</span> {user.email}
                      </p>
                      <p>
                        <span className="font-medium">{t('form.phone')}:</span> {user.phone || 'N/A'}
                      </p>
                      <p>
                        <span className="font-medium">Created:</span>{' '}
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p>
                        <span className="font-medium">Balance:</span> ${user.account_balance?.toFixed(2) || '0.00'}
                      </p>
                      <p>
                        <span className="font-medium">{t('form.role')}:</span> {user.role}
                      </p>
                      <p>
                        <span className="font-medium">Status:</span>{' '}
                        {user.kyc_verified ? 'Active' : 'Pending'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 w-full lg:w-auto lg:min-w-[160px]">
                  <button
                    onClick={() => onEditUser(user)}
                    className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                  >
                    ✏️ Edit Profile
                  </button>

                  {!user.kyc_verified && (
                    <button
                      onClick={() => onVerifyKYC(user.id)}
                      className="w-full px-3 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
                    >
                      ✓ Verify KYC
                    </button>
                  )}

                  {user.role !== 'admin' && (
                    <select
                      value={user.role}
                      onChange={(e) => onUpdateRole(user.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="client">Client</option>
                      <option value="pilot">Pilot</option>
                      <option value="admin">Admin</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UsersTab
