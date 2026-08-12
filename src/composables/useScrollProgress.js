import { onMounted, onUnmounted, ref } from 'vue'

// 全局滚动状态：progress 为整页进度（0-1），scrollY 为当前滚动距离，rAF 节流
export function useScrollProgress() {
  const progress = ref(0)
  const scrollY = ref(0)
  let raf = null

  const update = () => {
    const doc = document.documentElement
    const scrollable = doc.scrollHeight - window.innerHeight
    scrollY.value = window.scrollY
    progress.value = scrollable > 0
      ? Math.min(Math.max(window.scrollY / scrollable, 0), 1)
      : 0
  }

  const onScroll = () => {
    if (raf) return
    raf = requestAnimationFrame(() => {
      raf = null
      update()
    })
  }

  onMounted(() => {
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
    if (raf) cancelAnimationFrame(raf)
  })

  return { progress, scrollY }
}
