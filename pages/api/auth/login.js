const { validate, loginSchema } = require('../../../lib/validate');
const { getUsers, verifyPassword, generateToken, setAuthCookie } = require('../../../lib/auth');
const { authLimiter } = require('../../../lib/rateLimit');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  if (!authLimiter(req, res)) return;

  // Validate input
  const result = validate(loginSchema, req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: 'Validation failed', errors: result.errors });
  }

  const { email, password } = result.data;

  // Find user
  const users = getUsers();
  const user = users.find(u => u.email === email);

  if (!user || !(await verifyPassword(password, user.password))) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  // Generate token
  const token = generateToken(user);
  setAuthCookie(res, token);

  res.json({
    success: true,
    message: 'Login successful',
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  });
}
