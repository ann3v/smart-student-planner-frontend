// ============================================================
// Smart Student Planner — Backend Constants
// ============================================================

// Auth constants
const AUTH = {
  CODE_TTL_MINUTES: 15,
  MAX_LOGIN_ATTEMPTS: 5,
  MAX_VERIFY_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,
  MIN_PASSWORD_LENGTH: 8,
  JWT_EXPIRY: '7d',
};

// Generic error messages (prevents information leakage)
const ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  GENERIC: 'An error occurred. Please try again later.',
};

module.exports = { AUTH, ERRORS };