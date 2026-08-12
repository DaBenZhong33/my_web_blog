# Hero Metal Cube Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage `hero-ai.png` visual with a Three.js brushed-metal cube that rotates by default, unfolds into six separated faces on hover, and restores on pointer leave.

**Architecture:** Add a focused `HeroMetalCube.vue` component that owns the Three.js scene, animation state, responsive sizing, WebGL fallback, and cleanup. Keep `HomeView.vue` responsible for layout only, with the existing hero scroll-shift behavior untouched.

**Tech Stack:** Vue 3, Vite, Three.js, existing `npm run verify:homepage`, production build, Playwright via `npm exec --package playwright` for final visual checks.

---

## File Structure

- Create `src/components/HeroMetalCube.vue`: self-contained Three.js canvas component with six independent `PlaneGeometry` faces, brushed texture, lights, hover/touch state, reduced-motion handling, resize handling, and CSS fallback.
- Modify `src/views/HomeView.vue`: import `HeroMetalCube`, replace `hero-ai.png` markup, and retarget hero visual CSS from `.hero-person` to `.hero-cube`.
- Modify `scripts/verify-homepage-structure.mjs`: extend the existing UTF-8 and structure checks to cover the new component, dependency, fallback, and removal of `hero-ai.png`.
- Modify `package.json` and `package-lock.json`: add `three`.

## Working Tree Guard

The worktree currently has unrelated uncommitted changes in `src/components/ProjectPreviewCard.vue` and `src/main.js`. Do not revert or include them in commits for this feature unless the user explicitly changes scope. Use path-limited `git add` commands in every commit step.

---

### Task 1: Add Red Homepage Verification

**Files:**
- Modify: `scripts/verify-homepage-structure.mjs`

- [ ] **Step 1: Confirm starting state**

Run:

```powershell
git status --short
```

Expected: `src/components/ProjectPreviewCard.vue` and `src/main.js` may appear as modified. They are unrelated for this plan.

- [ ] **Step 2: Extend the verifier inputs**

In `scripts/verify-homepage-structure.mjs`, change the `files` object to include the Three.js component and `package.json`:

```js
const files = {
  home: 'src/views/HomeView.vue',
  rail: 'src/components/SectionRail.vue',
  preview: 'src/components/ProjectPreviewCard.vue',
  style: 'src/style.css',
  heroCube: 'src/components/HeroMetalCube.vue',
  packageJson: 'package.json'
}
```

After the existing reads for `home`, `rail`, `preview`, and `style`, add:

```js
const heroCube = readUtf8(files.heroCube)
const packageJson = readUtf8(files.packageJson)
```

Change the garbled-text loop to include `heroCube`:

```js
for (const [label, content] of Object.entries({ home, rail, preview, style, heroCube })) {
  if (garbledPattern.test(content)) failures.push(`${label} contains garbled text marker`)
}
```

- [ ] **Step 3: Add homepage expectations**

In the first homepage expectation block that already checks imports and rendered components, add these patterns:

```js
/import HeroMetalCube from '\.\.\/components\/HeroMetalCube\.vue'/,
/<HeroMetalCube[\s\S]*class="hero-cube"/
```

In the later homepage expectation block that currently includes `/opacity:\s*0\.76/`, remove that image-specific pattern and add:

```js
/class="hero-frame"/,
/class="hero-cube"/,
/min-height:\s*690px/
```

Add a new homepage rejection block near the existing `rejectPattern(files.home, home, pattern)` checks:

```js
for (const pattern of [
  /hero-ai\.png/,
  /class="hero-person"/,
  /AI 与人类协作的半机械人物/
]) {
  rejectPattern(files.home, home, pattern)
}
```

- [ ] **Step 4: Add component and dependency expectations**

After the existing `style` expectation blocks, add:

```js
for (const pattern of [
  /from 'three'/,
  /WebGLRenderer/,
  /MeshStandardMaterial/,
  /CanvasTexture/,
  /PlaneGeometry/,
  /ResizeObserver/,
  /prefers-reduced-motion: reduce/,
  /hero-metal-cube/,
  /webgl-fallback/,
  /is-unfolded/,
  /createBrushTexture/,
  /triggerTouchUnfold/,
  /disposeThreeScene/
]) {
  expectPattern(files.heroCube, heroCube, pattern)
}

expectPattern(files.packageJson, packageJson, /"three":/)
```

- [ ] **Step 5: Run verifier and confirm it fails for the new feature**

Run:

```powershell
npm run verify:homepage
```

Expected: FAIL. The output must mention missing `src/components/HeroMetalCube.vue`, missing `HeroMetalCube` import or usage, and missing `"three":`.

- [ ] **Step 6: Leave the red verifier uncommitted**

Run:

```powershell
git status --short
```

Expected: `scripts/verify-homepage-structure.mjs` is modified. Do not commit yet; the red verifier will be committed with the implementation once it passes.

---

### Task 2: Install Three.js

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Install dependency**

Run:

```powershell
npm install three
```

Expected: `package.json` contains a `three` dependency and `package-lock.json` is updated.

- [ ] **Step 2: Verify npm can resolve Three.js**

Run:

```powershell
npm ls three
```

Expected: output includes `three@` under `app-portfolio-blog@0.1.0`.

- [ ] **Step 3: Re-run verifier**

Run:

```powershell
npm run verify:homepage
```

Expected: FAIL. Missing component and homepage integration errors should remain; the package dependency error should be gone.

- [ ] **Step 4: Keep dependency changes staged later**

Run:

```powershell
git status --short
```

Expected: `package.json`, `package-lock.json`, and `scripts/verify-homepage-structure.mjs` are modified.

---

### Task 3: Create `HeroMetalCube.vue`

**Files:**
- Create: `src/components/HeroMetalCube.vue`

- [ ] **Step 1: Add the component**

Create `src/components/HeroMetalCube.vue` with this complete content:

```vue
<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'

const root = ref(null)
const canvasHost = ref(null)
const hasWebgl = ref(true)
const reducedMotion = ref(false)
const isUnfolded = ref(false)

const FACE_SIZE = 2.35
const HALF_SIZE = FACE_SIZE / 2
const ACCENT = 0xd6ff00

let scene
let camera
let renderer
let cubeGroup
let brushTexture
let core
let resizeObserver
let animationFrame = 0
let unfoldTarget = 0
let unfoldProgress = 0
let lastFrameTime = 0
let touchTimer = 0
let motionQuery

const faceDefinitions = [
  {
    name: 'front',
    closedPosition: new THREE.Vector3(0, 0, HALF_SIZE),
    normal: new THREE.Vector3(0, 0, 1),
    closedRotation: new THREE.Euler(0, 0, 0),
    openRotation: new THREE.Euler(0.24, -0.18, 0.16)
  },
  {
    name: 'back',
    closedPosition: new THREE.Vector3(0, 0, -HALF_SIZE),
    normal: new THREE.Vector3(0, 0, -1),
    closedRotation: new THREE.Euler(0, Math.PI, 0),
    openRotation: new THREE.Euler(-0.22, Math.PI + 0.24, -0.18)
  },
  {
    name: 'right',
    closedPosition: new THREE.Vector3(HALF_SIZE, 0, 0),
    normal: new THREE.Vector3(1, 0, 0),
    closedRotation: new THREE.Euler(0, Math.PI / 2, 0),
    openRotation: new THREE.Euler(0.18, Math.PI / 2 + 0.28, 0.22)
  },
  {
    name: 'left',
    closedPosition: new THREE.Vector3(-HALF_SIZE, 0, 0),
    normal: new THREE.Vector3(-1, 0, 0),
    closedRotation: new THREE.Euler(0, -Math.PI / 2, 0),
    openRotation: new THREE.Euler(-0.2, -Math.PI / 2 - 0.26, -0.24)
  },
  {
    name: 'top',
    closedPosition: new THREE.Vector3(0, HALF_SIZE, 0),
    normal: new THREE.Vector3(0, 1, 0),
    closedRotation: new THREE.Euler(-Math.PI / 2, 0, 0),
    openRotation: new THREE.Euler(-Math.PI / 2 - 0.3, 0.2, -0.2)
  },
  {
    name: 'bottom',
    closedPosition: new THREE.Vector3(0, -HALF_SIZE, 0),
    normal: new THREE.Vector3(0, -1, 0),
    closedRotation: new THREE.Euler(Math.PI / 2, 0, 0),
    openRotation: new THREE.Euler(Math.PI / 2 + 0.28, -0.18, 0.2)
  }
]

const getSettings = () => {
  const width = root.value?.clientWidth ?? window.innerWidth

  if (width < 520) {
    return {
      cameraZ: 7.8,
      cubeScale: 0.82,
      explodeDistance: 2.75,
      rotationSpeed: 0.006,
      unfoldedSpeed: 0.0018
    }
  }

  if (width < 920) {
    return {
      cameraZ: 7.1,
      cubeScale: 0.92,
      explodeDistance: 3.15,
      rotationSpeed: 0.007,
      unfoldedSpeed: 0.002
    }
  }

  return {
    cameraZ: 6.4,
    cubeScale: 1,
    explodeDistance: 3.55,
    rotationSpeed: 0.008,
    unfoldedSpeed: 0.0024
  }
}

const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3)

const createBrushTexture = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256

  const context = canvas.getContext('2d')
  const baseGradient = context.createLinearGradient(0, 0, 256, 256)
  baseGradient.addColorStop(0, '#f4f4ee')
  baseGradient.addColorStop(0.28, '#858d89')
  baseGradient.addColorStop(0.62, '#191d1d')
  baseGradient.addColorStop(1, '#d9ddd6')
  context.fillStyle = baseGradient
  context.fillRect(0, 0, 256, 256)

  for (let y = 0; y < 256; y += 2) {
    const shade = 150 + Math.round(Math.sin(y * 0.17) * 38)
    context.fillStyle = `rgba(${shade}, ${shade}, ${shade}, ${y % 8 === 0 ? 0.28 : 0.12})`
    context.fillRect(0, y, 256, 1)
  }

  context.globalCompositeOperation = 'screen'
  const highlight = context.createLinearGradient(0, 0, 256, 0)
  highlight.addColorStop(0, 'rgba(255,255,255,0.08)')
  highlight.addColorStop(0.48, 'rgba(255,255,255,0.28)')
  highlight.addColorStop(1, 'rgba(255,255,255,0.02)')
  context.fillStyle = highlight
  context.fillRect(0, 0, 256, 256)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(1, 2)

  return texture
}

const updateFaceTargets = () => {
  if (!cubeGroup) return

  const settings = getSettings()
  cubeGroup.scale.setScalar(settings.cubeScale)

  for (const face of cubeGroup.userData.faces) {
    const { definition } = face.userData
    face.userData.openPosition.copy(definition.normal).multiplyScalar(settings.explodeDistance)
  }
}

const updateFaceTransforms = () => {
  if (!cubeGroup) return

  const eased = easeOutCubic(unfoldProgress)

  for (const face of cubeGroup.userData.faces) {
    const { definition, openPosition } = face.userData
    face.position.lerpVectors(definition.closedPosition, openPosition, eased)
    face.rotation.set(
      THREE.MathUtils.lerp(definition.closedRotation.x, definition.openRotation.x, eased),
      THREE.MathUtils.lerp(definition.closedRotation.y, definition.openRotation.y, eased),
      THREE.MathUtils.lerp(definition.closedRotation.z, definition.openRotation.z, eased)
    )
  }

  if (core) {
    core.scale.setScalar(THREE.MathUtils.lerp(0.7, 1.85, eased))
    core.material.opacity = THREE.MathUtils.lerp(0.16, 0.42, eased)
  }
}

const renderOnce = () => {
  if (!renderer || !scene || !camera) return
  updateFaceTransforms()
  renderer.render(scene, camera)
}

const stopAnimation = () => {
  if (!animationFrame) return
  cancelAnimationFrame(animationFrame)
  animationFrame = 0
}

const animate = (time) => {
  if (reducedMotion.value) {
    stopAnimation()
    unfoldTarget = 0
    unfoldProgress = 0
    isUnfolded.value = false
    renderOnce()
    return
  }

  const settings = getSettings()
  const delta = lastFrameTime ? Math.min((time - lastFrameTime) / 16.67, 2) : 1
  lastFrameTime = time

  unfoldProgress += (unfoldTarget - unfoldProgress) * (unfoldTarget ? 0.085 : 0.13) * delta
  if (Math.abs(unfoldTarget - unfoldProgress) < 0.001) unfoldProgress = unfoldTarget

  const speed = THREE.MathUtils.lerp(settings.rotationSpeed, settings.unfoldedSpeed, unfoldProgress)
  cubeGroup.rotation.y += speed * delta
  cubeGroup.rotation.x = -0.26 + Math.sin(time * 0.00045) * 0.035
  cubeGroup.rotation.z = Math.sin(time * 0.00032) * 0.018

  updateFaceTransforms()
  renderer.render(scene, camera)
  animationFrame = requestAnimationFrame(animate)
}

const startAnimation = () => {
  if (animationFrame || reducedMotion.value || !renderer) return
  lastFrameTime = 0
  animationFrame = requestAnimationFrame(animate)
}

const resizeRenderer = () => {
  if (!renderer || !camera || !root.value) return

  const width = root.value.clientWidth
  const height = root.value.clientHeight
  const settings = getSettings()

  renderer.setSize(width, height, false)
  camera.aspect = width / height
  camera.position.z = settings.cameraZ
  camera.updateProjectionMatrix()
  updateFaceTargets()
  renderOnce()
}

const createFace = (definition) => {
  const plane = new THREE.PlaneGeometry(FACE_SIZE, FACE_SIZE, 18, 18)
  const material = new THREE.MeshStandardMaterial({
    color: 0xd8dad3,
    map: brushTexture,
    metalness: 0.9,
    roughness: 0.36,
    envMapIntensity: 0.7,
    side: THREE.DoubleSide
  })
  const mesh = new THREE.Mesh(plane, material)

  const edge = new THREE.LineSegments(
    new THREE.EdgesGeometry(plane),
    new THREE.LineBasicMaterial({
      color: 0xf3f5ee,
      transparent: true,
      opacity: 0.34
    })
  )

  const group = new THREE.Group()
  group.name = definition.name
  group.add(mesh)
  group.add(edge)
  group.position.copy(definition.closedPosition)
  group.rotation.copy(definition.closedRotation)
  group.userData = {
    definition,
    openPosition: definition.normal.clone().multiplyScalar(getSettings().explodeDistance)
  }

  return group
}

const createScene = () => {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  })
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.domElement.className = 'hero-metal-cube-canvas'
  renderer.domElement.style.display = 'block'
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'
  canvasHost.value.appendChild(renderer.domElement)

  scene.add(new THREE.AmbientLight(0xffffff, 0.72))

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.1)
  keyLight.position.set(4, 5, 6)
  scene.add(keyLight)

  const rimLight = new THREE.DirectionalLight(0xd6ff00, 0.55)
  rimLight.position.set(-3, 1.8, -4)
  scene.add(rimLight)

  const fillLight = new THREE.PointLight(0xffffff, 0.7, 12)
  fillLight.position.set(0, -2, 4)
  scene.add(fillLight)

  brushTexture = createBrushTexture()
  cubeGroup = new THREE.Group()
  cubeGroup.name = 'brushed-metal-cube'
  cubeGroup.rotation.set(-0.26, 0.52, 0)
  cubeGroup.userData.faces = faceDefinitions.map(createFace)
  for (const face of cubeGroup.userData.faces) cubeGroup.add(face)

  const coreMaterial = new THREE.MeshBasicMaterial({
    color: ACCENT,
    transparent: true,
    opacity: 0.16
  })
  core = new THREE.Mesh(new THREE.SphereGeometry(0.085, 20, 20), coreMaterial)
  cubeGroup.add(core)

  scene.add(cubeGroup)
}

const setUnfolded = (value) => {
  if (reducedMotion.value) return
  isUnfolded.value = value
  unfoldTarget = value ? 1 : 0
  startAnimation()
}

const handlePointerEnter = (event) => {
  if (event.pointerType === 'mouse' || event.pointerType === 'pen') setUnfolded(true)
}

const handlePointerLeave = (event) => {
  if (event.pointerType === 'mouse' || event.pointerType === 'pen') setUnfolded(false)
}

const triggerTouchUnfold = (event) => {
  if (event.pointerType === 'mouse' || reducedMotion.value) return
  window.clearTimeout(touchTimer)
  setUnfolded(true)
  touchTimer = window.setTimeout(() => setUnfolded(false), 1250)
}

const handleMotionPreference = () => {
  reducedMotion.value = motionQuery.matches
  if (reducedMotion.value) {
    stopAnimation()
    unfoldTarget = 0
    unfoldProgress = 0
    isUnfolded.value = false
    renderOnce()
  } else {
    startAnimation()
  }
}

const disposeThreeScene = () => {
  window.clearTimeout(touchTimer)
  stopAnimation()
  resizeObserver?.disconnect()

  if (motionQuery) {
    if (motionQuery.removeEventListener) {
      motionQuery.removeEventListener('change', handleMotionPreference)
    } else {
      motionQuery.removeListener(handleMotionPreference)
    }
  }

  if (cubeGroup) {
    cubeGroup.traverse((child) => {
      child.geometry?.dispose()
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => material.dispose())
      } else {
        child.material?.dispose()
      }
    })
  }

  brushTexture?.dispose()
  renderer?.dispose()
  renderer?.forceContextLoss?.()
  renderer?.domElement?.remove()

  scene = null
  camera = null
  renderer = null
  cubeGroup = null
  brushTexture = null
  core = null
}

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  if (motionQuery.addEventListener) {
    motionQuery.addEventListener('change', handleMotionPreference)
  } else {
    motionQuery.addListener(handleMotionPreference)
  }

  try {
    createScene()
  } catch (error) {
    hasWebgl.value = false
    disposeThreeScene()
    return
  }

  resizeObserver = new ResizeObserver(resizeRenderer)
  resizeObserver.observe(root.value)
  resizeRenderer()
  renderOnce()
  startAnimation()
})

onBeforeUnmount(disposeThreeScene)
</script>

<template>
  <div
    ref="root"
    class="hero-metal-cube"
    :class="{
      'webgl-fallback': !hasWebgl,
      'is-static': reducedMotion,
      'is-unfolded': isUnfolded
    }"
    aria-hidden="true"
    @pointerenter="handlePointerEnter"
    @pointerleave="handlePointerLeave"
    @pointerdown="triggerTouchUnfold"
  >
    <div ref="canvasHost" class="hero-metal-cube-canvas-host"></div>
    <div v-if="!hasWebgl" class="hero-metal-cube-fallback">
      <span class="fallback-face front"></span>
      <span class="fallback-face top"></span>
      <span class="fallback-face side"></span>
      <span class="fallback-core"></span>
    </div>
  </div>
</template>

<style scoped>
.hero-metal-cube {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 360px;
  cursor: pointer;
  isolation: isolate;
  touch-action: manipulation;
}

.hero-metal-cube.is-static {
  cursor: default;
}

.hero-metal-cube-canvas-host {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hero-metal-cube-canvas-host :deep(.hero-metal-cube-canvas) {
  display: block;
  width: 100%;
  height: 100%;
}

.hero-metal-cube-fallback {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  perspective: 900px;
}

.fallback-face {
  position: absolute;
  width: min(220px, 44vw);
  aspect-ratio: 1;
  border: 1px solid rgba(255, 255, 255, 0.32);
  background:
    repeating-linear-gradient(100deg, rgba(255, 255, 255, 0.18) 0 1px, transparent 1px 8px),
    linear-gradient(135deg, #f4f4ee, #858d89 30%, #171a1a 68%, #d9ddd6);
  box-shadow:
    inset 0 0 24px rgba(255, 255, 255, 0.16),
    0 26px 60px rgba(0, 0, 0, 0.48);
  transform-style: preserve-3d;
}

.fallback-face.front {
  transform: rotateX(-22deg) rotateY(34deg) translateZ(68px);
}

.fallback-face.top {
  filter: brightness(1.12);
  transform: rotateX(68deg) rotateZ(34deg) translateY(-78px);
}

.fallback-face.side {
  filter: brightness(0.72);
  transform: rotateY(68deg) rotateZ(-22deg) translateX(78px);
}

.fallback-core {
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #d6ff00;
  box-shadow: 0 0 34px rgba(214, 255, 0, 0.72);
}

@media (max-width: 720px) {
  .hero-metal-cube {
    min-height: 300px;
  }

  .fallback-face {
    width: min(176px, 54vw);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-metal-cube {
    cursor: default;
  }
}
</style>
```

- [ ] **Step 2: Re-run verifier**

Run:

```powershell
npm run verify:homepage
```

Expected: FAIL. Component-specific errors should be gone; homepage import and `hero-ai.png` removal errors should remain.

---

### Task 4: Integrate Cube Into Homepage

**Files:**
- Modify: `src/views/HomeView.vue`

- [ ] **Step 1: Add component import**

In `src/views/HomeView.vue`, add this import after `ProjectPreviewCard`:

```js
import HeroMetalCube from '../components/HeroMetalCube.vue'
```

- [ ] **Step 2: Replace the hero image markup**

Replace the current block:

```vue
<div class="hero-visual" ref="heroVisual" v-reveal>
  <div class="hero-frame">
    <img
      class="hero-person"
      src="/template-assets/hero-ai.png"
      alt="AI 与人类协作的半机械人物"
    />
  </div>
</div>
```

with:

```vue
<div class="hero-visual" ref="heroVisual" v-reveal>
  <div class="hero-frame">
    <HeroMetalCube class="hero-cube" />
  </div>
</div>
```

- [ ] **Step 3: Replace desktop hero visual CSS**

Replace the `.hero-frame` and `.hero-person` CSS block with:

```css
.hero-frame {
  position: absolute;
  inset: 0 -18px 0 0;
  overflow: visible;
  pointer-events: none;
}

.hero-cube {
  position: absolute;
  right: -40px;
  bottom: -72px;
  width: min(760px, 58vw);
  aspect-ratio: 1;
  max-width: none;
  pointer-events: auto;
}
```

- [ ] **Step 4: Replace tablet hero visual CSS**

Inside `@media (max-width: 1080px)`, replace the `.hero-person` block with:

```css
.hero-cube {
  right: 50%;
  bottom: -72px;
  transform: translateX(50%);
  width: min(720px, 96vw);
}
```

- [ ] **Step 5: Add mobile hero cube sizing**

Inside `@media (max-width: 720px)`, directly after the `.hero-visual` rule, add:

```css
.hero-cube {
  bottom: -38px;
  width: min(520px, 112vw);
}
```

- [ ] **Step 6: Keep reduced-motion layout stable**

Inside the existing `@media (prefers-reduced-motion: reduce)` block in `HomeView.vue`, add:

```css
.hero-cube {
  transform: none;
}
```

The tablet media rule applies `transform: translateX(50%)`; this reduced-motion override should only affect users with reduced motion enabled. Confirm mobile/tablet positioning remains acceptable in the visual verification task.

- [ ] **Step 7: Run verifier**

Run:

```powershell
npm run verify:homepage
```

Expected: PASS with `Homepage structure verification passed.`

- [ ] **Step 8: Run production build**

Run:

```powershell
npm run build
```

Expected: PASS with Vite producing `dist/`.

- [ ] **Step 9: Commit verified integration**

Run:

```powershell
git add package.json package-lock.json scripts/verify-homepage-structure.mjs src/views/HomeView.vue src/components/HeroMetalCube.vue
git commit -m "feat: add hero metal cube"
```

Expected: commit includes only the five feature files listed above. Do not stage `src/components/ProjectPreviewCard.vue` or `src/main.js`.

---

### Task 5: Automated Visual Check With Playwright

**Files:**
- No source file changes required unless this task exposes a visual defect.
- Screenshots written: `.codex-hero-cube-desktop.png`, `.codex-hero-cube-desktop-hover.png`, `.codex-hero-cube-mobile.png`

- [ ] **Step 1: Start the dev server**

Run:

```powershell
npm run dev -- --host 127.0.0.1 --port 5173
```

Expected: Vite reports `Local: http://127.0.0.1:5173/`. Keep this server running until the visual checks finish.

- [ ] **Step 2: Run Playwright screenshot and canvas-pixel check**

In a second PowerShell session, run:

```powershell
$script = @'
const { chromium } = await import('playwright')

const url = 'http://127.0.0.1:5173/'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 })

const sampleCanvas = async () => {
  return page.locator('.hero-metal-cube canvas').evaluate((canvas) => {
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) return { nonTransparent: 0, samples: [] }

    const width = canvas.width
    const height = canvas.height
    const points = [
      [0.5, 0.5],
      [0.42, 0.44],
      [0.58, 0.46],
      [0.5, 0.34],
      [0.5, 0.66],
      [0.34, 0.5],
      [0.66, 0.5]
    ]
    const pixel = new Uint8Array(4)
    const samples = []

    for (const [x, y] of points) {
      gl.readPixels(Math.floor(width * x), Math.floor(height * y), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel)
      samples.push(Array.from(pixel))
    }

    return {
      nonTransparent: samples.filter(([r, g, b, a]) => a > 0 && r + g + b > 24).length,
      samples
    }
  })
}

await page.goto(url, { waitUntil: 'networkidle' })
await page.locator('.hero-metal-cube canvas').waitFor({ state: 'visible', timeout: 10000 })
await page.waitForTimeout(900)
const desktopSamples = await sampleCanvas()
await page.screenshot({ path: '.codex-hero-cube-desktop.png', fullPage: false })

await page.locator('.hero-metal-cube').hover()
await page.waitForTimeout(900)
const isUnfolded = await page.locator('.hero-metal-cube').evaluate((node) => node.classList.contains('is-unfolded'))
const hoverSamples = await sampleCanvas()
await page.screenshot({ path: '.codex-hero-cube-desktop-hover.png', fullPage: false })

await page.setViewportSize({ width: 390, height: 844 })
await page.goto(url, { waitUntil: 'networkidle' })
await page.locator('.hero-metal-cube canvas').waitFor({ state: 'visible', timeout: 10000 })
await page.waitForTimeout(900)
const mobileSamples = await sampleCanvas()
await page.screenshot({ path: '.codex-hero-cube-mobile.png', fullPage: false })

await browser.close()

console.log(JSON.stringify({ desktopSamples, hoverSamples, isUnfolded, mobileSamples }, null, 2))

if (desktopSamples.nonTransparent < 2) throw new Error('desktop canvas appears blank')
if (!isUnfolded) throw new Error('hover did not set is-unfolded class')
if (hoverSamples.nonTransparent < 2) throw new Error('hover canvas appears blank')
if (mobileSamples.nonTransparent < 2) throw new Error('mobile canvas appears blank')
'@

npm exec --yes --package playwright node -- -e $script
```

Expected: command exits with code `0`, writes the three `.codex-hero-cube-*.png` files, and logs JSON where `desktopSamples.nonTransparent`, `hoverSamples.nonTransparent`, and `mobileSamples.nonTransparent` are at least `2`, with `isUnfolded` set to `true`.

- [ ] **Step 3: Inspect screenshots**

Open these files:

```powershell
Get-Item .codex-hero-cube-desktop.png, .codex-hero-cube-desktop-hover.png, .codex-hero-cube-mobile.png
```

Expected:

- Desktop screenshot shows no `hero-ai.png`.
- Desktop screenshot shows a brushed silver cube in the hero visual area.
- Hover screenshot shows separated faces with slower-looking orientation change and no overlap with hero text.
- Mobile screenshot shows the cube below the hero text without covering buttons or `大笨钟+`.

- [ ] **Step 4: Commit visual fixes only when edits were needed**

If the screenshots expose a layout or rendering problem, fix the relevant CSS or component code, then run:

```powershell
npm run verify:homepage
npm run build
git add src/views/HomeView.vue src/components/HeroMetalCube.vue scripts/verify-homepage-structure.mjs
git commit -m "fix: tune hero metal cube layout"
```

Expected: run this commit step only after a real source edit. If screenshots pass without edits, skip this commit step.

---

### Task 6: Reduced-Motion and UTF-8 Verification

**Files:**
- No source file changes required unless a check fails.

- [ ] **Step 1: Verify reduced-motion behavior through the component code**

Run:

```powershell
rg -n "prefers-reduced-motion|reducedMotion|startAnimation|stopAnimation|is-static" src\\components\\HeroMetalCube.vue src\\views\\HomeView.vue
```

Expected: output includes:

- `window.matchMedia('(prefers-reduced-motion: reduce)')`
- `stopAnimation()`
- `is-static`
- `@media (prefers-reduced-motion: reduce)`

- [ ] **Step 2: Run full project validation**

Run:

```powershell
npm run verify:homepage
npm run build
```

Expected: both commands pass.

- [ ] **Step 3: Confirm modified files read as UTF-8**

Run:

```powershell
Get-Content -Raw -Encoding UTF8 src\\components\\HeroMetalCube.vue | Out-Null
Get-Content -Raw -Encoding UTF8 src\\views\\HomeView.vue | Out-Null
Get-Content -Raw -Encoding UTF8 scripts\\verify-homepage-structure.mjs | Out-Null
Get-Content -Raw -Encoding UTF8 package.json | Out-Null
```

Expected: no read errors.

- [ ] **Step 4: Search for garbled text markers**

Run:

```powershell
rg -n "�|锟|Ã|Â" src\\components\\HeroMetalCube.vue src\\views\\HomeView.vue scripts\\verify-homepage-structure.mjs package.json package-lock.json
```

Expected: no matches.

- [ ] **Step 5: Final status check**

Run:

```powershell
git status --short
git log -3 --oneline
```

Expected: only unrelated pre-existing worktree changes remain, or the worktree is clean except those user-owned changes. Recent commits include `feat: add hero metal cube` and any visual tuning commit created in Task 5.

---

## Self-Review

- Spec coverage: Task 1 covers verification and `hero-ai.png` removal checks; Task 2 covers Three.js dependency; Task 3 covers component, six independent faces, metal material, fallback, cleanup, hover/touch and reduced-motion logic; Task 4 covers homepage integration and responsive layout; Task 5 covers desktop/mobile screenshots and canvas pixel checks; Task 6 covers build, UTF-8, garbled-text checks, and final status.
- Empty-section scan: every task has concrete file paths, commands, expected outcomes, and code blocks where code changes are required.
- Naming consistency: component name is `HeroMetalCube`, root class is `hero-metal-cube`, homepage class is `hero-cube`, touch function is `triggerTouchUnfold`, cleanup function is `disposeThreeScene`, verifier patterns match those names.
