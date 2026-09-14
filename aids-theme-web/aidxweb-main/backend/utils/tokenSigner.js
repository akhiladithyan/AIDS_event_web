import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'neura-2026-super-secret-key-39ff88';

/**
 * Generates an HMAC-SHA256 signature for a token
 */
export function generateTokenSignature(payload) {
  return crypto
    .createHmac('sha256', JWT_SECRET)
    .update(payload)
    .digest('hex')
    .substring(0, 16); // 16-char hex signature
}

/**
 * Creates a signed QR token
 * Format: QR-SIG-<signature>-<userId>-<teamId>
 */
export function createSignedQrToken(userId, teamId) {
  const rawData = `${userId}:${teamId}`;
  const sig = generateTokenSignature(rawData);
  return `QR-SIG-${sig}-${userId}-${teamId}`;
}

/**
 * Validates whether a token has a valid signature or matches a legacy token
 */
export function verifyQrToken(token, userId, teamId) {
  if (!token) return false;
  const tokenStr = String(token).trim();

  // If token is signed
  if (tokenStr.startsWith('QR-SIG-')) {
    const parts = tokenStr.split('-');
    if (parts.length >= 4) {
      const sig = parts[2];
      const expectedSig = generateTokenSignature(`${userId}:${teamId}`);
      return sig === expectedSig;
    }
  }

  // Fallback for legacy format or direct match
  return (
    tokenStr === `QR-${userId}-${teamId}` ||
    tokenStr === userId ||
    tokenStr.includes(userId)
  );
}

/**
 * Generates a high-entropy cryptographically secure student ID & password
 */
export function generateSecureStudentCredentials() {
  const randomSuffix = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 chars (e.g. 8F3K9M2P)
  const userId = `STD-${randomSuffix}`;
  
  // 10-character secure alphanumeric password
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$';
  let password = '';
  const bytes = crypto.randomBytes(10);
  for (let i = 0; i < 10; i++) {
    password += chars[bytes[i] % chars.length];
  }

  return { userId, password };
}
