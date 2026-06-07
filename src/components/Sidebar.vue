<template>
  <aside
    :class="['sidebar', { 'collapsed': !store.sidebarOpen }]"
  >
    <!-- Navigation -->
    <div class="nav-section-label">Dashboard</div>
    <NavItem tab="overview"    :active="store.activeTab === 'overview'">
      <template #icon><IconGrid /></template>
      Overview
    </NavItem>
    <NavItem tab="analytics"   :active="store.activeTab === 'analytics'">
      <template #icon><IconActivity /></template>
      Analytics
    </NavItem>

    <div class="nav-section-label">Calls</div>
    <NavItem tab="calllog"     :active="store.activeTab === 'calllog'">
      <template #icon><IconPhone /></template>
      Call Logs
    </NavItem>
    <NavItem tab="transcripts" :active="store.activeTab === 'transcripts'">
      <template #icon><IconMessage /></template>
      Transcribed Calls
    </NavItem>

    <div class="nav-section-label">Outbound</div>
    <NavItem tab="makecall"    :active="store.activeTab === 'makecall'">
      <template #icon><IconOutbound /></template>
      Make a Call
    </NavItem>

    <div class="nav-section-label">Billing</div>
    <NavItem tab="invoices"    :active="store.activeTab === 'invoices'">
      <template #icon><IconFile /></template>
      Invoices
    </NavItem>
    <NavItem tab="overage"     :active="store.activeTab === 'overage'">
      <template #icon><IconAlert /></template>
      Overage Invoices
    </NavItem>

    <div class="nav-section-label">Account</div>
    <NavItem tab="plan"        :active="store.activeTab === 'plan'">
      <template #icon><IconDiamond /></template>
      My Plan
    </NavItem>
    <NavItem tab="contact"     :active="store.activeTab === 'contact'">
      <template #icon><IconChat /></template>
      Contact &amp; Upgrade
    </NavItem>

    <!-- Billing widget -->
    <div class="billing-widget">
      <div class="billing-inner">
        <div class="text-[10px] font-black mb-1" style="color:var(--c-teal)">BILLING CYCLE</div>
        <div class="flex justify-between items-center">
          <span class="text-[11px] text-nap-text-2">March 2026</span>
          <span class="text-[11px] font-bold" style="color:var(--c-teal)">71%</span>
        </div>
        <div class="billing-bar mt-1.5">
          <div class="billing-fill" style="width:71%"></div>
        </div>
      </div>
      <div class="text-[9.5px] text-center mt-3" style="color:var(--c-text-4,#bdb4cc)">
        Powered by
        <strong style="color:var(--c-purple-light)">NAP</strong>
        <strong style="color:var(--c-teal)"> Solutions</strong>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { useDashboardStore } from '@/stores/dashboard'
import NavItem from './NavItem.vue'

// Inline icon components
const IconGrid     = { template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>` }
const IconActivity = { template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>` }
const IconPhone    = { template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>` }
const IconMessage  = { template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="13" y2="14"/></svg>` }
const IconOutbound = { template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/><polyline points="14 3 21 3 21 10"/><line x1="21" y1="3" x2="14" y2="10"/></svg>` }
const IconFile     = { template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>` }
const IconAlert    = { template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>` }
const IconDiamond  = { template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 22 12 12 22 2 12"/></svg>` }
const IconChat     = { template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>` }

const store = useDashboardStore()
</script>

<style scoped>
.sidebar {
  width: 222px; min-width: 222px;
  background: rgba(255,255,255,0.97);
  border-right: 1px solid var(--border-color);
  display: flex; flex-direction: column;
  padding: 16px 8px; overflow-y: auto; overflow-x: hidden;
  backdrop-filter: blur(24px); z-index: 100;
  will-change: width;
  transition: width .28s cubic-bezier(.4,0,.2,1),
              min-width .28s cubic-bezier(.4,0,.2,1),
              padding .28s ease;
}
.sidebar.collapsed { width: 0; min-width: 0; padding: 0; }
.nav-section-label {
  font-size: 9px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;
  color: #bdb4cc; padding: 14px 12px 5px; user-select: none; white-space: nowrap;
}
.billing-widget { margin-top: auto; padding: 16px 12px; border-top: 1px solid var(--border-color); }
.billing-inner { padding: 12px 14px; border-radius: 10px; background: var(--ok-light); border: 1px solid var(--ok-border); }
.billing-bar { height: 3px; background: rgba(91,63,143,0.08); border-radius: 2px; overflow: hidden; }
.billing-fill {
  height: 100%; border-radius: 2px; background: var(--grad-accent);
  transition: width 1.2s cubic-bezier(.4,0,.2,1);
}
</style>
