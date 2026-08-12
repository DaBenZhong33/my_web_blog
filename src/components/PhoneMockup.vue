<script setup>
defineProps({
  // 项目渐变色 [起始, 结束]
  gradient: { type: Array, default: () => ['#2b3a5e', '#141824'] },
  // 屏幕标题
  label: { type: String, default: '' },
  accent: { type: String, default: '#e0b84d' }
})
</script>

<template>
  <div class="phone">
    <div
      class="screen"
      :style="{ background: `linear-gradient(160deg, ${gradient[0]}, ${gradient[1]})` }"
    >
      <!-- 界面结构预览 -->
      <div class="status-bar">
        <span>9:41</span>
        <span class="dots">●●●</span>
      </div>
      <div class="mock-block hero-block" :style="{ borderColor: accent }">
        <div class="mock-dot" :style="{ background: accent }"></div>
        <span>{{ label }}</span>
      </div>
      <div class="mock-block line w-80"></div>
      <div class="mock-block line w-60"></div>
      <div class="mock-block card-block">
        <div class="mock-block line w-60"></div>
        <div class="mock-block line w-80"></div>
      </div>
      <div class="mock-block card-block">
        <div class="mock-block line w-80"></div>
        <div class="mock-block line w-60"></div>
      </div>
      <div class="tab-bar">
        <i :style="{ background: accent }"></i><i></i><i></i><i></i>
      </div>
    </div>
  </div>
</template>

<style scoped>
.phone {
  width: 220px;
  aspect-ratio: 9 / 19;
  border-radius: 34px;
  padding: 10px;
  background: #0b0b0c;
  border: 1px solid #333336;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  position: relative;
}

.phone::before {
  /* 灵动岛 */
  content: "";
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 70px;
  height: 20px;
  border-radius: 999px;
  background: #0b0b0c;
  z-index: 2;
}

.screen {
  width: 100%;
  height: 100%;
  border-radius: 26px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 34px 14px 12px;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 10px;
  color: rgba(255, 255, 255, 0.75);
}

.dots {
  letter-spacing: 2px;
  font-size: 6px;
}

.mock-block {
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
}

.hero-block {
  height: 64px;
  border: 1px dashed;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-1);
  background: rgba(255, 255, 255, 0.05);
}

.mock-dot {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  flex: none;
}

.line {
  height: 10px;
}

.w-80 { width: 80%; }
.w-60 { width: 60%; }

.card-block {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

.tab-bar {
  display: flex;
  justify-content: space-around;
  padding: 10px 6px 2px;
}

.tab-bar i {
  width: 16px;
  height: 16px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.16);
}
</style>
