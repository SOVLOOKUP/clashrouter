import { defineStore } from 'pinia'
import { subscriptionApi } from '~/utils/api'
import type { Subscription } from '~/types/api'

export const useSubscriptionStore = defineStore('subscription', {
  state: () => ({
    subscriptions: [] as Subscription[],
    currentSubscription: null as Subscription | null,
    loading: false,
    error: null as string | null
  }),

  getters: {
    totalSubscriptions: state => state.subscriptions.length
  },

  actions: {
    async fetchSubscriptions() {
      this.loading = true
      this.error = null
      try {
        const data = await subscriptionApi.list()
        this.subscriptions = Array.isArray(data) ? data : []
      } catch (error: any) {
        this.error = error.message
        this.subscriptions = []
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchSubscription(id: string) {
      this.loading = true
      this.error = null
      try {
        this.currentSubscription = await subscriptionApi.get(id)
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async createSubscription(data: Partial<Subscription> & { airportIds: string[] }) {
      this.loading = true
      this.error = null
      try {
        const subscription = await subscriptionApi.create(data)
        this.subscriptions.push(subscription)
        return subscription
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateSubscription(id: string, data: Partial<Subscription> & { airportIds?: string[] }) {
      this.loading = true
      this.error = null
      try {
        const subscription = await subscriptionApi.update(id, data)
        const index = this.subscriptions.findIndex(s => s.id === id)
        if (index !== -1) {
          this.subscriptions[index] = subscription
        }
        if (this.currentSubscription?.id === id) {
          this.currentSubscription = subscription
        }
        return subscription
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteSubscription(id: string) {
      this.loading = true
      this.error = null
      try {
        await subscriptionApi.delete(id)
        this.subscriptions = this.subscriptions.filter(s => s.id !== id)
        if (this.currentSubscription?.id === id) {
          this.currentSubscription = null
        }
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async regenerateToken(id: string) {
      this.loading = true
      this.error = null
      try {
        const subscription = await subscriptionApi.regenerateToken(id)
        const index = this.subscriptions.findIndex(s => s.id === id)
        if (index !== -1) {
          this.subscriptions[index] = subscription
        }
        if (this.currentSubscription?.id === id) {
          this.currentSubscription = subscription
        }
        return subscription
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    getSubscriptionUrl(token: string, target: string = 'clash') {
      return subscriptionApi.getUrl(token, target)
    }
  }
})
