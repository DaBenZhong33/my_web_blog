# Responsive Footer Interaction Modes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 桌面端恢复不接管滚轮的连续尾部滚动光效，移动端保留零尾部高度的触控上拉揭层与 `0.65` 阈值吸附。

**Architecture:** `FooterSpringGlow` 保留 slot 包裹结构和固定 SVG 光效层，新增仅桌面显示的文档流尾部占位层。媒体查询决定当前模式：桌面模式从占位层位置计算连续进度且 footer 不位移；移动模式隐藏占位层并沿用触控状态机推动 footer。断点切换时统一重置进度、速度、触控和弹簧状态。

**Tech Stack:** Vue 3 SFC、`matchMedia`、原生滚动/触控事件、SVG、CSS media queries、Node.js 结构验证、Vite。

---

## File Structure

- Modify: `src/components/FooterSpringGlow.vue`
  - 新增桌面尾部占位层、媒体查询模式状态、桌面滚动测量和断点重置。
  - 删除桌面 `wheel` 接管及滚轮停止定时器。
  - 只在移动端对 footer 内容层应用上移变换。
- Modify: `scripts/verify-homepage-structure.mjs`
  - 验证双模式结构、桌面被动滚动、移动非被动触控，以及不存在 `wheel` 接管。
- Existing test: `scripts/verify-footer-spring-glow-motion.mjs`
  - 继续覆盖进度约束、阈值和呼吸参数。

---

### Task 1: Add Failing Responsive-Mode Verification

**Files:**
- Modify: `scripts/verify-homepage-structure.mjs`

- [ ] **Step 1: Add required dual-mode patterns**

Add these patterns to the footer component expectation list:

```js
/const mobileMode = ref\(false\)/,
/matchMedia\('\(max-width: 720px\)'\)/,
/const resetInteraction = \(\) =>/,
/const measureDesktopProgress = \(\) =>/,
/ref="desktopTailRef"/,
/footer-spring-glow__desktop-tail/,
/--footer-desktop-tail-height/,
/@media \(min-width: 721px\)/,
/@media \(max-width: 720px\)[\s\S]*footer-spring-glow__desktop-tail[\s\S]*display:\s*none/
```

- [ ] **Step 2: Require mode-specific transforms**

Add:

```js
/\.footer-spring-glow__content\s*\{[^}]*transform:\s*none/,
/@media \(max-width: 720px\)[\s\S]*translate3d\(0, calc\(-1 \* var\(--footer-reveal-offset\)\), 0\)/
```

- [ ] **Step 3: Reject desktop wheel interception and stale timer code**

Add to the footer rejection list:

```js
/addEventListener\('wheel'/,
/handleWheel/,
/wheelSettleTimer/,
/settleDelay: \{ type: Number/
```

- [ ] **Step 4: Run the verifier and confirm failure**

```powershell
npm run verify:homepage
```

Expected: FAIL for missing dual-mode state/tail/measurement and for existing wheel interception code.

- [ ] **Step 5: Commit the failing test**

```powershell
git add scripts/verify-homepage-structure.mjs
git commit -m "test: define responsive footer interaction modes"
```

---

### Task 2: Add Desktop Tail And Mode State

**Files:**
- Modify: `src/components/FooterSpringGlow.vue`

- [ ] **Step 1: Replace obsolete interaction prop and state**

Remove:

```js
settleDelay: { type: Number, default: 150 }
```

Add:

```js
desktopTailHeight: { type: String, default: '38vh' }
```

Add refs:

```js
const desktopTailRef = ref(null)
const mobileMode = ref(false)
```

Remove `wheelSettleTimer` and `safeSettleDelay`.

- [ ] **Step 2: Expose desktop tail height through root style**

Add to the `rootStyle` return object:

```js
'--footer-desktop-tail-height': props.desktopTailHeight
```

- [ ] **Step 3: Add the desktop tail after the slotted footer**

Inside `.footer-spring-glow`, after the content layer and before the fixed reveal layer, add:

```vue
<div ref="desktopTailRef" class="footer-spring-glow__desktop-tail"></div>
```

- [ ] **Step 4: Add desktop-tail CSS and mode-specific footer transform**

Change the base content rule to:

```css
.footer-spring-glow__content {
  position: relative;
  z-index: 3;
  transform: none;
}

.footer-spring-glow__desktop-tail {
  position: relative;
  min-height: var(--footer-desktop-tail-height);
  background: #050505;
}
```

Inside the existing `@media (max-width: 720px)` block add:

```css
.footer-spring-glow__content {
  transform: translate3d(0, calc(-1 * var(--footer-reveal-offset)), 0);
  will-change: transform;
}

.footer-spring-glow__desktop-tail {
  display: none;
}
```

Add an explicit desktop media block:

```css
@media (min-width: 721px) {
  .footer-spring-glow__desktop-tail {
    min-height: var(--footer-desktop-tail-height);
  }
}
```

- [ ] **Step 5: Run the build**

```powershell
npm run build
```

Expected: Vite build succeeds; structural verification still fails for missing mode logic and existing wheel code.

- [ ] **Step 6: Commit the layout layer**

```powershell
git add src/components/FooterSpringGlow.vue
git commit -m "feat: add desktop footer tail layout"
```

---

### Task 3: Implement Desktop Continuous Progress And Remove Wheel Capture

**Files:**
- Modify: `src/components/FooterSpringGlow.vue`

- [ ] **Step 1: Add one reset function**

Add:

```js
const resetInteraction = () => {
  stopSpring()
  targetProgress = 0
  currentProgress = 0
  velocity = 0
  touchActive = false
  lastTouchY = null
  renderProgress(0)
  interactionState.value = 'hidden'
}
```

- [ ] **Step 2: Add desktop progress measurement**

Add:

```js
const measureDesktopProgress = () => {
  if (!desktopTailRef.value) return

  const rect = desktopTailRef.value.getBoundingClientRect()
  const tailHeight = Math.max(rect.height, 1)
  const visibleProgress = clamp01((window.innerHeight - rect.top) / tailHeight)

  targetProgress = visibleProgress

  if (reducedMotion.value) {
    stopSpring()
    velocity = 0
    renderProgress(targetProgress)
    interactionState.value = targetProgress >= 1
      ? 'expanded'
      : targetProgress <= 0
        ? 'hidden'
        : 'pulling'
    return
  }

  interactionState.value = targetProgress >= 1
    ? 'expanded'
    : targetProgress <= 0
      ? 'hidden'
      : 'pulling'
  startSpring()
}
```

When `targetProgress` is `0`, set `interactionState` to `hidden` instead of `pulling`.

- [ ] **Step 3: Route `measure()` by current mode**

Replace `measure()` with:

```js
const measure = () => {
  if (!mobileMode.value) {
    measureDesktopProgress()
    return
  }

  if (!isAtPageBottom()) resetInteraction()
}
```

- [ ] **Step 4: Remove all wheel gesture code**

Delete:

- `clearWheelSettleTimer`
- `scheduleWheelSettle`
- `handleWheel`
- the `wheel` listener registration and removal
- the wheel timer cleanup

The remaining `scroll` and `resize` listeners stay passive.

- [ ] **Step 5: Restrict touch handlers to mobile mode**

At the start of `handleTouchStart`, add:

```js
if (!mobileMode.value) return
```

At the start of `handleTouchMove` and `handleTouchEnd`, return when `mobileMode.value` is false. Keep `touchmove` registered with `{ passive: false }` because mobile mode calls `preventDefault()`.

- [ ] **Step 6: Make reveal geometry mode-specific**

In `rootStyle`, compute:

```js
const revealOffset = revealDistance * safeProgress
```

The expression deliberately remains the same for the fixed reveal layer; only the footer content transform differs by CSS mode. This keeps one geometry source while desktop footer stays stationary.

- [ ] **Step 7: Run focused checks**

```powershell
npm run verify:footer-glow
npm run build
```

Expected: motion verifier and build pass.

---

### Task 4: Add Breakpoint Lifecycle And State Reset

**Files:**
- Modify: `src/components/FooterSpringGlow.vue`

- [ ] **Step 1: Add the mode media query variable**

Next to `motionQuery`, add:

```js
let modeQuery = null
```

- [ ] **Step 2: Add the mode-change handler**

Add:

```js
const handleModeChange = () => {
  const nextMobileMode = modeQuery.matches
  if (nextMobileMode === mobileMode.value) return

  mobileMode.value = nextMobileMode
  resetInteraction()
  updateRevealHeight()
  requestAnimationFrame(measure)
}
```

- [ ] **Step 3: Initialize and subscribe on mount**

At the beginning of `onMounted()`:

```js
modeQuery = window.matchMedia('(max-width: 720px)')
mobileMode.value = modeQuery.matches

if (modeQuery.addEventListener) {
  modeQuery.addEventListener('change', handleModeChange)
} else {
  modeQuery.addListener(handleModeChange)
}
```

- [ ] **Step 4: Remove the mode listener on unmount**

Add matching `removeEventListener('change', handleModeChange)` or `removeListener(handleModeChange)` cleanup.

- [ ] **Step 5: Fix desktop breathing endpoint state**

Replace the stable state assignment in `stepSpring()` with:

```js
interactionState.value = targetProgress >= 1
  ? 'expanded'
  : targetProgress <= 0
    ? 'hidden'
    : 'pulling'
```

During desktop continuous progress, bars only receive `is-breathing` when the spring has reached target `1`; partial desktop progress remains `pulling` and does not breathe. Mobile targets are always `0` or `1`, so the same assignment preserves its endpoint behavior.

- [ ] **Step 6: Run all automated checks**

```powershell
npm run verify:footer-glow
npm run verify:homepage
npm run build
```

Expected: both verifiers pass and build succeeds.

- [ ] **Step 7: Commit interaction modes**

```powershell
git add src/components/FooterSpringGlow.vue
git commit -m "feat: split desktop and mobile footer interactions"
```

---

### Task 5: Browser, Encoding, And Final Verification

**Files:**
- Modify only when a failing verification requires it: `src/components/FooterSpringGlow.vue`

- [ ] **Step 1: Verify UTF-8 and scan garbled markers**

```powershell
$files = @('src/App.vue','src/components/FooterSpringGlow.vue','scripts/verify-homepage-structure.mjs')
foreach ($file in $files) {
  $text = Get-Content -Raw -Encoding UTF8 $file
  foreach ($marker in @([char]0xFFFD,[char]0x951F,[char]0x00C3,[char]0x00C2)) {
    if ($text.Contains([string]$marker)) { throw "$file contains a garbled marker" }
  }
}
```

- [ ] **Step 2: Verify desktop at `1440x1000`**

Confirm:

- The original footer remains stationary while scrolling into the `38vh` tail.
- The tail increases `scrollHeight` by approximately its computed height.
- Glow progress changes continuously with scroll position.
- Wheel events are not prevented; repeated wheel input continues normal document scrolling.
- At the tail bottom the glow reaches `1` and bars report different animation durations.
- Scrolling upward continuously retracts the glow.

- [ ] **Step 3: Verify mobile at `390x844`**

Confirm:

- `.footer-spring-glow__desktop-tail` is `display: none`.
- Closed footer bottom equals viewport bottom within two pixels.
- Touch contract remains: one-finger upward movement reveals, release applies `0.65`, two-finger start is ignored.
- Reverse input closes first, then releases normal upward page scrolling.
- Reveal height remains at most `360px`; no horizontal overflow or console errors.

- [ ] **Step 4: Verify live breakpoint switching**

While expanded or partially revealed, change viewport from `390x844` to `1440x1000`, then back. Confirm each switch immediately resets progress to `0`, clears footer translation, and activates only the new mode’s layout.

- [ ] **Step 5: Verify reduced motion**

Desktop progress follows the scroll target without oscillation; mobile endpoint selection has no spring oscillation; both modes disable bar breathing.

- [ ] **Step 6: Run final commands**

```powershell
npm run verify:footer-glow
npm run verify:homepage
npm run build
git diff --check
git status --short
```

Expected: all commands pass and the worktree is clean after intentional commits.

---

## Self-Review

- Desktop requirements map to the tail layer, continuous passive scroll measurement, stationary footer CSS, and explicit rejection of wheel interception.
- Mobile requirements map to hidden tail CSS, existing touch state machine, `0.65` snap logic, and footer translation only inside the mobile media query.
- Breakpoint transitions have explicit reset and listener cleanup steps.
- Both modes reuse the same fixed reveal layer and deterministic breathing profiles.
- UTF-8, garbled text, desktop/mobile browser checks, reduced motion, build, and working-tree checks are included.
- No unresolved placeholders or undefined functions remain.
