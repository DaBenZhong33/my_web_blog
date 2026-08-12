# 首页 Liquid Metal 背景设计

## 背景

用户希望把 21st.dev 上的 Liquid Metal Hero 效果用于当前个人作品站。附件提供的是 React 组件示例，要求 shadcn 项目结构、Tailwind CSS 和 TypeScript，并依赖 `@paper-design/shaders-react`、`framer-motion`、Radix Slot 和 class-variance-authority。

当前项目是 Vue 3 + Vite，入口在 `src/main.js`，首页在 `src/views/HomeView.vue`，全局样式在 `src/style.css`，组件目录是 `src/components/`。项目没有 shadcn、Tailwind、TypeScript 或 React。首页已经有暗色网格、噪点、荧光黄强调、Canvas 标题文字、Three.js 金属立方体、作品卡 3D 预览和翻页动效。

用户已确认方向 A：不整段替换首屏，只把 Liquid Metal 作为当前首页首屏的低透明背景增强。用户也已确认允许新增 `@paper-design/shaders` 这个 vanilla JS 依赖。

## 目标

- 在首页首屏增加 Liquid Metal 风格的低透明动态背景层。
- 保留现有首屏结构、文案、按钮、`HeroMetalCube` 和整体工业暗色视觉语言。
- 使用适合 Vue 项目的 vanilla JS shader API，不引入 React、shadcn、Tailwind 或 TypeScript。
- 保持背景层为装饰性视觉，不遮挡标题、按钮、立方体和 `大笨钟+` wordmark。
- 支持 `prefers-reduced-motion: reduce`、WebGL 初始化失败和移动端性能降级。
- 修改后保持 UTF-8 编码，并检查中文文本是否出现乱码。

## 非目标

- 不复制附件中的 `liquid-metal-hero.tsx`、`demo.tsx`、shadcn `Button`、`Badge` 或 `Card` 到项目里。
- 不创建 `/components/ui`。该路径是 React/shadcn 约定，不符合当前 Vue 项目结构。
- 不迁移到 Tailwind CSS、shadcn/ui 或 TypeScript。
- 不引入 `@paper-design/shaders-react`、`framer-motion`、`@radix-ui/react-slot` 或 `class-variance-authority`。
- 不改动首页信息架构、项目数据、关于页或项目详情页。
- 不把 Liquid Metal 做成主要交互入口，也不把首屏改成居中营销页。

## 项目结构决策

当前项目的默认组件路径是 `src/components/`，样式主要分为两类：

- 组件私有样式：Vue 单文件组件内的 `<style scoped>`。
- 全局变量和通用基础样式：`src/style.css`。

因此新增组件放在：

- `src/components/LiquidMetalBackdrop.vue`

首页接入点放在：

- `src/views/HomeView.vue`

必要的全局或降级样式优先写在组件 scoped CSS 中；只有确实需要复用变量或基础规则时才改 `src/style.css`。

不创建 `/components/ui` 的原因是：该路径用于 shadcn 生成 React UI primitive。当前 Vue 项目没有 `@/components/ui` alias、Tailwind token、React runtime 或 shadcn CLI 配置。为了一个背景效果引入这套结构会扩大维护面，并与现有代码组织不一致。

## 依赖选择

安装并固定：

- `@paper-design/shaders@0.0.80`

不安装：

- `@paper-design/shaders-react`
- `framer-motion`
- `@radix-ui/react-slot`
- `class-variance-authority`

原因：

- 官方仓库提供 vanilla JS 包 `@paper-design/shaders`，适合非 React 项目。
- React 包声明 `react` 和 `@types/react` peer dependency，不适合当前 Vue 项目。
- Liquid Metal 的 vanilla API 可通过 `ShaderMount` 和 `liquidMetalFragmentShader` 挂载到 DOM 容器。
- 现有首页已经有按钮、卡片和动效体系，不需要 shadcn 的 Button、Badge、Card。

## 组件设计

新增 `LiquidMetalBackdrop.vue`，只负责 shader 背景生命周期和降级，不负责首屏文案或按钮。

组件职责：

- 接收可选配置 props，例如 `reducedOnMobile`、`class` 或少量调参值；首版可不暴露复杂 API。
- 在 `onMounted` 中检查 `prefers-reduced-motion` 和 WebGL 支持。
- 通过 `ShaderMount` 把 `liquidMetalFragmentShader` 挂载到组件内部容器。
- 使用内置 shape 或全画布效果，不先使用 logo 图片蒙版，避免引入异步图片预处理流程。
- 保存 shader 实例，并在组件卸载时销毁或释放资源。
- 监听减少动画偏好变化，必要时停止动画并切换到静态 fallback。
- 监听容器尺寸变化，让 shader 填满首屏背景区域。

模板结构建议：

- 根节点 `.liquid-metal-backdrop`
- shader 挂载节点 `.liquid-metal-backdrop-canvas`
- fallback 视觉层 `.liquid-metal-backdrop-fallback`

`HomeView.vue` 中在 `section.zel-hero` 内、`.hero-shell` 之前挂载背景层：

- `<LiquidMetalBackdrop class="hero-liquid-backdrop" />`

`.hero-shell` 继续保持较高 `z-index`，确保文本、按钮和立方体在背景之上。

## 视觉设计

Liquid Metal 背景是次级氛围层，不抢主视觉：

- 颜色以黑、深灰、银灰、白色高光为主，少量混入荧光黄。
- 不使用大面积紫蓝、米色、棕橙等偏离当前站点的主色。
- 背景透明度控制在低强度范围，视觉上像首屏网格后的金属反光。
- 右侧可以略亮，呼应 `HeroMetalCube`；左侧标题区域保持足够暗，保证中文和英文标题可读。
- 继续叠加现有噪点纹理和网格线，保持项目已有风格。
- 不添加圆形光球、漂浮卡片或额外说明文字。

建议初始 shader 参数：

- `u_isImage: false`
- `u_shape: LiquidMetalShapes.none` 或 `LiquidMetalShapes.metaballs`
- `u_colorBack`: 接近 `#050505`
- `u_colorTint`: 接近银灰或弱荧光黄
- `u_repetition`: 中低密度
- `u_softness`: 中等偏高
- `u_distortion`: 低到中等
- `u_contour`: 低到中等
- `u_shiftRed` 和 `u_shiftBlue`: 低强度
- `u_angle`: 与首屏斜向金属感一致

具体数值在实现中以可读性和性能为准微调。

## 响应式与性能

桌面端：

- 背景覆盖整个 `#intro`。
- 保持动画，但像素预算低于主视觉立方体，避免双 WebGL 造成过高开销。
- 背景层 `pointer-events: none`，不影响按钮和立方体交互。

平板和手机端：

- 优先降低像素比或最大像素数量。
- 如果低端设备渲染压力明显，可以只展示静态 fallback。
- 背景不得推高首屏高度，也不得造成文字与立方体重叠。

减少动画偏好：

- 不启动持续动画。
- 展示静态 CSS fallback 或 shader 静止帧。
- 保留页面内容和布局完整。

WebGL 失败：

- 显示 CSS fallback：用多层线性渐变和径向渐变模拟金属反光。
- 不让首屏出现空白或报错。

## 可访问性

- 组件标记为装饰性视觉，使用 `aria-hidden="true"`。
- 不把任何关键内容放进 shader canvas。
- 背景层不接收焦点，不响应指针事件。
- 文本对比度优先于金属效果强度。

## 测试与验证

实现完成后运行：

- `npm install @paper-design/shaders@0.0.80`
- `npm run verify:homepage`
- `npm run build`
- 使用 UTF-8 读取修改过的 Vue、CSS、JS 和 JSON 文件
- 搜索常见乱码标记，确认没有中文编码问题

浏览器检查：

- 桌面首屏有 Liquid Metal 背景，但标题和按钮仍清晰。
- `HeroMetalCube` 仍正常显示、自转和展开。
- 背景不捕获点击，不影响“查看作品”和“了解我”按钮。
- 手机尺寸下首屏不横向溢出，文字、按钮、立方体和 wordmark 不重叠。
- 减少动画偏好下页面仍可用，背景不过度运动。
- WebGL 失败时 fallback 可见。

验证脚本可按需增加轻量检查：

- `HomeView.vue` 引入并渲染 `LiquidMetalBackdrop`。
- `LiquidMetalBackdrop.vue` 包含 `prefers-reduced-motion`、fallback 和资源清理标记。
- `package.json` 包含 `@paper-design/shaders`。

## 实施顺序

1. 安装 `@paper-design/shaders@0.0.80` 并更新 lockfile。
2. 新增 `LiquidMetalBackdrop.vue`，先实现静态挂载、fallback 和卸载清理。
3. 接入 `HomeView.vue`，把背景放在 `#intro` 内且不改变现有首屏布局。
4. 调整 scoped CSS，保证层级、透明度、响应式和减少动画偏好正确。
5. 如有必要，扩展 `scripts/verify-homepage-structure.mjs`。
6. 运行验证命令、构建、UTF-8 读取和乱码扫描。
7. 使用浏览器检查桌面和移动端首屏。

## 自检

- 设计已按用户选择的 A 方案收敛：局部背景增强，而非整段替换。
- 设计明确避开 React/shadcn/Tailwind/TypeScript 迁移。
- 新增依赖选择与当前 Vue 项目匹配。
- 范围聚焦首页首屏，没有扩大到其它页面。
- 包含性能、移动端、减少动画偏好、WebGL 失败和可访问性处理。
- 没有未定需求、占位符或互相矛盾的章节。

