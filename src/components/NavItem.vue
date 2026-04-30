<template>
  <div
    :class="['nav-item', { active }]"
    @click="store.loadTab(tab)"
  >
    <slot name="icon" />
    <span class="flex-1 whitespace-nowrap overflow-hidden">
      <slot />
    </span>
    <span v-if="badge" :class="['nav-badge', { 'active-badge': active }]">
      {{ badge }}
    </span>
    <span v-if="active" class="nav-indicator"></span>
  </div>
</template>

<script setup>
import { useDashboardStore } from '@/stores/dashboard'
const store = useDashboardStore()
defineProps({
  tab:    { type: String, required: true },
  active: { type: Boolean, default: false },
  badge:  { type: [String, Number], default: null },
})
</script>

<style scoped>
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: 10px; margin-bottom: 1px;
  font-size: 13px; font-weight: 500; color: #5a4d6e;
  cursor: pointer; border-left: 3px solid transparent;
  position: relative; white-space: nowrap;
  will-change: background, color;
  transition: background .16s ease, color .16s ease, border-left-color .16s ease;
}
.nav-item:hover { background: rgba(91,63,143,0.06); }
.nav-item.active {
  background: var(--nav-active);
  color: var(--c-teal);
  border-left-color: var(--c-teal);
  font-weight: 700;
}
.nav-badge {
  font-size: 9.5px; font-weight: 800;
  padding: 1px 7px; border-radius: 10px;
  background: rgba(91,63,143,0.07); color: #8e82a0;
  border: 1px solid var(--border-color);
  transition: background .16s, color .16s, border-color .16s;
}
.active-badge {
  background: var(--ok-light); color: var(--c-teal);
  border-color: var(--ok-border);
}
.nav-indicator {
  position: absolute; right: 0; top: 50%; transform: translateY(-50%);
  width: 3px; height: 24px; background: var(--c-teal);
  border-radius: 2px 0 0 2px; box-shadow: 0 0 8px var(--c-teal);
}
</style>
