<script setup>
import { RouterView, RouterLink } from 'vue-router'
import ScrollProgress from './components/ScrollProgress.vue'
import BackToTop from './components/BackToTop.vue'
</script>

<template>
  <div class="site">
    <ScrollProgress />
    <header class="nav">
      <div class="container nav-inner">
        <RouterLink to="/" class="logo">
          <span class="logo-mark">钟</span>
          <span class="logo-text">大笨钟<em> / DEV</em></span>
        </RouterLink>
        <nav class="nav-links">
          <RouterLink :to="{ path: '/', hash: '#work' }">作品</RouterLink>
          <RouterLink to="/about">关于</RouterLink>
        </nav>
        <a class="btn btn-primary nav-cta" href="mailto:hello@example.com" v-magnetic>邮件</a>
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
          <span class="logo-mark">钟</span>
          <div>
            <p class="footer-name">大笨钟 / DEV</p>
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
        © 2026 大笨钟 · Vue 3 + Vite
      </div>
    </footer>

    <BackToTop />
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
  background: rgba(5, 5, 5, 0.78);
  border-bottom: 1px solid var(--grid-line);
}

.nav-inner {
  height: 72px;
  display: flex;
  align-items: center;
  gap: 30px;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  font-weight: 900;
  font-size: 19px;
  text-transform: uppercase;
}

.logo-mark {
  width: 38px;
  height: 32px;
  border-radius: 0;
  background: var(--accent);
  color: #050505;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 900;
  flex: none;
}

.logo-text em {
  font-style: normal;
  color: var(--ink-3);
}

.nav-links {
  display: flex;
  gap: 12px;
  margin-left: auto;
}

.nav-links a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 10px;
  font-size: 13px;
  font-weight: 900;
  text-transform: uppercase;
  color: var(--ink-2);
  transition: color 0.2s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--accent);
}

.nav-cta {
  min-height: 44px;
  padding: 0 22px;
  font-size: 12px;
}

@media (max-width: 560px) {
  .nav-inner {
    height: 64px;
  }

  .logo-text em {
    display: none;
  }

  .nav-cta { display: none; }
}

/* ===== 页脚 ===== */
.footer {
  border-top: 1px solid var(--grid-line);
  margin-top: 0;
  padding: 58px 0 34px;
  background: #050505;
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
  font-weight: 900;
  text-transform: uppercase;
}

.footer-desc {
  color: var(--ink-3);
  font-size: 13px;
}

.footer-links {
  display: flex;
  gap: 8px 16px;
  flex-wrap: wrap;
}

.footer-links a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 10px;
  color: var(--ink-2);
  font-size: 13px;
  font-weight: 900;
  text-transform: uppercase;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: var(--accent);
}

.footer-copy {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--grid-line);
  color: var(--ink-3);
  font-size: 13px;
}
</style>
