import { requireAdmin, jsonOnly } from '../_lib/adminAuth.mjs';
import { generateQuestionsWithProvider } from '../_lib/aiProviders.mjs';

export default async function handler(req, res) {
  if (!jsonOnly(req, res)) return;
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed.' });
    return;
  }

  const session = requireAdmin(req, res);
  if (!session) return;

  const { provider, model, prompt, apiKey } = req.body || {};
  try {
    console.log(`[admin-generate] user=${session.username} provider=${provider} model=${model || '-'} start`);
    const generated = await generateQuestionsWithProvider({ provider, model, prompt, apiKey });
    console.log(
      `[admin-generate] success provider=${generated.provider} model=${generated.model} count=${generated.generatedQuestions.length}`
    );
    res.status(200).json({ ok: true, ...generated });
  } catch (error) {
    console.error(`[admin-generate] failed provider=${provider}: ${error.message}`);
    res.status(400).json({ ok: false, error: error.message });
  }
}
