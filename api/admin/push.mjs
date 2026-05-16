import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireAdmin, jsonOnly } from '../_lib/adminAuth.mjs';

const SESSION_LIMITS = { sesi1: 60, sesi2: 20 };
let writeQueue = Promise.resolve();

function normalizeKategori(kategori) {
  if (!kategori) return 'lainnya';
  const lower = String(kategori).toLowerCase();
  if (lower.includes('badan')) return 'pph-badan';
  if (lower.includes('op')) return 'pph-op';
  if (lower.includes('potput')) return 'potput';
  if (lower.includes('ppn')) return 'ppn';
  if (lower.includes('kup')) return 'kup';
  return lower.replace(/\s+/g, '-');
}

function normalizeQuestion(input, id) {
  return {
    id,
    kategori: normalizeKategori(input?.kategori),
    skenario: String(input?.skenario || '').trim(),
    soal: String(input?.soal || '').trim(),
    opsi: Array.isArray(input?.opsi) ? input.opsi.slice(0, 4).map((v) => String(v || '').trim()) : [],
    jawaban: Number.isInteger(input?.jawaban) ? input.jawaban : 0,
    pembahasan: String(input?.pembahasan || '').trim(),
    dasar: String(input?.dasar || '').trim()
  };
}

function findTargetPackageId(packages, requestedId) {
  if (requestedId && packages.some((pkg) => pkg.id === requestedId)) return requestedId;
  return packages[packages.length - 1]?.id || null;
}

async function loadPackages(paketDir) {
  const entries = await fs.readdir(paketDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const packages = [];
  for (const file of files) {
    const fullPath = path.join(paketDir, file);
    const content = await fs.readFile(fullPath, 'utf8');
    const data = JSON.parse(content);
    packages.push({ id: file.replace('.json', ''), file, fullPath, data });
  }
  return packages;
}

function withWriteLock(task) {
  const run = writeQueue.then(task, task);
  writeQueue = run.then(() => undefined, () => undefined);
  return run;
}

export default async function handler(req, res) {
  if (!jsonOnly(req, res)) return;
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed.' });
    return;
  }

  const session = requireAdmin(req, res);
  if (!session) return;

  const { targetPackageId, targetSession, generatedQuestions } = req.body || {};
  if (!targetSession || !SESSION_LIMITS[targetSession]) {
    res.status(400).json({ ok: false, error: 'targetSession wajib sesi1 atau sesi2.' });
    return;
  }
  if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
    res.status(400).json({ ok: false, error: 'generatedQuestions tidak boleh kosong.' });
    return;
  }

  try {
    const result = await withWriteLock(async () => {
      const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../');
      const paketDir = path.join(rootDir, 'src', 'data', 'paket');
      const packages = await loadPackages(paketDir);
      if (!packages.length) {
        throw new Error('Paket soal tidak ditemukan.');
      }

      const selectedId = findTargetPackageId(packages, targetPackageId);
      const selected = packages.find((pkg) => pkg.id === selectedId);
      if (!selected) {
        const error = new Error('targetPackageId tidak ditemukan.');
        error.statusCode = 400;
        throw error;
      }

      const currentList = Array.isArray(selected.data[targetSession]) ? selected.data[targetSession] : [];
      const maxAllowed = SESSION_LIMITS[targetSession];
      const availableSlots = Math.max(maxAllowed - currentList.length, 0);
      if (availableSlots <= 0) {
        const error = new Error(`Paket ${selected.id} untuk ${targetSession} sudah penuh.`);
        error.statusCode = 400;
        throw error;
      }

      const toAppend = generatedQuestions.slice(0, availableSlots);
      const nextIdStart = currentList.reduce((max, item) => {
        const parsedId = Number.parseInt(item?.id ?? 0, 10);
        return Number.isFinite(parsedId) ? Math.max(max, parsedId) : max;
      }, 0) + 1;
      const normalized = toAppend.map((item, index) => normalizeQuestion(item, nextIdStart + index));
      selected.data[targetSession] = currentList.concat(normalized);

      await fs.writeFile(selected.fullPath, `${JSON.stringify(selected.data, null, 2)}\n`, 'utf8');
      console.log(
        `[admin-push] user=${session.username} package=${selected.id} session=${targetSession} added=${normalized.length} requested=${generatedQuestions.length}`
      );

      return {
        targetPackageId: selected.id,
        targetSession,
        addedCount: normalized.length,
        truncated: normalized.length < generatedQuestions.length,
        totalInSession: selected.data[targetSession].length
      };
    });

    res.status(200).json({ ok: true, ...result });
  } catch (error) {
    console.error(`[admin-push] error: ${error.message}`);
    res.status(error.statusCode || 500).json({ ok: false, error: error.message });
  }
}
