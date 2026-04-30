<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-[24px] font-black tracking-tight mb-1">
        <span class="text-grad-primary">My Plan</span>
      </h2>
      <p class="text-sm text-nap-text-2">Your current subscription details with NAP Solutions</p>
    </div>

    <!-- Current plan card -->
    <div class="plan-hero glass-card p-6 mb-5 animate-tab-enter relative overflow-hidden">
      <!-- Background orb -->
      <div class="plan-orb"></div>

      <div class="flex items-start justify-between relative z-10">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <div class="plan-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5">
                <polygon points="12 2 22 12 12 22 2 12"/>
              </svg>
            </div>
            <div>
              <div class="text-[11px] font-black uppercase tracking-widest text-nap-text-3">Active Plan</div>
              <div class="text-[26px] font-black text-grad-primary leading-tight">Growth Plan</div>
            </div>
          </div>
          <div class="text-[14px] text-nap-text-2 mb-4">
            Up to <strong class="text-nap-text">2,000 minutes</strong> per month · AI-powered receptionist
          </div>
          <div class="flex gap-2 flex-wrap">
            <span v-for="f in features" :key="f" class="feature-chip">✓ {{ f }}</span>
          </div>
        </div>
        <div class="text-right">
          <div class="text-[11px] text-nap-text-3 mb-1">Monthly Rate</div>
          <div class="text-[36px] font-black text-grad-primary leading-none">${{ planPrice }}</div>
          <div class="text-[11px] text-nap-text-3 mt-1">/ month</div>
        </div>
      </div>
    </div>

    <!-- Usage + billing period row -->
    <div class="grid grid-cols-2 gap-4 mb-5">
      <!-- Current usage -->
      <div class="glass-card p-5 animate-tab-enter" style="animation-delay:60ms">
        <div class="label-sm">Current Billing Period</div>
        <div class="text-[18px] font-black text-nap-text mb-3">March 2026</div>
        <div class="flex justify-between text-[12px] text-nap-text-2 mb-1.5">
          <span>{{ ov?.minutesUsed?.toLocaleString() ?? '—' }} min used</span>
          <span class="font-bold text-nap-text">{{ ov?.billingPct ?? 0 }}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: `${ov?.billingPct ?? 0}%` }">
            <div class="progress-shimmer"></div>
          </div>
        </div>
        <div class="text-[11px] text-nap-text-3 mt-2">
          {{ ov ? (ov.minutesIncluded - ov.minutesUsed).toLocaleString() : '—' }} minutes remaining
        </div>
      </div>

      <!-- Next invoice -->
      <div class="glass-card p-5 animate-tab-enter" style="animation-delay:80ms">
        <div class="label-sm">Next Invoice</div>
        <div class="text-[18px] font-black text-nap-text mb-1">April 1, 2026</div>
        <div class="text-[28px] font-black text-grad-primary">${{ planPrice }}</div>
        <div class="text-[11px] text-nap-text-2 mt-1">Base plan + any overage</div>
        <div class="ok-chip mt-3">✓ No overage projected</div>
      </div>
    </div>

    <!-- Plan details table -->
    <div class="glass-card p-6 animate-tab-enter" style="animation-delay:100ms">
      <div class="label-sm mb-4">Plan Details</div>
      <div class="space-y-3">
        <div v-for="row in planDetails" :key="row.label"
          class="flex justify-between items-center py-2.5 border-b border-[var(--border-color)] last:border-0">
          <span class="text-[13px] text-nap-text-2">{{ row.label }}</span>
          <span class="text-[13px] font-bold text-nap-text">{{ row.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'

const store = useDashboardStore()
const ov = computed(() => store.overview)

const planPrice = '1,200'

const features = [
  '24/7 AI Receptionist',
  'Live call handling',
  'Appointment booking',
  'SMS follow-up',
  'Transcription included',
]

const planDetails = [
  { label: 'Client',              value: 'Anand Patel — Complete Care Physiotherapy' },
  { label: 'Plan Name',           value: 'Growth Plan' },
  { label: 'Included Minutes',    value: '2,000 min / month' },
  { label: 'Overage Rate',        value: '$0.70 / min' },
  { label: 'Billing Cycle',       value: 'Monthly' },
  { label: 'Next Renewal',        value: 'April 1, 2026' },
  { label: 'Account Status',      value: 'Active ✓' },
]
</script>

<style scoped>
.label-sm {
  font-size: 9.5px; font-weight: 800; letter-spacing: 1.8px;
  color: #8e82a0; text-transform: uppercase;
}
.plan-hero { border: 1px solid rgba(91,63,143,0.2); }
.plan-orb {
  position: absolute; right: -60px; top: -60px;
  width: 200px; height: 200px; border-radius: 50%;
  background: var(--grad-primary); opacity: 0.06; pointer-events: none;
}
.plan-icon {
  width: 48px; height: 48px; border-radius: 14px;
  background: var(--grad-primary); display: flex; align-items: center;
  justify-content: center; box-shadow: var(--shadow-purple);
}
.feature-chip {
  font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 7px;
  background: rgba(91,63,143,0.06); border: 1px solid var(--border-color);
  color: #5b3f8f;
}
.progress-track {
  height: 8px; background: rgba(91,63,143,0.08); border-radius: 4px;
  overflow: visible; position: relative;
}
.progress-fill {
  height: 100%; border-radius: 4px; background: var(--grad-accent);
  box-shadow: 0 0 10px rgba(0,168,138,0.2); position: relative; overflow: hidden;
  transition: width 1.2s cubic-bezier(.4,0,.2,1);
}
.progress-shimmer {
  position: absolute; top: 0; left: -100%; width: 60%;
  height: 100%; background: linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent);
  animation: shimmer 2s ease infinite;
}
.ok-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 10px; border-radius: 8px;
  background: var(--ok-light); border: 1px solid var(--ok-border);
  font-size: 11px; color: var(--c-teal); font-weight: 700;
}
</style>
