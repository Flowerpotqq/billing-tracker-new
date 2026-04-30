<template>
  <header class="topbar">
    <!-- Left: hamburger + logo -->
    <div class="flex items-center gap-3">
      <button
        @click="store.toggleSidebar()"
        class="w-8 h-8 flex items-center justify-center rounded-lg text-nap-text-2
               hover:bg-purple/5 transition-colors duration-150 border-0 bg-transparent cursor-pointer"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <div class="logo-box">NAP</div>
      <span class="font-black text-base tracking-tight text-nap-text">
        NAP <span class="text-grad-accent">SOLUTIONS</span>
      </span>
    </div>

    <!-- Right: badges + user -->
    <div class="flex items-center gap-3">
      <div class="badge-live">
        <span class="dot-live"></span>
        AI LIVE
      </div>
      <div class="badge-plan">SCALE PLAN</div>
      <div class="text-right">
        <div class="text-sm font-bold text-nap-text">Dr. Anand Patel</div>
        <div class="text-[11px] text-nap-text-3">Complete Care Physiotherapy</div>
      </div>
      <div class="avatar">AP</div>
    </div>
  </header>
</template>

<script setup>
import { useDashboardStore } from '@/stores/dashboard'
const store = useDashboardStore()
</script>

<style scoped>
.topbar {
  height: 60px; min-height: 60px; z-index: 200;
  background: rgba(255,255,255,0.98);
  border-bottom: 1px solid var(--border-color);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px; backdrop-filter: blur(24px);
  box-shadow: 0 1px 0 var(--border-color), 0 4px 20px rgba(91,63,143,0.06);
}
.logo-box {
  width: 34px; height: 34px; border-radius: 10px;
  background: var(--grad-primary);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 900; font-size: 11px;
  box-shadow: var(--shadow-purple); flex-shrink: 0;
}
.badge-live {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 12px; border-radius: 20px;
  background: var(--ok-light); border: 1px solid var(--ok-border);
  font-size: 11px; font-weight: 700; color: var(--c-teal);
}
.dot-live {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--c-teal); box-shadow: 0 0 7px var(--c-teal);
  animation: pulse-glow 1.4s ease-in-out infinite;
}
.badge-plan {
  padding: 4px 12px; border-radius: 20px;
  background: var(--grad-primary);
  font-size: 11px; font-weight: 800; color: #fff;
  letter-spacing: .8px; box-shadow: var(--shadow-purple);
}
.avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--grad-accent);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 900; font-size: 13px;
  box-shadow: var(--shadow-glow);
}
</style>
