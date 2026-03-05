<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'zh-CN'
  }
})

const title = 'ClashRouter - 订阅管理系统'
const description = '一个基于 Nuxt 和 Elysia 的 Clash 订阅管理系统，支持机场管理和订阅转换。'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description
})

const menu = [
  { label: '首页', to: '/' },
  { label: '机场管理', to: '/airports' },
  { label: '订阅转换', to: '/subscriptions' }
]

const currentRoute = useRoute()
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
    <!-- Header -->
    <header class="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between mb-4">
          <NuxtLink
            to="/"
            class="flex items-center gap-3 hover:opacity-80 transition"
          >
            <div
              class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span class="font-bold text-xl">ClashRouter</span>
          </NuxtLink>
          <p class="text-xs text-slate-400">
            Clash 订阅管理系统
          </p>
        </div>

        <!-- Navigation -->
        <nav class="flex gap-1 flex-wrap">
          <NuxtLink
            v-for="item in menu"
            :key="item.to"
            :to="item.to"
            :class="{
              'bg-blue-600 hover:bg-blue-700': currentRoute.path === item.to,
              'text-slate-300 hover:text-white': currentRoute.path !== item.to
            }"
            class="px-4 py-2 rounded-lg transition text-sm font-medium"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <NuxtPage />
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-700 bg-slate-900/50 mt-12 py-6">
      <div class="container mx-auto px-4 text-center text-slate-400 text-sm">
        <p>ClashRouter © {{ new Date().getFullYear() }} · Powered by Nuxt + Elysia + SQLite</p>
      </div>
    </footer>
  </div>
</template>
