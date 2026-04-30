<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-[24px] font-black tracking-tight mb-1">
        <span class="text-grad-primary">Overage</span>
      </h2>
      <p class="text-sm" style="color:#8e82a0">
        Charges for minutes used beyond your 2,000 min plan limit · $0.70 / min
      </p>
    </div>

    <!-- Main card — always renders instantly, no loading state needed -->
    <div class="glass-card p-10 text-center">

      <!-- $ Over -->
      <div class="text-[11px] font-black uppercase tracking-widest mb-2"
        :style="{ color: hasOverage ? '#e05c5c' : 'var(--c-teal)' }">
        Amount Over
      </div>
      <div class="text-[76px] font-black leading-none mb-8"
        :style="{ color: hasOverage ? '#e05c5c' : 'var(--c-teal)' }">
        {{ dollarAmount }}
      </div>

      <!-- Divider -->
      <div style="height:1px;background:rgba(91,63,143,0.1);margin:0 auto 28px;max-width:320px;"></div>

      <!-- Minutes Over -->
      <div class="text-[11px] font-black uppercase tracking-widest mb-2" style="color:#8e82a0">
        Minutes Over
      </div>
      <div class="text-[48px] font-black leading-none" style="color:#8e82a0">
        {{ minutesOver }}
        <span class="text-[20px] font-semibold" style="color:#b0a8c0"> min</span>
      </div>

      <!-- Status pill -->
      <div class="mt-8 inline-flex items-center gap-2 px-5 py-2 rounded-full text-[12px] font-bold"
        :style="hasOverage
          ? 'background:rgba(224,92,92,0.1);border:1px solid rgba(224,92,92,0.3);color:#e05c5c'
          : 'background:var(--ok-light);border:1px solid var(--ok-border);color:var(--c-teal)'">
        <span v-if="!hasOverage">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </span>
        {{ hasOverage ? `$0.70 × ${minutesOver} min = ${dollarAmount}` : 'Within your 2,000 min plan — no overage' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'

const store = useDashboardStore()

const minutesOver = computed(() => store.overview?.overageMin ?? 0)

const dollarAmount = computed(() => {
  const usd = store.overview?.overageUSD ?? (minutesOver.value * 0.70)
  return `$${Number(usd).toFixed(2)}`
})

const hasOverage = computed(() => minutesOver.value > 0)
</script>
