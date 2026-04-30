<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-[24px] font-black tracking-tight mb-1">
        <span class="text-grad-accent">Contact &amp; Upgrade</span>
      </h2>
      <p class="text-sm text-nap-text-2">Get in touch with NAP Solutions or explore plan upgrades</p>
    </div>

    <div class="grid grid-cols-2 gap-5 mb-5">
      <!-- Contact card -->
      <div class="glass-card p-6 animate-tab-enter">
        <div class="label-sm">Contact Support</div>
        <div class="space-y-4 mt-2">
          <a v-for="c in contacts" :key="c.label"
            :href="c.href"
            class="contact-row group"
          >
            <div class="contact-icon" :style="{ background: c.bg }">
              <component :is="c.icon" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-[11px] text-nap-text-3 font-semibold">{{ c.label }}</div>
              <div class="text-[13px] font-bold text-nap-text group-hover:text-[var(--c-teal)] transition-colors truncate">
                {{ c.value }}
              </div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8e82a0" stroke-width="2" class="flex-shrink-0">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </a>
        </div>

        <!-- Business hours -->
        <div class="mt-5 pt-4 border-t border-[var(--border-color)]">
          <div class="label-sm mb-3">Business Hours</div>
          <div class="space-y-1.5">
            <div v-for="h in hours" :key="h.day" class="flex justify-between text-[12px]">
              <span class="text-nap-text-2">{{ h.day }}</span>
              <span class="font-semibold text-nap-text">{{ h.time }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Upgrade card -->
      <div class="animate-tab-enter" style="animation-delay:60ms">
        <div class="label-sm mb-4">Available Plans</div>
        <div class="space-y-3">
          <div
            v-for="plan in plans"
            :key="plan.name"
            :class="['plan-card glass-card p-4', plan.current ? 'plan-current' : '']"
          >
            <div class="flex justify-between items-start mb-2">
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-[15px] font-black text-nap-text">{{ plan.name }}</span>
                  <span v-if="plan.current" class="current-chip">Current</span>
                  <span v-if="plan.popular" class="popular-chip">Popular</span>
                </div>
                <div class="text-[11px] text-nap-text-2 mt-0.5">{{ plan.minutes }} min / month</div>
              </div>
              <div class="text-right">
                <div class="text-[20px] font-black text-grad-primary">${{ plan.price }}</div>
                <div class="text-[10px] text-nap-text-3">/ month</div>
              </div>
            </div>
            <div class="flex gap-1.5 flex-wrap mb-3">
              <span v-for="f in plan.features" :key="f"
                class="text-[10px] font-600 px-2 py-0.5 rounded-md"
                style="background:rgba(91,63,143,0.06);color:#5b3f8f;border:1px solid var(--border-color)"
              >{{ f }}</span>
            </div>
            <button
              v-if="!plan.current"
              class="upgrade-btn w-full"
            >Upgrade to {{ plan.name }}</button>
            <div v-else class="current-label">✓ Your current plan</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { h } from 'vue'

// Icon components
const IconPhone = { render: () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 },
  [h('path', { d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z' })]
) }
const IconMail = { render: () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 },
  [h('path', { d: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' }), h('polyline', { points: '22,6 12,13 2,6' })]
) }
const IconChat = { render: () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 },
  [h('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' })]
) }

const contacts = [
  { label: 'Phone',         value: '1-800-NAP-SOLS', href: 'tel:18006277657', icon: IconPhone, bg: 'rgba(74,134,232,0.1)' },
  { label: 'Email Support', value: 'support@napsolutions.com', href: 'mailto:support@napsolutions.com', icon: IconMail, bg: 'rgba(0,168,138,0.1)' },
  { label: 'Live Chat',     value: 'Start a live chat session', href: '#', icon: IconChat, bg: 'rgba(91,63,143,0.1)' },
]

const hours = [
  { day: 'Monday – Friday', time: '9:00 AM – 6:00 PM EST' },
  { day: 'Saturday',        time: '10:00 AM – 3:00 PM EST' },
  { day: 'Sunday',          time: 'Closed (AI still active!)' },
]

const plans = [
  {
    name: 'Growth',
    price: '1,200', minutes: '2,000',
    current: true,  popular: false,
    features: ['AI Receptionist', 'Transcripts', 'SMS follow-up', 'Analytics', 'Webhooks'],
  },
  {
    name: 'Scale',
    price: '2,100', minutes: '4,000',
    current: false, popular: true,
    features: ['Everything in Growth', 'Priority support', 'Advanced reporting'],
  },
  {
    name: 'Enterprise',
    price: '4,100', minutes: '8,000',
    current: false, popular: false,
    features: ['Everything in Scale', 'Custom AI training', 'Dedicated SLA'],
  },
]
</script>

<style scoped>
.label-sm {
  font-size: 9.5px; font-weight: 800; letter-spacing: 1.8px;
  color: #8e82a0; text-transform: uppercase;
}
.contact-row {
  display: flex; align-items: center; gap: 12px; padding: 10px 12px;
  border-radius: 10px; border: 1px solid var(--border-color);
  transition: border-color .15s, background .15s; text-decoration: none;
}
.contact-row:hover { border-color: var(--c-teal); background: rgba(0,168,138,0.03); }
.contact-icon {
  width: 36px; height: 36px; border-radius: 10px; display: flex;
  align-items: center; justify-content: center; flex-shrink: 0; color: var(--c-text);
}
.plan-card { border: 1px solid var(--border-color); transition: border-color .2s, box-shadow .2s; }
.plan-card:hover { border-color: rgba(91,63,143,0.3); }
.plan-current { border-color: var(--c-teal) !important; box-shadow: 0 0 0 2px rgba(0,168,138,0.15); }
.current-chip {
  font-size: 9.5px; font-weight: 800; padding: 2px 7px; border-radius: 5px;
  background: var(--ok-light); border: 1px solid var(--ok-border); color: var(--c-teal);
}
.popular-chip {
  font-size: 9.5px; font-weight: 800; padding: 2px 7px; border-radius: 5px;
  background: var(--grad-primary); color: #fff;
}
.upgrade-btn {
  padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700;
  background: var(--grad-primary); color: #fff; border: none; cursor: pointer;
  box-shadow: var(--shadow-purple);
  transition: opacity .15s, transform .1s;
}
.upgrade-btn:hover { opacity: 0.9; transform: translateY(-1px); }
.current-label {
  text-align: center; padding: 8px; font-size: 12px; font-weight: 700;
  color: var(--c-teal);
}
</style>
