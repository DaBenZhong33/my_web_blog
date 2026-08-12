# Liquid Metal Backdrop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a low-opacity Liquid Metal shader backdrop to the existing homepage hero without changing the Vue site into a React/shadcn/Tailwind project.

**Architecture:** Add one focused Vue component, `LiquidMetalBackdrop.vue`, that owns the Paper Shaders lifecycle, fallback, motion preference handling, and cleanup. `HomeView.vue` only imports and places the component behind the existing hero content, while `scripts/verify-homepage-structure.mjs` provides lightweight structural coverage.

**Tech Stack:** Vue 3 SFC, Vite, `@paper-design/shaders@0.0.80`, existing CSS, existing homepage verification script.

---

## File Structure

- Create: `src/components/LiquidMetalBackdrop.vue`
  - Owns the `ShaderMount` lifecycle for the Liquid Metal background.
  - Provides CSS fallback when WebGL2 is unavailable or reduced motion is enabled.
  - Disposes Paper Shaders resources on unmount.

- Modify: `src/views/HomeView.vue`
  - Imports `LiquidMetalBackdrop`.
  - Renders it as a decorative layer inside `section.zel-hero`, before `.hero-shell`.
  - Adjusts hero stacking so the shader stays behind text, buttons, cube, grid, and noise.

- Modify: `scripts/verify-homepage-structure.mjs`
  - Adds UTF-8 and structure checks for the new component.
  - Checks `HomeView.vue` integration and `package.json` dependency.

- Modify: `package.json`
  - Adds `@paper-design/shaders`.

- Modify: `package-lock.json`
  - Updated by `npm install @paper-design/shaders@0.0.80`.

---

### Task 1: Add Verification Coverage And Dependency

**Files:**
- Modify: `scripts/verify-homepage-structure.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Extend the homepage verification script with failing checks**

In `scripts/verify-homepage-structure.mjs`, add `liquidMetalBackdrop` to the `files` object:

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

After `const canvasText = readUtf8(files.canvasText)`, add:

```js
const liquidMetalBackdrop = readUtf8(files.liquidMetalBackdrop)
```

Update the garbled text loop to include the new component:

```js
for (const [label, content] of Object.entries({
  home,
  rail,
  preview,
  style,
  heroCube,
  canvasText,
  liquidMetalBackdrop
})) {
  if (garbledPattern.test(content)) failures.push(`${label} contains garbled text marker`)
}
```

Add these `HomeView.vue` expectations near the other home import/render checks:

```js
for (const pattern of [
  /import LiquidMetalBackdrop from '\.\.\/components\/LiquidMetalBackdrop\.vue'/,
  /<LiquidMetalBackdrop[\s\S]*class="hero-liquid-backdrop"/,
  /\.hero-liquid-backdrop/,
  /isolation:\s*isolate/,
  /\.zel-hero::before[\s\S]*z-index:\s*1/,
  /\.hero-shell[\s\S]*z-index:\s*2/
]) {
  expectPattern(files.home, home, pattern)
}
```

Add these `LiquidMetalBackdrop.vue` expectations after the `CanvasText` checks:

```js
for (const pattern of [
  /from '@paper-design\/shaders'/,
  /ShaderMount/,
  /liquidMetalFragmentShader/,
  /LiquidMetalShapes/,
  /getShaderColorFromString/,
  /supportsWebgl2/,
  /prefers-reduced-motion: reduce/,
  /dispose/,
  /maxPixelCount/,
  /aria-hidden="true"/,
  /liquid-metal-backdrop__canvas/,
  /liquid-metal-backdrop__fallback/,
  /pointer-events:\s*none/
]) {
  expectPattern(files.liquidMetalBackdrop, liquidMetalBackdrop, pattern)
}
```

Change the package dependency expectation from only checking Three.js:

```js
expectPattern(files.packageJson, packageJson, /"three":/)
```

to:

```js
expectPattern(files.packageJson, packageJson, /"three":/)
expectPattern(files.packageJson, packageJson, /"@paper-design\/shaders":\s*"0\.0\.80"/)
```

- [ ] **Step 2: Run the verification script and confirm it fails for the new missing work**

Run:

```bash
npm run verify:homepage
```

Expected: `FAIL` with messages including:

```text
src/components/LiquidMetalBackdrop.vue is missing
src/views/HomeView.vue missing /import LiquidMetalBackdrop
package.json missing /"@paper-design\/shaders":\s*"0\.0\.80"/
```

- [ ] **Step 3: Install the pinned Paper Shaders dependency**

Run:

```bash
npm install @paper-design/shaders@0.0.80
```

Expected: `package.json` contains:

```json
"@paper-design/shaders": "0.0.80"
```

Expected: `package-lock.json` contains a locked `node_modules/@paper-design/shaders` entry at version `0.0.80`.

- [ ] **Step 4: Do not commit yet**

Leave the verification changes uncommitted until Tasks 2 and 3 add the component and homepage integration that make the checks pass.

---

### Task 2: Create LiquidMetalBackdrop Component

**Files:**
- Create: `src/components/LiquidMetalBackdrop.vue`

- [ ] **Step 1: Create the component with shader lifecycle, fallback, and cleanup**

Create `src/components/LiquidMetalBackdrop.vue` with this content:

```vue
<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import {
  ShaderMount,
  liquidMetalFragmentShader,
  LiquidMetalShapes,
  getShaderColorFromString
} from '@paper-design/shaders'

const canvasHost = ref(null)
const hasShader = ref(false)
const reducedMotion = ref(false)

let shader = null
let motionQuery = null

const getPerformanceSettings = () => {
  const width = window.innerWidth

  if (width < 720) {
    return {
      speed: 0,
      minPixelRatio: 1,
      maxPixelCount: 960 * 540
    }
  }

  if (width < 1080) {
    return {
      speed: 0.16,
      minPixelRatio: 1,
      maxPixelCount: 1280 * 720
    }
  }

  return {
    speed: 0.22,
    minPixelRatio: 1,
    maxPixelCount: 1600 * 900
  }
}

const supportsWebgl2 = () => {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2'))
  } catch {
    return false
  }
}

const destroyShader = () => {
  shader?.dispose?.()
  shader = null
  hasShader.value = false
}

const mountShader = () => {
  if (!canvasHost.value || reducedMotion.value || !supportsWebgl2()) {
    hasShader.value = false
    return
  }

  const { speed, minPixelRatio, maxPixelCount } = getPerformanceSettings()

  try {
    shader = new ShaderMount(
      canvasHost.value,
      liquidMetalFragmentShader,
      {
        u_isImage: false,
        u_shape: LiquidMetalShapes.none,
        u_colorBack: getShaderColorFromString('#050505'),
        u_colorTint: getShaderColorFromString('#d7ff00'),
        u_repetition: 2.35,
        u_softness: 0.42,
        u_distortion: 0.12,
        u_contour: 0.2,
        u_shiftRed: 0.06,
        u_shiftBlue: -0.06,
        u_angle: 116,
        u_fit: 2,
        u_scale: 1.18,
        u_rotation: 0,
        u_offsetX: 0.08,
        u_offsetY: -0.02,
        u_originX: 0.5,
        u_originY: 0.5,
        u_worldWidth: 0,
        u_worldHeight: 0
      },
      {
        alpha: true,
        antialias: true,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false
      },
      speed,
      0,
      minPixelRatio,
      maxPixelCount
    )

    hasShader.value = true
  } catch (error) {
    console.warn('LiquidMetalBackdrop failed to mount', error)
    destroyShader()
  }
}

const handleMotionPreference = () => {
  reducedMotion.value = motionQuery.matches
  destroyShader()
  mountShader()
}

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches

  if (motionQuery.addEventListener) {
    motionQuery.addEventListener('change', handleMotionPreference)
  } else {
    motionQuery.addListener(handleMotionPreference)
  }

  mountShader()
})

onBeforeUnmount(() => {
  if (motionQuery) {
    if (motionQuery.removeEventListener) {
      motionQuery.removeEventListener('change', handleMotionPreference)
    } else {
      motionQuery.removeListener(handleMotionPreference)
    }
  }

  destroyShader()
})
</script>

<template>
  <div
    class="liquid-metal-backdrop"
    :class="{ 'is-fallback': !hasShader || reducedMotion }"
    aria-hidden="true"
  >
    <div ref="canvasHost" class="liquid-metal-backdrop__canvas"></div>
    <div class="liquid-metal-backdrop__fallback"></div>
    <div class="liquid-metal-backdrop__veil"></div>
  </div>
</template>

<style scoped>
.liquid-metal-backdrop {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  opacity: 0.54;
  mix-blend-mode: screen;
}

.liquid-metal-backdrop__canvas,
.liquid-metal-backdrop__fallback,
.liquid-metal-backdrop__veil {
  position: absolute;
  inset: 0;
}

.liquid-metal-backdrop__canvas {
  z-index: 1;
}

.liquid-metal-backdrop__canvas :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}

.liquid-metal-backdrop__fallback {
  z-index: 0;
  background:
    radial-gradient(circle at 76% 32%, rgba(215, 255, 0, 0.18), transparent 28%),
    radial-gradient(circle at 42% 62%, rgba(210, 218, 206, 0.16), transparent 34%),
    linear-gradient(112deg, transparent 0 24%, rgba(255, 255, 255, 0.08) 37%, transparent 52% 100%),
    linear-gradient(145deg, rgba(8, 10, 10, 0.2), rgba(124, 132, 123, 0.14), rgba(5, 5, 5, 0.12));
  filter: blur(0.4px);
}

.liquid-metal-backdrop__veil {
  z-index: 2;
  background:
    linear-gradient(90deg, rgba(5, 5, 5, 0.9), rgba(5, 5, 5, 0.42) 48%, rgba(5, 5, 5, 0.7)),
    linear-gradient(180deg, rgba(5, 5, 5, 0.2), rgba(5, 5, 5, 0.78));
}

.liquid-metal-backdrop.is-fallback {
  opacity: 0.48;
  mix-blend-mode: normal;
}

.liquid-metal-backdrop.is-fallback .liquid-metal-backdrop__canvas {
  display: none;
}

@media (max-width: 720px) {
  .liquid-metal-backdrop {
    opacity: 0.38;
  }

  .liquid-metal-backdrop__veil {
    background:
      linear-gradient(180deg, rgba(5, 5, 5, 0.62), rgba(5, 5, 5, 0.86)),
      linear-gradient(90deg, rgba(5, 5, 5, 0.84), rgba(5, 5, 5, 0.54));
  }
}

@media (prefers-reduced-motion: reduce) {
  .liquid-metal-backdrop__canvas {
    display: none;
  }
}
</style>
```

- [ ] **Step 2: Run the verification script and confirm the remaining failures are only homepage integration**

Run:

```bash
npm run verify:homepage
```

Expected: `FAIL` with `HomeView.vue` failures for the missing import, render, and stacking CSS. The component-specific checks should no longer fail.

---

### Task 3: Integrate Backdrop Into HomeView

**Files:**
- Modify: `src/views/HomeView.vue`

- [ ] **Step 1: Import the new component**

In `src/views/HomeView.vue`, add this import after `HeroMetalCube`:

```js
import HeroMetalCube from '../components/HeroMetalCube.vue'
import LiquidMetalBackdrop from '../components/LiquidMetalBackdrop.vue'
import CanvasText from '../components/CanvasText.vue'
```

- [ ] **Step 2: Render the backdrop inside the hero section**

In the template, change the start of the hero section from:

```vue
<section id="intro" class="zel-hero">
  <div class="container hero-shell">
```

to:

```vue
<section id="intro" class="zel-hero">
  <LiquidMetalBackdrop class="hero-liquid-backdrop" />

  <div class="container hero-shell">
```

- [ ] **Step 3: Update hero stacking CSS**

In the `.zel-hero` rule, add `isolation: isolate;`:

```css
.zel-hero {
  position: relative;
  isolation: isolate;
  min-height: 860px;
  overflow: hidden;
  border-bottom: 1px solid var(--grid-line);
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 340px 100%, 100% 290px;
}
```

Add a hero backdrop placement rule after `.zel-hero::before`:

```css
.hero-liquid-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
}
```

Update `.zel-hero::before` so the noise layer sits above the shader and below content:

```css
.zel-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  background: url("/template-assets/noise-texture.png") top center / cover no-repeat;
  opacity: 0.34;
  pointer-events: none;
}
```

Update `.hero-shell` so it stays above the shader and noise:

```css
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
```

Update `.hero-wordmark` so it remains visible but decorative:

```css
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
```

- [ ] **Step 4: Run homepage verification**

Run:

```bash
npm run verify:homepage
```

Expected:

```text
Homepage structure verification passed.
```

- [ ] **Step 5: Commit the dependency, verification, component, and homepage integration**

Run:

```bash
git add package.json package-lock.json scripts/verify-homepage-structure.mjs src/components/LiquidMetalBackdrop.vue src/views/HomeView.vue
git commit -m "feat: add liquid metal hero backdrop"
```

Expected: commit succeeds with the five modified or created implementation files.

---

### Task 4: Build, Encoding Check, And Visual Verification

**Files:**
- No planned source edits. If visual tuning is required, modify only `src/components/LiquidMetalBackdrop.vue` and `src/views/HomeView.vue`.

- [ ] **Step 1: Run production build**

Run:

```bash
npm run build
```

Expected: Vite build completes successfully and writes `dist/`.

- [ ] **Step 2: Run UTF-8 reads for all changed text files**

Run:

```bash
Get-Content -Raw -Encoding UTF8 package.json | Out-Null
Get-Content -Raw -Encoding UTF8 scripts\verify-homepage-structure.mjs | Out-Null
Get-Content -Raw -Encoding UTF8 src\components\LiquidMetalBackdrop.vue | Out-Null
Get-Content -Raw -Encoding UTF8 src\views\HomeView.vue | Out-Null
```

Expected: each command exits successfully with no decoding error.

- [ ] **Step 3: Scan for common garbled text markers**

Run:

```bash
$garbledPattern = "$([char]0xFFFD)|$([char]0x951F)|$([char]0x00C3)|$([char]0x00C2)"
rg $garbledPattern package.json scripts\verify-homepage-structure.mjs src\components\LiquidMetalBackdrop.vue src\views\HomeView.vue
```

Expected: exit code `1` with no matches.

- [ ] **Step 4: Start or reuse the Vite dev server**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected: Vite prints a local URL such as:

```text
Local:   http://127.0.0.1:5173/
```

If port `5173` is occupied, use the URL Vite prints.

- [ ] **Step 5: Check desktop hero in the browser**

Open the local Vite URL at a desktop viewport such as `1440x1000`.

Expected:

- The first viewport still shows the current hero text, buttons, and `HeroMetalCube`.
- A subtle Liquid Metal movement is visible behind the hero content.
- The shader does not capture clicks on “查看作品” or “了解我”.
- Text remains readable against the background.
- The cube hover/unfold interaction still works.

- [ ] **Step 6: Check mobile hero in the browser**

Open the same page at a mobile viewport such as `390x844`.

Expected:

- No horizontal overflow.
- Hero title, subtitle, buttons, cube, and wordmark do not overlap incoherently.
- The backdrop is weaker than the desktop backdrop or static.
- The cube remains visible and usable.

- [ ] **Step 7: Commit any visual tuning**

If Steps 5 or 6 required edits, run:

```bash
npm run verify:homepage
npm run build
git add src\components\LiquidMetalBackdrop.vue src\views\HomeView.vue
git commit -m "fix: tune liquid metal backdrop"
```

Expected: verification and build pass before the commit.

If no edits were required, skip this step and keep the working tree clean.

---

## Self-Review

- Spec coverage: dependency choice, Vue-native component path, HomeView integration, fallback, cleanup, reduced motion, WebGL support, mobile performance, UTF-8 verification, and browser checks are covered.
- Placeholder scan: the plan contains no unresolved implementation blanks.
- Type and API consistency: every task uses `LiquidMetalBackdrop.vue`, `ShaderMount`, `liquidMetalFragmentShader`, `LiquidMetalShapes`, `getShaderColorFromString`, `supportsWebgl2`, and `dispose` consistently.
- Scope check: this is one homepage background subsystem and does not require decomposition into separate plans.
