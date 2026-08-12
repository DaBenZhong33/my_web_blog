# 首页微动效增强设计

## 背景

首页已经形成清晰的黑底网格、噪点、荧光黄、硬边框和工业感作品集风格。当前也已经具备状态终端、跑马灯、作品卡预览、磁吸按钮和 3D 倾斜等基础交互。

这次改版采用用户确认的方案 A：只做首页微增强，不改项目详情页，不新增依赖，不引入 React、Tailwind 或完整 UI 组件库。重点借鉴 Magic UI、Aceternity UI、React Bits 和 Uiverse 的动效思路，用 Vue 3 和原生 CSS 在现有视觉语言上加细节。

## 目标

- 强化首页第一屏和作品卡的可感知动效。
- 保持当前硬核、工业、直角、荧光黄的视觉气质。
- 不改变主要信息架构，不扩大到项目详情页。
- 不引入新运行时依赖。
- 所有新增动效都支持 `prefers-reduced-motion: reduce` 降级。

## 非目标

- 不迁移到 Tailwind、shadcn/ui、Element Plus、Naive UI 或其他组件库。
- 不重做首页布局、导航结构、项目详情页或关于页。
- 不添加全局粒子、极光、星空、流体渐变、globe 等偏离当前风格的大背景。
- 不把动效做成长期闪烁或高频干扰的特效展示页。

## 范围

本次只修改以下首页相关文件：

- `src/views/HomeView.vue`
- `src/components/StatusTerminal.vue`
- `src/components/ProjectPreviewCard.vue`
- `src/style.css`
- `scripts/verify-homepage-structure.mjs`

如果实现中确实需要小幅调整验证脚本，只增加对新结构标记和乱码的检查，不引入测试框架。

## 交互设计

### 数字滚动

借鉴 Magic UI 的 `Number Ticker`，但不引入组件库。

- 状态终端中的数字片段滚动进入最终值，例如 `03 PRODUCTS` 中的 `03`。
- 指标卡中的数字值也使用同一类轻量滚动，例如 `03`、`100%`、`4+`。
- 非数字内容保持静态展示，例如 `LOCAL-FIRST`、`Vue 3 / SwiftUI / Flutter / Kotlin` 只在数字片段上增强。
- 动画只在元素进入或渲染后短暂执行，不循环。
- 减少动画偏好开启时直接显示最终值。

### 作品卡 Spotlight

借鉴 Aceternity UI 的 `Card Spotlight`、`Comet Card` 和 `Glowing Effect` 思路，叠加在现有 `ProjectPreviewCard.vue` 上。

- 鼠标进入作品卡后，卡片内部出现跟随指针的荧光聚光。
- hover、focus-within 或预览展开时增加边框发光和局部扫描线。
- 现有背景图缩放、预览面板、手机 mockup 和 `v-tilt` 保留。
- 移动端继续通过“预览”按钮展开，不依赖 hover。
- 聚光效果只是视觉增强，不承载唯一信息。

### 按钮流光边框

借鉴 Uiverse 的 CSS hover 小特效，增强现有 `.btn`。

- 保留直角、角标和当前尺寸。
- hover/focus 时边框出现一次横向流光。
- 主按钮和幽灵按钮都使用同一套机制，颜色随当前按钮语义变化。
- 不改变布局，不增加按钮文本。

### 首屏 Glitch Reveal

借鉴 React Bits 的 `Glitch Text`，只用于首屏标题中的 `CODE SYSTEMS`。

- 页面加载后短暂出现一次轻微错位和扫描感。
- 不做无限循环 glitch。
- 不影响中文品牌名和主要可读性。
- 减少动画偏好开启时禁用。

### 跑马灯质感

保留现有 `.signal-strip` 和 `.signal-track` 结构。

- 增强边缘遮罩和薄扫描线质感。
- 保持当前文案和速度，不加入新的依赖或滚动逻辑。
- 减少动画偏好开启时停止移动。

## 组件与数据流

`HomeView.vue` 仍负责首页数据和布局编排。指标卡数据保持在 `metrics` 数组里，可为数值展示增加轻量 class 或结构标记。

`StatusTerminal.vue` 仍只接收 `items`。组件内部负责把 `item.value` 拆成普通文本片段和数字片段，并在数字片段上应用一次性 ticker 动画。

`ProjectPreviewCard.vue` 继续接收 `project`、`image` 和 `assetBase`。组件内部新增指针坐标状态，写入 CSS 变量 `--spotlight-x` 和 `--spotlight-y`，由 CSS 负责渲染聚光和边框效果。鼠标离开时重置状态。

`src/style.css` 只放全局按钮、标题和减少动画偏好相关样式。作品卡和终端的局部样式继续保留在 scoped CSS 中。

## 可访问性与响应式

- hover 效果必须同时覆盖 `:focus-within`，键盘用户也能看到增强状态。
- 作品预览继续保留按钮控制和 `aria-expanded`。
- `aria-live` 终端说明不改动，避免数字动画造成额外朗读负担。
- 移动端不使用依赖指针位置的交互作为必要路径。
- `prefers-reduced-motion: reduce` 下关闭 ticker、glitch、扫描、流光和跑马灯移动。

## 边界与错误处理

- 项目图加载失败时，现有渐变 fallback 继续生效，spotlight 不依赖图片。
- 如果浏览器不支持 `CSS.registerProperty` 或较新 CSS 特性，不影响基础内容展示。
- 如果指针事件不可用，作品卡仍保留 hover/focus 的静态发光状态。
- 中文文本和代码文件保持 UTF-8；修改后扫描乱码标记。

## 测试与验证

采用现有轻量验证方式，不新增测试框架。实施时先扩展 `scripts/verify-homepage-structure.mjs`，让它检查新增动效标记，再编写生产代码通过验证。

完成后运行：

- `npm run verify:homepage`
- `npm run build`
- UTF-8 读取修改过的 Vue、CSS 和脚本文件
- 搜索常见 UTF-8 乱码标记，确认没有误编码文本

人工检查重点：

- 首屏标题 glitch 不长期闪烁。
- 指标卡和状态终端数字正常显示最终值。
- 作品卡 hover/focus 聚光不遮挡文本。
- 移动端卡片预览仍可点击展开。
- 按钮尺寸和布局没有跳动。

## 实施顺序

1. 先扩展首页验证脚本，增加对新 class、CSS 变量和降级规则的检查，并确认它会因缺少实现而失败。
2. 在 `StatusTerminal.vue` 增加数字片段 ticker。
3. 在 `HomeView.vue` 给指标值和 `CODE SYSTEMS` 增加必要结构或 class。
4. 在 `ProjectPreviewCard.vue` 增加 spotlight 指针状态和视觉层。
5. 在 `src/style.css` 增强按钮、标题 glitch、跑马灯遮罩和减少动画偏好。
6. 运行验证、构建、UTF-8 读取和乱码扫描。

## 自检

- 设计范围只覆盖首页第一优先级微动效。
- 没有新增依赖，也没有引入 React/Tailwind 组件库。
- 未改变项目详情页、关于页或全站信息架构。
- 动效均有减少动画偏好降级策略。
- 实施顺序支持先写失败验证，再写实现。
