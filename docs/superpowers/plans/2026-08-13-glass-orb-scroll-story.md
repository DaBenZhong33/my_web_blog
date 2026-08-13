# 首页玻璃球滚动叙事实作计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用滚动驱动的 3D 玻璃球替换首页金属立方体，并以四屏电影式过渡把访客带到能力区。

**Architecture:** `HomeView.vue` 计算故事容器的连续滚动进度，并同时传给 Three.js 组件和 CSS 内容层。新组件只管理 WebGL 场景、碎片和镜头；首页保留语义化的英雄区与能力区，用一个纯装饰性预览层在转场末尾显现能力区内容。

**Tech Stack:** Vue 3 Composition API、Three.js、Vite、现有首页结构校验脚本、CSS 自定义属性。

---

## 预定文件结构

- 新增：`src/components/HeroGlassOrbStory.vue` — 玻璃球、碎片、相机、WebGL 降级与资源回收。
- 修改：`src/views/HomeView.vue` — 故事滚动进度、组件接入、能力区预览层与响应式样式。
- 修改：`scripts/verify-homepage-structure.mjs` — 对新组件、滚动绑定、降级语义和乱码检查的结构性验证。
- 删除：`src/components/HeroMetalCube.vue` — 不再被引用的金属立方体实现。

### Task 1：先让首页结构验证描述新行为

**Files:**

- Modify: `scripts/verify-homepage-structure.mjs`
- Test: `scripts/verify-homepage-structure.mjs`

- [ ] **Step 1：将验证脚本的组件清单从旧立方体改为新玻璃球**

把 `files` 中的 `heroCube` 替换为 `heroGlassOrb: 'src/components/HeroGlassOrbStory.vue'`，将读取变量同步改名为 `heroGlassOrb`，并把乱码检查对象中的 `heroCube` 替换为 `heroGlassOrb`：

```js
const files = {
  home: 'src/views/HomeView.vue',
  rail: 'src/components/SectionRail.vue',
  preview: 'src/components/ProjectPreviewCard.vue',
  style: 'src/style.css',
  heroGlassOrb: 'src/components/HeroGlassOrbStory.vue',
  canvasText: 'src/components/CanvasText.vue',
  liquidMetalBackdrop: 'src/components/LiquidMetalBackdrop.vue',
  packageJson: 'package.json'
}

const heroGlassOrb = readUtf8(files.heroGlassOrb)

for (const [label, content] of Object.entries({ home, rail, preview, style, heroGlassOrb, canvasText, liquidMetalBackdrop })) {
  if (garbledPattern.test(content)) failures.push(`${label} contains garbled text marker`)
}
```

- [ ] **Step 2：把首页断言改成新组件与故事容器断言**

移除旧的 `HeroMetalCube` 导入和 `hero-cube` 断言；加入以下断言：

```js
for (const pattern of [
  /import HeroGlassOrbStory from '\.\.\/components\/HeroGlassOrbStory\.vue'/,
  /const scrollStory = ref\(null\)/,
  /const storyProgress = ref\(0\)/,
  /const updateStoryProgress = \(\) =>/,
  /class="hero-scroll-story"/,
  /ref="scrollStory"/,
  /<HeroGlassOrbStory[\s\S]*:progress="storyProgress"/,
  /class="story-capability-reveal"/,
  /:style="\{ '--story-progress': storyProgress \}"/
]) {
  expectPattern(files.home, home, pattern)
}
```

- [ ] **Step 3：为新组件写入最小结构断言**

用下列断言替换整个旧 `heroCube` 断言块，确保实现保留浏览器降级与释放资源：

```js
for (const pattern of [
  /from 'three'/,
  /defineProps/,
  /progress: \{ type: Number, default: 0 \}/,
  /WebGLRenderer/,
  /MeshPhysicalMaterial/,
  /SphereGeometry/,
  /TetrahedronGeometry/,
  /ResizeObserver/,
  /prefers-reduced-motion: reduce/,
  /aria-hidden="true"/,
  /disposeScene/,
  /renderer\?\.forceContextLoss/,
  /hero-glass-orb-fallback/
]) {
  expectPattern(files.heroGlassOrb, heroGlassOrb, pattern)
}
```

- [ ] **Step 4：运行验证以确认它先失败**

运行：`npm run verify:homepage`

预期：失败，输出 `src/components/HeroGlassOrbStory.vue is missing`，并报告首页仍缺少玻璃球故事相关模式。

- [ ] **Step 5：提交验证意图**

```bash
git add scripts/verify-homepage-structure.mjs
git commit -m "test: define glass orb scroll story structure"
```

### Task 2：创建可降级的 Three.js 玻璃球与碎片组件

**Files:**

- Create: `src/components/HeroGlassOrbStory.vue`
- Test: `scripts/verify-homepage-structure.mjs`

- [ ] **Step 1：创建组件接口、Canvas 容器和静态备用外观**

组件必须只接收父级计算好的进度，不自行绑定滚动：

```vue
<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'

const props = defineProps({
  progress: { type: Number, default: 0 }
})

const root = ref(null)
const canvasHost = ref(null)
const hasWebgl = ref(true)
const reducedMotion = ref(false)
const sceneState = computed(() => ({
  '--orb-crack': Math.min(Math.max((props.progress - 0.23) / 0.22, 0), 1),
  '--orb-fallback-burst': Math.min(Math.max((props.progress - 0.45) / 0.3, 0), 1)
}))
</script>

<template>
  <div ref="root" class="hero-glass-orb" :class="{ 'is-static': reducedMotion }" :style="sceneState" aria-hidden="true">
    <div ref="canvasHost" class="hero-glass-orb-canvas"></div>
    <div v-if="!hasWebgl || reducedMotion" class="hero-glass-orb-fallback">
      <span class="orb-fallback-core"></span>
      <span v-for="index in 8" :key="index" class="orb-fallback-shard" :style="{ '--shard-index': index }"></span>
    </div>
  </div>
</template>
```

- [ ] **Step 2：实现稳定的碎片种子和场景构建**

在组件中加入固定的 42 块碎片，避免在滚动时重新随机：

```js
const SHARD_COUNT = 42
const ACCENT = 0xd7ff00
const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max)
const smoothstep = (value) => {
  const t = clamp(value)
  return t * t * (3 - 2 * t)
}

const createShardSeed = (index) => {
  const phase = index * 2.3999632297
  const radius = 0.72 + (index % 7) * 0.075
  return {
    origin: new THREE.Vector3(Math.cos(phase) * radius, Math.sin(phase * 1.7) * radius, Math.sin(phase * 0.67) * 0.62),
    destination: new THREE.Vector3(Math.cos(phase) * (3.6 + (index % 4) * 0.28), Math.sin(phase * 1.7) * (2.5 + (index % 5) * 0.17), -1.4 - (index % 6) * 0.34),
    spin: new THREE.Vector3(0.7 + (index % 3) * 0.19, 0.5 + (index % 5) * 0.13, 0.6 + (index % 7) * 0.11)
  }
}

const createScene = () => {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100)
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8))
  canvasHost.value.appendChild(renderer.domElement)
  scene.add(new THREE.AmbientLight(0xffffff, 0.8))
  const rim = new THREE.DirectionalLight(ACCENT, 1.6)
  rim.position.set(-3, 2, 4)
  scene.add(rim)
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xdceceb, transmission: 0.72, roughness: 0.12, metalness: 0.08, ior: 1.32, transparent: true, opacity: 0.92 })
  orb = new THREE.Mesh(new THREE.SphereGeometry(1.34, 40, 28), glass)
  cracks = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.36, 3)), new THREE.LineBasicMaterial({ color: 0xe9ffff, transparent: true, opacity: 0 }))
  shardGroup = new THREE.Group()
  Array.from({ length: SHARD_COUNT }, (_, index) => {
    const shard = new THREE.Mesh(new THREE.TetrahedronGeometry(0.18 + (index % 4) * 0.052, 0), glass.clone())
    shard.userData.seed = createShardSeed(index)
    shardGroup.add(shard)
  })
  scene.add(orb, cracks, shardGroup)
}
```

- [ ] **Step 3：把进度映射到裂纹、碎片和相机，且每次只渲染一帧**

实现以下函数并由 `watch(() => props.progress, renderProgress, { immediate: true })` 调用。不得把连续的 `requestAnimationFrame` 循环用于滚动状态；只有尺寸变化和进度变化才渲染：

```js
const renderProgress = (value = props.progress) => {
  if (!renderer || !scene || !camera || reducedMotion.value) return
  const crack = smoothstep((value - 0.23) / 0.22)
  const burst = smoothstep((value - 0.45) / 0.3)
  const exit = smoothstep((value - 0.75) / 0.25)
  orb.material.opacity = 0.92 * (1 - burst)
  cracks.material.opacity = 0.08 + crack * 0.72 - burst * 0.6
  shardGroup.visible = burst > 0.001
  shardGroup.children.forEach((shard, index) => {
    const { origin, destination, spin } = shard.userData.seed
    shard.position.lerpVectors(origin, destination, burst)
    shard.rotation.set(burst * spin.x * 7, burst * spin.y * 7, burst * spin.z * 7)
    shard.scale.setScalar(0.45 + burst * (1.12 + (index % 3) * 0.07))
    shard.material.opacity = 0.8 * (1 - exit)
  })
  camera.position.set(0.2 + burst * 0.9, -0.08 + burst * 0.35, 6.4 - burst * 3.75)
  camera.lookAt(0.45 + burst * 1.45, 0.05, -0.9)
  renderer.render(scene, camera)
}
```

- [ ] **Step 4：实现尺寸、无动画偏好和资源回收**

在 `onMounted` 中创建 `ResizeObserver`、侦听 `prefers-reduced-motion` 并调用 `createScene()`；任何 WebGL 异常将 `hasWebgl.value = false`。在 `disposeScene()` 中断开观察器与媒体查询，遍历 `scene` 释放 `geometry`、`material`，再执行：

```js
renderer?.dispose()
renderer?.forceContextLoss?.()
renderer?.domElement?.remove()
scene = null
camera = null
renderer = null
```

`onBeforeUnmount(disposeScene)` 必须是唯一的卸载出口。为 `.hero-glass-orb-fallback` 写出可读的 CSS 玻璃圆与按 `--orb-fallback-burst` 展开的碎片；`@media (prefers-reduced-motion: reduce)` 中隐藏画布且让备用外观保持完整球体。

- [ ] **Step 5：运行结构验证并确认通过**

运行：`npm run verify:homepage`

预期：失败，只报告 `HomeView.vue` 缺少新故事容器和组件接入；不应再报告玻璃球组件缺失或组件结构缺失。

- [ ] **Step 6：提交独立的 3D 组件**

```bash
git add src/components/HeroGlassOrbStory.vue
git commit -m "feat: add glass orb scroll story scene"
```

### Task 3：把故事容器接入首页并显现能力区预览

**Files:**

- Modify: `src/views/HomeView.vue`
- Delete: `src/components/HeroMetalCube.vue`
- Test: `scripts/verify-homepage-structure.mjs`

- [ ] **Step 1：替换导入和添加故事状态**

把旧组件导入替换为：

```js
import HeroGlassOrbStory from '../components/HeroGlassOrbStory.vue'
```

把 Vue 导入中的 `ref` 改为 `computed, ref`，再在现有 `heroVisual` 附近添加：

```js
const scrollStory = ref(null)
const storyProgress = ref(0)
const storyReveal = computed(() => clamp((storyProgress.value - 0.73) / 0.27))
const storyCardShift = computed(() => `${(1 - clamp((storyProgress.value - 0.8) / 0.2)) * 28}px`)

const updateStoryProgress = () => {
  if (!scrollStory.value) return
  const rect = scrollStory.value.getBoundingClientRect()
  const travel = Math.max(scrollStory.value.offsetHeight - window.innerHeight, 1)
  storyProgress.value = clamp((-rect.top) / travel)
}
```

在 `onScroll` 的 `requestAnimationFrame` 回调里，于 `updateScrollProgress()` 前调用 `updateStoryProgress()`；在 `onMounted` 的初始计算中也调用一次。

- [ ] **Step 2：把英雄区改为四屏故事容器，保留语义内容**

用以下外层结构包住原来的 `#intro` 区，保留其文案、`LiquidMetalBackdrop`、按钮和 `hero-wordmark`：

```vue
<div
  ref="scrollStory"
  class="hero-scroll-story"
  :style="{
    '--story-progress': storyProgress,
    '--story-reveal': `${storyReveal * 100}%`,
    '--story-reveal-opacity': storyReveal,
    '--story-card-shift': storyCardShift
  }"
>
  <div class="hero-scroll-stage">
    <section id="intro" class="zel-hero">
      <!-- 原有首屏文案和背景保持不变 -->
      <div class="hero-visual" ref="heroVisual" v-reveal>
        <div class="hero-frame">
          <HeroGlassOrbStory class="hero-glass-orb-scene" :progress="storyProgress" />
        </div>
      </div>
    </section>

    <div class="story-capability-reveal" aria-hidden="true">
      <p class="eyebrow dark">What I Build · 我在做什么</p>
      <h2>TURNING SMALL IDEAS INTO SHIPPED PRODUCTS</h2>
      <div class="story-capability-card">
        <span>{{ capabilities[0].no }}</span>
        <strong>{{ capabilities[0].title }}</strong>
        <em>{{ capabilities[0].zh }}</em>
      </div>
    </div>
  </div>
</div>
```

将原 `<HeroMetalCube class="hero-cube" />` 完整删除。原本紧随其后的 `#build` 区保持真实内容和现有链接目标，不复制能力列表，也不改变数据结构。

- [ ] **Step 3：增加进度驱动的桌面与移动端样式**

新增以下核心样式，保留原有网格、文案与基础排版规则；将 `.hero-cube` 的专属规则改为 `.hero-glass-orb-scene`：

```css
.hero-scroll-story { height: 400vh; position: relative; }
.hero-scroll-stage { position: sticky; top: 0; height: 100vh; overflow: hidden; background: #050505; }
.zel-hero { min-height: 100%; transition: opacity 180ms linear; opacity: calc(1 - max(0, (var(--story-progress) - 0.72) * 3.58)); }
.hero-glass-orb-scene { position: absolute; right: -22px; bottom: -72px; width: min(760px, 58vw); aspect-ratio: 1; }
.story-capability-reveal { position: absolute; inset: 0; display: grid; align-content: center; justify-items: start; padding: 10vh max(24px, calc((100vw - 1280px) / 2)); color: #050505; background: #f0f0ed; clip-path: inset(0 calc(100% - var(--story-reveal)) 0 0); opacity: var(--story-reveal-opacity); pointer-events: none; }
.story-capability-card { margin-top: 28px; padding: 22px; border: 1px solid rgba(5, 5, 5, .22); background: rgba(255, 255, 255, .46); transform: translateY(var(--story-card-shift)); }
```

在 `@media (max-width: 720px)` 中将 `.hero-scroll-story` 设为 `height: 200vh`，把 `.hero-glass-orb-scene` 居中、宽度限制为 `min(430px, 104vw)`，并缩小预览标题。在 `@media (prefers-reduced-motion: reduce)` 中将 `.hero-scroll-story` 设为 `height: auto`、`.hero-scroll-stage` 改为 `position: relative`、隐藏 `.story-capability-reveal`，确保正常首屏后直接进入真实能力区。

- [ ] **Step 4：删除不用的金属立方体文件**

先确认没有引用：`rg -n "HeroMetalCube|hero-metal-cube" src scripts`

预期：只有该组件文件自身和已改为新组件的历史验证模式；移除历史模式后输出仅组件文件路径。然后删除 `src/components/HeroMetalCube.vue`。

- [ ] **Step 5：运行结构验证与生产构建**

运行：

```bash
npm run verify:homepage
npm run build
```

预期：两条命令均以退出代码 0 结束；验证输出 `Homepage structure verification passed.`，构建输出 Vite 的产物汇总。

- [ ] **Step 6：提交首页接入**

```bash
git add src/views/HomeView.vue src/components/HeroMetalCube.vue scripts/verify-homepage-structure.mjs
git commit -m "feat: reveal capabilities through glass orb scroll story"
```

### Task 4：浏览器验收、编码检查与回归验证

**Files:**

- Modify: `src/views/HomeView.vue`（仅在验收发现问题时）
- Modify: `src/components/HeroGlassOrbStory.vue`（仅在验收发现问题时）
- Test: `scripts/verify-homepage-structure.mjs`

- [ ] **Step 1：启动本地站点并检查桌面端四个叙事阶段**

运行：`npm run dev -- --host 127.0.0.1`

在浏览器从顶部依次滚动到故事容器的约 0%、30%、60%、90%，确认：球体完整且文字可读、裂纹可见、碎片随主镜头分散、能力区预览以斜切口显现。

- [ ] **Step 2：检查移动端与无动画模式**

在浏览器宽度 390px 下确认故事约两屏完成、无水平溢出且能力区能到达。启用 `prefers-reduced-motion: reduce` 后刷新，确认画布隐藏或静止，首屏与真实能力列表直接可读。

- [ ] **Step 3：检查 WebGL 降级路径**

临时在浏览器开发工具中阻止 WebGL 上下文或让 `createScene()` 抛出一次受控异常；确认 `.hero-glass-orb-fallback` 出现，文案、按钮和能力区没有被遮挡。恢复环境后不提交临时调试改动。

- [ ] **Step 4：执行最终自动验证和 UTF-8 检查**

运行：

```bash
npm run verify:homepage
npm run build
node -e "const fs=require('fs'); for (const p of ['src/views/HomeView.vue','src/components/HeroGlassOrbStory.vue','scripts/verify-homepage-structure.mjs']) { if (fs.readFileSync(p,'utf8').includes('\uFFFD')) process.exit(1) }; console.log('UTF-8 check passed')"
git diff --check
```

预期：所有命令退出代码均为 0；最后两条命令分别输出 `UTF-8 check passed` 和无输出。

- [ ] **Step 5：提交验收中产生的必要修正**

若验收步骤修改了源码或验证脚本，执行：

```bash
git add src/views/HomeView.vue src/components/HeroGlassOrbStory.vue scripts/verify-homepage-structure.mjs
git commit -m "fix: polish glass orb scroll story"
```

若没有修改，不创建空提交。

## 计划自检

- 规格中的玻璃球、裂纹、36～48 块碎片、四段时间线、能力区优先显现、移动端缩短、减少动态、WebGL 降级与资源释放，分别由 Task 2 至 Task 4 覆盖。
- 所有文件路径、函数名称、组件属性和验证命令在各任务中保持一致。
- 计划没有未定义的后续工作、空占位或依赖新第三方包的步骤。
