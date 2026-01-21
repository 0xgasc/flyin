'use client'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
  color?: 'primary' | 'white' | 'gray' | 'current'
}

export function LoadingSpinner({
  size = 'md',
  className = '',
  text,
  color = 'primary'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-8 h-8 border-[3px]',
  }

  const colorClasses = {
    primary: 'border-primary-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-400 border-t-transparent',
    current: 'border-current border-t-transparent',
  }

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <div
        className={`
          rounded-full animate-spin
          ${sizeClasses[size]}
          ${colorClasses[color]}
        `}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <span className="text-sm text-gray-600">{text}</span>
      )}
    </div>
  )
}

// Full page loading state
export function LoadingPage({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

// Inline loading for buttons
export function ButtonSpinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}

export default LoadingSpinner
