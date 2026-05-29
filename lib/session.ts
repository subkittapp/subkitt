import crypto from 'crypto'

const SECRET = process.env.COOKIE_SIGN_SECRET || 'subkitt-default-session-signature-secret-key-2026'

/**
 * Signs a user ID with a cryptographic HMAC signature.
 * Returns a value formatted as: userId.signature
 */
export function signSession(userId: string): string {
  const hmac = crypto.createHmac('sha256', SECRET)
  hmac.update(userId)
  const signature = hmac.digest('hex')
  return `${userId}.${signature}`
}

/**
 * Verifies a signed session value.
 * Returns the verified userId if signature is valid, or null otherwise.
 */
export function verifySession(signedValue: string | undefined): string | null {
  if (!signedValue) return null
  const parts = signedValue.split('.')
  if (parts.length !== 2) return null
  const [userId, signature] = parts

  const hmac = crypto.createHmac('sha256', SECRET)
  hmac.update(userId)
  const expectedSignature = hmac.digest('hex')

  if (signature === expectedSignature) {
    return userId
  }
  return null
}

/**
 * Basic cryptographic hash function to secure passwords.
 */
export function hashPassword(password: string): string {
  const salt = 'subkitt-salt-key-9876'
  const hash = crypto.createHash('sha256')
  hash.update(password + salt)
  return hash.digest('hex')
}
