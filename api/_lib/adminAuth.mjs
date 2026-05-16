import crypto from 'node:crypto';

const SESSION_COOKIE = 'admin_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 2;

function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce((acc, part) => {
    const [rawKey, ...rest] = part.trim().split('=');
    if (!rawKey) return acc;
    acc[rawKey] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
}

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function signToken(payload, secret) {
  const payloadEncoded = base64url(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadEncoded)
    .digest('base64url');
  return `${payloadEncoded}.${signature}`;
}

function verifyToken(token, secret) {
  if (!token || !token.includes('.')) return null;
  const [payloadEncoded, signature] = token.split('.');
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payloadEncoded)
    .digest('base64url');

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  const payload = JSON.parse(Buffer.from(payloadEncoded, 'base64url').toString('utf8'));
  if (!payload?.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

export function setAdminSession(res, username) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not configured.');

  const payload = {
    username,
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS
  };
  const token = signToken(payload, secret);
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${SESSION_DURATION_SECONDS}; SameSite=Strict; Secure`
  );
}

export function clearAdminSession(res) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; Secure`);
}

export function getAdminSession(req) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return null;
  const cookies = parseCookies(req.headers.cookie || '');
  return verifyToken(cookies[SESSION_COOKIE], secret);
}

export function requireAdmin(req, res) {
  const session = getAdminSession(req);
  if (!session?.username) {
    res.status(401).json({ ok: false, error: 'Admin authentication required.' });
    return null;
  }
  return session;
}

export function jsonOnly(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return false;
  }
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method not allowed.' });
    return false;
  }
  return true;
}
