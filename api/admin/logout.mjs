import { clearAdminSession, jsonOnly } from '../_lib/adminAuth.mjs';

export default async function handler(req, res) {
  if (!jsonOnly(req, res)) return;
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed.' });
    return;
  }

  clearAdminSession(res);
  res.status(200).json({ ok: true });
}
