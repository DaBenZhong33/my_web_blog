<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { projects } from '../data/projects.js'
import PhoneMockup from '../components/PhoneMockup.vue'
import AppIcon from '../components/AppIcon.vue'

const principles = [
  {
    title: '少即是多',
    desc: '砍掉 90% 的功能，把剩下的 10% 做到顺手。每个产品只解决一个真问题。'
  },
  {
    title: '数据属于用户',
    desc: '离线优先、本地加密、可自由导出。用户的记录永远掌握在用户自己手里。'
  },
  {
    title: '细节即体验',
    desc: '60fps 的滚动、恰到好处的震动反馈、秒开的冷启动——魔鬼都在细节里。'
  },
  {
    title: '长期主义',
    desc: '不做一锤子买卖。持续维护、持续迭代，和用户一起把产品养大。'
  }
]

const marqueeItems = [
  'SwiftUI', 'Kotlin', 'Flutter', 'Vue 3', 'Compose', 'SwiftData',
  'CloudKit', 'Riverpod', 'SQLDelight', 'Supabase', 'Figma', '独立开发'
]

// Hero 手机群视差滚动
const phonesEl = ref(null)
let raf = null
const onScroll = () => {
  if (raf) return
  raf = requestAnimationFrame(() => {
    raf = null
    if (phonesEl.value) {
      const y = window.scrollY
      phonesEl.value.style.transform = `translateY(${y * -0.12}px)`
    }
  })
}
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  if (raf) cancelAnimationFrame(raf)
})
</script>

<template>
  <!-- ===== Hero ===== -->
  <section class="hero">
    <div class="hero-glow"></div>

    <!-- 几何装饰 -->
    <svg class="deco deco-1" width="42" height="42" viewBox="0 0 42 42" fill="none">
      <circle cx="21" cy="21" r="19" stroke="#e0b84d" stroke-width="1.5" opacity="0.6" />
    </svg>
    <svg class="deco deco-2" width="34" height="34" viewBox="0 0 34 34" fill="none" style="animation-delay: -2s">
      <path d="M17 4v26M4 17h26" stroke="#6798ff" stroke-width="1.5" opacity="0.6" />
    </svg>
    <svg class="deco deco-3" width="38" height="38" viewBox="0 0 38 38" fill="none" style="animation-delay: -4s">
      <rect x="5" y="5" width="28" height="28" rx="6" stroke="#f5f5f7" stroke-width="1.5" opacity="0.35" />
    </svg>
    <svg class="deco deco-4" width="30" height="30" viewBox="0 0 30 30" fill="none" style="animation-delay: -1s">
      <path d="M15 3l3.5 8.5L27 15l-8.5 3.5L15 27l-3.5-8.5L3 15l8.5-3.5L15 3z" stroke="#e0b84d" stroke-width="1.5" opacity="0.5" />
    </svg>

    <div class="container hero-inner">
      <p class="eyebrow">Indie Developer · 独立开发者</p>
      <h1 class="hero-title">
        <span class="shimmer-text">做自己的小产品，</span><br />让它们被更多人用到。
      </h1>
      <p class="hero-sub">
        你好，我是 yanfa。白天写代码，晚上也写代码——
        这里展示我独立设计、开发并维护的每一个 App。
      </p>
      <div class="hero-actions">
        <a href="#projects" class="btn btn-primary" v-magnetic>看看我的作品 ↓</a>
        <RouterLink to="/about" class="btn btn-ghost" v-magnetic>关于我</RouterLink>
      </div>

      <!-- Hero 手机样机群：3D 倾斜 + 视差 -->
      <div class="hero-phones" ref="phonesEl" v-reveal>
        <div
          v-for="(p, i) in projects"
          :key="p.id"
          class="hero-phone"
          :class="`pos-${i}`"
          v-tilt="12"
        >
          <PhoneMockup :gradient="p.gradient" :accent="p.accent" :label="p.name" />
        </div>
      </div>
    </div>
  </section>

  <!-- ===== 跑马灯 ===== -->
  <div class="marquee" aria-hidden="true">
    <div class="marquee-track">
      <span v-for="(item, i) in [...marqueeItems, ...marqueeItems]" :key="i" class="marquee-item">{{ item }}</span>
    </div>
  </div>

  <!-- ===== 项目列表（叠加滑动卡片）===== -->
  <section id="projects" class="section container">
    <p class="eyebrow" v-reveal>Projects · 作品</p>
    <h2 class="section-title" v-reveal>每一个，都认真打磨。</h2>
    <p class="section-sub" v-reveal>
      从想法到上架，从产品到代码，全部独立完成。点击查看每个 App 背后的故事。
    </p>

    <div class="project-list">
      <RouterLink
        v-for="(p, i) in projects"
        :key="p.id"
        :to="`/project/${p.id}`"
        class="project-card card"
        :style="{ top: `calc(84px + ${i * 26}px)`, zIndex: i + 1 }"
      >
        <div class="project-info">
          <div class="project-head">
            <AppIcon :name="p.name" :accent="p.accent" :gradient="p.gradient" :size="72" />
            <div>
              <p class="project-platform">{{ p.platform }}</p>
              <h3 class="project-name">
                {{ p.name }} <span class="project-en">{{ p.nameEn }}</span>
              </h3>
            </div>
          </div>
          <p class="project-slogan" :style="{ color: p.accent }">「{{ p.slogan }}」</p>
          <p class="project-desc">{{ p.description }}</p>
          <div class="project-tags">
            <span v-for="t in p.tech" :key="t" class="tag">{{ t }}</span>
          </div>
          <span class="project-more">了解详情 →</span>
        </div>
        <div class="project-visual" :class="{ flip: i % 2 === 1 }">
          <div
            class="visual-bg"
            :style="{ background: `radial-gradient(circle at 50% 30%, ${p.accent}22, transparent 70%)` }"
          ></div>
          <div v-tilt="8">
            <PhoneMockup :gradient="p.gradient" :accent="p.accent" :label="p.screens[0]" />
          </div>
        </div>
      </RouterLink>
    </div>
  </section>

  <!-- ===== 做产品的原则 ===== -->
  <section class="section container">
    <p class="eyebrow" v-reveal>Principles · 原则</p>
    <h2 class="section-title" v-reveal>我做产品的四件事</h2>

    <div class="principle-grid">
      <div v-for="(item, i) in principles" :key="item.title" class="principle card" v-reveal>
        <span class="principle-num">0{{ i + 1 }}</span>
        <h3>{{ item.title }}</h3>
        <p>{{ item.desc }}</p>
      </div>
    </div>
  </section>

  <!-- ===== 底部 CTA ===== -->
  <section class="section container">
    <div class="cta card" v-reveal>
      <div class="cta-glow"></div>
      <p class="eyebrow">Contact · 联系</p>
      <h2 class="section-title">有想法？聊聊。</h2>
      <p class="section-sub">
        无论是合作、反馈，还是单纯想交流独立开发的心得，都欢迎来信。
      </p>
      <div class="cta-actions">
        <a href="mailto:hello@example.com" class="btn btn-primary" v-magnetic>给我写邮件</a>
        <a href="https://github.com" target="_blank" rel="noopener" class="btn btn-ghost" v-magnetic>GitHub 上找我</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ===== Hero ===== */
.hero {
  position: relative;
  overflow: hidden;
  padding: 96px 0 0;
}

.hero-glow {
  position: absolute;
  top: -260px;
  left: 50%;
  transform: translateX(-50%);
  width: 900px;
  height: 560px;
  background: radial-gradient(ellipse, rgba(224, 184, 77, 0.14), transparent 65%);
  pointer-events: none;
}

/* 几何装饰定位 */
.deco-1 { top: 18%; left: 8%; }
.deco-2 { top: 30%; right: 10%; }
.deco-3 { top: 12%; right: 22%; }
.deco-4 { top: 42%; left: 16%; }

@media (max-width: 900px) {
  .deco { display: none; }
}

.hero-inner {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-title {
  font-size: clamp(38px, 6.5vw, 72px);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.12;
  margin: 22px 0 20px;
}

.hero-sub {
  color: var(--ink-2);
  font-size: 18px;
  max-width: 540px;
}

.hero-actions {
  display: flex;
  gap: 14px;
  margin-top: 34px;
  flex-wrap: wrap;
  justify-content: center;
}

.hero-phones {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 28px;
  margin-top: 72px;
  mask-image: linear-gradient(to bottom, #000 78%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, #000 78%, transparent);
  will-change: transform;
}

/* v-tilt 会包一层 .tilt-body，保持其内容撑满 */
.hero-phone :deep(.tilt-body) {
  display: block;
}

.hero-phone {
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.hero-phone.pos-0 { transform: rotate(-6deg) translateY(24px); }
.hero-phone.pos-1 { transform: translateY(0); z-index: 2; }
.hero-phone.pos-2 { transform: rotate(6deg) translateY(24px); }

.hero-phone:hover {
  transform: translateY(-12px) rotate(0deg);
  z-index: 3;
}

@media (max-width: 760px) {
  .hero-phone.pos-0,
  .hero-phone.pos-2 { display: none; }
}

/* ===== 跑马灯上下间距 ===== */
.marquee {
  margin-top: 96px;
}

/* ===== 区块 ===== */
.section {
  padding-top: 120px;
}

/* ===== 项目叠加卡片 ===== */
.project-list {
  display: flex;
  flex-direction: column;
  gap: 40px;
  margin-top: 56px;
  padding-bottom: 40px;
}

.project-card {
  position: sticky;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  overflow: hidden;
  box-shadow: 0 -12px 40px rgba(0, 0, 0, 0.45);
}

.project-info {
  padding: 44px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  order: 1;
}

.project-visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  order: 2;
  overflow: hidden;
}

.project-visual.flip {
  order: 0;
}

.project-card:has(.flip) .project-info {
  order: 2;
}

.visual-bg {
  position: absolute;
  inset: 0;
}

.project-head {
  display: flex;
  align-items: center;
  gap: 18px;
}

.project-platform {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink-3);
  letter-spacing: 0.08em;
}

.project-name {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.project-en {
  color: var(--ink-3);
  font-size: 16px;
  font-weight: 500;
  margin-left: 6px;
}

.project-slogan {
  font-size: 16px;
  font-weight: 600;
}

.project-desc {
  color: var(--ink-2);
  font-size: 15px;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.project-more {
  margin-top: auto;
  color: var(--accent);
  font-size: 14px;
  font-weight: 600;
  opacity: 0;
  transform: translateX(-6px);
  transition: opacity 0.3s, transform 0.3s;
}

.project-card:hover .project-more {
  opacity: 1;
  transform: none;
}

@media (max-width: 860px) {
  .project-card {
    grid-template-columns: 1fr;
  }
  .project-visual,
  .project-visual.flip {
    order: 0;
  }
}

/* ===== 原则 ===== */
.principle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 20px;
  margin-top: 48px;
}

.principle {
  padding: 28px;
}

.principle-num {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--accent);
}

.principle h3 {
  font-size: 19px;
  margin: 12px 0 8px;
  letter-spacing: -0.02em;
}

.principle p {
  color: var(--ink-2);
  font-size: 14px;
}

/* ===== CTA ===== */
.cta {
  position: relative;
  overflow: hidden;
  text-align: center;
  padding: 80px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cta-glow {
  position: absolute;
  inset: auto -20% -60% -20%;
  height: 320px;
  background: radial-gradient(ellipse, rgba(224, 184, 77, 0.16), transparent 65%);
  pointer-events: none;
}

.cta .section-sub {
  margin: 0 auto;
}

.cta-actions {
  display: flex;
  gap: 14px;
  margin-top: 34px;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
