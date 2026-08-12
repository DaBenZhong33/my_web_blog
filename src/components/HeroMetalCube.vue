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
const TEXTURE_SIZE = 512

let scene
let camera
let renderer
let cubeGroup
let brushTexture
let reflectionTexture
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
    openPosition: new THREE.Vector3(0.08, 0, 2.25),
    closedRotation: new THREE.Euler(0, 0, 0),
    openRotation: new THREE.Euler(0.24, -0.18, 0.16)
  },
  {
    name: 'back',
    closedPosition: new THREE.Vector3(0, 0, -HALF_SIZE),
    normal: new THREE.Vector3(0, 0, -1),
    openPosition: new THREE.Vector3(-0.14, 0.02, -2.45),
    closedRotation: new THREE.Euler(0, Math.PI, 0),
    openRotation: new THREE.Euler(-0.22, Math.PI + 0.24, -0.18)
  },
  {
    name: 'right',
    closedPosition: new THREE.Vector3(HALF_SIZE, 0, 0),
    normal: new THREE.Vector3(1, 0, 0),
    openPosition: new THREE.Vector3(2.85, 0.14, 0.12),
    closedRotation: new THREE.Euler(0, Math.PI / 2, 0),
    openRotation: new THREE.Euler(0.18, Math.PI / 2 + 0.28, 0.22)
  },
  {
    name: 'left',
    closedPosition: new THREE.Vector3(-HALF_SIZE, 0, 0),
    normal: new THREE.Vector3(-1, 0, 0),
    openPosition: new THREE.Vector3(-2.85, -0.14, -0.1),
    closedRotation: new THREE.Euler(0, -Math.PI / 2, 0),
    openRotation: new THREE.Euler(-0.2, -Math.PI / 2 - 0.26, -0.24)
  },
  {
    name: 'top',
    closedPosition: new THREE.Vector3(0, HALF_SIZE, 0),
    normal: new THREE.Vector3(0, 1, 0),
    openPosition: new THREE.Vector3(0.18, 2.65, 0.06),
    closedRotation: new THREE.Euler(-Math.PI / 2, 0, 0),
    openRotation: new THREE.Euler(-Math.PI / 2 - 0.3, 0.2, -0.2)
  },
  {
    name: 'bottom',
    closedPosition: new THREE.Vector3(0, -HALF_SIZE, 0),
    normal: new THREE.Vector3(0, -1, 0),
    openPosition: new THREE.Vector3(-0.18, -2.65, 0.08),
    closedRotation: new THREE.Euler(Math.PI / 2, 0, 0),
    openRotation: new THREE.Euler(Math.PI / 2 + 0.28, -0.18, 0.2)
  }
]

const getSettings = () => {
  const width = root.value?.clientWidth ?? window.innerWidth

  if (width < 520) {
    return {
      cameraZ: 7.8,
      unfoldedCameraZ: 9,
      cubeScale: 0.76,
      explodeDistance: 0.72,
      rotationSpeed: 0.006,
      unfoldedSpeed: 0.0018
    }
  }

  if (width < 920) {
    return {
      cameraZ: 7.1,
      unfoldedCameraZ: 9.15,
      cubeScale: 0.84,
      explodeDistance: 0.86,
      rotationSpeed: 0.007,
      unfoldedSpeed: 0.002
    }
  }

  return {
    cameraZ: 6.8,
    unfoldedCameraZ: 8.75,
    cubeScale: 0.92,
    explodeDistance: 1,
    rotationSpeed: 0.008,
    unfoldedSpeed: 0.0024
  }
}

const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3)

const createBrushTexture = () => {
  const canvas = document.createElement('canvas')
  canvas.width = TEXTURE_SIZE
  canvas.height = TEXTURE_SIZE

  const context = canvas.getContext('2d')
  context.fillStyle = '#8b938d'
  context.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)

  for (let y = 0; y < TEXTURE_SIZE; y += 1) {
    const wave = Math.sin(y * 0.085) * 11 + Math.sin(y * 0.27) * 6
    const shade = 142 + Math.round(wave)
    context.fillStyle = `rgba(${shade}, ${shade}, ${shade}, ${y % 5 === 0 ? 0.24 : 0.13})`
    context.fillRect(0, y, TEXTURE_SIZE, 1)
  }

  for (let y = 0; y < TEXTURE_SIZE; y += 7) {
    const offset = Math.sin(y * 0.37) * 18
    context.fillStyle = 'rgba(255, 255, 255, 0.09)'
    context.fillRect(Math.max(0, offset), y, TEXTURE_SIZE - Math.abs(offset), 1)
  }

  context.globalCompositeOperation = 'screen'
  const diagonalGlint = context.createLinearGradient(0, TEXTURE_SIZE, TEXTURE_SIZE, 0)
  diagonalGlint.addColorStop(0, 'rgba(255,255,255,0.02)')
  diagonalGlint.addColorStop(0.34, 'rgba(255,255,255,0.05)')
  diagonalGlint.addColorStop(0.52, 'rgba(255,255,255,0.2)')
  diagonalGlint.addColorStop(0.68, 'rgba(255,255,255,0.07)')
  diagonalGlint.addColorStop(1, 'rgba(255,255,255,0.03)')
  context.fillStyle = diagonalGlint
  context.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)

  const edgeSheen = context.createLinearGradient(0, 0, TEXTURE_SIZE, 0)
  edgeSheen.addColorStop(0, 'rgba(255,255,255,0.14)')
  edgeSheen.addColorStop(0.16, 'rgba(255,255,255,0.03)')
  edgeSheen.addColorStop(0.78, 'rgba(255,255,255,0.02)')
  edgeSheen.addColorStop(1, 'rgba(255,255,255,0.18)')
  context.fillStyle = edgeSheen
  context.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)

  context.globalCompositeOperation = 'multiply'
  const edgeDepth = context.createLinearGradient(0, 0, 0, TEXTURE_SIZE)
  edgeDepth.addColorStop(0, 'rgba(0,0,0,0.1)')
  edgeDepth.addColorStop(0.48, 'rgba(255,255,255,1)')
  edgeDepth.addColorStop(1, 'rgba(0,0,0,0.18)')
  context.fillStyle = edgeDepth
  context.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)

  context.globalCompositeOperation = 'screen'
  const highlight = context.createLinearGradient(0, 0, TEXTURE_SIZE, 0)
  highlight.addColorStop(0, 'rgba(255,255,255,0.03)')
  highlight.addColorStop(0.5, 'rgba(255,255,255,0.12)')
  highlight.addColorStop(1, 'rgba(255,255,255,0.04)')
  context.fillStyle = highlight
  context.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(1, 1)

  return texture
}

const createReflectionTexture = () => {
  const canvas = document.createElement('canvas')
  canvas.width = TEXTURE_SIZE * 2
  canvas.height = TEXTURE_SIZE

  const context = canvas.getContext('2d')
  const sky = context.createLinearGradient(0, 0, canvas.width, 0)
  sky.addColorStop(0, '#050606')
  sky.addColorStop(0.16, '#acb5ac')
  sky.addColorStop(0.25, '#5d655f')
  sky.addColorStop(0.42, '#111413')
  sky.addColorStop(0.56, '#c3cbc0')
  sky.addColorStop(0.68, '#7a837c')
  sky.addColorStop(0.82, '#090b0b')
  sky.addColorStop(1, '#cbd0c6')
  context.fillStyle = sky
  context.fillRect(0, 0, canvas.width, canvas.height)

  const horizon = context.createLinearGradient(0, 0, 0, canvas.height)
  horizon.addColorStop(0, 'rgba(255,255,255,0.18)')
  horizon.addColorStop(0.48, 'rgba(255,255,255,0.02)')
  horizon.addColorStop(0.54, 'rgba(0,0,0,0.36)')
  horizon.addColorStop(1, 'rgba(0,0,0,0.74)')
  context.fillStyle = horizon
  context.fillRect(0, 0, canvas.width, canvas.height)

  const texture = new THREE.CanvasTexture(canvas)
  texture.mapping = THREE.EquirectangularReflectionMapping
  texture.colorSpace = THREE.SRGBColorSpace

  return texture
}

const updateFaceTargets = () => {
  if (!cubeGroup) return

  const settings = getSettings()
  cubeGroup.scale.setScalar(settings.cubeScale)

  for (const face of cubeGroup.userData.faces) {
    const { definition } = face.userData
    face.userData.openPosition.copy(definition.openPosition).multiplyScalar(settings.explodeDistance)
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
  camera.position.z = THREE.MathUtils.lerp(settings.cameraZ, settings.unfoldedCameraZ, unfoldProgress)
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
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xb4bbb1,
    map: brushTexture,
    bumpMap: brushTexture,
    bumpScale: 0.035,
    envMap: reflectionTexture,
    anisotropy: 0.82,
    anisotropyRotation: Math.PI / 2,
    metalness: 0.86,
    roughness: 0.2,
    clearcoat: 0.28,
    clearcoatRoughness: 0.16,
    reflectivity: 0.82,
    envMapIntensity: 1.22,
    side: THREE.DoubleSide
  })
  const mesh = new THREE.Mesh(plane, material)

  const edge = new THREE.LineSegments(
    new THREE.EdgesGeometry(plane),
    new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.48
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
    openPosition: definition.openPosition.clone().multiplyScalar(getSettings().explodeDistance)
  }

  return group
}

const createScene = () => {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
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

  scene.add(new THREE.AmbientLight(0xffffff, 0.58))

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.15)
  keyLight.position.set(4, 5, 6)
  scene.add(keyLight)

  const rimLight = new THREE.DirectionalLight(ACCENT, 0.78)
  rimLight.position.set(-3, 1.8, -4)
  scene.add(rimLight)

  const fillLight = new THREE.PointLight(0xffffff, 0.86, 14)
  fillLight.position.set(0.6, -1.6, 4.5)
  scene.add(fillLight)

  brushTexture = createBrushTexture()
  reflectionTexture = createReflectionTexture()
  scene.environment = reflectionTexture
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
  reflectionTexture?.dispose()
  renderer?.dispose()
  renderer?.forceContextLoss?.()
  renderer?.domElement?.remove()

  scene = null
  camera = null
  renderer = null
  cubeGroup = null
  brushTexture = null
  reflectionTexture = null
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
