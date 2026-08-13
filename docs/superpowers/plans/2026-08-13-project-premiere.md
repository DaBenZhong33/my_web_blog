# Project Premiere Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将首页现有作品翻书列表升级为三个连续的全屏“作品首映”章节，并加入可点击、可降级的电影式章节 HUD。

**Architecture:** `HomeView.vue` 继续负责首页章节组合、全局滚动进度和当前章节观察，但删除作品翻页的计算与 DOM 装饰。新增 `ProjectPremiere.vue` 独立渲染单个作品的视觉场景，新增 `ChapterHud.vue` 统一呈现当前章节和跳转入口；展示内容继续由 `projects.js` 驱动。首期只实现作品首映和 HUD，不实施 `/lab`、创作宣言、横向时间线或片尾重构。

**Tech Stack:** Vue 3 SFC, Vue Router, CSS custom properties, IntersectionObserver, requestAnimationFrame, Vite, existing Node structural verification.

---

## File Structure

- Create: `src/components/ProjectPremiere.vue`
  - 渲染单个项目的全屏首映场景、真实截图、编号、主张和详情入口。
  - 根据元素进入视口的位置更新局部滚动进度。
  - 在移动端与 `prefers-reduced-motion` 下使用稳定的静态布局。
  - 图片失败时使用项目色彩和名称组成可读替代封面。

- Create: `src/components/ChapterHud.vue`
  - 显示当前章节编号、总数、英文标签和中文标题。
  - 提供可点击的章节跳转按钮，并保留键盘焦点样式。
  - 桌面端显示完整信息，移动端显示紧凑状态。

- Modify: `src/data/projects.js`
  - 为每个项目增加 `chapterColor`、`statement` 和有限集合内的 `motionPreset`。

- Modify: `src/views/HomeView.vue`
  - 使用 `ChapterHud` 替换 `SectionRail`。
  - 使用 `ProjectPremiere` 替换 `ProjectPreviewCard` 和作品翻页 DOM。
  - 删除作品书页计算、引用、滚动更新和旧 CSS。
  - 保留现有六个顶层章节、全局滚动进度、首屏视差和锚点跳转。

- Modify: `scripts/verify-homepage-structure.mjs`
  - 加入两个新组件和项目数据的 UTF-8 读取。
  - 先以结构检查锁定新组件接口、数据字段、首页接入、降级能力和旧实现移除。

---

### Task 1: Add Failing Structural Verification

**Files:**
- Modify: `scripts/verify-homepage-structure.mjs`

- [ ] **Step 1: Extend the verification file map and UTF-8 reads**

Add these entries to `files`:

```js
chapterHud: 'src/components/ChapterHud.vue',
projectPremiere: 'src/components/ProjectPremiere.vue',
projectsData: 'src/data/projects.js',
```

After the current component reads, add:

```js
const chapterHud = readUtf8(files.chapterHud)
const projectPremiere = readUtf8(files.projectPremiere)
const projectsData = readUtf8(files.projectsData)
```

Add `chapterHud`, `projectPremiere`, and `projectsData` to the existing `garbledPattern` scan object.

- [ ] **Step 2: Replace legacy work-section expectations with premiere expectations**

Remove these positive expectations from the HomeView pattern groups:

```js
/import SectionRail from/,
/import ProjectPreviewCard from/,
/<SectionRail[\s\S]*@navigate="navigateToSection"/,
/<ProjectPreviewCard/,
/class="container project-book-list"/,
/class="book-page-shell"/,
/bookPageStyles/,
```

Add this new positive group:

```js
for (const pattern of [
  /import ChapterHud from '\.\.\/components\/ChapterHud\.vue'/,
  /import ProjectPremiere from '\.\.\/components\/ProjectPremiere\.vue'/,
  /<ChapterHud[\s\S]*@navigate="navigateToSection"/,
  /<div class="project-premiere-list"/,
  /v-for="\(project, index\) in projects"/,
  /<ProjectPremiere[\s\S]*:project="project"[\s\S]*:index="index"/,
  /aria-label="作品首映列表"/
]) {
  expectPattern(files.home, home, pattern)
}
```

- [ ] **Step 3: Require removal of the old book implementation**

Add these expressions to the existing HomeView rejection group:

```js
/ProjectPreviewCard/,
/projectImages/,
/bookWrap/,
/bookPageStyles/,
/getBookPageStyle/,
/updateBookPages/,
/project-book-list/,
/book-page-shell/,
```

- [ ] **Step 4: Add ChapterHud component checks**

```js
for (const pattern of [
  /sections: \{ type: Array, required: true \}/,
  /activeSection: \{ type: String, required: true \}/,
  /progress: \{ type: Number, default: 0 \}/,
  /defineEmits\(\['navigate'\]\)/,
  /aria-label="首页电影章节导航"/,
  /aria-current/,
  /chapter-hud__progress/,
  /@media \(max-width: 720px\)/,
  /@media \(prefers-reduced-motion: reduce\)/
]) {
  expectPattern(files.chapterHud, chapterHud, pattern)
}
```

- [ ] **Step 5: Add ProjectPremiere and project-data checks**

```js
for (const pattern of [
  /project: \{ type: Object, required: true \}/,
  /index: \{ type: Number, required: true \}/,
  /IntersectionObserver/,
  /requestAnimationFrame/,
  /prefers-reduced-motion: reduce/,
  /project\.chapterColor/,
  /project\.statement/,
  /project\.motionPreset/,
  /project\.coverImage/,
  /hasImageError/,
  /RouterLink/,
  /`\/project\/\$\{project\.id\}`/,
  /aria-label="project\.name/,
  /project-premiere__fallback/
]) {
  expectPattern(files.projectPremiere, projectPremiere, pattern)
}

for (const pattern of [
  /chapterColor:\s*'#[0-9a-fA-F]{6}'/,
  /statement:\s*'[^']+'/,
  /motionPreset:\s*'(calendar|menu|ledger)'/
]) {
  expectPattern(files.projectsData, projectsData, pattern)
}
```

- [ ] **Step 6: Run the verification and confirm the new checks fail**

Run:

```powershell
npm run verify:homepage
```

Expected: `FAIL` including missing `src/components/ChapterHud.vue`, missing `src/components/ProjectPremiere.vue`, missing project display fields, and legacy work-section matches.

- [ ] **Step 7: Keep the failing verification uncommitted**

Do not commit until Tasks 2–5 make the complete structural verification pass.

---

### Task 2: Add Project Premiere Display Data

**Files:**
- Modify: `src/data/projects.js`
- Test: `scripts/verify-homepage-structure.mjs`

- [ ] **Step 1: Add the three display fields to each project**

For `daily-planner`, add after `slogan`:

```js
chapterColor: '#d49a5b',
statement: '把「今天」重新组织成一条清楚的行动路径。',
motionPreset: 'calendar',
```

For `today-menu`, add after `slogan`:

```js
chapterColor: '#ff5a1f',
statement: '让每一次选择都更快，也更接近日常直觉。',
motionPreset: 'menu',
```

For `group-ledger`, add after `slogan`:

```js
chapterColor: '#4c8dff',
statement: '复杂的多人账单，也应该一眼看清下一步。',
motionPreset: 'ledger',
```

- [ ] **Step 2: Read the modified data file explicitly as UTF-8**

Run:

```powershell
Get-Content -Raw -Encoding UTF8 src\data\projects.js | Out-Null
```

Expected: exit code `0`.

- [ ] **Step 3: Run verification and confirm only component/Home integration failures remain**

Run:

```powershell
npm run verify:homepage
```

Expected: the three project-data patterns no longer appear in the failure list; missing components and legacy HomeView failures remain.

- [ ] **Step 4: Do not commit yet**

Keep `projects.js` together with the components that consume its new fields.

---

### Task 3: Create ChapterHud

**Files:**
- Create: `src/components/ChapterHud.vue`
- Test: `scripts/verify-homepage-structure.mjs`

- [ ] **Step 1: Create the component with this complete content**

```vue
<script setup>
import { computed } from 'vue'

const props = defineProps({
  sections: { type: Array, required: true },
  activeSection: { type: String, required: true },
  progress: { type: Number, default: 0 }
})

const emit = defineEmits(['navigate'])

const activeIndex = computed(() => {
  const index = props.sections.findIndex((section) => section.id === props.activeSection)
  return index < 0 ? 0 : index
})

const active = computed(() => props.sections[activeIndex.value] ?? props.sections[0])
const formatIndex = (index) => String(index + 1).padStart(2, '0')
const progressPercent = computed(() => `${Math.round(Math.min(Math.max(props.progress, 0), 1) * 100)}%`)
</script>

<template>
  <nav
    class="chapter-hud"
    aria-label="首页电影章节导航"
    :style="{ '--chapter-progress': progressPercent }"
  >
    <div class="chapter-hud__current" aria-live="polite">
      <span>{{ formatIndex(activeIndex) }} / {{ formatIndex(sections.length - 1) }}</span>
      <strong>{{ active?.label }}</strong>
      <small>{{ active?.title }}</small>
    </div>

    <div class="chapter-hud__progress" aria-hidden="true"><span></span></div>

    <div class="chapter-hud__chapters">
      <button
        v-for="(section, index) in sections"
        :key="section.id"
        type="button"
        :aria-label="`跳转到第 ${formatIndex(index)} 章：${section.title}`"
        :aria-current="section.id === activeSection ? 'step' : undefined"
        :class="{ active: section.id === activeSection }"
        @click="emit('navigate', section.id)"
      >
        <span>{{ formatIndex(index) }}</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.chapter-hud {
  --chapter-progress: 0%;
  position: fixed;
  left: 24px;
  bottom: 24px;
  z-index: 45;
  display: grid;
  grid-template-columns: auto 110px auto;
  align-items: center;
  gap: 16px;
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(5, 5, 5, 0.78);
  backdrop-filter: blur(14px);
}

.chapter-hud__current { display: grid; grid-template-columns: auto auto; gap: 1px 10px; min-width: 150px; }
.chapter-hud__current span { color: var(--accent); font: 800 10px var(--font-mono); }
.chapter-hud__current strong { font-size: 11px; text-transform: uppercase; }
.chapter-hud__current small { grid-column: 2; color: var(--ink-3); font-size: 10px; }
.chapter-hud__progress { height: 2px; overflow: hidden; background: rgba(255,255,255,.14); }
.chapter-hud__progress span { display: block; width: var(--chapter-progress); height: 100%; background: var(--accent); transition: width .18s ease; }
.chapter-hud__chapters { display: flex; gap: 2px; }
.chapter-hud__chapters button { width: 34px; height: 34px; border: 0; background: transparent; color: var(--ink-3); cursor: pointer; font: 800 9px var(--font-mono); }
.chapter-hud__chapters button:hover,
.chapter-hud__chapters button.active { color: var(--accent); background: rgba(215,255,0,.08); }
.chapter-hud__chapters button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

@media (max-width: 720px) {
  .chapter-hud { left: 12px; right: 12px; bottom: 12px; grid-template-columns: auto 1fr; }
  .chapter-hud__current { min-width: 0; }
  .chapter-hud__current small,
  .chapter-hud__chapters { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .chapter-hud__progress span { transition: none; }
}
</style>
```

- [ ] **Step 2: Run verification and inspect ChapterHud failures**

Run:

```powershell
npm run verify:homepage
```

Expected: ChapterHud-specific patterns pass. ProjectPremiere and HomeView integration failures remain.

- [ ] **Step 3: Keep the component uncommitted**

Commit after it is integrated and the full verification passes.

---

### Task 4: Create ProjectPremiere

**Files:**
- Create: `src/components/ProjectPremiere.vue`
- Test: `scripts/verify-homepage-structure.mjs`

- [ ] **Step 1: Create the component with this complete content**

```vue
<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  project: { type: Object, required: true },
  index: { type: Number, required: true }
})

const root = ref(null)
const progress = ref(0)
const hasImageError = ref(false)
let observer = null
let frame = 0

const clamp = (value) => Math.min(Math.max(value, 0), 1)
const number = computed(() => String(props.index + 1).padStart(2, '0'))
const rootStyle = computed(() => ({
  '--premiere-color': props.project.chapterColor,
  '--premiere-progress': progress.value.toFixed(3)
}))

const updateProgress = () => {
  frame = 0
  if (!root.value) return
  const rect = root.value.getBoundingClientRect()
  const travel = window.innerHeight + rect.height
  progress.value = clamp((window.innerHeight - rect.top) / travel)
}

const requestProgress = () => {
  if (frame) return
  frame = requestAnimationFrame(updateProgress)
}

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    const visible = entries[0]?.isIntersecting
    root.value?.classList.toggle('is-active', Boolean(visible))
    if (visible) requestProgress()
  }, { rootMargin: '18% 0px', threshold: 0.08 })
  observer.observe(root.value)
  window.addEventListener('scroll', requestProgress, { passive: true })
  window.addEventListener('resize', requestProgress, { passive: true })
  updateProgress()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('scroll', requestProgress)
  window.removeEventListener('resize', requestProgress)
  if (frame) cancelAnimationFrame(frame)
})
</script>

<template>
  <article
    ref="root"
    class="project-premiere"
    :class="`motion-${project.motionPreset}`"
    :style="rootStyle"
    :aria-label="project.name + ' 作品首映'"
  >
    <div class="project-premiere__grid" aria-hidden="true"></div>
    <div class="project-premiere__copy">
      <p class="project-premiere__chapter">PROJECT / {{ number }}</p>
      <h3><span>{{ project.nameEn }}</span>{{ project.name }}</h3>
      <p class="project-premiere__statement">{{ project.statement }}</p>
      <div class="project-premiere__meta">
        <span>{{ project.platform }}</span>
        <span>{{ project.tech[0] }}</span>
        <span>2026</span>
      </div>
      <RouterLink class="project-premiere__link" :to="`/project/${project.id}`" v-magnetic>
        查看完整项目 →
      </RouterLink>
    </div>

    <div class="project-premiere__stage">
      <span class="project-premiere__orbit" aria-hidden="true"></span>
      <figure v-if="!hasImageError" class="project-premiere__device">
        <img
          :src="project.coverImage"
          :alt="`${project.name} App 界面截图`"
          loading="lazy"
          decoding="async"
          @error="hasImageError = true"
        />
      </figure>
      <div v-else class="project-premiere__fallback" role="img" :aria-label="project.name + ' 项目封面'">
        <strong>{{ project.name }}</strong>
        <span>{{ project.nameEn }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.project-premiere {
  position: relative;
  isolation: isolate;
  min-height: max(760px, 100svh);
  display: grid;
  grid-template-columns: minmax(0, .88fr) minmax(420px, 1.12fr);
  align-items: center;
  gap: 64px;
  padding: 96px max(40px, calc((100vw - 1360px) / 2));
  overflow: hidden;
  border-top: 1px solid rgba(255,255,255,.1);
  background: radial-gradient(circle at 72% 48%, color-mix(in srgb, var(--premiere-color) 28%, transparent), transparent 32%), #050505;
}

.project-premiere__grid { position: absolute; inset: 0; z-index: -1; opacity: .38; background-image: linear-gradient(#ffffff0d 1px,transparent 1px),linear-gradient(90deg,#ffffff0d 1px,transparent 1px); background-size: 96px 96px; mask-image: linear-gradient(to bottom,transparent,#000 18%,#000 82%,transparent); }
.project-premiere__copy { position: relative; z-index: 2; }
.project-premiere__chapter { color: var(--premiere-color); font: 900 11px var(--font-mono); letter-spacing: .12em; }
.project-premiere h3 { margin-top: 20px; font-size: clamp(56px,7vw,112px); line-height: .82; letter-spacing: -.07em; text-transform: uppercase; }
.project-premiere h3 span { display: block; color: var(--ink-3); font-size: .38em; letter-spacing: -.03em; }
.project-premiere__statement { max-width: 560px; margin-top: 32px; color: var(--ink-2); font-size: clamp(18px,2vw,28px); line-height: 1.35; }
.project-premiere__meta { display: flex; flex-wrap: wrap; gap: 10px 20px; margin-top: 26px; color: var(--ink-3); font: 800 10px var(--font-mono); text-transform: uppercase; }
.project-premiere__link { display: inline-flex; align-items: center; min-height: 50px; margin-top: 36px; padding: 0 20px; border: 1px solid var(--premiere-color); color: var(--premiere-color); font-size: 12px; font-weight: 900; text-transform: uppercase; }
.project-premiere__link:focus-visible { outline: 2px solid var(--ink-1); outline-offset: 4px; }
.project-premiere__stage { position: relative; min-height: 620px; display: grid; place-items: center; perspective: 1400px; }
.project-premiere__orbit { position: absolute; width: min(34vw,470px); aspect-ratio: 1; border: 1px solid color-mix(in srgb,var(--premiere-color) 68%,transparent); border-radius: 50%; transform: scale(calc(.82 + var(--premiere-progress) * .26)); box-shadow: 0 0 80px color-mix(in srgb,var(--premiere-color) 20%,transparent); }
.project-premiere__device { position: relative; width: min(290px,42vw); aspect-ratio: 9 / 19.4; overflow: hidden; border: 1px solid rgba(255,255,255,.24); border-radius: 38px; background: #050505; box-shadow: 0 48px 100px rgba(0,0,0,.62); transform: translate3d(0,calc((.5 - var(--premiere-progress)) * 90px),80px) rotateY(calc((.5 - var(--premiere-progress)) * 16deg)); }
.project-premiere__device img { width: 100%; height: 100%; object-fit: cover; object-position: top center; }
.project-premiere__fallback { width: min(360px,70vw); aspect-ratio: 4/5; display: grid; place-content: center; text-align: center; border: 1px solid var(--premiere-color); background: linear-gradient(145deg,color-mix(in srgb,var(--premiere-color) 46%,#050505),#050505); }
.project-premiere__fallback strong { font-size: 32px; }.project-premiere__fallback span { color: var(--ink-2); text-transform: uppercase; }
.motion-menu .project-premiere__device { transform: translate3d(calc((.5 - var(--premiere-progress)) * -70px),0,80px) rotateZ(calc((.5 - var(--premiere-progress)) * -5deg)); }
.motion-ledger .project-premiere__device { transform: translate3d(0,calc((.5 - var(--premiere-progress)) * 70px),80px) rotateY(calc((.5 - var(--premiere-progress)) * -18deg)); }

@media (max-width: 900px) {
  .project-premiere { min-height: auto; grid-template-columns: 1fr; gap: 24px; padding: 88px 24px; }
  .project-premiere__stage { min-height: 540px; }
  .project-premiere__device { width: min(270px,68vw); transform: none; }
  .project-premiere__orbit { width: min(72vw,430px); transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .project-premiere__device,
  .motion-menu .project-premiere__device,
  .motion-ledger .project-premiere__device,
  .project-premiere__orbit { transform: none; }
}
</style>
```

- [ ] **Step 2: Run verification and confirm only HomeView integration/legacy failures remain**

Run:

```powershell
npm run verify:homepage
```

Expected: ProjectPremiere-specific checks pass; HomeView still fails until Task 5.

- [ ] **Step 3: Keep the component uncommitted**

Commit after integration and full verification.

---

### Task 5: Integrate Premiere Chapters and Remove the Book Effect

**Files:**
- Modify: `src/views/HomeView.vue`
- Test: `scripts/verify-homepage-structure.mjs`

- [ ] **Step 1: Replace component imports**

Replace:

```js
import SectionRail from '../components/SectionRail.vue'
import ProjectPreviewCard from '../components/ProjectPreviewCard.vue'
```

with:

```js
import ChapterHud from '../components/ChapterHud.vue'
import ProjectPremiere from '../components/ProjectPremiere.vue'
```

- [ ] **Step 2: Remove all book-only state and helpers**

Delete `projectImages`, `bookWrap`, `bookPageStyles`, `clamp`, `smoothStep`, `getBookPageStyle`, the initial `bookPageStyles.value` assignment, and `updateBookPages`.

Change:

```js
const onResize = () => {
  updateBookPages()
}
```

to:

```js
const onResize = () => {
  updateScrollProgress()
}
```

Remove `updateBookPages()` from `onScroll` and `onMounted`. Preserve the hero parallax, scroll-progress update, observer setup, resize/scroll listeners and cleanup.

- [ ] **Step 3: Replace SectionRail with ChapterHud**

Replace the opening component call with:

```vue
  <ChapterHud
    :sections="sections"
    :active-section="activeSection"
    :progress="scrollProgress"
    @navigate="navigateToSection"
  />
```

- [ ] **Step 4: Replace the complete work section markup**

Replace the current `<section id="work" ...>` block with:

```vue
  <section id="work" class="project-section">
    <div class="container project-section__intro">
      <p class="eyebrow" v-reveal>Chapter 03 · 作品首映</p>
      <h2 class="section-title mega-title" v-reveal>REAL APPS. THREE DIFFERENT WORLDS.</h2>
      <p v-reveal>继续向下滚动，让每个真实产品拥有自己的颜色、镜头和主张。</p>
    </div>

    <div class="project-premiere-list" aria-label="作品首映列表">
      <ProjectPremiere
        v-for="(project, index) in projects"
        :key="project.id"
        :project="project"
        :index="index"
      />
    </div>
  </section>
```

- [ ] **Step 5: Remove old book CSS and add the new section intro CSS**

Delete the entire CSS region beginning with `/* ===== 作品区：纵向柔性翻书 ===== */` and ending immediately before the next non-book section selector. Also delete book-specific blocks inside the `1080px`, `720px`, and reduced-motion media queries.

Keep `.project-section`, but replace its declaration and `.section-button` with:

```css
.project-section {
  position: relative;
  overflow: clip;
  background: #050505;
}

.project-section__intro {
  min-height: 62vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-top: 120px;
  padding-bottom: 72px;
}

.project-section__intro > p:last-child {
  max-width: 620px;
  color: var(--ink-2);
  font-size: 17px;
}

.project-premiere-list {
  position: relative;
}
```

Add this mobile adjustment inside `@media (max-width: 720px)`:

```css
.project-section__intro {
  min-height: auto;
  padding-top: 88px;
  padding-bottom: 48px;
}
```

- [ ] **Step 6: Run the complete structural verification**

Run:

```powershell
npm run verify:homepage
```

Expected:

```text
Homepage structure verification passed.
```

- [ ] **Step 7: Check the diff before committing**

Run:

```powershell
git diff --check
git status --short
```

Expected: no whitespace errors; only the five planned files are modified or created.

- [ ] **Step 8: Commit the data, components, Home integration, and verification together**

Run:

```powershell
git add scripts\verify-homepage-structure.mjs src\data\projects.js src\components\ChapterHud.vue src\components\ProjectPremiere.vue src\views\HomeView.vue
git commit -m "feat: add cinematic project premieres"
```

Expected: commit succeeds with exactly those files.

---

### Task 6: Production, Encoding, and Browser Verification

**Files:**
- No planned source edits.
- If visual corrections are required, modify only `src/components/ChapterHud.vue`, `src/components/ProjectPremiere.vue`, or the new project-section rules in `src/views/HomeView.vue`.

- [ ] **Step 1: Run structural verification and production build**

Run:

```powershell
npm run verify:homepage
npm run build
```

Expected: homepage verification passes and Vite writes a successful production build to `dist/`.

- [ ] **Step 2: Read every modified text file as UTF-8**

Run:

```powershell
$premiereFiles = @(
  'scripts\verify-homepage-structure.mjs',
  'src\data\projects.js',
  'src\components\ChapterHud.vue',
  'src\components\ProjectPremiere.vue',
  'src\views\HomeView.vue'
)
$premiereFiles | ForEach-Object { Get-Content -Raw -Encoding UTF8 $_ | Out-Null }
```

Expected: exit code `0`.

- [ ] **Step 3: Scan for common Chinese garbling markers**

Run:

```powershell
$garbledPattern = "$([char]0xFFFD)|$([char]0x951F)|$([char]0x00C3)|$([char]0x00C2)"
rg $garbledPattern scripts\verify-homepage-structure.mjs src\data\projects.js src\components\ChapterHud.vue src\components\ProjectPremiere.vue src\views\HomeView.vue
```

Expected: no matches; `rg` exits with code `1`.

- [ ] **Step 4: Start the local site**

Run:

```powershell
npm run dev -- --host 127.0.0.1
```

Expected: Vite prints a local URL. Use the printed port if `5173` is occupied.

- [ ] **Step 5: Verify desktop presentation at 1440×1000**

Expected:

- The HUD remains readable without covering the navigation or primary project text.
- HUD buttons jump to all six existing top-level sections and update `aria-current` as sections change.
- The work intro leads into three full-screen project scenes in data order.
- Each scene uses its own `chapterColor`, real screenshot, statement and working detail link.
- Only the visible scene performs meaningful motion; scrolling remains native and is never locked.
- Navigating into a project and using browser Back returns to a usable homepage.

- [ ] **Step 6: Verify keyboard and failure states**

Expected:

- Tab reaches every HUD chapter button and every “查看完整项目” link with a visible focus indicator.
- Temporarily changing one `coverImage` URL to an invalid path in DevTools shows the named fallback cover rather than an empty frame.
- The fallback does not shift the surrounding layout.

- [ ] **Step 7: Verify mobile presentation at 390×844**

Expected:

- No horizontal overflow or trapped scroll.
- The HUD becomes the compact two-column version and does not cover project links.
- Each project becomes a natural copy-then-device stack rather than a forced desktop scene.
- Screenshots remain readable and do not exceed the viewport width.

- [ ] **Step 8: Verify reduced motion**

Emulate `prefers-reduced-motion: reduce`, reload, and scroll through the work section.

Expected:

- Device and orbit transforms remain static.
- All three projects, HUD navigation, text and detail links remain fully available.
- No scroll lock, continuous oscillation, or large parallax remains.

- [ ] **Step 9: Commit only if QA required corrections**

If Steps 5–8 require corrections, run:

```powershell
npm run verify:homepage
npm run build
git diff --check
git add src\components\ChapterHud.vue src\components\ProjectPremiere.vue src\views\HomeView.vue
git commit -m "fix: tune project premiere experience"
```

Expected: verification and build pass before the corrective commit. If no corrections are needed, skip this step.

---

## Self-Review

- Spec coverage: the plan implements only the approved first phase—three full-screen project scenes, per-project color and statement, a primary entrance motion, detail links, a chapter HUD, native scrolling, mobile layout, reduced motion, image failure fallback and UTF-8 verification.
- Scope: `/lab`, creative manifesto, horizontal process timeline and ending contact installation remain explicitly outside this plan and can ship independently later.
- Placeholder scan: every implementation and verification step contains concrete file paths, code, commands and expected outcomes.
- Type consistency: `chapterColor`, `statement`, `motionPreset`, `project`, `index`, `sections`, `activeSection`, `progress` and `navigate` use the same names in data, components, HomeView and verification.
- Boundary check: HomeView owns page composition and global section state; ProjectPremiere owns one project scene and its local progress; ChapterHud owns navigation display and emits only `navigate`.
