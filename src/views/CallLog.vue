<template>
  <div>
    <div class="mb-6">
      <h2 class="text-[24px] font-black tracking-tight mb-1">
        <span class="text-grad-blue">Call Logs</span>
      </h2>
      <p class="text-sm text-nap-text-2">All incoming calls handled by your NAP AI receptionist</p>
    </div>

    <div class="filter-bar mb-5">
      <div class="search-wrap">
        <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input v-model="search" class="filter-input" placeholder="Search caller, number, status, sentiment..." />
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

    <div v-if="isLoading" class="glass-card p-10 flex items-center justify-center text-nap-text-3 text-sm">
      Loading call logs...
    </div>

    <template v-else>
      <div class="grid grid-cols-4 gap-3 mb-5">
        <div v-for="s in summaryStats" :key="s.label" class="glass-card p-4 animate-tab-enter text-center">
          <div class="text-[22px] font-black" :style="{ color: s.color }">{{ s.value }}</div>
          <div class="text-[10px] font-bold text-nap-text-3 uppercase tracking-wider mt-1">{{ s.label }}</div>
        </div>
      </div>

      <div class="glass-card overflow-hidden animate-tab-enter" style="animation-delay:80ms">
        <table class="nap-table w-full">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Caller</th>
              <th>Number</th>
              <th>Duration</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <template v-for="call in paginated" :key="call.id">
              <tr
                :class="['cursor-pointer transition-colors duration-150', expanded === call.id ? 'row-expanded' : 'hover:bg-purple-50/30']"
                @click="toggle(call.id)"
              >
                <td class="text-nap-text-2 text-[12px] whitespace-nowrap">{{ callDate(call) }}</td>
                <td class="text-nap-text-2 text-[12px] whitespace-nowrap font-mono">{{ callTime(call) }}</td>
                <td class="font-semibold text-nap-text">{{ call.callerName || call.caller || call.from || 'Unknown' }}</td>
                <td class="text-nap-text-2 font-mono text-[12px]">{{ call.from_number || call.from || call.number || '-' }}</td>
                <td>
                  <span class="font-bold text-nap-text">{{ call.duration_min ?? call.call_duration_min ?? call.duration ?? 0 }}</span>
                  <span class="text-nap-text-3 text-[11px]"> min</span>
                </td>
                <td>
                  <svg
                    :style="{ transform: expanded === call.id ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s ease' }"
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8e82a0" stroke-width="2"
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </td>
              </tr>

              <tr v-if="expanded === call.id" class="row-detail">
                <td colspan="6">
                  <div class="detail-panel">
                    <div class="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <div class="detail-label">Call ID</div>
                        <div class="detail-value font-mono text-[12px]">{{ call.call_id || call.id }}</div>
                      </div>
                      <div>
                        <div class="detail-label">Status</div>
                        <div class="detail-value">{{ call.status || call.call_status || '-' }}</div>
                      </div>
                      <div>
                        <div class="detail-label">Transcript</div>
                        <div class="detail-value">{{ call.has_transcript || call.hasTranscript ? 'Available' : 'Not available' }}</div>
                      </div>
                    </div>
                    <div>
                      <div class="detail-label mb-2">Summary</div>
                      <p class="text-[13px] text-nap-text-2 leading-relaxed">{{ call.call_summary || call.summary || call.reason || 'No summary recorded.' }}</p>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-if="paginated.length === 0">
              <td colspan="6" class="text-center py-10 text-nap-text-3 text-sm">No calls match your filters.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex justify-between items-center mt-4 text-[12px] text-nap-text-3">
        <span>Showing {{ paginated.length }} of {{ filtered.length }} calls</span>
        <div class="flex gap-1.5">
          <button
            v-for="p in totalPages" :key="p"
            :class="['page-btn', page === p ? 'page-active' : '']"
            @click="page = p"
          >{{ p }}</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'

const store = useDashboardStore()
const calls = computed(() => (Array.isArray(store.calls) ? store.calls : []))
const isLoading = computed(() => store.loading.calls)

const search = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const expanded = ref(null)
const fromInputRef = ref(null)
const toInputRef = ref(null)
const page = ref(1)
const PER_PAGE = 15

function callDate(call) {
  const ts = call.call_timestamp || call.timestamp || call.date || call.call_date || ''
  if (!ts) return '-'
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return String(ts).split('T')[0] || ts
  return d.toLocaleDateString('en-CA')
}

function callTime(call) {
  const ts = call.call_timestamp || call.timestamp || call.date || call.call_date || ''
  if (!ts) return call.time || '-'

  const asText = String(ts)
  if (!asText.includes('T') && asText.length <= 10) {
    return call.time || '-'
  }

  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return call.time || '-'
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function callDateKey(call) {
  return callDate(call)
}

const hasFilters = computed(() => search.value.trim() || dateFrom.value || dateTo.value)

function clearFilters() {
  search.value = ''
  dateFrom.value = ''
  dateTo.value = ''
}

watch([search, dateFrom, dateTo], () => {
  page.value = 1
})

const filtered = computed(() => {
  let list = calls.value

  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter((c) =>
      (c.callerName || c.caller || c.from || '').toLowerCase().includes(q)
      || (c.from_number || c.from || c.number || '').toLowerCase().includes(q)
      || (c.call_summary || c.summary || c.reason || '').toLowerCase().includes(q)
      || (c.status || c.call_status || '').toLowerCase().includes(q)
      || String(c.sentiment || '').toLowerCase().includes(q)
      || callDate(c).toLowerCase().includes(q)
      || callTime(c).toLowerCase().includes(q)
      || String(c.duration_min ?? c.call_duration_min ?? c.duration ?? '').includes(q)
    )
  }

  if (dateFrom.value) list = list.filter((c) => callDateKey(c) >= dateFrom.value)
  if (dateTo.value) list = list.filter((c) => callDateKey(c) <= dateTo.value)

  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PER_PAGE)))
const paginated = computed(() => {
  const start = (page.value - 1) * PER_PAGE
  return filtered.value.slice(start, start + PER_PAGE)
})

function toggle(id) {
  expanded.value = expanded.value === id ? null : id
}

const summaryStats = computed(() => {
  const list = calls.value
  const totalMin = list.reduce((acc, c) => acc + Number(c.duration_min ?? c.call_duration_min ?? c.duration ?? 0), 0)
  const avgMin = list.length ? (totalMin / list.length).toFixed(1) : '0.0'
  const positive = list.filter((c) => String(c.sentiment || '').toLowerCase() === 'positive').length

  return [
    { label: 'Total Calls', value: list.length.toLocaleString(), color: 'var(--c-purple)' },
    { label: 'Total Minutes', value: totalMin.toFixed(1), color: '#4a86e8' },
    { label: 'Avg Duration', value: `${avgMin} min`, color: '#c27800' },
    { label: 'Positive Calls', value: positive.toLocaleString(), color: 'var(--c-teal)' },
  ]
})
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
.date-label {
  font-size: 8.5px; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.8px; color: #8e82a0; line-height: 1; pointer-events: none;
}
.date-display {
  font-size: 12px; font-weight: 600; color: var(--c-text); line-height: 1.4;
  white-space: nowrap; pointer-events: none;
}
.date-native {
  position: absolute; inset: 0; opacity: 0; cursor: pointer;
  width: 100%; height: 100%; z-index: 2;
}
.date-divider { width: 1px; height: 20px; background: var(--border-color); flex-shrink: 0; }
.date-clear {
  display: flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; border-radius: 50%; border: none;
  background: rgba(142,130,160,0.15); color: #8e82a0;
  cursor: pointer; transition: background .12s;
}
.date-clear:hover { background: rgba(224,92,92,0.15); color: #e05c5c; }

.clear-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 7px 11px; border-radius: 10px; border: 1px solid rgba(224,92,92,0.3);
  background: rgba(224,92,92,0.06); color: #e05c5c;
  font-size: 12px; font-weight: 700; cursor: pointer; transition: background .14s; height: 38px;
}
.clear-btn:hover { background: rgba(224,92,92,0.12); }

.row-expanded { background: rgba(0,168,138,0.04) !important; }
.row-detail td { padding: 0 !important; }
.detail-panel { padding: 16px 20px; background: rgba(91,63,143,0.03); border-top: 1px solid var(--border-color); }
.detail-label { font-size: 9.5px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #8e82a0; margin-bottom: 4px; }
.detail-value { font-size: 13px; font-weight: 600; color: var(--c-text); }

.page-btn {
  padding: 3px 9px; border-radius: 6px; border: 1px solid var(--border-color);
  font-size: 11px; font-weight: 600; cursor: pointer; background: transparent;
  color: #8e82a0; transition: background .14s, color .14s;
}
.page-btn:hover { background: rgba(91,63,143,0.07); color: #5b3f8f; }
.page-active { background: var(--grad-primary) !important; color: #fff !important; border-color: transparent !important; }
</style>
