# Homepage Structure Interactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the homepage structure and interaction changes described in `docs/superpowers/specs/2026-08-11-homepage-structure-interactions-design.md`.

**Architecture:** Keep `HomeView.vue` responsible for page data, section registration, and layout composition. Move the three interactive surfaces into focused Vue components: `SectionRail.vue`, `StatusTerminal.vue`, and `ProjectPreviewCard.vue`.

**Tech Stack:** Vue 3 Composition API, Vue Router, scoped CSS, browser `IntersectionObserver`, `requestAnimationFrame`, and existing project data from `src/data/projects.js`.

---

## File Structure

- Create: `src/components/SectionRail.vue`
  - Shows section navigation and scroll progress.
  - Emits `navigate` with a section id.
- Create: `src/components/StatusTerminal.vue`
  - Shows clickable homepage status rows.
  - Owns selected status state.
- Create: `src/components/ProjectPreviewCard.vue`
  - Shows a project tile with quick preview.
  - Owns expanded preview state for touch and keyboard users.
- Modify: `src/views/HomeView.vue`
  - Imports the new components.
  - Defines `sections`, `statusItems`, and section/progress state.
  - Adds `id` attributes for `intro`, `build`, `story`, `work`, `process`, and `contact`.
- Modify: `src/style.css`
  - Adds shared focus-visible styles and reduced-motion coverage for new interactions if component scoped CSS is not enough.

---

### Task 1: Add `SectionRail`

**Files:**
- Create: `src/components/SectionRail.vue`

- [ ] **Step 1: Create component script and template**

Use this public interface:

```vue
<script setup>
defineProps({
  sections: { type: Array, required: true },
  activeSection: { type: String, required: true },
  progress: { type: Number, default: 0 }
})

const emit = defineEmits(['navigate'])
</script>
```

The template renders a `nav` with a progress bar and one button per section. Each button calls `emit('navigate', section.id)`.

- [ ] **Step 2: Add scoped styles**

Desktop uses a fixed left rail. Mobile uses a sticky horizontal pill bar. Buttons must have visible `:focus-visible` styles and must not rely on color only for the active state.

- [ ] **Step 3: Verify component compiles**

Run: `npm run build`

Expected: build succeeds or only fails for unrelated pre-existing syntax issues.

---

### Task 2: Add `StatusTerminal`

**Files:**
- Create: `src/components/StatusTerminal.vue`

- [ ] **Step 1: Create component script and template**

Use this public interface:

```vue
<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  items: { type: Array, required: true }
})

const activeIndex = ref(0)
const activeItem = computed(() => props.items[activeIndex.value] ?? props.items[0])
</script>
```

The template renders terminal chrome, one clickable row per item, and a detail panel for `activeItem.detail`.

- [ ] **Step 2: Add scoped styles**

Match the homepage palette: black panel, acid-green active marker, square corners, monospace metadata, light scanline animation. Disable scanline animation under `prefers-reduced-motion: reduce`.

- [ ] **Step 3: Verify component compiles**

Run: `npm run build`

Expected: build succeeds or only fails for unrelated pre-existing syntax issues.

---

### Task 3: Add `ProjectPreviewCard`

**Files:**
- Create: `src/components/ProjectPreviewCard.vue`

- [ ] **Step 1: Create component script and template**

Use this public interface:

```vue
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
</script>
```

The template renders the existing project visual, a details link to `/project/:id`, and a `button` that toggles the preview. The preview includes description, first three features, tech tags, screenshot labels, and details link.

- [ ] **Step 2: Add scoped styles**

Desktop shows the preview on `:hover`, `:focus-within`, or expanded state. Mobile keeps the preview collapsed until the button is clicked. The tile remains keyboard reachable and has visible focus.

- [ ] **Step 3: Verify component compiles**

Run: `npm run build`

Expected: build succeeds or only fails for unrelated pre-existing syntax issues.

---

### Task 4: Wire Homepage State And Sections

**Files:**
- Modify: `src/views/HomeView.vue`

- [ ] **Step 1: Replace imports**

Import the new components and remove direct `PhoneMockup` / `AppIcon` imports if they are no longer used directly by the page.

- [ ] **Step 2: Add homepage state**

Add:

```js
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

const activeSection = ref(sections[0].id)
const scrollProgress = ref(0)
```

- [ ] **Step 3: Add scroll helpers**

Register `IntersectionObserver` for all section ids. Add a passive `scroll` listener that computes document scroll progress with `requestAnimationFrame`.

- [ ] **Step 4: Add navigation handler**

Add:

```js
const navigateToSection = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
```

Respect reduced motion by using instant scroll if `window.matchMedia('(prefers-reduced-motion: reduce)').matches`.

---

### Task 5: Update Homepage Markup

**Files:**
- Modify: `src/views/HomeView.vue`

- [ ] **Step 1: Add `SectionRail` near page root**

Render:

```vue
<SectionRail
  :sections="sections"
  :active-section="activeSection"
  :progress="scrollProgress"
  @navigate="navigateToSection"
/>
```

- [ ] **Step 2: Add section ids**

Set ids exactly:

```vue
<section id="intro" class="zel-hero">
<section id="build" class="section service-section">
<section id="story" class="light-section">
<section id="work" class="section project-section">
<section id="process" class="process-section">
<section id="contact" class="final-cta">
```

- [ ] **Step 3: Replace floating status cards**

Replace the three `.status-card` blocks in the hero visual with:

```vue
<StatusTerminal :items="statusItems" />
```

- [ ] **Step 4: Replace project tiles**

Replace the project `RouterLink` loop with:

```vue
<ProjectPreviewCard
  v-for="(p, i) in projects"
  :key="p.id"
  :project="p"
  :image="projectImages[i % projectImages.length]"
  :asset-base="assetBase"
  v-reveal
/>
```

- [ ] **Step 5: Remove obsolete homepage styles**

Delete CSS selectors that only support the old inline project tile and floating status cards. Keep shared layout selectors used by the new components.

---

### Task 6: Verification

**Files:**
- Validate: all modified Vue/CSS files

- [ ] **Step 1: Build**

Run: `npm run build`

Expected: Vite production build succeeds.

- [ ] **Step 2: UTF-8 readback**

Run:

```powershell
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
Get-Content -LiteralPath 'src\views\HomeView.vue' -Encoding UTF8 | Out-Null
Get-Content -LiteralPath 'src\components\SectionRail.vue' -Encoding UTF8 | Out-Null
Get-Content -LiteralPath 'src\components\StatusTerminal.vue' -Encoding UTF8 | Out-Null
Get-Content -LiteralPath 'src\components\ProjectPreviewCard.vue' -Encoding UTF8 | Out-Null
```

Expected: commands complete without encoding errors.

- [ ] **Step 3: Garbled text scan**

Run:

```powershell
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
rg "\x{FFFD}|\x{951F}|\x{00C3}|\x{00C2}" src docs
```

Expected: no matches.

- [ ] **Step 4: Runtime visual smoke test**

Start dev server with `npm run dev -- --host 127.0.0.1`. Check desktop and mobile widths for these conditions:

- Section navigation is visible and clickable.
- Hero title, CTA, and status terminal do not overlap.
- Project preview opens by hover/focus on desktop and button click on mobile.
- Contact section is reachable through the rail.
