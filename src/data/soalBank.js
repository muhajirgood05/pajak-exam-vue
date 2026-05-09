const normalizeKategori = (kat) => {
  if (!kat) return 'lainnya';
  const lower = kat.toLowerCase();
  if (lower.includes('badan')) return 'pph-badan';
  if (lower.includes('op')) return 'pph-op';
  if (lower.includes('potput')) return 'potput';
  if (lower.includes('ppn')) return 'ppn';
  if (lower.includes('kup')) return 'kup';
  return kat.toLowerCase().replace(/\s+/g, '-');
};

const rawPackages = import.meta.glob('./paket/*.json', { eager: true });

export const PACKAGES = Object.entries(rawPackages).map(([path, mod]) => {
  const filename = path.split('/').pop().replace('.json', '');
  let title = filename.replace(/-/g, ' ');
  // Remove leading numbers like "01 "
  title = title.replace(/^\d+\s/, '');
  
  const data = mod.default || mod;
  const isPlainArray = Array.isArray(data);
  let sesi1Data = isPlainArray ? data : (Array.isArray(data.sesi1) ? data.sesi1 : []);
  let sesi2Data = isPlainArray ? [] : (Array.isArray(data.sesi2) ? data.sesi2 : []);
  
  // Normalize categories
  sesi1Data = sesi1Data.map(s => ({ ...s, kategori: normalizeKategori(s.kategori) }));
  sesi2Data = sesi2Data.map(s => ({ ...s, kategori: normalizeKategori(s.kategori) }));
  
  return {
    id: filename,
    title: title,
    sesi1: sesi1Data,
    sesi2: sesi2Data,
    totalSoal: sesi1Data.length + sesi2Data.length
  };
});

PACKAGES.sort((a, b) => a.id.localeCompare(b.id));

export const KATEGORI_META = {
  'semua': { label: 'Semua Soal', badge: 'badge-blue' },
  'pph-badan': { label: 'PPh Badan', badge: 'badge-blue' },
  'pph-op': { label: 'PPh OP', badge: 'badge-purple' },
  'potput': { label: 'Potput', badge: 'badge-amber' },
  'ppn': { label: 'PPN', badge: 'badge-teal' },
  'kup': { label: 'KUP', badge: 'badge-red' }
};
