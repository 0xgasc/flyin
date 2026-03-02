export function BookingCardSkeleton() {
  return (
    <div className="bg-white dark:bg-luxury-charcoal rounded-lg p-6 animate-pulse" role="status" aria-label="Loading booking">
      <div className="flex justify-between items-start mb-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24" />
      </div>
      <span className="sr-only">Loading booking information...</span>
    </div>
  )
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="animate-pulse" role="status" aria-label="Loading table row">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        </td>
      ))}
      <span className="sr-only">Loading table data...</span>
    </tr>
  )
}

export function ExperienceCardSkeleton() {
  return (
    <div className="bg-white dark:bg-luxury-charcoal rounded-soft overflow-hidden shadow-sm animate-pulse" role="status" aria-label="Loading experience">
      <div className="h-48 bg-gray-200 dark:bg-gray-700" />
      <div className="p-4 space-y-3">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        <div className="flex justify-between items-center mt-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-28" />
        </div>
      </div>
      <span className="sr-only">Loading experience information...</span>
    </div>
  )
}

export function DestinationCardSkeleton() {
  return (
    <div className="bg-white dark:bg-luxury-charcoal rounded-soft overflow-hidden shadow-sm animate-pulse" role="status" aria-label="Loading destination">
      <div className="h-64 bg-gray-200 dark:bg-gray-700" />
      <div className="p-6 space-y-3">
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
        <div className="mt-4 flex gap-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        </div>
      </div>
      <span className="sr-only">Loading destination information...</span>
    </div>
  )
}

export function UserProfileSkeleton() {
  return (
    <div className="bg-white dark:bg-luxury-charcoal rounded-lg p-6 animate-pulse" role="status" aria-label="Loading profile">
      <div className="flex items-center space-x-4 mb-6">
        <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
      </div>
      <span className="sr-only">Loading profile information...</span>
    </div>
  )
}

export function TransactionRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-luxury-charcoal rounded-lg animate-pulse" role="status" aria-label="Loading transaction">
      <div className="flex items-center space-x-4 flex-1">
        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        </div>
      </div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
      <span className="sr-only">Loading transaction information...</span>
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" role="status" aria-label="Loading form">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        </div>
      ))}
      <div className="flex gap-4 pt-4">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
      </div>
      <span className="sr-only">Loading form...</span>
    </div>
  )
}
