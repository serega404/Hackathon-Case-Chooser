<template>
  <div class="wheel-view">
    <div class="cases-list-section">
      <h3 class="list-title">Список всех кейсов</h3>
      <div class="cases-grid">
        <CaseCard v-for="c in cases" :key="c.id" :caseItem="c" />
      </div>
      <div class="controls-main">
        <button @click="openWheelModal" class="open-wheel-btn">Открыть колесо фортуны</button>
      </div>
    </div>

    <!-- Модалка с колесом фортуны -->
    <div v-if="isWheelModalOpen" class="wheel-modal-overlay">
      <div class="wheel-modal-layout">

        <!-- Winner display — above wheel, only when winner is chosen -->
        <div class="winner-top-area">
          <Transition name="fade" mode="out-in">
            <div v-if="winner && !isSpinning" class="winner-top-block">
              <div class="winner-card-wrapper">
                <CaseCard :caseItem="winner" class="winner-card" />
              </div>
            </div>
          </Transition>
        </div>

        <!-- Wheel card — always centered -->
        <div class="wheel-center-area">
          <div class="wheel-panel">
            <!-- Close button inside card -->
            <Transition name="btn-pop">
              <CloseButton v-if="!isSpinning" @click="closeWheelModal" />
            </Transition>

            <div class="wheel-container">
              <div class="wheel-wrapper">
                <div class="wheel-pointer" :class="{ engaged: hasSpunOnce }"
                  :style="{ transform: `translateX(-50%) rotate(${-pointerRotation}deg)` }">▼</div>
                <div class="wheel-bounding-box">
                  <div class="wheel" :style="{ transform: `rotate(${currentRotation}deg)` }">
                    <div v-for="(caseItem, index) in cases" :key="'bg-' + caseItem.id" class="wheel-sector"
                      :style="getSectorStyle(index)"></div>

                    <div v-for="(caseItem, index) in cases" :key="'txt-' + caseItem.id" class="wheel-text-wrapper"
                      :style="getTextStyle(index)">
                      <span class="wheel-text">{{ caseItem.title }}</span>
                    </div>

                    <!-- Pegs on dividers -->
                    <div v-for="(caseItem, index) in cases" :key="'peg-' + caseItem.id" class="wheel-peg-wrapper"
                      :style="getPegWrapperStyle(index)">
                      <div class="wheel-peg"></div>
                    </div>
                  </div>
                </div>

                <!-- Center Spin Button -->
                <div class="center-spin-wrapper">
                  <button class="center-spin-btn" :class="{ 'minimized': isSpinning || !!winner }" @click="spinWheel"
                    :disabled="cases.length === 0 || isSpinning || !!winner">
                    <span class="spin-text" :class="{ 'fade-out': isSpinning || !!winner }">СТАРТ</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action buttons — always below wheel -->
        <div class="wheel-bottom-area">
          <Transition name="fade" mode="out-in">
            <div v-if="!isSpinning" class="actions-panel">
              <MatrixPills v-if="winner" :pills="wheelPills" @respin="respin" @accept="acceptWinner" />
            </div>
          </Transition>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CaseCard, { type Case } from './CaseCard.vue'
import MatrixPills, { type PillConfig } from './MatrixPills.vue'
import CloseButton from './CloseButton.vue'
import { useCaseOrderStore } from '../stores/caseOrder'

const props = defineProps<{
  cases: Case[]
}>()

const emit = defineEmits<{
  (e: 'accepted'): void
}>()

const store = useCaseOrderStore()

const wheelPills: PillConfig[] = [
  {
    id: 'red',
    text: 'Додеп',
    image: '/red_pill_hand.png',
    event: 'respin',
    handClass: 'left',
    theme: {
      '--hand-brightness': '0.65',
      '--pill-bg': 'radial-gradient(ellipse at 40% 30%, #ff4d4d 0%, #d40000 40%, #800000 100%)',
      '--pill-border': '#751414',
      '--pill-before': 'rgba(255, 77, 77, 0.4)',
      '--pill-shadow-color': 'rgba(255, 77, 77, 0.8)',
      '--pill-shadow-1': 'rgba(255, 77, 77, 0.5)',
      '--pill-shadow-2': 'rgba(255, 77, 77, 0.7)'
    }
  },
  {
    id: 'blue',
    text: 'Принять',
    image: '/blue_pill_hand.png',
    event: 'accept',
    handClass: 'right',
    theme: {
      '--hand-brightness': '0.35',
      '--pill-bg': 'radial-gradient(ellipse at 40% 30%, #4da6ff 0%, #005ce6 40%, #002b80 100%)',
      '--pill-border': '#1f3750',
      '--pill-before': 'rgba(77, 166, 255, 0.4)',
      '--pill-shadow-color': 'rgba(74, 144, 226, 0.8)',
      '--pill-shadow-1': 'rgba(74, 144, 226, 0.5)',
      '--pill-shadow-2': 'rgba(74, 144, 226, 0.7)'
    }
  }
]

const isWheelModalOpen = ref(false)
const isSpinning = ref(false)
const currentRotation = ref(0)
const pointerRotation = ref(0)
const winner = ref<Case | null>(null)
const hasSpunOnce = ref(false)

const openWheelModal = () => {
  isWheelModalOpen.value = true
  hasSpunOnce.value = false
}

const closeWheelModal = () => {
  if (isSpinning.value) return // Don't close while spinning
  isWheelModalOpen.value = false
  winner.value = null
  currentRotation.value = 0
  hasSpunOnce.value = false
}

const acceptWinner = () => {
  if (winner.value) {
    store.setFromWheel(winner.value, props.cases)
  }
  winner.value = null
  closeWheelModal()
  emit('accepted')
}

const respin = () => {
  winner.value = null
  spinWheel()
}

function customWheelEase(x: number): number {
  // Очень быстро первые 20% времени, и супер медленно остальные 80%
  // Для этого используем комбинацию медленно затухающей экспоненты
  return 1 - Math.exp(-5 * x) * (1 - x);
}

const spinWheel = () => {
  if (isSpinning.value || props.cases.length === 0) return

  isSpinning.value = true
  hasSpunOnce.value = true
  winner.value = null

  const winnerIndex = Math.floor(Math.random() * props.cases.length)
  const anglePerItem = 360 / props.cases.length

  const baseSpins = 8 * 360 // Увеличим кол-во оборотов (из-за очень медленной фазы)
  // Небольшой случайный сдвиг от точного центра сектора, чтобы стрелка не смотрела всегда в одну точку (от -25% до +25% ширины сектора)
  const randomOffset = (Math.random() - 0.5) * 0.5 * anglePerItem
  const targetOffset = 360 - (winnerIndex * anglePerItem + anglePerItem / 2 + randomOffset)
  const startAngle = currentRotation.value
  const targetAngle = startAngle + baseSpins + targetOffset + (360 - (startAngle % 360))

  const duration = 7000 // Растянем анимацию до 7 секунд
  const startTime = performance.now()

  let currentPointerRot = 0;
  let pointerVelocity = 0;
  const catchAngle = Math.min(7, anglePerItem * 0.8);
  const maxRotation = 35;
  let lastPeg = Math.floor(startAngle / anglePerItem);

  const animate = (time: DOMHighResTimeStamp) => {
    let elapsed = time - startTime
    if (elapsed > duration) elapsed = duration

    const progress = elapsed / duration
    const ease = customWheelEase(progress)
    const currentAngle = startAngle + (targetAngle - startAngle) * ease

    currentRotation.value = currentAngle

    // Физика стрелочки: гвоздики толкают её механически
    const currentPeg = Math.floor(currentAngle / anglePerItem)
    const d = anglePerItem - (currentAngle % anglePerItem);
    let pegPush = 0;

    if (d <= catchAngle) {
      pegPush = maxRotation * (1 - d / catchAngle);
    }

    if (currentPeg !== lastPeg) {
      // При быстром вращении мы можем "перепрыгнуть" зону catchAngle.
      // Если мы точно пересекли гвоздик в этот кадр, откидываем стрелку на максимум.
      currentPointerRot = maxRotation;
      pointerVelocity = 0;
      lastPeg = currentPeg;
    } else if (pegPush > currentPointerRot) {
      // Если колесо крутится медленно, гвоздик плавно надавливает на стрелку
      currentPointerRot = pegPush;
      pointerVelocity = 0;
    } else {
      // Пружинный возврат: стрелка стремится вернуться в 0
      const stiffness = 0.5;
      const damping = 0.4;

      const force = -stiffness * currentPointerRot;
      pointerVelocity += force;
      pointerVelocity *= damping;
      currentPointerRot += pointerVelocity;
    }

    pointerRotation.value = currentPointerRot;

    if (elapsed < duration) {
      requestAnimationFrame(animate)
    } else {
      isSpinning.value = false
      winner.value = props.cases[winnerIndex] || null
      pointerRotation.value = 0
    }
  }

  requestAnimationFrame(animate)
}

const getPegWrapperStyle = (index: number) => {
  const anglePerItem = 360 / props.cases.length
  return {
    transform: `rotate(${index * anglePerItem}deg)`,
  }
}

const getSectorStyle = (index: number) => {
  const anglePerItem = 360 / props.cases.length
  const startAngle = index * anglePerItem

  // Более насыщенные и яркие цвета
  const vibrantColors = [
    '#e63946', // Яркий красный
    '#2a9d8f', // Изумрудный
    '#4361ee', // Насыщенный синий
  ]

  const isEven = props.cases.length % 2 === 0
  const colors = isEven ? [vibrantColors[0], vibrantColors[1]] : vibrantColors

  let color = colors[index % colors.length]

  // Чтобы первый и последний сектор не сливались, если круг замкнулся на том же цвете
  if (index === props.cases.length - 1 && color === colors[0]) {
    color = colors[(index + 1) % colors.length]
  }

  return {
    background: `conic-gradient(from ${startAngle}deg, ${color} 0deg, ${color} ${anglePerItem}deg, transparent ${anglePerItem}deg)`,
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: '50%'
  } as any
}

const getTextStyle = (index: number) => {
  const anglePerItem = 360 / props.cases.length
  // Вычитаем 90 градусов, потому что текст изначально рисуется вправо (на 3 часа), а 0deg для фона — это верх (12 часов)
  const rotation = index * anglePerItem + anglePerItem / 2 - 90
  return {
    transform: `rotate(${rotation}deg)`
  }
}
</script>

<style scoped>
.wheel-view {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.cases-list-section {
  padding: 24px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  position: relative;
}

.list-title {
  margin-top: 0;
  margin-bottom: 20px;
  text-align: center;
  font-size: 1.5rem;
}

.cases-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  margin-bottom: 20px;
}

.controls-main {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.open-wheel-btn {
  padding: 14px 36px;
  font-size: 1.2rem;
  border-radius: 8px;
  background-color: #9C27B0;
  color: white;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.open-wheel-btn:hover {
  background-color: #7B1FA2;
  transform: translateY(-2px);
}

.wheel-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wheel-modal-layout {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  max-width: 500px;
  gap: 20px;
}

/* Winner card — above wheel, doesn't push wheel down */
.winner-top-area {
  width: 100%;
  display: flex;
  justify-content: center;
  min-height: 0;
}

.winner-top-block {
  display: flex;
  justify-content: center;
}

/* Wheel card — always centered with absolute positioning */
.wheel-center-area {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  max-width: 500px;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

/* Bottom buttons */
.wheel-bottom-area {
  position: absolute;
  bottom: 70px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

/* Top winner area positioned above center */
.winner-top-area {
  position: absolute;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 500px;
  display: flex;
  justify-content: center;
}



.wheel-panel {
  background: var(--bg-secondary);
  padding: 30px;
  padding-top: 50px;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  width: 100%;
  position: relative;
  pointer-events: all;
}

.actions-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(15px);
}

.btn-pop-enter-active,
.btn-pop-leave-active {
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.btn-pop-enter-from,
.btn-pop-leave-to {
  opacity: 0;
  transform: scale(0.3) rotate(-90deg);
}

.wheel-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
}

.wheel-wrapper {
  position: relative;
  width: 100%;
  max-width: 400px;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  border: 4px solid var(--border-color, #333);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
  container-type: inline-size;
}

.wheel-pointer {
  position: absolute;
  top: -44px;
  /* Изначально находится выше */
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  font-size: clamp(2rem, 8cqw, 3.5rem);
  color: #fff;
  text-shadow: 0 4px 6px rgba(0, 0, 0, 0.6), 0 -2px 0 #111, 0 2px 0 #111, -2px 0 0 #111, 2px 0 0 #111;
  line-height: 1;
  transform-origin: top center;
  transition: top 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.25);
  /* убрали transition для transform, так как теперь он 100% управляется физикой в JS */
}

.wheel-pointer.engaged {
  top: -28px;
  /* Плавно опускается вниз к гвоздикам */
}

.wheel-bounding-box {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 50%;
  /* overflow: hidden removed to allow pegs on the edge to be visible */
}

.wheel {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 50%;
  /* CSS transition is removed here because JS requestAnimationFrame is now animating perfectly smoothly */
}

.wheel-peg-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.wheel-peg {
  position: absolute;
  top: -2px;
  /* На самой окружности (краю колеса) */
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  width: 12px;
  height: 12px;
  background: #fdfdfd;
  border-radius: 50%;
  border: 2px solid #222;
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 2px 4px rgba(0, 0, 0, 0.6);
  z-index: 10;
}

.wheel-text-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-origin: center center;
}

.wheel-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateY(-50%);
  margin-left: 12.5%;
  /* Отступ от центра */
  width: 32.5%;
  /* Ширина текста */
  transform-origin: left center;
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.9);
  font-size: clamp(8px, 3cqw, 14px);
  line-height: 1.25;
  text-align: right;
  /* Прижать к дальнему широкому краю сектора */
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-wrap: break-word;
}

.center-spin-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
}

.center-spin-btn {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #444, #1a1a1a);
  color: white;
  font-weight: 800;
  border: 4px solid var(--border-color, #333);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.6), inset 0 2px 5px rgba(255, 255, 255, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
  overflow: hidden;
}

.center-spin-btn:not(.minimized):hover {
  transform: scale(1.1);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.7), inset 0 2px 8px rgba(255, 255, 255, 0.3);
  background: radial-gradient(circle at 30% 30%, #555, #2a2a2a);
}

.center-spin-btn:not(.minimized):active {
  transform: scale(0.95);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.6), inset 0 1px 3px rgba(255, 255, 255, 0.2);
}

.center-spin-btn.minimized {
  width: 36px;
  height: 36px;
  border-width: 3px;
  background: radial-gradient(circle at 30% 30%, #3a3a3a, #111);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.8), inset 0 2px 4px rgba(255, 255, 255, 0.3);
  cursor: default;
}

.center-spin-btn:disabled:not(.minimized) {
  background: radial-gradient(circle at 30% 30%, #444, #222);
  color: #777;
  cursor: not-allowed;
  transform: scale(1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
}

.spin-text {
  transition: opacity 0.2s ease, transform 0.3s ease;
  white-space: nowrap;
}

.spin-text.fade-out {
  opacity: 0;
  transform: scale(0.1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.winner-top-block {
  animation: fadeIn 0.5s ease-out;
}

.winner-card-wrapper {
  transform: scale(1.2);
}
</style>
