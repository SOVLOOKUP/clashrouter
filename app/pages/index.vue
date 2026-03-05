<template>
  <div class="space-y-8">
    <!-- Welcome Section -->
    <div class="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-8">
      <h1 class="text-4xl font-bold mb-2">
        ClashRouter 仪表盘
      </h1>
      <p class="text-slate-400">
        实时监控和管理您的 Clash 订阅系统
      </p>
    </div>

    <!-- System Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        class="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-slate-200">
            机场
          </h3>
          <svg
            class="w-8 h-8 text-blue-400"
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
        <div class="space-y-3">
          <div class="text-3xl font-bold text-white">
            {{ airportCount }}
          </div>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-400">✅ 正常</span>
              <span class="text-green-400 font-semibold">{{ activeAirportCount }}</span>
            </div>
            <div
              v-if="errorAirportCount > 0"
              class="flex justify-between"
            >
              <span class="text-slate-400">❌ 错误</span>
              <span class="text-red-400 font-semibold">{{ errorAirportCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        class="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-orange-500/50 transition"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-slate-200">
            订阅
          </h3>
          <svg
            class="w-8 h-8 text-orange-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        </div>
        <div class="text-3xl font-bold">
          {{ subscriptionCount }}
        </div>
        <p class="text-sm text-slate-400 mt-3">
          订阅总数
        </p>
      </div>
    </div>

    <!-- Status Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Airport Status -->
      <div class="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
        <h3 class="text-xl font-semibold mb-4 text-white flex items-center gap-2">
          <svg
            class="w-5 h-5 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          机场状态
        </h3>
        <div class="space-y-3 max-h-48 overflow-y-auto">
          <div
            v-if="airportStore.airports.length === 0"
            class="text-slate-400 text-sm"
          >
            暂无机场配置
          </div>
          <div
            v-for="airport in airportStore.airports"
            :key="airport.id"
            class="flex items-center justify-between p-2 rounded-lg bg-slate-700/30 border border-slate-600/50"
          >
            <div class="flex-1">
              <p class="font-medium text-white">
                {{ airport.name }}
              </p>
              <p class="text-xs text-slate-400">
                {{ airport.nodeCount || 0 }} 节点
              </p>
            </div>
            <span
              :class="{
                'bg-green-500/20 text-green-400': airport.status === 'active',
                'bg-red-500/20 text-red-400': airport.status !== 'active'
              }"
              class="px-2 py-1 rounded text-xs font-medium"
            >
              {{ airport.status }}
            </span>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
        <h3 class="text-xl font-semibold mb-4 text-white flex items-center gap-2">
          <svg
            class="w-5 h-5 text-green-400"
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
          快速操作
        </h3>
        <div class="grid grid-cols-2 gap-2">
          <NuxtLink
            to="/airports"
            class="group bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg p-4 transition"
          >
            <svg
              class="w-5 h-5 mb-2 text-blue-100"
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
            <p class="font-semibold text-sm">机场管理</p>
            <p class="text-xs text-blue-100 opacity-75">配置和管理</p>
          </NuxtLink>

          <NuxtLink
            to="/subscriptions"
            class="group bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 rounded-lg p-4 transition"
          >
            <svg
              class="w-5 h-5 mb-2 text-orange-100"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <p class="font-semibold text-sm">订阅转换</p>
            <p class="text-xs text-orange-100 opacity-75">管理订阅</p>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>

  <!-- 系统操作 -->
</template>

<script setup lang="ts">
import { useAirportStore } from '~/stores/airport'
import { useSubscriptionStore } from '~/stores/subscription'

const airportStore = useAirportStore()
const subscriptionStore = useSubscriptionStore()

const airportCount = computed(() => airportStore.airports.length)
const activeAirportCount = computed(() => airportStore.activeAirports.length)
const errorAirportCount = computed(() => airportStore.errorAirports.length)

const subscriptionCount = computed(() => subscriptionStore.subscriptions.length)

// 加载数据
onMounted(async () => {
  await Promise.all([
    airportStore.fetchAirports(),
    subscriptionStore.fetchSubscriptions()
  ])
})
</script>
