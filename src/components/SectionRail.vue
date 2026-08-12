<script setup>
import { computed } from 'vue'

const props = defineProps({
  sections: { type: Array, required: true },
  activeSection: { type: String, required: true },
  progress: { type: Number, default: 0 }
})

const emit = defineEmits(['navigate'])

const progressPercent = computed(() => {
  const normalized = Math.min(Math.max(props.progress, 0), 1)
  return `${Math.round(normalized * 100)}%`
})

const formatIndex = (index) => String(index + 1).padStart(2, '0')
</script>

<template>
  <nav
    class="section-rail"
    aria-label="首页章节导航"
    :style="{ '--rail-progress': progressPercent }"
  >
    <div class="rail-meter" aria-hidden="true">
      <span></span>
    </div>

    <div class="rail-items">
      <button
        v-for="(section, index) in sections"
        :key="section.id"
        class="rail-item"
        :class="{ active: section.id === activeSection }"
        type="button"
        :aria-current="section.id === activeSection ? 'true' : undefined"
        @click="emit('navigate', section.id)"
      >
        <span class="rail-index">{{ formatIndex(index) }}</span>
        <span class="rail-label">{{ section.label }}</span>
        <span class="rail-title">{{ section.title }}</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.section-rail {
  --rail-progress: 0%;
  position: fixed;
  left: max(24px, calc((100vw - 1660px) / 2));
  top: 124px;
  z-index: 40;
  display: grid;
  grid-template-columns: 2px 1fr;
  gap: 16px;
  width: 142px;
  color: var(--ink-2);
}

.rail-meter {
  position: relative;
  width: 2px;
  min-height: 262px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.12);
}

.rail-meter span {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: var(--rail-progress);
  background: var(--accent);
  transition: height 0.18s ease;
}

.rail-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rail-item {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 4px 8px;
  align-items: baseline;
  width: 100%;
  min-height: 44px;
  padding: 8px 0;
  border: 0;
  border-left: 2px solid transparent;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
  opacity: 0.52;
  transition: opacity 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.rail-item:hover,
.rail-item:focus-visible,
.rail-item.active {
  color: var(--ink-1);
  opacity: 1;
}

.rail-item.active {
  border-color: var(--accent);
}

.rail-item:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
}

.rail-index {
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 10px;
}

.rail-label {
  font-size: 11px;
  font-weight: 900;
  line-height: 1;
  text-transform: uppercase;
}

.rail-title {
  grid-column: 2;
  color: var(--ink-3);
  font-size: 11px;
  line-height: 1.15;
}

.rail-item.active .rail-title {
  color: var(--ink-2);
}

@media (max-width: 1760px) {
  .section-rail {
    position: sticky;
    top: 72px;
    z-index: 45;
    display: block;
    width: 100%;
    padding: 10px 16px;
    border-top: 1px solid var(--grid-line);
    border-bottom: 1px solid var(--grid-line);
    background: rgba(5, 5, 5, 0.9);
    backdrop-filter: blur(14px);
    overflow-x: auto;
    scrollbar-width: none;
  }

  .section-rail::-webkit-scrollbar {
    display: none;
  }

  .rail-meter {
    width: 100%;
    min-height: 2px;
    margin-bottom: 10px;
  }

  .rail-meter span {
    width: var(--rail-progress);
    height: 100%;
    transition: width 0.18s ease;
  }

  .rail-items {
    display: inline-flex;
    min-width: max-content;
    flex-direction: row;
    gap: 8px;
  }

  .rail-item {
    display: inline-flex;
    width: auto;
    min-height: 44px;
    align-items: center;
    gap: 8px;
    padding: 0 14px;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.06);
  }

  .rail-item.active {
    border-color: var(--accent);
    background: var(--accent-soft);
  }

  .rail-title {
    display: none;
  }
}

@media (max-width: 560px) {
  .section-rail {
    top: 64px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rail-meter span,
  .rail-item {
    transition: none;
  }
}
</style>
