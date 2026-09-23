<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PhArrowLeft as ArrowLeft, PhSparkle as Sparkle, PhCheckCircle as CheckCircle, PhWarning as Warning, PhLightbulb as Lightbulb } from '@phosphor-icons/vue'
import { useLibraryStore } from '../stores/library'

const props = defineProps({ id: String })
const store = useLibraryStore()
const router = useRouter()
const running = ref(false)
const showConsent = ref(false)
const entry = computed(() => store.getEntry(props.id))
const review = computed(() => entry.value?.reviewId ? store.getReview(entry.value.reviewId) : null)

const labels = { composition: '构图', lighting: '光线', color: '色彩', subject: '主体表达', narrative: '画面叙事', technique: '技术完成度' }

async function runReview() {
  showConsent.value = false
  running.value = true
  await new Promise((resolve) => setTimeout(resolve, 1800))
  const base = entry.value.theme === '人像' ? 82 : entry.value.theme === '风景' ? 86 : 84
  const make = (score, comment) => ({ score, comment })
  const result = {
    id: `review-${crypto.randomUUID()}`, entryId: entry.value.id, imageUrl: entry.value.images[0],
    dimensions: {
      composition: make(base + 2, '主体位置明确，画面中的线条与空间关系建立了稳定的观看顺序。'),
      lighting: make(base + 4, '光线方向清楚，高光与暗部共同塑造了空间，没有破坏主要细节。'),
      color: make(base - 1, '整体色调统一，少量强调色能够有效引导视线。'),
      subject: make(base + 1, '主体辨识度良好，环境信息也参与了表达。'),
      narrative: make(base + 3, '画面留下了足够线索，让观者能够补完整个瞬间。'),
      technique: make(base, '曝光与清晰度完成稳定，局部层次仍有进一步精修空间。'),
    },
    strengths: ['视觉重心清晰', '光线服务于主题', '环境信息克制而有效'],
    weaknesses: ['边缘元素略显拥挤', '局部暗部层次可以更丰富'],
    suggestions: ['下次拍摄前先检查画面四角，主动移除无关元素', '尝试在相同场景减少三分之一档曝光并保留 RAW', '围绕同一主题补拍远景与细节，形成三张组照'],
    summary: '这张照片已经建立了明确的观看路径。下一步可以减少边缘干扰，并用组照补充更完整的叙事。',
    model: 'MemoPhotos Local Demo', createdAt: new Date().toISOString(),
  }
  await store.saveReview(result)
  running.value = false
}
</script>

<template>
  <div v-if="entry" class="page review-page">
    <button class="text-link" type="button" @click="router.back()"><ArrowLeft :size="18" />返回作品</button>
    <header class="review-page-header"><div><h1>摄影复盘</h1><p>从六个维度重新阅读《{{ entry.title }}》。</p></div><span v-if="review" class="plain-label">已保存到日记</span></header>

    <div class="review-workspace">
      <div class="review-photo"><img :src="entry.images[0]" :alt="entry.title" /></div>
      <section v-if="running" class="review-loading" aria-live="polite">
        <div class="scan-line"></div><Sparkle :size="32" /><h2>正在阅读画面</h2><p>分析构图、光线、色彩与叙事关系。</p>
      </section>
      <section v-else-if="!review" class="review-start">
        <Sparkle :size="36" weight="thin" /><h2>准备好换一个视角了吗？</h2><p>点评只会在你主动发起时运行。演示版本会在本地生成结构化结果，不会上传照片。</p><button class="button button-primary" type="button" @click="showConsent = true">开始六维点评</button>
      </section>
      <section v-else class="review-result">
        <div class="result-intro"><Sparkle :size="24" weight="fill" /><p>{{ review.summary }}</p></div>
        <div class="score-list">
          <div v-for="(item, key) in review.dimensions" :key="key" class="score-row"><strong>{{ item.score }}</strong><div><h3>{{ labels[key] }}</h3><p>{{ item.comment }}</p></div></div>
        </div>
      </section>
    </div>

    <section v-if="review" class="review-notes">
      <div><CheckCircle :size="24" /><h2>做得好的地方</h2><p v-for="item in review.strengths" :key="item">{{ item }}</p></div>
      <div><Warning :size="24" /><h2>可以再注意</h2><p v-for="item in review.weaknesses" :key="item">{{ item }}</p></div>
      <div class="suggestions"><Lightbulb :size="24" /><h2>下一次这样拍</h2><ol><li v-for="item in review.suggestions" :key="item">{{ item }}</li></ol></div>
    </section>

    <div v-if="review" class="review-footer"><span>由 {{ review.model }} 生成</span><button class="button button-secondary" type="button" @click="showConsent = true">重新点评</button></div>

    <Transition name="fade">
      <div v-if="showConsent" class="modal-backdrop" @click.self="showConsent = false">
        <section class="modal" role="dialog" aria-modal="true" aria-labelledby="review-confirm-title"><Sparkle :size="30" /><h2 id="review-confirm-title">发起一次新点评</h2><p>真实接入 AI 后，这一步会压缩照片并消耗模型额度。当前演示只在本地模拟。</p><div><button class="button button-secondary" type="button" @click="showConsent = false">取消</button><button class="button button-primary" type="button" @click="runReview">确认开始</button></div></section>
      </div>
    </Transition>
  </div>
</template>
