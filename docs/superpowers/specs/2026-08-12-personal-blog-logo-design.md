# 个人博客 Logo 设计

## 背景

当前项目是 Vue 3 + Vite 个人作品集/博客站点，品牌名为“大笨钟 / DEV”。站点首屏使用黑色背景、网格纹理、硬边框、荧光黄 `#d7ff00` 和 Three.js 拉丝金属立方体。导航和页脚当前使用一个简单的荧光黄方块，内部文字为“钟”；`public/favicon.svg` 也是同一方向的简化标记。

用户希望为这个项目生成个人博客网站 Logo，并已确认通过本地环境变量配置中转生图模型。浏览器视觉草图中，用户选择了 C「折叠立方」方向，并确认 Logo 主体文字使用 `DBZ`。

## 已确认方向

- 主方向：折叠/展开立方体图形，呼应首页 Three.js 金属立方体。
- 主体文字：`DBZ`。
- 品牌锁定组合：图形标记 + `大笨钟 / DEV`。
- 视觉气质：独立开发者、技术产品、金属、硬朗、克制。
- 主色：黑灰、银色金属、荧光黄 `#d7ff00`。

## 目标

- 生成一个适合个人博客/作品集使用的主 Logo 位图资产。
- 生成一个横版锁定组合，方便后续用于导航、页脚、README 或社交封面。
- 输出资产放入项目目录，不能只留在临时目录或模型默认输出目录。
- 生成过程不把 API key 写入项目文件，也不暴露密钥内容。
- 修改或生成包含中文的文本文件后，以 UTF-8 读取检查，避免乱码。

## 非目标

- 不重做首页视觉系统。
- 不重写导航、页脚或其它 Vue 组件，除非用户在生成后明确要求接入。
- 不把位图 Logo 强行当成可无限缩放的矢量文件使用。
- 不在前端代码中保存中转 API key。
- 不替换 `favicon.svg`，除非用户后续确认使用新 Logo 方向替换。

## 输出文件

计划生成并保存：

- `public/brand/dbz-logo.png`：方形主 Logo，适合头像、站点图标和项目展示。
- `public/brand/dbz-logo-lockup.png`：横版组合，图形标记 + `大笨钟 / DEV`。

如需要保留多个候选版本，可以先保存为：

- `public/brand/dbz-logo-v1.png`
- `public/brand/dbz-logo-lockup-v1.png`

最终确认后再决定是否复制为稳定文件名。

## 图形设计

主图形是一个折叠或半展开的金属立方体。立方体由多个硬边平面组成，部分面片呈银灰拉丝金属质感，至少一个主视觉面使用荧光黄。`DBZ` 放在图形中最清楚的平面上，作为核心识别，不额外加入复杂图案。

图形应保持方形构图，边缘留出足够安全边距，避免在小尺寸下裁切。整体不使用圆角卡片、渐变球、装饰光斑或过度复杂的背景。

## 横版组合设计

横版组合左侧为折叠立方体图形，右侧为文字 `大笨钟 / DEV`。文字风格应匹配当前站点的粗体、硬朗、技术化排版。背景优先使用透明或深色可抠底版本，便于放到当前黑底导航或页脚。

模型生成中文文字可能不稳定，因此横版组合可采用两步方式：

1. 先生成干净的图形主标。
2. 若中文文字渲染不准确，则用本地代码或设计后处理叠加 `大笨钟 / DEV`，保证文本正确。

## 生成策略

用户已配置中转 API 环境变量，因此生成阶段使用本地环境变量读取 `OPENAI_API_KEY` 和 `OPENAI_BASE_URL`。调用前只检查变量是否存在，不输出密钥内容。

如果模型支持透明背景并且效果可靠，直接生成 PNG。若透明背景不可用或边缘不稳定，则先生成纯色背景版本，再本地处理成透明背景或保存深色背景版本。最终资产必须位于 `public/brand/`。

主 Logo 提示词方向：

```text
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
```

横版组合提示词方向：

```text
Use case: logo-brand
Asset type: horizontal brand lockup for a personal developer blog
Primary request: a horizontal logo lockup with a folded metallic cube DBZ mark on the left and the text "大笨钟 / DEV" on the right
Subject: folded metallic cube mark with "DBZ", paired with clean bold typography
Style/medium: modern technical portfolio branding, sharp edges, high contrast
Composition/framing: wide horizontal lockup, mark left, wordmark right, balanced spacing
Color palette: black, graphite, brushed silver, neon yellow #d7ff00 accent
Text (verbatim): "大笨钟 / DEV"
Constraints: text must be exact and legible, no extra slogan, no watermark
Avoid: misspelled Chinese text, rounded badges, busy backgrounds, decorative orbs
```

## 验证

- 检查生成图片主体是否清晰、`DBZ` 是否拼写正确。
- 横版组合若包含中文，必须确认 `大笨钟 / DEV` 没有错字或乱码。
- 确认图片文件保存到 `public/brand/`。
- 以 UTF-8 读取新增/修改的 Markdown 或代码文件。
- 搜索 Unicode replacement character，确认没有编码损坏。

## 后续接入

生成资产后可由用户选择是否接入站点。若接入，优先小范围修改：

- 导航和页脚可继续保留文字 `大笨钟 / DEV`，只替换 `.logo-mark` 为图片标记。
- `public/favicon.svg` 可在用户确认后替换或新增 PNG favicon。
- 不把 API 调用逻辑加入前端项目。

## 自检

- 设计范围聚焦在 Logo 生成和资产保存，没有扩大到首页重构。
- 用户已确认 C「折叠立方」方向和 `DBZ` 主体文字。
- 输出文件、生成策略、透明背景处理和文本风险都已明确。
- 没有未定项、占位符或与项目视觉系统冲突的要求。
