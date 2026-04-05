<template>
  <div class="simple-list-container">
    <div class="list-header">
      <h3 class="list-heading">Порядок кейсов</h3>
      <p class="list-subtitle">Перетащите карточки для изменения порядка</p>
    </div>

    <draggable class="cases-list" v-model="localCases" item-key="id" animation="250" ghost-class="ghost-item"
      handle=".drag-handle" @change="onReorder">
      <template #item="{ element, index }">
        <div class="list-item" :class="{ 'first-place': index === 0 }" @click="store.openPreview(element)">
          <div class="move-arrows">
            <button class="arrow-btn" @click.stop="moveUp(index)" :disabled="index === 0" title="Вверх">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
            </button>
            <button class="arrow-btn" @click.stop="moveDown(index)" :disabled="index === localCases.length - 1" title="Вниз">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
          </div>
          <div class="drag-handle" @click.stop>
            <svg class="handle-icon" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="8" cy="6" r="1.8" />
              <circle cx="16" cy="6" r="1.8" />
              <circle cx="8" cy="12" r="1.8" />
              <circle cx="16" cy="12" r="1.8" />
              <circle cx="8" cy="18" r="1.8" />
              <circle cx="16" cy="18" r="1.8" />
            </svg>
            <div class="item-rank" :class="rankClass(index)">
              {{ index + 1 }}
            </div>
          </div>
          <div class="item-card-wrapper">
            <CaseCard :caseItem="element" hideTitle compact />
          </div>
          <div class="item-title-text">{{ element.title }}</div>
          <a v-if="element.url" :href="element.url" target="_blank" class="list-open-btn" title="Открыть задание"
            @click.stop>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </div>
      </template>
    </draggable>

    <div v-if="localCases.length === 0" class="empty-state">
      <p>Кейсы ещё не загружены</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import draggable from 'vuedraggable'
import CaseCard, { type Case } from './CaseCard.vue'
import { useCaseOrderStore } from '../stores/caseOrder'

const store = useCaseOrderStore()
const localCases = ref<Case[]>([])

onMounted(() => {
  localCases.value = [...store.orderedCases]
})

watch(
  () => store.orderedCases,
  (newCases) => {
    localCases.value = [...newCases]
  },
  { deep: true },
)

const onReorder = () => {
  store.setFromList(localCases.value)
}

const moveUp = (index: number) => {
  if (index > 0) {
    const list = [...localCases.value]
    const temp = list[index]!
    list[index] = list[index - 1]!
    list[index - 1] = temp
    localCases.value = list
    store.setFromList(list)
  }
}

const moveDown = (index: number) => {
  if (index < localCases.value.length - 1) {
    const list = [...localCases.value]
    const temp = list[index]!
    list[index] = list[index + 1]!
    list[index + 1] = temp
    localCases.value = list
    store.setFromList(list)
  }
}

const rankClass = (index: number): string => {
  if (index === 0) return 'rank-gold'
  if (index === 1) return 'rank-silver'
  if (index === 2) return 'rank-bronze'
  return ''
}
</script>

<style scoped>
.simple-list-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.list-header {
  text-align: center;
  margin-bottom: 8px;
}

.list-heading {
  margin: 0 0 4px 0;
  font-size: 1.6rem;
  font-weight: 700;
  background: linear-gradient(135deg, #4361ee, #7209b7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.list-subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: #888;
}

.cases-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
  cursor: pointer;
}

.list-item:hover {
  border-color: rgba(67, 97, 238, 0.4);
  box-shadow: 0 4px 16px rgba(67, 97, 238, 0.1);
}

.list-item.first-place {
  border-color: rgba(255, 215, 0, 0.3);
  background: linear-gradient(135deg,
      rgba(255, 215, 0, 0.05) 0%,
      var(--bg-secondary) 40%);
}

.move-arrows {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-shrink: 0;
}

.arrow-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.arrow-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: #4361ee;
}

.arrow-btn:disabled {
  opacity: 0.2;
  cursor: not-allowed;
}

.arrow-btn svg {
  width: 18px;
  height: 18px;
}

.drag-handle {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: grab;
  padding: 4px;
  flex-shrink: 0;
}

.drag-handle:active {
  cursor: grabbing;
}

.handle-icon {
  width: 20px;
  height: 20px;
  color: #555;
  transition: color 0.2s;
}

.list-item:hover .handle-icon {
  color: #888;
}

.item-rank {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 800;
  color: #ccc;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.item-rank.rank-gold {
  background: linear-gradient(135deg, #ffd700, #b8860b);
  color: #1a1a1a;
  border-color: #ffd700;
  box-shadow: 0 2px 10px rgba(255, 215, 0, 0.3);
}

.item-rank.rank-silver {
  background: linear-gradient(135deg, #c0c0c0, #808080);
  color: #1a1a1a;
  border-color: #c0c0c0;
  box-shadow: 0 2px 10px rgba(192, 192, 192, 0.3);
}

.item-rank.rank-bronze {
  background: linear-gradient(135deg, #cd7f32, #8b4513);
  color: #1a1a1a;
  border-color: #cd7f32;
  box-shadow: 0 2px 10px rgba(205, 127, 50, 0.3);
}

.item-card-wrapper {
  flex-shrink: 0;
}

.item-title-text {
  flex: 1;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-color);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.list-open-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: #aaa;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-right: 2%;
}

.list-open-btn:hover {
  background: rgba(67, 97, 238, 0.15);
  color: #4361ee;
  transform: translateY(-2px);
}

.list-open-btn svg {
  width: 18px;
  height: 18px;
}

.ghost-item {
  opacity: 0.4;
  background: rgba(67, 97, 238, 0.15) !important;
  border-color: #4361ee !important;
  border-style: dashed !important;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .item-title-text {
    display: none;
  }

  .list-item {
    padding: 8px 12px;
    gap: 10px;
  }
}
</style>
