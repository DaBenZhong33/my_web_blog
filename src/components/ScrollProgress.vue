<script setup>
import { computed } from 'vue'
import { useScrollProgress } from '../composables/useScrollProgress.js'

const { progress } = useScrollProgress()

const barStyle = computed(() => ({
  transform: `scaleX(${progress.value})`
}))
</script>

<template>
  <div class="scroll-progress" aria-hidden="true">
    <span :style="barStyle"></span>
  </div>
</template>

<style scoped>
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 60;
  height: 2px;
  background: rgba(255, 255, 255, 0.06);
  pointer-events: none;
}

.scroll-progress span {
  display: block;
  height: 100%;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: 0 50%;
  will-change: transform;
}
</style>
