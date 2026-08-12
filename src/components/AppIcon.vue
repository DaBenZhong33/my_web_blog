<script setup>
defineProps({
  name: { type: String, required: true },
  accent: { type: String, default: '#e0b84d' },
  gradient: { type: Array, default: () => ['#2b3a5e', '#141824'] },
  image: { type: String, default: '' },
  alt: { type: String, default: '' },
  size: { type: Number, default: 64 }
})
</script>

<template>
  <div
    class="app-icon"
    :class="{ 'has-image': image }"
    :style="{
      width: size + 'px',
      height: size + 'px',
      background: image ? 'transparent' : `linear-gradient(150deg, ${gradient[0]}, ${gradient[1]})`,
      fontSize: size * 0.42 + 'px'
    }"
  >
    <img
      v-if="image"
      class="app-icon-image"
      :src="image"
      :alt="alt || `${name} Logo`"
      loading="lazy"
      decoding="async"
    />
    <span v-else :style="{ color: accent }">{{ name.charAt(0) }}</span>
  </div>
</template>

<style scoped>
.app-icon {
  border-radius: 22.5%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 8px 20px rgba(0, 0, 0, 0.35);
  flex: none;
  overflow: hidden;
}

.app-icon-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
