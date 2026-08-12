<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { projects } from '../data/projects.js'
import SectionRail from '../components/SectionRail.vue'
import ProjectPreviewCard from '../components/ProjectPreviewCard.vue'
import HeroMetalCube from '../components/HeroMetalCube.vue'
import LiquidMetalBackdrop from '../components/LiquidMetalBackdrop.vue'
import CanvasText from '../components/CanvasText.vue'

const assetBase = '/template-assets/'

const canvasAccentColors = [
  'rgba(215, 255, 0, 1)',
  'rgba(215, 255, 0, 0.9)',
  'rgba(215, 255, 0, 0.78)',
  'rgba(215, 255, 0, 0.6)',
  'rgba(215, 255, 0, 0.42)',
  'rgba(215, 255, 0, 0.24)',
  'rgba(215, 255, 0, 0.12)'
]

const canvasInverseColors = [
  'rgba(5, 5, 5, 1)',
  'rgba(5, 5, 5, 0.86)',
  'rgba(5, 5, 5, 0.68)',
  'rgba(5, 5, 5, 0.5)',
  'rgba(5, 5, 5, 0.32)',
  'rgba(5, 5, 5, 0.18)',
  'rgba(5, 5, 5, 0.1)'
]

const sections = [
  { id: 'intro', label: 'Intro', title: '首屏' },
  { id: 'build', label: 'Build', title: '做什么' },
  { id: 'story', label: 'Story', title: '关于' },
  { id: 'work', label: 'Work', title: '作品' },
  { id: 'process', label: 'Process', title: '流程' },
  { id: 'contact', label: 'Contact', title: '联系' }
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

const tickerDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

const splitTickerValue = (value) => {
  const text = String(value)

  return text
    .split(/(\d+[%+]?)/g)
    .filter(Boolean)
    .map((part, index) => {
      const match = part.match(/^(\d+)([%+]?)$/)

      if (!match) {
        return {
          key: `${index}-${part}`,
          type: 'text',
          value: part
        }
      }

      return {
        key: `${index}-${part}`,
        type: 'number',
        value: match[1],
        suffix: match[2],
        digits: match[1].split('')
      }
    })
}

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

const activeSection = ref(sections[0].id)
const scrollProgress = ref(0)
const heroVisual = ref(null)
const bookWrap = ref(null)
const bookPageStyles = ref([])
let raf = null
let sectionObserver = null

const updateScrollProgress = () => {
  const doc = document.documentElement
  const scrollable = doc.scrollHeight - window.innerHeight
  scrollProgress.value = scrollable > 0
    ? Math.min(Math.max(window.scrollY / scrollable, 0), 1)
    : 0
}

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max)
const smoothStep = (value) => value * value * (3 - 2 * value)

const getBookPageStyle = (index, progress = 1) => {
  const safeProgress = clamp(progress)
  const eased = smoothStep(safeProgress)
  const fold = 1 - eased
  const delayed = smoothStep(clamp((safeProgress - 0.14) / 0.86))
  const curl = Math.sin(safeProgress * Math.PI)
  const paperLag = clamp(eased - delayed, 0, 0.34)
  const pageAppear = smoothStep(clamp((safeProgress - 0.04) / 0.2))
  const sideSway = (index % 2 === 0 ? -1 : 1) * curl
  const settle = smoothStep(clamp((safeProgress - 0.72) / 0.28))

  return {
    '--page-index': index,
    '--page-progress': eased.toFixed(3),
    '--page-fold': fold.toFixed(3),
    '--page-curl': curl.toFixed(3),
    '--page-lag': paperLag.toFixed(3),
    '--page-rotate': `${(72 * fold).toFixed(2)}deg`,
    '--page-sway': `${(0.5 * sideSway).toFixed(2)}deg`,
    '--page-y': `${(-26 * fold + 8 * curl).toFixed(1)}px`,
    '--page-scale': (0.99 + 0.01 * eased).toFixed(3),
    '--page-opacity': (0.08 + 0.92 * Math.max(eased, pageAppear * 0.68)).toFixed(3),
    '--page-lift': `${(22 * curl + 6 * paperLag).toFixed(1)}px`,
    '--page-bend': `${(4.4 * curl - 0.8 * fold).toFixed(2)}deg`,
    '--page-skew': `${(0.24 * sideSway).toFixed(2)}deg`,
    '--page-stretch': (1 + 0.006 * paperLag).toFixed(3),
    '--page-hinge-y': `${(-7 * fold - 4 * paperLag).toFixed(1)}px`,
    '--page-hinge-rotate': `${(-10 * fold + 4 * paperLag).toFixed(2)}deg`,
    '--page-hinge-opacity': (0.1 + 0.5 * fold + 0.22 * curl).toFixed(3),
    '--page-ripple-opacity': (0.06 + 0.24 * curl + 0.18 * paperLag).toFixed(3),
    '--page-tail-opacity': (0.08 + 0.3 * curl + 0.22 * paperLag).toFixed(3),
    '--page-tail-y': `${(5 * curl + 12 * paperLag).toFixed(1)}px`,
    '--page-tail-rotate': `${(5 * curl + 9 * paperLag - 2 * fold).toFixed(2)}deg`,
    '--page-edge-inset': `${(6 * curl + 8 * paperLag).toFixed(1)}px`,
    '--page-edge-opacity': (0.08 + 0.46 * curl + 0.2 * paperLag).toFixed(3),
    '--page-gloss-shift': `${(12 + 58 * safeProgress).toFixed(1)}%`,
    '--page-contact-opacity': (0.04 + 0.18 * curl + 0.1 * eased).toFixed(3),
    '--page-contact-y': `${(12 * fold + 5 * curl).toFixed(1)}px`,
    '--page-contact-scale': (0.82 + 0.12 * eased + 0.12 * curl).toFixed(3),
    '--page-shadow-alpha': (0.1 + 0.15 * eased + 0.12 * curl).toFixed(3),
    '--page-settle': settle.toFixed(3),
    '--page-z': String(40 - index)
  }
}

bookPageStyles.value = projects.map((_, index) => getBookPageStyle(index, 1))

const updateBookPages = () => {
  if (!bookWrap.value) return

  const pages = Array.from(bookWrap.value.querySelectorAll('.book-page-shell'))
  const enableFlip = window.matchMedia('(min-width: 1081px)').matches && !prefersReducedMotion()

  bookPageStyles.value = pages.map((page, index) => {
    if (!enableFlip) return getBookPageStyle(index, 1)

    const rect = page.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const startLine = viewportHeight * 0.85
    const travel = viewportHeight * 0.42
    const progress = clamp((startLine - rect.top) / travel)

    return getBookPageStyle(index, progress)
  })
}

const onResize = () => {
  updateBookPages()
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
    updateBookPages()
  })
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const getScrollOffset = () => {
  const navHeight = document.querySelector('.nav')?.getBoundingClientRect().height ?? 0

  return navHeight + 16
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
  updateBookPages()
  window.addEventListener('resize', onResize, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
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
    <LiquidMetalBackdrop class="hero-liquid-backdrop" />

    <div class="container hero-shell">
      <div class="hero-copy">
        <p class="eyebrow">Independent App Studio · 独立开发者</p>
        <h1 class="hero-title">
          <span>BUILT BY</span>
          <span>大笨钟,</span>
          <span>SHIPPED WITH</span>
          <span class="marked canvas-title-accent">
            <CanvasText
              text="CODE SYSTEMS"
              :colors="canvasAccentColors"
              :line-gap="4"
              :animation-duration="20"
            />
          </span>
        </h1>
        <p class="hero-sub">
          我把个人产品当成小型系统来做：从设计、代码、数据、自动化到上线维护，
          每一步都为了让工具更快、更稳、更少打扰。
        </p>
        <div class="hero-actions">
          <a href="#work" class="btn btn-primary" v-magnetic>查看作品 -></a>
          <RouterLink to="/about" class="btn btn-ghost" v-magnetic>了解我</RouterLink>
        </div>

      </div>

      <div class="hero-visual" ref="heroVisual" v-reveal>
        <div class="hero-frame">
          <HeroMetalCube class="hero-cube" />
        </div>
      </div>
    </div>

    <div class="hero-wordmark" aria-hidden="true">大笨钟+</div>
  </section>

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
        <strong class="metric-ticker" :aria-label="metric.value">
          <template v-for="part in splitTickerValue(metric.value)" :key="part.key">
            <span v-if="part.type === 'text'" aria-hidden="true">{{ part.value }}</span>
            <span v-else class="number-ticker" aria-hidden="true">
              <span
                v-for="(digit, digitIndex) in part.digits"
                :key="`${part.key}-${digitIndex}`"
                class="ticker-digit"
                :style="{
                  '--ticker-digit': Number(digit),
                  '--ticker-delay': `${digitIndex * 70}ms`
                }"
              >
                <span class="ticker-digit-strip">
                  <span v-for="rollDigit in tickerDigits" :key="rollDigit">{{ rollDigit }}</span>
                </span>
              </span>
              <span v-if="part.suffix" class="ticker-suffix">{{ part.suffix }}</span>
            </span>
          </template>
        </strong>
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

    <div class="container project-book-list" ref="bookWrap" aria-label="作品翻页列表">
      <div
        v-for="(p, i) in projects"
        :key="p.id"
        class="book-page-shell"
        :style="bookPageStyles[i]"
      >
        <span class="book-page-contact" aria-hidden="true"></span>
        <ProjectPreviewCard
          class="book-page-card"
          :project="p"
          :image="projectImages[i % projectImages.length]"
          :asset-base="assetBase"
        />
        <span class="book-page-hinge" aria-hidden="true"></span>
        <span class="book-page-ripple" aria-hidden="true"></span>
        <span class="book-page-tail" aria-hidden="true"></span>
        <span class="book-page-edge" aria-hidden="true"></span>
      </div>
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
      <h2>
        <span>IT'S TIME TO</span>
        <CanvasText
          class="canvas-title-inverse"
          text="SHIP"
          :colors="canvasInverseColors"
          :line-gap="4"
          :animation-duration="20"
        />
        <span>YOUR SMALL PRODUCT.</span>
      </h2>
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
#intro,
#build,
#story,
#work,
#process,
#contact {
  scroll-margin-top: 88px;
}

.zel-hero {
  position: relative;
  isolation: isolate;
  z-index: 3;
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
  z-index: 1;
  background: url("/template-assets/noise-texture.png") top center / cover no-repeat;
  opacity: 0.34;
  pointer-events: none;
}

.hero-liquid-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-shell {
  position: relative;
  z-index: 2;
  min-height: 800px;
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(500px, 1.08fr);
  align-items: center;
  gap: 48px;
  padding-top: 46px;
}

.hero-copy {
  position: relative;
  z-index: 2;
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
  text-decoration-thickness: 3px;
  text-underline-offset: 6px;
  text-decoration-skip-ink: none;
}

.canvas-title-accent {
  text-decoration: none;
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
  overflow: visible;
  pointer-events: none;
}

.hero-cube {
  position: absolute;
  right: -22px;
  bottom: -72px;
  width: min(760px, 58vw);
  aspect-ratio: 1;
  max-width: none;
  pointer-events: auto;
}

.hero-wordmark {
  position: absolute;
  left: -18px;
  bottom: -48px;
  z-index: 1;
  color: rgba(255, 255, 255, 0.035);
  font-size: 160px;
  line-height: 0.8;
  font-weight: 900;
  pointer-events: none;
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

.metric-ticker {
  display: flex;
  align-items: baseline;
}

.metric-card p {
  margin-top: 12px;
  color: #555;
  font-size: 14px;
}

.project-section {
  overflow: hidden;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    #050505;
  background-size: 340px 100%;
}

.section-button {
  justify-self: end;
}

/* ===== 作品区：纵向柔性翻书 ===== */
.project-book-list {
  max-width: 980px;
  margin-top: 48px;
  display: flex;
  flex-direction: column;
  gap: 44px;
  perspective: 1800px;
  perspective-origin: 50% 10%;
  transform-style: preserve-3d;
}

.book-page-shell {
  --page-rotate: 0deg;
  --page-sway: 0deg;
  --page-y: 0px;
  --page-scale: 1;
  --page-opacity: 1;
  --page-lift: 0px;
  --page-bend: 0deg;
  --page-skew: 0deg;
  --page-stretch: 1;
  --page-hinge-y: 0px;
  --page-hinge-rotate: 0deg;
  --page-hinge-opacity: 0;
  --page-ripple-opacity: 0;
  --page-tail-opacity: 0;
  --page-tail-y: 0px;
  --page-tail-rotate: 0deg;
  --page-edge-inset: 0px;
  --page-edge-opacity: 0;
  --page-gloss-shift: 50%;
  --page-contact-opacity: 0;
  --page-contact-y: 0px;
  --page-contact-scale: 1;
  --page-shadow-alpha: 0.28;
  position: relative;
  z-index: var(--page-z);
  transform-origin: top center;
  transform:
    translate3d(0, var(--page-y), 0)
    rotateX(var(--page-rotate))
    rotateZ(var(--page-sway))
    scale(var(--page-scale));
  transform-style: preserve-3d;
  backface-visibility: hidden;
  opacity: var(--page-opacity);
  filter: drop-shadow(0 28px 54px rgba(0, 0, 0, var(--page-shadow-alpha)));
  will-change: transform, opacity, filter;
}

.book-page-contact,
.book-page-hinge,
.book-page-ripple,
.book-page-tail,
.book-page-edge {
  position: absolute;
  border-radius: var(--radius-card);
  pointer-events: none;
}

.book-page-contact {
  left: 10%;
  right: 10%;
  bottom: -22px;
  z-index: 0;
  height: 26%;
  background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.64), transparent 68%);
  filter: blur(14px);
  opacity: var(--page-contact-opacity);
  transform-origin: center top;
  transform:
    translate3d(0, var(--page-contact-y), -84px)
    rotateX(68deg)
    scaleX(var(--page-contact-scale));
}

.book-page-hinge {
  inset: -10px 0 auto;
  z-index: 5;
  height: 96px;
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.28),
      rgba(255, 255, 255, 0.1) 28%,
      transparent 70%
    ),
    linear-gradient(
      90deg,
      transparent,
      rgba(215, 255, 0, 0.14) 46%,
      rgba(255, 255, 255, 0.2) 52%,
      transparent 70%
    );
  opacity: var(--page-hinge-opacity);
  transform-origin: top center;
  transform:
    translate3d(0, var(--page-hinge-y), 36px)
    rotateX(var(--page-hinge-rotate));
}

.book-page-ripple {
  inset: 0;
  z-index: 6;
  background:
    radial-gradient(
      ellipse at 50% var(--page-gloss-shift),
      rgba(255, 255, 255, 0.28),
      transparent 34%
    ),
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.08),
      transparent 24%,
      rgba(0, 0, 0, 0.14) 68%,
      rgba(255, 255, 255, 0.08) 86%,
      transparent 100%
    ),
    linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.05),
      transparent 18% 84%,
      rgba(0, 0, 0, 0.18)
    );
  mix-blend-mode: soft-light;
  opacity: var(--page-ripple-opacity);
  transform:
    translate3d(0, var(--page-tail-y), 38px)
    scaleY(var(--page-stretch));
}

.book-page-tail {
  left: 0;
  right: 0;
  bottom: -1px;
  z-index: 7;
  height: 22%;
  background:
    linear-gradient(
      180deg,
      transparent,
      rgba(0, 0, 0, 0.22) 54%,
      rgba(255, 255, 255, 0.12) 84%,
      rgba(0, 0, 0, 0.2)
    );
  mix-blend-mode: overlay;
  opacity: var(--page-tail-opacity);
  transform-origin: bottom center;
  transform:
    translate3d(0, var(--page-tail-y), 42px)
    rotateX(var(--page-tail-rotate));
}

.book-page-edge {
  left: 6%;
  right: 6%;
  bottom: calc(-2px + var(--page-edge-inset));
  z-index: 8;
  height: 5px;
  border-radius: 999px;
  background:
    radial-gradient(ellipse at 50% 0, rgba(255, 255, 255, 0.28), transparent 72%),
    linear-gradient(90deg, transparent, rgba(215, 255, 0, 0.16), transparent);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.32);
  opacity: var(--page-edge-opacity);
  transform-origin: bottom center;
  transform:
    translate3d(0, var(--page-tail-y), 48px)
    rotateX(var(--page-tail-rotate));
}

.book-page-card {
  position: relative;
  z-index: 2;
  transform-origin: top center;
  transform:
    translateZ(var(--page-lift))
    rotateX(var(--page-bend))
    skewX(var(--page-skew))
    scaleY(var(--page-stretch));
  transition: box-shadow 0.18s ease, border-color 0.18s ease;
  will-change: transform;
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

.final-cta h2 span,
.final-cta h2 :deep(.canvas-title-inverse) {
  display: block;
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
  --btn-border-base: rgba(5, 5, 5, 0.45);
  --btn-shimmer: rgba(5, 5, 5, 0.78);
  min-width: 276px;
  justify-content: center;
  border-color: rgba(5, 5, 5, 0.45);
  color: #050505;
}

.cta-link {
  --btn-border-base: rgba(5, 5, 5, 0.35);
  --btn-shimmer: rgba(5, 5, 5, 0.72);
  border-color: rgba(5, 5, 5, 0.35);
  color: #050505;
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

  .hero-cube {
    right: 50%;
    bottom: -72px;
    transform: translateX(50%);
    width: min(720px, 96vw);
  }

  .capability-row,
  .founder-card {
    grid-template-columns: 1fr;
  }

  .maker-aside {
    min-height: auto;
    gap: 38px;
  }

  .metric-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .project-book-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    max-width: 1360px;
    gap: 18px;
    margin-top: 42px;
    perspective: none;
    transform-style: flat;
  }

  .book-page-shell,
  .book-page-card {
    transform: none !important;
    opacity: 1 !important;
    filter: none;
  }

  .book-page-contact,
  .book-page-hinge,
  .book-page-ripple,
  .book-page-tail,
  .book-page-edge {
    display: none;
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
    line-height: 1;
  }

  .hero-title .marked {
    text-decoration-thickness: 2px;
    text-underline-offset: 4px;
  }

  .hero-sub {
    font-size: 15px;
  }

  .hero-visual {
    min-height: 420px;
  }

  .hero-cube {
    bottom: 8px;
    width: min(430px, 104vw);
  }

  .hero-wordmark {
    font-size: 96px;
    bottom: -30px;
  }

  .section {
    padding-top: 82px;
  }

  .mega-title {
    font-size: 30px;
    line-height: 1.06;
    overflow-wrap: break-word;
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

  .metric-grid {
    grid-template-columns: 1fr;
  }

  .project-book-list {
    grid-template-columns: 1fr;
    margin-top: 32px;
  }

  .process-row {
    grid-template-columns: 1fr;
    gap: 18px;
    padding: 26px 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-visual {
    transition: none;
  }

  .hero-cube {
    transition: none;
  }

  .book-page-shell,
  .book-page-card {
    transform: none !important;
    opacity: 1 !important;
    filter: none;
  }

  .book-page-contact,
  .book-page-hinge,
  .book-page-ripple,
  .book-page-tail,
  .book-page-edge {
    display: none;
  }
}
</style>
