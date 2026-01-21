'use client'

import { DollarSign, CheckCircle, XCircle, BarChart3 } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { Transaction } from '../../types'

interface TransactionsTabProps {
  transactions: Transaction[]
  loading: boolean
  onApprove: (transactionId: string) => Promise<void>
  onReject: (transactionId: string, notes: string) => Promise<void>
  onViewProof: (transaction: Transaction) => void
}

export function TransactionsTab({
  transactions,
  loading,
  onApprove,
  onReject,
  onViewProof
}: TransactionsTabProps) {
  const { t } = useTranslation()

  const pendingCount = transactions.filter(t => t.status === 'pending').length
  const pendingTotal = transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0)
  const approvedTodayCount = transactions.filter(t =>
    t.status === 'approved' &&
    new Date(t.processed_at || t.created_at).toDateString() === new Date().toDateString()
  ).length
  const bankCount = transactions.filter(t => t.payment_method === 'bank_transfer').length
  const cryptoCount = transactions.filter(t => t.payment_method === 'cryptocurrency').length

  const handleReject = (transactionId: string) => {
    const notes = prompt('Why are you rejecting this transaction?')
    if (notes && notes.trim()) {
      onReject(transactionId, notes)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-red-100 text-red-800'
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Top-up Approval System</h1>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded"></div>
            <span>Pending Review</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded"></div>
            <span>Approved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded"></div>
            <span>Rejected</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="card-luxury bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-800 text-sm font-medium">Pending Reviews</p>
              <p className="text-2xl font-bold text-yellow-900">{pendingCount}</p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-600" />
          </div>
          <div className="mt-2 text-sm text-yellow-700">
            Total: ${pendingTotal}
          </div>
        </div>

        <div className="card-luxury bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-800 text-sm font-medium">Approved Today</p>
              <p className="text-2xl font-bold text-green-900">{approvedTodayCount}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="card-luxury bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-800 text-sm font-medium">Payment Methods</p>
              <p className="text-sm text-blue-700">
                Bank: {bankCount} | Crypto: {cryptoCount}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="card-luxury text-center py-12">
          <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No transactions found</h3>
          <p className="text-gray-500">Top-up requests will appear here for approval</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onApprove={onApprove}
              onReject={handleReject}
              onViewProof={onViewProof}
              getStatusColor={getStatusColor}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface TransactionCardProps {
  transaction: Transaction
  onApprove: (transactionId: string) => Promise<void>
  onReject: (transactionId: string) => void
  onViewProof: (transaction: Transaction) => void
  getStatusColor: (status: string) => string
  t: (key: string) => string
}

function TransactionCard({
  transaction,
  onApprove,
  onReject,
  onViewProof,
  getStatusColor,
  t
}: TransactionCardProps) {
  return (
    <div className="card-luxury border-l-4 border-l-yellow-400">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <h3 className="text-xl font-bold text-gray-900">
              ${transaction.amount} Top-up Request
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
              {transaction.status.toUpperCase()}
            </span>
            {transaction.payment_method === 'cryptocurrency' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                🪙 Stablecoin Ready
              </span>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid sm:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
            <div className="space-y-1">
              <p><span className="font-medium">Client:</span> {transaction.user?.full_name}</p>
              <p><span className="font-medium">{t('form.email')}:</span> {transaction.user?.email}</p>
              <p><span className="font-medium">Method:</span> {(transaction.payment_method || 'unknown').replace('_', ' ').toUpperCase()}</p>
            </div>
            <div className="space-y-1">
              <p><span className="font-medium">Reference:</span> {transaction.reference}</p>
              <p><span className="font-medium">Submitted:</span> {new Date(transaction.created_at).toLocaleString()}</p>
              {transaction.processed_at && (
                <p><span className="font-medium">Processed:</span> {new Date(transaction.processed_at).toLocaleString()}</p>
              )}
            </div>
            <div className="space-y-1">
              <p><span className="font-medium">Type:</span> Account Funding</p>
              {transaction.admin_notes && (
                <p><span className="font-medium">Admin Notes:</span> {transaction.admin_notes}</p>
              )}
            </div>
          </div>

          {/* Payment Proof */}
          {transaction.payment_proof_url && (
            <div className="bg-gray-50 rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Payment Proof Submitted:</span>
                <button
                  onClick={() => onViewProof(transaction)}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  🔍 View Full Size
                </button>
              </div>
              <div className="flex gap-3">
                <img
                  src={transaction.payment_proof_url}
                  alt="Payment proof"
                  className="w-24 h-32 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-80"
                  onClick={() => onViewProof(transaction)}
                />
                <div className="flex-1 text-xs text-gray-600 space-y-1">
                  <p>📄 Payment verification document</p>
                  <p>Uploaded with transaction</p>
                  <p>🔍 Click to enlarge and verify details</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 w-full lg:w-auto lg:min-w-[200px]">
          {transaction.status === 'pending' && (
            <>
              <button
                onClick={() => onApprove(transaction.id)}
                className="w-full px-4 py-3 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors min-h-[44px]"
              >
                ✅ {t('admin.approve_fund_account')}
              </button>
              <button
                onClick={() => onReject(transaction.id)}
                className="w-full px-4 py-3 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors min-h-[44px]"
              >
                ❌ {t('admin.reject_request')}
              </button>
              {transaction.payment_proof_url && (
                <button
                  onClick={() => onViewProof(transaction)}
                  className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                >
                  🔍 Review Proof
                </button>
              )}
            </>
          )}

          {transaction.status === 'approved' && (
            <div className="text-center p-3 bg-green-50 rounded border border-green-200">
              <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-green-800 font-medium">Funds Added</p>
            </div>
          )}

          {transaction.status === 'rejected' && (
            <div className="text-center p-3 bg-red-50 rounded border border-red-200">
              <XCircle className="h-6 w-6 text-red-600 mx-auto mb-1" />
              <p className="text-xs text-red-800 font-medium">Request Denied</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TransactionsTab
