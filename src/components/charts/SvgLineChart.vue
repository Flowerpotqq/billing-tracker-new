<template>
  <svg
    v-if="data && data.length"
    :viewBox="`0 0 ${w} ${h}`"
    :width="w" :height="h"
    style="width:100%;display:block;"
    :style="{ height: `${h}px` }"
  >
    <!-- Grid lines + Y labels -->
    <template v-for="(tick, ti) in yTicks" :key="ti">
      <line
        :x1="pad.l" :y1="tick.y"
        :x2="pad.l + cw" :y2="tick.y"
        stroke="rgba(91,63,143,0.12)" stroke-dasharray="3,3"
      />
      <text :x="pad.l - 6" :y="tick.y + 4" text-anchor="end" fill="var(--c-text-3, #8e82a0)" font-size="10">
        {{ tick.v }}
      </text>
    </template>

    <!-- X labels -->
    <text
      v-for="(d, i) in labelPoints"
      :key="`lx${i}`"
      :x="xs[d.i]" :y="pad.t + ch + 18"
      text-anchor="middle" fill="var(--c-text-3, #8e82a0)" font-size="10"
    >{{ d.label }}</text>

    <!-- Average reference line -->
    <line
      :x1="pad.l" :y1="avgY"
      :x2="pad.l + cw" :y2="avgY"
      stroke="rgba(194,120,0,0.4)"
      stroke-dasharray="5,4"
    />

    <!-- Line path — opacity-only animation (GPU compositor) -->
    <path
      :d="pathD"
      fill="none"
      :stroke="color"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="svg-fade"
      :style="{ animationDelay: `${delay}ms` }"
    />
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data:    { type: Array,  default: () => [] },
  dataKey: { type: String, default: 'avg' },
  color:   { type: String, default: '#00a88a' },
  w:       { type: Number, default: 800 },
  h:       { type: Number, default: 180 },
  delay:   { type: Number, default: 0 },
})

const pad = { t: 10, r: 10, b: 30, l: 50 }

const cw   = computed(() => props.w - pad.l - pad.r)
const ch   = computed(() => props.h - pad.t - pad.b)
const vals = computed(() => props.data.map(d => parseFloat(d[props.dataKey]) || 0))
const maxV = computed(() => Math.max(...vals.value) || 1)
const minV = computed(() => Math.min(...vals.value) || 0)
const rng  = computed(() => maxV.value - minV.value || 1)

const xs = computed(() =>
  props.data.map((_, i) => pad.l + i * (cw.value / (props.data.length - 1 || 1)))
)
const ys = computed(() =>
  vals.value.map(v => pad.t + ch.value - ((v - minV.value) / rng.value) * ch.value)
)

const pathD = computed(() =>
  xs.value.map((x, i) => (i === 0 ? `M${x},${ys.value[i]}` : `L${x},${ys.value[i]}`)).join(' ')
)

const avgVal = computed(() => vals.value.reduce((a, b) => a + b, 0) / (vals.value.length || 1))
const avgY   = computed(() => pad.t + ch.value - ((avgVal.value - minV.value) / rng.value) * ch.value)

const yTicks = computed(() =>
  [0, 0.25, 0.5, 0.75, 1].map(p => ({
    y: pad.t + ch.value - p * ch.value,
    v: (minV.value + rng.value * p).toFixed(1),
  }))
)

const step = computed(() => Math.max(1, Math.floor(props.data.length / 6)))
const labelPoints = computed(() =>
  props.data.map((d, i) => ({ i, label: d.label })).filter((_, i) => i % step.value === 0)
)
</script>
