<template>
  <div id="app-container">
    <header class="app-header">
      <h1>Выбор кейсов</h1>
    </header>

    <nav class="mode-tabs">
      <button :class="{ active: currentMode === 'list' }" @click="currentMode = 'list'">
        Режим 1: Список
      </button>
      <button :class="{ active: currentMode === 'tier' }" @click="currentMode = 'tier'">
        Режим 2: Tier List
      </button>
      <button :class="{ active: currentMode === 'wheel' }" @click="currentMode = 'wheel'">
        Режим 3: Колесо фортуны
      </button>
    </nav>

    <main class="mode-content">
      <Transition name="fade" mode="out-in">
        <SimpleList v-if="currentMode === 'list'" key="list" />
        <TierList v-else-if="currentMode === 'tier'" key="tier" />
        <Wheel
          v-else-if="currentMode === 'wheel'"
          key="wheel"
          :cases="cases"
          @accepted="currentMode = 'list'"
        />
      </Transition>
    </main>

    <Transition name="modal">
      <CasePreviewModal
        v-if="store.previewingCase"
        :caseItem="store.previewingCase"
        @close="store.closePreview()"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SimpleList from './components/SimpleList.vue'
import TierList from './components/TierList.vue'
import Wheel from './components/Wheel.vue'
import CasePreviewModal from './components/CasePreviewModal.vue'
import { useCaseOrderStore } from './stores/caseOrder'
import type { Case } from './components/CaseCard.vue'

type Mode = 'list' | 'tier' | 'wheel'

const currentMode = ref<Mode>('list')
const cases = ref<Case[]>([])
const store = useCaseOrderStore()

const loadCases = async () => {
  try {
    const res = await fetch('/cases.json')
    if (!res.ok) throw new Error('Failed to load cases')
    cases.value = await res.json()
    store.initialize(cases.value)
  } catch (e) {
    console.error(e)
    cases.value = []
  }
}

loadCases()
</script>

<style>
:root {
  --bg-primary: #121212;
  --bg-secondary: #1e1e1e;
  --text-color: #eeeeee;
  --border-color: #333333;
  --card-bg: #2a2a2a;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-color);
}

#app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.mode-tabs {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
}

.mode-tabs button {
  padding: 12px 24px;
  font-size: 1rem;
  background: var(--bg-secondary);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-tabs button.active {
  background: #2196F3;
  color: white;
  border-color: #2196F3;
}

.mode-content {
  min-height: 600px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
