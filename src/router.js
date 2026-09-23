import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'gallery', component: () => import('./views/GalleryView.vue') },
  { path: '/entry/new', name: 'entry-new', component: () => import('./views/EntryFormView.vue') },
  { path: '/entry/:id', name: 'entry-detail', component: () => import('./views/EntryDetailView.vue'), props: true },
  { path: '/entry/:id/edit', name: 'entry-edit', component: () => import('./views/EntryFormView.vue'), props: true },
  { path: '/inspire', name: 'inspire', component: () => import('./views/InspireView.vue') },
  { path: '/review/:id', name: 'review', component: () => import('./views/ReviewView.vue'), props: true },
  { path: '/stats', name: 'stats', component: () => import('./views/StatsView.vue') },
  { path: '/settings', name: 'settings', component: () => import('./views/SettingsView.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

export default router
