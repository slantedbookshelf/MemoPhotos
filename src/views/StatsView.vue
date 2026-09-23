<script setup>
import { computed } from 'vue'
import { PhCamera as Camera, PhSparkle as Sparkle, PhBookmarkSimple as BookmarkSimple, PhTrendUp as TrendUp } from '@phosphor-icons/vue'
import { useLibraryStore } from '../stores/library'

const store = useLibraryStore()
const themeCounts = computed(() => {
  const counts = store.entries.reduce((map, entry) => ({ ...map, [entry.theme]: (map[entry.theme] || 0) + 1 }), {})
  return Object.entries(counts).sort((a, b) => b[1] - a[1])
})
const maxTheme = computed(() => Math.max(1, ...themeCounts.value.map(([, count]) => count)))
const months = computed(() => {
  const formatter = new Intl.DateTimeFormat('zh-CN', { month: 'short' })
  const now = new Date()
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
    const count = store.entries.filter((entry) => {
      const taken = new Date(entry.takenAt)
      return taken.getFullYear() === date.getFullYear() && taken.getMonth() === date.getMonth()
    }).length
    return { label: formatter.format(date), count }
  })
})
const maxMonth = computed(() => Math.max(1, ...months.value.map((item) => item.count)))
const latestReview = computed(() => store.reviews[0])
</script>

<template>
  <div class="page stats-page">
    <header class="simple-page-header"><p class="eyebrow">成长轨迹</p><h1>你的眼睛，正在形成习惯。</h1><p>数据不是成绩单，它只是帮你看清最近在拍什么。</p></header>

    <section class="metric-strip">
      <div><Camera :size="24" /><strong>{{ store.entries.length }}</strong><span>累计作品</span></div>
      <div><Sparkle :size="24" /><strong>{{ store.reviewedCount }}</strong><span>完成复盘</span></div>
      <div><BookmarkSimple :size="24" /><strong>{{ store.favoriteCount }}</strong><span>待拍任务</span></div>
      <div><TrendUp :size="24" /><strong>{{ themeCounts[0]?.[0] || '等待记录' }}</strong><span>最常拍主题</span></div>
    </section>

    <div class="stats-layout">
      <section class="chart-panel">
        <h2>最近六个月</h2>
        <div class="column-chart" aria-label="最近六个月拍摄数量柱状图">
          <div v-for="item in months" :key="item.label" class="chart-column"><span>{{ item.count }}</span><div :style="{ height: `${Math.max(6, item.count / maxMonth * 100)}%` }"></div><small>{{ item.label }}</small></div>
        </div>
      </section>

      <section class="theme-panel">
        <h2>主题分布</h2>
        <div v-if="themeCounts.length" class="theme-cloud">
          <div v-for="([name, count], index) in themeCounts" :key="name" :class="`size-${Math.min(3, Math.ceil(count / maxTheme * 3))}`"><span>{{ name }}</span><strong>{{ count }}</strong></div>
        </div>
        <p v-else>记录作品后，这里会出现你的拍摄主题。</p>
      </section>

      <section class="growth-note">
        <div><span>最近的复盘提示</span><h2>{{ latestReview ? latestReview.suggestions[0] : '先完成一次 AI 点评' }}</h2></div>
        <RouterLink v-if="latestReview" class="text-link" :to="`/entry/${latestReview.entryId}`">回看这张作品</RouterLink>
        <RouterLink v-else class="text-link" to="/">选择一张作品</RouterLink>
      </section>
    </div>
  </div>
</template>
