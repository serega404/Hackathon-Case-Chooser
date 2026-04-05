<template>
  <div class="matrix-pills">
    <button
      v-for="pill in pills"
      :key="pill.id"
      class="choice-card"
      :style="pill.theme"
      @click="$emit(pill.event)"
    >
      <div :class="['morpheus-hand', `${pill.handClass}-hand`]">
        <img :src="pill.image" class="hand-img" :alt="`${pill.id} hand`" />
      </div>
      <div class="pill-base">
        <span class="pill-text">{{ pill.text }}</span>
        <div class="pill-glare"></div>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { type CSSProperties } from 'vue'

export interface PillConfig {
  id: string
  text: string
  image: string
  event: 'respin' | 'accept'
  handClass: 'left' | 'right'
  theme: CSSProperties
}

defineProps<{
  pills: PillConfig[]
}>()

type EmitEvents = {
  (e: 'respin' | 'accept'): void
}

defineEmits<EmitEvents>()
</script>

<style scoped>
.matrix-pills {
  display: flex;
  justify-content: center;
  gap: 100px; /* Expand gap for larger hands */
  margin-top: 40px;
}

.choice-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  background: transparent;
  border: none;
  padding: 10px 20px;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

/* Hand Container */
.morpheus-hand {
  position: absolute;
  top: -110px; /* Offset to align larger hand center with pill */
  left: 50%;
  margin-left: -150px;
  width: 300px;
  height: 300px;
  z-index: 1; /* Below the pill */
  pointer-events: none;
  opacity: 0;
  transform: translateY(30px) scale(0.85); /* Hand originates from below and slightly smaller */
  transition: opacity 0.4s ease-out, transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.25);
}

.hand-img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Now that bg is transparent, contain ensures safe aspect */
  transform: scaleX(-1); /* Отражаем руки по горизонтали */
  transition: filter 0.4s ease, transform 0.4s ease;
  filter: grayscale(1) brightness(var(--hand-brightness, 1));
}

/* Base Pill Shape */
.pill-base {
  position: relative;
  padding: 10px 32px;
  border-radius: 9999px;
  font-weight: 800;
  font-size: 1rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #fff;
  z-index: 2; /* Above the hand */
  box-shadow:
    0 12px 24px rgba(0,0,0,0.6),
    inset 0 -8px 12px rgba(0,0,0,0.5),
    inset 0 6px 12px rgba(255,255,255,0.5);
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 90px;
  
  /* Apply variations */
  background: var(--pill-bg, #444);
  border: 1px solid var(--pill-border, #222);
}

/* Vertical separating line for a true capsule look */
.pill-base::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 4px;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.2);
  box-shadow:
    -1px 0 2px rgba(0,0,0,0.4) inset,
    1px 0 2px rgba(255,255,255,0.3) inset;
  z-index: 1;
  border-left: 1px solid var(--pill-before, rgba(255,255,255,0.2));
}

/* 3D Capsule glare for realism */
.pill-glare {
  position: absolute;
  top: 2px;
  left: 10%;
  right: 10%;
  height: 35%;
  background: linear-gradient(to bottom, rgba(255,255,255,0.8), rgba(255,255,255,0));
  border-radius: 9999px;
  pointer-events: none;
  z-index: 2;
  filter: blur(1px);
}

/* Bottom specular highlight */
.pill-base::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 15%;
  right: 15%;
  height: 12%;
  background: rgba(255,255,255,0.3);
  border-radius: 9999px;
  filter: blur(3px);
  pointer-events: none;
  z-index: 2;
}

.pill-text {
  position: relative;
  z-index: 3;
  text-shadow: 0 2px 5px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.4);
}

/* --- Interactive Hovers & Clicks --- */

/* Parent card hover elevates pill */
.choice-card:hover .pill-base {
  transform: translateY(-12px) scale(1.08) rotate(-2deg);
  box-shadow:
    0 20px 40px var(--pill-shadow-1, rgba(0,0,0,0.5)),
    0 0 25px var(--pill-shadow-2, rgba(0,0,0,0.3)),
    inset 0 -8px 12px rgba(0,0,0,0.5),
    inset 0 6px 12px rgba(255,255,255,0.6);
}

.choice-card:active .pill-base {
  transform: translateY(0px) scale(0.96) rotate(0deg);
}

/* Hand majestically presents the pill */
.choice-card:hover .morpheus-hand {
  opacity: 1;
  transform: translateY(-5px) scale(1);
}

.choice-card:hover .hand-img {
  filter: grayscale(0) brightness(1.2) drop-shadow(0 0 15px var(--pill-shadow-color, rgba(255,255,255,0.5)));
}
</style>
