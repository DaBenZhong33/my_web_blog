import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'
import './style.css'

// 滚动渐入指令
const reveal = {
  mounted(el) {
    el.classList.add('reveal')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add('is-visible')
            io.unobserve(el)
          }
        })
      },
      { threshold: 0.12 }
    )
    io.observe(el)
  }
}

// 磁吸按钮指令：按钮微微跟随鼠标
const magnetic = {
  mounted(el, binding) {
    const strength = binding.value ?? 0.28
    el.style.willChange = 'transform'
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`
    })
    el.addEventListener('mouseleave', () => {
      el.style.transform = ''
    })
  }
}

// 3D 倾斜指令：容器跟随鼠标做视差倾斜
const tilt = {
  mounted(el, binding) {
    const max = binding.value ?? 10
    el.classList.add('tilt-scene')
    const body = document.createElement('div')
    body.className = 'tilt-body'
    while (el.firstChild) body.appendChild(el.firstChild)
    el.appendChild(body)

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width - 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5
      body.style.transform = `rotateY(${px * max}deg) rotateX(${-py * max}deg)`
    })
    el.addEventListener('mouseleave', () => {
      body.style.transform = ''
    })
  }
}

createApp(App)
  .use(router)
  .directive('reveal', reveal)
  .directive('magnetic', magnetic)
  .directive('tilt', tilt)
  .mount('#app')
