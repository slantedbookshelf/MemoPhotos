<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { PhArrowLeft as ArrowLeft, PhPencilSimple as PencilSimple, PhTrash as Trash, PhSparkle as Sparkle, PhMapPin as MapPin, PhCalendarBlank as CalendarBlank, PhCamera as Camera, PhAperture as Aperture } from '@phosphor-icons/vue'
import { useLibraryStore } from '../stores/library'

const props = defineProps({ id: String })
const store = useLibraryStore()
const router = useRouter()
const entry = computed(() => store.getEntry(props.id))
const review = computed(() => entry.value?.reviewId ? store.getReview(entry.value.reviewId) : null)

function formatDate(value) {
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

async function removeEntry() {
  if (!window.confirm(`确定删除《${entry.value.title}》吗？这项操作无法撤销。`)) return
  await store.deleteEntry(entry.value.id)
  router.push('/')
}
</script>

<template>
  <div v-if="entry" class="detail-page">
    <div class="detail-toolbar">
      <button class="text-link" type="button" @click="router.back()"><ArrowLeft :size="18" />返回档案</button>
      <div>
        <RouterLink class="button button-secondary" :to="`/entry/${entry.id}/edit`"><PencilSimple :size="17" />编辑</RouterLink>
        <button class="icon-button danger" type="button" aria-label="删除日记" @click="removeEntry"><Trash :size="19" /></button>
      </div>
    </div>

    <div class="detail-photo-wrap"><img :src="entry.images[0]" :alt="entry.title" /></div>

    <article class="detail-content">
      <header class="detail-header">
        <div>
          <span class="plain-label">{{ entry.theme }}</span>
          <h1>{{ entry.title }}</h1>
        </div>
        <div class="detail-meta">
          <span><CalendarBlank :size="18" />{{ formatDate(entry.takenAt) }}</span>
          <span><MapPin :size="18" />{{ entry.location.name }}</span>
        </div>
      </header>

      <div class="story-layout">
        <section class="story-copy">
          <h2>这张照片的故事</h2>
          <p>{{ entry.story }}</p>
          <div class="tag-list"><span v-for="tag in entry.tags" :key="tag"># {{ tag }}</span></div>
        </section>
        <aside class="exif-panel">
          <div><Camera :size="20" /><span>机身</span><strong>{{ entry.equipment.camera || '未记录' }}</strong></div>
          <div><Aperture :size="20" /><span>镜头</span><strong>{{ entry.equipment.lens || '未记录' }}</strong></div>
          <dl>
            <div><dt>焦距</dt><dd>{{ entry.equipment.focalLength || '-' }}</dd></div>
            <div><dt>光圈</dt><dd>{{ entry.equipment.aperture || '-' }}</dd></div>
            <div><dt>快门</dt><dd>{{ entry.equipment.shutterSpeed || '-' }}</dd></div>
            <div><dt>ISO</dt><dd>{{ entry.equipment.iso || '-' }}</dd></div>
          </dl>
        </aside>
      </div>

      <section v-if="review" class="review-summary">
        <div class="review-heading"><Sparkle :size="25" weight="fill" /><div><h2>AI 摄影复盘</h2><p>{{ review.summary }}</p></div></div>
        <div class="dimension-grid">
          <div v-for="(item, key) in review.dimensions" :key="key" class="dimension-item">
            <strong>{{ item.score }}</strong><span>{{ ({composition:'构图',lighting:'光线',color:'色彩',subject:'主体表达',narrative:'画面叙事',technique:'技术完成度'})[key] }}</span><p>{{ item.comment }}</p>
          </div>
        </div>
        <RouterLink class="text-link" :to="`/review/${entry.id}`">查看完整复盘<ArrowLeft class="rotate-180" :size="18" /></RouterLink>
      </section>
      <section v-else class="review-cta">
        <Sparkle :size="30" />
        <div><h2>换一个视角看作品</h2><p>从六个专业维度复盘这张照片，并获得下一次可执行的建议。</p></div>
        <RouterLink class="button button-primary" :to="`/review/${entry.id}`">开始 AI 点评</RouterLink>
      </section>
    </article>
  </div>
  <div v-else-if="!store.loading" class="empty-state page"><h1>没有找到这篇日记</h1><RouterLink class="button button-primary" to="/">返回作品档案</RouterLink></div>
</template>
