// Form validation utilities for consistent validation across the app

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Password validation with detailed feedback
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('At least 8 characters')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('One uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('One lowercase letter')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('One number')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Phone number validation (Guatemala format or international)
export function validatePhone(phone: string): boolean {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '')
  // Accept Guatemala format (8 digits) or international format with country code
  const phoneRegex = /^(\+?502)?[0-9]{8}$|^\+?[0-9]{10,15}$/
  return phoneRegex.test(cleaned)
}

// Date validation - ensures date is not in the past
export function validateFutureDate(dateString: string): ValidationResult {
  const errors: string[] = []
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (isNaN(date.getTime())) {
    errors.push('Invalid date format')
  } else if (date < today) {
    errors.push('Date cannot be in the past')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Required field validation
export function validateRequired(value: string, fieldName: string): ValidationResult {
  const errors: string[] = []

  if (!value || value.trim() === '') {
    errors.push(`${fieldName} is required`)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Number range validation
export function validateNumberRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): ValidationResult {
  const errors: string[] = []

  if (isNaN(value)) {
    errors.push(`${fieldName} must be a number`)
  } else if (value < min) {
    errors.push(`${fieldName} must be at least ${min}`)
  } else if (value > max) {
    errors.push(`${fieldName} must be at most ${max}`)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Passport/ID validation (basic format check)
export function validatePassport(passport: string): boolean {
  // Basic check: alphanumeric, 6-12 characters
  const passportRegex = /^[A-Z0-9]{6,12}$/i
  return passportRegex.test(passport.trim())
}

// Combined form validation helper
export function validateForm(validations: ValidationResult[]): ValidationResult {
  const allErrors = validations.flatMap(v => v.errors)
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  }
}

// Localized error messages
export const errorMessages = {
  en: {
    email: 'Please enter a valid email address',
    password: 'Password does not meet requirements',
    phone: 'Please enter a valid phone number',
    dateRequired: 'Please select a date',
    datePast: 'Date cannot be in the past',
    required: 'This field is required',
    passengers: 'Please select number of passengers',
  },
  es: {
    email: 'Por favor ingrese un correo electrónico válido',
    password: 'La contraseña no cumple los requisitos',
    phone: 'Por favor ingrese un número de teléfono válido',
    dateRequired: 'Por favor seleccione una fecha',
    datePast: 'La fecha no puede ser en el pasado',
    required: 'Este campo es obligatorio',
    passengers: 'Por favor seleccione el número de pasajeros',
  }
}

export type Locale = keyof typeof errorMessages

export function getErrorMessage(key: keyof typeof errorMessages.en, locale: Locale = 'en'): string {
  return errorMessages[locale][key]
}
