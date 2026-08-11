<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { projects } from '../data/projects.js'
import SectionRail from '../components/SectionRail.vue'
import StatusTerminal from '../components/StatusTerminal.vue'
import ProjectPreviewCard from '../components/ProjectPreviewCard.vue'

const assetBase = '/template-assets/'

const sections = [
  { id: 'intro', label: 'Intro', title: '首屏' },
  { id: 'build', label: 'Build', title: '做什么' },
  { id: 'story', label: 'Story', title: '关于' },
  { id: 'work', label: 'Work', title: '作品' },
  { id: 'process', label: 'Process', title: '流程' },
  { id: 'contact', label: 'Contact', title: '联系' }
]

const statusItems = [
  {
    label: 'CURRENT BUILD',
    value: '03 PRODUCTS',
    detail: '正在维护 3 个产品，并持续把真实反馈同步回路线图。'
  },
  {
    label: 'STACK ONLINE',
    value: 'Vue 3 / SwiftUI / Flutter / Kotlin',
    detail: '前端、移动端和自动化工具链都服务于更低维护成本。'
  },
  {
    label: 'DATA MODE',
    value: 'LOCAL-FIRST',
    detail: '重要数据默认保留在用户手里，离线可用，隐私优先。'
  },
  {
    label: 'NEXT SHIP',
    value: 'PROJECT DETAILS',
    detail: '下一步继续补齐作品详情页里的真实截图、指标和复盘。'
  }
]

const capabilities = [
  {
    no: '/01',
    title: 'PRODUCT SYSTEMS',
    zh: '产品系统',
    desc: '把一个想法拆成可上线的 App：信息架构、交互路径、数据模型和发布节奏一起设计。',
    tags: ['Product Design', 'SwiftUI', 'Vue 3'],
    image: 'project-elasticwave.jpeg'
  },
  {
    no: '/02',
    title: 'LOCAL-FIRST APPS',
    zh: '本地优先',
    desc: '离线可用、数据私有、同步可控。让工具足够快，也足够让用户放心。',
    tags: ['Offline First', 'SwiftData', 'SQLDelight'],
    image: 'project-constellation.jpeg'
  },
  {
    no: '/03',
    title: 'AUTOMATION TOOLS',
    zh: '自动化工具',
    desc: '把重复流程变成脚本、仪表盘和轻量服务，让一个人也能维护更多产品。',
    tags: ['Node.js', 'Supabase', 'Workflow'],
    image: 'bento-graphic.png'
  },
  {
    no: '/04',
    title: 'WRITING & SHIPPING',
    zh: '记录与发布',
    desc: '持续公开记录产品决策、技术取舍和上线复盘，让项目不只停留在代码里。',
    tags: ['Build in Public', 'Docs', 'Growth'],
    image: 'cta-person.jpeg'
  }
]

const metrics = [
  { label: 'ACTIVE PRODUCTS', value: '03', desc: '持续维护的独立产品' },
  { label: 'BUILD CYCLE', value: '6w', desc: '从原型到可用版本的常见节奏' },
  { label: 'LOCAL DATA', value: '100%', desc: '默认把重要记录留在用户手里' },
  { label: 'STACK RANGE', value: '4+', desc: '移动端、前端、后端与自动化工具链' }
]

const processSteps = [
  {
    no: '[01]',
    title: 'DISCOVER',
    desc: '先定义一个真实问题，删掉不必要的范围。'
  },
  {
    no: '[02]',
    title: 'DESIGN',
    desc: '用最短路径画出核心流程，确认每一步都值得存在。'
  },
  {
    no: '[03]',
    title: 'BUILD',
    desc: '把可交互原型变成可发布产品，性能和数据安全同步处理。'
  },
  {
    no: '[04]',
    title: 'ITERATE',
    desc: '上线后继续跟踪反馈，把真实使用中的摩擦一点点磨平。'
  }
]

const projectImages = [
  'project-elasticwave.jpeg',
  'project-constellation.jpeg',
  'bento-graphic.png'
]

const tickerItems = [
  '一个人也能做完整产品',
  '离线优先',
  '快速原型',
  '长期维护',
  '从设计到上线',
  '自动化工作流'
]

const avatars = ['avatar-1.jpg', 'avatar-2.jpg', 'avatar-3.jpg']

const activeSection = ref(sections[0].id)
const scrollProgress = ref(0)
const heroVisual = ref(null)
let raf = null
let sectionObserver = null

const updateScrollProgress = () => {
  const doc = document.documentElement
  const scrollable = doc.scrollHeight - window.innerHeight
  scrollProgress.value = scrollable > 0
    ? Math.min(Math.max(window.scrollY / scrollable, 0), 1)
    : 0
}

const onScroll = () => {
  if (raf) return
  raf = requestAnimationFrame(() => {
    raf = null
    if (heroVisual.value) {
      const offset = Math.min(window.scrollY * -0.08, 0)
      heroVisual.value.style.setProperty('--hero-shift', `${offset}px`)
    }
    updateScrollProgress()
  })
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const getScrollOffset = () => {
  const navHeight = document.querySelector('.nav')?.getBoundingClientRect().height ?? 0
  const rail = document.querySelector('.section-rail')
  const railStyles = rail ? window.getComputedStyle(rail) : null
  const railHeight = railStyles?.position === 'sticky'
    ? rail.getBoundingClientRect().height
    : 0

  return navHeight + railHeight + 12
}

const navigateToSection = (id) => {
  const target = document.getElementById(id)
  if (!target) return
  const top = target.getBoundingClientRect().top + window.scrollY - getScrollOffset()

  window.scrollTo({
    top,
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
  })
}

onMounted(() => {
  if ('IntersectionObserver' in window) {
    sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top))

        if (visible[0]) activeSection.value = visible[0].target.id
      },
      {
        rootMargin: '-35% 0px -50% 0px',
        threshold: 0
      }
    )

    sections.forEach((section) => {
      const el = document.getElementById(section.id)
      if (el) sectionObserver.observe(el)
    })
  }

  updateScrollProgress()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  sectionObserver?.disconnect()
  if (raf) cancelAnimationFrame(raf)
})
</script>

<template>
  <SectionRail
    :sections="sections"
    :active-section="activeSection"
    :progress="scrollProgress"
    @navigate="navigateToSection"
  />

  <section id="intro" class="zel-hero">
    <div class="container hero-shell">
      <div class="hero-copy">
        <p class="eyebrow">Independent App Studio · 独立开发者</p>
        <h1 class="hero-title">
          <span>BUILT BY</span>
          <span class="marked">大笨钟,</span>
          <span>SHIPPED WITH</span>
          <span class="marked">CODE SYSTEMS</span>
        </h1>
        <p class="hero-sub">
          我把个人产品当成小型系统来做：从设计、代码、数据、自动化到上线维护，
          每一步都为了让工具更快、更稳、更少打扰。
        </p>
        <div class="hero-actions">
          <a href="#work" class="btn btn-primary" v-magnetic>查看作品 -></a>
          <RouterLink to="/about" class="btn btn-ghost" v-magnetic>了解我</RouterLink>
        </div>

        <div class="trust-row" v-reveal>
          <div class="avatar-stack" aria-hidden="true">
            <img v-for="avatar in avatars" :key="avatar" :src="assetBase + avatar" alt="" />
          </div>
          <div>
            <p class="stars">★★★★★</p>
            <p class="trust-copy">独立设计、开发并持续维护 3 个产品</p>
          </div>
        </div>
      </div>

      <div class="hero-visual" ref="heroVisual" v-reveal>
        <div class="hero-frame" v-tilt="7">
          <img
            class="hero-person"
            src="/template-assets/hero-ai.png"
            alt="AI 与人类协作的半机械人物"
          />
          <div class="hero-ring" aria-hidden="true"></div>
          <div class="hero-callout">HUMAN + CODE</div>
          <StatusTerminal :items="statusItems" class="hero-terminal" />
        </div>
      </div>
    </div>

    <div class="hero-wordmark" aria-hidden="true">大笨钟+</div>
  </section>

  <div class="signal-strip" aria-hidden="true">
    <div class="signal-track">
      <span v-for="(item, i) in [...tickerItems, ...tickerItems]" :key="i">
        <i></i>{{ item }}
      </span>
    </div>
  </div>

  <section id="build" class="section service-section">
    <div class="container section-split">
      <div>
        <p class="eyebrow" v-reveal>What I Build · 我在做什么</p>
        <h2 class="section-title mega-title" v-reveal>
          TURNING SMALL IDEAS INTO SHIPPED PRODUCTS
        </h2>
      </div>
      <p class="section-note" v-reveal>
        模板中的 AI 自动化服务列表，被转译成适合个人作品站的能力清单：
        每一项都对应从想法到上线的一个关键环节。
      </p>
    </div>

    <div class="container capability-list">
      <article
        v-for="item in capabilities"
        :key="item.no"
        class="capability-row"
        v-reveal
      >
        <div class="capability-copy">
          <span class="capability-no">{{ item.no }}</span>
          <div>
            <h3>{{ item.title }}</h3>
            <p class="capability-zh">{{ item.zh }}</p>
            <p class="capability-desc">{{ item.desc }}</p>
            <div class="capability-tags">
              <span v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>
        </div>
        <div class="capability-image corner-frame">
          <img :src="assetBase + item.image" :alt="item.zh" />
        </div>
      </article>
    </div>
  </section>

  <section id="story" class="light-section">
    <div class="container maker-grid">
      <aside class="maker-aside" v-reveal>
        <p class="eyebrow dark">Who I Am · 关于</p>
        <ul>
          <li>产品从真实需求开始</li>
          <li>技术栈服务于维护成本</li>
          <li>默认保护用户数据</li>
        </ul>
      </aside>

      <div class="maker-main">
        <h2 class="light-title" v-reveal>
          WE BUILD PRODUCTS THAT REMOVE FRICTION.
        </h2>
        <p class="light-sub" v-reveal>
          我不追求把页面做满，而是让每个 App 都有清晰的入口、稳定的数据和足够克制的交互。
        </p>

        <div class="founder-card" v-reveal>
          <div class="founder-photo">
            <img src="/template-assets/founder-portrait.jpeg" alt="模板中的人物照片" />
            <div>
              <strong>大笨钟</strong>
              <span>INDEPENDENT MAKER</span>
            </div>
          </div>
          <div class="quote-panel">
            <span class="quote-watermark">MAKER NOTE</span>
            <blockquote>
              “小产品真正难的地方，不是做出第一个版本，而是让它在长期维护中仍然清楚、快速、可信。”
            </blockquote>
          </div>
        </div>
      </div>
    </div>

    <div class="container metric-grid">
      <div v-for="metric in metrics" :key="metric.label" class="metric-card corner-frame" v-reveal>
        <span class="metric-label">{{ metric.label }}</span>
        <strong>{{ metric.value }}</strong>
        <p>{{ metric.desc }}</p>
      </div>
    </div>
  </section>

  <section id="work" class="section project-section">
    <div class="container section-split">
      <div>
        <p class="eyebrow" v-reveal>Real Work · 真实作品</p>
        <h2 class="section-title mega-title" v-reveal>REAL APPS. REAL ITERATION.</h2>
      </div>
      <RouterLink to="/about" class="btn btn-ghost section-button" v-magnetic>更多背景</RouterLink>
    </div>

    <div class="container project-grid">
      <ProjectPreviewCard
        v-for="(p, i) in projects"
        :key="p.id"
        :project="p"
        :image="projectImages[i % projectImages.length]"
        :asset-base="assetBase"
        v-reveal
      />
    </div>
  </section>

  <section id="process" class="process-section">
    <div class="container process-grid">
      <p class="eyebrow" v-reveal>Process · 流程</p>
      <div class="process-list">
        <article
          v-for="(step, i) in processSteps"
          :key="step.title"
          class="process-row"
          :class="{ active: i === 0 }"
          v-reveal
        >
          <div>
            <span>{{ step.no }}</span>
            <h3>{{ step.title }}</h3>
          </div>
          <p>{{ step.desc }}</p>
        </article>
      </div>
    </div>
  </section>

  <section id="contact" class="final-cta">
    <div class="cta-image">
      <img src="/template-assets/cta-person.jpeg" alt="模板中的行动召唤人物照片" />
    </div>
    <div class="container cta-content">
      <p class="review-line">★★★★★  欢迎反馈、合作或聊聊独立开发</p>
      <h2>IT'S TIME TO SHIP YOUR SMALL PRODUCT.</h2>
      <p>
        如果你也在做一个小产品，或者想讨论设计、前端、移动端与自动化工具，
        可以直接给我写邮件。
      </p>
      <div class="cta-actions">
        <a href="mailto:hello@example.com" class="btn cta-button" v-magnetic>hello@example.com</a>
        <a href="https://github.com" target="_blank" rel="noopener" class="btn cta-link" v-magnetic>GitHub</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.zel-hero {
  position: relative;
  min-height: 860px;
  overflow: hidden;
  border-bottom: 1px solid var(--grid-line);
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 340px 100%, 100% 290px;
}

.zel-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background: url("/template-assets/noise-texture.png") top center / cover no-repeat;
  opacity: 0.34;
  pointer-events: none;
}

.hero-shell {
  position: relative;
  z-index: 1;
  min-height: 800px;
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(500px, 1.08fr);
  align-items: center;
  gap: 48px;
  padding-top: 46px;
}

.hero-copy {
  max-width: 620px;
}

.hero-title {
  margin-top: 18px;
  font-size: 70px;
  line-height: 0.94;
  font-weight: 900;
  text-transform: uppercase;
}

.hero-title span {
  display: block;
}

.hero-title .marked {
  display: inline-block;
  color: var(--ink-1);
  text-decoration: underline;
  text-decoration-color: var(--accent);
  text-decoration-thickness: 7px;
  text-underline-offset: -3px;
  text-decoration-skip-ink: none;
}

.hero-sub {
  max-width: 560px;
  margin-top: 28px;
  color: var(--ink-2);
  font-size: 17px;
  line-height: 1.75;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 34px;
}

.trust-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 46px;
}

.avatar-stack {
  display: flex;
}

.avatar-stack img {
  width: 38px;
  height: 38px;
  object-fit: cover;
  border: 1px solid #0a0a0a;
  margin-left: -10px;
  filter: grayscale(1);
}

.avatar-stack img:first-child {
  margin-left: 0;
}

.stars {
  color: var(--accent);
  font-size: 14px;
  line-height: 1;
}

.trust-copy {
  margin-top: 4px;
  color: var(--ink-1);
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
}

.hero-visual {
  --hero-shift: 0px;
  position: relative;
  min-height: 690px;
  transform: translateY(var(--hero-shift));
  transition: transform 0.16s ease-out;
}

.hero-frame {
  position: absolute;
  inset: 0 -18px 0 0;
}

.hero-frame :deep(.tilt-body) {
  height: 100%;
}

.hero-person {
  position: absolute;
  right: -40px;
  bottom: -90px;
  width: min(760px, 58vw);
  max-width: none;
  filter: saturate(0.85) contrast(1.08);
  mix-blend-mode: lighten;
}

.hero-ring {
  position: absolute;
  right: 232px;
  bottom: 104px;
  width: 118px;
  height: 118px;
  border: 1px solid rgba(215, 255, 0, 0.7);
  animation: scanPulse 2.4s ease-in-out infinite;
}

.hero-callout {
  position: absolute;
  border: 1px solid var(--border-strong);
  background: rgba(27, 27, 27, 0.84);
  backdrop-filter: blur(12px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.32);
}

.hero-callout {
  right: 506px;
  bottom: 230px;
  padding: 7px 12px;
  color: #050505;
  background: var(--ink-1);
  font-size: 12px;
  font-weight: 900;
}

.hero-callout::after {
  content: "";
  position: absolute;
  top: -16px;
  right: -18px;
  width: 24px;
  height: 24px;
  background: var(--ink-1);
  clip-path: polygon(0 28%, 100% 0, 62% 100%);
}

.hero-terminal {
  position: absolute;
  right: 16px;
  top: 308px;
}

.hero-wordmark {
  position: absolute;
  left: -18px;
  bottom: -84px;
  color: rgba(255, 255, 255, 0.06);
  font-size: 220px;
  line-height: 0.8;
  font-weight: 900;
  pointer-events: none;
}

.signal-strip {
  position: relative;
  z-index: 2;
  overflow: hidden;
  border-top: 1px solid var(--grid-line);
  border-bottom: 1px solid var(--grid-line);
  background: #050505;
  white-space: nowrap;
}

.signal-track {
  display: inline-flex;
  min-width: 200%;
  animation: signalMove 30s linear infinite;
}

.signal-strip span {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 18px 24px;
  color: var(--ink-1);
  font-size: 13px;
  font-weight: 900;
  text-transform: uppercase;
}

.signal-strip i {
  width: 10px;
  height: 10px;
  border: 2px solid var(--accent);
}

.section {
  padding: 118px 0 0;
}

.section-split {
  display: grid;
  grid-template-columns: 1.35fr 0.65fr;
  gap: 56px;
  align-items: end;
}

.mega-title {
  max-width: 900px;
  text-transform: uppercase;
}

.section-note {
  color: var(--ink-2);
  font-size: 16px;
  line-height: 1.75;
}

.capability-list {
  margin-top: 70px;
  border-top: 1px solid var(--grid-line);
}

.capability-row {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 60px;
  align-items: center;
  padding: 46px 0;
  border-bottom: 1px solid var(--grid-line);
}

.capability-copy {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 18px;
}

.capability-no {
  color: var(--accent);
  font-size: 25px;
  font-weight: 900;
}

.capability-row h3 {
  max-width: 620px;
  color: var(--ink-1);
  font-size: 42px;
  line-height: 0.98;
  font-weight: 900;
  text-transform: uppercase;
}

.capability-zh {
  margin-top: 6px;
  color: var(--ink-1);
  font-weight: 800;
}

.capability-desc {
  max-width: 620px;
  margin-top: 14px;
  color: var(--ink-2);
  font-size: 15px;
}

.capability-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 24px;
}

.capability-image {
  height: 196px;
  overflow: hidden;
}

.capability-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(0.9) contrast(1.08);
  transition: transform 0.5s ease, filter 0.5s ease;
}

.capability-row:hover .capability-image img {
  transform: scale(1.06);
  filter: grayscale(0.2) contrast(1.12);
}

.light-section {
  margin-top: 126px;
  padding: 104px 0 116px;
  color: #050505;
  background:
    linear-gradient(90deg, rgba(5, 5, 5, 0.12) 1px, transparent 1px),
    linear-gradient(rgba(5, 5, 5, 0.1) 1px, transparent 1px),
    #f0f0ed;
  background-size: 340px 100%, 100% 280px;
}

.maker-grid {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 80px;
}

.maker-aside {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 520px;
}

.maker-aside ul {
  display: flex;
  flex-direction: column;
  gap: 12px;
  list-style: none;
}

.maker-aside li {
  color: #111;
  font-size: 13px;
  font-weight: 900;
  text-transform: uppercase;
}

.maker-aside li::before {
  content: "";
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 9px;
  border: 2px solid #050505;
}

.light-title {
  max-width: 820px;
  font-size: 58px;
  line-height: 0.98;
  font-weight: 900;
  text-transform: uppercase;
}

.light-sub {
  max-width: 560px;
  margin-top: 24px;
  color: #747474;
  font-size: 17px;
}

.founder-card {
  display: grid;
  grid-template-columns: 340px 1fr;
  margin-top: 64px;
  min-height: 380px;
}

.founder-photo {
  position: relative;
  overflow: hidden;
  background: #111;
}

.founder-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(0.8) contrast(1.05);
}

.founder-photo div {
  position: absolute;
  left: 20px;
  bottom: 20px;
  color: #fff;
}

.founder-photo strong,
.founder-photo span {
  display: block;
  font-size: 13px;
  font-weight: 900;
}

.founder-photo span {
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.8);
}

.quote-panel {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 380px;
  padding: 60px 84px;
  border: 1px solid rgba(5, 5, 5, 0.12);
  background: rgba(255, 255, 255, 0.64);
  overflow: hidden;
}

.quote-panel blockquote {
  position: relative;
  z-index: 1;
  max-width: 620px;
  font-size: 21px;
  line-height: 1.7;
  font-weight: 800;
}

.quote-watermark {
  position: absolute;
  left: -34px;
  top: 50%;
  transform: translateY(-50%) rotate(-90deg);
  color: rgba(5, 5, 5, 0.08);
  font-size: 58px;
  font-weight: 900;
  white-space: nowrap;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-top: 74px;
}

.metric-card {
  min-height: 202px;
  padding: 26px 24px;
  background: rgba(255, 255, 255, 0.28);
  border-color: rgba(5, 5, 5, 0.24);
}

.metric-label {
  display: block;
  font-size: 12px;
  font-weight: 900;
}

.metric-card strong {
  display: block;
  margin-top: 48px;
  font-size: 42px;
  line-height: 1;
  color: #050505;
}

.metric-card p {
  margin-top: 12px;
  color: #555;
  font-size: 14px;
}

.project-section {
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    #050505;
  background-size: 340px 100%;
}

.section-button {
  justify-self: end;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-top: 70px;
}

.process-section {
  padding: 120px 0;
  background: #050505;
}

.process-grid {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 80px;
}

.process-list {
  border-top: 1px solid var(--grid-line);
}

.process-row {
  display: grid;
  grid-template-columns: 1fr 0.78fr;
  gap: 56px;
  padding: 30px 20px;
  border-bottom: 1px solid var(--grid-line);
  color: rgba(255, 255, 255, 0.28);
  transition: color 0.3s, background 0.3s;
}

.process-row:hover,
.process-row.active {
  color: var(--ink-1);
  background: rgba(255, 255, 255, 0.025);
}

.process-row span {
  color: var(--accent);
  font-size: 13px;
  font-weight: 900;
}

.process-row h3 {
  display: inline;
  margin-left: 16px;
  font-size: 38px;
  line-height: 1;
  font-weight: 900;
}

.process-row p {
  color: currentColor;
  font-size: 15px;
}

.final-cta {
  position: relative;
  display: grid;
  grid-template-columns: 390px 1fr;
  min-height: 520px;
  background:
    linear-gradient(90deg, rgba(5, 5, 5, 0.16) 1px, transparent 1px),
    var(--accent);
  background-size: 340px 100%;
  color: #050505;
  overflow: hidden;
}

.cta-image {
  min-height: 520px;
  overflow: hidden;
}

.cta-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(0.6) contrast(1.05);
}

.cta-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 70px;
  padding-bottom: 70px;
}

.review-line {
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

.final-cta h2 {
  max-width: 760px;
  margin-top: 22px;
  font-size: 58px;
  line-height: 0.98;
  font-weight: 900;
  text-transform: uppercase;
}

.final-cta p:not(.review-line) {
  max-width: 610px;
  margin-top: 24px;
  color: rgba(5, 5, 5, 0.68);
  font-size: 16px;
  line-height: 1.75;
}

.cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 34px;
}

.cta-button {
  min-width: 276px;
  justify-content: center;
  border-color: rgba(5, 5, 5, 0.45);
  color: #050505;
}

.cta-link {
  border-color: rgba(5, 5, 5, 0.35);
  color: #050505;
}

@keyframes scanPulse {
  0%, 100% {
    opacity: 0.35;
    transform: scale(0.86);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.05);
  }
}

@keyframes signalMove {
  to { transform: translateX(-50%); }
}

@media (max-width: 1080px) {
  .zel-hero {
    min-height: auto;
  }

  .hero-shell,
  .section-split,
  .maker-grid,
  .process-grid {
    grid-template-columns: 1fr;
  }

  .hero-shell {
    gap: 10px;
    padding-top: 76px;
  }

  .hero-title {
    font-size: 56px;
  }

  .hero-visual {
    min-height: 620px;
  }

  .hero-frame {
    inset: 0;
  }

  .hero-person {
    right: 50%;
    transform: translateX(50%);
    width: min(720px, 96vw);
  }

  .hero-terminal {
    right: 22px;
    top: 292px;
  }

  .capability-row,
  .founder-card {
    grid-template-columns: 1fr;
  }

  .maker-aside {
    min-height: auto;
    gap: 38px;
  }

  .project-grid,
  .metric-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .final-cta {
    grid-template-columns: 1fr;
  }

  .cta-image {
    min-height: 360px;
  }
}

@media (max-width: 720px) {
  .hero-title {
    font-size: 40px;
  }

  .hero-sub {
    font-size: 15px;
  }

  .hero-visual {
    min-height: 520px;
  }

  .hero-callout,
  .hero-ring {
    display: none;
  }

  .hero-terminal {
    position: relative;
    top: auto;
    right: auto;
    width: min(100%, 360px);
    margin: 24px auto 0;
  }

  .hero-wordmark {
    font-size: 96px;
    bottom: -30px;
  }

  .section {
    padding-top: 82px;
  }

  .capability-row {
    gap: 28px;
  }

  .capability-copy {
    grid-template-columns: 1fr;
  }

  .capability-row h3,
  .process-row h3 {
    font-size: 30px;
  }

  .light-title,
  .final-cta h2 {
    font-size: 36px;
  }

  .quote-panel {
    min-height: auto;
    padding: 44px 24px;
  }

  .quote-panel blockquote {
    font-size: 18px;
  }

  .project-grid,
  .metric-grid {
    grid-template-columns: 1fr;
  }

  .process-row {
    grid-template-columns: 1fr;
    gap: 18px;
    padding: 26px 0;
  }
}
</style>
