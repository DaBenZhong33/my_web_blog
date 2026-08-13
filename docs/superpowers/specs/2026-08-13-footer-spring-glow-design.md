# 页脚弹簧光效设计

## 背景

用户希望把 21st.dev 的 Ruixen Gradient Footer 效果用于当前个人作品站，但不想替换现有页脚。新的交互要求是：原来的页脚保持不动，用户滑到原页脚后继续向下滚动，才出现彩色光效；往回滚动时，光效像弹簧一样收回。

当前项目是 Vue 3 + Vite，入口布局在 `src/App.vue`，全局样式在 `src/style.css`，组件放在 `src/components/`。现有页脚已经包含品牌、描述、GitHub、Email、即刻和版权信息，应继续保持可读和稳定。

附件提供的是 React + TypeScript 组件，依赖 shadcn/Tailwind 的项目约定。当前项目没有 React、Tailwind、shadcn 或 TypeScript，因此实现应转成 Vue 单文件组件和普通 CSS。

## 目标

- 保留 `App.vue` 里现有 `.footer` 的内容、结构和主要样式。
- 在原页脚后新增一段短尾部滚动空间，用户进入这段空间时才展示彩色 SVG 光带。
- 光效从视口底部升起，离开尾部空间时带阻尼地收回，形成轻微弹簧感。
- 使用 SVG 和 CSS/JavaScript，不新增 React、Tailwind、shadcn 或 TypeScript。
- 光效只作为装饰层，不承载任何关键信息。
- 支持 `prefers-reduced-motion: reduce` 降级。
- 修改后检查 UTF-8 和中文乱码问题。

## 非目标

- 不把附件中的 `ruixen-gradient-footer.tsx` 原样复制到项目里。
- 不创建 `/components/ui`，因为这是 shadcn/React 结构，不符合当前 Vue 项目。
- 不改造现有 footer 链接、品牌、版权文字或信息架构。
- 不依赖浏览器原生 overscroll 橡皮筋行为。该行为在 Windows 和桌面 Chrome 上不稳定。
- 不让光效覆盖首屏、项目区或其它页面内容。

## 用户体验

页面正常滚动到现有页脚时，用户先看到与当前站点一致的页脚。继续向下滚动会进入一个高度约 `34vh` 到 `42vh` 的尾部区域，彩色光带从视口底部逐渐升起。滚动到底部时，光带达到最大高度。

用户向上滚动离开尾部区域时，光带不会瞬间消失，而是用带阻尼的动画值追随滚动目标值，产生轻微延迟和回弹。回到页脚内容区域后，光带缩回到底部薄光或完全隐藏。

在减少动画偏好下，不运行弹簧循环，只显示很淡的静态底部光，或直接隐藏动态效果。

## 组件设计

新增组件：

- `src/components/FooterSpringGlow.vue`

组件职责：

- 渲染 footer 后的尾部滚动空间。
- 渲染固定在视口底部的 SVG 光带。
- 根据滚动位置计算目标进度。
- 用 `requestAnimationFrame`、速度值和阻尼参数让实际进度追随目标进度。
- 在组件卸载时移除事件监听并取消动画帧。
- 监听 `prefers-reduced-motion`，必要时关闭动态追随。

`App.vue` 接入方式：

- 保持现有 `<footer class="footer">...</footer>` 不变。
- 在 footer 之后添加 `<FooterSpringGlow />`。
- 根 `.site` 和 `main` 的 flex 布局保持现状。

建议 props：

- `tailHeight`：尾部区域高度，默认 `38vh`。
- `maxReveal`：最大光带高度，默认接近 `100%`。
- `minReveal`：初始薄光高度，默认 `0.035`。

首版可以只使用默认值，不暴露复杂调参。

## 光效实现

光带延续 Ruixen Gradient Footer 的核心视觉：多个模糊矩形柱组合成中间高、两侧低的彩色光幕。Vue 组件中保留这些稳定常量：

- viewBox 宽高：`1271 x 599`
- stops：暗红、蓝、浅蓝、近白、黄、红橙、品红、透明粉
- bars：默认 9
- blur：默认 15
- peak：默认 0.98
- valley：默认 0.55

`bellHeights` 作为普通 JS 函数保留，用于生成每个柱子的高度。SVG 使用唯一 id，避免同页多个渐变或滤镜冲突。

## 滚动与弹簧算法

组件通过自身尾部容器的位置计算目标进度：

- 当尾部容器还没进入视口底部时，目标进度为 `0` 或 `minReveal`。
- 当用户滚入尾部容器时，目标进度按进入比例从 `minReveal` 走到 `1`。
- 当用户向上滚出尾部容器时，目标进度回落。

实际显示进度使用弹簧追随：

- 保存 `current`、`target`、`velocity`。
- 每帧计算 `force = (target - current) * stiffness`。
- `velocity = (velocity + force) * damping`。
- `current += velocity`。
- 当 `current` 和 `target` 足够接近时停止动画帧。

光带样式由 CSS 变量驱动：

- `--footer-glow-progress`
- `--footer-glow-opacity`
- `--footer-glow-lift`

主要变换使用 `transform: scaleY(...) translateY(...)`，避免频繁改布局属性。

## 响应式与性能

桌面端：

- 尾部区域默认约 `38vh`。
- 光带固定在视口底部，`pointer-events: none`。
- SVG 不捕获焦点，不影响返回顶部按钮和 footer 链接。

移动端：

- 尾部区域可降低到约 `30vh`。
- 光带透明度降低，避免遮挡 footer 后的收尾感。
- 不改变现有 footer 在窄屏下的换行规则。

性能：

- 不使用 canvas 或 WebGL。
- 只在滚动目标变化或弹簧尚未稳定时运行动画帧。
- 滚动和 resize 监听使用 `{ passive: true }`。

## 可访问性

- 光效根节点使用 `aria-hidden="true"`。
- 尾部区域不包含可聚焦元素。
- 减少动画偏好下关闭弹簧动画。
- 原 footer 链接保持原有可访问性和键盘访问行为。

## 验证

实现后运行：

- `npm run verify:homepage`
- `npm run build`

额外检查：

- 用 UTF-8 读取 `src/App.vue`、`src/components/FooterSpringGlow.vue` 和修改过的样式文件。
- 搜索常见乱码标记，确认中文没有乱码。
- 确认 `public/favicon.png` 等已有用户改动未被覆盖。

浏览器检查：

- 页脚内容与修改前一致。
- 到达页脚时光效不抢先覆盖内容。
- 继续向下滚动时光效升起。
- 往上滚动时光效弹性收回。
- 移动端没有横向溢出。
- 减少动画偏好下页面仍可用。

## 实施顺序

1. 新增 `FooterSpringGlow.vue`，先完成 SVG、尾部空间和静态样式。
2. 添加滚动进度计算和弹簧追随逻辑。
3. 在 `App.vue` 原 footer 后接入组件，不改原 footer 内容。
4. 补充或调整验证脚本，检查新组件存在和关键降级逻辑。
5. 运行构建、首页验证、UTF-8 读取和乱码扫描。
6. 使用浏览器检查桌面和移动端行为。

## 自检

- 设计明确保留原 footer，不替换现有页脚。
- 设计明确使用 footer 后的短尾部滚动区，不依赖不稳定的原生 overscroll。
- 设计范围聚焦在 `App.vue` 和新增组件，没有扩大到首页内容或其它页面。
- 实现路径符合当前 Vue 3 + Vite 项目结构。
- 包含响应式、性能、减少动画偏好、可访问性和编码验证要求。
- 没有未定需求、空白项或互相矛盾的章节。
