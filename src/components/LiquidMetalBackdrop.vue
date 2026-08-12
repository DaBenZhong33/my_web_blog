<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import {
  ShaderMount,
  liquidMetalFragmentShader,
  LiquidMetalShapes,
  getShaderColorFromString
} from '@paper-design/shaders'

const canvasHost = ref(null)
const hasShader = ref(false)
const reducedMotion = ref(false)

let shader = null
let motionQuery = null

const getPerformanceSettings = () => {
  const width = window.innerWidth

  if (width < 720) {
    return {
      speed: 0,
      minPixelRatio: 1,
      maxPixelCount: 960 * 540
    }
  }

  if (width < 1080) {
    return {
      speed: 0.16,
      minPixelRatio: 1,
      maxPixelCount: 1280 * 720
    }
  }

  return {
    speed: 0.22,
    minPixelRatio: 1,
    maxPixelCount: 1600 * 900
  }
}

const supportsWebgl2 = () => {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2'))
  } catch {
    return false
  }
}

const destroyShader = () => {
  shader?.dispose?.()
  shader = null
  hasShader.value = false
}

const mountShader = () => {
  if (!canvasHost.value || reducedMotion.value || !supportsWebgl2()) {
    hasShader.value = false
    return
  }

  const { speed, minPixelRatio, maxPixelCount } = getPerformanceSettings()

  try {
    shader = new ShaderMount(
      canvasHost.value,
      liquidMetalFragmentShader,
      {
        u_isImage: false,
        u_image: undefined,
        u_imageAspectRatio: 1,
        u_shape: LiquidMetalShapes.none,
        u_colorBack: getShaderColorFromString('#050505'),
        u_colorTint: getShaderColorFromString('#d7ff00'),
        u_repetition: 2.35,
        u_softness: 0.42,
        u_distortion: 0.12,
        u_contour: 0.2,
        u_shiftRed: 0.06,
        u_shiftBlue: -0.06,
        u_angle: 116,
        u_fit: 2,
        u_scale: 1.18,
        u_rotation: 0,
        u_offsetX: 0.08,
        u_offsetY: -0.02,
        u_originX: 0.5,
        u_originY: 0.5,
        u_worldWidth: 0,
        u_worldHeight: 0
      },
      {
        alpha: true,
        antialias: true,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false
      },
      speed,
      0,
      minPixelRatio,
      maxPixelCount
    )

    hasShader.value = true
  } catch (error) {
    console.warn('LiquidMetalBackdrop failed to mount', error)
    destroyShader()
  }
}

const handleMotionPreference = () => {
  reducedMotion.value = motionQuery.matches
  destroyShader()
  mountShader()
}

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches

  if (motionQuery.addEventListener) {
    motionQuery.addEventListener('change', handleMotionPreference)
  } else {
    motionQuery.addListener(handleMotionPreference)
  }

  mountShader()
})

onBeforeUnmount(() => {
  if (motionQuery) {
    if (motionQuery.removeEventListener) {
      motionQuery.removeEventListener('change', handleMotionPreference)
    } else {
      motionQuery.removeListener(handleMotionPreference)
    }
  }

  destroyShader()
})
</script>

<template>
  <div
    class="liquid-metal-backdrop"
    :class="{ 'is-fallback': !hasShader || reducedMotion }"
    aria-hidden="true"
  >
    <div ref="canvasHost" class="liquid-metal-backdrop__canvas"></div>
    <div class="liquid-metal-backdrop__fallback"></div>
    <div class="liquid-metal-backdrop__veil"></div>
  </div>
</template>

<style scoped>
.liquid-metal-backdrop {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  opacity: 0.54;
  mix-blend-mode: screen;
}

.liquid-metal-backdrop__canvas,
.liquid-metal-backdrop__fallback,
.liquid-metal-backdrop__veil {
  position: absolute;
  inset: 0;
}

.liquid-metal-backdrop__canvas {
  z-index: 1;
}

.liquid-metal-backdrop__canvas :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}

.liquid-metal-backdrop__fallback {
  z-index: 0;
  background:
    radial-gradient(circle at 76% 32%, rgba(215, 255, 0, 0.18), transparent 28%),
    radial-gradient(circle at 42% 62%, rgba(210, 218, 206, 0.16), transparent 34%),
    linear-gradient(112deg, transparent 0 24%, rgba(255, 255, 255, 0.08) 37%, transparent 52% 100%),
    linear-gradient(145deg, rgba(8, 10, 10, 0.2), rgba(124, 132, 123, 0.14), rgba(5, 5, 5, 0.12));
  filter: blur(0.4px);
}

.liquid-metal-backdrop__veil {
  z-index: 2;
  background:
    linear-gradient(90deg, rgba(5, 5, 5, 0.9), rgba(5, 5, 5, 0.42) 48%, rgba(5, 5, 5, 0.7)),
    linear-gradient(180deg, rgba(5, 5, 5, 0.2), rgba(5, 5, 5, 0.78));
}

.liquid-metal-backdrop.is-fallback {
  opacity: 0.48;
  mix-blend-mode: normal;
}

.liquid-metal-backdrop.is-fallback .liquid-metal-backdrop__canvas {
  display: none;
}

@media (max-width: 720px) {
  .liquid-metal-backdrop {
    opacity: 0.38;
  }

  .liquid-metal-backdrop__veil {
    background:
      linear-gradient(180deg, rgba(5, 5, 5, 0.62), rgba(5, 5, 5, 0.86)),
      linear-gradient(90deg, rgba(5, 5, 5, 0.84), rgba(5, 5, 5, 0.54));
  }
}

@media (prefers-reduced-motion: reduce) {
  .liquid-metal-backdrop__canvas {
    display: none;
  }
}
</style>
