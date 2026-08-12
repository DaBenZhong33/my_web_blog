# Personal Blog Logo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 生成并保存“大笨钟 / DEV”个人博客的 `DBZ` 折叠立方 Logo 资产。

**Architecture:** 使用 OpenAI 兼容的中转 Images API 生成方形主 Logo，再用本地 Pillow 把主标和准确中文文字合成为横版锁定图。生成逻辑只读取本地环境变量，不写入前端代码，不把密钥保存到仓库。中转上游在 `quality: 'auto'` 下出现过 `502 upstream_error`，生成步骤使用 `quality: 'low'` 降低超时概率。

**Tech Stack:** Windows PowerShell、Node.js `fetch`、OpenAI-compatible Images API、Python Pillow、Windows 字体文件、Vue/Vite 静态资源目录。

---

## 文件结构

- 创建目录：`public/brand/`
  - 存放最终 Logo PNG 资产。
- 创建：`public/brand/dbz-logo.png`
  - 方形主 Logo，图形主体为折叠金属立方体和 `DBZ`。
- 创建：`public/brand/dbz-logo-lockup.png`
  - 横版锁定组合，左侧使用主 Logo，右侧用本地渲染的 `大笨钟 / DEV` 保证中文准确。
- 不修改：`src/App.vue`
  - 本轮只生成资产，不替换导航 Logo。
- 不修改：`public/favicon.svg`
  - favicon 替换需要用户后续单独确认。

## 任务 1：环境和输出目录预检

**Files:**
- Create directory: `public/brand/`

- [ ] **Step 1: 检查环境变量和创建输出目录**

Run:

```powershell
New-Item -ItemType Directory -Force -Path 'public\brand' | Out-Null
if (-not $env:OPENAI_API_KEY) { $env:OPENAI_API_KEY = [Environment]::GetEnvironmentVariable('OPENAI_API_KEY', 'User') }
if (-not $env:OPENAI_BASE_URL) { $env:OPENAI_BASE_URL = [Environment]::GetEnvironmentVariable('OPENAI_BASE_URL', 'User') }
if (-not $env:OPENAI_IMAGE_MODEL) { $env:OPENAI_IMAGE_MODEL = [Environment]::GetEnvironmentVariable('OPENAI_IMAGE_MODEL', 'User') }
if (-not $env:OPENAI_API_KEY) { throw 'OPENAI_API_KEY is not set' }
if (-not $env:OPENAI_BASE_URL) { throw 'OPENAI_BASE_URL is not set' }
$model = if ($env:OPENAI_IMAGE_MODEL) { $env:OPENAI_IMAGE_MODEL } else { 'gpt-image-2' }
"OPENAI_API_KEY=set; OPENAI_BASE_URL=set; OPENAI_IMAGE_MODEL=$model"
```

Expected: 输出只显示变量已设置和模型名，不显示 API key 内容。

- [ ] **Step 2: 检查工作区没有无关改动**

Run:

```powershell
git status --short
```

Expected: 没有和 Logo 生成无关的未提交源码改动。若已有用户改动，记录但不还原。

## 任务 2：生成方形 `DBZ` 折叠立方主 Logo

**Files:**
- Create: `public/brand/dbz-logo.png`

- [ ] **Step 1: 调用中转 Images API 生成主 Logo**

Run:

```powershell
@'
import { mkdir, writeFile } from 'node:fs/promises'

const apiKey = process.env.OPENAI_API_KEY
const baseURL = (process.env.OPENAI_BASE_URL || '').replace(/\/+$/, '')
const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2'

if (!apiKey) throw new Error('OPENAI_API_KEY is not set')
if (!baseURL) throw new Error('OPENAI_BASE_URL is not set')

const prompt = `
Use case: logo-brand
Asset type: personal developer blog logo
Primary request: a vector-friendly raster logo mark for "DBZ", built from a folded/exploded cube
Subject: a hard-edged folded metallic cube mark with the letters "DBZ" clearly centered on the main face
Style/medium: polished modern logo, brushed silver metal, sharp geometric planes, high contrast, no photorealistic scene
Composition/framing: centered square icon, generous padding, readable at small sizes
Color palette: black, graphite, brushed silver, one neon yellow #d7ff00 accent face
Text (verbatim): "DBZ"
Constraints: crisp edges, no rounded card container, no decorative orbs, no extra icons, no watermark
Avoid: misspelled text, complex background, tiny unreadable details, gradients that dominate the mark
`

const response = await fetch(`${baseURL}/images/generations`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model,
    prompt,
    size: '1024x1024',
    quality: 'low'
  })
})

const responseText = await response.text()
if (!response.ok) {
  throw new Error(`Image API failed with HTTP ${response.status}: ${responseText.slice(0, 1200)}`)
}

const json = JSON.parse(responseText)
const item = json.data?.[0]
let bytes

if (item?.b64_json) {
  bytes = Buffer.from(item.b64_json, 'base64')
} else if (item?.url) {
  const imageResponse = await fetch(item.url)
  if (!imageResponse.ok) {
    throw new Error(`Image download failed with HTTP ${imageResponse.status}`)
  }
  bytes = Buffer.from(await imageResponse.arrayBuffer())
} else {
  throw new Error(`Image API response did not include data[0].b64_json or data[0].url: ${responseText.slice(0, 1200)}`)
}

await mkdir('public/brand', { recursive: true })
await writeFile('public/brand/dbz-logo.png', bytes)
console.log(`saved public/brand/dbz-logo.png (${bytes.length} bytes)`)
'@ | node --input-type=module
```

Expected: 生成 `public/brand/dbz-logo.png`，终端输出 `saved public/brand/dbz-logo.png (...)`。部分中转服务可能返回非请求尺寸的方图，继续执行归一化步骤。

If the first attempt returns `502 upstream_error`, verify `/models` is reachable and retry once with the same `quality: 'low'` request. If it still fails, stop and report the relay/upstream issue instead of changing multiple variables at once.

- [ ] **Step 2: 如果模型不支持默认模型名，停止并向用户确认精确模型名**

Run only if Step 1 returns a model-not-found or unsupported-model error:

```powershell
throw 'The image model is not supported by OPENAI_BASE_URL. Ask the user for the exact image model name exposed by the relay provider, then set OPENAI_IMAGE_MODEL before rerunning Task 2 Step 1.'
```

Expected: 本轮停止，不猜测模型名，不继续生成错误资产。

- [ ] **Step 3: 将主 Logo 归一化为 1024x1024**

Run after Step 1 succeeds:

```powershell
@'
from pathlib import Path
from PIL import Image

logo_path = Path('public/brand/dbz-logo.png')
image = Image.open(logo_path).convert('RGBA')
if image.size != (1024, 1024):
    image = image.resize((1024, 1024), Image.Resampling.LANCZOS)
    image.save(logo_path)
print(f'normalized {logo_path.as_posix()} to {Image.open(logo_path).size[0]}x{Image.open(logo_path).size[1]}')
'@ | & 'C:\Users\yanfa\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -
```

Expected: 输出 `normalized public/brand/dbz-logo.png to 1024x1024`。

## 任务 3：主 Logo 视觉检查和必要重试

**Files:**
- Verify: `public/brand/dbz-logo.png`

- [ ] **Step 1: 打开图片人工检查**

Use local image viewer tool on:

```text
public/brand/dbz-logo.png
```

Expected:

- 主体是折叠或展开的立方体。
- `DBZ` 拼写正确且清楚。
- 颜色包含黑灰、银色金属和荧光黄。
- 没有水印、额外文字、圆角徽章或复杂背景。

- [ ] **Step 2: 如果 `DBZ` 拼错或不可读，使用严格文字提示重试一次**

Run only if Step 1 fails because of text accuracy:

```powershell
@'
import { mkdir, writeFile } from 'node:fs/promises'

const apiKey = process.env.OPENAI_API_KEY
const baseURL = (process.env.OPENAI_BASE_URL || '').replace(/\/+$/, '')
const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2'

if (!apiKey) throw new Error('OPENAI_API_KEY is not set')
if (!baseURL) throw new Error('OPENAI_BASE_URL is not set')

const prompt = `
Create a clean square logo mark.
The only visible text must be exactly three uppercase Latin letters: "DBZ".
Spell the letters D, B, Z exactly, left to right, with no other words.
Place "DBZ" large and centered on the front neon yellow face of a folded metallic cube.
Use brushed silver metal cube panels, black graphite contrast, sharp geometric edges, and generous padding.
No watermark, no extra letters, no Chinese text, no slogan, no rounded badge, no busy background.
`

const response = await fetch(`${baseURL}/images/generations`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model,
    prompt,
    size: '1024x1024',
    quality: 'low'
  })
})

const responseText = await response.text()
if (!response.ok) {
  throw new Error(`Image API failed with HTTP ${response.status}: ${responseText.slice(0, 1200)}`)
}

const json = JSON.parse(responseText)
const item = json.data?.[0]
let bytes

if (item?.b64_json) {
  bytes = Buffer.from(item.b64_json, 'base64')
} else if (item?.url) {
  const imageResponse = await fetch(item.url)
  if (!imageResponse.ok) {
    throw new Error(`Image download failed with HTTP ${imageResponse.status}`)
  }
  bytes = Buffer.from(await imageResponse.arrayBuffer())
} else {
  throw new Error(`Image API response did not include data[0].b64_json or data[0].url: ${responseText.slice(0, 1200)}`)
}

await mkdir('public/brand', { recursive: true })
await writeFile('public/brand/dbz-logo.png', bytes)
console.log(`saved public/brand/dbz-logo.png (${bytes.length} bytes)`)
'@ | node --input-type=module
```

Expected: 新生成的 `public/brand/dbz-logo.png` 中 `DBZ` 拼写正确且清楚。

## 任务 4：本地合成横版中文锁定图

**Files:**
- Read: `public/brand/dbz-logo.png`
- Create: `public/brand/dbz-logo-lockup.png`

- [ ] **Step 1: 用 Pillow 合成横版 PNG**

Run:

```powershell
@'
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

width, height = 1200, 360
logo_size = 240
brand_path = Path('public/brand/dbz-logo.png')
output_path = Path('public/brand/dbz-logo-lockup.png')
font_cn_path = Path(r'C:\Windows\Fonts\msyhbd.ttc')
font_en_path = Path(r'C:\Windows\Fonts\ariblk.ttf')
brand_text = '\u5927\u7b28\u949f'

if not brand_path.exists():
    raise FileNotFoundError(brand_path)
if not font_cn_path.exists():
    raise FileNotFoundError(font_cn_path)
if not font_en_path.exists():
    raise FileNotFoundError(font_en_path)

canvas = Image.new('RGBA', (width, height), (0, 0, 0, 0))
logo = Image.open(brand_path).convert('RGBA').resize((logo_size, logo_size), Image.Resampling.LANCZOS)
canvas.alpha_composite(logo, (72, 60))

draw = ImageDraw.Draw(canvas)
accent = (215, 255, 0, 255)
ink = (245, 245, 242, 255)

draw.rectangle((374, 122, 382, 238), fill=accent)

brand_font = ImageFont.truetype(str(font_cn_path), 74)
sub_font = ImageFont.truetype(str(font_en_path), 28)

draw.text((414, 102), brand_text, font=brand_font, fill=ink)

sub_text = 'INDEPENDENT DEV / DBZ'
x, y = 418, 206
tracking = 4
for char in sub_text:
    draw.text((x, y), char, font=sub_font, fill=accent)
    x += draw.textlength(char, font=sub_font) + tracking

output_path.parent.mkdir(parents=True, exist_ok=True)
canvas.save(output_path)
print(f'saved {output_path.as_posix()} ({width}x{height})')
'@ | & 'C:\Users\yanfa\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -
```

Expected: 生成 `public/brand/dbz-logo-lockup.png`，中文由 Windows 字体文件渲染，文字为“大笨钟”且英文副标为 `INDEPENDENT DEV / DBZ`。可执行脚本使用 Unicode 转义写入中文，避免 PowerShell 管道编码把中文变成 `???`。

- [ ] **Step 2: 打开横版图片人工检查**

Use local image viewer tool on:

```text
public/brand/dbz-logo-lockup.png
```

Expected:

- 左侧图形来自 `dbz-logo.png`。
- 右侧中文显示为“大笨钟”，没有错字或乱码。
- 横版构图留白均衡，适合当前黑底站点。

## 任务 5：文件、编码和构建验证

**Files:**
- Verify: `public/brand/dbz-logo.png`
- Verify: `public/brand/dbz-logo-lockup.png`
- Verify: `docs/superpowers/specs/2026-08-12-personal-blog-logo-design.md`
- Verify: `docs/superpowers/plans/2026-08-12-personal-blog-logo.md`

- [ ] **Step 1: 检查 PNG 尺寸和格式**

Run:

```powershell
$env:NODE_PATH='C:\Users\yanfa\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
@'
const sharp = require('sharp')

async function inspect(file) {
  const meta = await sharp(file).metadata()
  console.log(`${file}: ${meta.format} ${meta.width}x${meta.height}`)
  if (meta.format !== 'png') throw new Error(`${file} is not png`)
  if (!meta.width || !meta.height) throw new Error(`${file} has invalid dimensions`)
}

Promise.all([
  inspect('public/brand/dbz-logo.png'),
  inspect('public/brand/dbz-logo-lockup.png')
]).catch((error) => {
  console.error(error)
  process.exit(1)
})
'@ | node
```

Expected:

```text
public/brand/dbz-logo.png: png 1024x1024
public/brand/dbz-logo-lockup.png: png 1200x360
```

- [ ] **Step 2: UTF-8 读取中文文档并检查替换字符**

Run:

```powershell
Get-Content -LiteralPath 'docs\superpowers\specs\2026-08-12-personal-blog-logo-design.md' -Encoding UTF8 | Select-String -Pattern '大笨钟|DBZ|折叠立方'
Get-Content -LiteralPath 'docs\superpowers\plans\2026-08-12-personal-blog-logo.md' -Encoding UTF8 | Select-String -Pattern '大笨钟|DBZ|折叠立方'
Get-Content -LiteralPath 'docs\superpowers\specs\2026-08-12-personal-blog-logo-design.md' -Encoding UTF8 | Select-String -Pattern ([char]0xfffd)
Get-Content -LiteralPath 'docs\superpowers\plans\2026-08-12-personal-blog-logo.md' -Encoding UTF8 | Select-String -Pattern ([char]0xfffd)
Get-ChildItem -Path 'src' -Recurse -File | Select-String -Pattern ([char]0xfffd)
```

Expected: 前两条能显示正确中文；后三条没有输出。

- [ ] **Step 3: 运行项目构建**

Run:

```powershell
npm run build
```

Expected: Vite 构建成功，`dist/` 正常生成。

## 任务 6：提交生成资产

**Files:**
- Add: `public/brand/dbz-logo.png`
- Add: `public/brand/dbz-logo-lockup.png`
- Add: `docs/superpowers/plans/2026-08-12-personal-blog-logo.md`

- [ ] **Step 1: 查看待提交文件**

Run:

```powershell
git status --short
```

Expected: 至少包含计划文档和两个 Logo PNG。若只有这些文件变化，继续提交；若还有用户无关改动，不加入提交。

- [ ] **Step 2: 提交计划和资产**

Run:

```powershell
git add -- 'docs/superpowers/plans/2026-08-12-personal-blog-logo.md' 'public/brand/dbz-logo.png' 'public/brand/dbz-logo-lockup.png'
git commit -m "feat: add personal blog logo assets"
```

Expected: 创建一次提交，包含实施计划和 Logo 资产。

## 后续可选接入

本计划完成后只生成 Logo 文件，不改导航或 favicon。若用户确认接入，另开一个小任务：

- 修改 `src/App.vue`，把 `.logo-mark` 文本方块换成 `public/brand/dbz-logo.png`。
- 必要时新增 CSS，保证导航和页脚的小尺寸不变形。
- 用户确认后再处理 `public/favicon.svg`。

## 自检

- 计划覆盖了环境预检、主图生成、横版合成、人工视觉检查、PNG 元数据检查、UTF-8 检查、构建和提交。
- API key 只从环境变量读取，不写入文件或输出到终端。
- 横版中文由 Pillow 加载 Windows 字体文件渲染，降低模型中文错字和终端编码风险。
- 未包含未定项或要求后续补充的代码块。
