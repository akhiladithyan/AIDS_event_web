import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'neura-2026-super-secret-key-39ff88';

/**
 * Signs a JWT token with user payload
 */
export function signJwt(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Middleware: Requires a valid JWT token
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Missing or malformed Authorization header'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user information to request
    req.user = decoded;

    // Optional: Fetch live user from database if needed
    if (decoded.id) {
      const dbUser = await User.findById(decoded.id).select('-passwordHash');
      if (dbUser) {
        if (!dbUser.isActive) {
          return res.status(403).json({ success: false, error: 'Account has been deactivated' });
        }
        req.user = {
          ...decoded,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
          stationId: dbUser.stationId,
          assignedEvents: dbUser.assignedEvents
        };
      }
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or expired token'
    });
  }
}

/**
 * Middleware: Requires one of the specified roles
 */
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Requires one of roles: [${allowedRoles.join(', ')}]`
      });
    }
    next();
  };
}
