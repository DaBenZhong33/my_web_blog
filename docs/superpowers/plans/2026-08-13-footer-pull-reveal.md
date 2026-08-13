# Footer Pull Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将页脚光效改成零常驻尾部高度的“上拉加载更多”揭层：原页脚随输入上移，光效从其下方露出，未过阈值回弹，过阈值展开并呼吸。

**Architecture:** `FooterSpringGlow` 通过默认 slot 包裹原 footer，根节点只保留 footer 的正常布局高度。slot 内容层与固定光效层共享展开距离 CSS 变量：前者向上移动，后者从视口下方向上揭开；现有输入状态机、`0.65` 吸附阈值和确定性呼吸逻辑继续复用。

**Tech Stack:** Vue 3 SFC、原生 JavaScript、SVG、CSS transforms/animations、Node.js 结构验证、Vite。

---

## File Structure

- Modify: `src/App.vue`
  - 将原 footer 放入 `FooterSpringGlow` 默认 slot，移除 footer 后的空组件调用。
- Modify: `src/components/FooterSpringGlow.vue`
  - 根节点改为零附加高度的控制容器；新增 slot 内容层和固定揭层；用实际揭层高度归一化输入。
- Modify: `scripts/verify-homepage-structure.mjs`
  - 验证 slot 包裹结构、同步位移变量和常驻尾部高度已移除。
- Existing test: `scripts/verify-footer-spring-glow-motion.mjs`
  - 继续验证进度、阈值与呼吸参数逻辑不回归。

---

### Task 1: Add Failing Pull-Reveal Structure Verification

**Files:**
- Modify: `scripts/verify-homepage-structure.mjs`
- Test: `scripts/verify-homepage-structure.mjs`

- [ ] **Step 1: Require the footer to be slotted into the component**

Replace the existing App integration pattern:

```js
/<footer class="footer">[\s\S]*<\/footer>\s*<FooterSpringGlow\s*\/>/
```

with:

```js
/<FooterSpringGlow>\s*<footer class="footer">[\s\S]*<\/footer>\s*<\/FooterSpringGlow>/
```

- [ ] **Step 2: Require the new content and reveal layers**

Add these patterns to the `FooterSpringGlow.vue` expectation list:

```js
/<div class="footer-spring-glow__content">\s*<slot\s*\/>\s*<\/div>/,
/ref="revealRef"/,
/footer-spring-glow__reveal/,
/--footer-reveal-distance/,
/--footer-reveal-offset/,
/translate3d\(0, calc\(-1 \* var\(--footer-reveal-offset\)\), 0\)/,
/translate3d\(0, calc\(100% - var\(--footer-reveal-offset\)\), 0\)/
```

- [ ] **Step 3: Reject the stale tail-space implementation**

Add these patterns to the existing footer rejection list:

```js
/tailHeight: \{ type: String/,
/mobileTailHeight: \{ type: String/,
/minReveal: \{ type: Number/,
/min-height:\s*var\(--footer-tail-height\)/,
/footer-spring-glow__floor/
```

- [ ] **Step 4: Run the verifier and observe the expected failure**

```powershell
npm run verify:homepage
```

Expected: FAIL for the missing slot wrapper, content/reveal layers and stale tail props/styles.

- [ ] **Step 5: Commit the failing structural test**

```powershell
git add scripts/verify-homepage-structure.mjs
git commit -m "test: define footer pull reveal structure"
```

---

### Task 2: Slot The Existing Footer Into FooterSpringGlow

**Files:**
- Modify: `src/App.vue`
- Test: `scripts/verify-homepage-structure.mjs`

- [ ] **Step 1: Wrap the existing footer without changing its content**

Change:

```vue
<footer class="footer">
  <!-- existing footer content remains byte-for-byte unchanged -->
</footer>

<FooterSpringGlow />
```

to:

```vue
<FooterSpringGlow>
  <footer class="footer">
    <!-- existing footer content remains byte-for-byte unchanged -->
  </footer>
</FooterSpringGlow>
```

The actual implementation must move the complete existing footer block; do not replace it with the comment shown above.

- [ ] **Step 2: Run the verifier**

```powershell
npm run verify:homepage
```

Expected: App integration check passes; component layer and stale-tail checks still fail.

- [ ] **Step 3: Commit the integration change**

```powershell
git add src/App.vue
git commit -m "refactor: wrap footer with pull reveal"
```

---

### Task 3: Replace Tail Space With Synchronized Reveal Layers

**Files:**
- Modify: `src/components/FooterSpringGlow.vue`
- Test: `scripts/verify-homepage-structure.mjs`

- [ ] **Step 1: Replace tail props and refs**

Remove `tailHeight`, `mobileTailHeight`, `minReveal`, `tailRef`, and `safeMinReveal`. Add:

```js
const revealRef = ref(null)
const revealHeight = ref(0)
```

Keep `snapThreshold`, `settleDelay`, `bars`, `blur`, `peak`, and `valley` unchanged.

- [ ] **Step 2: Derive one synchronized pixel offset**

Replace the tail-height entries in `rootStyle` with:

```js
const revealDistance = revealHeight.value
const revealOffset = revealDistance * safeProgress

return {
  '--footer-reveal-distance': `${revealDistance.toFixed(2)}px`,
  '--footer-reveal-offset': `${revealOffset.toFixed(2)}px`,
  '--footer-glow-opacity': glowOpacity.toFixed(4)
}
```

Remove `--footer-glow-progress` and `--footer-glow-lift`; the complete layer now moves as one reveal instead of scaling vertically.

- [ ] **Step 3: Use the actual reveal height as input travel**

Replace `getInputTravel()` with:

```js
const getInputTravel = () => {
  return Math.max(revealHeight.value, 1)
}
```

- [ ] **Step 4: Replace the template hierarchy**

Use this structure:

```vue
<div
  class="footer-spring-glow"
  :class="[`is-${interactionState}`, { 'is-reduced-motion': reducedMotion }]"
  :style="rootStyle"
>
  <div class="footer-spring-glow__content">
    <slot />
  </div>

  <div ref="revealRef" class="footer-spring-glow__reveal" aria-hidden="true">
    <svg class="footer-spring-glow__svg" ...>
      <!-- preserve the current defs and bar loop -->
    </svg>
  </div>
</div>
```

Keep the existing SVG definitions, rectangles, breath profiles, `focusable="false"`, and `preserveAspectRatio="none"` unchanged.

- [ ] **Step 5: Replace tail and band CSS**

Replace `.footer-spring-glow`, `__floor`, and `__band` rules with:

```css
.footer-spring-glow {
  position: relative;
  z-index: 1;
}

.footer-spring-glow__content {
  position: relative;
  z-index: 3;
  transform: translate3d(0, calc(-1 * var(--footer-reveal-offset)), 0);
  will-change: transform;
}

.footer-spring-glow__reveal {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  height: min(58vh, 520px);
  overflow: hidden;
  pointer-events: none;
  opacity: var(--footer-glow-opacity);
  transform: translate3d(0, calc(100% - var(--footer-reveal-offset)), 0);
  will-change: transform, opacity;
  mix-blend-mode: screen;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    #050505;
  background-size: 340px 100%, 100% 220px;
}
```

Update the mobile rule to target `__reveal` with `height: min(46vh, 360px)` and the existing reduced opacity. Update reduced-motion rules to remove `will-change`; retain the bar animation shutdown.

- [ ] **Step 6: Keep reveal height current after layout changes**

Retain the current `ResizeObserver`, but observe `revealRef.value` instead of the removed tail element. Store the measured height in a reactive ref so `rootStyle` recomputes when the responsive height changes:

```js
const updateRevealHeight = () => {
  revealHeight.value = revealRef.value?.getBoundingClientRect().height ?? 0
}

resizeObserver = new ResizeObserver(() => {
  updateRevealHeight()
  measure()
})
updateRevealHeight()
resizeObserver.observe(revealRef.value)
```

- [ ] **Step 7: Run all automated checks**

```powershell
npm run verify:footer-glow
npm run verify:homepage
npm run build
```

Expected: both verifiers pass and Vite build succeeds.

- [ ] **Step 8: Commit the reveal implementation**

```powershell
git add src/components/FooterSpringGlow.vue
git commit -m "feat: reveal footer glow below lifted footer"
```

---

### Task 4: Verify Zero Tail Height And Real Interaction

**Files:**
- Modify only if a failing check requires it: `src/components/FooterSpringGlow.vue`

- [ ] **Step 1: Verify UTF-8 and garbled-text safety**

```powershell
$files = @('src/App.vue','src/components/FooterSpringGlow.vue','scripts/verify-homepage-structure.mjs')
$markers = @([char]0xFFFD,[char]0x951F,[char]0x00C3,[char]0x00C2)
foreach ($file in $files) {
  $text = Get-Content -Raw -Encoding UTF8 $file
  foreach ($marker in $markers) {
    if ($text.Contains([string]$marker)) { throw "$file contains a garbled marker" }
  }
}
```

- [ ] **Step 2: Start the local preview and record closed-state metrics**

At desktop `1440x1000`, record:

```js
({
  scrollHeight: document.documentElement.scrollHeight,
  footerBottom: document.querySelector('.footer').getBoundingClientRect().bottom,
  revealTransform: getComputedStyle(document.querySelector('.footer-spring-glow__reveal')).transform
})
```

Expected at page bottom with progress `0`: footer bottom equals the viewport bottom within two pixels; the reveal is translated completely below the viewport; no extra blank tail can be scrolled into.

- [ ] **Step 3: Verify desktop pull behavior**

- A short downward wheel gesture moves the original footer upward and reveals part of the light layer; after `150ms`, it returns to the exact closed metrics.
- A long gesture crossing `65%` moves both layers to the full reveal distance and starts different bar animation durations.
- Reverse input moves both layers down together; after hidden, further reverse input scrolls the page upward.
- Clicking “回到顶部” while expanded immediately closes the reveal before the page crosses into body content.

- [ ] **Step 4: Verify mobile layout and input contract**

At `390x844`, verify no horizontal overflow, closed state has no tail, reveal height is at most `360px`, and the footer/reveal offsets use the same pixel value. Confirm single-touch listeners remain non-passive for `touchmove`, while two-touch starts are ignored by the existing handler.

- [ ] **Step 5: Verify reduced motion**

With `prefers-reduced-motion: reduce`, endpoints switch without spring oscillation and `.footer-spring-glow__bar` reports `animation-name: none`.

- [ ] **Step 6: Run final checks**

```powershell
npm run verify:footer-glow
npm run verify:homepage
npm run build
git diff --check
git status --short
```

Expected: all commands pass; only intentional changes are present.

---

## Self-Review

- Spec coverage: zero extra document height, slot-wrapped original footer, synchronized upward footer movement, fixed reveal from below, 65% snapping, reverse release, breathing, reduced motion, responsive limits, UTF-8, and browser checks all have explicit steps.
- State consistency: this revision reuses `hidden`、`pulling`、`expanded`、`collapsing`; no new state names are introduced.
- Geometry consistency: both layers derive from `--footer-reveal-offset`; input travel uses the same measured reveal height.
- Scope: only App integration, the existing footer component, and existing verification are changed.
- Every implementation step includes concrete code or an exact verification action; no unresolved placeholders remain.
