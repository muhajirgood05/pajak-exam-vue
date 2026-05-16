import { getAdminSession, jsonOnly } from '../_lib/adminAuth.mjs';

export default async function handler(req, res) {
  if (!jsonOnly(req, res)) return;
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method not allowed.' });
    return;
  }

  const session = getAdminSession(req);
  if (!session?.username) {
    res.status(200).json({ authenticated: false });
    return;
  }

  res.status(200).json({ authenticated: true, username: session.username });
}
