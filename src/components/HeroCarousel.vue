<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  PhArrowLeft as ArrowLeft,
  PhArrowRight as ArrowRight,
  PhMapPin as MapPin,
} from '@phosphor-icons/vue'

const props = defineProps({
  entries: {
    type: Array,
    default: () => [],
  },
})

const slides = computed(() => props.entries.slice(0, 5))
const activeIndex = ref(0)
const direction = ref(1)

let wheelTotal = 0
let wheelTimer
let wheelLockedUntil = 0
let touchStartX = 0

const activeSlide = computed(() => slides.value[activeIndex.value])

function selectSlide(index) {
  if (index === activeIndex.value || index < 0 || index >= slides.value.length) return
  direction.value = index > activeIndex.value ? 1 : -1
  activeIndex.value = index
}

function moveSlide(step) {
  const nextIndex = activeIndex.value + step
  if (nextIndex < 0 || nextIndex >= slides.value.length) return false
  selectSlide(nextIndex)
  return true
}

function handleWheel(event) {
  if (slides.value.length < 2) return

  const now = performance.now()
  const step = event.deltaY > 0 ? 1 : -1
  const atBoundary = (step > 0 && activeIndex.value === slides.value.length - 1)
    || (step < 0 && activeIndex.value === 0)

  if (atBoundary) {
    wheelTotal = 0
    return
  }

  event.preventDefault()
  if (now < wheelLockedUntil) return

  wheelTotal += event.deltaY
  window.clearTimeout(wheelTimer)
  wheelTimer = window.setTimeout(() => { wheelTotal = 0 }, 180)

  if (Math.abs(wheelTotal) < 28) return

  if (moveSlide(wheelTotal > 0 ? 1 : -1)) {
    wheelLockedUntil = now + 620
  }
  wheelTotal = 0
}

function handleKeydown(event) {
  const nextKeys = ['ArrowDown', 'ArrowRight', 'PageDown']
  const previousKeys = ['ArrowUp', 'ArrowLeft', 'PageUp']

  if (nextKeys.includes(event.key)) {
    event.preventDefault()
    moveSlide(1)
  } else if (previousKeys.includes(event.key)) {
    event.preventDefault()
    moveSlide(-1)
  } else if (event.key === 'Home') {
    event.preventDefault()
    selectSlide(0)
  } else if (event.key === 'End') {
    event.preventDefault()
    selectSlide(slides.value.length - 1)
  }
}

function handleTouchStart(event) {
  touchStartX = event.changedTouches[0]?.clientX ?? 0
}

function handleTouchEnd(event) {
  const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX
  const distance = touchEndX - touchStartX
  if (Math.abs(distance) > 48) moveSlide(distance < 0 ? 1 : -1)
}

onBeforeUnmount(() => window.clearTimeout(wheelTimer))
</script>

<template>
  <section
    v-if="activeSlide"
    class="hero-carousel"
    tabindex="0"
    aria-roledescription="轮播图"
    aria-label="精选摄影作品"
    @wheel="handleWheel"
    @keydown="handleKeydown"
    @touchstart.passive="handleTouchStart"
    @touchend.passive="handleTouchEnd"
  >
    <div class="hero-carousel__media" aria-live="polite">
      <img
        v-for="(slide, index) in slides"
        :key="slide.id"
        :class="{
          active: index === activeIndex,
          previous: index < activeIndex,
          next: index > activeIndex,
        }"
        :src="slide.images[0]"
        :alt="`${slide.title}，${slide.location.name}`"
        :loading="index === 0 ? 'eager' : 'lazy'"
        :fetchpriority="index === 0 ? 'high' : 'auto'"
      />
    </div>
    <div class="hero-carousel__shade" aria-hidden="true" />

    <div class="hero-carousel__content">
      <p class="hero-carousel__eyebrow">{{ activeSlide.theme }}</p>
      <h1 :key="`title-${activeSlide.id}`">{{ activeSlide.title }}</h1>
      <p :key="`story-${activeSlide.id}`" class="hero-carousel__story">{{ activeSlide.story }}</p>
      <RouterLink class="hero-carousel__link" :to="`/entry/${activeSlide.id}`">
        查看这组作品<ArrowRight :size="18" />
      </RouterLink>
    </div>

    <div class="hero-carousel__meta">
      <MapPin :size="17" />
      <span>{{ activeSlide.location.name }}</span>
    </div>

    <div class="hero-carousel__navigation">
      <div class="hero-carousel__thumbs" role="tablist" aria-label="选择背景照片">
        <button
          v-for="(slide, index) in slides"
          :key="`thumb-${slide.id}`"
          type="button"
          role="tab"
          :aria-selected="index === activeIndex"
          :aria-label="`显示《${slide.title}》`"
          :class="{ active: index === activeIndex }"
          @click="selectSlide(index)"
        >
          <img :src="slide.images[0]" alt="" loading="eager" />
        </button>
      </div>

      <div class="hero-carousel__arrows">
        <button type="button" :disabled="activeIndex === 0" aria-label="上一张" @click="moveSlide(-1)">
          <ArrowLeft :size="18" />
        </button>
        <button type="button" :disabled="activeIndex === slides.length - 1" aria-label="下一张" @click="moveSlide(1)">
          <ArrowRight :size="18" />
        </button>
      </div>
    </div>
  </section>

  <section v-else class="hero-carousel hero-carousel--loading" aria-label="正在载入精选作品">
    <div class="hero-carousel__loading-copy">
      <span />
      <span />
      <span />
    </div>
  </section>
</template>

