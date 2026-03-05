<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        订阅转换
      </h1>
      <button
        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2"
        @click="showModal = true; editingSubscription = null; resetForm()"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        创建订阅
      </button>
    </div>

    <!-- Loading -->
    <div
      v-if="subscriptionStore.loading"
      class="flex justify-center py-12"
    >
      <div class="animate-spin">
        <svg
          class="w-8 h-8 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </div>
    </div>

    <!-- Subscriptions List -->
    <div
      v-else
      class="space-y-4"
    >
      <div
        v-for="subscription in subscriptionStore.subscriptions"
        :key="subscription.id"
        class="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-orange-500/50 transition"
      >
        <!-- Header -->
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-white">
              {{ subscription.name }}
            </h3>
            <p
              v-if="subscription.description"
              class="text-sm text-slate-400 mt-1"
            >
              {{ subscription.description }}
            </p>
          </div>
          <div class="flex gap-2">
            <button
              class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition"
              @click="handleEdit(subscription)"
            >
              编辑
            </button>
            <button
              class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition"
              @click="handleDelete(subscription.id)"
            >
              删除
            </button>
          </div>
        </div>

        <!-- Airports -->
        <div class="mb-4 pb-4 border-b border-slate-700">
          <h4 class="text-sm font-semibold text-slate-300 mb-2">
            包含机场 ({{ subscription.airports?.length || 0 }})
          </h4>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="airport in subscription.airports"
              :key="airport.id"
              class="bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-xs font-medium"
            >
              {{ airport.name }} ({{ airport.nodeCount || 0 }} 节点)
            </span>
          </div>
        </div>

        <!-- URLs -->
        <div class="space-y-3">
          <div>
            <label class="text-xs font-medium text-slate-400">Token</label>
            <div class="flex gap-2 mt-1">
              <code class="flex-1 bg-slate-700 text-slate-300 px-3 py-2 rounded text-xs break-all">
                {{ subscription.token }}
              </code>
              <button
                class="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded text-sm transition"
                @click="copyToClipboard(subscription.token)"
              >
                复制
              </button>
            </div>
          </div>

          <div>
            <label class="text-xs font-medium text-slate-400">Clash 订阅链接</label>
            <div class="flex gap-2 mt-1">
              <code class="flex-1 bg-slate-700 text-slate-300 px-3 py-2 rounded text-xs break-all">
                {{ getSubscriptionUrl(subscription.token, 'clash') }}
              </code>
              <button
                class="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded text-sm transition"
                @click="copyToClipboard(getSubscriptionUrl(subscription.token, 'clash'))"
              >
                复制
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!subscriptionStore.loading && subscriptionStore.subscriptions.length === 0"
      class="text-center py-12"
    >
      <p class="text-slate-400">
        没有创建任何订阅
      </p>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div class="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4 space-y-4">
        <h2 class="text-xl font-bold text-white">
          {{ editingSubscription ? '编辑订阅' : '创建订阅' }}
        </h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">订阅名称 *</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="请输入订阅名称"
              class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">订阅描述</label>
            <textarea
              v-model="form.description"
              placeholder="请输入订阅描述"
              rows="3"
              class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">选择机场 (至少选择一个)</label>
            <div class="bg-slate-700 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
              <label
                v-for="airport in availableAirports"
                :key="airport.id"
                class="flex items-center gap-2 text-sm text-slate-300"
              >
                <input
                  v-model="form.airportIds"
                  :value="airport.id"
                  type="checkbox"
                  class="rounded"
                >
                {{ airport.name }} ({{ airport.nodeCount || 0 }} 节点)
              </label>
            </div>
          </div>
        </div>

        <div class="flex gap-2 justify-end pt-4 border-t border-slate-700">
          <button
            class="px-4 py-2 rounded-lg text-slate-300 hover:text-white transition"
            @click="showModal = false"
          >
            取消
          </button>
          <button
            :disabled="submitting"
            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition"
            @click="handleSubmit"
          >
            {{ submitting ? '保存中...' : editingSubscription ? '保存' : '创建' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSubscriptionStore } from '~/stores/subscription'
import { useAirportStore } from '~/stores/airport'
import type { Subscription } from '~/types/api'

const subscriptionStore = useSubscriptionStore()
const airportStore = useAirportStore()

const showModal = ref(false)
const editingSubscription = ref<Subscription | null>(null)
const submitting = ref(false)
const form = ref({ name: '', description: '', airportIds: [] as string[] })

const availableAirports = computed(() => airportStore.airports)

onMounted(async () => {
  await subscriptionStore.fetchSubscriptions()
  await airportStore.fetchAirports()
})

function resetForm() {
  form.value = { name: '', description: '', airportIds: [] }
}

function handleEdit(subscription: Subscription) {
  editingSubscription.value = subscription
  form.value = {
    name: subscription.name,
    description: subscription.description || '',
    airportIds: subscription.airports?.map(airport => airport.id) || []
  }
  showModal.value = true
}

async function handleSubmit() {
  if (!form.value.name || form.value.airportIds.length === 0) {
    alert('请填写必填项')
    return
  }

  submitting.value = true
  try {
    if (editingSubscription.value) {
      await subscriptionStore.updateSubscription(editingSubscription.value.id, form.value)
    } else {
      await subscriptionStore.createSubscription(form.value)
    }
    showModal.value = false
    resetForm()
    await subscriptionStore.fetchSubscriptions()
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知错误'
    alert('操作失败: ' + message)
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id: string) {
  if (confirm('确定要删除此订阅吗？')) {
    try {
      await subscriptionStore.deleteSubscription(id)
      await subscriptionStore.fetchSubscriptions()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '未知错误'
      alert('删除失败: ' + message)
    }
  }
}

function getSubscriptionUrl(token: string, target: string = 'clash') {
  return `${window.location.origin}/_api/sub/${token}?target=${target}`
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
  alert('已复制到剪贴板')
}
</script>
