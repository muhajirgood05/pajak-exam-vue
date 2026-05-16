<template>
  <div>
    <!-- MENU VIEW -->
    <div v-if="!currentPackageId" class="menu-view">
      <div class="menu-container">
        <div class="menu-header">
          <div class="menu-icon">🏛</div>
          <h1>Kompetensi Teknis Pemeriksa Pajak</h1>
          <p>Pilih paket soal untuk memulai sesi ujian Anda.</p>
        </div>
        
        <div class="package-list">
          <div 
            v-for="pkg in PACKAGES" 
            :key="pkg.id" 
            class="package-card"
            @click="selectPackage(pkg.id)"
          >
            <div class="package-card-icon">📄</div>
            <div class="package-card-content">
              <h3>{{ pkg.title }}</h3>
              <span>{{ pkg.totalSoal }} Soal ({{ pkg.sesi1.length }} Pilihan Ganda | {{ pkg.sesi2.length }} Kasus)</span>
            </div>
            <div class="package-card-arrow">→</div>
          </div>
        </div>

        <div class="menu-footer">
          <button class="admin-toggle" @click="showAdminPanel = !showAdminPanel">
            {{ showAdminPanel ? 'Tutup Admin' : '🔐 Admin Generate Soal' }}
          </button>
          <button class="theme-toggle" @click="toggleTheme" title="Toggle Dark Mode">
            {{ isDarkMode ? '☀️ Mode Terang' : '🌙 Mode Gelap' }}
          </button>
        </div>

        <div v-if="showAdminPanel" class="admin-panel">
          <h3>Admin - Generate Soal AI</h3>

          <div v-if="!adminAuth.authenticated" class="admin-login">
            <input v-model="adminLogin.username" type="text" placeholder="Username admin" />
            <input v-model="adminLogin.password" type="password" placeholder="Password admin" />
            <button class="btn-primary" @click="loginAdmin" :disabled="adminLoading">
              {{ adminLoading ? 'Memverifikasi...' : 'Login Admin' }}
            </button>
          </div>

          <div v-else class="admin-actions">
            <p class="admin-meta">Login sebagai: <strong>{{ adminAuth.username }}</strong></p>
            <div class="admin-form-grid">
              <select v-model="generator.provider">
                <option value="openrouter">OpenRouter</option>
                <option value="gemini">Gemini</option>
                <option value="kimi">Kimi</option>
                <option value="mimo">Mimo</option>
                <option value="deepseek">DeepSeek</option>
                <option value="qwen">Qwen</option>
              </select>
              <input v-model="generator.model" type="text" placeholder="Model (opsional)" />
            </div>
            <input
              v-model="generator.apiKey"
              type="password"
              placeholder="API Key (opsional, fallback ke environment server)"
            />
            <textarea
              v-model="generator.prompt"
              rows="8"
              placeholder="Masukkan prompt generate soal (format output harus JSON array soal)"
            ></textarea>

            <div class="admin-buttons">
              <button class="btn-primary" @click="generateAdminSoal" :disabled="adminLoading">
                {{ adminLoading ? 'Generating...' : 'Generate Soal' }}
              </button>
              <button
                v-if="generationResult"
                class="btn-success"
                @click="deployGenerated"
                :disabled="deployLoading"
              >
                {{ deployLoading ? 'Deploying...' : 'Deploy ke Vercel' }}
              </button>
              <button class="btn-outline" @click="logoutAdmin" :disabled="adminLoading || deployLoading">
                Logout
              </button>
            </div>

            <div class="admin-log" v-if="adminLogs.length">
              <div v-for="(log, index) in adminLogs" :key="index">{{ log }}</div>
            </div>
            <pre v-if="generationResult" class="admin-result">{{ JSON.stringify(generationResult.generatedQuestions, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- EXAM VIEW -->
    <div v-else class="exam-view">
      <nav class="topbar">
        <div class="topbar-brand">
          <button class="tab-btn" @click="backToMenu" style="margin-right: 10px;">⬅ Kembali</button>
          <span style="font-weight: 600;">{{ currentPackage.title }}</span>
        </div>
        <div class="topbar-tabs">
          <button 
            v-if="currentPackage.sesi1.length > 0"
            :class="['tab-btn', { active: currentExamSession === 'sesi1' }]" 
            @click="currentExamSession = 'sesi1'"
          >
            Sesi 1 (Pilihan Ganda)
          </button>
          <button 
            v-if="currentPackage.sesi2.length > 0"
            :class="['tab-btn', { active: currentExamSession === 'sesi2' }]" 
            @click="currentExamSession = 'sesi2'"
          >
            Sesi 2 (Soal Kasus)
          </button>
        </div>
        <div class="topbar-right" style="margin-left: 1rem; display: flex; align-items: center; gap: 12px;">
          <button class="theme-toggle" @click="toggleTheme" title="Toggle Dark Mode">
            {{ isDarkMode ? '☀️' : '🌙' }}
          </button>
          <div class="timer-pill">⏱ {{ timerDisplay }}</div>
        </div>
      </nav>
      <main class="main-content">
        <SoalExam 
          v-if="currentExamSession === 'sesi1' && currentPackage.sesi1.length > 0"
          :soals="currentPackage.sesi1" 
          :session-id="currentPackage.id + '-sesi1'" 
          @all-done="checkAllDone" 
        />
        <SoalExam 
          v-if="currentExamSession === 'sesi2' && currentPackage.sesi2.length > 0"
          :soals="currentPackage.sesi2" 
          :session-id="currentPackage.id + '-sesi2'" 
          @all-done="checkAllDone" 
        />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import SoalExam from './components/SoalExam.vue';
import { PACKAGES } from './data/soalBank.js';

const currentPackageId = ref(null);
const currentPackage = computed(() => PACKAGES.find(p => p.id === currentPackageId.value));
const currentExamSession = ref('sesi1');

const selectPackage = (id) => {
  currentPackageId.value = id;
  const pkg = PACKAGES.find(p => p.id === id);
  currentExamSession.value = pkg.sesi1.length > 0 ? 'sesi1' : 'sesi2';
  startTimer();
};

const backToMenu = () => {
  currentPackageId.value = null;
  stopTimer();
  timerDisplay.value = '00:00';
};

// Global Timer Logic
const startTime = ref(Date.now());
const timerDisplay = ref('00:00');
let timerInterval = null;

const formatTime = (seconds) => {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
};

const startTimer = () => {
  startTime.value = Date.now();
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime.value) / 1000);
    timerDisplay.value = formatTime(elapsed);
  }, 1000);
};

const stopTimer = () => {
  if (timerInterval) clearInterval(timerInterval);
};

const checkAllDone = () => {
  // We can stop the timer when all sessions are done, or just let it run.
  // stopTimer();
};

// Timer starts automatically when package selected

// Dark Mode Logic
const isDarkMode = ref(false);
const showAdminPanel = ref(false);
const adminLoading = ref(false);
const deployLoading = ref(false);
const adminLogs = ref([]);
const generationResult = ref(null);
const adminAuth = ref({ authenticated: false, username: '' });
const adminLogin = ref({ username: '', password: '' });
const generator = ref({
  provider: 'openrouter',
  model: '',
  apiKey: '',
  prompt: 'Buat 2 soal pilihan ganda pajak format JSON array dengan field id, kategori, skenario, soal, opsi, jawaban, pembahasan, dasar.'
});

const pushAdminLog = (message) => {
  adminLogs.value.unshift(`[${new Date().toLocaleTimeString('id-ID')}] ${message}`);
  adminLogs.value = adminLogs.value.slice(0, 10);
};

const checkAdminSession = async () => {
  try {
    const response = await fetch('/api/admin/session', { credentials: 'include' });
    const data = await response.json();
    adminAuth.value = { authenticated: !!data.authenticated, username: data.username || '' };
  } catch {
    adminAuth.value = { authenticated: false, username: '' };
  }
};

const loginAdmin = async () => {
  adminLoading.value = true;
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(adminLogin.value)
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Login admin gagal.');
    }
    adminLogin.value.password = '';
    await checkAdminSession();
    pushAdminLog('Login admin berhasil.');
  } catch (error) {
    pushAdminLog(`Login gagal: ${error.message}`);
  } finally {
    adminLoading.value = false;
  }
};

const logoutAdmin = async () => {
  adminLoading.value = true;
  try {
    await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'include'
    });
    generationResult.value = null;
    adminAuth.value = { authenticated: false, username: '' };
    pushAdminLog('Logout admin berhasil.');
  } finally {
    adminLoading.value = false;
  }
};

const generateAdminSoal = async () => {
  if (!adminAuth.value.authenticated) {
    pushAdminLog('Generate ditolak: login admin diperlukan.');
    return;
  }
  if (!generator.value.prompt.trim()) {
    pushAdminLog('Prompt tidak boleh kosong.');
    return;
  }

  adminLoading.value = true;
  generationResult.value = null;
  try {
    pushAdminLog(`Mulai generate via ${generator.value.provider}...`);
    const response = await fetch('/api/admin/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(generator.value)
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Generate soal gagal.');
    }
    generationResult.value = data;
    pushAdminLog(`Generate berhasil (${data.provider}/${data.model}) - ${data.generatedQuestions.length} soal.`);
  } catch (error) {
    pushAdminLog(`Generate gagal: ${error.message}`);
  } finally {
    adminLoading.value = false;
  }
};

const deployGenerated = async () => {
  if (!adminAuth.value.authenticated || !generationResult.value) {
    pushAdminLog('Deploy ditolak: login admin & hasil generate wajib ada.');
    return;
  }

  const confirmed = window.confirm('Deploy hasil generate ke Vercel sekarang?');
  if (!confirmed) {
    pushAdminLog('Deploy dibatalkan oleh admin.');
    return;
  }

  deployLoading.value = true;
  try {
    const response = await fetch('/api/admin/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        confirmed: true,
        generationMeta: {
          provider: generationResult.value.provider,
          model: generationResult.value.model,
          count: generationResult.value.generatedQuestions.length
        }
      })
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Deploy gagal.');
    }
    pushAdminLog('Deploy ke Vercel berhasil dipicu.');
  } catch (error) {
    pushAdminLog(`Deploy gagal: ${error.message}`);
  } finally {
    deployLoading.value = false;
  }
};

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
};

onMounted(() => {
  // Check initial theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDarkMode.value = true;
    document.documentElement.classList.add('dark');
  }
  checkAdminSession();
});

onUnmounted(() => {
  stopTimer();
});
</script>

<style>
/* ── TOPBAR ── */
.topbar {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 0 1.5rem;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}
.topbar-brand { display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 15px; color: var(--text); }
.topbar-logo { width: 32px; height: 32px; background: var(--blue); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; }
.topbar-tabs { display: flex; align-items: center; gap: 12px; margin-left: auto; }
.timer-pill { font-size: 14px; font-weight: 600; background: var(--blue-light); color: var(--blue); padding: 5px 14px; border-radius: 20px; font-variant-numeric: tabular-nums; }
.theme-toggle { background: var(--bg2); border: 1px solid var(--border); border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; font-size: 14px; }
.theme-toggle:hover { background: var(--border); }

/* ── MENU VIEW ── */
.menu-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--bg);
}
.menu-container {
  max-width: 600px;
  width: 100%;
  background: var(--surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}
.menu-header { text-align: center; margin-bottom: 2rem; }
.menu-icon { font-size: 3rem; margin-bottom: 1rem; }
.menu-header h1 { font-size: 1.5rem; color: var(--text); margin-bottom: 0.5rem; }
.menu-header p { color: var(--text2); font-size: 0.95rem; }
.package-list { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
.package-card {
  display: flex;
  align-items: center;
  padding: 1.25rem;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}
.package-card:hover {
  border-color: var(--blue);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.package-card-icon { font-size: 1.5rem; margin-right: 1rem; }
.package-card-content { flex: 1; }
.package-card-content h3 { font-size: 1.05rem; color: var(--text); font-weight: 600; margin-bottom: 4px; }
.package-card-content span { font-size: 0.85rem; color: var(--text3); font-weight: 500; }
.package-card-arrow { color: var(--text3); font-size: 1.25rem; font-weight: bold; transition: transform 0.2s; }
.package-card:hover .package-card-arrow { color: var(--blue); transform: translateX(4px); }
.menu-footer { display: flex; justify-content: center; }
.admin-toggle {
  border: 1px solid var(--border);
  background: var(--bg2);
  color: var(--text);
  border-radius: 20px;
  padding: 0 1rem;
  height: 32px;
  margin-right: .75rem;
  cursor: pointer;
}
.admin-panel {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg2);
}
.admin-panel h3 {
  margin: 0 0 .75rem;
  color: var(--text);
}
.admin-login,
.admin-actions {
  display: flex;
  flex-direction: column;
  gap: .6rem;
}
.admin-login input,
.admin-actions input,
.admin-actions select,
.admin-actions textarea {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
  padding: .6rem .75rem;
  font: inherit;
}
.admin-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: .6rem;
}
.admin-buttons {
  display: flex;
  gap: .5rem;
  flex-wrap: wrap;
}
.btn-primary,
.btn-success,
.btn-outline {
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  padding: .55rem .8rem;
  cursor: pointer;
}
.btn-primary {
  background: var(--blue);
  color: #fff;
}
.btn-success {
  background: #15803d;
  color: #fff;
}
.btn-outline {
  background: transparent;
  border-color: var(--border);
  color: var(--text);
}
.admin-meta { margin: 0; color: var(--text2); font-size: .9rem; }
.admin-log {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  background: var(--surface);
  border: 1px dashed var(--border);
  border-radius: var(--radius-sm);
  padding: .5rem .65rem;
  font-size: .8rem;
  color: var(--text2);
}
.admin-result {
  margin: 0;
  max-height: 220px;
  overflow: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: .65rem;
  background: var(--surface);
  color: var(--text2);
  font-size: .75rem;
}
.menu-footer .theme-toggle { width: auto; padding: 0 1rem; border-radius: 20px; font-weight: 500; }

.tab-btn {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text2);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}
.tab-btn:hover {
  background: var(--bg2);
  color: var(--text);
}
.tab-btn.active {
  background: var(--blue-light);
  color: var(--blue);
  font-weight: 600;
  border-color: var(--blue-mid);
}
.main-content {
  width: 100%;
}
@media (max-width: 768px) {
  .topbar { padding: 0 1rem; }
  .topbar-brand span { display: none; }
}
</style>
