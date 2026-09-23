import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { db } from '../lib/db'
import { sampleEntries, sampleInspirations, sampleReviews } from '../data/seed'

export const useLibraryStore = defineStore('library', () => {
  const entries = ref([])
  const inspirations = ref([])
  const reviews = ref([])
  const loading = ref(true)
  const error = ref('')

  const reviewedCount = computed(() => entries.value.filter((entry) => entry.reviewId).length)
  const favoriteCount = computed(() => inspirations.value.filter((item) => item.status === '想拍').length)

  async function initialize() {
    loading.value = true
    error.value = ''
    try {
      if ((await db.entries.count()) === 0) await db.entries.bulkAdd(sampleEntries)
      if ((await db.inspirations.count()) === 0) await db.inspirations.bulkAdd(sampleInspirations)
      if ((await db.reviews.count()) === 0) await db.reviews.bulkAdd(sampleReviews)
      await refresh()
    } catch (reason) {
      console.error(reason)
      error.value = '本地档案读取失败，请刷新后重试。'
    } finally {
      loading.value = false
    }
  }

  async function refresh() {
    const [entryRows, inspirationRows, reviewRows] = await Promise.all([
      db.entries.orderBy('takenAt').reverse().toArray(),
      db.inspirations.toArray(),
      db.reviews.orderBy('createdAt').reverse().toArray(),
    ])
    entries.value = entryRows
    inspirations.value = inspirationRows
    reviews.value = reviewRows
  }

  const getEntry = (id) => entries.value.find((entry) => entry.id === id)
  const getReview = (id) => reviews.value.find((review) => review.id === id)

  async function saveEntry(entry) {
    await db.entries.put(entry)
    await refresh()
  }

  async function deleteEntry(id) {
    const entry = await db.entries.get(id)
    if (entry?.reviewId) await db.reviews.delete(entry.reviewId)
    await db.entries.delete(id)
    await refresh()
  }

  async function setInspirationStatus(id, status) {
    await db.inspirations.update(id, { status })
    await refresh()
  }

  async function saveReview(review) {
    await db.transaction('rw', db.reviews, db.entries, async () => {
      await db.reviews.put(review)
      await db.entries.update(review.entryId, { reviewId: review.id, updatedAt: new Date().toISOString() })
    })
    await refresh()
  }

  return {
    entries, inspirations, reviews, loading, error, reviewedCount, favoriteCount,
    initialize, refresh, getEntry, getReview, saveEntry, deleteEntry, setInspirationStatus, saveReview,
  }
})
