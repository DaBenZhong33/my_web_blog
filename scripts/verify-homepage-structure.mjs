import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()

const files = {
  home: 'src/views/HomeView.vue',
  rail: 'src/components/SectionRail.vue',
  preview: 'src/components/ProjectPreviewCard.vue',
  style: 'src/style.css',
  heroCube: 'src/components/HeroMetalCube.vue',
  packageJson: 'package.json'
}

const failures = []

const readUtf8 = (relativePath) => {
  const absolutePath = resolve(root, relativePath)
  if (!existsSync(absolutePath)) {
    failures.push(`${relativePath} is missing`)
    return ''
  }
  return readFileSync(absolutePath, 'utf8')
}

const expectPattern = (label, content, pattern) => {
  if (!pattern.test(content)) failures.push(`${label} missing ${pattern}`)
}

const rejectPattern = (label, content, pattern) => {
  if (pattern.test(content)) failures.push(`${label} still contains ${pattern}`)
}

const home = readUtf8(files.home)
const rail = readUtf8(files.rail)
const preview = readUtf8(files.preview)
const style = readUtf8(files.style)
const heroCube = readUtf8(files.heroCube)
const packageJson = readUtf8(files.packageJson)

const garbledPattern = /[\uFFFD\u951F\u00C3\u00C2]/

for (const [label, content] of Object.entries({ home, rail, preview, style, heroCube })) {
  if (garbledPattern.test(content)) failures.push(`${label} contains garbled text marker`)
}

for (const id of ['intro', 'build', 'story', 'work', 'process', 'contact']) {
  expectPattern(files.home, home, new RegExp(`id="${id}"`))
}

for (const pattern of [
  /import SectionRail from/,
  /import ProjectPreviewCard from/,
  /const sections = \[/,
  /activeSection = ref/,
  /scrollProgress = ref/,
  /IntersectionObserver/,
  /requestAnimationFrame/,
  /<SectionRail[\s\S]*@navigate="navigateToSection"/,
  /<ProjectPreviewCard/,
  /import HeroMetalCube from '\.\.\/components\/HeroMetalCube\.vue'/,
  /<HeroMetalCube[\s\S]*class="hero-cube"/
]) {
  expectPattern(files.home, home, pattern)
}

for (const pattern of [
  /class="marked">CODE SYSTEMS</,
  /metric-ticker/,
  /splitTickerValue\(metric\.value\)/,
  /class="container project-book-list"/,
  /class="book-page-shell"/,
  /bookPageStyles/,
  /scroll-margin-top:\s*88px/,
  /text-decoration-thickness:\s*3px/,
  /class="hero-frame"/,
  /class="hero-cube"/,
  /min-height:\s*690px/
]) {
  expectPattern(files.home, home, pattern)
}

for (const pattern of [
  /import StatusTerminal from/,
  /const statusItems = \[/,
  /<StatusTerminal/,
  /class="marked glitch-reveal"/,
  /data-text="CODE SYSTEMS"/,
  /class="signal-strip"/,
  /work-hscroll/,
  /work-sticky/,
  /work-track/,
  /project-grid/,
  /signalTrack/,
  /tickerItems/,
  /const avatars = \[/,
  /class="trust-row"/,
  /class="stars"/
]) {
  rejectPattern(files.home, home, pattern)
}

for (const pattern of [
  /hero-ai\.png/,
  /class="hero-person"/,
  /AI 与人类协作的半机械人物/
]) {
  rejectPattern(files.home, home, pattern)
}

for (const pattern of [
  /defineEmits\(\['navigate'\]\)/,
  /sections: \{ type: Array, required: true \}/,
  /activeSection: \{ type: String, required: true \}/,
  /progress: \{ type: Number, default: 0 \}/,
  /aria-current/,
  /focus-visible/,
  /section-rail/
]) {
  expectPattern(files.rail, rail, pattern)
}

for (const pattern of [
  /import \{ RouterLink \} from 'vue-router'/,
  /import PhoneMockup from '\.\/PhoneMockup\.vue'/,
  /import AppIcon from '\.\/AppIcon\.vue'/,
  /isPreviewOpen = ref\(false\)/,
  /const openPreview = \(\) =>/,
  /const closePreview = \(event\) =>/,
  /@mouseenter="openPreview"/,
  /@focusin="openPreview"/,
  /@click="openPreview"/,
  /project\.features\.slice\(0, 3\)/,
  /project\.screens/,
  /focus-within/,
  /preview-open/
]) {
  expectPattern(files.preview, preview, pattern)
}

for (const pattern of [
  /spotlightStyle = ref/,
  /const updateSpotlight = \(event\) =>/,
  /--spotlight-x/,
  /project-spotlight/,
  /project-comet/
]) {
  expectPattern(files.preview, preview, pattern)
}

for (const pattern of [
  /@keyframes digitTicker/,
  /--btn-shimmer/,
  /prefers-reduced-motion: reduce[\s\S]*ticker-digit-strip/
]) {
  expectPattern(files.style, style, pattern)
}

for (const pattern of [
  /\.glitch-reveal/,
  /@keyframes glitchReveal/,
  /@keyframes glitchSliceTop/,
  /@keyframes glitchSliceBottom/,
  /\.marquee/,
  /@keyframes marquee/,
  /signal-strip::before/
]) {
  rejectPattern(files.style, style, pattern)
}

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
  /TEXTURE_SIZE/,
  /texture\.repeat\.set\(1, 1\)/,
  /unfoldedCameraZ/,
  /camera\.position\.z = THREE\.MathUtils\.lerp\(settings\.cameraZ, settings\.unfoldedCameraZ, unfoldProgress\)/,
  /triggerTouchUnfold/,
  /disposeThreeScene/
]) {
  expectPattern(files.heroCube, heroCube, pattern)
}

expectPattern(files.packageJson, packageJson, /"three":/)

for (const pattern of [
  /baseGradient\.addColorStop\(0\.62/,
  /baseGradient\.addColorStop\(1,\s*'#d9ddd6'\)/
]) {
  rejectPattern(files.heroCube, heroCube, pattern)
}

if (failures.length) {
  console.error('Homepage structure verification failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('Homepage structure verification passed.')
