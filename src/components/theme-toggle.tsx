'use client'

import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'

interface ThemeToggleProps {
  className?: string
  variant?: 'default' | 'compact'
}

export function ThemeToggle({ className = '', variant = 'default' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  const options = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ]

  if (variant === 'compact') {
    // Simple cycle through modes on click
    const cycleTheme = () => {
      const order: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
      const currentIndex = order.indexOf(theme)
      const nextIndex = (currentIndex + 1) % order.length
      setTheme(order[nextIndex])
    }

    const CurrentIcon = options.find(o => o.value === theme)?.icon || Sun

    return (
      <button
        onClick={cycleTheme}
        className={`btn-icon ${className}`}
        aria-label={`Current theme: ${theme}. Click to change.`}
        title={`Theme: ${theme}`}
      >
        <CurrentIcon className="h-5 w-5" />
      </button>
    )
  }

  return (
    <div className={`flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-soft ${className}`}>
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`p-2 rounded-subtle transition-all duration-200 ${
            theme === value
              ? 'bg-white dark:bg-gray-700 shadow-subtle text-primary-600 dark:text-gold-400'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 dark:hover:text-gray-300'
          }`}
          aria-label={`Switch to ${label} theme`}
          aria-pressed={theme === value}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  )
}

// Simple toggle between light and dark only
export function ThemeToggleSimple({ className = '' }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <button
      onClick={toggleTheme}
      className={`btn-icon ${className}`}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  )
}
