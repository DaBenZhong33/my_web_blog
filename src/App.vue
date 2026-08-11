<script setup>
import { RouterView, RouterLink } from 'vue-router'
</script>

<template>
  <div class="site">
    <header class="nav">
      <div class="container nav-inner">
        <RouterLink to="/" class="logo">
          <span class="logo-mark">Y</span>
          <span class="logo-text">yanfa<em>.dev</em></span>
        </RouterLink>
        <nav class="nav-links">
          <RouterLink to="/#projects">作品</RouterLink>
          <RouterLink to="/about">关于</RouterLink>
        </nav>
        <a class="btn btn-primary nav-cta" href="mailto:hello@example.com" v-magnetic>联系我</a>
      </div>
    </header>

    <main>
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <footer class="footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <span class="logo-mark">Y</span>
          <div>
            <p class="footer-name">yanfa.dev</p>
            <p class="footer-desc">独立开发者 · 做自己的小产品</p>
          </div>
        </div>
        <div class="footer-links">
          <a href="https://github.com" target="_blank" rel="noopener">GitHub</a>
          <a href="mailto:hello@example.com">Email</a>
          <a href="#" target="_blank" rel="noopener">即刻</a>
        </div>
      </div>
      <div class="container footer-copy">
        © 2026 yanfa · 用 Vue 3 构建
      </div>
    </footer>
  </div>
</template>

<style scoped>
.site {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

/* ===== 导航 ===== */
.nav {
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(16px);
  background: rgba(20, 20, 20, 0.72);
  border-bottom: 1px solid var(--border);
}

.nav-inner {
  height: 64px;
  display: flex;
  align-items: center;
  gap: 32px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 17px;
}

.logo-mark {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: linear-gradient(150deg, #e0b84d, #8a6b1f);
  color: #141414;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 800;
  flex: none;
}

.logo-text em {
  font-style: normal;
  color: var(--ink-3);
}

.nav-links {
  display: flex;
  gap: 26px;
  margin-left: auto;
}

.nav-links a {
  font-size: 14px;
  color: var(--ink-2);
  transition: color 0.2s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--ink-1);
}

.nav-cta {
  padding: 8px 20px;
  font-size: 14px;
}

@media (max-width: 560px) {
  .nav-cta { display: none; }
}

/* ===== 页脚 ===== */
.footer {
  border-top: 1px solid var(--border);
  margin-top: 120px;
  padding: 48px 0 32px;
  background: var(--surface);
}

.footer-inner {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 32px;
  flex-wrap: wrap;
}

.footer-brand {
  display: flex;
  gap: 12px;
  align-items: center;
}

.footer-name {
  font-weight: 700;
}

.footer-desc {
  color: var(--ink-3);
  font-size: 13px;
}

.footer-links {
  display: flex;
  gap: 24px;
}

.footer-links a {
  color: var(--ink-2);
  font-size: 14px;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: var(--accent);
}

.footer-copy {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
  color: var(--ink-3);
  font-size: 13px;
}
</style>
