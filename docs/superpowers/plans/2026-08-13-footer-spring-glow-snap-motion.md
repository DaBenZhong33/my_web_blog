# Footer Spring Glow Snap Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有页脚光效升级为支持桌面滚轮和移动端触控拖动的阈值抽屉，并在完全展开后让各条状体以确定性的随机节奏缓慢呼吸。

**Architecture:** 把可纯函数测试的进度、吸附和呼吸参数逻辑放到独立模块，Vue 组件负责页面底部检测、输入生命周期、四态状态机和弹簧渲染。外层光带控制整体展开进度，SVG 中每根条状体通过 CSS 自定义属性运行独立呼吸动画；两层变换互不干扰。

**Tech Stack:** Vue 3 SFC、原生 JavaScript ES modules、SVG、CSS animations、Node.js `assert` 验证脚本、Vite。

---

## File Structure

- Create: `src/components/footerSpringGlowMotion.js`
  - 提供无 DOM 依赖的数值约束、输入归一化、吸附目标判断和确定性呼吸参数生成。
- Create: `scripts/verify-footer-spring-glow-motion.mjs`
  - 使用 Node.js `assert` 覆盖阈值边界、输入增量和呼吸参数的确定性与范围。
- Modify: `src/components/FooterSpringGlow.vue`
  - 管理 `hidden`、`pulling`、`expanded`、`collapsing` 四态；接管页底滚轮和单指触控输入；复用弹簧动画完成端点吸附；只在展开端点启用呼吸。
- Modify: `scripts/verify-homepage-structure.mjs`
  - 检查新模块导入、输入监听与清理、四态标识、呼吸样式和 reduced-motion 降级。
- Modify: `package.json`
  - 增加 `verify:footer-glow` 脚本，使纯函数验证可以独立运行。

---

### Task 1: Add Failing Motion-Logic Verification

**Files:**
- Create: `scripts/verify-footer-spring-glow-motion.mjs`
- Modify: `package.json`
- Test: `scripts/verify-footer-spring-glow-motion.mjs`

- [ ] **Step 1: Write the failing verification script**

Create `scripts/verify-footer-spring-glow-motion.mjs`:

```js
import assert from 'node:assert/strict'
import {
  applyInputDelta,
  clamp01,
  createBreathProfile,
  decideSnapTarget
} from '../src/components/footerSpringGlowMotion.js'

assert.equal(clamp01(-0.2), 0)
assert.equal(clamp01(0.4), 0.4)
assert.equal(clamp01(1.4), 1)

assert.equal(applyInputDelta(0.2, 120, 600), 0.4)
assert.equal(applyInputDelta(0.9, 120, 600), 1)
assert.equal(applyInputDelta(0.1, -120, 600), 0)
assert.equal(applyInputDelta(0.5, 80, 0), 0.5)

assert.equal(decideSnapTarget(0.6499, 0.65), 0)
assert.equal(decideSnapTarget(0.65, 0.65), 1)
assert.equal(decideSnapTarget(1, 2), 1)
assert.equal(decideSnapTarget(0.7, Number.NaN), 1)

const firstProfile = createBreathProfile(0)
const repeatedProfile = createBreathProfile(0)
assert.deepEqual(firstProfile, repeatedProfile)

for (let index = 0; index < 9; index += 1) {
  const profile = createBreathProfile(index)
  assert.ok(profile.scale >= 1.02 && profile.scale <= 1.07)
  assert.ok(profile.duration >= 2.8 && profile.duration <= 5.2)
  assert.ok(profile.delay <= 0)
}

assert.notDeepEqual(createBreathProfile(0), createBreathProfile(1))

console.log('Footer spring glow motion verification passed.')
```

- [ ] **Step 2: Add the package script**

Add this entry to `package.json` under `scripts`:

```json
"verify:footer-glow": "node scripts/verify-footer-spring-glow-motion.mjs"
```

- [ ] **Step 3: Run the verification and confirm the expected failure**

Run:

```powershell
npm run verify:footer-glow
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/components/footerSpringGlowMotion.js`.

- [ ] **Step 4: Commit the failing verification**

```powershell
git add package.json scripts/verify-footer-spring-glow-motion.mjs
git commit -m "test: define footer glow motion behavior"
```

Expected: the commit contains only the new verifier and package script; do not stage `CONTENT_INFO.md` or unrelated files.

---

### Task 2: Implement Pure Motion Helpers

**Files:**
- Create: `src/components/footerSpringGlowMotion.js`
- Test: `scripts/verify-footer-spring-glow-motion.mjs`

- [ ] **Step 1: Add the minimal helper module**

Create `src/components/footerSpringGlowMotion.js`:

```js
export const clamp01 = (value, fallback = 0) => {
  const safeValue = Number.isFinite(value) ? value : fallback
  return Math.min(Math.max(safeValue, 0), 1)
}

export const applyInputDelta = (progress, delta, travel) => {
  if (!Number.isFinite(travel) || travel <= 0) return clamp01(progress)
  const safeDelta = Number.isFinite(delta) ? delta : 0
  return clamp01(progress + safeDelta / travel)
}

export const decideSnapTarget = (progress, threshold = 0.65) => {
  const safeThreshold = clamp01(threshold, 0.65)
  return clamp01(progress) >= safeThreshold ? 1 : 0
}

const seededUnit = (index, salt) => {
  const value = Math.sin((index + 1) * salt) * 43758.5453123
  return value - Math.floor(value)
}

export const createBreathProfile = (index) => {
  const safeIndex = Number.isFinite(index) ? Math.max(0, Math.floor(index)) : 0
  const scale = 1.02 + seededUnit(safeIndex, 12.9898) * 0.05
  const duration = 2.8 + seededUnit(safeIndex, 78.233) * 2.4
  const delay = -seededUnit(safeIndex, 39.425) * duration

  return {
    scale: Number(scale.toFixed(4)),
    duration: Number(duration.toFixed(3)),
    delay: Number(delay.toFixed(3))
  }
}
```

- [ ] **Step 2: Run the focused verification**

```powershell
npm run verify:footer-glow
```

Expected: `Footer spring glow motion verification passed.`

- [ ] **Step 3: Run the existing homepage verifier**

```powershell
npm run verify:homepage
```

Expected: `Homepage structure verification passed.`

- [ ] **Step 4: Commit the helper module**

```powershell
git add src/components/footerSpringGlowMotion.js
git commit -m "feat: add footer glow motion helpers"
```

---

### Task 3: Replace Scroll Mapping With Bottom Input State Machine

**Files:**
- Modify: `src/components/FooterSpringGlow.vue`
- Test: `scripts/verify-homepage-structure.mjs`

- [ ] **Step 1: Extend the component props and imports**

In `FooterSpringGlow.vue`, import the helper functions and add the two interaction props:

```js
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  applyInputDelta,
  clamp01,
  createBreathProfile,
  decideSnapTarget
} from './footerSpringGlowMotion.js'

const props = defineProps({
  tailHeight: { type: String, default: '38vh' },
  mobileTailHeight: { type: String, default: '30vh' },
  minReveal: { type: Number, default: 0.035 },
  snapThreshold: { type: Number, default: 0.65 },
  settleDelay: { type: Number, default: 150 },
  bars: { type: Number, default: 9 },
  blur: { type: Number, default: 15 },
  peak: { type: Number, default: 0.98 },
  valley: { type: Number, default: 0.55 }
})
```

Delete the component-local `clamp01` function, retaining its existing general-purpose `clampNumber` helper for prop bounds.

- [ ] **Step 2: Add state and lifecycle bookkeeping**

Place this state next to the existing `progress` and animation variables:

```js
const interactionState = ref('hidden')

let wheelSettleTimer = 0
let lastTouchY = null
let touchActive = false

const safeSnapThreshold = computed(() => clamp01(props.snapThreshold, 0.65))
const safeSettleDelay = computed(() => clampNumber(props.settleDelay, 80, 400, 150))
const isExpanded = computed(() => interactionState.value === 'expanded')
```

- [ ] **Step 3: Replace `measure()` with bottom detection and input helpers**

Remove the current scroll-position-to-progress mapping in `measure()` and add:

```js
const isAtPageBottom = () => {
  const root = document.documentElement
  const remaining = root.scrollHeight - window.innerHeight - window.scrollY
  return remaining <= 2
}

const getInputTravel = () => {
  const tailHeight = tailRef.value?.getBoundingClientRect().height ?? 0
  return Math.max(tailHeight, window.innerHeight * 0.3, 1)
}

const settleInteraction = () => {
  const nextTarget = decideSnapTarget(currentProgress, safeSnapThreshold.value)
  targetProgress = nextTarget
  interactionState.value = nextTarget === 1 ? 'pulling' : 'collapsing'

  if (reducedMotion.value) {
    velocity = 0
    renderProgress(nextTarget)
    interactionState.value = nextTarget === 1 ? 'expanded' : 'hidden'
    return
  }

  startSpring()
}

const applyInteractionDelta = (delta) => {
  const previousProgress = currentProgress
  const nextProgress = applyInputDelta(previousProgress, delta, getInputTravel())
  if (nextProgress === previousProgress) return false

  stopSpring()
  velocity = 0
  targetProgress = nextProgress
  renderProgress(nextProgress)
  interactionState.value = nextProgress > previousProgress ? 'pulling' : 'collapsing'
  return true
}

const measure = () => {
  if (!isAtPageBottom() && interactionState.value === 'hidden') {
    targetProgress = 0
    velocity = 0
    stopSpring()
    renderProgress(0)
  }
}
```

When the spring reaches its target in `stepSpring()`, set the stable endpoint state before returning:

```js
interactionState.value = targetProgress === 1 ? 'expanded' : 'hidden'
```

- [ ] **Step 4: Add wheel gesture handling**

Add:

```js
const clearWheelSettleTimer = () => {
  if (!wheelSettleTimer) return
  window.clearTimeout(wheelSettleTimer)
  wheelSettleTimer = 0
}

const scheduleWheelSettle = () => {
  clearWheelSettleTimer()
  wheelSettleTimer = window.setTimeout(() => {
    wheelSettleTimer = 0
    settleInteraction()
  }, safeSettleDelay.value)
}

const handleWheel = (event) => {
  const canOpen = event.deltaY > 0 && isAtPageBottom()
  const canClose = event.deltaY < 0 && currentProgress > 0
  if (!canOpen && !canClose) return

  if (applyInteractionDelta(event.deltaY)) event.preventDefault()
  scheduleWheelSettle()
}
```

- [ ] **Step 5: Add single-touch gesture handling**

Add:

```js
const handleTouchStart = (event) => {
  if (event.touches.length !== 1) {
    touchActive = false
    lastTouchY = null
    return
  }

  touchActive = isAtPageBottom() || currentProgress > 0
  lastTouchY = touchActive ? event.touches[0].clientY : null
}

const handleTouchMove = (event) => {
  if (!touchActive || event.touches.length !== 1 || lastTouchY === null) return

  const nextY = event.touches[0].clientY
  const delta = lastTouchY - nextY
  lastTouchY = nextY

  const canOpen = delta > 0 && isAtPageBottom()
  const canClose = delta < 0 && currentProgress > 0
  if ((canOpen || canClose) && applyInteractionDelta(delta)) event.preventDefault()
}

const handleTouchEnd = () => {
  if (touchActive) settleInteraction()
  touchActive = false
  lastTouchY = null
}
```

- [ ] **Step 6: Register and clean up non-passive input listeners**

In `onMounted()`, retain passive `scroll` and `resize` listeners and add:

```js
window.addEventListener('wheel', handleWheel, { passive: false })
window.addEventListener('touchstart', handleTouchStart, { passive: true })
window.addEventListener('touchmove', handleTouchMove, { passive: false })
window.addEventListener('touchend', handleTouchEnd, { passive: true })
window.addEventListener('touchcancel', handleTouchEnd, { passive: true })
```

In `onBeforeUnmount()`, add matching removals and timer cleanup:

```js
window.removeEventListener('wheel', handleWheel)
window.removeEventListener('touchstart', handleTouchStart)
window.removeEventListener('touchmove', handleTouchMove)
window.removeEventListener('touchend', handleTouchEnd)
window.removeEventListener('touchcancel', handleTouchEnd)
clearWheelSettleTimer()
```

- [ ] **Step 7: Expose state through the root class**

Replace the root `:class` binding with:

```vue
:class="[
  `is-${interactionState}`,
  {
    'is-expanded': isExpanded,
    'is-reduced-motion': reducedMotion
  }
]"
```

- [ ] **Step 8: Run focused and production verification**

```powershell
npm run verify:footer-glow
npm run verify:homepage
npm run build
```

Expected: both verifiers pass and Vite completes the production build without errors.

- [ ] **Step 9: Commit the input state machine**

```powershell
git add src/components/FooterSpringGlow.vue
git commit -m "feat: add footer glow snap interaction"
```

---

### Task 4: Add Deterministic Random Breathing

**Files:**
- Modify: `src/components/FooterSpringGlow.vue`
- Modify: `scripts/verify-homepage-structure.mjs`
- Test: `scripts/verify-footer-spring-glow-motion.mjs`

- [ ] **Step 1: Compute bar models with stable breath profiles**

Replace `barHeights` with:

```js
const barModels = computed(() => {
  const heights = bellHeights(safeBars.value, safePeak.value, safeValley.value)
  return heights.map((height, index) => ({
    height,
    breath: createBreathProfile(index)
  }))
})
```

Add:

```js
const barStyle = (breath) => ({
  '--bar-breath-scale': breath.scale,
  '--bar-breath-duration': `${breath.duration}s`,
  '--bar-breath-delay': `${breath.delay}s`
})
```

- [ ] **Step 2: Apply each profile to its SVG group**

Replace the SVG group and rect loop with:

```vue
<g
  v-for="(bar, index) in barModels"
  :key="index"
  class="footer-spring-glow__bar"
  :class="{ 'is-breathing': isExpanded }"
  :style="barStyle(bar.breath)"
  :filter="`url(#${blurId})`"
>
  <rect
    :x="index * columnWidth"
    :y="VBH - bar.height"
    :width="columnWidth * 1.23"
    :height="bar.height"
    :fill="`url(#${gradientId})`"
  />
</g>
```

- [ ] **Step 3: Add the low-amplitude breathing animation**

Add to the scoped style:

```css
.footer-spring-glow__bar {
  transform-box: fill-box;
  transform-origin: center bottom;
}

.footer-spring-glow__bar.is-breathing {
  animation: footerBarBreathe var(--bar-breath-duration) ease-in-out
    var(--bar-breath-delay) infinite alternate;
}

@keyframes footerBarBreathe {
  from { transform: scaleY(1); }
  to { transform: scaleY(var(--bar-breath-scale)); }
}
```

Inside the existing reduced-motion media query, add:

```css
.footer-spring-glow__bar.is-breathing {
  animation: none;
  transform: none;
}
```

- [ ] **Step 4: Strengthen the structural verifier**

Append these patterns to the `FooterSpringGlow` expectation list in `scripts/verify-homepage-structure.mjs`:

```js
/snapThreshold: \{ type: Number, default: 0\.65 \}/,
/settleDelay: \{ type: Number, default: 150 \}/,
/interactionState = ref\('hidden'\)/,
/addEventListener\('wheel', handleWheel, \{ passive: false \}\)/,
/addEventListener\('touchmove', handleTouchMove, \{ passive: false \}\)/,
/removeEventListener\('touchcancel', handleTouchEnd\)/,
/createBreathProfile/,
/footer-spring-glow__bar/,
/@keyframes footerBarBreathe/
```

Add a rejection list for stale continuous scroll mapping:

```js
for (const pattern of [
  /const raw = \(window\.innerHeight - rect\.top\) \/ tailHeight/,
  /targetProgress = clamp01\(safeMinReveal\.value/
]) {
  rejectPattern(files.footerSpringGlow, footerSpringGlow, pattern)
}
```

- [ ] **Step 5: Run all automated checks**

```powershell
npm run verify:footer-glow
npm run verify:homepage
npm run build
```

Expected: both verification scripts pass; Vite build succeeds.

- [ ] **Step 6: Commit the breathing animation and structural checks**

```powershell
git add src/components/FooterSpringGlow.vue scripts/verify-homepage-structure.mjs
git commit -m "feat: animate expanded footer glow bars"
```

---

### Task 5: UTF-8, Browser, And Interaction Verification

**Files:**
- Modify only if tuning is required: `src/components/FooterSpringGlow.vue`

- [ ] **Step 1: Read every modified text file explicitly as UTF-8**

```powershell
$files = @(
  'src/components/footerSpringGlowMotion.js',
  'src/components/FooterSpringGlow.vue',
  'scripts/verify-footer-spring-glow-motion.mjs',
  'scripts/verify-homepage-structure.mjs',
  'package.json'
)
foreach ($file in $files) { Get-Content -Raw -Encoding UTF8 $file | Out-Null }
```

Expected: exit code `0`.

- [ ] **Step 2: Scan modified files for common garbled markers**

```powershell
$files = @(
  'src/components/footerSpringGlowMotion.js',
  'src/components/FooterSpringGlow.vue',
  'scripts/verify-footer-spring-glow-motion.mjs',
  'scripts/verify-homepage-structure.mjs',
  'package.json'
)
$markers = @([char]0xFFFD, [char]0x951F, [char]0x00C3, [char]0x00C2)
foreach ($file in $files) {
  $text = Get-Content -Raw -Encoding UTF8 $file
  foreach ($marker in $markers) {
    if ($text.Contains([string]$marker)) { throw "$file contains U+$('{0:X4}' -f [int]$marker)" }
  }
}
```

Expected: exit code `0` with no exception.

- [ ] **Step 3: Start the local server**

```powershell
npm run dev -- --host 127.0.0.1
```

Expected: Vite prints a reachable local URL. Keep the process running for the following checks.

- [ ] **Step 4: Verify desktop wheel behavior at `1440x1000`**

Check all of the following:

- Before reaching the page bottom, wheel input scrolls the page normally and the glow remains hidden.
- At the bottom, a short downward wheel gesture reveals less than `65%`; stopping makes it return fully to hidden.
- A longer downward gesture crosses `65%`; stopping makes it settle fully open.
- Once fully open, bars breathe at visibly different slow rates without abrupt height jumps.
- An upward wheel gesture first collapses the glow; after it reaches hidden, continued upward input scrolls the page.

- [ ] **Step 5: Verify single-touch behavior at `390x844`**

Check all of the following:

- Normal one-finger page scrolling is unchanged before the bottom.
- At the bottom, upward drag reveals the glow and release applies the same `65%` rule.
- Downward drag collapses an expanded glow.
- Two-finger gestures do not alter glow progress.
- No horizontal overflow appears and the existing footer links remain usable.

- [ ] **Step 6: Verify reduced motion**

Emulate `prefers-reduced-motion: reduce`, reload, and check:

- Input can still choose hidden or expanded endpoints.
- Endpoint changes do not oscillate.
- Bars do not run continuous breathing animations.

- [ ] **Step 7: Re-run final automated verification**

```powershell
npm run verify:footer-glow
npm run verify:homepage
npm run build
git diff --check
git status --short
```

Expected: both verifiers and build pass; `git diff --check` reports no whitespace errors; `git status` shows no unexpected staged files.

- [ ] **Step 8: Commit only if visual tuning was necessary**

If browser verification required damping, travel distance, opacity, or breathing-amplitude changes:

```powershell
git add src/components/FooterSpringGlow.vue
git commit -m "fix: tune footer glow pull interaction"
```

If no tuning was required, skip this commit.

---

## Self-Review

- Spec coverage: four states, `65%` snap threshold, `150ms` wheel settling, bottom-only input capture, single-touch handling, reverse collapse, stable random breathing, reduced-motion behavior, UTF-8 checks, desktop/mobile verification, and listener cleanup all map to explicit tasks.
- Boundary consistency: `decideSnapTarget()` uses `>= 0.65`, so exactly `65%` expands; the plan uses the same rule everywhere.
- Input direction consistency: positive wheel delta and upward touch movement open; negative wheel delta and downward touch movement close.
- Animation separation: the band owns overall `scaleY(progress)` while each SVG group owns only its breathing transform.
- Placeholder scan: every implementation step contains concrete code, commands, and expected results.
- Scope check: changes stay within the footer glow component, its focused helper/tests, package scripts, and existing structural verification.
