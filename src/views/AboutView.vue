<script setup>
import { RouterLink } from 'vue-router'
import { projects } from '../data/projects.js'
import AppIcon from '../components/AppIcon.vue'

const skills = [
  'Swift / SwiftUI', 'Kotlin / Compose', 'Flutter', 'Vue / TypeScript',
  'Node.js', 'UI 设计', 'App Store 运营', '产品策划'
]

const timeline = [
  { year: '2021', text: '写下第一行独立产品代码，第一个 App 上架 3 天后下架——教训深刻。' },
  { year: '2022', text: '发布「拾光日记」，第一次收到陌生人的感谢邮件。' },
  { year: '2024', text: '「番茄岛」上线，游戏化专注玩法获得首批 1000 名用户。' },
  { year: '2025', text: '「一本账」发布，开始学习 Kotlin Multiplatform 跨端方案。' },
  { year: '2026', text: '继续打磨中——下一个产品正在酝酿。' }
]
</script>

<template>
  <!-- ===== 关于 Hero ===== -->
  <section class="a-hero container">
    <p class="eyebrow">About · 关于</p>
    <h1 class="a-title">你好，我是大笨钟。</h1>
    <p class="a-sub">
      一名独立开发者。我相信小团队甚至一个人也能做出被真实用户喜爱的产品。
      这里是我的数字自留地，记录我造的每一个轮子。
    </p>
  </section>

  <!-- ===== 时间线 ===== -->
  <section class="section container">
    <p class="eyebrow" v-reveal>Journey · 历程</p>
    <h2 class="section-title" v-reveal>独立开发这几年</h2>
    <div class="timeline">
      <div v-for="t in timeline" :key="t.year" class="tl-item" v-reveal>
        <span class="tl-year">{{ t.year }}</span>
        <span class="tl-dot"></span>
        <p class="tl-text">{{ t.text }}</p>
      </div>
    </div>
  </section>

  <!-- ===== 技能 ===== -->
  <section class="section container">
    <p class="eyebrow" v-reveal>Skills · 技能</p>
    <h2 class="section-title" v-reveal>工具箱里有什么</h2>
    <div class="skill-cloud" v-reveal>
      <span v-for="s in skills" :key="s" class="tag skill-tag">{{ s }}</span>
    </div>
  </section>

  <!-- ===== 作品速览 ===== -->
  <section class="section container">
    <p class="eyebrow" v-reveal>Apps · 作品</p>
    <h2 class="section-title" v-reveal>在维护的产品</h2>
    <div class="app-list">
      <RouterLink
        v-for="p in projects"
        :key="p.id"
        :to="`/project/${p.id}`"
        class="app-row card"
        v-reveal
      >
        <AppIcon :name="p.name" :accent="p.accent" :gradient="p.gradient" :size="48" />
        <div class="app-row-info">
          <h4>{{ p.name }} <span class="p-en">{{ p.nameEn }}</span></h4>
          <p>{{ p.description.slice(0, 42) }}…</p>
        </div>
        <span class="tag">{{ p.platform }}</span>
      </RouterLink>
    </div>
  </section>

  <!-- ===== 联系 ===== -->
  <section class="section container">
    <div class="contact card" v-reveal>
      <h2 class="section-title">找到我</h2>
      <p class="section-sub">邮件是最快的方式，一般 24 小时内回复。</p>
      <div class="contact-links">
        <a href="mailto:hello@example.com" class="btn btn-primary">hello@example.com</a>
        <a href="https://github.com" target="_blank" rel="noopener" class="btn btn-ghost">GitHub</a>
        <a href="#" class="btn btn-ghost">即刻 / 推特</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.a-hero {
  padding-top: 88px;
}

.a-title {
  font-size: clamp(36px, 5.5vw, 60px);
  font-weight: 800;
  letter-spacing: -0.03em;
  margin: 20px 0 16px;
}

.a-sub {
  color: var(--ink-2);
  font-size: 18px;
  max-width: 600px;
}

.section {
  padding-top: 96px;
}

/* ===== 时间线 ===== */
.timeline {
  margin-top: 44px;
  display: flex;
  flex-direction: column;
}

.tl-item {
  display: grid;
  grid-template-columns: 70px 20px 1fr;
  gap: 16px;
  align-items: baseline;
  padding: 18px 0;
  border-bottom: 1px solid var(--border);
}

.tl-item:last-child {
  border-bottom: none;
}

.tl-year {
  font-family: var(--font-mono);
  color: var(--accent);
  font-size: 15px;
}

.tl-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--accent);
  justify-self: center;
  transform: translateY(2px);
}

.tl-text {
  color: var(--ink-2);
  font-size: 15px;
}

/* ===== 技能 ===== */
.skill-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 36px;
}

.skill-tag {
  font-size: 13px;
  padding: 8px 18px;
}

/* ===== 作品行 ===== */
.app-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 36px;
}

.app-row {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18px 22px;
}

.app-row-info {
  flex: 1;
  min-width: 0;
}

.app-row-info h4 {
  font-size: 16px;
}

.p-en {
  color: var(--ink-3);
  font-size: 13px;
  font-weight: 500;
}

.app-row-info p {
  font-size: 13px;
  color: var(--ink-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ===== 联系 ===== */
.contact {
  padding: 64px 32px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.contact .section-sub {
  margin: 0 auto;
}

.contact-links {
  display: flex;
  gap: 14px;
  margin-top: 30px;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
