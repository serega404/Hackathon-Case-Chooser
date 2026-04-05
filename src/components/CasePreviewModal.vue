<template>
  <div class="preview-modal-overlay" @click.self="$emit('close')">
    <div class="preview-modal-content">
      <CloseButton @click="$emit('close')" />

      <div v-if="caseItem.image" class="preview-image" :style="{ backgroundImage: `url(${caseItem.image})` }"></div>
      <div v-else class="preview-image placeholder">Нет превью</div>

      <div class="preview-details">
        <h2 class="preview-title">{{ caseItem.title }}</h2>
        <p v-if="caseItem.description" class="preview-desc">{{ caseItem.description }}</p>
        <a v-if="caseItem.url" :href="caseItem.url" target="_blank" class="open-link-btn" @click.stop>
          Перейти к заданию
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Case } from './CaseCard.vue'
import CloseButton from './CloseButton.vue'

defineProps<{
  caseItem: Case
}>()

defineEmits<{
  (e: 'close'): void
}>()
</script>

<style scoped>
.preview-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-modal-content {
  background: var(--card-bg, #2a2a2a);
  border: 1px solid var(--border-color, #444);
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
}

.preview-image {
  width: 100%;
  padding-top: 56.25%;
  /* 16:9 ratio */
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  background-color: var(--bg-primary, #121212);
}

.preview-image.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 0;
  height: 300px;
  color: #666;
  font-size: 1.2rem;
}

.preview-details {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preview-title {
  margin: 0;
  font-size: 1.4rem;
  color: var(--text-color, #eee);
  line-height: 1.4;
}

.preview-desc {
  margin: 0;
  font-size: 1rem;
  color: #ccc;
  line-height: 1.5;
}

.open-link-btn {
  display: inline-block;
  padding: 14px 24px;
  background: linear-gradient(135deg, #00f260, #0575e6);
  color: #fff;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.open-link-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 242, 96, 0.4);
}
</style>
