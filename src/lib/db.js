import Dexie from 'dexie'

export const db = new Dexie('MemoPhotos')

db.version(1).stores({
  entries: '&id, takenAt, theme, *tags, reviewId, createdAt',
  inspirations: '&id, category, status, createdAt',
  reviews: '&id, entryId, createdAt',
})

db.version(2).stores({
  entries: '&id, takenAt, theme, *tags, reviewId, createdAt',
  inspirations: '&id, category, status, createdAt',
  reviews: '&id, entryId, createdAt',
}).upgrade(async (transaction) => {
  await transaction.table('entries').toCollection().modify((entry) => {
    entry.images = entry.images.map((image) => image.replace(/\.png$/, '.webp'))
  })
  await transaction.table('reviews').toCollection().modify((review) => {
    review.imageUrl = review.imageUrl.replace(/\.png$/, '.webp')
  })
})
