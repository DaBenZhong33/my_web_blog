<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  items: { type: Array, required: true }
})

const activeIndex = ref(0)
const activeItem = computed(() => props.items[activeIndex.value] ?? props.items[0])
</script>

<template>
  <div class="status-terminal corner-frame">
    <span class="terminal-scan" aria-hidden="true"></span>

    <div class="terminal-top">
      <span class="terminal-dot"></span>
      <span class="terminal-title">SYSTEM STATUS</span>
      <span class="terminal-code">ONLINE</span>
    </div>

    <div class="terminal-list">
      <button
        v-for="(item, index) in items"
        :key="item.label"
        class="terminal-row"
        :class="{ active: index === activeIndex }"
        type="button"
        :aria-pressed="index === activeIndex"
        @click="activeIndex = index"
      >
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </button>
    </div>

    <div v-if="activeItem" class="terminal-detail" aria-live="polite">
      <span>ACTIVE NOTE</span>
      <p>{{ activeItem.detail }}</p>
    </div>
  </div>
</template>

<style scoped>
.status-terminal {
  position: relative;
  width: min(100%, 382px);
  padding: 16px;
  overflow: hidden;
  background: rgba(8, 8, 8, 0.9);
  border-color: var(--border-strong);
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.38);
}

.terminal-scan {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    transparent,
    rgba(215, 255, 0, 0.08),
    transparent
  );
  transform: translateY(-100%);
  animation: terminalScan 4.8s linear infinite;
}

.terminal-top {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--grid-line);
  color: var(--ink-3);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
}

.terminal-dot {
  width: 9px;
  height: 9px;
  background: var(--accent);
  box-shadow: 0 0 18px rgba(215, 255, 0, 0.6);
}

.terminal-title {
  color: var(--ink-2);
}

.terminal-code {
  color: var(--accent);
}

.terminal-list {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 14px;
}

.terminal-row {
  display: grid;
  grid-template-columns: minmax(112px, 0.9fr) minmax(0, 1.1fr);
  gap: 10px;
  align-items: center;
  min-height: 42px;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: var(--ink-2);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
}

.terminal-row:hover,
.terminal-row:focus-visible,
.terminal-row.active {
  border-color: rgba(215, 255, 0, 0.58);
  background: rgba(215, 255, 0, 0.1);
  color: var(--ink-1);
}

.terminal-row:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.terminal-row span {
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 1.2;
  letter-spacing: 0.08em;
}

.terminal-row strong {
  color: inherit;
  font-size: 11px;
  line-height: 1.3;
  text-transform: uppercase;
}

.terminal-row.active strong {
  color: var(--accent);
}

.terminal-detail {
  position: relative;
  z-index: 1;
  margin-top: 14px;
  padding: 14px;
  border: 1px solid rgba(215, 255, 0, 0.32);
  background: rgba(215, 255, 0, 0.08);
}

.terminal-detail span {
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
}

.terminal-detail p {
  margin-top: 8px;
  color: var(--ink-2);
  font-size: 13px;
  line-height: 1.55;
}

@keyframes terminalScan {
  to {
    transform: translateY(100%);
  }
}

@media (max-width: 720px) {
  .status-terminal {
    width: 100%;
    padding: 14px;
  }

  .terminal-row {
    grid-template-columns: 1fr;
    gap: 3px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .terminal-scan {
    animation: none;
    opacity: 0.45;
  }

  .terminal-row {
    transition: none;
  }
}
</style>
