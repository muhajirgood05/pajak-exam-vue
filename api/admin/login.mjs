import crypto from 'node:crypto';
import { jsonOnly, setAdminSession } from '../_lib/adminAuth.mjs';

function secureEqual(left = '', right = '') {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  if (!jsonOnly(req, res)) return;
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed.' });
    return;
  }

  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedUsername || !expectedPassword) {
    res.status(500).json({ ok: false, error: 'Admin credentials are not configured.' });
    return;
  }

  const { username, password } = req.body || {};
  const isValid = secureEqual(username, expectedUsername) && secureEqual(password, expectedPassword);
  if (!isValid) {
    res.status(401).json({ ok: false, error: 'Invalid admin credentials.' });
    return;
  }

  setAdminSession(res, username);
  res.status(200).json({ ok: true, username });
}
