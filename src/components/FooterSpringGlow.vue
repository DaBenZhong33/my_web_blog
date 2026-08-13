<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  tailHeight: { type: String, default: '38vh' },
  mobileTailHeight: { type: String, default: '30vh' },
  minReveal: { type: Number, default: 0.035 },
  bars: { type: Number, default: 9 },
  blur: { type: Number, default: 15 },
  peak: { type: Number, default: 0.98 },
  valley: { type: Number, default: 0.55 }
})

const VBW = 1271
const VBH = 599

const RUIXEN_STOPS = [
  { offset: 0, color: '#340B05' },
  { offset: 0.1827, color: '#0358F7' },
  { offset: 0.2837, color: '#5092C7' },
  { offset: 0.4135, color: '#E1ECFE' },
  { offset: 0.5866, color: '#FFD400' },
  { offset: 0.6827, color: '#FA3D1D' },
  { offset: 0.8029, color: '#FD02F5' },
  { offset: 1, color: '#FFC0FD00' }
]

const tailRef = ref(null)
const progress = ref(0)
const reducedMotion = ref(false)

const uid = `footer-spring-${Math.random().toString(36).slice(2)}`
const gradientId = `${uid}-gradient`
const blurId = `${uid}-blur`

let targetProgress = 0
let currentProgress = 0
let velocity = 0
let animationFrame = 0
let motionQuery = null

const clamp01 = (value, fallback = 0) => {
  const safeValue = Number.isFinite(value) ? value : fallback
  return Math.min(Math.max(safeValue, 0), 1)
}
const toPositiveNumber = (value, fallback) => (
  Number.isFinite(value) && value > 0 ? value : fallback
)

const bellHeights = (n, peak, valley) => {
  const heights = []
  const mid = (n - 1) / 2

  for (let i = 0; i < n; i += 1) {
    const t = mid === 0 ? 0 : Math.abs(i - mid) / mid
    const eased = 1 - Math.pow(t, 1.24)
    heights.push(peak * VBH * (valley + (1 - valley) * eased))
  }

  return heights
}

const safeBars = computed(() => Math.max(1, Math.round(toPositiveNumber(props.bars, 9))))
const safePeak = computed(() => toPositiveNumber(props.peak, 0.98))
const safeValley = computed(() => clamp01(props.valley, 0.55))
const safeMinReveal = computed(() => clamp01(props.minReveal, 0.035))
const barHeights = computed(() => bellHeights(safeBars.value, safePeak.value, safeValley.value))
const columnWidth = computed(() => VBW / safeBars.value)

const rootStyle = computed(() => {
  const safeProgress = clamp01(progress.value)
  const glowOpacity = safeProgress <= 0 ? 0 : Math.min(0.96, 0.08 + safeProgress * 0.88)

  return {
    '--footer-tail-height': props.tailHeight,
    '--footer-tail-height-mobile': props.mobileTailHeight,
    '--footer-glow-progress': safeProgress.toFixed(4),
    '--footer-glow-opacity': glowOpacity.toFixed(4),
    '--footer-glow-lift': `${((1 - safeProgress) * 18).toFixed(2)}px`
  }
})

const renderProgress = (value) => {
  currentProgress = clamp01(value)
  progress.value = currentProgress
}

const stopSpring = () => {
  if (!animationFrame) return
  cancelAnimationFrame(animationFrame)
  animationFrame = 0
}

const stepSpring = () => {
  const stiffness = 0.18
  const damping = 0.72
  const force = (targetProgress - currentProgress) * stiffness

  velocity = (velocity + force) * damping
  renderProgress(currentProgress + velocity)

  if (Math.abs(targetProgress - currentProgress) < 0.001 && Math.abs(velocity) < 0.001) {
    velocity = 0
    renderProgress(targetProgress)
    animationFrame = 0
    return
  }

  animationFrame = requestAnimationFrame(stepSpring)
}

const startSpring = () => {
  if (animationFrame || reducedMotion.value) return
  animationFrame = requestAnimationFrame(stepSpring)
}

const measure = () => {
  if (!tailRef.value) return

  const rect = tailRef.value.getBoundingClientRect()
  const tailHeight = Math.max(rect.height, 1)
  const raw = (window.innerHeight - rect.top) / tailHeight
  const visibleProgress = clamp01(raw)

  targetProgress = visibleProgress <= 0
    ? 0
    : clamp01(safeMinReveal.value + (1 - safeMinReveal.value) * visibleProgress)

  if (reducedMotion.value) {
    stopSpring()
    velocity = 0
    renderProgress(targetProgress)
    return
  }

  startSpring()
}

const handleMotionPreference = () => {
  reducedMotion.value = motionQuery.matches
  measure()
}

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches

  if (motionQuery.addEventListener) {
    motionQuery.addEventListener('change', handleMotionPreference)
  } else {
    motionQuery.addListener(handleMotionPreference)
  }

  measure()
  requestAnimationFrame(measure)
  window.addEventListener('scroll', measure, { passive: true })
  window.addEventListener('resize', measure, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', measure)
  window.removeEventListener('resize', measure)

  if (motionQuery) {
    if (motionQuery.removeEventListener) {
      motionQuery.removeEventListener('change', handleMotionPreference)
    } else {
      motionQuery.removeListener(handleMotionPreference)
    }
  }

  stopSpring()
})
</script>

<template>
  <div
    ref="tailRef"
    class="footer-spring-glow"
    :class="{ 'is-reduced-motion': reducedMotion }"
    :style="rootStyle"
    aria-hidden="true"
  >
    <div class="footer-spring-glow__floor"></div>
    <div class="footer-spring-glow__band">
      <svg
        class="footer-spring-glow__svg"
        :viewBox="`0 0 ${VBW} ${VBH}`"
        preserveAspectRatio="none"
        focusable="false"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient :id="gradientId" x1="0" y1="1" x2="0" y2="0">
            <stop
              v-for="stop in RUIXEN_STOPS"
              :key="`${stop.offset}-${stop.color}`"
              :offset="stop.offset"
              :stop-color="stop.color"
            />
          </linearGradient>
          <filter :id="blurId" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur :stdDeviation="blur" />
          </filter>
        </defs>

        <g
          v-for="(barHeight, index) in barHeights"
          :key="index"
          :filter="`url(#${blurId})`"
        >
          <rect
            :x="index * columnWidth"
            :y="VBH - barHeight"
            :width="columnWidth * 1.23"
            :height="barHeight"
            :fill="`url(#${gradientId})`"
          />
        </g>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.footer-spring-glow {
  position: relative;
  min-height: var(--footer-tail-height);
  overflow: hidden;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    #050505;
  background-size: 340px 100%, 100% 220px;
}

.footer-spring-glow__floor {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(5, 5, 5, 0.88), rgba(5, 5, 5, 0.18) 46%, rgba(5, 5, 5, 0.94)),
    url("/template-assets/noise-texture.png") top center / cover no-repeat;
  opacity: 0.42;
  pointer-events: none;
}

.footer-spring-glow__band {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  height: min(58vh, 520px);
  pointer-events: none;
  opacity: var(--footer-glow-opacity);
  transform-origin: bottom;
  transform:
    translate3d(0, var(--footer-glow-lift), 0)
    scaleY(var(--footer-glow-progress));
  will-change: transform, opacity;
  mix-blend-mode: screen;
}

.footer-spring-glow__svg {
  display: block;
  width: 100%;
  height: 100%;
}

@media (max-width: 720px) {
  .footer-spring-glow {
    min-height: var(--footer-tail-height-mobile);
    background-size: 220px 100%, 100% 180px;
  }

  .footer-spring-glow__band {
    height: min(46vh, 360px);
    opacity: calc(var(--footer-glow-opacity) * 0.76);
  }
}

@media (prefers-reduced-motion: reduce) {
  .footer-spring-glow__band {
    transform:
      translate3d(0, var(--footer-glow-lift), 0)
      scaleY(var(--footer-glow-progress));
    will-change: auto;
  }
}
</style>
