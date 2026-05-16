<template>
  <div class="layout">
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="sidebar-section">
        <div class="sidebar-label">Filter Materi</div>
        <button v-for="(meta, key) in KATEGORI_META" :key="key"
          :class="['filter-btn', { active: currentFilter === key }]" 
          @click="setFilter(key)"
        >
          {{ meta.label }} <span class="filter-count">{{ getFilterCount(key) }}</span>
        </button>
      </div>

      <div class="sidebar-section">
        <div class="sidebar-label">Navigasi Soal</div>
        <div class="q-grid">
          <div v-for="s in filteredSoals" :key="s.id"
            :class="['q-dot', getDotClass(s.id)]"
            @click="scrollToSoal(s.id)"
            :title="`Soal ${s.id}`"
          >
            {{ s.id }}
          </div>
        </div>
      </div>

      <div class="sidebar-section progress-section">
        <div class="sidebar-label">Progress</div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPct + '%' }"></div>
        </div>
        <div class="progress-text">{{ doneCount }} dari {{ totalCount }} soal dikonfirmasi</div>
        <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 6px;">
          <button class="btn btn-sm" @click="expandAll()">Tampilkan semua</button>
          <button class="btn btn-sm" @click="resetExam()">↺ Ulangi ujian</button>
        </div>
      </div>
    </aside>

    <!-- MAIN -->
    <main class="main">
      <div v-if="allDone" id="score-panel" class="score-panel show">
        <div class="score-circle">
          <div class="score-big">{{ score }}</div>
          <div class="score-sub">/ 100</div>
        </div>
        <div class="score-verdict">{{ verdict }}</div>
        <div class="score-msg">{{ verdictMsg }}</div>
        <div class="score-grid">
          <div v-for="(stat, k) in categoryStats" :key="k" class="score-item">
            <div class="score-item-n">{{ stat.benar }}/{{ stat.total }}</div>
            <div class="score-item-l">{{ KATEGORI_META[k]?.label || k }}</div>
            <div :style="{ fontSize: '11px', color: stat.pct >= 70 ? 'var(--green)' : 'var(--red)' }">{{ stat.pct }}%</div>
          </div>
        </div>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:1.5rem;">
          <button class="btn btn-primary" @click="resetExam()">↺ Ulangi Ujian</button>
          <button class="btn" @click="expandAll()">📖 Lihat Semua Pembahasan</button>
        </div>
      </div>

      <div id="soal-container">
        <div v-if="filteredSoals.length === 0" class="empty">
          <div class="empty-icon">📭</div>
          <p>Tidak ada soal untuk kategori ini.</p>
        </div>

        <div v-for="soal in filteredSoals" :key="soal.id" :id="'soal-' + soal.id" class="soal-card">
          <div class="soal-header">
            <div class="soal-meta">
              <span class="soal-num">Soal {{ soal.id }}</span>
              <span :class="['badge', KATEGORI_META[soal.kategori]?.badge || 'badge-blue']">
                {{ KATEGORI_META[soal.kategori]?.label }}
              </span>
              <span v-if="soal.skenario?.startsWith('[STUDI KASUS')" class="badge badge-green">Studi Kasus</span>
              <span v-if="revealed[soal.id]">
                <span v-if="answers[soal.id] === soal.jawaban" class="badge badge-green">✓ Benar</span>
                <span v-else class="badge badge-red">✗ Salah</span>
              </span>
            </div>
          </div>

          <div v-if="soal.skenario" class="scenario-box">
            <div class="scenario-label">Skenario / Kasus</div>
            <div v-html="soal.skenario"></div>
          </div>

          <div class="soal-text" v-html="soal.soal"></div>

          <div class="options">
            <div v-for="(opt, i) in soal.opsi" :key="i"
              :class="['option', getOptionClass(soal, i)]"
              @click="pilih(soal.id, i)"
            >
              <div :class="['radio', getRadioClass(soal, i)]"></div>
              <span><strong class="option-key">{{ String.fromCharCode(65 + i) }}.</strong> {{ opt }}</span>
            </div>
          </div>

          <div class="card-footer">
            <button class="btn" @click="togglePembahasan(soal.id)">
              {{ showPembahasan[soal.id] ? 'Sembunyikan' : 'Lihat' }} Pembahasan
            </button>
            <button v-if="!revealed[soal.id] && answers[soal.id] !== undefined" class="btn btn-primary" @click="konfirm(soal.id)">
              Konfirmasi Jawaban ✓
            </button>
          </div>

          <div v-if="showPembahasan[soal.id] || (revealed[soal.id] && showPembahasan[soal.id] !== false)" class="pembahasan show">
            <div class="pembahasan-title">📖 Pembahasan</div>
            <div v-html="soal.pembahasan"></div>
            <div class="dasar">⚖️ Dasar hukum: {{ soal.dasar }}</div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { KATEGORI_META } from '../data/soalBank.js';

const props = defineProps({
  soals: {
    type: Array,
    required: true
  },
  sessionId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['all-done', 'results-ready']);

const currentFilter = ref('semua');
const answers = ref({});
const revealed = ref({});
const showPembahasan = ref({});

const saveState = () => {
  localStorage.setItem('pajak_exam_state_' + props.sessionId, JSON.stringify({
    answers: answers.value,
    revealed: revealed.value,
    showPembahasan: showPembahasan.value
  }));
};

const loadState = (id) => {
  const saved = localStorage.getItem('pajak_exam_state_' + id);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      answers.value = parsed.answers || {};
      revealed.value = parsed.revealed || {};
      showPembahasan.value = parsed.showPembahasan || {};
    } catch (e) {
      answers.value = {};
      revealed.value = {};
      showPembahasan.value = {};
    }
  } else {
    answers.value = {};
    revealed.value = {};
    showPembahasan.value = {};
  }
};

watch([answers, revealed, showPembahasan], () => {
  saveState();
}, { deep: true });

watch(() => props.sessionId, (newId) => {
  loadState(newId);
  currentFilter.value = 'semua';
}, { immediate: true });

const filteredSoals = computed(() => {
  if (currentFilter.value === 'semua') return props.soals;
  return props.soals.filter(s => s.kategori === currentFilter.value);
});

const totalCount = computed(() => props.soals.length);
const doneCount = computed(() => Object.keys(revealed.value).length);
const progressPct = computed(() => totalCount.value > 0 ? Math.round((doneCount.value / totalCount.value) * 100) : 0);
const allDone = computed(() => doneCount.value === totalCount.value && totalCount.value > 0);

watch(doneCount, (newCount) => {
  if (newCount > 0 && newCount % 5 === 0) {
    const results = {};
    props.soals.forEach(s => {
      if (revealed.value[s.id]) {
        results[s.id] = {
          correct: answers.value[s.id] === s.jawaban,
          kategori: s.kategori
        };
      }
    });
    emit('results-ready', results);
  }
});

watch(allDone, (newVal) => {
  if (newVal) {
    const results = {};
    props.soals.forEach(s => {
      results[s.id] = {
        correct: answers.value[s.id] === s.jawaban,
        kategori: s.kategori
      };
    });
    emit('results-ready', results);
    emit('all-done');
  }
});

const getFilterCount = (kat) => {
  if (kat === 'semua') return props.soals.length;
  return props.soals.filter(s => s.kategori === kat).length;
};

const setFilter = (kat) => {
  currentFilter.value = kat;
};

const getDotClass = (id) => {
  if (revealed.value[id]) {
    const s = props.soals.find(x => x.id === id);
    return answers.value[id] === s.jawaban ? 'correct' : 'wrong';
  } else if (answers.value[id] !== undefined) {
    return 'answered';
  }
  return '';
};

const scrollToSoal = (id) => {
  const el = document.getElementById('soal-' + id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const getOptionClass = (soal, i) => {
  const rev = revealed.value[soal.id];
  const sel = answers.value[soal.id];
  if (rev) {
    if (i === soal.jawaban) return 'correct locked';
    if (i === sel && i !== soal.jawaban) return 'wrong locked';
    return 'locked';
  } else if (sel === i) {
    return 'selected';
  }
  return '';
};

const getRadioClass = (soal, i) => {
  const rev = revealed.value[soal.id];
  const sel = answers.value[soal.id];
  if (rev) {
    if (i === soal.jawaban) return 'ok';
    if (i === sel && i !== soal.jawaban) return 'ng';
  } else if (sel === i) {
    return 'sel';
  }
  return '';
};

const pilih = (id, idx) => {
  if (revealed.value[id]) return;
  answers.value[id] = idx;
};

const konfirm = (id) => {
  if (answers.value[id] === undefined) return;
  revealed.value[id] = true;
};

const togglePembahasan = (id) => {
  showPembahasan.value[id] = !showPembahasan.value[id];
};

const expandAll = () => {
  props.soals.forEach(s => {
    showPembahasan.value[s.id] = true;
  });
};

const resetExam = () => {
  answers.value = {};
  revealed.value = {};
  showPembahasan.value = {};
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Score Logic
const score = computed(() => {
  const correct = props.soals.filter(s => answers.value[s.id] === s.jawaban).length;
  return Math.round((correct / props.soals.length) * 100);
});

const verdict = computed(() => {
  if (score.value >= 80) return '🏆 Lulus — Sangat Baik';
  if (score.value >= 65) return '✅ Lulus — Cukup';
  return '❌ Belum Lulus';
});

const verdictMsg = computed(() => {
  if (score.value >= 80) return 'Penguasaan materi perpajakan sangat solid.';
  if (score.value >= 65) return 'Beberapa area perlu pendalaman lebih lanjut.';
  return 'Perlu belajar lebih intensif, terutama dasar hukum.';
});

const categoryStats = computed(() => {
  const stats = {};
  props.soals.forEach(s => {
    if (!stats[s.kategori]) stats[s.kategori] = { total: 0, benar: 0 };
    stats[s.kategori].total++;
    if (answers.value[s.id] === s.jawaban) stats[s.kategori].benar++;
  });
  Object.keys(stats).forEach(k => {
    stats[k].pct = Math.round((stats[k].benar / stats[k].total) * 100);
  });
  return stats;
});
</script>

<style scoped>
.layout { display: flex; max-width: 1280px; margin: 0 auto; min-height: calc(100vh - 56px); }

/* SIDEBAR */
.sidebar {
  width: 240px;
  flex-shrink: 0;
  padding: 1.5rem 1rem;
  border-right: 1px solid var(--border);
  position: sticky;
  top: 56px;
  height: calc(100vh - 56px);
  overflow-y: auto;
}
.sidebar-section { margin-bottom: 1.5rem; }
.sidebar-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text3); font-weight: 600; margin-bottom: 8px; padding: 0 8px; }
.filter-btn {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; padding: 7px 10px; border-radius: var(--radius-sm);
  border: none; background: none; cursor: pointer;
  font-size: 13px; color: var(--text2); text-align: left;
  transition: all 0.15s;
}
.filter-btn:hover { background: var(--bg2); color: var(--text); }
.filter-btn.active { background: var(--blue-light); color: var(--blue); font-weight: 500; }
.filter-count { font-size: 11px; background: var(--border); padding: 1px 7px; border-radius: 10px; }
.filter-btn.active .filter-count { background: var(--blue-mid); color: white; }

.progress-section { margin-top: auto; }
.progress-bar { background: var(--bg2); border-radius: 4px; height: 6px; margin: 8px 0 4px; }
.progress-fill { background: var(--blue); height: 6px; border-radius: 4px; transition: width 0.4s ease; }
.progress-text { font-size: 12px; color: var(--text3); }

/* grid nav */
.q-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; margin-top: 6px; }
.q-dot {
  aspect-ratio: 1; border-radius: 4px; border: 1px solid var(--border);
  background: var(--surface); cursor: pointer; font-size: 11px; font-weight: 500;
  color: var(--text3); display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.q-dot:hover { border-color: var(--blue); color: var(--blue); }
.q-dot.answered { background: var(--blue-light); border-color: var(--blue-mid); color: var(--blue); }
.q-dot.correct { background: var(--green-light); border-color: #97C459; color: var(--green); }
.q-dot.wrong { background: var(--red-light); border-color: #F09595; color: var(--red); }

/* MAIN */
.main { flex: 1; padding: 2rem 2.5rem; min-width: 0; }

.soal-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: box-shadow 0.2s;
}
.soal-card:target { scroll-margin-top: 80px; }

.soal-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 1rem; flex-wrap: wrap; }
.soal-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.soal-num { font-size: 12px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.05em; }

.scenario-box {
  background: var(--bg);
  border-left: 3px solid var(--blue);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  padding: 0.875rem 1.125rem;
  margin-bottom: 1.25rem;
  font-size: 13.5px;
  line-height: 1.75;
  color: var(--text);
  white-space: pre-wrap;
}
.scenario-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text3); font-weight: 600; margin-bottom: 6px; }
.soal-text { font-size: 14.5px; line-height: 1.7; color: var(--text); margin-bottom: 1.25rem; font-weight: 400; }

/* OPTIONS */
.options { display: flex; flex-direction: column; gap: 8px; }
.option {
  display: flex; gap: 12px; align-items: flex-start;
  padding: 11px 14px; border-radius: var(--radius-sm);
  border: 1px solid var(--border); cursor: pointer;
  transition: all 0.15s; font-size: 13.5px; line-height: 1.6; color: var(--text);
  background: var(--surface);
}
.option:hover:not(.locked) { border-color: var(--blue-mid); background: var(--blue-light); }
.option.selected { border-color: var(--blue-mid); background: var(--blue-light); color: var(--blue); }
.option.correct { border-color: #97C459; background: var(--green-light); color: var(--green); }
.option.wrong { border-color: #F09595; background: var(--red-light); color: var(--red); }
.option.locked { cursor: default; }

.radio {
  width: 18px; height: 18px; border-radius: 50%;
  border: 1.5px solid var(--border2); background: var(--surface);
  margin-top: 2px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s; font-size: 10px;
}
.radio.sel { border-color: var(--blue); background: var(--blue); }
.radio.sel::after { content: ''; width: 7px; height: 7px; border-radius: 50%; background: white; }
.radio.ok { border-color: #639922; background: #639922; }
.radio.ok::after { content: '✓'; color: white; font-size: 10px; font-weight: 700; }
.radio.ng { border-color: #E24B4A; background: #E24B4A; }
.radio.ng::after { content: '✕'; color: white; font-size: 10px; font-weight: 700; }

.option-key { font-weight: 600; min-width: 18px; font-size: 13px; }

/* PEMBAHASAN */
.pembahasan {
  margin-top: 1.125rem;
  padding: 0.875rem 1.125rem;
  background: var(--purple-light);
  border-radius: var(--radius-sm);
  font-size: 13.5px;
  line-height: 1.75;
  color: var(--purple-dark);
  animation: fadeIn 0.2s ease;
  white-space: pre-wrap;
}
.scenario-box table, .pembahasan table {
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
  font-size: 12.5px;
}
.scenario-box th, .scenario-box td, .pembahasan th, .pembahasan td {
  border: 1px solid var(--border);
  padding: 6px 10px;
  text-align: left;
}
.scenario-box th, .pembahasan th {
  background: var(--blue-light);
  font-weight: 600;
}
.pembahasan-title { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; margin-bottom: 6px; opacity: 0.7; }
.dasar { margin-top: 8px; font-size: 12px; opacity: 0.75; font-style: italic; }

@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

.card-footer { display: flex; gap: 8px; margin-top: 1rem; flex-wrap: wrap; }

/* SCORE PANEL */
.score-panel {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 2.5rem 2rem;
  text-align: center; margin-bottom: 1.5rem;
  animation: fadeIn 0.3s ease;
}
.score-circle {
  width: 120px; height: 120px; border-radius: 50%;
  border: 6px solid var(--blue-mid);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  margin: 0 auto 1rem;
}
.score-big { font-size: 42px; font-weight: 700; color: var(--blue); line-height: 1; }
.score-sub { font-size: 12px; color: var(--text3); }
.score-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 10px; margin: 1.5rem 0; }
.score-item { background: var(--bg2); border-radius: var(--radius-sm); padding: 0.75rem; }
.score-item-n { font-size: 22px; font-weight: 600; color: var(--text); }
.score-item-l { font-size: 11px; color: var(--text3); margin-top: 2px; }
.score-verdict { font-size: 16px; font-weight: 600; margin-bottom: 0.5rem; }
.score-msg { font-size: 14px; color: var(--text2); margin-bottom: 1.5rem; }

.empty { text-align: center; padding: 4rem 2rem; color: var(--text3); }
.empty-icon { font-size: 48px; margin-bottom: 1rem; }

@media (max-width: 768px) {
  .sidebar { display: none; }
  .main { padding: 1rem; }
}
</style>
