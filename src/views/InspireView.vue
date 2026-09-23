<script setup>
import { computed, ref } from 'vue'
import { PhShuffle as Shuffle, PhBookmarkSimple as BookmarkSimple, PhCheckCircle as CheckCircle, PhAperture as Aperture, PhArrowRight as ArrowRight } from '@phosphor-icons/vue'
import { useLibraryStore } from '../stores/library'

const store = useLibraryStore()
const category = ref('全部')
const currentId = ref('street-02')
const categories = ['全部', '街头', '风景', '人像', '建筑', '夜景', '光影']

const pool = computed(() => store.inspirations.filter((item) => (category.value === '全部' || item.category === category.value) && item.status !== '已完成'))
const current = computed(() => store.inspirations.find((item) => item.id === currentId.value) || pool.value[0])
const saved = computed(() => store.inspirations.filter((item) => item.status !== '未拍'))

function draw() {
  const candidates = pool.value.filter((item) => item.id !== current.value?.id)
  const choices = candidates.length ? candidates : pool.value
  if (choices.length) currentId.value = choices[Math.floor(Math.random() * choices.length)].id
}

function chooseCategory(value) {
  category.value = value
  const first = pool.value[Math.floor(Math.random() * pool.value.length)]
  if (first) currentId.value = first.id
}

function difficultyLabel(value) {
  return ['入门', '轻松', '进阶', '挑战', '困难'][value - 1]
}
</script>

<template>
  <div class="page inspire-page">
    <header class="inspire-header">
      <div><p class="eyebrow">今天拍什么</p><h1>给眼睛一个任务。</h1><p>选一个方向，然后带着明确的问题走出去。</p></div>
      <button class="button button-primary" type="button" @click="draw"><Shuffle :size="19" weight="bold" />换一个灵感</button>
    </header>

    <div class="category-tabs" role="tablist" aria-label="灵感分类">
      <button v-for="item in categories" :key="item" type="button" :class="{ active: category === item }" @click="chooseCategory(item)">{{ item }}</button>
    </div>

    <section v-if="current" class="inspiration-card" aria-live="polite">
      <div class="inspiration-main">
        <div class="card-topline"><span>{{ current.category }}</span><span>难度 {{ current.difficulty }} / 5 · {{ difficultyLabel(current.difficulty) }}</span></div>
        <h2>{{ current.task }}</h2>
        <div class="inspiration-details">
          <div><span>建议风格</span><strong>{{ current.style }}</strong></div>
          <div><span>构图方向</span><strong>{{ current.composition }}</strong></div>
        </div>
      </div>
      <div class="challenge-block"><Aperture :size="30" weight="thin" /><span>额外挑战</span><p>{{ current.challenge }}</p></div>
      <div class="inspiration-actions">
        <button class="button button-secondary" type="button" :class="{ selected: current.status === '想拍' }" @click="store.setInspirationStatus(current.id, current.status === '想拍' ? '未拍' : '想拍')"><BookmarkSimple :size="18" :weight="current.status === '想拍' ? 'fill' : 'regular'" />{{ current.status === '想拍' ? '已加入待拍' : '加入待拍' }}</button>
        <button class="button button-dark" type="button" @click="store.setInspirationStatus(current.id, '已完成')"><CheckCircle :size="18" />标记完成</button>
      </div>
    </section>

    <section class="saved-inspirations">
      <div class="section-title-row"><h2>我的待拍清单</h2><span>{{ saved.length }} 个灵感</span></div>
      <div v-if="saved.length" class="saved-grid">
        <button v-for="item in saved" :key="item.id" class="saved-item" type="button" @click="currentId = item.id">
          <span>{{ item.category }}</span><strong>{{ item.task }}</strong><small>{{ item.status }}</small><ArrowRight :size="18" />
        </button>
      </div>
      <div v-else class="compact-empty"><BookmarkSimple :size="28" /><p>还没有待拍灵感。收藏一张卡片，给下次出门留个方向。</p></div>
    </section>
  </div>
</template>
