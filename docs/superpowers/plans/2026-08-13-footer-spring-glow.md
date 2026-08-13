# Footer Spring Glow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有 Vue 作品站的原页脚后新增一段尾部滚动空间，让彩色 SVG 光带在用户继续向下滚动时升起，并在回滚时带阻尼收回。

**Architecture:** 新增一个独立的 `FooterSpringGlow.vue` 组件，组件只负责尾部滚动空间、固定 SVG 光带、滚动进度计算、弹簧追随动画和 reduced-motion 降级。`App.vue` 只导入并在现有 footer 后渲染该组件，原 footer 内容保持不变。`scripts/verify-homepage-structure.mjs` 增加轻量结构检查，覆盖组件存在、App 接入和编码风险。

**Tech Stack:** Vue 3 SFC, Vite, SVG, scoped CSS, existing homepage verification script.

---

## File Structure

- Create: `src/components/FooterSpringGlow.vue`
  - 渲染 footer 后的短尾部滚动区域。
  - 渲染固定在视口底部的 Ruixen 风格 SVG 光带。
  - 监听滚动和窗口尺寸变化，计算尾部区域进入视口的进度。
  - 使用 `requestAnimationFrame`、`current`、`target`、`velocity`、`stiffness` 和 `damping` 实现弹簧追随。
  - 在组件卸载时清理事件监听和动画帧。

- Modify: `src/App.vue`
  - 导入 `FooterSpringGlow`。
  - 保留现有 `<footer class="footer">...</footer>` 内容。
  - 在原 footer 后添加 `<FooterSpringGlow />`。

- Modify: `scripts/verify-homepage-structure.mjs`
  - 增加 `src/App.vue` 和 `src/components/FooterSpringGlow.vue` 的 UTF-8 读取。
  - 检查 `App.vue` 是否导入并渲染 `FooterSpringGlow`。
  - 检查新组件是否包含 SVG、滚动监听、弹簧动画、reduced-motion、清理逻辑和 `pointer-events: none`。

---

### Task 1: Add Failing Structural Verification

**Files:**
- Modify: `scripts/verify-homepage-structure.mjs`

- [ ] **Step 1: Add `app` and `footerSpringGlow` to the verification file map**

In `scripts/verify-homepage-structure.mjs`, change the `files` object from:

```js
const files = {
  home: 'src/views/HomeView.vue',
  rail: 'src/components/SectionRail.vue',
  preview: 'src/components/ProjectPreviewCard.vue',
  style: 'src/style.css',
  heroCube: 'src/components/HeroMetalCube.vue',
  canvasText: 'src/components/CanvasText.vue',
  liquidMetalBackdrop: 'src/components/LiquidMetalBackdrop.vue',
  packageJson: 'package.json'
}
```

to:

```js
const files = {
  app: 'src/App.vue',
  home: 'src/views/HomeView.vue',
  rail: 'src/components/SectionRail.vue',
  preview: 'src/components/ProjectPreviewCard.vue',
  style: 'src/style.css',
  heroCube: 'src/components/HeroMetalCube.vue',
  canvasText: 'src/components/CanvasText.vue',
  liquidMetalBackdrop: 'src/components/LiquidMetalBackdrop.vue',
  footerSpringGlow: 'src/components/FooterSpringGlow.vue',
  packageJson: 'package.json'
}
```

- [ ] **Step 2: Read the two new files in UTF-8**

After:

```js
const failures = []
```

keep the existing helper functions unchanged.

After:

```js
const packageJson = readUtf8(files.packageJson)
```

add:

```js
const app = readUtf8(files.app)
const footerSpringGlow = readUtf8(files.footerSpringGlow)
```

- [ ] **Step 3: Include the new files in the garbled text scan**

Change the garbled scan from:

```js
for (const [label, content] of Object.entries({ home, rail, preview, style, heroCube, canvasText, liquidMetalBackdrop })) {
  if (garbledPattern.test(content)) failures.push(`${label} contains garbled text marker`)
}
```

to:

```js
for (const [label, content] of Object.entries({
  app,
  home,
  rail,
  preview,
  style,
  heroCube,
  canvasText,
  liquidMetalBackdrop,
  footerSpringGlow
})) {
  if (garbledPattern.test(content)) failures.push(`${label} contains garbled text marker`)
}
```

- [ ] **Step 4: Add App.vue integration checks**

After the home hero checks, add:

```js
for (const pattern of [
  /import FooterSpringGlow from '\.\/components\/FooterSpringGlow\.vue'/,
  /<footer class="footer">[\s\S]*<\/footer>\s*<FooterSpringGlow\s*\/>/,
  /<p class="footer-name">大笨钟 \/ DEV<\/p>/,
  /<a href="mailto:hello@example.com">Email<\/a>/,
  /<BackToTop\s*\/>/
]) {
  expectPattern(files.app, app, pattern)
}
```

- [ ] **Step 5: Add FooterSpringGlow component checks**

After the `LiquidMetalBackdrop` checks, add:

```js
for (const pattern of [
  /defineProps/,
  /tailHeight: \{ type: String, default: '38vh' \}/,
  /mobileTailHeight: \{ type: String, default: '30vh' \}/,
  /const RUIXEN_STOPS = \[/,
  /const bellHeights = \(n, peak, valley\) =>/,
  /requestAnimationFrame/,
  /cancelAnimationFrame/,
  /addEventListener\('scroll'/,
  /removeEventListener\('scroll'/,
  /prefers-reduced-motion/,
  /aria-hidden="true"/,
  /footer-spring-glow__band/,
  /footer-spring-glow__floor/,
  /pointer-events:\s*none/,
  /@media \(prefers-reduced-motion: reduce\)/
]) {
  expectPattern(files.footerSpringGlow, footerSpringGlow, pattern)
}
```

- [ ] **Step 6: Run the verification script and confirm it fails for the missing component and missing App integration**

Run:

```bash
npm run verify:homepage
```

Expected: `FAIL` with messages including:

```text
src/components/FooterSpringGlow.vue is missing
src/App.vue missing /import FooterSpringGlow from '\.\/components\/FooterSpringGlow\.vue'/
src/App.vue missing /<footer class="footer">[\s\S]*<\/footer>\s*<FooterSpringGlow\s*\/>/
```

- [ ] **Step 7: Do not commit yet**

Leave `scripts/verify-homepage-structure.mjs` uncommitted until Tasks 2 and 3 make the new checks pass.

---

### Task 2: Create FooterSpringGlow Component

**Files:**
- Create: `src/components/FooterSpringGlow.vue`

- [ ] **Step 1: Create the Vue component**

Create `src/components/FooterSpringGlow.vue` with this content:

```vue
<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  tailHeight: { type: String, default: '38vh' },
  mobileTailHeight: { type: String, default: '30vh' },
  minReveal: { type: Number, default: 0.035 },
  bars: { type: Number, default: 9 },
  blur: { type: Number, default: 15 },
  peak: { type: Number, default: 0.98 },
  valley: { type: Number, default: 0.55 }
})

const VBW = 1271
const VBH = 599

const RUIXEN_STOPS = [
  { offset: 0, color: '#340B05' },
  { offset: 0.1827, color: '#0358F7' },
  { offset: 0.2837, color: '#5092C7' },
  { offset: 0.4135, color: '#E1ECFE' },
  { offset: 0.5866, color: '#FFD400' },
  { offset: 0.6827, color: '#FA3D1D' },
  { offset: 0.8029, color: '#FD02F5' },
  { offset: 1, color: '#FFC0FD00' }
]

const tailRef = ref(null)
const progress = ref(0)
const reducedMotion = ref(false)

const uid = `footer-spring-${Math.random().toString(36).slice(2)}`
const gradientId = `${uid}-gradient`
const blurId = `${uid}-blur`

let targetProgress = 0
let currentProgress = 0
let velocity = 0
let animationFrame = 0
let motionQuery = null

const clamp01 = (value) => Math.min(Math.max(value, 0), 1)

const bellHeights = (n, peak, valley) => {
  const heights = []
  const mid = (n - 1) / 2

  for (let i = 0; i < n; i += 1) {
    const t = mid === 0 ? 0 : Math.abs(i - mid) / mid
    const eased = 1 - Math.pow(t, 1.24)
    heights.push(peak * VBH * (valley + (1 - valley) * eased))
  }

  return heights
}

const barHeights = computed(() => bellHeights(props.bars, props.peak, props.valley))
const columnWidth = computed(() => VBW / props.bars)

const rootStyle = computed(() => {
  const safeProgress = clamp01(progress.value)
  const glowOpacity = safeProgress <= 0 ? 0 : Math.min(0.96, 0.08 + safeProgress * 0.88)

  return {
    '--footer-tail-height': props.tailHeight,
    '--footer-tail-height-mobile': props.mobileTailHeight,
    '--footer-glow-progress': safeProgress.toFixed(4),
    '--footer-glow-opacity': glowOpacity.toFixed(4),
    '--footer-glow-lift': `${((1 - safeProgress) * 18).toFixed(2)}px`
  }
})

const renderProgress = (value) => {
  currentProgress = clamp01(value)
  progress.value = currentProgress
}

const stopSpring = () => {
  if (!animationFrame) return
  cancelAnimationFrame(animationFrame)
  animationFrame = 0
}

const stepSpring = () => {
  const stiffness = 0.18
  const damping = 0.72
  const force = (targetProgress - currentProgress) * stiffness

  velocity = (velocity + force) * damping
  renderProgress(currentProgress + velocity)

  if (Math.abs(targetProgress - currentProgress) < 0.001 && Math.abs(velocity) < 0.001) {
    velocity = 0
    renderProgress(targetProgress)
    animationFrame = 0
    return
  }

  animationFrame = requestAnimationFrame(stepSpring)
}

const startSpring = () => {
  if (animationFrame || reducedMotion.value) return
  animationFrame = requestAnimationFrame(stepSpring)
}

const measure = () => {
  if (!tailRef.value) return

  const rect = tailRef.value.getBoundingClientRect()
  const tailHeight = Math.max(rect.height, 1)
  const raw = (window.innerHeight - rect.top) / tailHeight
  const visibleProgress = clamp01(raw)

  targetProgress = visibleProgress <= 0
    ? 0
    : props.minReveal + (1 - props.minReveal) * visibleProgress

  if (reducedMotion.value) {
    stopSpring()
    velocity = 0
    renderProgress(targetProgress)
    return
  }

  startSpring()
}

const handleMotionPreference = () => {
  reducedMotion.value = motionQuery.matches
  measure()
}

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches

  if (motionQuery.addEventListener) {
    motionQuery.addEventListener('change', handleMotionPreference)
  } else {
    motionQuery.addListener(handleMotionPreference)
  }

  measure()
  window.addEventListener('scroll', measure, { passive: true })
  window.addEventListener('resize', measure, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', measure)
  window.removeEventListener('resize', measure)

  if (motionQuery) {
    if (motionQuery.removeEventListener) {
      motionQuery.removeEventListener('change', handleMotionPreference)
    } else {
      motionQuery.removeListener(handleMotionPreference)
    }
  }

  stopSpring()
})
</script>

<template>
  <div
    ref="tailRef"
    class="footer-spring-glow"
    :class="{ 'is-reduced-motion': reducedMotion }"
    :style="rootStyle"
    aria-hidden="true"
  >
    <div class="footer-spring-glow__floor"></div>
    <div class="footer-spring-glow__band">
      <svg
        class="footer-spring-glow__svg"
        :viewBox="`0 0 ${VBW} ${VBH}`"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient :id="gradientId" x1="0" y1="1" x2="0" y2="0">
            <stop
              v-for="stop in RUIXEN_STOPS"
              :key="`${stop.offset}-${stop.color}`"
              :offset="stop.offset"
              :stop-color="stop.color"
            />
          </linearGradient>
          <filter :id="blurId" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur :stdDeviation="blur" />
          </filter>
        </defs>

        <g
          v-for="(barHeight, index) in barHeights"
          :key="index"
          :filter="`url(#${blurId})`"
        >
          <rect
            :x="index * columnWidth"
            :y="VBH - barHeight"
            :width="columnWidth * 1.23"
            :height="barHeight"
            :fill="`url(#${gradientId})`"
          />
        </g>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.footer-spring-glow {
  position: relative;
  min-height: var(--footer-tail-height);
  overflow: hidden;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    #050505;
  background-size: 340px 100%, 100% 220px;
}

.footer-spring-glow__floor {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(5, 5, 5, 0.88), rgba(5, 5, 5, 0.18) 46%, rgba(5, 5, 5, 0.94)),
    url("/template-assets/noise-texture.png") top center / cover no-repeat;
  opacity: 0.42;
  pointer-events: none;
}

.footer-spring-glow__band {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  height: min(58vh, 520px);
  pointer-events: none;
  opacity: var(--footer-glow-opacity);
  transform-origin: bottom;
  transform:
    translate3d(0, var(--footer-glow-lift), 0)
    scaleY(var(--footer-glow-progress));
  will-change: transform, opacity;
  mix-blend-mode: screen;
}

.footer-spring-glow__svg {
  display: block;
  width: 100%;
  height: 100%;
}

@media (max-width: 720px) {
  .footer-spring-glow {
    min-height: var(--footer-tail-height-mobile);
    background-size: 220px 100%, 100% 180px;
  }

  .footer-spring-glow__band {
    height: min(46vh, 360px);
    opacity: calc(var(--footer-glow-opacity) * 0.76);
  }
}

@media (prefers-reduced-motion: reduce) {
  .footer-spring-glow__band {
    transform:
      translate3d(0, var(--footer-glow-lift), 0)
      scaleY(var(--footer-glow-progress));
    will-change: auto;
  }
}
</style>
```

- [ ] **Step 2: Run the verification script and confirm only App integration still fails**

Run:

```bash
npm run verify:homepage
```

Expected: `FAIL` with `src/App.vue` failures for missing import and missing `<FooterSpringGlow />`. The `src/components/FooterSpringGlow.vue` checks should pass.

---

### Task 3: Integrate FooterSpringGlow In App

**Files:**
- Modify: `src/App.vue`

- [ ] **Step 1: Import the component**

Change the import block in `src/App.vue` from:

```js
import { RouterView, RouterLink } from 'vue-router'
import ScrollProgress from './components/ScrollProgress.vue'
import BackToTop from './components/BackToTop.vue'
```

to:

```js
import { RouterView, RouterLink } from 'vue-router'
import ScrollProgress from './components/ScrollProgress.vue'
import BackToTop from './components/BackToTop.vue'
import FooterSpringGlow from './components/FooterSpringGlow.vue'
```

- [ ] **Step 2: Render the component after the existing footer**

Change the section after the footer from:

```vue
    </footer>

    <BackToTop />
```

to:

```vue
    </footer>

    <FooterSpringGlow />

    <BackToTop />
```

- [ ] **Step 3: Run homepage verification**

Run:

```bash
npm run verify:homepage
```

Expected:

```text
Homepage structure verification passed.
```

- [ ] **Step 4: Commit the structural verification, new component, and App integration**

Run:

```bash
git add scripts/verify-homepage-structure.mjs src/components/FooterSpringGlow.vue src/App.vue
git commit -m "feat: add footer spring glow"
```

Expected: commit succeeds and does not include `public/favicon.png`.

---

### Task 4: Build, Encoding, And Browser Verification

**Files:**
- No planned source edits. If visual tuning is required, modify only `src/components/FooterSpringGlow.vue`.

- [ ] **Step 1: Run production build**

Run:

```bash
npm run build
```

Expected: Vite build completes successfully and writes `dist/`.

- [ ] **Step 2: Read modified text files as UTF-8**

Run:

```bash
Get-Content -Raw -Encoding UTF8 src\App.vue | Out-Null
Get-Content -Raw -Encoding UTF8 src\components\FooterSpringGlow.vue | Out-Null
Get-Content -Raw -Encoding UTF8 scripts\verify-homepage-structure.mjs | Out-Null
```

Expected: each command exits successfully.

- [ ] **Step 3: Scan for common garbled text markers**

Run:

```bash
$garbledPattern = "$([char]0xFFFD)|$([char]0x951F)|$([char]0x00C3)|$([char]0x00C2)"
rg $garbledPattern src\App.vue src\components\FooterSpringGlow.vue scripts\verify-homepage-structure.mjs
```

Expected: exit code `1` with no matches.

- [ ] **Step 4: Start the Vite dev server**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected: Vite prints a local URL such as:

```text
Local:   http://127.0.0.1:5173/
```

If port `5173` is occupied, use the URL Vite prints.

- [ ] **Step 5: Verify desktop behavior**

Open the local Vite URL at a desktop viewport such as `1440x1000`.

Expected:

- The existing footer content remains visually unchanged.
- The light effect is hidden or only a very thin glow when the footer first enters view.
- Continuing to scroll past the footer enters a short dark tail area.
- The colorful glow rises from the viewport bottom inside that tail area.
- Scrolling back up makes the glow recede with a damped, spring-like feel.
- Footer links and the back-to-top button remain clickable.

- [ ] **Step 6: Verify mobile behavior**

Open the local Vite URL at a mobile viewport such as `390x844`.

Expected:

- The footer keeps its existing responsive wrapping.
- There is no horizontal overflow.
- The tail area is shorter than desktop.
- The glow is less intense than desktop and does not obscure the back-to-top button.

- [ ] **Step 7: Verify reduced motion**

In browser dev tools, emulate `prefers-reduced-motion: reduce`, then reload the page.

Expected:

- No continuous spring animation runs.
- The glow follows the tail area without visible oscillation.
- Page scrolling and footer links remain usable.

- [ ] **Step 8: Commit visual tuning if needed**

If Steps 5-7 require CSS or damping changes, run:

```bash
npm run verify:homepage
npm run build
git add src\components\FooterSpringGlow.vue
git commit -m "fix: tune footer spring glow"
```

Expected: verification and build pass before committing.

If no tuning is needed, skip this step and keep the working tree clean except for pre-existing unrelated files.

---

## Self-Review

- Spec coverage: original footer preservation, footer-after tail zone, SVG glow, spring return, reduced motion, accessibility, no React/Tailwind/shadcn, UTF-8 checks, and browser verification are covered.
- Placeholder scan: this plan has no unresolved implementation blanks.
- Type and name consistency: every task uses `FooterSpringGlow.vue`, `tailHeight`, `mobileTailHeight`, `RUIXEN_STOPS`, `bellHeights`, `requestAnimationFrame`, and `FooterSpringGlow` consistently.
- Scope check: the plan covers one focused page-level decorative component and does not require decomposition.
