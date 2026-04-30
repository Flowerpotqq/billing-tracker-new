<template>
  <div v-if="ov">
    <div class="mb-6">
      <h2 class="text-[24px] font-black tracking-tight mb-1">
        <span class="text-grad-accent">Usage Overview</span>
      </h2>
      <p class="text-sm text-nap-text-2">Real-time snapshot of your NAP Solutions plan - {{ ov.billingPeriod }}</p>
    </div>

    <div class="grid grid-cols-4 gap-4 mb-5">
      <StatCard
        v-for="(card, i) in statCards"
        :key="card.label"
        :label="card.label"
        :value="card.value"
        :sub="card.sub"
        :gradient="card.gradient"
        :animate="card.animate"
        :style="{ animationDelay: `${i * 40}ms` }"
        class="animate-tab-enter"
      />
    </div>

    <div class="glass-card p-6 mb-5 animate-tab-enter" style="animation-delay:80ms">
      <div class="flex justify-between items-center mb-2">
        <div class="label-sm">Plan Usage - {{ ov.billingPeriod }}</div>
        <span class="text-[13px] text-nap-text-2">{{ ov.minutesUsed.toLocaleString() }} / {{ ov.minutesIncluded.toLocaleString() }} min</span>
      </div>
      <div class="text-[32px] font-black text-grad-accent mb-3">{{ ov.billingPct }}%</div>
      <div class="progress-track">
        <div
          v-for="p in [25, 50, 75]"
          :key="p"
          class="absolute top-0 h-full w-px"
          :style="{ left: `${p}%`, background: 'rgba(91,63,143,0.12)' }"
        ></div>
        <div class="progress-fill" :style="{ width: `${ov.billingPct}%` }">
          <div class="progress-shimmer"></div>
        </div>
      </div>
      <div class="flex justify-between mt-2 text-[10.5px] text-nap-text-3">
        <span>0</span><span>1,000</span><span>2,000</span><span>3,000</span><span>4,000 min</span>
      </div>

      <div class="flex gap-2 mt-4 flex-wrap">
        <div
          v-for="(t, i) in milestones"
          :key="t"
          :class="['chip', ov.minutesUsed >= t ? 'chip-on' : 'chip-off']"
          :style="{ animationDelay: `${100 + i * 30}ms` }"
          class="animate-tab-enter"
        >
          <span class="chip-dot" :style="ov.minutesUsed >= t ? 'background:var(--c-teal);box-shadow:0 0 6px var(--c-teal)' : 'background:#8e82a0'"></span>
          {{ t.toLocaleString() }}
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <div class="glass-card p-5 animate-tab-enter" style="animation-delay:120ms">
        <div class="label-sm">Overage Surcharge</div>
        <div class="text-[32px] font-black text-nap-text-3">$0.00</div>
        <div class="text-[11.5px] text-nap-text-2 mt-1">Rate: $0.70/min over 4,000</div>
        <div class="ok-chip mt-2.5">✓ No overage active</div>
      </div>

      <div class="glass-card p-5 animate-tab-enter" style="animation-delay:150ms">
        <div class="label-sm">Avg Daily Usage</div>
        <div class="text-[32px] font-black text-grad-primary">{{ avgDailyUsageDisplay }}</div>
        <div class="text-[11.5px] text-nap-text-2 mt-1">
          {{ avgDailyUsageValue === null ? 'No usage data yet' : 'min / day this month' }}
        </div>
        <div v-if="avgDailyUsageValue !== null" class="mt-2.5 flex gap-1 items-end h-7">
          <div
            v-for="(h, i) in sparkBars"
            :key="i"
            :style="{
              flex: 1,
              height: `${h}px`,
              borderRadius: '2px 2px 0 0',
              background: i < 7 ? 'var(--grad-accent)' : 'rgba(91,63,143,0.1)',
              animationDelay: `${200 + i * 25}ms`,
              transformOrigin: 'center bottom',
            }"
            class="animate-bar-grow"
          ></div>
        </div>
      </div>

      <div class="glass-card p-5 animate-tab-enter" style="animation-delay:180ms">
        <div class="label-sm">Calls Today</div>
        <div class="text-[32px] font-black text-grad-blue">{{ ov.callsToday }}</div>
      </div>
    </div>
  </div>

  <div v-else class="flex items-center justify-center h-64 text-nap-text-3 text-sm">
    Loading...
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import StatCard from '@/components/ui/StatCard.vue'

const store = useDashboardStore()
const ov = computed(() => store.overview)

const milestones = [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000]
const sparkBars = [12, 20, 16, 26, 18, 24, 20, 28, 22]

const avgDailyUsageValue = computed(() => {
  if (!ov.value) return null

  const explicitDaily = Number(ov.value.avgDailyUsage ?? ov.value.avg_daily_usage)
  if (Number.isFinite(explicitDaily) && explicitDaily > 0) return explicitDaily

  const used = Number(ov.value.minutesUsed ?? 0)
  const dayOfMonth = new Date().getDate()

  if (!used || dayOfMonth <= 0) return null
  return used / dayOfMonth
})

const avgDailyUsageDisplay = computed(() => (
  avgDailyUsageValue.value === null ? '—' : avgDailyUsageValue.value.toFixed(1)
))

const statCards = computed(() => {
  if (!ov.value) return []

  return [
    {
      label: 'Minutes Used',
      value: ov.value.minutesUsed,
      animate: true,
      sub: `of ${ov.value.minutesIncluded.toLocaleString()} included`,
      gradient: 'var(--grad-primary)',
    },
    {
      label: 'Remaining',
      value: (ov.value.minutesIncluded - ov.value.minutesUsed).toFixed(1),
      animate: true,
      sub: `${(100 - ov.value.billingPct).toFixed(1)}% remaining`,
      gradient: 'var(--grad-accent)',
    },
    {
      label: 'Total Calls',
      value: ov.value.totalCalls,
      animate: true,
      sub: `avg ${ov.value.avgCallMin} min / call`,
      gradient: 'linear-gradient(135deg,#4a86e8,#7c5cbf)',
    },
    {
      label: 'Overage',
      value: '$0.00',
      animate: false,
      sub: 'Within plan limits ✓',
      gradient: 'var(--grad-accent)',
    },
  ]
})
</script>

<style scoped>
.label-sm {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 1.8px;
  color: #8e82a0;
  margin-bottom: 12px;
  text-transform: uppercase;
}

.progress-track {
  height: 10px;
  background: rgba(91,63,143,0.08);
  border-radius: 5px;
  overflow: visible;
  position: relative;
  margin-bottom: 7px;
}

.progress-fill {
  height: 100%;
  border-radius: 5px;
  background: var(--grad-accent);
  box-shadow: 0 0 12px rgba(0,168,138,0.25);
  position: relative;
  overflow: hidden;
  transition: width 1.2s cubic-bezier(.4,0,.2,1);
}

.chip {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 6px;
  transition: all .2s ease;
}

.chip-on { background: var(--ok-light); border: 1px solid var(--ok-border); color: var(--c-teal); }
.chip-off { background: rgba(91,63,143,0.05); border: 1px solid var(--border-color); color: #8e82a0; }
.chip-dot { width: 5px; height: 5px; border-radius: 50%; }

.ok-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  border-radius: 8px;
  background: var(--ok-light);
  border: 1px solid var(--ok-border);
  font-size: 11px;
  color: var(--c-teal);
  font-weight: 700;
}
</style>
