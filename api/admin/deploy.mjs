import { requireAdmin, jsonOnly } from '../_lib/adminAuth.mjs';

export default async function handler(req, res) {
  if (!jsonOnly(req, res)) return;
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed.' });
    return;
  }

  const session = requireAdmin(req, res);
  if (!session) return;

  const { confirmed, generationMeta } = req.body || {};
  if (!confirmed) {
    res.status(400).json({ ok: false, error: 'Deployment confirmation is required.' });
    return;
  }

  const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!deployHookUrl) {
    res.status(500).json({ ok: false, error: 'VERCEL_DEPLOY_HOOK_URL is not configured.' });
    return;
  }

  try {
    console.log(
      `[admin-deploy] user=${session.username} trigger provider=${generationMeta?.provider || '-'} model=${generationMeta?.model || '-'} count=${generationMeta?.count || 0}`
    );
    const response = await fetch(deployHookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trigger: 'admin-generate-soal',
        requestedBy: session.username,
        generationMeta: generationMeta || null,
        timestamp: new Date().toISOString()
      })
    });

    const text = await response.text();
    if (!response.ok) {
      console.error(`[admin-deploy] failed status=${response.status} body=${text.slice(0, 300)}`);
      res.status(502).json({ ok: false, error: `Vercel deploy hook failed (${response.status}).`, detail: text.slice(0, 300) });
      return;
    }

    console.log(`[admin-deploy] success status=${response.status}`);
    res.status(200).json({ ok: true, status: response.status, detail: text.slice(0, 300) });
  } catch (error) {
    console.error(`[admin-deploy] error: ${error.message}`);
    res.status(500).json({ ok: false, error: error.message });
  }
}
