<template>
  <button class="close-btn" @click="$emit('click')">✕</button>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'click'): void
}>()
</script>

<style scoped>
.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 1.4rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  line-height: 1;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 10;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.close-btn:hover {
  background: rgba(255, 71, 87, 0.9);
  border-color: rgba(255, 71, 87, 1);
  transform: rotate(90deg) scale(1.15);
  box-shadow: 0 8px 25px rgba(255, 71, 87, 0.4);
}

.close-btn:active {
  transform: rotate(90deg) scale(0.95);
  box-shadow: 0 4px 10px rgba(255, 71, 87, 0.3);
}
</style>
