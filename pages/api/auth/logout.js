const { clearAuthCookie } = require('../../../lib/auth');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  clearAuthCookie(res);
  res.json({ success: true, message: 'Logged out successfully' });
}
