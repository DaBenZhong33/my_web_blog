<script setup>
import { computed } from 'vue'
import { useScrollProgress } from '../composables/useScrollProgress.js'

const { progress, scrollY } = useScrollProgress()

const RADIUS = 20
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const visible = computed(() => scrollY.value > window.innerHeight * 0.8)

const ringStyle = computed(() => ({
  strokeDasharray: CIRCUMFERENCE,
  strokeDashoffset: CIRCUMFERENCE * (1 - progress.value)
}))

const scrollToTop = () => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
}
</script>

<template>
  <button
    class="back-to-top"
    :class="{ visible }"
    type="button"
    aria-label="回到顶部"
    :tabindex="visible ? 0 : -1"
    @click="scrollToTop"
  >
    <svg class="ring" viewBox="0 0 48 48" aria-hidden="true">
      <circle class="ring-track" cx="24" cy="24" :r="RADIUS" />
      <circle class="ring-bar" cx="24" cy="24" :r="RADIUS" :style="ringStyle" />
    </svg>
    <span class="arrow" aria-hidden="true">↑</span>
  </button>
</template>

<style scoped>
.back-to-top {
  position: fixed;
  right: 28px;
  bottom: 28px;
  z-index: 45;
  width: 52px;
  height: 52px;
  border: 1px solid var(--border-strong);
  border-radius: 50%;
  background: rgba(16, 16, 16, 0.86);
  backdrop-filter: blur(12px);
  color: var(--ink-1);
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  transform: translateY(14px);
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    visibility 0.3s, color 0.2s, border-color 0.2s;
}

.back-to-top.visible {
  opacity: 1;
  visibility: visible;
  transform: none;
}

.back-to-top:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.back-to-top:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
}

.ring {
  position: absolute;
  inset: 2px;
  width: calc(100% - 4px);
  height: calc(100% - 4px);
  transform: rotate(-90deg);
}

.ring-track,
.ring-bar {
  fill: none;
  stroke-width: 2;
}

.ring-track {
  stroke: rgba(255, 255, 255, 0.14);
}

.ring-bar {
  stroke: var(--accent);
  stroke-linecap: round;
}

.arrow {
  position: relative;
  z-index: 1;
  font-size: 17px;
  line-height: 1;
}

@media (max-width: 720px) {
  .back-to-top {
    right: 18px;
    bottom: 18px;
    width: 46px;
    height: 46px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .back-to-top {
    transition: none;
  }
}
</style>
