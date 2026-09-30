<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { PhMagnifyingGlass as MagnifyingGlass, PhFunnel as Funnel, PhArrowRight as ArrowRight, PhCamera as Camera, PhSparkle as Sparkle } from '@phosphor-icons/vue'
import { useLibraryStore } from '../stores/library'
import HeroCarousel from '../components/HeroCarousel.vue'
import PhotoCard from '../components/PhotoCard.vue'

const store = useLibraryStore()
const query = ref('')
const theme = ref('全部')
const reviewState = ref('全部')
const themes = ['全部', '街头', '风景', '人像', '建筑', '夜景', '光影']

const filtered = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  return store.entries.filter((entry) => {
    const matchesText = !keyword || [entry.title, entry.location.name, entry.theme, ...entry.tags].join(' ').toLowerCase().includes(keyword)
    const matchesTheme = theme.value === '全部' || entry.theme === theme.value
    const matchesReview = reviewState.value === '全部' || (reviewState.value === '已点评' ? entry.reviewId : !entry.reviewId)
    return matchesText && matchesTheme && matchesReview
  })
})

const featured = computed(() => filtered.value[0])
const rest = computed(() => filtered.value.slice(1))
</script>

<template>
  <div class="gallery-page">
    <HeroCarousel :entries="store.entries" />

    <div class="page gallery-content">
      <section class="gallery-overview" aria-label="摄影档案概览">
        <div>
          <p class="eyebrow">你的摄影成长档案</p>
          <h2>回看每一次按下快门的理由。</h2>
        </div>
        <div class="intro-summary">
          <div><strong>{{ store.entries.length }}</strong><span>篇日记</span></div>
          <div><strong>{{ store.reviewedCount }}</strong><span>次复盘</span></div>
          <div><strong>{{ store.favoriteCount }}</strong><span>个待拍灵感</span></div>
        </div>
      </section>

      <section class="filter-bar" aria-label="筛选作品">
      <label class="search-field">
        <MagnifyingGlass :size="19" />
        <input v-model="query" type="search" placeholder="搜索地点、标签或作品" />
      </label>
      <div class="filter-group">
        <Funnel :size="18" />
        <select v-model="theme" aria-label="按主题筛选">
          <option v-for="item in themes" :key="item">{{ item }}</option>
        </select>
        <select v-model="reviewState" aria-label="按点评状态筛选">
          <option>全部</option><option>已点评</option><option>未点评</option>
        </select>
      </div>
      </section>

      <div v-if="store.loading" class="gallery-grid loading-grid" aria-label="正在读取照片">
        <div v-for="n in 4" :key="n" class="skeleton"></div>
      </div>

      <section v-else-if="featured" class="archive-section">
      <div class="section-title-row">
        <h2>{{ query || theme !== '全部' || reviewState !== '全部' ? '筛选结果' : '最近记录' }}</h2>
        <span>{{ filtered.length }} 组作品</span>
      </div>
      <div class="gallery-grid">
        <PhotoCard :entry="featured" featured />
        <PhotoCard v-for="entry in rest" :key="entry.id" :entry="entry" />
      </div>
      </section>

      <section v-else class="empty-state">
      <Camera :size="42" weight="thin" />
      <h2>这里还没有符合条件的照片</h2>
      <p>换个筛选条件，或者写下第一篇摄影日记。</p>
      <RouterLink class="button button-primary" to="/entry/new">写摄影日记<ArrowRight :size="17" /></RouterLink>
      </section>

      <section class="inspiration-callout reveal">
      <div class="callout-icon"><Sparkle :size="28" /></div>
      <div>
        <h2>下一次，拍什么？</h2>
        <p>从一个具体任务开始，把犹豫变成出门的理由。</p>
      </div>
      <RouterLink class="text-link" to="/inspire">抽一张灵感<ArrowRight :size="18" /></RouterLink>
      </section>
    </div>
  </div>
</template>
