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
        <stop offset="0%"   :stop-color="color" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#5b3f8f" stop-opacity="0.5" />
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

    <!-- Bars -->
    <template v-for="(d, i) in data" :key="`bar${i}`">
      <rect
        :x="barX(i)"
        :y="barY(i)"
        :width="bw"
        :height="barH(i)"
        :fill="`url(#${gradId})`"
        rx="4"
        class="bar-rect"
        :style="{
          transformOrigin: `${barX(i) + bw / 2}px ${pad.t + ch}px`,
          animationDelay: `${delay + i * 18}ms`
        }"
      />
      <!-- X label -->
      <text
        v-if="i % step === 0"
        :x="barX(i) + bw / 2"
        :y="pad.t + ch + 18"
        text-anchor="middle"
        fill="var(--c-text-3, #8e82a0)"
        font-size="10"
      >{{ d.label }}</text>
    </template>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data:    { type: Array,  default: () => [] },
  dataKey: { type: String, default: 'calls' },
  color:   { type: String, default: '#4a86e8' },
  w:       { type: Number, default: 800 },
  h:       { type: Number, default: 260 },
  delay:   { type: Number, default: 0 },
})

const gradId = `bg${Math.random().toString(36).slice(2, 7)}`
const pad    = { t: 10, r: 10, b: 30, l: 50 }

const cw   = computed(() => props.w - pad.l - pad.r)
const ch   = computed(() => props.h - pad.t - pad.b)
const vals = computed(() => props.data.map(d => Number(d[props.dataKey]) || 0))
const maxV = computed(() => Math.max(...vals.value) || 1)
const gap  = computed(() => cw.value / (props.data.length || 1))
const bw   = computed(() => Math.max(3, gap.value * 0.65))
const step = computed(() => Math.max(1, Math.floor(props.data.length / 6)))

const yTicks = computed(() =>
  [0, 0.25, 0.5, 0.75, 1].map(p => ({
    y: pad.t + ch.value - p * ch.value,
    v: Math.round(maxV.value * p),
  }))
)

const barX = i => pad.l + i * gap.value + gap.value / 2 - bw.value / 2
const barH = i => Math.max(2, (vals.value[i] / maxV.value) * ch.value)
const barY = i => pad.t + ch.value - barH(i)
</script>
