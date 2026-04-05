<template>
  <div class="tier-list-container">
    <div class="tiers-wrapper">
      <div v-for="tier in tiers" :key="tier.id" class="tier-row">
        <div class="tier-header" :style="{ backgroundColor: tier.color }">
          <span class="tier-name">{{ tier.id }}</span>
        </div>
        <draggable
          class="tier-cases-zone"
          v-model="tier.items"
          group="cases"
          item-key="id"
          animation="200"
          ghost-class="ghost-card"
          @change="saveTiers"
        >
          <template #item="{ element }">
            <CaseCard :caseItem="element" />
          </template>
        </draggable>
      </div>
    </div>

    <div class="unassigned-zone">
      <h3>Нераспределенные кейсы</h3>
      <draggable
        class="unassigned-cases"
        v-model="unassigned"
        group="cases"
        item-key="id"
        animation="200"
        @change="saveTiers"
      >
        <template #item="{ element }">
          <CaseCard :caseItem="element" />
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import draggable from 'vuedraggable'
import CaseCard, { type Case } from './CaseCard.vue'
import { useCaseOrderStore } from '../stores/caseOrder'

const store = useCaseOrderStore()

interface Tier {
  id: string
  color: string
  items: Case[]
}

const unassigned = ref<Case[]>([])

const tiers = ref<Tier[]>([
  { id: 'S', color: '#ff7f7f', items: [] },
  { id: 'A', color: '#ffbf7f', items: [] },
  { id: 'B', color: '#ffff7f', items: [] },
  { id: 'C', color: '#7fff7f', items: [] },
  { id: 'D', color: '#7fbfff', items: [] },
])

onMounted(() => {
  const cases = store.orderedCases
  const assignments = store.tierAssignments

  // Сбросить все тиры
  tiers.value.forEach((t) => (t.items = []))
  unassigned.value = []

  for (const c of cases) {
    const tierId = assignments[String(c.id)]
    if (tierId) {
      const tier = tiers.value.find((t) => t.id === tierId)
      if (tier) {
        tier.items.push(c)
        continue
      }
    }
    unassigned.value.push(c)
  }
})

/**
 * Автосохранение: обход тиров S→D, внутри слева направо → плоский массив.
 * Нераспределённые — в конец.
 */
const saveTiers = () => {
  store.setFromTierList(
    tiers.value.map((t) => ({ id: t.id, items: [...t.items] })),
    [...unassigned.value],
  )
}
</script>

<style scoped>
.tier-list-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.tiers-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tier-row {
  display: flex;
  min-height: 100px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.tier-header {
  width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: #111;
  text-shadow: 1px 1px 0 #fff;
}

.tier-cases-zone {
  flex-grow: 1;
  padding: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-start;
}

.unassigned-zone {
  padding: 12px;
  background: #1a1a1a;
  border: 2px dashed #555;
  border-radius: 12px;
}

.unassigned-zone h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 1.1rem;
}

.unassigned-cases {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 120px;
}

.ghost-card {
  opacity: 0.5;
  background: #c8ebfb;
}

/* Компактные карточки внутри TierList */
:deep(.case-card) {
  width: 160px;
  height: 90px;
}

:deep(.case-card .card-content) {
  height: 32px;
  padding: 4px;
}

:deep(.case-card .card-title) {
  font-size: 0.75rem;
  line-height: 1.2;
}
</style>
