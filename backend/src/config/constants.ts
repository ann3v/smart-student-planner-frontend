// ============================================================
// Smart Student Planner — Backend Constants
// ============================================================

export const AUTH = {
  CODE_TTL_MINUTES: 15,
  MAX_LOGIN_ATTEMPTS: 5,
  MAX_VERIFY_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,
  MIN_PASSWORD_LENGTH: 8,
  JWT_EXPIRY: '7d' as const,
} as const;

export const ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  GENERIC: 'An error occurred. Please try again later.',
} as const;