# Contact Content Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `CONTENT_INFO.md` 中已经填写的邮箱、GitHub、微信和 QQ 信息同步到网站，同时保留尚未填写的其他内容。

**Architecture:** 沿用现有 Vue 单文件组件结构，只修改 `App.vue` 与 `AboutView.vue` 中的静态联系信息。微信和 QQ 没有网址，因此显示为不可点击的文本；未填写的项目链接、文案和图片保持原状。

**Tech Stack:** Vue 3、Vite、Node.js 结构验证脚本

---

### Task 1: 联系信息验证规则

**Files:**
- Modify: `scripts/verify-homepage-structure.mjs`

- [x] **Step 1: 写入失败验证**

将验证脚本扩展为读取 `src/views/AboutView.vue`，要求页面包含新邮箱、GitHub、微信和 QQ，并拒绝旧邮箱、GitHub 首页及旧社交占位链接。

- [x] **Step 2: 运行验证并确认失败**

Run: `npm run verify:homepage`

Expected: FAIL，因为页面仍包含旧联系信息。

### Task 2: 同步已填写内容

**Files:**
- Modify: `src/App.vue`
- Modify: `src/views/HomeView.vue`
- Modify: `src/views/AboutView.vue`

- [x] **Step 1: 替换邮箱和 GitHub**

把所有 `hello@example.com` 替换为 `li2814054665@163.com`，把 GitHub 首页替换为 `https://github.com/DaBenZhong33`。

- [x] **Step 2: 替换社交占位项**

移除“即刻／推特”及其 `#` 链接，改为不可点击的“微信 lzg2814054665”和“QQ 2814054665”。

- [x] **Step 3: 运行验证并确认通过**

Run: `npm run verify:homepage`

Expected: `Homepage structure verification passed.`

### Task 3: 完整验证

**Files:**
- Verify: `src/App.vue`
- Verify: `src/views/HomeView.vue`
- Verify: `src/views/AboutView.vue`

- [x] **Step 1: 检查占位联系方式**

Run: `rg -n 'hello@example\.com|href="#"|https://github\.com"|即刻|推特' src/App.vue src/views/HomeView.vue src/views/AboutView.vue`

Expected: 无匹配。

- [x] **Step 2: 检查 UTF-8 与乱码**

以 UTF-8 读取修改文件，并拒绝 `�`、`锟`、`Ã`、`Â`。

- [x] **Step 3: 运行生产构建**

Run: `npm run build`

Expected: 构建退出码为 0。
