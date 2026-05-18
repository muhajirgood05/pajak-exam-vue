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

    <!-- FEEDBACK INPUT MODAL -->
    <div v-if="showFeedbackModal" class="modal-overlay">
      <div class="modal-content feedback-modal-content">
        <div v-if="!feedbackSuccess">
          <div class="modal-header">
            <h3 style="margin-top: 0; font-size: 1.3rem;">💬 Saran & Kritik</h3>
            <p style="color: var(--text3); font-size: 13px; margin: 4px 0 16px 0; line-height: 1.5;">
              Masukkan masukan Anda untuk membantu kami mengembangkan bank soal dan aplikasi ini. 
              Anda juga dapat menghubungi kami langsung via 
              <a href="mailto:muhajirgood05@gmail.com" style="color: var(--blue); text-decoration: none; font-weight: 600;">Email</a> atau 
              <a href="https://www.linkedin.com/in/ahmad-muhajir-a64506221/" target="_blank" style="color: var(--blue); text-decoration: none; font-weight: 600;">LinkedIn</a>.
            </p>
          </div>
          
          <div class="form-group" style="text-align: left; margin-bottom: 12px;">
            <label class="form-label">Nama Pengirim</label>
            <input 
              v-model="feedbackForm.name" 
              type="text" 
              placeholder="Contoh: Tn. Wibowo, S.E." 
              class="admin-input"
              style="margin: 6px 0 0 0;"
            >
          </div>

          <div class="form-group" style="text-align: left; margin-bottom: 12px;">
            <label class="form-label">Peran / Jabatan</label>
            <select v-model="feedbackForm.role" class="admin-input select-input" style="margin: 6px 0 0 0;">
              <option value="Pemeriksa Pajak">Pemeriksa Pajak</option>
              <option value="Fungsional Penyuluh">Fungsional Penyuluh / AR</option>
              <option value="Dosen / Akademisi">Dosen / Akademisi</option>
              <option value="Mahasiswa Perpajakan">Mahasiswa Perpajakan</option>
              <option value="Masyarakat Umum">Masyarakat Umum</option>
            </select>
          </div>

          <div class="form-group" style="text-align: left; margin-bottom: 12px;">
            <label class="form-label">Kategori Masukan</label>
            <select v-model="feedbackForm.category" class="admin-input select-input" style="margin: 6px 0 0 0;">
              <option value="Soal Exam">Soal Exam & Skenario</option>
              <option value="Kunci Jawaban">Kunci & Pembahasan</option>
              <option value="Fitur Aplikasi">Tampilan / Fitur Aplikasi</option>
              <option value="Lainnya">Lain-lain</option>
            </select>
          </div>

          <div class="form-group" style="text-align: left; margin-bottom: 16px;">
            <label class="form-label">Kritik / Saran / Masukan</label>
            <textarea 
              v-model="feedbackForm.message" 
              placeholder="Tuliskan saran perbaikan secara spesifik di sini..." 
              class="admin-input textarea-input"
              rows="4"
              style="margin: 6px 0 0 0;"
            ></textarea>
          </div>

          <div class="modal-actions">
            <button @click="showFeedbackModal = false" class="btn-text">Batal</button>
            <button @click="submitFeedback" class="btn-primary" :disabled="isSubmittingFeedback">
              {{ isSubmittingFeedback ? 'Mengirim...' : 'Kirim Masukan' }}
            </button>
          </div>
        </div>

        <div v-else class="feedback-success-state">
          <div class="success-icon">🎉</div>
          <h3>Masukan Terkirim!</h3>
          <p>Terima kasih banyak atas kritik dan saran yang Anda berikan. Masukan Anda sangat berharga bagi kami.</p>
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
            :class="['tab-btn', { active: dashboardTab === 'feedbacks' }]" 
            @click="dashboardTab = 'feedbacks'"
          >
            💬 Saran & Kritik
          </button>
          <button 
            :class="['tab-btn', { active: dashboardTab === 'config' }]" 
            @click="dashboardTab = 'config'"
          >
            Konfigurasi
          </button>
        </div>
        <div class="topbar-right">
          <button v-if="dashboardTab === 'stats' || dashboardTab === 'feedbacks'" class="btn btn-sm btn-outline" @click="refreshStats">🔄 Refresh</button>
          <button class="btn btn-sm btn-danger" @click="logoutAdmin">Keluar</button>
        </div>
      </nav>
      
      <main class="dashboard-content">
        <!-- STATS TAB -->
        <div v-if="dashboardTab === 'stats'">
          <div class="stats-overview">
            <div class="stat-card">
              <div class="stat-val">{{ totalSubmissions }}</div>
              <div class="stat-lab">Total Ujian Selesai</div>
            </div>
            <div class="stat-card" :style="{ borderColor: isGlobal ? 'var(--green)' : 'var(--amber)' }">
              <div class="stat-val" :style="{ color: isGlobal ? 'var(--green)' : 'var(--amber)' }">
                {{ isGlobal ? 'GLOBAL' : 'LOKAL' }}
              </div>
              <div class="stat-lab">Sumber Data ({{ isGlobal ? 'Supabase' : 'Browser' }})</div>
            </div>
          </div>

          <!-- RECENT ACTIVITY (Admin Only) -->
          <div v-if="isGlobal && recentSubmissions.length > 0" class="pkg-stats-section" style="margin-bottom: 2rem;">
            <h3>Aktivitas Terbaru (Real-time)</h3>
            <div class="stats-table-container">
              <table class="stats-table">
                <thead>
                  <tr>
                    <th>Waktu</th>
                    <th>User IP</th>
                    <th>Paket</th>
                    <th>Progress</th>
                    <th>Hasil</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="res in recentSubmissions.slice(0, 5)" :key="res.timestamp + res.ip">
                    <td>{{ formatDateTime(res.timestamp) }}</td>
                    <td><code>{{ res.ip }}</code></td>
                    <td>{{ res.packageId.replace(/-/g, ' ') }}</td>
                    <td>{{ Object.keys(res.results).length }} soal</td>
                    <td>
                      <span class="badge badge-blue">Aktif/Selesai</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- CATEGORY FILTER -->
          <div class="dashboard-filters">
            <button 
              v-for="(meta, key) in KATEGORI_META" 
              :key="key"
              :class="['filter-btn', { active: dashboardCategoryFilter === key }]"
              @click="dashboardCategoryFilter = key"
            >
              {{ meta.label }}
            </button>
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
                  <tr v-for="s in getFilteredDashboardQuestions(pkgStats.questions)" :key="s.id">
                    <td>#{{ s.id }}</td>
                    <td>
                      <span :class="['badge', KATEGORI_META[s.kategori]?.badge || 'badge-blue']">
                        {{ KATEGORI_META[s.kategori]?.label || s.kategori }}
                      </span>
                    </td>
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

        <!-- FEEDBACKS TAB -->
        <div v-if="dashboardTab === 'feedbacks'" class="feedbacks-section">
          <div class="pkg-stats-header">
            <h3>💬 Data Saran & Kritik Wajib Pajak / Pengguna</h3>
            <span class="badge badge-blue">{{ feedbacksList.length }} Masukan</span>
          </div>
          
          <div v-if="feedbacksList.length === 0" class="no-feedback-state">
            <div class="no-feedback-icon">📭</div>
            <h4>Belum Ada Masukan</h4>
            <p>Saran dan kritik yang dikirimkan oleh pengguna akan muncul di sini.</p>
          </div>

          <div v-else class="feedbacks-grid">
            <div v-for="fb in feedbacksList" :key="fb.id" class="feedback-item-card">
              <div class="feedback-item-header">
                <div class="feedback-sender-info">
                  <span class="feedback-sender-name">{{ fb.name }}</span>
                  <span class="feedback-sender-role">💼 {{ fb.role }}</span>
                </div>
                <button class="btn-delete-fb" @click="deleteFeedback(fb.id)" title="Hapus Masukan">🗑️</button>
              </div>
              
              <div class="feedback-item-body">
                <div class="feedback-meta">
                  <span :class="['badge', {
                    'badge-green': fb.category === 'Soal Exam',
                    'badge-red': fb.category === 'Kunci Jawaban',
                    'badge-blue': fb.category === 'Fitur Aplikasi',
                    'badge-amber': fb.category === 'Lainnya'
                  }]">
                    {{ fb.category }}
                  </span>
                  <span class="feedback-date">🕒 {{ formatDateTime(fb.timestamp) }}</span>
                  <span class="feedback-ip">🌐 {{ fb.ip }}</span>
                </div>
                <p class="feedback-message">" {{ fb.message }} "</p>
              </div>
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

            <div class="danger-zone" style="margin-top: 3rem; border-top: 1px solid var(--border); padding-top: 2rem;">
              <h3 style="color: var(--red);">Danger Zone</h3>
              <p style="font-size: 13px; color: var(--text3); margin-bottom: 1rem;">
                Tindakan ini akan menghapus seluruh data statistik lokal. Untuk data di Supabase, Anda harus menghapusnya secara manual melalui SQL Editor.
              </p>
              <button class="btn btn-danger" @click="clearAllData">⚠️ Hapus Semua Data Statistik</button>
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

        <!-- SUGGESTION & FEEDBACK CARD -->
        <div class="feedback-trigger-card" @click="showFeedbackModal = true">
          <div class="feedback-card-icon">💬</div>
          <div class="feedback-card-content">
            <h3>Kirim Saran & Kritik</h3>
            <span>Bantu kami menyempurnakan kualitas soal dan aplikasi ini</span>
          </div>
          <div class="feedback-card-arrow">📝</div>
        </div>

        <div class="menu-footer" style="display: flex; flex-direction: column; align-items: center; gap: 16px; margin-top: 1.5rem;">
          <button class="theme-toggle" @click="toggleTheme" title="Toggle Dark Mode">
            {{ isDarkMode ? '☀️ Mode Terang' : '🌙 Mode Gelap' }}
          </button>
          <div class="contact-info" style="font-size: 12.5px; color: var(--text3); display: flex; align-items: center; gap: 8px; font-weight: 500;">
            <span>Nara Hubung:</span>
            <a href="mailto:muhajirgood05@gmail.com" style="color: var(--blue); text-decoration: none; display: flex; align-items: center; gap: 4px; font-weight: 600; transition: opacity 0.2s;" onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1">
              ✉️ Email
            </a>
            <span style="color: var(--border);">|</span>
            <a href="https://www.linkedin.com/in/ahmad-muhajir-a64506221/" target="_blank" style="color: var(--blue); text-decoration: none; display: flex; align-items: center; gap: 4px; font-weight: 600; transition: opacity 0.2s;" onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1">
              💼 LinkedIn
            </a>
          </div>
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
          <div v-if="isGlobal" class="sync-indicator" :class="{ 'syncing': isSyncing }" title="Real-time Sync Aktif">
            ☁️
          </div>
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
import { PACKAGES, KATEGORI_META } from './data/soalBank.js';
import { saveResultLocally, getAllStats, getIP } from './data/stats.js';
import { getSupabaseClient } from './data/supabase.js';

const currentView = ref('menu'); // 'menu', 'exam', 'dashboard'
const currentPackageId = ref(null);
const currentPackage = computed(() => PACKAGES.find(p => p.id === currentPackageId.value));
const currentExamSession = ref('sesi1');
const dashboardTab = ref('stats'); // 'stats', 'config'
const dashboardCategoryFilter = ref('semua');
const currentAttemptId = ref(null);

// Feedback State
const showFeedbackModal = ref(false);
const feedbackForm = ref({
  name: '',
  role: 'Pemeriksa Pajak',
  category: 'Soal Exam',
  message: ''
});
const isSubmittingFeedback = ref(false);
const feedbackSuccess = ref(false);
const feedbacksList = ref([]);

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

const clearAllData = () => {
  if (confirm('APAKAH ANDA YAKIN? Semua data statistik lokal akan dihapus selamanya.')) {
    localStorage.removeItem('pajak_exam_all_results');
    alert('Data Lokal Berhasil Dihapus. Jangan lupa untuk TRUNCATE tabel di Supabase jika perlu.');
    refreshStats();
  }
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
const recentSubmissions = ref([]);
const isGlobal = ref(false);

const refreshStats = async () => {
  const allStats = await getAllStats();
  aggregatedStats.value = allStats;
  
  // Calculate total submissions
  totalSubmissions.value = Object.values(allStats).reduce((acc, curr) => acc + (curr.totalSubmissions || 0), 0);
  
  // Check if we are using global data
  isGlobal.value = !!localStorage.getItem('VITE_SUPABASE_URL');

  // Fetch raw results for activity log
  const localResults = JSON.parse(localStorage.getItem('pajak_exam_all_results') || '[]');
  const client = getSupabaseClient();
  if (client) {
    const { data } = await client.from('pajak_exam_results').select('*').order('created_at', { ascending: false }).limit(10);
    if (data) {
      recentSubmissions.value = data.map(item => ({
        packageId: item.package_id,
        results: item.results,
        ip: item.user_ip,
        timestamp: item.created_at
      }));
    }
  } else {
    recentSubmissions.value = localResults.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
  
  await loadFeedbacks();
};

const submitFeedback = async () => {
  if (!feedbackForm.value.name.trim() || !feedbackForm.value.message.trim()) {
    alert('Nama dan masukan tidak boleh kosong!');
    return;
  }
  
  isSubmittingFeedback.value = true;
  const ip = await getIP();
  
  const feedbackItem = {
    id: generateUUID(),
    name: feedbackForm.value.name,
    role: feedbackForm.value.role,
    category: feedbackForm.value.category,
    message: feedbackForm.value.message,
    ip: ip,
    timestamp: new Date().toISOString()
  };
  
  // 1. Save to Local Storage
  const localFeedbacks = JSON.parse(localStorage.getItem('pajak_exam_feedbacks') || '[]');
  localFeedbacks.push(feedbackItem);
  localStorage.setItem('pajak_exam_feedbacks', JSON.stringify(localFeedbacks));
  
  // 2. Try to save to Supabase if connected
  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client.from('pajak_exam_feedbacks').insert([
        {
          id: feedbackItem.id,
          name: feedbackItem.name,
          role: feedbackItem.role,
          category: feedbackItem.category,
          message: feedbackItem.message,
          user_ip: feedbackItem.ip,
          created_at: feedbackItem.timestamp
        }
      ]);
      if (error) {
        console.warn('Supabase feedback sync error (possibly table does not exist):', error.message);
      }
    } catch (e) {
      console.warn('Supabase insertion failed gracefully:', e);
    }
  }
  
  isSubmittingFeedback.value = false;
  feedbackSuccess.value = true;
  
  await loadFeedbacks();
  
  setTimeout(() => {
    showFeedbackModal.value = false;
    feedbackSuccess.value = false;
    feedbackForm.value.name = '';
    feedbackForm.value.message = '';
  }, 1500);
};

const loadFeedbacks = async () => {
  const localFeedbacks = JSON.parse(localStorage.getItem('pajak_exam_feedbacks') || '[]');
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('pajak_exam_feedbacks')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (data && !error) {
        feedbacksList.value = data.map(item => ({
          id: item.id,
          name: item.name,
          role: item.role,
          category: item.category,
          message: item.message,
          ip: item.user_ip,
          timestamp: item.created_at
        }));
        return;
      }
    } catch (e) {
      console.warn('Supabase load feedbacks failed, using local:', e);
    }
  }
  feedbacksList.value = localFeedbacks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

const deleteFeedback = async (id) => {
  if (!confirm('Apakah Anda yakin ingin menghapus masukan ini?')) return;
  
  let localFeedbacks = JSON.parse(localStorage.getItem('pajak_exam_feedbacks') || '[]');
  localFeedbacks = localFeedbacks.filter(f => f.id !== id);
  localStorage.setItem('pajak_exam_feedbacks', JSON.stringify(localFeedbacks));
  
  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client.from('pajak_exam_feedbacks').delete().eq('id', id);
      if (error) console.warn('Supabase feedback delete error:', error.message);
    } catch (e) {
      console.warn('Supabase deletion failed gracefully:', e);
    }
  }
  
  await loadFeedbacks();
};

const formatDateTime = (iso) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

const getSortedQuestions = (questions) => {
  return Object.entries(questions).map(([id, s]) => ({
    id,
    ...s,
    total: s.correct + s.wrong,
    wrongPct: Math.round((s.wrong / (s.correct + s.wrong)) * 100)
  })).sort((a, b) => b.wrongPct - a.wrongPct); // Sort by most wrong
};

const getFilteredDashboardQuestions = (questions) => {
  const sorted = getSortedQuestions(questions);
  if (dashboardCategoryFilter.value === 'semua') return sorted;
  return sorted.filter(q => q.kategori === dashboardCategoryFilter.value);
};

const getDiffColor = (pct) => {
  if (pct > 70) return '#ff4d4f';
  if (pct > 40) return '#faad14';
  return '#52c41a';
};

const isSyncing = ref(false);

const handleResults = async (results) => {
  isSyncing.value = true;
  const ip = await getIP();
  await saveResultLocally(currentPackageId.value, currentExamSession.value, results, ip, currentAttemptId.value);
  if (isAdmin.value) refreshStats();
  
  // Visual feedback for sync
  setTimeout(() => {
    isSyncing.value = false;
  }, 1000);
};

const selectPackage = (id) => {
  currentPackageId.value = id;
  // Try to restore attemptId from local storage to prevent duplicates on refresh
  const savedAttemptId = localStorage.getItem(`pajak_exam_attempt_${id}`);
  if (savedAttemptId) {
    currentAttemptId.value = savedAttemptId;
  } else {
    const newId = generateUUID();
    currentAttemptId.value = newId;
    localStorage.setItem(`pajak_exam_attempt_${id}`, newId);
  }
  
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

onMounted(async () => {
  // Check initial theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDarkMode.value = true;
    document.documentElement.classList.add('dark');
  }
  await loadFeedbacks();
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
.stats-overview { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem; }
.dashboard-filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 2rem; padding: 1rem; background: var(--surface); border-radius: var(--radius); border: 1px solid var(--border); }
.dashboard-filters .filter-btn { padding: 6px 14px; font-size: 13px; font-weight: 600; border: 1px solid var(--border); background: var(--bg); border-radius: 20px; cursor: pointer; transition: all 0.2s; }
.dashboard-filters .filter-btn.active { background: var(--blue); color: white; border-color: var(--blue); }
.dashboard-filters .filter-btn:hover:not(.active) { background: var(--bg2); }

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
.sync-indicator { font-size: 18px; opacity: 0.3; transition: all 0.3s; filter: grayscale(1); }
.sync-indicator.syncing { opacity: 1; filter: grayscale(0); transform: scale(1.2); }

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

/* ── FEEDBACK SYSTEM STYLES ── */
.feedback-trigger-card {
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, var(--blue-light) 0%, var(--surface) 100%);
  border: 1px dashed var(--blue-mid);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1.5rem;
}
.dark-theme .feedback-trigger-card {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, var(--surface) 100%);
}
.feedback-trigger-card:hover {
  border-style: solid;
  border-color: var(--blue);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.1);
}
.feedback-card-icon {
  font-size: 1.5rem;
  margin-right: 1rem;
}
.feedback-card-content {
  flex: 1;
  text-align: left;
}
.feedback-card-content h3 {
  font-size: 0.95rem;
  color: var(--text);
  font-weight: 600;
  margin: 0 0 2px 0;
}
.feedback-card-content span {
  font-size: 0.8rem;
  color: var(--text3);
}
.feedback-card-arrow {
  font-size: 1.2rem;
  transition: transform 0.2s;
}
.feedback-trigger-card:hover .feedback-card-arrow {
  transform: scale(1.1) rotate(-5deg);
}

.feedback-modal-content {
  max-width: 500px;
}
.form-label {
  display: block;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: var(--text2);
}
.select-input {
  cursor: pointer;
}
.textarea-input {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}
.feedback-success-state {
  text-align: center;
  padding: 2rem 1rem;
}
.success-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  animation: bounce 1s infinite alternate;
}
@keyframes bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-10px); }
}
.feedback-success-state h3 {
  font-size: 1.5rem;
  color: var(--green);
  margin-bottom: 0.5rem;
}
.feedback-success-state p {
  color: var(--text2);
  font-size: 0.95rem;
}

/* Feedbacks List Dashboard */
.feedbacks-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  margin-top: 1rem;
}
.feedback-item-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(0,0,0,0.02);
  text-align: left;
}
.feedback-item-card:hover {
  border-color: var(--blue-mid);
  box-shadow: 0 4px 10px rgba(0,0,0,0.04);
}
.feedback-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.75rem;
  margin-bottom: 0.75rem;
}
.feedback-sender-info {
  display: flex;
  flex-direction: column;
}
.feedback-sender-name {
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--text);
}
.feedback-sender-role {
  font-size: 12px;
  color: var(--text3);
  margin-top: 2px;
}
.btn-delete-fb {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}
.btn-delete-fb:hover {
  background: var(--bg2);
}
.feedback-item-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.feedback-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  color: var(--text3);
}
.feedback-date {
  font-weight: 500;
}
.feedback-ip {
  font-family: monospace;
}
.feedback-message {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text2);
  margin: 4px 0 0 0;
  background: var(--bg);
  padding: 12px;
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--blue);
  font-style: italic;
}
.no-feedback-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--surface);
  border: 1px dashed var(--border);
  border-radius: var(--radius-lg);
  margin-top: 1rem;
}
.no-feedback-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}
.no-feedback-state h4 {
  font-size: 1.2rem;
  color: var(--text);
  margin-bottom: 0.5rem;
}
.no-feedback-state p {
  color: var(--text3);
}

.badge-green { background: #d1fae5; color: #065f46; }
.badge-red { background: #fee2e2; color: #991b1b; }
.badge-blue { background: #dbeafe; color: #1e40af; }
.badge-amber { background: #fef3c7; color: #92400e; }
</style>
