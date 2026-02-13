const { requireAuth } = require('../../../lib/auth');

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const user = requireAuth(req, res);
  if (!user) return; // requireAuth already sent 401

  res.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
