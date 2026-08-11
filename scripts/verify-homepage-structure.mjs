import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()

const files = {
  home: 'src/views/HomeView.vue',
  rail: 'src/components/SectionRail.vue',
  terminal: 'src/components/StatusTerminal.vue',
  preview: 'src/components/ProjectPreviewCard.vue'
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

const home = readUtf8(files.home)
const rail = readUtf8(files.rail)
const terminal = readUtf8(files.terminal)
const preview = readUtf8(files.preview)

const garbledPattern = /[\uFFFD\u951F\u00C3\u00C2]/

for (const [label, content] of Object.entries({ home, rail, terminal, preview })) {
  if (garbledPattern.test(content)) failures.push(`${label} contains garbled text marker`)
}

for (const id of ['intro', 'build', 'story', 'work', 'process', 'contact']) {
  expectPattern(files.home, home, new RegExp(`id="${id}"`))
}

for (const pattern of [
  /import SectionRail from/,
  /import StatusTerminal from/,
  /import ProjectPreviewCard from/,
  /const sections = \[/,
  /const statusItems = \[/,
  /activeSection = ref/,
  /scrollProgress = ref/,
  /IntersectionObserver/,
  /requestAnimationFrame/,
  /<SectionRail[\s\S]*@navigate="navigateToSection"/,
  /<StatusTerminal\s+:items="statusItems"/,
  /<ProjectPreviewCard/
]) {
  expectPattern(files.home, home, pattern)
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
  /activeIndex = ref\(0\)/,
  /activeItem = computed/,
  /items: \{ type: Array, required: true \}/,
  /@click="activeIndex = index"/,
  /terminal-scan/,
  /prefers-reduced-motion/
]) {
  expectPattern(files.terminal, terminal, pattern)
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

if (failures.length) {
  console.error('Homepage structure verification failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('Homepage structure verification passed.')
