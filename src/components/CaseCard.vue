<template>
  <div class="case-card" :class="{ compact }" @click="handleClick">
    <div v-if="caseItem.image" class="card-image" :style="{ backgroundImage: `url(${caseItem.image})` }"></div>
    <div v-else class="card-image placeholder-image">
      <span>Нет превью</span>
    </div>
    <div v-if="!hideTitle" class="card-content">
      <h3 class="card-title">{{ caseItem.title }}</h3>
    </div>
  </div>
</template>

<script setup lang="ts">

import { useCaseOrderStore } from '../stores/caseOrder'

export interface Case {
  id: string | number
  title: string
  image?: string
  url?: string
  description?: string
}

const props = defineProps<{
  caseItem: Case
  hideTitle?: boolean
  compact?: boolean
}>()

const store = useCaseOrderStore()

const handleClick = () => {
  store.openPreview(props.caseItem)
}
</script>

<style scoped>
.case-card {
  /* 16:9 ratio */
  width: 240px;
  height: 135px;
  background-color: var(--card-bg, #2a2a2a);
  border: 1px solid var(--border-color, #444);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  cursor: grab;
  transition: transform 0.2s, box-shadow 0.2s;
  user-select: none;
}

.case-card:active {
  cursor: grabbing;
}

.case-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.6);
}

.case-card.compact {
  width: 100px;
  height: 100px;
  border: none;
  box-shadow: none;
  background-color: transparent;
}

.case-card.compact:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
}

.card-image {
  flex-grow: 1;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}

.placeholder-image {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary, #1e1e1e);
  color: #888;
  font-size: 0.8rem;
}

.card-content {
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 40px;
  background-color: var(--card-bg, #2a2a2a);
}

.card-title {
  font-size: 0.85rem;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--text-color, #eee);
}
</style>
