import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Case } from '../components/CaseCard.vue'

const STORAGE_KEY = 'case-chooser-order'

interface StoredState {
  orderedCaseIds: (string | number)[]
  tierAssignments: Record<string, string>
  isOrdered: boolean
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = result[i]!
    result[i] = result[j]!
    result[j] = temp
  }
  return result
}

export const useCaseOrderStore = defineStore('caseOrder', () => {
  const orderedCases = ref<Case[]>([])
  const tierAssignments = ref<Record<string, string>>({})
  const isOrdered = ref(false)
  const previewingCase = ref<Case | null>(null)

  function openPreview(c: Case) {
    previewingCase.value = c
  }

  function closePreview() {
    previewingCase.value = null
  }

  /**
   * Инициализация store из localStorage (или из allCases по умолчанию).
   */
  function initialize(allCases: Case[]) {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const stored: StoredState = JSON.parse(raw)
        const caseMap = new Map(allCases.map((c) => [String(c.id), c]))
        const ordered: Case[] = []

        for (const id of stored.orderedCaseIds) {
          const c = caseMap.get(String(id))
          if (c) {
            ordered.push(c)
            caseMap.delete(String(c.id))
          }
        }

        // Добавить новые кейсы, которых не было в сохранённом порядке
        for (const c of caseMap.values()) {
          ordered.push(c)
        }

        orderedCases.value = ordered
        tierAssignments.value = stored.tierAssignments || {}
        isOrdered.value = stored.isOrdered ?? false
      } catch {
        orderedCases.value = [...allCases]
        isOrdered.value = false
      }
    } else {
      orderedCases.value = [...allCases]
      isOrdered.value = false
    }
  }

  function save() {
    const state: StoredState = {
      orderedCaseIds: orderedCases.value.map((c) => c.id),
      tierAssignments: tierAssignments.value,
      isOrdered: isOrdered.value,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }

  /**
   * Из рулетки: winner на первое место.
   * - Если порядок уже был задан — остальные сохраняют свои позиции.
   * - Если порядок не задан — остальные перемешиваются случайно.
   */
  function setFromWheel(winner: Case, allCases: Case[]) {
    if (isOrdered.value) {
      // Сохранить существующий порядок, только переместить winner в начало
      const rest = orderedCases.value.filter((c) => String(c.id) !== String(winner.id))
      orderedCases.value = [winner, ...rest]
    } else {
      // Нет предыдущего порядка — winner первый, остальные рандомно
      const rest = allCases.filter((c) => String(c.id) !== String(winner.id))
      orderedCases.value = [winner, ...shuffle(rest)]
    }
    isOrdered.value = true
    tierAssignments.value = {}
    save()
  }

  /**
   * Из тир-листа: обход S→D, внутри каждого тира слева направо.
   * Нераспределённые — в конец.
   */
  function setFromTierList(
    tiers: { id: string; items: Case[] }[],
    unassigned: Case[],
  ) {
    const ordered: Case[] = []
    const assignments: Record<string, string> = {}

    for (const tier of tiers) {
      for (const c of tier.items) {
        ordered.push(c)
        assignments[String(c.id)] = tier.id
      }
    }

    for (const c of unassigned) {
      ordered.push(c)
    }

    orderedCases.value = ordered
    tierAssignments.value = assignments
    isOrdered.value = true
    save()
  }

  /**
   * Из простого списка: прямая установка порядка.
   */
  function setFromList(cases: Case[]) {
    orderedCases.value = [...cases]
    isOrdered.value = true
    save()
  }

  return {
    orderedCases,
    tierAssignments,
    isOrdered,
    previewingCase,
    initialize,
    save,
    setFromWheel,
    setFromTierList,
    setFromList,
    openPreview,
    closePreview,
  }
})
