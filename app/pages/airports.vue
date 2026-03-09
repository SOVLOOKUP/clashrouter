<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        机场管理
      </h1>
      <div class="flex gap-2">
        <button
          :disabled="airportStore.loading"
          class="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2"
          @click="handleUpdateAll"
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          更新全部
        </button>
        <button
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2"
          @click="showModal = true; editingAirport = null; resetForm()"
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
          添加机场
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="airportStore.loading"
      class="flex justify-center py-12"
    >
      <div class="animate-spin">
        <svg
          class="w-8 h-8"
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

    <!-- Airports Grid -->
    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <div
        v-for="airport in airportStore.airports"
        :key="airport.id"
        class="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition"
      >
        <!-- Header -->
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-semibold text-white">
              {{ airport.name }}
            </h3>
            <p class="text-sm text-slate-400">
              {{ getPluginName(airport.pluginType) }}
            </p>
          </div>
          <span
            :class="{
              'bg-green-500/20 text-green-300': airport.status === 'active',
              'bg-red-500/20 text-red-300': airport.status !== 'active'
            }"
            class="px-3 py-1 rounded-full text-xs font-medium"
          >
            {{ airport.status }}
          </span>
        </div>

        <!-- Info -->
        <div class="space-y-3 mb-4">
          <div class="flex justify-between text-sm">
            <span class="text-slate-400">节点数量</span>
            <span class="font-semibold text-white">{{ airport.nodeCount || 0 }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-400">更新频率</span>
            <span class="text-white">{{ airport.updateFrequency }} 分钟</span>
          </div>
          <div
            v-if="airport.lastUpdateTime"
            class="flex justify-between text-sm"
          >
            <span class="text-slate-400">最后更新</span>
            <span class="text-white">{{ formatTime(airport.lastUpdateTime) }}</span>
          </div>
          <div
            v-if="airport.errorMessage"
            class="text-sm text-red-400 pt-2 border-t border-slate-700"
          >
            ⚠️ {{ airport.errorMessage }}
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <button
            class="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm transition flex items-center justify-center gap-1"
            @click="handleUpdate(airport.id)"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            更新
          </button>
          <button
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm transition flex items-center justify-center gap-1"
            @click="handleEdit(airport)"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            编辑
          </button>
          <button
            class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm transition flex items-center justify-center gap-1"
            @click="handleDelete(airport.id)"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            删除
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!airportStore.loading && airportStore.airports.length === 0"
      class="text-center py-12"
    >
      <svg
        class="w-12 h-12 mx-auto text-slate-400 mb-4"
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
      <p class="text-slate-400">
        没有添加任何机场
      </p>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div class="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4 space-y-4">
        <h2 class="text-xl font-bold text-white">
          {{ editingAirport ? '编辑机场' : '添加机场' }}
        </h2>

        <!-- Form Fields -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">机场名称 *</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="请输入机场名称"
              class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">处理插件 *</label>
            <select
              v-model="form.pluginType"
              class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option
                v-for="plugin in pluginOptions"
                :key="plugin.id"
                :value="plugin.id"
              >
                {{ plugin.name }}
              </option>
            </select>
            <p class="text-xs text-slate-400 mt-1">
              {{ pluginOptions.find(p => p.id === form.pluginType)?.description || '请选择用于解析订阅的插件' }}
            </p>
          </div>

          <div v-if="showSubUrlField">
            <label class="block text-sm font-medium text-slate-300 mb-2">订阅链接</label>
            <input
              v-model="form.subUrl"
              type="text"
              placeholder="https://..."
              class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            >
            <p
              v-if="currentPluginMode === 'either'"
              class="text-xs text-slate-400 mt-1"
            >
              与用户名/密码二选一：填写 subUrl，或同时填写用户名和密码。
            </p>
          </div>

          <div v-if="showCredentialFields">
            <label class="block text-sm font-medium text-slate-300 mb-2">用户名</label>
            <input
              v-model="form.username"
              type="text"
              placeholder="如需请输入"
              class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            >
          </div>

          <div v-if="showCredentialFields">
            <label class="block text-sm font-medium text-slate-300 mb-2">密码</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="如需请输入"
              class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            >
          </div>

          <div v-if="form.pluginType === 'xboard'">
            <label class="block text-sm font-medium text-slate-300 mb-2">BaseURL</label>
            <input
              v-model="form.host"
              type="text"
              placeholder="例如: https://mojie.example.com"
              class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            >
            <p class="text-xs text-slate-400 mt-1">
              仅 Xboard 插件需要，留空将使用魔戒地址。
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">更新频率（分钟） *</label>
            <input
              v-model.number="form.updateFrequency"
              type="number"
              min="1"
              class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            >
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 justify-end pt-4 border-t border-slate-700">
          <button
            class="px-4 py-2 rounded-lg text-slate-300 hover:text-white transition"
            @click="showModal = false"
          >
            取消
          </button>
          <button
            :disabled="submitting"
            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
            @click="handleSubmit"
          >
            {{ submitting ? '保存中...' : editingAirport ? '保存' : '创建' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAirportStore } from '~/stores/airport'
import { pluginApi } from '~/utils/api'
import type { Airport, AirportPlugin } from '~/types/api'

const airportStore = useAirportStore()

const showModal = ref(false)
const editingAirport = ref<Airport | null>(null)
const submitting = ref(false)
const pluginOptions = ref<AirportPlugin[]>([])

const form = ref({
  name: '',
  subUrl: '',
  username: '',
  password: '',
  host: '',
  updateFrequency: 60,
  pluginType: 'generic'
})

const currentPlugin = computed(() => pluginOptions.value.find(plugin => plugin.id === form.value.pluginType))
const currentPluginMode = computed(() => currentPlugin.value?.type || 'either')
const showSubUrlField = computed(() => currentPluginMode.value === 'subUrl' || currentPluginMode.value === 'either')
const showCredentialFields = computed(() => currentPluginMode.value === 'credentials' || currentPluginMode.value === 'either')

watch(currentPluginMode, (mode) => {
  if (mode === 'subUrl') {
    form.value.username = ''
    form.value.password = ''
    form.value.host = ''
  }

  if (mode === 'credentials') {
    form.value.subUrl = ''
  }

  if (form.value.pluginType !== 'xboard') {
    form.value.host = ''
  }
})

onMounted(async () => {
  await Promise.all([
    airportStore.fetchAirports(),
    loadPluginOptions()
  ])
})

async function loadPluginOptions() {
  try {
    const plugins = await pluginApi.list()
    pluginOptions.value = Array.isArray(plugins) ? plugins : []

    if (pluginOptions.value.length > 0) {
      const exists = pluginOptions.value.some(plugin => plugin.id === form.value.pluginType)
      if (!exists) {
        const firstPlugin = pluginOptions.value[0]
        if (firstPlugin) {
          form.value.pluginType = firstPlugin.id
        }
      }
    }
  } catch {
    // 兜底保留通用插件，避免创建流程阻塞
    pluginOptions.value = [{
      id: 'generic',
      name: '通用订阅',
      type: 'subUrl',
      description: '通用订阅解析插件'
    }]
  }
}

function getPluginName(pluginType: string) {
  const plugin = pluginOptions.value.find(item => item.id === pluginType)
  return plugin?.name || pluginType
}

function formatTime(time: string) {
  return new Date(time).toLocaleString('zh-CN')
}

function resetForm() {
  form.value = {
    name: '',
    subUrl: '',
    username: '',
    password: '',
    host: '',
    updateFrequency: 60,
    pluginType: pluginOptions.value[0]?.id || 'generic'
  }
}

function handleEdit(airport: Airport) {
  editingAirport.value = airport
  form.value = {
    name: airport.name,
    subUrl: airport.subUrl || '',
    username: airport.username || '',
    password: airport.password || '',
    host: airport.host || '',
    updateFrequency: airport.updateFrequency,
    pluginType: airport.pluginType
  }
  showModal.value = true
}

async function handleSubmit() {
  if (!form.value.name || !form.value.pluginType) {
    alert('请填写必填项')
    return
  }

  const hasSubUrl = form.value.subUrl.trim() !== ''
  const hasUsername = form.value.username.trim() !== ''
  const hasPassword = form.value.password.trim() !== ''

  if (hasUsername !== hasPassword) {
    alert('用户名和密码必须同时填写或同时留空')
    return
  }

  if (currentPluginMode.value === 'subUrl' && !hasSubUrl) {
    alert('当前插件需要填写 subUrl')
    return
  }

  if (currentPluginMode.value === 'credentials' && !(hasUsername && hasPassword)) {
    alert('当前插件需要同时填写用户名和密码')
    return
  }

  if (currentPluginMode.value === 'either' && !hasSubUrl && !(hasUsername && hasPassword)) {
    alert('subUrl 与用户名/密码需二选一：要么填写 subUrl，要么同时填写用户名和密码')
    return
  }

  if (form.value.pluginType === 'xboard' && form.value.host.trim() !== '' && !form.value.host.trim().startsWith('https://')) {
    alert('Xboard host 必须以 https:// 开头')
    return
  }

  submitting.value = true
  try {
    if (editingAirport.value) {
      await airportStore.updateAirport(editingAirport.value.id, form.value)
    } else {
      await airportStore.createAirport(form.value)
    }
    showModal.value = false
    resetForm()
    await airportStore.fetchAirports()
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知错误'
    alert('操作失败: ' + message)
  } finally {
    submitting.value = false
  }
}

async function handleUpdate(id: string) {
  try {
    await airportStore.triggerUpdate(id)
    await airportStore.fetchAirports()
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知错误'
    alert('更新失败: ' + message)
  }
}

async function handleUpdateAll() {
  if (confirm('确定要更新所有机场吗？这可能需要一些时间。')) {
    try {
      await airportStore.triggerUpdateAll()
      await airportStore.fetchAirports()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '未知错误'
      alert('更新失败: ' + message)
    }
  }
}

async function handleDelete(id: string) {
  if (confirm('确定要删除此机场吗？')) {
    try {
      await airportStore.deleteAirport(id)
      await airportStore.fetchAirports()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '未知错误'
      alert('删除失败: ' + message)
    }
  }
}
</script>
