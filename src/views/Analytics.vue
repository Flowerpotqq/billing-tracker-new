<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-[24px] font-black tracking-tight mb-1">
        <span class="text-grad-primary">Analytics</span>
      </h2>
      <p class="text-sm text-nap-text-2">Call volume &amp; duration trends across your selected time range</p>
    </div>

    <!-- Range buttons -->
    <div class="flex gap-1.5 flex-wrap mb-5">
      <button
        v-for="(label, i) in RANGE_LABELS"
        :key="label"
        :class="['range-btn', store.timeRange === i ? 'range-active' : '']"
        @click="changeRange(i)"
      >{{ label }}</button>
    </div>

    <!-- Chart area with transition -->
    <Transition name="chart" mode="out-in">
      <div :key="store.timeRange" class="space-y-4">
        <!-- Loading state -->
        <div v-if="store.chartLoading" class="glass-card p-6 flex items-center justify-center h-64">
          <div class="flex gap-2 items-center text-nap-text-3 text-sm">
            <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            Loading chart data…
          </div>
        </div>

        <template v-else-if="chartData">
          <!-- Calls per day chart -->
          <div class="glass-card p-6 animate-tab-enter">
            <div class="flex justify-between items-center mb-4">
              <div>
                <div class="label-sm">Call Volume</div>
                <div class="text-[22px] font-black text-grad-primary">
                  {{ totalCalls.toLocaleString() }} calls
                </div>
              </div>
              <div class="text-right">
                <div class="text-[11px] text-nap-text-3">Avg / period</div>
                <div class="text-[18px] font-black text-nap-text">{{ avgCalls }}</div>
              </div>
            </div>
            <SvgBarChart :data="chartData" dataKey="calls" color="var(--c-purple)" :h="180" :delay="0" />
          </div>

          <!-- Duration chart -->
          <div class="glass-card p-6 animate-tab-enter" style="animation-delay:60ms">
            <div class="flex justify-between items-center mb-4">
              <div>
                <div class="label-sm">Avg Call Duration (min)</div>
                <div class="text-[22px] font-black text-grad-accent">
                  {{ avgDuration }} min
                </div>
              </div>
              <div class="text-right">
                <div class="text-[11px] text-nap-text-3">Peak</div>
                <div class="text-[18px] font-black text-nap-text">{{ peakDuration }} min</div>
              </div>
            </div>
            <SvgLineChart :data="chartData" dataKey="avg" color="var(--c-teal)" :h="160" :delay="80" />
          </div>

          <!-- 3-stat mini row -->
          <div class="grid grid-cols-3 gap-4">
            <div class="glass-card p-5 animate-tab-enter" style="animation-delay:100ms">
              <div class="label-sm">Completed</div>
              <div class="text-[28px] font-black text-grad-accent">{{ totalCompleted.toLocaleString() }}</div>
              <div class="text-[11px] text-nap-text-2 mt-1">calls answered</div>
            </div>
            <div class="glass-card p-5 animate-tab-enter" style="animation-delay:130ms">
              <div class="label-sm">Missed</div>
              <div class="text-[28px] font-black" style="color:#e05c5c">{{ totalMissed.toLocaleString() }}</div>
              <div class="text-[11px] text-nap-text-2 mt-1">calls missed</div>
            </div>
            <div class="glass-card p-5 animate-tab-enter" style="animation-delay:160ms">
              <div class="label-sm">Completion Rate</div>
              <div class="text-[28px] font-black text-grad-primary">{{ completionRate }}%</div>
              <div class="text-[11px] text-nap-text-2 mt-1">of all calls</div>
            </div>
          </div>
        </template>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { RANGE_LABELS } from '@/config/webhooks'
import SvgBarChart from '@/components/charts/SvgBarChart.vue'
import SvgLineChart from '@/components/charts/SvgLineChart.vue'

const store = useDashboardStore()
const chartData = computed(() => store.chartData)

function changeRange(i) {
  store.loadChartData(i)
}

const totalCalls = computed(() => chartData.value?.reduce((s, d) => s + (d.calls || 0), 0) ?? 0)
const avgCalls   = computed(() => chartData.value?.length ? (totalCalls.value / chartData.value.length).toFixed(1) : '—')
const avgDuration = computed(() => {
  if (!chartData.value?.length) return '—'
  const sum = chartData.value.reduce((s, d) => s + (parseFloat(d.avg) || 0), 0)
  return (sum / chartData.value.length).toFixed(1)
})
const peakDuration = computed(() => {
  if (!chartData.value?.length) return '—'
  return Math.max(...chartData.value.map(d => parseFloat(d.avg) || 0)).toFixed(1)
})
const totalCompleted = computed(() => chartData.value?.reduce((s, d) => s + (d.completed || 0), 0) ?? 0)
const totalMissed    = computed(() => chartData.value?.reduce((s, d) => s + (d.missed || 0), 0) ?? 0)
const completionRate = computed(() => {
  const total = totalCompleted.value + totalMissed.value
  return total ? ((totalCompleted.value / total) * 100).toFixed(1) : '—'
})
</script>

<style scoped>
.label-sm {
  font-size: 9.5px; font-weight: 800; letter-spacing: 1.8px;
  color: #8e82a0; margin-bottom: 8px; text-transform: uppercase;
}
.range-btn {
  padding: 5px 14px; border-radius: 8px; font-size: 12px; font-weight: 600;
  border: 1px solid var(--border-color); background: rgba(91,63,143,0.03);
  color: #8e82a0; cursor: pointer;
  transition: background .15s, color .15s, border-color .15s, transform .1s;
}
.range-btn:hover { background: rgba(91,63,143,0.07); color: #5b3f8f; }
.range-active {
  background: var(--grad-primary) !important;
  border-color: transparent !important;
  color: #fff !important;
  box-shadow: var(--shadow-purple);
}
</style>
