/**
 * In-memory rate limiter for API routes
 * Supports per-IP and per-route limiting
 */

const rateLimitStore = new Map();

// Clean up expired entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Get client IP from request
 */
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

/**
 * Create a rate limiter with given options
 * @param {Object} options
 * @param {number} options.maxRequests - Max requests per window
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {string} [options.keyPrefix] - Prefix for the rate limit key
 * @returns {function} Middleware function that returns true if allowed, false if rate limited
 */
function createRateLimit({ maxRequests, windowMs, keyPrefix = '' }) {
  return function rateLimit(req, res) {
    cleanup();

    const ip = getClientIp(req);
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    let entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
      entry = { count: 0, resetTime: now + windowMs };
      rateLimitStore.set(key, entry);
    }

    entry.count++;

    // Set rate limit headers
    const remaining = Math.max(0, maxRequests - entry.count);
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));

    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      res.status(429).json({
        success: false,
        error: 'Too many requests',
        retryAfter
      });
      return false;
    }

    return true;
  };
}

// Pre-configured limiters
const apiLimiter = createRateLimit({
  maxRequests: 100,
  windowMs: 60 * 1000,
  keyPrefix: 'api'
});

const generationLimiter = createRateLimit({
  maxRequests: 5,
  windowMs: 60 * 1000,
  keyPrefix: 'gen'
});

const authLimiter = createRateLimit({
  maxRequests: 10,
  windowMs: 60 * 1000,
  keyPrefix: 'auth'
});

module.exports = {
  createRateLimit,
  apiLimiter,
  generationLimiter,
  authLimiter,
};
