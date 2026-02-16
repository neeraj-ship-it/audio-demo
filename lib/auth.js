const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';
const JWT_EXPIRES_IN = '7d';
const BCRYPT_ROUNDS = 12;
const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

// ── User Store ────────────────────────────────────────

async function getUsers() {
  try {
    try {
      await fs.promises.access(USERS_FILE);
    } catch {
      await fs.promises.writeFile(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
    }
    const data = JSON.parse(await fs.promises.readFile(USERS_FILE, 'utf8'));
    return data.users || [];
  } catch {
    return [];
  }
}

async function saveUsers(users) {
  const dir = path.dirname(USERS_FILE);
  try {
    await fs.promises.access(dir);
  } catch {
    await fs.promises.mkdir(dir, { recursive: true });
  }
  await fs.promises.writeFile(USERS_FILE, JSON.stringify({ users }, null, 2));
}

// ── Password Hashing ──────────────────────────────────

async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// ── JWT Tokens ────────────────────────────────────────

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role || 'user' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// ── Auth Middleware ────────────────────────────────────

function authMiddleware(req, res) {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  }

  // Check cookie fallback
  if (!token && req.cookies) {
    token = req.cookies.token;
  }

  // Check cookie from header (Next.js doesn't parse cookies by default)
  if (!token && req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc, c) => {
      const [key, val] = c.trim().split('=');
      acc[key] = val;
      return acc;
    }, {});
    token = cookies.token;
  }

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

function requireAuth(req, res) {
  const user = authMiddleware(req, res);
  if (!user) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return null;
  }
  return user;
}

function requireAdmin(req, res) {
  const user = requireAuth(req, res);
  if (!user) return null;
  if (user.role !== 'admin') {
    res.status(403).json({ success: false, error: 'Admin access required' });
    return null;
  }
  return user;
}

// ── Cookie Helper ─────────────────────────────────────

function setAuthCookie(res, token) {
  res.setHeader('Set-Cookie', [
    `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
  ]);
}

function clearAuthCookie(res) {
  res.setHeader('Set-Cookie', [
    'token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'
  ]);
}

module.exports = {
  getUsers,
  saveUsers,
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  authMiddleware,
  requireAuth,
  requireAdmin,
  setAuthCookie,
  clearAuthCookie,
};
