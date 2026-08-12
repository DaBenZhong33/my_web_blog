# Canvas Text 重点词动效设计

## 背景

用户提供的参考效果是 `CanvasText`：在短词上生成横向线段残影，让文字像被快速刷出。当前项目是 Vue 3 + Vite，首页已经是黑底网格、噪点、荧光黄和硬边工业风格，不适合直接迁移 React/Tailwind 示例，也不适合继续使用示例中的蓝色。

本次采用用户确认的 A+C 方案：把效果放在首页首屏 `CODE SYSTEMS` 和底部 CTA 的 `SHIP` 两个短关键词上。

## 目标

- 在首页两个重点词上加入接近参考图的线段残影文字效果。
- 颜色完全跟随当前网页主色，不保留示例蓝色。
- 保持现有页面结构、排版层级、硬边风格和响应式表现。
- 不引入 React、Tailwind、shadcn 或其他新依赖。
- 支持 `prefers-reduced-motion: reduce` 降级为静态文字。

## 非目标

- 不把效果铺到所有标题或正文。
- 不重做首页布局、CTA 布局或 3D 方块。
- 不新增全局视觉主题或动画库。
- 不修改关于页、项目详情页或项目数据。

## 范围

预计修改：

- `src/components/CanvasText.vue`
- `src/views/HomeView.vue`
- `scripts/verify-homepage-structure.mjs`

如实现需要，可在 `src/style.css` 里加入极少量全局辅助规则，但优先把样式放在组件 scoped CSS 内。

## 交互与视觉设计

### 首屏 `CODE SYSTEMS`

`CODE SYSTEMS` 替换为 `CanvasText` 组件，继续作为首屏主标题最后一行。背景是黑色页面，文字和残影线使用荧光黄：

- 主色：`rgba(215, 255, 0, 1)`
- 残影层级：`0.9`、`0.78`、`0.6`、`0.42`、`0.24`、`0.12`
- 发光只保持轻微外扩，避免和 3D 方块抢视觉焦点。

### CTA `SHIP`

底部 CTA 标题改为三段：

- `IT'S TIME TO`
- `SHIP`
- `YOUR SMALL PRODUCT.`

只在 `SHIP` 上应用 `CanvasText`。因为 CTA 背景是荧光黄，动效反向使用黑色残影：

- 主色：`rgba(5, 5, 5, 1)`
- 残影层级：`0.86`、`0.68`、`0.5`、`0.32`、`0.18`、`0.1`

### 动效行为

- 线段残影持续轻微横向刷动，类似参考截图。
- 动画速度保持低干扰，不做高频 glitch。
- `prefers-reduced-motion: reduce` 下关闭动画和残影位移，只显示最终文字。

## 组件设计

新增 `CanvasText.vue`，只负责渲染一个短文本的效果。

组件 props：

- `text: string`
- `colors?: string[]`
- `lineGap?: number`
- `animationDuration?: number`
- `backgroundClassName?: string`

保留这些 prop 名称，是为了和用户提供的示例语义对齐，但在 Vue 版本中不引入 Tailwind class 依赖。`backgroundClassName` 只作为可选 class 透传，当前首页优先用 CSS 变量控制颜色。

组件输出：

- 外层 `span.canvas-text`
- 可读文本作为真实文本内容
- 装饰线段使用 `aria-hidden="true"` 的内部元素或伪元素
- 外层带 `aria-label`，避免装饰层重复朗读

## 数据流

`HomeView.vue` 引入 `CanvasText`，并在模板里传入两个颜色数组：

- `canvasAccentColors`
- `canvasInverseColors`

颜色数组放在 `<script setup>` 中，避免在模板中堆长数组。

`CanvasText.vue` 把颜色写入 CSS 自定义属性，例如 `--canvas-color-1` 到 `--canvas-color-10`，样式负责生成多条横线和残影层。

## 可访问性与响应式

- `CanvasText` 必须保持真实文本可复制、可搜索。
- 装饰层使用 `aria-hidden="true"`。
- 小屏下跟随父标题字号，不额外设置固定宽度。
- 如果关键词太长，允许换行，不挤压页面宽度。
- 减少动画偏好开启时不播放动画。

## 边界与错误处理

- `text` 为空时渲染空字符串，不抛错。
- 颜色数组少于需要数量时回退到 `currentColor` 或最后一个可用颜色。
- 不依赖 Canvas API 成功绘制；即使 CSS 装饰失效，文本仍正常显示。
- 中文和英文混排保持 UTF-8，修改后扫描乱码标记。

## 测试与验证

实施时更新 `scripts/verify-homepage-structure.mjs`，检查：

- `HomeView.vue` 引入 `CanvasText`
- 首屏 `CODE SYSTEMS` 使用 `CanvasText`
- CTA `SHIP` 使用 `CanvasText`
- `CanvasText.vue` 包含减少动画偏好规则
- 颜色不包含示例蓝色 `0, 153, 255`

完成后运行：

- `npm run verify:homepage`
- `npm run build`
- UTF-8 读取修改过的 `.vue`、`.css`、`.mjs` 文件
- 搜索常见乱码标记，确认没有误编码文本

## 自检

- 范围只覆盖用户确认的 A+C。
- 未引入新依赖。
- 未使用示例蓝色。
- 保留当前 Vue 3 项目结构。
- 动效有减少动画偏好降级。
