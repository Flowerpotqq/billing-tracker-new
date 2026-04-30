<template>
  <div>
    <div class="mb-6">
      <h2 class="text-[24px] font-black tracking-tight mb-1">
        <span class="text-grad-accent">Transcribed Calls</span>
      </h2>
      <p class="text-sm text-nap-text-2">Full text transcripts with AI-generated summaries</p>
    </div>

    <div class="filter-bar mb-5">
      <div class="search-wrap">
        <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input v-model="search" class="filter-input" placeholder="Search call ID, caller, summary, sentiment..." />
      </div>

      <div class="sentiment-controls">
        <select v-model="sentimentFilter" class="filter-select">
          <option value="all">All Sentiments</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </select>
        <select v-model="sentimentSort" class="filter-select sort-select">
          <option value="none">Sort by...</option>
          <option value="pos-first">Positive first</option>
          <option value="neg-first">Negative first</option>
          <option value="neu-first">Neutral first</option>
          <option value="asc">Date ascending</option>
          <option value="desc">Date descending</option>
        </select>
      </div>

      <div class="date-range-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8e82a0" stroke-width="2" class="flex-shrink-0">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <div class="date-field" @click="fromInputRef?.showPicker?.()">
          <span class="date-label">Start</span>
          <span class="date-display">{{ dateFrom || 'Any' }}</span>
          <input ref="fromInputRef" v-model="dateFrom" type="date" class="date-native" />
        </div>
        <span class="date-divider" />
        <div class="date-field" @click="toInputRef?.showPicker?.()">
          <span class="date-label">End</span>
          <span class="date-display">{{ dateTo || 'Any' }}</span>
          <input ref="toInputRef" v-model="dateTo" type="date" class="date-native" />
        </div>
        <button v-if="dateFrom || dateTo" class="date-clear" @click.stop="dateFrom = ''; dateTo = ''" title="Clear dates">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <button v-if="hasFilters" class="clear-btn" @click="clearFilters">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        Clear all
      </button>
    </div>

    <div v-if="isLoading" class="glass-card p-10 text-center text-nap-text-3 text-sm">
      Loading transcripts...
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="(t, i) in filtered"
        :key="transcriptId(t)"
        class="glass-card overflow-hidden animate-tab-enter"
        :style="{ animationDelay: `${i * 30}ms` }"
      >
        <div class="flex items-center gap-4 p-5">
          <div class="avatar-sm cursor-pointer" @click="toggle(transcriptId(t))">{{ initials(t.callerName || t.caller || t.from || `Call ${transcriptId(t)}`) }}</div>

          <div class="flex-1 min-w-0 cursor-pointer" @click="toggle(transcriptId(t))">
            <div class="flex items-center gap-2 mb-0.5 flex-wrap">
              <span class="font-bold text-nap-text text-[14px]">{{ t.callerName || t.caller || t.from || `Call ${transcriptId(t)}` }}</span>
              <span :class="['sentiment-badge', `sentiment-${(t.sentiment || 'neutral').toLowerCase()}`]">
                {{ t.sentiment || 'Unknown' }}
              </span>
            </div>
            <div class="text-[12px] text-nap-text-2">{{ displayDate(t) }} · {{ t.duration_min ?? t.call_duration_min ?? t.duration ?? 0 }} min</div>
          </div>

          <div class="text-right flex-shrink-0 hidden sm:block max-w-[260px] cursor-pointer" @click="toggle(transcriptId(t))">
            <div class="text-[11px] text-nap-text-3 mb-1">AI Summary</div>
            <div class="text-[12px] text-nap-text font-medium truncate">{{ t.summary || t.call_summary || 'No summary available' }}</div>
          </div>

          <svg
            class="cursor-pointer flex-shrink-0"
            :style="{ transform: expanded === transcriptId(t) ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s ease' }"
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e82a0" stroke-width="2"
            @click="toggle(transcriptId(t))"
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>

        <Transition name="expand">
          <div v-if="expanded === transcriptId(t)" class="expand-body">
            <div class="summary-block">
              <div class="text-[10px] font-semibold text-nap-text-3 uppercase tracking-wider mb-2">AI Summary</div>
              <p class="text-[13px] text-nap-text leading-relaxed">{{ t.summary || t.call_summary || 'No summary available for this call.' }}</p>

              <div class="grid grid-cols-3 gap-3 mt-4">
                <div v-for="item in getDetails(t)" :key="item.label">
                  <div class="text-[9.5px] font-bold text-nap-text-3 uppercase tracking-wider mb-1">{{ item.label }}</div>
                  <div class="text-[12px] font-semibold text-nap-text">{{ item.value }}</div>
                </div>
              </div>
            </div>

            <div v-if="getRecordingUrl(t)" class="recording-block">
              <div class="text-[9.5px] font-black text-nap-text-3 uppercase tracking-wider mb-2">Recording</div>
              <audio controls :src="getRecordingUrl(t)" class="audio-player" preload="none" />
            </div>

            <div class="transcript-block">
              <div class="flex items-center justify-between mb-3">
                <div class="text-[9.5px] font-black text-nap-text-3 uppercase tracking-wider">Full Transcript</div>
                <div class="text-[10px] text-nap-text-3">{{ normalizedTranscript(t).length }} lines</div>
              </div>

              <div class="transcript-scroll">
                <template v-if="normalizedTranscript(t).length">
                  <div
                    v-for="(line, li) in normalizedTranscript(t)"
                    :key="`${transcriptId(t)}-${li}`"
                    :class="['transcript-line', isAiSpeaker(line.speaker) ? 'ai-line' : 'caller-line']"
                  >
                    <span class="speaker-label">{{ line.speaker || (isAiSpeaker(line.speaker) ? 'AI' : 'Caller') }}</span>
                    <p class="text-[13px] leading-relaxed mt-1">{{ line.text }}</p>
                  </div>
                </template>

                <div v-else class="text-[13px] text-nap-text-3 italic py-4 text-center">
                  No transcript available.
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <div v-if="filtered.length === 0" class="glass-card p-10 text-center text-nap-text-3 text-sm">
        No transcripts match your filters.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'

const store = useDashboardStore()
const transcripts = computed(() => (Array.isArray(store.transcripts) ? store.transcripts : []))
const isLoading = computed(() => store.loading.transcripts)

const search = ref('')
const sentimentFilter = ref('all')
const sentimentSort = ref('none')
const dateFrom = ref('')
const dateTo = ref('')
const expanded = ref(null)
const fromInputRef = ref(null)
const toInputRef = ref(null)

const SENTIMENT_ORDER = { positive: 0, neutral: 1, negative: 2 }
const SENTIMENT_ORDER_NEU = { neutral: 0, positive: 1, negative: 2 }

function transcriptId(t) {
  return t.call_id || t.id || 'unknown'
}

function displayDate(t) {
  const raw = t.date || t.call_date || ''
  if (!raw) return '-'
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return String(raw).split('T')[0] || raw
  return d.toLocaleDateString('en-CA')
}

function normalizedTranscript(t) {
  const lines = Array.isArray(t.transcript) ? t.transcript : []
  return lines
    .map((line) => ({
      speaker: line?.speaker || 'Caller',
      text: String(line?.text || '').trim(),
    }))
    .filter((line) => line.text.length > 0)
}

function isAiSpeaker(speaker) {
  return String(speaker || '').toLowerCase() === 'ai' || String(speaker || '').toLowerCase() === 'agent'
}

function getRecordingUrl(t) {
  return t.recording_url || t.recordingUrl || ''
}

const hasFilters = computed(() => (
  search.value.trim()
  || sentimentFilter.value !== 'all'
  || sentimentSort.value !== 'none'
  || dateFrom.value
  || dateTo.value
))

function clearFilters() {
  search.value = ''
  sentimentFilter.value = 'all'
  sentimentSort.value = 'none'
  dateFrom.value = ''
  dateTo.value = ''
}

const filtered = computed(() => {
  let list = transcripts.value

  if (sentimentFilter.value !== 'all') {
    list = list.filter((t) => String(t.sentiment || '').toLowerCase() === sentimentFilter.value)
  }

  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter((t) => {
      const transcriptText = normalizedTranscript(t).map((line) => line.text).join(' ').toLowerCase()
      return (
        String(transcriptId(t)).toLowerCase().includes(q)
        || String(t.callerName || t.caller || t.from || '').toLowerCase().includes(q)
        || String(t.summary || t.call_summary || '').toLowerCase().includes(q)
        || String(t.sentiment || '').toLowerCase().includes(q)
        || String(t.status || t.call_status || '').toLowerCase().includes(q)
        || displayDate(t).toLowerCase().includes(q)
        || String(t.duration_min ?? t.call_duration_min ?? t.duration ?? '').includes(q)
        || transcriptText.includes(q)
      )
    })
  }

  if (dateFrom.value) list = list.filter((t) => displayDate(t) >= dateFrom.value)
  if (dateTo.value) list = list.filter((t) => displayDate(t) <= dateTo.value)

  if (sentimentSort.value !== 'none') {
    list = [...list].sort((a, b) => {
      const sort = sentimentSort.value
      if (sort === 'pos-first') {
        const ao = SENTIMENT_ORDER[String(a.sentiment || '').toLowerCase()] ?? 1
        const bo = SENTIMENT_ORDER[String(b.sentiment || '').toLowerCase()] ?? 1
        return ao - bo
      }
      if (sort === 'neg-first') {
        const ao = SENTIMENT_ORDER[String(a.sentiment || '').toLowerCase()] ?? 1
        const bo = SENTIMENT_ORDER[String(b.sentiment || '').toLowerCase()] ?? 1
        return bo - ao
      }
      if (sort === 'neu-first') {
        const ao = SENTIMENT_ORDER_NEU[String(a.sentiment || '').toLowerCase()] ?? 1
        const bo = SENTIMENT_ORDER_NEU[String(b.sentiment || '').toLowerCase()] ?? 1
        return ao - bo
      }

      const da = displayDate(a)
      const db = displayDate(b)
      return sort === 'asc' ? da.localeCompare(db) : db.localeCompare(da)
    })
  }

  return list
})

function toggle(id) {
  expanded.value = expanded.value === id ? null : id
}

function initials(name) {
  return (name || '?')
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function getDetails(t) {
  return [
    { label: 'Call ID', value: transcriptId(t) },
    { label: 'Duration', value: `${t.duration_min ?? t.call_duration_min ?? t.duration ?? '-'} min` },
    { label: 'Sentiment', value: t.sentiment || 'Unknown' },
  ]
}
</script>

<style scoped>
.filter-bar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.search-wrap { position: relative; flex: 1; min-width: 220px; }
.search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #8e82a0; pointer-events: none; }
.filter-input {
  padding: 9px 12px 9px 32px; border-radius: 10px;
  border: 1px solid var(--border-color); background: rgba(255,255,255,0.9);
  font-size: 13px; color: var(--c-text); outline: none; width: 100%;
  transition: border-color .15s, box-shadow .15s;
}
.filter-input:focus { border-color: var(--c-teal); box-shadow: 0 0 0 3px rgba(0,168,138,0.1); }
.filter-select {
  padding: 9px 12px; border-radius: 10px; border: 1px solid var(--border-color);
  background: rgba(255,255,255,0.9); font-size: 12px; font-weight: 600;
  color: var(--c-text); cursor: pointer; outline: none; height: 38px;
}

.date-range-pill {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 12px; border-radius: 10px;
  border: 1px solid var(--border-color); background: rgba(255,255,255,0.9);
  height: 38px; cursor: pointer; position: relative;
  width: 260px; flex-shrink: 0;
  transition: border-color .15s, box-shadow .15s;
}
.date-range-pill:focus-within { border-color: var(--c-teal); box-shadow: 0 0 0 3px rgba(0,168,138,0.1); }
.date-field {
  position: relative; display: flex; flex-direction: column;
  flex: 1; cursor: pointer; padding: 2px 8px; border-radius: 6px;
  transition: background .12s;
}
.date-field:hover { background: rgba(91,63,143,0.06); }
.date-label { font-size: 8.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #8e82a0; line-height: 1; pointer-events: none; }
.date-display { font-size: 12px; font-weight: 600; color: var(--c-text); line-height: 1.4; white-space: nowrap; pointer-events: none; }
.date-native { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; z-index: 2; }
.date-divider { width: 1px; height: 20px; background: var(--border-color); flex-shrink: 0; }
.date-clear {
  display: flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; border-radius: 50%; border: none;
  background: rgba(142,130,160,0.15); color: #8e82a0;
  cursor: pointer; transition: background .12s;
}
.date-clear:hover { background: rgba(224,92,92,0.15); color: #e05c5c; }

.sentiment-controls { display: flex; align-items: center; gap: 6px; }
.sort-select { min-width: 148px; }

.clear-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 7px 11px; border-radius: 10px; border: 1px solid rgba(224,92,92,0.3);
  background: rgba(224,92,92,0.06); color: #e05c5c;
  font-size: 12px; font-weight: 700; cursor: pointer; transition: background .14s; height: 38px;
}
.clear-btn:hover { background: rgba(224,92,92,0.12); }

.avatar-sm {
  width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
  background: var(--grad-primary);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 900; font-size: 13px;
}

.sentiment-badge {
  font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 5px;
}
.sentiment-positive { background: rgba(0,168,138,0.08); border: 1px solid rgba(0,168,138,0.2); color: var(--c-teal); }
.sentiment-negative { background: rgba(224,92,92,0.08); border: 1px solid rgba(224,92,92,0.2); color: #e05c5c; }
.sentiment-neutral { background: rgba(142,130,160,0.08); border: 1px solid rgba(142,130,160,0.2); color: #8e82a0; }

.expand-body { border-top: 1px solid var(--border-color); }

.summary-block {
  padding: 16px 20px; background: rgba(0,168,138,0.03);
  border-bottom: 1px solid var(--border-color);
}

.recording-block {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  background: rgba(91,63,143,0.03);
}

.transcript-block { padding: 16px 20px; }

.transcript-scroll {
  max-height: 360px;
  overflow-y: auto;
  padding-right: 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  scrollbar-width: thin;
  scrollbar-color: rgba(91,63,143,0.25) transparent;
}
.transcript-scroll::-webkit-scrollbar { width: 5px; }
.transcript-scroll::-webkit-scrollbar-track { background: transparent; }
.transcript-scroll::-webkit-scrollbar-thumb { background: rgba(91,63,143,0.25); border-radius: 10px; }
.transcript-scroll::-webkit-scrollbar-thumb:hover { background: rgba(91,63,143,0.45); }

.transcript-line {
  max-width: 82%;
  padding: 10px 14px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
}

/* Requirement: AI on the right, Caller on the left */
.ai-line {
  align-self: flex-end;
  background: rgba(91,63,143,0.08);
}

.caller-line {
  align-self: flex-start;
  background: rgba(0,168,138,0.08);
}

.speaker-label {
  font-size: 9.5px; font-weight: 800; text-transform: uppercase;
  letter-spacing: 1.2px; color: #8e82a0;
}

.audio-player {
  width: 100%;
  height: 36px;
  border-radius: 8px;
  outline: none;
  accent-color: var(--c-teal);
}

.expand-enter-active { transition: max-height .3s ease, opacity .25s ease; max-height: 2000px; }
.expand-leave-active { transition: max-height .25s ease, opacity .2s ease; }
.expand-enter-from { max-height: 0; opacity: 0; }
.expand-leave-to { max-height: 0; opacity: 0; }
</style>
