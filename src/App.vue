<template>
    <div :class="{ 'dark-theme': isDarkMode }">
    <!-- ADMIN LOGIN MODAL -->
    <div v-if="showAdminLogin" class="modal-overlay">
      <div class="modal-content">
        <h3>Akses Administrator</h3>
        <p>Masukkan password untuk mengakses Dashboard Statistik.</p>
        <input 
          v-model="adminPassword" 
          type="password" 
          placeholder="Password" 
          @keyup.enter="loginAdmin"
          class="admin-input"
        >
        <div class="modal-actions">
          <button @click="showAdminLogin = false" class="btn-text">Batal</button>
          <button @click="loginAdmin" class="btn-primary">Login</button>
        </div>
      </div>
    </div>

    <!-- DASHBOARD VIEW (Admin Only) -->
    <div v-if="currentView === 'dashboard'" class="dashboard-view">
      <nav class="topbar">
        <div class="topbar-brand">
          <button class="tab-btn" @click="currentView = 'menu'">⬅ Kembali</button>
          <span style="font-weight: 600;">📊 Dashboard Admin</span>
        </div>
        <div class="topbar-tabs">
          <button 
            :class="['tab-btn', { active: dashboardTab === 'stats' }]" 
            @click="dashboardTab = 'stats'"
          >
            Evaluasi Soal
          </button>
          <button 
            :class="['tab-btn', { active: dashboardTab === 'config' }]" 
            @click="dashboardTab = 'config'"
          >
            Konfigurasi
          </button>
        </div>
        <div class="topbar-right">
          <button v-if="dashboardTab === 'stats'" class="btn btn-sm btn-outline" @click="refreshStats">🔄 Refresh</button>
          <button class="btn btn-sm btn-danger" @click="logoutAdmin">Keluar</button>
        </div>
      </nav>
      
      <main class="dashboard-content">
        <!-- STATS TAB -->
        <div v-if="dashboardTab === 'stats'">
          <div class="stats-overview">
            <div class="stat-card">
              <div class="stat-val">{{ Object.keys(aggregatedStats).length }}</div>
              <div class="stat-lab">Paket Aktif</div>
            </div>
            <div class="stat-card">
              <div class="stat-val">{{ totalSubmissions }}</div>
              <div class="stat-lab">Total Ujian Selesai</div>
            </div>
          </div>

          <div v-for="(pkgStats, pkgId) in aggregatedStats" :key="pkgId" class="pkg-stats-section">
            <div class="pkg-stats-header">
              <h3>{{ pkgId.replace(/-/g, ' ') }}</h3>
              <span class="badge badge-blue">{{ pkgStats.totalSubmissions }} Submisi</span>
            </div>
            
            <div class="stats-table-container">
              <table class="stats-table">
                <thead>
                  <tr>
                    <th>No Soal</th>
                    <th>Total Jawab</th>
                    <th>Benar</th>
                    <th>Salah</th>
                    <th>Tingkat Kesulitan</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="s in getSortedQuestions(pkgStats.questions)" :key="s.id">
                    <td>#{{ s.id }}</td>
                    <td>{{ s.total }}</td>
                    <td class="text-green">{{ s.correct }}</td>
                    <td class="text-red">{{ s.wrong }}</td>
                    <td>
                      <div class="diff-bar">
                        <div class="diff-fill" :style="{ width: s.wrongPct + '%', background: getDiffColor(s.wrongPct) }"></div>
                      </div>
                      <span class="diff-val">{{ s.wrongPct }}% Salah</span>
                    </td>
                    <td>
                      <span v-if="s.wrongPct > 70" class="badge badge-red">SANGAT SULIT</span>
                      <span v-else-if="s.wrongPct > 40" class="badge badge-amber">SULIT</span>
                      <span v-else class="badge badge-green">NORMAL</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- CONFIG TAB -->
        <div v-if="dashboardTab === 'config'" class="config-section">
          <div class="stat-card" style="max-width: 600px; margin: 0 auto;">
            <h3>Pengaturan Supabase</h3>
            <p style="font-size: 13px; color: var(--text3); margin-bottom: 1.5rem;">
              Konfigurasi ini digunakan untuk mensinkronkan statistik "Everyone" lintas browser dan perangkat.
            </p>
            
            <div class="form-group">
              <label>Supabase URL</label>
              <input v-model="config.supabaseUrl" type="text" placeholder="https://xxx.supabase.co" class="admin-input" style="margin: 8px 0 20px;">
            </div>
            
            <div class="form-group">
              <label>Supabase Anon Key</label>
              <input v-model="config.supabaseKey" type="password" placeholder="eyJhbG..." class="admin-input" style="margin: 8px 0 20px;">
            </div>
            
            <button class="btn btn-primary" @click="saveConfig" style="width: 100%;">Simpan Konfigurasi</button>
            
            <div style="margin-top: 1.5rem; padding: 1rem; background: var(--bg2); border-radius: var(--radius-sm); font-size: 12px;">
              <strong>Note:</strong> Data ini disimpan secara lokal di browser Anda. Untuk pengamanan maksimal, gunakan Environment Variables di Vercel.
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- MENU VIEW -->
    <div v-else-if="currentView === 'menu'" class="menu-view">
      <div class="menu-container">
        <div class="menu-header">
          <div class="menu-icon" @click="handleAdminTrigger">🏛</div>
          <h1>Kompetensi Teknis Pemeriksa Pajak</h1>
          <p>Pilih paket soal untuk memulai sesi ujian Anda.</p>
          <div v-if="isAdmin" class="admin-badge" @click="currentView = 'dashboard'">
            🔧 Dashboard Admin Aktif
          </div>
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
          <button class="theme-toggle" @click="toggleTheme" title="Toggle Dark Mode">
            {{ isDarkMode ? '☀️ Mode Terang' : '🌙 Mode Gelap' }}
          </button>
        </div>
      </div>
    </div>

    <!-- EXAM VIEW -->
    <div v-else-if="currentView === 'exam'" class="exam-view">
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
            @results-ready="handleResults"
          />
          <SoalExam 
            v-if="currentExamSession === 'sesi2' && currentPackage.sesi2.length > 0"
            :soals="currentPackage.sesi2" 
            :session-id="currentPackage.id + '-sesi2'" 
            @all-done="checkAllDone" 
            @results-ready="handleResults"
          />
        </main>
      </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import SoalExam from './components/SoalExam.vue';
import { PACKAGES } from './data/soalBank.js';
import { saveResultLocally, getAllStats, getIP } from './data/stats.js';

const currentView = ref('menu'); // 'menu', 'exam', 'dashboard'
const currentPackageId = ref(null);
const currentPackage = computed(() => PACKAGES.find(p => p.id === currentPackageId.value));
const currentExamSession = ref('sesi1');
const dashboardTab = ref('stats'); // 'stats', 'config'
const currentAttemptId = ref(null);

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Admin Logic
const isAdmin = ref(false);
const showAdminLogin = ref(false);
const adminPassword = ref('');
const loginAttempts = ref(0);

const config = ref({
  supabaseUrl: localStorage.getItem('VITE_SUPABASE_URL') || '',
  supabaseKey: localStorage.getItem('VITE_SUPABASE_ANON_KEY') || ''
});

const saveConfig = () => {
  localStorage.setItem('VITE_SUPABASE_URL', config.value.supabaseUrl);
  localStorage.setItem('VITE_SUPABASE_ANON_KEY', config.value.supabaseKey);
  alert('Konfigurasi Disimpan! Silakan refresh halaman.');
  window.location.reload();
};

const handleAdminTrigger = () => {
  loginAttempts.value++;
  if (loginAttempts.value >= 3) {
    showAdminLogin.value = true;
    loginAttempts.value = 0;
  }
};

const loginAdmin = () => {
  if (adminPassword.value === 'Pajak416') {
    isAdmin.value = true;
    showAdminLogin.value = false;
    adminPassword.value = '';
    currentView.value = 'dashboard';
    refreshStats();
  } else {
    alert('Password Salah');
    adminPassword.value = '';
  }
};

const logoutAdmin = () => {
  isAdmin.value = false;
  currentView.value = 'menu';
};

// Statistics Logic
const aggregatedStats = ref({});
const totalSubmissions = ref(0);

const refreshStats = async () => {
  aggregatedStats.value = await getAllStats();
  // Calculate total submissions from aggregated data
  totalSubmissions.value = Object.values(aggregatedStats.value).reduce((acc, curr) => acc + curr.totalSubmissions, 0);
};

const getSortedQuestions = (questions) => {
  return Object.entries(questions).map(([id, s]) => ({
    id,
    ...s,
    total: s.correct + s.wrong,
    wrongPct: Math.round((s.wrong / (s.correct + s.wrong)) * 100)
  })).sort((a, b) => b.wrongPct - a.wrongPct); // Sort by most wrong
};

const getDiffColor = (pct) => {
  if (pct > 70) return '#ff4d4f';
  if (pct > 40) return '#faad14';
  return '#52c41a';
};

const handleResults = async (results) => {
  const ip = await getIP();
  await saveResultLocally(currentPackageId.value, currentExamSession.value, results, ip, currentAttemptId.value);
  if (isAdmin.value) refreshStats();
};

const selectPackage = (id) => {
  currentPackageId.value = id;
  currentAttemptId.value = generateUUID();
  currentView.value = 'exam';
  const pkg = PACKAGES.find(p => p.id === id);
  currentExamSession.value = pkg.sesi1.length > 0 ? 'sesi1' : 'sesi2';
  startTimer();
};

const backToMenu = () => {
  currentPackageId.value = null;
  currentView.value = 'menu';
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
});

onUnmounted(() => {
  stopTimer();
});
</script>

<style>
/* ── SHARED STYLES ── */
:root {
  --blue: #2563eb;
  --blue-light: #eff6ff;
  --blue-mid: #bfdbfe;
  --bg: #f8fafc;
  --bg2: #f1f5f9;
  --surface: #ffffff;
  --text: #1e293b;
  --text2: #475569;
  --text3: #64748b;
  --border: #e2e8f0;
  --radius: 12px;
  --radius-lg: 16px;
  --radius-md: 10px;
  --radius-sm: 6px;
  --green: #10b981;
  --red: #ef4444;
  --amber: #f59e0b;
}

.dark-theme {
  --bg: #0f172a;
  --bg2: #1e293b;
  --surface: #1e293b;
  --text: #f1f5f9;
  --text2: #cbd5e1;
  --text3: #94a3b8;
  --border: #334155;
}

/* ── DASHBOARD ── */
.dashboard-view { min-height: 100vh; background: var(--bg); }
.dashboard-content { max-width: 1200px; margin: 0 auto; padding: 2rem; }
.stats-overview { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
.stat-card { background: var(--surface); padding: 1.5rem; border-radius: var(--radius); border: 1px solid var(--border); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
.stat-val { font-size: 2.5rem; font-weight: 800; color: var(--blue); }
.stat-lab { color: var(--text3); font-weight: 600; font-size: 0.9rem; text-transform: uppercase; margin-top: 4px; }

.pkg-stats-section { background: var(--surface); border-radius: var(--radius-lg); border: 1px solid var(--border); padding: 2rem; margin-bottom: 2rem; }
.pkg-stats-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border); }
.stats-table-container { overflow-x: auto; }
.stats-table { width: 100%; border-collapse: collapse; min-width: 700px; }
.stats-table th { text-align: left; padding: 1rem; color: var(--text3); font-size: 0.85rem; border-bottom: 2px solid var(--border); }
.stats-table td { padding: 1rem; border-bottom: 1px solid var(--border); vertical-align: middle; }
.stats-table tr:hover { background: var(--bg2); }

.diff-bar { height: 8px; background: var(--bg2); border-radius: 4px; overflow: hidden; width: 120px; display: inline-block; vertical-align: middle; margin-right: 10px; }
.diff-fill { height: 100%; transition: width 0.5s ease; }
.diff-val { font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; }

/* ── MODAL ── */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: var(--surface); padding: 2rem; border-radius: var(--radius-lg); width: 90%; max-width: 400px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
.admin-input { width: 100%; padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); margin: 1.5rem 0; font-size: 1rem; background: var(--bg); color: var(--text); }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; }
.btn-text { background: none; border: none; color: var(--text3); cursor: pointer; font-weight: 500; }

.admin-badge { margin-top: 1rem; background: var(--blue-light); color: var(--blue); padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; display: inline-block; border: 1px solid var(--blue-mid); }
.admin-badge:hover { background: var(--blue-mid); }

.text-green { color: var(--green); font-weight: 600; }
.text-red { color: var(--red); font-weight: 600; }

.btn-danger { background: var(--red); color: white; border: none; padding: 6px 12px; border-radius: var(--radius-sm); cursor: pointer; }
.btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text2); padding: 6px 12px; border-radius: var(--radius-sm); cursor: pointer; }

/* ── EXISTING STYLES ── */
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
