<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { PhHouse as House, PhLightbulb as Lightbulb, PhPlus as Plus, PhChartDonut as ChartDonut, PhSlidersHorizontal as SlidersHorizontal, PhList as List, PhX as X } from '@phosphor-icons/vue'
import { useLibraryStore } from './stores/library'

const store = useLibraryStore()
const route = useRoute()
const menuOpen = ref(false)

const navItems = [
  { to: '/', label: '作品档案', icon: House },
  { to: '/inspire', label: '摄影灵感', icon: Lightbulb },
  { to: '/stats', label: '成长轨迹', icon: ChartDonut },
]

onMounted(() => store.initialize())
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <RouterLink class="brand" to="/" aria-label="MemoPhotos 首页">
        <span class="brand-mark">M</span>
        <span>MemoPhotos</span>
      </RouterLink>

      <nav class="desktop-nav" aria-label="主导航">
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" :class="{ active: route.path === item.to }">
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="topbar-actions">
        <RouterLink class="icon-button desktop-only" to="/settings" aria-label="设置"><SlidersHorizontal :size="20" /></RouterLink>
        <RouterLink class="button button-primary desktop-only" to="/entry/new"><Plus :size="18" weight="bold" />写日记</RouterLink>
        <button class="icon-button mobile-only" type="button" :aria-expanded="menuOpen" aria-label="打开菜单" @click="menuOpen = !menuOpen">
          <X v-if="menuOpen" :size="22" /><List v-else :size="22" />
        </button>
      </div>
    </header>

    <Transition name="fade">
      <nav v-if="menuOpen" class="mobile-menu" aria-label="移动端导航">
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" @click="menuOpen = false">
          <component :is="item.icon" :size="20" />{{ item.label }}
        </RouterLink>
        <RouterLink to="/settings" @click="menuOpen = false"><SlidersHorizontal :size="20" />数据与设置</RouterLink>
      </nav>
    </Transition>

    <main>
      <div v-if="store.error" class="global-error">{{ store.error }}</div>
      <RouterView />
    </main>

    <RouterLink class="mobile-create" to="/entry/new" aria-label="写摄影日记"><Plus :size="24" weight="bold" /></RouterLink>
  </div>
</template>
