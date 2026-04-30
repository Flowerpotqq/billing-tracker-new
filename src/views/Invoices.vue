<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-[24px] font-black tracking-tight mb-1">
        <span class="text-grad-primary">Invoices</span>
      </h2>
      <p class="text-sm text-nap-text-2">Your monthly billing history with NAP Solutions</p>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-3 gap-4 mb-5">
      <div class="glass-card p-5 animate-tab-enter">
        <div class="label-sm">Total Billed (YTD)</div>
        <div class="text-[28px] font-black text-grad-primary">{{ ytdTotal }}</div>
        <div class="text-[11px] text-nap-text-2 mt-1">Year to date</div>
      </div>
      <div class="glass-card p-5 animate-tab-enter" style="animation-delay:40ms">
        <div class="label-sm">Last Invoice</div>
        <div class="text-[28px] font-black text-grad-accent">{{ lastAmount }}</div>
        <div class="text-[11px] text-nap-text-2 mt-1">{{ lastDate }}</div>
      </div>
      <div class="glass-card p-5 animate-tab-enter" style="animation-delay:80ms">
        <div class="label-sm">Status</div>
        <div class="text-[28px] font-black text-grad-accent">All Paid</div>
        <div class="ok-chip mt-2.5">✓ No outstanding balance</div>
      </div>
    </div>

    <!-- Invoice table -->
    <div class="glass-card overflow-hidden animate-tab-enter" style="animation-delay:100ms">
      <table class="nap-table w-full">
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Period</th>
            <th>Minutes</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inv in invoices" :key="inv.id" class="hover:bg-purple-50/20 transition-colors">
            <td class="font-mono text-[12px] text-nap-text-2">{{ inv.id }}</td>
            <td class="font-semibold text-nap-text">{{ inv.period }}</td>
            <td>
              <span class="font-bold text-nap-text">{{ typeof inv.minutes === 'number' ? inv.minutes.toLocaleString() : (inv.minutes || '—') }}</span>
            </td>
            <td class="font-black text-nap-text text-[14px]">{{ inv.amount }}</td>
            <td>
              <span :class="['status-badge', (inv.status === 'paid' || inv.paid) ? 'status-paid' : 'status-pending']">
                {{ inv.status === 'paid' || inv.paid ? 'Paid' : 'Pending' }}
              </span>
            </td>
            <td class="text-nap-text-2 text-[12px]">{{ inv.date }}</td>
          </tr>
          <tr v-if="!invoices.length">
            <td colspan="6" class="text-center py-10 text-nap-text-3 text-sm">No invoices found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'

const store    = useDashboardStore()
const invoices = computed(() => store.invoices || [])

const ytdTotal  = computed(() => {
  const sum = invoices.value.reduce((s, inv) => s + parseFloat((inv.amount || '$0').replace(/[^0-9.]/g, '')), 0)
  return `$${sum.toFixed(2)}`
})
const lastInv   = computed(() => invoices.value[0] || null)
const lastAmount = computed(() => lastInv.value?.amount ?? '—')
const lastDate   = computed(() => lastInv.value?.date   ?? '—')
</script>

<style scoped>
.label-sm {
  font-size: 9.5px; font-weight: 800; letter-spacing: 1.8px;
  color: #8e82a0; margin-bottom: 12px; text-transform: uppercase;
}
.status-badge {
  font-size: 10.5px; font-weight: 700; padding: 2px 9px; border-radius: 6px;
}
.status-paid    { background: var(--ok-light); border: 1px solid var(--ok-border); color: var(--c-teal); }
.status-pending { background: var(--warn-light); border: 1px solid var(--warn-border); color: #c27800; }
.ok-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 10px; border-radius: 8px;
  background: var(--ok-light); border: 1px solid var(--ok-border);
  font-size: 11px; color: var(--c-teal); font-weight: 700;
}
</style>
