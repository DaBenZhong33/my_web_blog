import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()

const files = {
  app: 'src/App.vue',
  home: 'src/views/HomeView.vue',
  rail: 'src/components/SectionRail.vue',
  preview: 'src/components/ProjectPreviewCard.vue',
  style: 'src/style.css',
  heroCube: 'src/components/HeroMetalCube.vue',
  canvasText: 'src/components/CanvasText.vue',
  liquidMetalBackdrop: 'src/components/LiquidMetalBackdrop.vue',
  footerSpringGlow: 'src/components/FooterSpringGlow.vue',
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
const canvasText = readUtf8(files.canvasText)
const liquidMetalBackdrop = readUtf8(files.liquidMetalBackdrop)
const packageJson = readUtf8(files.packageJson)
const app = readUtf8(files.app)
const footerSpringGlow = readUtf8(files.footerSpringGlow)

const garbledPattern = /[\uFFFD\u951F\u00C3\u00C2]/

for (const [label, content] of Object.entries({
  app,
  home,
  rail,
  preview,
  style,
  heroCube,
  canvasText,
  liquidMetalBackdrop,
  footerSpringGlow
})) {
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
  /import CanvasText from '\.\.\/components\/CanvasText\.vue'/,
  /const canvasAccentColors = \[/,
  /const canvasInverseColors = \[/,
  /<CanvasText[\s\S]*text="CODE SYSTEMS"/,
  /<CanvasText[\s\S]*text="SHIP"/,
  /class="marked canvas-title-accent"/,
  /class="canvas-title-inverse"/,
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
  /import FooterSpringGlow from '\.\/components\/FooterSpringGlow\.vue'/,
  /<footer class="footer">[\s\S]*<\/footer>\s*<FooterSpringGlow\s*\/>/,
  /<p class="footer-name">大笨钟 \/ DEV<\/p>/,
  /<a href="mailto:hello@example.com">Email<\/a>/,
  /<BackToTop\s*\/>/
]) {
  expectPattern(files.app, app, pattern)
}

for (const pattern of [
  /import LiquidMetalBackdrop from '\.\.\/components\/LiquidMetalBackdrop\.vue'/,
  /<LiquidMetalBackdrop[\s\S]*class="hero-liquid-backdrop"/,
  /\.hero-liquid-backdrop/,
  /isolation:\s*isolate/,
  /\.zel-hero\s*\{[^}]*z-index:\s*3/,
  /\.zel-hero::before[\s\S]*z-index:\s*1/,
  /\.hero-shell[\s\S]*z-index:\s*2/,
  /\.hero-cube\s*\{[^}]*right:\s*-22px/,
  /\.project-section\s*\{[^}]*overflow:\s*hidden/
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

for (const pattern of [
  /0,\s*153,\s*255/,
  /bg-blue-600/,
  /bg-blue-700/
]) {
  rejectPattern(files.home, home, pattern)
  rejectPattern(files.canvasText, canvasText, pattern)
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
  /MeshPhysicalMaterial/,
  /CanvasTexture/,
  /PlaneGeometry/,
  /ResizeObserver/,
  /prefers-reduced-motion: reduce/,
  /hero-metal-cube/,
  /webgl-fallback/,
  /is-unfolded/,
  /createBrushTexture/,
  /createReflectionTexture/,
  /TEXTURE_SIZE/,
  /texture\.repeat\.set\(1, 1\)/,
  /EquirectangularReflectionMapping/,
  /envMap:\s*reflectionTexture/,
  /diagonalGlint/,
  /edgeSheen/,
  /bumpMap:\s*brushTexture/,
  /bumpScale:\s*0\.035/,
  /anisotropy:\s*0\.82/,
  /roughness:\s*0\.2/,
  /clearcoat:\s*0\.28/,
  /metalness:\s*0\.86/,
  /unfoldedCameraZ/,
  /camera\.position\.z = THREE\.MathUtils\.lerp\(settings\.cameraZ, settings\.unfoldedCameraZ, unfoldProgress\)/,
  /triggerTouchUnfold/,
  /disposeThreeScene/
]) {
  expectPattern(files.heroCube, heroCube, pattern)
}

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

for (const pattern of [
  /defineProps/,
  /tailHeight: \{ type: String, default: '38vh' \}/,
  /mobileTailHeight: \{ type: String, default: '30vh' \}/,
  /const RUIXEN_STOPS = \[/,
  /const bellHeights = \(n, peak, valley\) =>/,
  /requestAnimationFrame/,
  /cancelAnimationFrame/,
  /addEventListener\('scroll'/,
  /removeEventListener\('scroll'/,
  /addEventListener\('resize'/,
  /removeEventListener\('resize'/,
  /prefers-reduced-motion/,
  /aria-hidden="true"/,
  /<svg\b/,
  /<linearGradient\b/,
  /<rect\b/,
  /v-for="(?:stop|\([a-zA-Z]+,\s*[a-zA-Z]+\)) in RUIXEN_STOPS"/,
  /footer-spring-glow__band/,
  /footer-spring-glow__floor/,
  /pointer-events:\s*none/,
  /@media \(prefers-reduced-motion: reduce\)/
]) {
  expectPattern(files.footerSpringGlow, footerSpringGlow, pattern)
}

expectPattern(files.packageJson, packageJson, /"three":/)
expectPattern(files.packageJson, packageJson, /@paper-design\/shaders":\s*"0\.0\.80"/)

for (const pattern of [
  /baseGradient\.addColorStop\(0\.62/,
  /baseGradient\.addColorStop\(1,\s*'#d9ddd6'\)/,
  /MeshStandardMaterial/,
  /roughness:\s*0\.36/
]) {
  rejectPattern(files.heroCube, heroCube, pattern)
}

if (failures.length) {
  console.error('Homepage structure verification failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('Homepage structure verification passed.')
