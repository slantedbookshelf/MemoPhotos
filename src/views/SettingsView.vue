<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { PhArrowLeft as ArrowLeft, PhDownloadSimple as DownloadSimple, PhUploadSimple as UploadSimple, PhShieldCheck as ShieldCheck, PhHardDrive as HardDrive, PhCheckCircle as CheckCircle } from '@phosphor-icons/vue'
import { db } from '../lib/db'
import { useLibraryStore } from '../stores/library'

const store = useLibraryStore()
const router = useRouter()
const message = ref('')
const importError = ref('')

async function exportData() {
  const payload = { version: 1, exportedAt: new Date().toISOString(), entries: await db.entries.toArray(), inspirations: await db.inspirations.toArray(), reviews: await db.reviews.toArray() }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `memophotos-backup-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
  message.value = '备份文件已导出。'
}

async function importData(event) {
  message.value = ''
  importError.value = ''
  const file = event.target.files[0]
  if (!file) return
  try {
    const payload = JSON.parse(await file.text())
    if (!Array.isArray(payload.entries) || !Array.isArray(payload.inspirations) || !Array.isArray(payload.reviews)) throw new Error('invalid')
    if (!window.confirm('导入会替换当前浏览器中的全部 MemoPhotos 数据，确定继续吗？')) return
    await db.transaction('rw', db.entries, db.inspirations, db.reviews, async () => {
      await Promise.all([db.entries.clear(), db.inspirations.clear(), db.reviews.clear()])
      await Promise.all([db.entries.bulkPut(payload.entries), db.inspirations.bulkPut(payload.inspirations), db.reviews.bulkPut(payload.reviews)])
    })
    await store.refresh()
    message.value = '数据已恢复。'
  } catch {
    importError.value = '无法读取这个备份文件，请确认它来自 MemoPhotos。'
  } finally {
    event.target.value = ''
  }
}
</script>

<template>
  <div class="page settings-page">
    <button class="text-link" type="button" @click="router.back()"><ArrowLeft :size="18" />返回</button>
    <header class="simple-page-header"><h1>数据与设置</h1><p>MemoPhotos 默认把日记、灵感状态和点评记录保存在当前浏览器。</p></header>
    <section class="settings-list">
      <div class="settings-row">
        <HardDrive :size="28" weight="thin" /><div><h2>本地数据</h2><p>当前有 {{ store.entries.length }} 篇日记和 {{ store.reviews.length }} 条点评记录。</p></div><button class="button button-secondary" type="button" @click="exportData"><DownloadSimple :size="18" />导出 JSON</button>
      </div>
      <div class="settings-row">
        <UploadSimple :size="28" weight="thin" /><div><h2>从备份恢复</h2><p>选择 MemoPhotos 导出的 JSON 文件。恢复前会再次确认。</p></div><label class="button button-secondary">选择备份<input type="file" accept="application/json" @change="importData" /></label>
      </div>
      <div class="settings-row passive">
        <ShieldCheck :size="28" weight="thin" /><div><h2>隐私说明</h2><p>当前演示不上传照片，也不会连接外部 AI。接入 OSS 与 Serverless 后，密钥仍只保存在服务端。</p></div>
      </div>
    </section>
    <p v-if="message" class="success-message"><CheckCircle :size="19" />{{ message }}</p>
    <p v-if="importError" class="field-error">{{ importError }}</p>
  </div>
</template>
