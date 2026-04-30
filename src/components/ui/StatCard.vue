<template>
  <div class="glass-card p-5 relative overflow-hidden">
    <!-- Background glow -->
    <div
      class="absolute inset-0 opacity-[0.03] pointer-events-none"
      :style="{ background: gradient }"
    ></div>

    <div class="label-sm relative z-10">{{ label }}</div>

    <div
      class="text-[32px] font-black leading-none mb-1 relative z-10"
      :style="{ background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }"
    >
      <span v-if="animate && isNumber" ref="counter">{{ displayValue }}</span>
      <span v-else>{{ value }}</span>
    </div>

    <div class="text-[11.5px] text-nap-text-2 relative z-10">{{ sub }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
  label:    { type: String,  required: true },
  value:    { type: [String, Number], required: true },
  sub:      { type: String,  default: '' },
  gradient: { type: String,  default: 'var(--grad-primary)' },
  animate:  { type: Boolean, default: true },
})

const displayValue = ref(0)
const numericValue = computed(() => parseFloat(String(props.value).replace(/[^0-9.]/g, '')) || 0)
const isNumber = computed(() => !isNaN(parseFloat(String(props.value))))

function animateTo(target) {
  const start = Date.now()
  const duration = 900
  const from = 0
  function step() {
    const t = Math.min((Date.now() - start) / duration, 1)
    // easeOutExpo
    const ease = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
    const current = from + (target - from) * ease
    displayValue.value = Number.isInteger(target)
      ? Math.round(current).toLocaleString()
      : current.toFixed(1)
    if (t < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

onMounted(() => {
  if (props.animate && isNumber.value) {
    animateTo(numericValue.value)
  } else {
    displayValue.value = props.value
  }
})

watch(() => props.value, () => {
  if (props.animate && isNumber.value) animateTo(numericValue.value)
})
</script>

<style scoped>
.label-sm {
  font-size: 9.5px; font-weight: 800; letter-spacing: 1.8px;
  color: #8e82a0; margin-bottom: 12px; text-transform: uppercase;
}
</style>
