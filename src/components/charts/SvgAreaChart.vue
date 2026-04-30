<template>
  <svg
    v-if="data && data.length"
    :viewBox="`0 0 ${w} ${h}`"
    :width="w" :height="h"
    style="width:100%;display:block;"
    :style="{ height: `${h}px` }"
  >
    <defs>
      <linearGradient :id="gradId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   :stop-color="color" stop-opacity="0.28" />
        <stop offset="100%" :stop-color="color" stop-opacity="0.02" />
      </linearGradient>
    </defs>

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

    <!-- Fill area -->
    <path
      :d="fillD"
      :fill="`url(#${gradId})`"
      class="svg-fade"
      :style="{ animationDelay: `${delay}ms` }"
    />

    <!-- Line -->
    <path
      :d="lineD"
      fill="none"
      :stroke="color"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="svg-fade"
      :style="{ animationDelay: `${delay + 60}ms` }"
    />

    <!-- Dots -->
    <circle
      v-for="(x, i) in xs"
      :key="`dot${i}`"
      :cx="x" :cy="ys[i]"
      r="3.5"
      :fill="color"
      stroke="white"
      stroke-width="2"
      class="svg-fade"
      :style="{ animationDelay: `${delay + 80 + i * 15}ms` }"
    />
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data:  { type: Array,  default: () => [] },
  dataKey: { type: String, default: 'minutes' },
  color: { type: String, default: '#00a88a' },
  w:     { type: Number, default: 800 },
  h:     { type: Number, default: 300 },
  delay: { type: Number, default: 0 },
})

const gradId = `ag${Math.random().toString(36).slice(2, 7)}`

const pad = { t: 10, r: 10, b: 30, l: 50 }

const cw = computed(() => props.w - pad.l - pad.r)
const ch = computed(() => props.h - pad.t - pad.b)

const vals = computed(() => props.data.map(d => Number(d[props.dataKey]) || 0))
const maxV = computed(() => Math.max(...vals.value) || 1)

const xs = computed(() =>
  props.data.map((_, i) => pad.l + i * (cw.value / (props.data.length - 1 || 1)))
)
const ys = computed(() =>
  vals.value.map(v => pad.t + ch.value - (v / maxV.value) * ch.value)
)

const lineD = computed(() =>
  xs.value.map((x, i) => (i === 0 ? `M${x},${ys.value[i]}` : `L${x},${ys.value[i]}`)).join(' ')
)
const fillD = computed(() => {
  const last = xs.value.length - 1
  return lineD.value +
    ` L${xs.value[last]},${pad.t + ch.value} L${xs.value[0]},${pad.t + ch.value} Z`
})

const yTicks = computed(() =>
  [0, 0.25, 0.5, 0.75, 1].map(p => ({
    y: pad.t + ch.value - p * ch.value,
    v: Math.round(maxV.value * p),
  }))
)

const step = computed(() => Math.max(1, Math.floor(props.data.length / 6)))
const labelPoints = computed(() =>
  props.data
    .map((d, i) => ({ i, label: d.label }))
    .filter((_, i) => i % step.value === 0)
)
</script>
