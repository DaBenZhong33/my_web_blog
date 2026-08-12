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

const getTiltOptions = (value) => {
  if (typeof value === 'object' && value !== null) {
    return {
      max: value.max ?? 10,
      scale: value.scale ?? 1,
      disabledBelow: value.disabledBelow ?? 0
    }
  }

  return {
    max: value ?? 10,
    scale: 1,
    disabledBelow: 0
  }
}

const canUseTilt = (options) => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  if (!window.matchMedia('(pointer: fine)').matches) return false
  return window.innerWidth >= options.disabledBelow
}

// 3D 倾斜指令：容器跟随鼠标做视差倾斜
const tilt = {
  mounted(el, binding) {
    const options = getTiltOptions(binding.value)
    el.classList.add('tilt-scene')
    const body = document.createElement('div')
    body.className = 'tilt-body'
    while (el.firstChild) body.appendChild(el.firstChild)
    el.appendChild(body)

    const resetTilt = () => {
      body.style.transform = ''
      el.style.removeProperty('--tilt-pointer-x')
      el.style.removeProperty('--tilt-pointer-y')
    }

    const updateEnabledState = () => {
      const enabled = canUseTilt(options)
      el.classList.toggle('tilt-disabled', !enabled)
      if (!enabled) resetTilt()
      return enabled
    }

    const handlePointerMove = (e) => {
      if (!updateEnabledState()) return
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width - 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5
      el.style.setProperty('--tilt-pointer-x', `${((px + 0.5) * 100).toFixed(2)}%`)
      el.style.setProperty('--tilt-pointer-y', `${((py + 0.5) * 100).toFixed(2)}%`)
      body.style.transform = `rotateY(${px * options.max}deg) rotateX(${-py * options.max}deg) scale(${options.scale})`
    }

    updateEnabledState()
    el.addEventListener('pointermove', handlePointerMove)
    el.addEventListener('pointerleave', resetTilt)
    window.addEventListener('resize', updateEnabledState, { passive: true })

    el.__tiltCleanup = () => {
      el.removeEventListener('pointermove', handlePointerMove)
      el.removeEventListener('pointerleave', resetTilt)
      window.removeEventListener('resize', updateEnabledState)
    }
  },
  unmounted(el) {
    el.__tiltCleanup?.()
  }
}

createApp(App)
  .use(router)
  .directive('reveal', reveal)
  .directive('magnetic', magnetic)
  .directive('tilt', tilt)
  .mount('#app')
