<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { PhArrowLeft as ArrowLeft, PhUploadSimple as UploadSimple, PhX as X, PhCheck as Check } from '@phosphor-icons/vue'
import { useLibraryStore } from '../stores/library'

const props = defineProps({ id: String })
const store = useLibraryStore()
const router = useRouter()
const saving = ref(false)
const imageError = ref('')
const isEditing = computed(() => Boolean(props.id))

const form = reactive({
  title: '', images: [], takenAt: '', locationName: '', camera: '', lens: '', focalLength: '', aperture: '', shutterSpeed: '', iso: '', theme: '街头', tags: '', story: '',
})

function hydrateForm() {
  if (!props.id) return
  const entry = store.getEntry(props.id)
  if (!entry) return
  Object.assign(form, {
    title: entry.title, images: [...entry.images], takenAt: entry.takenAt, locationName: entry.location.name,
    camera: entry.equipment.camera, lens: entry.equipment.lens, focalLength: entry.equipment.focalLength,
    aperture: entry.equipment.aperture, shutterSpeed: entry.equipment.shutterSpeed, iso: entry.equipment.iso,
    theme: entry.theme, tags: entry.tags.join(', '), story: entry.story,
  })
}

watch(() => store.entries, hydrateForm, { immediate: true })

function handleFiles(event) {
  imageError.value = ''
  const files = [...event.target.files]
  if (!files.length) return
  if (files.some((file) => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))) {
    imageError.value = '请选择 JPG、PNG 或 WebP 图片。'
    return
  }
  if (files.some((file) => file.size > 20 * 1024 * 1024)) {
    imageError.value = '单张照片不能超过 20MB。'
    return
  }
  files.slice(0, 6 - form.images.length).forEach((file) => {
    const reader = new FileReader()
    reader.onload = () => form.images.push(reader.result)
    reader.readAsDataURL(file)
  })
  event.target.value = ''
}

async function submit() {
  if (!form.images.length) {
    imageError.value = '请至少选择一张照片。'
    return
  }
  saving.value = true
  const now = new Date().toISOString()
  const existing = props.id ? store.getEntry(props.id) : null
  const entry = {
    id: existing?.id || crypto.randomUUID(),
    title: form.title.trim(),
    images: [...form.images],
    takenAt: form.takenAt,
    location: { name: form.locationName.trim(), coords: existing?.location?.coords || null },
    equipment: { camera: form.camera.trim(), lens: form.lens.trim(), focalLength: form.focalLength.trim(), aperture: form.aperture.trim(), shutterSpeed: form.shutterSpeed.trim(), iso: form.iso.trim() },
    theme: form.theme,
    tags: form.tags.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean),
    story: form.story.trim(),
    reviewId: existing?.reviewId || null,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  }
  await store.saveEntry(entry)
  saving.value = false
  router.push(`/entry/${entry.id}`)
}
</script>

<template>
  <div class="form-page page">
    <button class="text-link" type="button" @click="router.back()"><ArrowLeft :size="18" />返回</button>
    <header class="form-header"><h1>{{ isEditing ? '编辑摄影日记' : '写一篇摄影日记' }}</h1><p>把参数记下来，也把当时为什么按下快门写下来。</p></header>

    <form class="entry-form" @submit.prevent="submit">
      <section class="form-section upload-section">
        <div class="section-heading"><span>照片</span><small>最多 6 张，单张不超过 20MB</small></div>
        <div v-if="form.images.length" class="upload-previews">
          <div v-for="(image, index) in form.images" :key="`${image.slice(0, 30)}-${index}`" class="upload-preview">
            <img :src="image" alt="待保存照片预览" />
            <button type="button" aria-label="移除照片" @click="form.images.splice(index, 1)"><X :size="17" /></button>
          </div>
          <label v-if="form.images.length < 6" class="upload-more"><UploadSimple :size="25" /><span>继续添加</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple @change="handleFiles" /></label>
        </div>
        <label v-else class="upload-dropzone">
          <UploadSimple :size="34" weight="thin" />
          <strong>选择你的照片</strong>
          <span>当前版本会安全地保存在此浏览器中</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple @change="handleFiles" />
        </label>
        <p v-if="imageError" class="field-error">{{ imageError }}</p>
      </section>

      <section class="form-section">
        <div class="section-heading"><span>拍摄信息</span><small>带 * 为必填</small></div>
        <div class="form-grid">
          <label class="span-2">作品标题 *<input v-model="form.title" required maxlength="50" placeholder="给这次拍摄起个名字" /></label>
          <label>拍摄时间 *<input v-model="form.takenAt" required type="datetime-local" /></label>
          <label>拍摄地点 *<input v-model="form.locationName" required placeholder="城市或具体地点" /></label>
          <label>摄影主题<select v-model="form.theme"><option v-for="item in ['街头','风景','人像','建筑','夜景','光影','其他']" :key="item">{{ item }}</option></select></label>
          <label>标签<input v-model="form.tags" placeholder="雨后, 城市, 清晨" /></label>
        </div>
      </section>

      <section class="form-section">
        <div class="section-heading"><span>器材与参数</span><small>选填</small></div>
        <div class="form-grid equipment-grid">
          <label>相机机身<input v-model="form.camera" placeholder="Fujifilm X-T5" /></label>
          <label>镜头<input v-model="form.lens" placeholder="XF 23mm F2" /></label>
          <label>焦距<input v-model="form.focalLength" placeholder="23mm" /></label>
          <label>光圈<input v-model="form.aperture" placeholder="f/5.6" /></label>
          <label>快门速度<input v-model="form.shutterSpeed" placeholder="1/250s" /></label>
          <label>ISO<input v-model="form.iso" placeholder="320" /></label>
        </div>
      </section>

      <section class="form-section">
        <div class="section-heading"><span>想法与故事</span><small>{{ form.story.length }} / 1000</small></div>
        <label class="sr-only" for="story">想法与故事</label>
        <textarea id="story" v-model="form.story" maxlength="1000" rows="7" placeholder="拍摄时发生了什么？你在等待怎样的瞬间？"></textarea>
      </section>

      <div class="form-actions">
        <button class="button button-secondary" type="button" @click="router.back()">取消</button>
        <button class="button button-primary" type="submit" :disabled="saving"><Check :size="18" weight="bold" />{{ saving ? '保存中' : '保存日记' }}</button>
      </div>
    </form>
  </div>
</template>
