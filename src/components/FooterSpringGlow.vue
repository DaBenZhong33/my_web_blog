<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  applyInputDelta,
  clamp01,
  createBreathProfile,
  decideSnapTarget
} from './footerSpringGlowMotion.js'

const props = defineProps({
  snapThreshold: { type: Number, default: 0.65 },
  settleDelay: { type: Number, default: 150 },
  bars: { type: Number, default: 9 },
  blur: { type: Number, default: 15 },
  peak: { type: Number, default: 0.98 },
  valley: { type: Number, default: 0.55 }
})

const VBW = 1271
const VBH = 599

const RUIXEN_STOPS = [
  { offset: 0, color: '#06140B' },
  { offset: 0.18, color: '#0358F7' },
  { offset: 0.32, color: '#6FA8FF' },
  { offset: 0.48, color: '#E1ECFE' },
  { offset: 0.6, color: '#F7FFE8' },
  { offset: 0.72, color: '#D7FF00' },
  { offset: 0.86, color: '#8DFF3D' },
  { offset: 1, color: '#D7FF0000' }
]

const revealRef = ref(null)
const revealHeight = ref(0)
const progress = ref(0)
const reducedMotion = ref(false)
const interactionState = ref('hidden')

const uid = `footer-spring-${Math.random().toString(36).slice(2)}`
const gradientId = `${uid}-gradient`
const blurId = `${uid}-blur`

let targetProgress = 0
let currentProgress = 0
let velocity = 0
let animationFrame = 0
let layoutFrame = 0
let wheelSettleTimer = 0
let lastTouchY = null
let touchActive = false
let motionQuery = null
let resizeObserver = null

const clampNumber = (value, min, max, fallback) => {
  const safeValue = Number.isFinite(value) ? value : fallback
  return Math.min(Math.max(safeValue, min), max)
}

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

const safeBars = computed(() => Math.round(clampNumber(props.bars, 1, 32, 9)))
const safePeak = computed(() => clampNumber(props.peak, 0, 1, 0.98))
const safeValley = computed(() => clamp01(props.valley, 0.55))
const safeBlur = computed(() => clampNumber(props.blur, 0, 40, 15))
const safeSnapThreshold = computed(() => clamp01(props.snapThreshold, 0.65))
const safeSettleDelay = computed(() => clampNumber(props.settleDelay, 80, 400, 150))
const isExpanded = computed(() => interactionState.value === 'expanded')
const barModels = computed(() => {
  const heights = bellHeights(safeBars.value, safePeak.value, safeValley.value)
  return heights.map((height, index) => ({
    height,
    breath: createBreathProfile(index)
  }))
})
const columnWidth = computed(() => VBW / safeBars.value)

const barStyle = (breath) => ({
  '--bar-breath-scale': breath.scale,
  '--bar-breath-duration': `${breath.duration}s`,
  '--bar-breath-delay': `${breath.delay}s`
})

const rootStyle = computed(() => {
  const safeProgress = clamp01(progress.value)
  const glowOpacity = safeProgress <= 0 ? 0 : Math.min(0.96, 0.08 + safeProgress * 0.88)
  const revealDistance = revealHeight.value
  const revealOffset = revealDistance * safeProgress

  return {
    '--footer-reveal-distance': `${revealDistance.toFixed(2)}px`,
    '--footer-reveal-offset': `${revealOffset.toFixed(2)}px`,
    '--footer-glow-opacity': glowOpacity.toFixed(4)
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
  const boundaryEpsilon = 0.001
  const force = (targetProgress - currentProgress) * stiffness

  velocity = (velocity + force) * damping
  renderProgress(currentProgress + velocity)
  if (currentProgress <= boundaryEpsilon && velocity < 0) {
    velocity = 0
    renderProgress(0)
  } else if (currentProgress >= 1 - boundaryEpsilon && velocity > 0) {
    velocity = 0
    renderProgress(1)
  }

  if (Math.abs(targetProgress - currentProgress) < 0.001 && Math.abs(velocity) < 0.001) {
    velocity = 0
    renderProgress(targetProgress)
    interactionState.value = targetProgress === 1 ? 'expanded' : 'hidden'
    animationFrame = 0
    return
  }

  animationFrame = requestAnimationFrame(stepSpring)
}

const startSpring = () => {
  if (animationFrame || reducedMotion.value) return
  animationFrame = requestAnimationFrame(stepSpring)
}

const isAtPageBottom = () => {
  const root = document.documentElement
  const remaining = root.scrollHeight - window.innerHeight - window.scrollY
  return remaining <= 2
}

const getInputTravel = () => {
  return Math.max(revealHeight.value, 1)
}

const updateRevealHeight = () => {
  revealHeight.value = revealRef.value?.getBoundingClientRect().height ?? 0
}

const settleInteraction = () => {
  const nextTarget = decideSnapTarget(currentProgress, safeSnapThreshold.value)
  targetProgress = nextTarget
  interactionState.value = nextTarget === 1 ? 'pulling' : 'collapsing'

  if (reducedMotion.value) {
    stopSpring()
    velocity = 0
    renderProgress(nextTarget)
    interactionState.value = nextTarget === 1 ? 'expanded' : 'hidden'
    return
  }

  startSpring()
}

const applyInteractionDelta = (delta) => {
  const previousProgress = currentProgress
  const nextProgress = applyInputDelta(previousProgress, delta, getInputTravel())
  if (nextProgress === previousProgress) return false

  stopSpring()
  velocity = 0
  targetProgress = nextProgress
  renderProgress(nextProgress)
  interactionState.value = nextProgress > previousProgress ? 'pulling' : 'collapsing'
  return true
}

const clearWheelSettleTimer = () => {
  if (!wheelSettleTimer) return
  window.clearTimeout(wheelSettleTimer)
  wheelSettleTimer = 0
}

const scheduleWheelSettle = () => {
  clearWheelSettleTimer()
  wheelSettleTimer = window.setTimeout(() => {
    wheelSettleTimer = 0
    settleInteraction()
  }, safeSettleDelay.value)
}

const handleWheel = (event) => {
  const canOpen = event.deltaY > 0 && isAtPageBottom()
  const canClose = event.deltaY < 0 && currentProgress > 0
  if (!canOpen && !canClose) return

  if (applyInteractionDelta(event.deltaY)) event.preventDefault()
  scheduleWheelSettle()
}

const handleTouchStart = (event) => {
  if (event.touches.length !== 1) {
    touchActive = false
    lastTouchY = null
    return
  }

  touchActive = isAtPageBottom() || currentProgress > 0
  lastTouchY = touchActive ? event.touches[0].clientY : null
}

const handleTouchMove = (event) => {
  if (!touchActive || event.touches.length !== 1 || lastTouchY === null) return

  const nextY = event.touches[0].clientY
  const delta = lastTouchY - nextY
  lastTouchY = nextY

  const canOpen = delta > 0 && isAtPageBottom()
  const canClose = delta < 0 && currentProgress > 0
  if ((canOpen || canClose) && applyInteractionDelta(delta)) event.preventDefault()
}

const handleTouchEnd = () => {
  if (touchActive) settleInteraction()
  touchActive = false
  lastTouchY = null
}

const measure = () => {
  if (!isAtPageBottom()) {
    targetProgress = 0
    velocity = 0
    stopSpring()
    renderProgress(0)
    interactionState.value = 'hidden'
  }
}

const handleMotionPreference = () => {
  reducedMotion.value = motionQuery.matches
  if (reducedMotion.value) settleInteraction()
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
  updateRevealHeight()
  layoutFrame = requestAnimationFrame(() => {
    layoutFrame = 0
    updateRevealHeight()
    measure()
  })
  window.addEventListener('load', measure, { once: true })
  window.addEventListener('scroll', measure, { passive: true })
  window.addEventListener('resize', measure, { passive: true })
  window.addEventListener('wheel', handleWheel, { passive: false })
  window.addEventListener('touchstart', handleTouchStart, { passive: true })
  window.addEventListener('touchmove', handleTouchMove, { passive: false })
  window.addEventListener('touchend', handleTouchEnd, { passive: true })
  window.addEventListener('touchcancel', handleTouchEnd, { passive: true })

  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(() => {
      updateRevealHeight()
      measure()
    })
    resizeObserver.observe(revealRef.value)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('load', measure)
  window.removeEventListener('scroll', measure)
  window.removeEventListener('resize', measure)
  window.removeEventListener('wheel', handleWheel)
  window.removeEventListener('touchstart', handleTouchStart)
  window.removeEventListener('touchmove', handleTouchMove)
  window.removeEventListener('touchend', handleTouchEnd)
  window.removeEventListener('touchcancel', handleTouchEnd)
  clearWheelSettleTimer()

  if (motionQuery) {
    if (motionQuery.removeEventListener) {
      motionQuery.removeEventListener('change', handleMotionPreference)
    } else {
      motionQuery.removeListener(handleMotionPreference)
    }
  }

  stopSpring()
  if (layoutFrame) {
    cancelAnimationFrame(layoutFrame)
    layoutFrame = 0
  }

  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})
</script>

<template>
  <div
    class="footer-spring-glow"
    :class="[
      `is-${interactionState}`,
      {
        'is-reduced-motion': reducedMotion
      }
    ]"
    :style="rootStyle"
  >
    <div class="footer-spring-glow__content">
      <slot />
    </div>

    <div
      ref="revealRef"
      class="footer-spring-glow__reveal"
      aria-hidden="true"
    >
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
            <feGaussianBlur :stdDeviation="safeBlur" />
          </filter>
        </defs>

        <g
          v-for="(bar, index) in barModels"
          :key="index"
          class="footer-spring-glow__bar"
          :class="{ 'is-breathing': isExpanded }"
          :style="barStyle(bar.breath)"
          :filter="`url(#${blurId})`"
        >
          <rect
            :x="index * columnWidth"
            :y="VBH - bar.height"
            :width="columnWidth * 1.23"
            :height="bar.height"
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
  z-index: 1;
}

.footer-spring-glow__content {
  position: relative;
  z-index: 3;
  transform: translate3d(0, calc(-1 * var(--footer-reveal-offset)), 0);
  will-change: transform;
}

.footer-spring-glow__reveal {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  height: min(58vh, 520px);
  overflow: hidden;
  pointer-events: none;
  opacity: var(--footer-glow-opacity);
  transform: translate3d(0, calc(100% - var(--footer-reveal-offset)), 0);
  will-change: transform, opacity;
  mix-blend-mode: screen;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    #050505;
  background-size: 340px 100%, 100% 220px;
}

.footer-spring-glow__svg {
  display: block;
  width: 100%;
  height: 100%;
}

.footer-spring-glow__bar {
  transform-box: fill-box;
  transform-origin: center bottom;
}

.footer-spring-glow__bar.is-breathing {
  animation: footerBarBreathe var(--bar-breath-duration) ease-in-out
    var(--bar-breath-delay) infinite alternate;
}

@keyframes footerBarBreathe {
  from { transform: scaleY(1); }
  to { transform: scaleY(var(--bar-breath-scale)); }
}

@media (max-width: 720px) {
  .footer-spring-glow__reveal {
    height: min(46vh, 360px);
    opacity: calc(var(--footer-glow-opacity) * 0.76);
    background-size: 220px 100%, 100% 180px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .footer-spring-glow__content,
  .footer-spring-glow__reveal {
    will-change: auto;
  }

  .footer-spring-glow__bar.is-breathing {
    animation: none;
    transform: none;
  }
}
</style>
