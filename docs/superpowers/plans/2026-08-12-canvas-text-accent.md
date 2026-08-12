# Canvas Text Accent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the confirmed A+C CanvasText-style line trail effect to homepage `CODE SYSTEMS` and CTA `SHIP` using the site's black and fluorescent yellow palette.

**Architecture:** Add a focused Vue component that renders readable text plus decorative CSS line trails. `HomeView.vue` owns the two homepage placements and color arrays. The existing homepage verification script guards the component integration, reduced-motion rule, palette, and UTF-8 safety.

**Tech Stack:** Vue 3 Composition API, scoped CSS, existing Vite build, existing `scripts/verify-homepage-structure.mjs`.

---

## File Structure

- Create: `src/components/CanvasText.vue`
  - Render one short text token with CanvasText-like line trails.
  - Expose props compatible with the user's reference names: `text`, `colors`, `lineGap`, `animationDuration`, and `backgroundClassName`.
  - Keep text readable and decorative layers hidden from assistive tech.
- Modify: `src/views/HomeView.vue`
  - Import `CanvasText`.
  - Define `canvasAccentColors` for black hero sections and `canvasInverseColors` for yellow CTA sections.
  - Replace the hero `CODE SYSTEMS` text and CTA `SHIP` word with `CanvasText`.
- Modify: `scripts/verify-homepage-structure.mjs`
  - Add `CanvasText.vue` to UTF-8 and structure checks.
  - Replace the old `CODE SYSTEMS` marked-span expectation with CanvasText expectations.
  - Reject the reference blue color.

---

### Task 1: Add Failing Verification For CanvasText Integration

**Files:**
- Modify: `scripts/verify-homepage-structure.mjs`

- [ ] **Step 1: Add `CanvasText.vue` to the verified files**

Update the `files` object to include `canvasText`:

```js
const files = {
  home: 'src/views/HomeView.vue',
  rail: 'src/components/SectionRail.vue',
  preview: 'src/components/ProjectPreviewCard.vue',
  style: 'src/style.css',
  heroCube: 'src/components/HeroMetalCube.vue',
  canvasText: 'src/components/CanvasText.vue',
  packageJson: 'package.json'
}
```

Add this read after `heroCube`:

```js
const canvasText = readUtf8(files.canvasText)
```

Update the garbled scan loop:

```js
for (const [label, content] of Object.entries({ home, rail, preview, style, heroCube, canvasText })) {
  if (garbledPattern.test(content)) failures.push(`${label} contains garbled text marker`)
}
```

- [ ] **Step 2: Replace the old hero marked-span expectation**

Remove this pattern from the homepage expectation list:

```js
/class="marked">CODE SYSTEMS</,
```

Add these patterns to the homepage expectation list:

```js
/import CanvasText from '\.\.\/components\/CanvasText\.vue'/,
/const canvasAccentColors = \[/,
/const canvasInverseColors = \[/,
/<CanvasText[\s\S]*text="CODE SYSTEMS"/,
/<CanvasText[\s\S]*text="SHIP"/,
/class="marked canvas-title-accent"/,
/class="canvas-title-inverse"/
```

- [ ] **Step 3: Add component-level verification**

Add this block after the homepage reject checks:

```js
for (const pattern of [
  /defineProps/,
  /text: \{ type: String, required: true \}/,
  /colors: \{ type: Array,/,
  /lineGap: \{ type: Number, default: 4 \}/,
  /animationDuration: \{ type: Number, default: 20 \}/,
  /backgroundClassName: \{ type: String, default: '' \}/,
  /computed/,
  /--canvas-color-1/,
  /aria-label="text"/,
  /aria-hidden="true"/,
  /\.canvas-text/,
  /\.canvas-text__line-layer/,
  /@keyframes canvasTextSweep/,
  /prefers-reduced-motion: reduce/
]) {
  expectPattern(files.canvasText, canvasText, pattern)
}
```

- [ ] **Step 4: Reject the reference blue palette**

Add this rejection after the component-level verification:

```js
for (const pattern of [
  /0,\s*153,\s*255/,
  /bg-blue-600/,
  /bg-blue-700/
]) {
  rejectPattern(files.home, home, pattern)
  rejectPattern(files.canvasText, canvasText, pattern)
}
```

- [ ] **Step 5: Run verification and confirm RED**

Run:

```powershell
npm run verify:homepage
```

Expected result:

```text
Homepage structure verification failed:
```

The failures should include the missing `src/components/CanvasText.vue` file and missing `CanvasText` homepage markers.

---

### Task 2: Create The Vue CanvasText Component

**Files:**
- Create: `src/components/CanvasText.vue`

- [ ] **Step 1: Add the component script and template**

Create `src/components/CanvasText.vue` with this content:

```vue
<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: { type: String, required: true },
  colors: {
    type: Array,
    default: () => [
      'rgba(215, 255, 0, 1)',
      'rgba(215, 255, 0, 0.9)',
      'rgba(215, 255, 0, 0.78)',
      'rgba(215, 255, 0, 0.6)',
      'rgba(215, 255, 0, 0.42)',
      'rgba(215, 255, 0, 0.24)',
      'rgba(215, 255, 0, 0.12)'
    ]
  },
  lineGap: { type: Number, default: 4 },
  animationDuration: { type: Number, default: 20 },
  backgroundClassName: { type: String, default: '' }
})

const layerCount = 10

const colorAt = (index) => (
  props.colors[index]
  ?? props.colors[props.colors.length - 1]
  ?? 'currentColor'
)

const textStyle = computed(() => {
  const styles = {
    '--canvas-line-gap': `${props.lineGap}px`,
    '--canvas-duration': `${props.animationDuration}s`
  }

  for (let i = 0; i < layerCount; i += 1) {
    styles[`--canvas-color-${i + 1}`] = colorAt(i)
  }

  return styles
})
</script>

<template>
  <span
    class="canvas-text"
    :class="backgroundClassName"
    :style="textStyle"
    :aria-label="text"
  >
    <span class="canvas-text__content">{{ text }}</span>
    <span class="canvas-text__line-layer canvas-text__line-layer--back" aria-hidden="true">{{ text }}</span>
    <span class="canvas-text__line-layer canvas-text__line-layer--front" aria-hidden="true">{{ text }}</span>
    <span class="canvas-text__streaks" aria-hidden="true"></span>
  </span>
</template>
```

- [ ] **Step 2: Add scoped component styles**

Append this style block to `CanvasText.vue`:

```vue
<style scoped>
.canvas-text {
  position: relative;
  display: inline-block;
  color: var(--canvas-color-1);
  isolation: isolate;
  white-space: normal;
  text-shadow:
    0 0 1px var(--canvas-color-3),
    0 0 18px var(--canvas-color-6);
}

.canvas-text__content {
  position: relative;
  z-index: 2;
}

.canvas-text__line-layer,
.canvas-text__streaks {
  position: absolute;
  pointer-events: none;
}

.canvas-text__line-layer {
  inset: 0;
  z-index: 1;
  color: transparent;
  -webkit-text-stroke: 1px var(--canvas-color-4);
  clip-path: polygon(
    0 5%, 88% 5%, 88% 10%, 0 10%,
    0 18%, 100% 18%, 100% 23%, 0 23%,
    0 31%, 74% 31%, 74% 36%, 0 36%,
    0 44%, 96% 44%, 96% 49%, 0 49%,
    0 57%, 82% 57%, 82% 62%, 0 62%,
    0 70%, 100% 70%, 100% 75%, 0 75%,
    0 83%, 90% 83%, 90% 88%, 0 88%
  );
}

.canvas-text__line-layer--back {
  transform: translateX(-0.08em);
  animation: canvasTextGhost var(--canvas-duration) ease-in-out infinite;
}

.canvas-text__line-layer--front {
  z-index: 3;
  -webkit-text-stroke-color: var(--canvas-color-6);
  transform: translateX(0.1em);
  mix-blend-mode: screen;
  animation: canvasTextGhost var(--canvas-duration) ease-in-out infinite reverse;
}

.canvas-text__streaks {
  left: -0.04em;
  right: -0.14em;
  top: 0.06em;
  bottom: 0.04em;
  z-index: 0;
  background:
    linear-gradient(90deg, var(--canvas-color-1), transparent 72%) 0 10% / 92% 2px no-repeat,
    linear-gradient(90deg, var(--canvas-color-2), transparent 70%) 0 calc(10% + var(--canvas-line-gap) * 2) / 100% 2px no-repeat,
    linear-gradient(90deg, var(--canvas-color-3), transparent 70%) 0 36% / 78% 2px no-repeat,
    linear-gradient(90deg, var(--canvas-color-4), transparent 72%) 0 50% / 96% 2px no-repeat,
    linear-gradient(90deg, var(--canvas-color-5), transparent 72%) 0 64% / 86% 2px no-repeat,
    linear-gradient(90deg, var(--canvas-color-6), transparent 70%) 0 78% / 98% 2px no-repeat,
    linear-gradient(90deg, var(--canvas-color-7), transparent 68%) 0 90% / 74% 2px no-repeat;
  filter: drop-shadow(0 0 10px var(--canvas-color-6));
  animation: canvasTextSweep var(--canvas-duration) ease-in-out infinite;
}

@keyframes canvasTextSweep {
  0%, 100% {
    transform: translateX(-0.16em);
    opacity: 0.42;
  }

  48% {
    transform: translateX(0.1em);
    opacity: 0.96;
  }
}

@keyframes canvasTextGhost {
  0%, 100% {
    opacity: 0.18;
  }

  46% {
    opacity: 0.76;
  }
}

@media (prefers-reduced-motion: reduce) {
  .canvas-text {
    text-shadow: none;
  }

  .canvas-text__line-layer,
  .canvas-text__streaks {
    animation: none;
  }
}
</style>
```

- [ ] **Step 3: Run verification and confirm partial RED**

Run:

```powershell
npm run verify:homepage
```

Expected result: verification still fails because `HomeView.vue` has not imported or rendered `CanvasText`.

---

### Task 3: Wire CanvasText Into The Homepage

**Files:**
- Modify: `src/views/HomeView.vue`

- [ ] **Step 1: Import the component**

Add this import after the existing component imports:

```js
import CanvasText from '../components/CanvasText.vue'
```

- [ ] **Step 2: Add homepage color arrays**

Add these arrays after `assetBase`:

```js
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
```

- [ ] **Step 3: Replace the hero marked text**

Replace:

```vue
<span class="marked">CODE SYSTEMS</span>
```

with:

```vue
<span class="marked canvas-title-accent">
  <CanvasText
    text="CODE SYSTEMS"
    :colors="canvasAccentColors"
    :line-gap="4"
    :animation-duration="20"
  />
</span>
```

- [ ] **Step 4: Replace the CTA title**

Replace:

```vue
<h2>IT'S TIME TO SHIP YOUR SMALL PRODUCT.</h2>
```

with:

```vue
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
```

- [ ] **Step 5: Add local title layout styles**

Add this rule after `.hero-title .marked`:

```css
.canvas-title-accent {
  text-decoration: none;
}
```

Add this rule after `.final-cta h2`:

```css
.final-cta h2 span,
.final-cta h2 :deep(.canvas-title-inverse) {
  display: block;
}
```

- [ ] **Step 6: Run verification and confirm GREEN**

Run:

```powershell
npm run verify:homepage
```

Expected result:

```text
Homepage structure verification passed.
```

---

### Task 4: Build And Encoding Verification

**Files:**
- Validate: `src/components/CanvasText.vue`
- Validate: `src/views/HomeView.vue`
- Validate: `scripts/verify-homepage-structure.mjs`

- [ ] **Step 1: Run homepage verification**

Run:

```powershell
npm run verify:homepage
```

Expected result:

```text
Homepage structure verification passed.
```

- [ ] **Step 2: Run production build**

Run:

```powershell
npm run build
```

Expected result: Vite build completes and prints a `dist/` output summary.

- [ ] **Step 3: Read modified files as UTF-8**

Run:

```powershell
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
Get-Content -LiteralPath 'src\components\CanvasText.vue' -Encoding UTF8 | Out-Null
Get-Content -LiteralPath 'src\views\HomeView.vue' -Encoding UTF8 | Out-Null
Get-Content -LiteralPath 'scripts\verify-homepage-structure.mjs' -Encoding UTF8 | Out-Null
```

Expected result: all commands complete without output.

- [ ] **Step 4: Scan source, scripts, and docs for common garbled text markers**

Run:

```powershell
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
rg "\x{FFFD}|\x{951F}|\x{00C3}|\x{00C2}" src scripts docs
```

Expected result: no matches.

- [ ] **Step 5: Check whitespace and worktree status**

Run:

```powershell
git diff --check
git status --short
```

Expected result: `git diff --check` exits successfully. `git status --short` lists only the planned implementation files if changes are not committed yet.

---

## Self-Review

- Spec coverage: Task 1 covers verification, Task 2 covers the Vue component and reduced-motion behavior, Task 3 covers the A+C homepage placements and site palette, Task 4 covers build and UTF-8 checks.
- Placeholder scan: no `TBD`, `TODO`, or deferred implementation notes remain.
- Type consistency: prop names, CSS classes, and verification markers match across tasks.
