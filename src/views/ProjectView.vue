<script setup>
import { computed, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { getProject, projects } from '../data/projects.js'
import PhoneMockup from '../components/PhoneMockup.vue'
import AppIcon from '../components/AppIcon.vue'

const route = useRoute()
const project = computed(() => getProject(route.params.id))
const others = computed(() => projects.filter((p) => p.id !== route.params.id))

const activeScreen = ref(0)
const screenshots = computed(() => project.value?.screenshots ?? [])
const screenOptions = computed(() => (
  screenshots.value.length
    ? screenshots.value
    : (project.value?.screens ?? []).map((label) => ({ label }))
))
const activeScreenshot = computed(() => (
  screenshots.value[activeScreen.value] ?? screenshots.value[0] ?? null
))
</script>

<template>
  <div v-if="project" :key="project.id">
    <!-- ===== 项目 Hero ===== -->
    <section class="p-hero">
      <div
        class="p-glow"
        :style="{ background: `radial-gradient(ellipse, ${project.accent}20, transparent 65%)` }"
      ></div>
      <div class="container p-hero-inner">
        <RouterLink to="/#work" class="back-link">← 全部作品</RouterLink>
        <div class="p-head">
          <AppIcon :name="project.name" :accent="project.accent" :gradient="project.gradient" :size="96" />
          <div>
            <p class="p-platform">{{ project.platform }}</p>
            <h1 class="p-name">
              {{ project.name }} <span class="p-en">{{ project.nameEn }}</span>
            </h1>
            <p class="p-slogan" :style="{ color: project.accent }">「{{ project.slogan }}」</p>
          </div>
        </div>
        <p class="p-desc">{{ project.description }}</p>
        <div class="p-actions">
          <a v-if="project.links.appstore" :href="project.links.appstore" class="btn btn-primary" v-magnetic>App Store 下载</a>
          <a v-if="project.links.googleplay" :href="project.links.googleplay" class="btn btn-primary" v-magnetic>Google Play 下载</a>
          <a v-if="project.links.github" :href="project.links.github" class="btn btn-ghost" v-magnetic>GitHub 源码</a>
        </div>
      </div>
    </section>

    <!-- ===== 截图展示 ===== -->
    <section class="section container">
      <p class="eyebrow" v-reveal>Screenshots · 界面</p>
      <h2 class="section-title" v-reveal>长这样。</h2>
      <p class="section-sub" v-reveal>真实界面截图，展示这个产品最重要的使用场景和交互路径。</p>

      <div class="screens" v-reveal>
        <div class="screens-stage" :class="{ 'has-capture': activeScreenshot }" v-tilt="10">
          <figure v-if="activeScreenshot" class="screen-capture">
            <img
              :src="activeScreenshot.src"
              :alt="activeScreenshot.alt"
              :width="activeScreenshot.width"
              :height="activeScreenshot.height"
              loading="lazy"
              decoding="async"
            />
            <figcaption>{{ activeScreenshot.label }}</figcaption>
          </figure>
          <PhoneMockup
            v-else
            :gradient="project.gradient"
            :accent="project.accent"
            :label="project.screens[activeScreen]"
          />
        </div>
        <div v-if="screenOptions.length > 1" class="screens-tabs">
          <button
            v-for="(s, i) in screenOptions"
            :key="s.label"
            class="screen-tab"
            :class="{ active: i === activeScreen }"
            :style="i === activeScreen ? { borderColor: project.accent, color: project.accent } : {}"
            @click="activeScreen = i"
          >
            {{ s.label }}
          </button>
        </div>
      </div>
    </section>

    <!-- ===== 开发背景 / 功能 ===== -->
    <section class="section container detail-grid">
      <div class="detail-main">
        <p class="eyebrow" v-reveal>Story · 背景</p>
        <h2 class="section-title" v-reveal>为什么做它</h2>
        <p class="detail-text" v-reveal>{{ project.background }}</p>

        <h3 class="detail-h3" v-reveal>踩过的坑</h3>
        <p class="detail-text" v-reveal>{{ project.challenges }}</p>
      </div>

      <aside class="detail-side" v-reveal>
        <div class="card side-card">
          <h4>核心功能</h4>
          <ul>
            <li v-for="f in project.features" :key="f">
              <span class="check" :style="{ color: project.accent }">✓</span>{{ f }}
            </li>
          </ul>
        </div>
        <div class="card side-card">
          <h4>技术栈</h4>
          <div class="project-tags">
            <span v-for="t in project.tech" :key="t" class="tag">{{ t }}</span>
          </div>
        </div>
      </aside>
    </section>

    <!-- ===== 其他项目 ===== -->
    <section class="section container">
      <p class="eyebrow" v-reveal>More · 更多作品</p>
      <div class="other-grid">
        <RouterLink
          v-for="p in others"
          :key="p.id"
          :to="`/project/${p.id}`"
          class="other-card card"
          v-reveal
        >
          <AppIcon :name="p.name" :accent="p.accent" :gradient="p.gradient" :size="52" />
          <div>
            <h4>{{ p.name }} <span class="p-en">{{ p.nameEn }}</span></h4>
            <p>{{ p.slogan }}</p>
          </div>
          <span class="other-arrow">→</span>
        </RouterLink>
      </div>
    </section>
  </div>

  <div v-else class="container section">
    <h2 class="section-title">项目不存在</h2>
    <RouterLink to="/" class="btn btn-ghost">返回首页</RouterLink>
  </div>
</template>

<style scoped>
.p-hero {
  position: relative;
  overflow: hidden;
  padding: 64px 0 24px;
}

.p-glow {
  position: absolute;
  top: -300px;
  left: 50%;
  transform: translateX(-50%);
  width: 900px;
  height: 600px;
  pointer-events: none;
}

.back-link {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding-right: 12px;
  color: var(--ink-3);
  font-size: 14px;
  margin-bottom: 28px;
  transition: color 0.2s;
}

.back-link:hover {
  color: var(--ink-1);
}

.p-head {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.p-platform {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink-3);
  letter-spacing: 0.08em;
}

.p-name {
  font-size: clamp(34px, 5vw, 52px);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.p-en {
  color: var(--ink-3);
  font-size: 0.55em;
  font-weight: 500;
}

.p-slogan {
  font-size: 17px;
  font-weight: 600;
  margin-top: 6px;
}

.p-desc {
  color: var(--ink-2);
  font-size: 17px;
  max-width: 620px;
  margin-top: 24px;
}

.p-actions {
  display: flex;
  gap: 14px;
  margin-top: 30px;
  flex-wrap: wrap;
}

.section {
  padding-top: 88px;
}

/* ===== 截图 ===== */
.screens {
  margin-top: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
}

.screens-stage {
  padding: 32px 0;
}

.screens-stage.has-capture {
  padding: 20px 0;
}

.screen-capture {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  max-width: min(100%, 420px);
  max-height: min(78vh, 860px);
  padding: 10px;
  border: 1px solid var(--border-strong);
  border-radius: 38px;
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 34px 80px rgba(0, 0, 0, 0.42);
}

.screen-capture img {
  display: block;
  width: auto;
  max-width: 100%;
  max-height: calc(min(78vh, 860px) - 56px);
  object-fit: contain;
  border-radius: 30px;
}

.screen-capture figcaption {
  margin-top: 10px;
  color: var(--ink-2);
  font-size: 13px;
  font-weight: 800;
}

.screens-tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.screen-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  font-family: var(--font-sans);
  font-size: 14px;
  padding: 8px 20px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--ink-2);
  cursor: pointer;
  transition: all 0.25s;
}

.screen-tab:hover {
  border-color: var(--ink-3);
  color: var(--ink-1);
}

/* ===== 详情 ===== */
.detail-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 48px;
  align-items: start;
}

@media (max-width: 860px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

.detail-text {
  color: var(--ink-2);
  font-size: 16px;
  margin-top: 12px;
}

.detail-h3 {
  font-size: 20px;
  margin-top: 40px;
  letter-spacing: -0.02em;
}

.detail-side {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 88px;
}

.side-card {
  padding: 26px;
}

.side-card h4 {
  font-size: 15px;
  margin-bottom: 16px;
  color: var(--ink-1);
}

.side-card ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.side-card li {
  font-size: 14px;
  color: var(--ink-2);
  display: flex;
  gap: 10px;
}

.check {
  font-weight: 700;
  flex: none;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* ===== 其他项目 ===== */
.other-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 32px;
}

.other-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px 24px;
}

.other-card h4 {
  font-size: 16px;
}

.other-card p {
  font-size: 13px;
  color: var(--ink-3);
  margin-top: 2px;
}

.other-arrow {
  margin-left: auto;
  color: var(--ink-3);
  transition: transform 0.25s, color 0.25s;
}

.other-card:hover .other-arrow {
  transform: translateX(4px);
  color: var(--accent);
}
</style>
