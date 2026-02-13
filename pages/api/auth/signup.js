const { validate, signupSchema } = require('../../../lib/validate');
const { getUsers, saveUsers, hashPassword, generateToken, setAuthCookie } = require('../../../lib/auth');
const { authLimiter } = require('../../../lib/rateLimit');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  if (!authLimiter(req, res)) return;

  // Validate input
  const result = validate(signupSchema, req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: 'Validation failed', errors: result.errors });
  }

  const { name, email, password, preferredLanguage } = result.data;

  // Check if user exists
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ success: false, error: 'An account with this email already exists' });
  }

  // Create user
  const hashedPassword = await hashPassword(password);
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password: hashedPassword,
    preferredLanguage,
    role: 'user',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  // Generate token
  const token = generateToken(newUser);
  setAuthCookie(res, token);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    token,
  });
}
