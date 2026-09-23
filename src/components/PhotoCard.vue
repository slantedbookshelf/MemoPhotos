<script setup>
import { RouterLink } from 'vue-router'
import { PhSparkle as Sparkle, PhMapPin as MapPin } from '@phosphor-icons/vue'

defineProps({
  entry: { type: Object, required: true },
  featured: { type: Boolean, default: false },
})

function formatDate(value) {
  return new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric' }).format(new Date(value))
}
</script>

<template>
  <article class="photo-card" :class="{ featured }">
    <RouterLink :to="`/entry/${entry.id}`" class="photo-link" :aria-label="`查看《${entry.title}》`">
      <div class="photo-frame">
        <img :src="entry.images[0]" :alt="entry.title" loading="lazy" />
        <span v-if="entry.reviewId" class="review-badge"><Sparkle :size="14" weight="fill" />已点评</span>
      </div>
      <div class="photo-card-copy">
        <div>
          <h3>{{ entry.title }}</h3>
          <p><MapPin :size="15" />{{ entry.location.name }}</p>
        </div>
        <time :datetime="entry.takenAt">{{ formatDate(entry.takenAt) }}</time>
      </div>
    </RouterLink>
  </article>
</template>
