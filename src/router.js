import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import ProjectView from './views/ProjectView.vue'
import AboutView from './views/AboutView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/project/:id', name: 'project', component: ProjectView },
    { path: '/about', name: 'about', component: AboutView }
  ],
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, top: 86, behavior: 'smooth' }
    }
    return { top: 0 }
  }
})

export default router
