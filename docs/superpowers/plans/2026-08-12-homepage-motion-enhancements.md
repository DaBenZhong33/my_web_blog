# Homepage Motion Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the confirmed homepage micro-motion enhancements: number ticker, project card spotlight, button shimmer border, one-shot title glitch reveal, and marquee texture without adding dependencies.

**Architecture:** Keep the existing Vue 3 component structure. `HomeView.vue` keeps homepage data and markup markers, `StatusTerminal.vue` owns terminal value rendering, `ProjectPreviewCard.vue` owns pointer-driven card effects, and `src/style.css` holds shared ticker, button, glitch, marquee, and reduced-motion styles.

**Tech Stack:** Vue 3 Composition API, scoped CSS, global CSS, existing Vite scripts, existing `scripts/verify-homepage-structure.mjs`.

---

## File Structure

- Modify: `scripts/verify-homepage-structure.mjs`
  - Add checks for new motion markers before production code exists.
  - Include `src/style.css` in UTF-8 and garbled text checks.
- Modify: `src/components/StatusTerminal.vue`
  - Split status values into text and numeric tokens.
  - Render numeric tokens with shared `.number-ticker` markup.
- Modify: `src/views/HomeView.vue`
  - Add ticker helpers for metric values.
  - Mark `CODE SYSTEMS` with `glitch-reveal`.
  - Render metrics through `.metric-ticker`.
- Modify: `src/components/ProjectPreviewCard.vue`
  - Track pointer position in CSS variables.
  - Add spotlight and comet visual layers.
- Modify: `src/style.css`
  - Add shared number ticker CSS.
  - Add button shimmer border CSS.
  - Add glitch reveal CSS.
  - Add signal strip texture.
  - Extend reduced-motion rules.

---

### Task 1: Add Failing Verification For Motion Markers

**Files:**
- Modify: `scripts/verify-homepage-structure.mjs`

- [ ] **Step 1: Add style file loading to the verification script**

Update the `files` object so it includes `src/style.css`:

```js
const files = {
  home: 'src/views/HomeView.vue',
  rail: 'src/components/SectionRail.vue',
  terminal: 'src/components/StatusTerminal.vue',
  preview: 'src/components/ProjectPreviewCard.vue',
  style: 'src/style.css'
}
```

Add this read after `preview`:

```js
const style = readUtf8(files.style)
```

Update the garbled scan loop so `style` is included:

```js
for (const [label, content] of Object.entries({ home, rail, terminal, preview, style })) {
  if (garbledPattern.test(content)) failures.push(`${label} contains garbled text marker`)
}
```

- [ ] **Step 2: Add expected motion markers**

Add these checks near the existing homepage checks:

```js
for (const pattern of [
  /class="marked glitch-reveal"/,
  /data-text="CODE SYSTEMS"/,
  /metric-ticker/,
  /splitTickerValue\(metric\.value\)/
]) {
  expectPattern(files.home, home, pattern)
}
```

Add these checks near the existing terminal checks:

```js
for (const pattern of [
  /const tickerDigits = \[/,
  /const splitTickerValue = \(value\) =>/,
  /number-ticker/,
  /ticker-digit-strip/
]) {
  expectPattern(files.terminal, terminal, pattern)
}
```

Add these checks near the existing project preview checks:

```js
for (const pattern of [
  /spotlightStyle = ref/,
  /const updateSpotlight = \(event\) =>/,
  /--spotlight-x/,
  /project-spotlight/,
  /project-comet/
]) {
  expectPattern(files.preview, preview, pattern)
}
```

Add these checks after the preview checks:

```js
for (const pattern of [
  /@keyframes digitTicker/,
  /@keyframes glitchReveal/,
  /--btn-shimmer/,
  /signal-strip::before/,
  /prefers-reduced-motion: reduce[\s\S]*ticker-digit-strip/
]) {
  expectPattern(files.style, style, pattern)
}
```

- [ ] **Step 3: Run verification and confirm RED**

Run:

```powershell
npm run verify:homepage
```

Expected result:

```text
Homepage structure verification failed:
```

The failures should mention missing motion markers such as `glitch-reveal`, `number-ticker`, `project-spotlight`, or `@keyframes digitTicker`.

- [ ] **Step 4: Commit the failing verification**

Run:

```powershell
git add -- scripts\verify-homepage-structure.mjs
git commit -m "test: add homepage motion verification"
```

Expected result: a commit is created containing only `scripts/verify-homepage-structure.mjs`.

---

### Task 2: Add Number Ticker Rendering To Status Terminal

**Files:**
- Modify: `src/components/StatusTerminal.vue`

- [ ] **Step 1: Add ticker helpers to the script block**

Insert these declarations after `activeItem`:

```js
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
```

- [ ] **Step 2: Replace terminal row value rendering**

Replace:

```vue
<strong>{{ item.value }}</strong>
```

with:

```vue
<strong :aria-label="item.value">
  <template v-for="part in splitTickerValue(item.value)" :key="part.key">
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
```

- [ ] **Step 3: Run verification and confirm partial RED**

Run:

```powershell
npm run verify:homepage
```

Expected result: verification still fails because `HomeView.vue`, `ProjectPreviewCard.vue`, and `src/style.css` markers are not implemented yet.

- [ ] **Step 4: Commit terminal ticker markup**

Run:

```powershell
git add -- src\components\StatusTerminal.vue
git commit -m "feat: add status terminal ticker markup"
```

Expected result: a commit is created containing only `src/components/StatusTerminal.vue`.

---

### Task 3: Add Homepage Metric Ticker Markup And Title Glitch Marker

**Files:**
- Modify: `src/views/HomeView.vue`

- [ ] **Step 1: Add ticker helpers to the script block**

Insert these declarations after the `metrics` array:

```js
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
```

- [ ] **Step 2: Add glitch marker to the hero title**

Replace:

```vue
<span class="marked">CODE SYSTEMS</span>
```

with:

```vue
<span class="marked glitch-reveal" data-text="CODE SYSTEMS">CODE SYSTEMS</span>
```

- [ ] **Step 3: Replace metric value rendering**

Replace:

```vue
<strong>{{ metric.value }}</strong>
```

with:

```vue
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
```

- [ ] **Step 4: Run verification and confirm partial RED**

Run:

```powershell
npm run verify:homepage
```

Expected result: verification still fails because `ProjectPreviewCard.vue` and `src/style.css` markers are not implemented yet.

- [ ] **Step 5: Commit homepage ticker and glitch markup**

Run:

```powershell
git add -- src\views\HomeView.vue
git commit -m "feat: add homepage ticker and glitch markers"
```

Expected result: a commit is created containing only `src/views/HomeView.vue`.

---

### Task 4: Add Spotlight Layers To Project Preview Cards

**Files:**
- Modify: `src/components/ProjectPreviewCard.vue`

- [ ] **Step 1: Add spotlight state and handlers**

Insert these declarations after `hasImageError`:

```js
const spotlightStyle = ref({
  '--spotlight-x': '50%',
  '--spotlight-y': '42%'
})

const updateSpotlight = (event) => {
  const rect = event.currentTarget.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100

  spotlightStyle.value = {
    '--spotlight-x': `${Math.min(Math.max(x, 0), 100).toFixed(2)}%`,
    '--spotlight-y': `${Math.min(Math.max(y, 0), 100).toFixed(2)}%`
  }
}

const resetSpotlight = () => {
  spotlightStyle.value = {
    '--spotlight-x': '50%',
    '--spotlight-y': '42%'
  }
}
```

Update `closePreview` so it resets the spotlight:

```js
const closePreview = (event) => {
  if (event?.currentTarget?.contains(event.relatedTarget)) return
  isPreviewOpen.value = false
  resetSpotlight()
}
```

- [ ] **Step 2: Bind spotlight style and pointer handler**

Replace the article opening tag attributes:

```vue
:style="{ '--tile-accent': project.accent }"
@mouseenter="openPreview"
@mouseleave="closePreview"
```

with:

```vue
:style="[{ '--tile-accent': project.accent }, spotlightStyle]"
@mouseenter="openPreview"
@mousemove="updateSpotlight"
@mouseleave="closePreview"
```

- [ ] **Step 3: Add visual layers to the template**

Insert these layers after `.project-overlay`:

```vue
<span class="project-spotlight" aria-hidden="true"></span>
<span class="project-comet" aria-hidden="true"></span>
```

- [ ] **Step 4: Add scoped card effect styles**

Add these rules after `.project-preview-card`:

```css
.project-preview-card {
  --spotlight-x: 50%;
  --spotlight-y: 42%;
  isolation: isolate;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.project-preview-card:hover,
.project-preview-card:focus-within,
.project-preview-card.preview-open {
  border-color: color-mix(in srgb, var(--tile-accent) 72%, var(--accent));
  box-shadow:
    0 0 0 1px rgba(215, 255, 0, 0.08),
    0 24px 70px rgba(0, 0, 0, 0.36);
}
```

Add these rules after `.project-overlay`:

```css
.project-spotlight,
.project-comet {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.project-spotlight {
  background:
    radial-gradient(
      circle at var(--spotlight-x) var(--spotlight-y),
      color-mix(in srgb, var(--tile-accent) 42%, transparent) 0,
      rgba(215, 255, 0, 0.12) 16%,
      transparent 42%
    ),
    linear-gradient(
      135deg,
      transparent 0 42%,
      rgba(215, 255, 0, 0.16) 49%,
      transparent 56% 100%
    );
  mix-blend-mode: screen;
}

.project-comet {
  background:
    linear-gradient(
      115deg,
      transparent 0 30%,
      color-mix(in srgb, var(--tile-accent) 72%, transparent) 48%,
      transparent 62% 100%
    );
  transform: translateX(-120%);
}

.project-preview-card:hover .project-spotlight,
.project-preview-card:focus-within .project-spotlight,
.project-preview-card.preview-open .project-spotlight {
  opacity: 0.86;
}

.project-preview-card:hover .project-comet,
.project-preview-card:focus-within .project-comet,
.project-preview-card.preview-open .project-comet {
  opacity: 0.42;
  animation: cardComet 1.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}
```

Update z-index so content stays above the new layers:

```css
.project-meta {
  position: relative;
  z-index: 2;
  display: flex;
```

```css
.project-phone {
  position: absolute;
  left: 50%;
  top: 47%;
  z-index: 2;
```

```css
.preview-panel {
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 112px;
  z-index: 4;
```

```css
.project-footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
```

Add this keyframe near the existing media queries:

```css
@keyframes cardComet {
  to {
    transform: translateX(120%);
  }
}
```

Extend the existing reduced-motion block:

```css
@media (prefers-reduced-motion: reduce) {
  .project-bg,
  .preview-panel,
  .project-preview-card,
  .project-spotlight,
  .project-comet {
    transition: none;
  }

  .project-comet {
    animation: none;
  }
}
```

- [ ] **Step 5: Run verification and confirm partial RED**

Run:

```powershell
npm run verify:homepage
```

Expected result: verification still fails because `src/style.css` shared animation markers are not implemented yet.

- [ ] **Step 6: Commit project card spotlight**

Run:

```powershell
git add -- src\components\ProjectPreviewCard.vue
git commit -m "feat: add project card spotlight"
```

Expected result: a commit is created containing only `src/components/ProjectPreviewCard.vue`.

---

### Task 5: Add Shared Motion CSS

**Files:**
- Modify: `src/style.css`
- Modify: `src/views/HomeView.vue`

- [ ] **Step 1: Add shared number ticker CSS**

Insert this section after the `.tag` rules:

```css
/* ===== 数字滚动 ===== */
.number-ticker {
  display: inline-flex;
  align-items: baseline;
  font-variant-numeric: tabular-nums;
}

.ticker-digit {
  position: relative;
  display: inline-block;
  width: 0.68em;
  height: 1em;
  overflow: hidden;
  line-height: 1;
  vertical-align: -0.08em;
}

.ticker-digit-strip {
  display: block;
  transform: translateY(calc(var(--ticker-digit) * -1em));
  animation: digitTicker 0.72s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--ticker-delay, 0ms);
}

.ticker-digit-strip span {
  display: block;
  height: 1em;
}

.ticker-suffix {
  display: inline-block;
  margin-left: 0.02em;
}

@keyframes digitTicker {
  from {
    transform: translateY(-9em);
  }

  to {
    transform: translateY(calc(var(--ticker-digit) * -1em));
  }
}
```

- [ ] **Step 2: Add metric ticker layout adjustment**

In `src/views/HomeView.vue`, add this scoped rule after `.metric-card strong`:

```css
.metric-ticker {
  display: flex;
  align-items: baseline;
}
```

- [ ] **Step 3: Add button shimmer border CSS**

Update `.btn` by adding these custom properties and background settings:

```css
.btn {
  --btn-bg: rgba(255, 255, 255, 0.07);
  --btn-border-base: var(--border-strong);
  --btn-shimmer: rgba(215, 255, 0, 0.78);
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 54px;
  padding: 0 30px;
  border: 1px solid transparent;
  border-radius: 0;
  background:
    linear-gradient(var(--btn-bg), var(--btn-bg)) padding-box,
    linear-gradient(
      110deg,
      var(--btn-border-base) 0 34%,
      var(--btn-shimmer) 44%,
      #faffc8 50%,
      var(--btn-shimmer) 56%,
      var(--btn-border-base) 66% 100%
    ) border-box;
  background-size: 100% 100%, 260% 100%;
  background-position: 0 0, 130% 0;
  color: var(--ink-1);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 900;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
    background-position 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    background-color 0.25s, border-color 0.25s, color 0.25s;
}
```

Update `.btn-primary`:

```css
.btn-primary {
  --btn-bg: var(--accent);
  --btn-border-base: rgba(215, 255, 0, 0.7);
  --btn-shimmer: rgba(5, 5, 5, 0.86);
  color: #050505;
}
```

Update `.btn-ghost`:

```css
.btn-ghost {
  --btn-bg: rgba(255, 255, 255, 0.07);
  color: var(--ink-1);
}
```

Add this hover and focus rule after `.btn-ghost:hover`:

```css
.btn:hover,
.btn:focus-visible {
  background-position: 0 0, -70% 0;
}
```

- [ ] **Step 4: Add glitch reveal CSS**

Insert this section after the `.shimmer-text` section:

```css
/* ===== 首屏轻微故障显现 ===== */
.glitch-reveal {
  position: relative;
  animation: glitchReveal 1.1s steps(2, end) 0.28s both;
}

.glitch-reveal::before,
.glitch-reveal::after {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
}

.glitch-reveal::before {
  color: var(--accent);
  transform: translate(2px, -1px);
  clip-path: inset(0 0 58% 0);
  animation: glitchSliceTop 0.72s steps(2, end) 0.36s both;
}

.glitch-reveal::after {
  color: #6fa8ff;
  transform: translate(-2px, 1px);
  clip-path: inset(58% 0 0 0);
  animation: glitchSliceBottom 0.72s steps(2, end) 0.36s both;
}

@keyframes glitchReveal {
  0%, 18%, 32% {
    text-shadow: 2px 0 var(--accent), -2px 0 #6fa8ff;
  }

  22%, 36%, 100% {
    text-shadow: none;
  }
}

@keyframes glitchSliceTop {
  0%, 16%, 34% {
    opacity: 0.72;
    transform: translate(3px, -1px);
  }

  22%, 44%, 100% {
    opacity: 0;
    transform: translate(0);
  }
}

@keyframes glitchSliceBottom {
  0%, 18%, 36% {
    opacity: 0.62;
    transform: translate(-3px, 1px);
  }

  24%, 46%, 100% {
    opacity: 0;
    transform: translate(0);
  }
}
```

- [ ] **Step 5: Add signal strip texture CSS**

In `src/views/HomeView.vue`, add this rule after `.signal-strip`:

```css
.signal-strip::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, #050505, transparent 16%, transparent 84%, #050505),
    repeating-linear-gradient(
      0deg,
      transparent 0 6px,
      rgba(215, 255, 0, 0.08) 6px 7px
    );
  opacity: 0.72;
}
```

Update `.signal-track` so it stays below the overlay:

```css
.signal-track {
  position: relative;
  z-index: 1;
  display: inline-flex;
  min-width: 200%;
  animation: signalMove 30s linear infinite;
}
```

- [ ] **Step 6: Extend reduced-motion CSS**

In the existing `@media (prefers-reduced-motion: reduce)` block in `src/style.css`, add these selectors and declarations:

```css
  .ticker-digit-strip,
  .glitch-reveal,
  .glitch-reveal::before,
  .glitch-reveal::after {
    animation: none;
  }

  .ticker-digit-strip {
    transform: translateY(calc(var(--ticker-digit) * -1em));
  }

  .btn {
    transition: none;
    background-position: 0 0, 0 0;
  }
```

In the existing `@media (prefers-reduced-motion: reduce)` block in `src/views/HomeView.vue`, add `.signal-track`:

```css
  .signal-track {
    animation: none;
  }
```

- [ ] **Step 7: Run verification and confirm GREEN**

Run:

```powershell
npm run verify:homepage
```

Expected result:

```text
Homepage structure verification passed.
```

- [ ] **Step 8: Commit shared motion CSS**

Run:

```powershell
git add -- src\style.css src\views\HomeView.vue
git commit -m "feat: add shared homepage motion styles"
```

Expected result: a commit is created containing `src/style.css` and `src/views/HomeView.vue`.

---

### Task 6: Build And Encoding Verification

**Files:**
- Validate: `src/views/HomeView.vue`
- Validate: `src/components/StatusTerminal.vue`
- Validate: `src/components/ProjectPreviewCard.vue`
- Validate: `src/style.css`
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
Get-Content -LiteralPath 'src\views\HomeView.vue' -Encoding UTF8 | Out-Null
Get-Content -LiteralPath 'src\components\StatusTerminal.vue' -Encoding UTF8 | Out-Null
Get-Content -LiteralPath 'src\components\ProjectPreviewCard.vue' -Encoding UTF8 | Out-Null
Get-Content -LiteralPath 'src\style.css' -Encoding UTF8 | Out-Null
Get-Content -LiteralPath 'scripts\verify-homepage-structure.mjs' -Encoding UTF8 | Out-Null
```

Expected result: all commands complete without output.

- [ ] **Step 4: Scan source files for common garbled text markers**

Run:

```powershell
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
rg "\x{FFFD}|\x{951F}|\x{00C3}|\x{00C2}" src scripts docs
```

Expected result: no matches.

- [ ] **Step 5: Inspect changed files**

Run:

```powershell
git diff --check
git status --short
```

Expected result: `git diff --check` exits successfully. `git status --short` lists only files changed by the current task if there are uncommitted changes.

- [ ] **Step 6: Commit final verification adjustments if any files remain**

Run this only if Step 5 shows uncommitted task files:

```powershell
git add -- src\views\HomeView.vue src\components\StatusTerminal.vue src\components\ProjectPreviewCard.vue src\style.css scripts\verify-homepage-structure.mjs
git commit -m "chore: verify homepage motion enhancements"
```

Expected result: a commit is created only when Step 5 reported uncommitted files.

---

## Self-Review

- Spec coverage: Task 2 covers terminal number ticker. Task 3 covers metric ticker and title glitch marker. Task 4 covers project card spotlight, comet layer, focus state, and mobile-safe preview retention. Task 5 covers shared ticker CSS, button shimmer, glitch reveal, signal strip texture, and reduced-motion behavior. Task 6 covers build, UTF-8 reading, and garbled text scan.
- Placeholder scan: no unresolved markers or deferred work remain in this plan.
- Type consistency: `splitTickerValue`, `tickerDigits`, `spotlightStyle`, `updateSpotlight`, `--spotlight-x`, `--spotlight-y`, `.number-ticker`, `.ticker-digit-strip`, `.project-spotlight`, `.project-comet`, `.metric-ticker`, and `.glitch-reveal` are named consistently across tasks and verification checks.
