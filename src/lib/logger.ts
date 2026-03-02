type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogMessage {
  level: LogLevel
  message: string
  data?: unknown
  timestamp: Date
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development'

  info(message: string, data?: unknown) {
    if (this.isDev) {
      if (data !== undefined && data !== '') {
        console.log(`ℹ️  ${message}`, data)
      } else {
        console.log(`ℹ️  ${message}`)
      }
    }
  }

  warn(message: string, data?: unknown) {
    if (this.isDev) {
      if (data !== undefined && data !== '') {
        console.warn(`⚠️  ${message}`, data)
      } else {
        console.warn(`⚠️  ${message}`)
      }
    }
  }

  error(message: string, error?: unknown) {
    // Always log errors, even in production (for server-side error tracking)
    if (error !== undefined && error !== '') {
      console.error(`❌ ${message}`, error)
    } else {
      console.error(`❌ ${message}`)
    }
  }

  debug(message: string, data?: unknown) {
    if (this.isDev) {
      if (data !== undefined && data !== '') {
        console.debug(`🔍 ${message}`, data)
      } else {
        console.debug(`🔍 ${message}`)
      }
    }
  }
}

export const logger = new Logger()
