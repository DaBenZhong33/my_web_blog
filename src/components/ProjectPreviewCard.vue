<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import PhoneMockup from './PhoneMockup.vue'
import AppIcon from './AppIcon.vue'

defineProps({
  project: { type: Object, required: true },
  image: { type: String, required: true },
  assetBase: { type: String, default: '/template-assets/' }
})

const isPreviewOpen = ref(false)
const hasImageError = ref(false)
const spotlightStyle = ref({
  '--spotlight-x': '50%',
  '--spotlight-y': '42%'
})

const updateSpotlight = (event) => {
  const rect = event.currentTarget.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100

  spotlightStyle.value = {
    '--spotlight-x': `${Math.min(Math.max(x, 0), 100).toFixed(2)}%`,
    '--spotlight-y': `${Math.min(Math.max(y, 0), 100).toFixed(2)}%`
  }
}

const resetSpotlight = () => {
  spotlightStyle.value = {
    '--spotlight-x': '50%',
    '--spotlight-y': '42%'
  }
}

const openPreview = () => {
  isPreviewOpen.value = true
}

const closePreview = (event) => {
  if (event?.currentTarget?.contains(event.relatedTarget)) return
  isPreviewOpen.value = false
  resetSpotlight()
}
</script>

<template>
  <article
    class="project-preview-card corner-frame"
    :class="{ 'preview-open': isPreviewOpen }"
    :style="[{ '--tile-accent': project.accent }, spotlightStyle]"
    @mouseenter="openPreview"
    @mousemove="updateSpotlight"
    @mouseleave="closePreview"
    @focusin="openPreview"
    @focusout="closePreview"
  >
    <img
      v-if="!hasImageError"
      class="project-bg"
      :src="assetBase + image"
      :alt="project.name"
      @error="hasImageError = true"
    />
    <div
      v-else
      class="project-fallback"
      :style="{ background: `linear-gradient(160deg, ${project.gradient[0]}, ${project.gradient[1]})` }"
      aria-hidden="true"
    ></div>
    <div class="project-overlay" aria-hidden="true"></div>
    <span class="project-spotlight" aria-hidden="true"></span>
    <span class="project-comet" aria-hidden="true"></span>

    <div class="project-meta">
      <span>{{ project.platform }}</span>
      <span>{{ project.tech[0] }}</span>
      <span>2026</span>
    </div>

    <div class="project-phone" v-tilt="6">
      <PhoneMockup :gradient="project.gradient" :accent="project.accent" :label="project.screens[0]" />
    </div>

    <div
      :id="`preview-${project.id}`"
      class="preview-panel"
      :aria-hidden="!isPreviewOpen"
    >
      <p class="preview-kicker">QUICK PREVIEW</p>
      <p class="preview-desc">{{ project.description }}</p>

      <div class="preview-block">
        <span>CORE FEATURES</span>
        <ul>
          <li v-for="feature in project.features.slice(0, 3)" :key="feature">
            {{ feature }}
          </li>
        </ul>
      </div>

      <div class="preview-tags" aria-label="技术栈">
        <span v-for="tech in project.tech" :key="tech">{{ tech }}</span>
      </div>

      <div class="preview-screens" aria-label="截图标签">
        <span v-for="screen in project.screens" :key="screen">{{ screen }}</span>
      </div>

      <RouterLink class="preview-link" :to="`/project/${project.id}`">查看详情</RouterLink>
    </div>

    <div class="project-footer">
      <AppIcon :name="project.name" :accent="project.accent" :gradient="project.gradient" :size="50" />
      <div class="project-copy">
        <h3>{{ project.name }} <span>{{ project.nameEn }}</span></h3>
        <p>{{ project.slogan }}</p>
      </div>
      <div class="project-actions">
        <button
          class="preview-toggle"
          type="button"
          :aria-expanded="isPreviewOpen"
          :aria-controls="`preview-${project.id}`"
          @click="openPreview"
        >
          <span aria-hidden="true">+</span>
          预览
        </button>
        <RouterLink class="open-link" :to="`/project/${project.id}`">OPEN</RouterLink>
      </div>
    </div>
  </article>
</template>

<style scoped>
.project-preview-card {
  --spotlight-x: 50%;
  --spotlight-y: 42%;
  position: relative;
  isolation: isolate;
  min-height: 540px;
  overflow: hidden;
  background: #101010;
  color: var(--ink-1);
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.project-preview-card:hover,
.project-preview-card:focus-within,
.project-preview-card.preview-open {
  border-color: color-mix(in srgb, var(--tile-accent) 72%, var(--accent));
  box-shadow:
    0 0 0 1px rgba(215, 255, 0, 0.08),
    0 24px 70px rgba(0, 0, 0, 0.36);
}

.project-bg,
.project-fallback,
.project-overlay {
  position: absolute;
  inset: 0;
}

.project-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(0.7) brightness(0.72) contrast(1.12);
  transition: transform 0.65s ease, filter 0.65s ease;
}

.project-fallback {
  opacity: 0.76;
}

.project-overlay {
  background:
    linear-gradient(to top, rgba(5, 5, 5, 0.96), rgba(5, 5, 5, 0.12) 56%),
    radial-gradient(circle at 50% 42%, color-mix(in srgb, var(--tile-accent) 45%, transparent), transparent 34%);
}

.project-spotlight,
.project-comet {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.project-spotlight {
  background:
    radial-gradient(
      circle at var(--spotlight-x) var(--spotlight-y),
      color-mix(in srgb, var(--tile-accent) 42%, transparent) 0,
      rgba(215, 255, 0, 0.12) 16%,
      transparent 42%
    ),
    linear-gradient(
      135deg,
      transparent 0 42%,
      rgba(215, 255, 0, 0.16) 49%,
      transparent 56% 100%
    );
  mix-blend-mode: screen;
}

.project-comet {
  background:
    linear-gradient(
      115deg,
      transparent 0 30%,
      color-mix(in srgb, var(--tile-accent) 72%, transparent) 48%,
      transparent 62% 100%
    );
  transform: translateX(-120%);
}

.project-preview-card:hover .project-spotlight,
.project-preview-card:focus-within .project-spotlight,
.project-preview-card.preview-open .project-spotlight {
  opacity: 0.86;
}

.project-preview-card:hover .project-comet,
.project-preview-card:focus-within .project-comet,
.project-preview-card.preview-open .project-comet {
  opacity: 0.42;
  animation: cardComet 1.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.project-preview-card:hover .project-bg,
.project-preview-card:focus-within .project-bg {
  transform: scale(1.06);
  filter: grayscale(0.2) brightness(0.9) contrast(1.12);
}

.project-meta {
  position: relative;
  z-index: 2;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding: 20px;
  color: var(--ink-1);
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
}

.project-meta span:not(:last-child)::after {
  content: ".";
  margin-left: 10px;
  color: var(--tile-accent);
}

.project-phone {
  position: absolute;
  left: 50%;
  top: 47%;
  z-index: 2;
  transform: translate(-50%, -50%) scale(0.72);
}

.project-phone :deep(.tilt-body) {
  display: block;
}

.preview-panel {
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 112px;
  z-index: 4;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: calc(100% - 170px);
  padding: 18px;
  border: 1px solid rgba(215, 255, 0, 0.42);
  background: rgba(8, 8, 8, 0.92);
  box-shadow: 0 26px 60px rgba(0, 0, 0, 0.34);
  backdrop-filter: blur(14px);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateY(18px);
  transition: opacity 0.24s ease, transform 0.24s ease, visibility 0.24s ease;
}

.project-preview-card:hover .preview-panel,
.project-preview-card:focus-within .preview-panel,
.project-preview-card.preview-open .preview-panel {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: none;
}

.preview-kicker,
.preview-block span {
  color: var(--tile-accent);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.preview-desc {
  color: var(--ink-2);
  font-size: 13px;
  line-height: 1.6;
}

.preview-block ul {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 8px;
  list-style: none;
}

.preview-block li {
  position: relative;
  padding-left: 14px;
  color: var(--ink-2);
  font-size: 12px;
  line-height: 1.45;
}

.preview-block li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.6em;
  width: 6px;
  height: 6px;
  background: var(--tile-accent);
}

.preview-tags,
.preview-screens {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.preview-tags span,
.preview-screens span {
  min-height: 26px;
  padding: 5px 9px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--ink-2);
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
}

.preview-screens span {
  border-color: rgba(215, 255, 0, 0.2);
  color: var(--ink-1);
}

.preview-link {
  align-self: flex-start;
  color: var(--tile-accent);
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

.project-footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 14px;
  padding: 20px;
  background: rgba(26, 26, 26, 0.9);
  border-top: 1px solid var(--grid-line);
  backdrop-filter: blur(12px);
}

.project-copy {
  min-width: 0;
}

.project-footer h3 {
  font-size: 18px;
  line-height: 1.2;
}

.project-footer h3 span {
  display: block;
  color: var(--ink-3);
  font-size: 12px;
  text-transform: uppercase;
}

.project-footer p {
  margin-top: 4px;
  color: var(--ink-2);
  font-size: 13px;
}

.project-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.preview-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 0 10px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.06);
  color: var(--ink-1);
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}

.preview-toggle span {
  color: var(--tile-accent);
  font-size: 15px;
  line-height: 1;
}

.open-link {
  color: var(--tile-accent);
  font-size: 12px;
  font-weight: 900;
}

.preview-toggle:hover,
.open-link:hover {
  color: var(--ink-1);
}

.preview-toggle:focus-visible,
.open-link:focus-visible,
.preview-link:focus-visible {
  outline: 2px solid var(--tile-accent);
  outline-offset: 3px;
}

@keyframes cardComet {
  to {
    transform: translateX(120%);
  }
}

@media (max-width: 900px) {
  .project-footer {
    grid-template-columns: auto 1fr;
  }

  .project-actions {
    grid-column: 1 / -1;
    justify-content: space-between;
    width: 100%;
  }
}

@media (max-width: 720px) {
  .project-preview-card {
    min-height: 600px;
  }

  .project-meta {
    padding: 16px;
  }

  .project-phone {
    top: 40%;
    transform: translate(-50%, -50%) scale(0.62);
  }

  .preview-panel {
    left: 14px;
    right: 14px;
    bottom: 142px;
    max-height: calc(100% - 202px);
    overflow-y: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .project-bg,
  .preview-panel,
  .project-preview-card,
  .project-spotlight,
  .project-comet {
    transition: none;
  }

  .project-comet {
    animation: none;
  }
}
</style>
