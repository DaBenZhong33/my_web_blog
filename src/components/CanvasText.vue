<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: { type: String, required: true },
  colors: { type: Array,
    default: () => [
      'rgba(215, 255, 0, 1)',
      'rgba(215, 255, 0, 0.9)',
      'rgba(215, 255, 0, 0.78)',
      'rgba(215, 255, 0, 0.6)',
      'rgba(215, 255, 0, 0.42)',
      'rgba(215, 255, 0, 0.24)',
      'rgba(215, 255, 0, 0.12)'
    ]
  },
  lineGap: { type: Number, default: 4 },
  animationDuration: { type: Number, default: 20 },
  backgroundClassName: { type: String, default: '' }
})

const layerCount = 10

const colorAt = (index) => (
  props.colors[index]
  ?? props.colors[props.colors.length - 1]
  ?? 'currentColor'
)

const textStyle = computed(() => {
  const styles = {
    '--canvas-line-gap': `${props.lineGap}px`,
    '--canvas-duration': `${props.animationDuration}s`
  }

  for (let i = 0; i < layerCount; i += 1) {
    styles[`--canvas-color-${i + 1}`] = colorAt(i)
  }

  return styles
})
</script>

<template>
  <span
    class="canvas-text"
    :class="backgroundClassName"
    :style="textStyle"
    :aria-label="text"
  >
    <span class="canvas-text__content">{{ text }}</span>
    <span class="canvas-text__line-layer canvas-text__line-layer--back" aria-hidden="true">{{ text }}</span>
    <span class="canvas-text__line-layer canvas-text__line-layer--front" aria-hidden="true">{{ text }}</span>
    <span class="canvas-text__streaks" aria-hidden="true"></span>
  </span>
</template>

<style scoped>
.canvas-text {
  position: relative;
  display: inline-block;
  color: var(--canvas-color-1);
  isolation: isolate;
  white-space: normal;
  text-shadow:
    0 0 1px var(--canvas-color-3),
    0 0 18px var(--canvas-color-6);
}

.canvas-text__content {
  position: relative;
  z-index: 2;
}

.canvas-text__line-layer,
.canvas-text__streaks {
  position: absolute;
  pointer-events: none;
}

.canvas-text__line-layer {
  inset: 0;
  z-index: 1;
  color: transparent;
  -webkit-text-stroke: 1px var(--canvas-color-4);
  clip-path: polygon(
    0 5%, 88% 5%, 88% 10%, 0 10%,
    0 18%, 100% 18%, 100% 23%, 0 23%,
    0 31%, 74% 31%, 74% 36%, 0 36%,
    0 44%, 96% 44%, 96% 49%, 0 49%,
    0 57%, 82% 57%, 82% 62%, 0 62%,
    0 70%, 100% 70%, 100% 75%, 0 75%,
    0 83%, 90% 83%, 90% 88%, 0 88%
  );
}

.canvas-text__line-layer--back {
  transform: translateX(-0.08em);
  animation: canvasTextGhost var(--canvas-duration) ease-in-out infinite;
}

.canvas-text__line-layer--front {
  z-index: 3;
  -webkit-text-stroke-color: var(--canvas-color-6);
  transform: translateX(0.1em);
  mix-blend-mode: screen;
  animation: canvasTextGhost var(--canvas-duration) ease-in-out infinite reverse;
}

.canvas-text__streaks {
  left: -0.04em;
  right: -0.14em;
  top: 0.06em;
  bottom: 0.04em;
  z-index: 0;
  background:
    linear-gradient(90deg, var(--canvas-color-1), transparent 72%) 0 10% / 92% 2px no-repeat,
    linear-gradient(90deg, var(--canvas-color-2), transparent 70%) 0 calc(10% + var(--canvas-line-gap) * 2) / 100% 2px no-repeat,
    linear-gradient(90deg, var(--canvas-color-3), transparent 70%) 0 36% / 78% 2px no-repeat,
    linear-gradient(90deg, var(--canvas-color-4), transparent 72%) 0 50% / 96% 2px no-repeat,
    linear-gradient(90deg, var(--canvas-color-5), transparent 72%) 0 64% / 86% 2px no-repeat,
    linear-gradient(90deg, var(--canvas-color-6), transparent 70%) 0 78% / 98% 2px no-repeat,
    linear-gradient(90deg, var(--canvas-color-7), transparent 68%) 0 90% / 74% 2px no-repeat;
  filter: drop-shadow(0 0 10px var(--canvas-color-6));
  animation: canvasTextSweep var(--canvas-duration) ease-in-out infinite;
}

@keyframes canvasTextSweep {
  0%, 100% {
    transform: translateX(-0.16em);
    opacity: 0.42;
  }

  48% {
    transform: translateX(0.1em);
    opacity: 0.96;
  }
}

@keyframes canvasTextGhost {
  0%, 100% {
    opacity: 0.18;
  }

  46% {
    opacity: 0.76;
  }
}

@media (prefers-reduced-motion: reduce) {
  .canvas-text {
    text-shadow: none;
  }

  .canvas-text__line-layer,
  .canvas-text__streaks {
    animation: none;
  }
}
</style>
