import { defineStore } from 'pinia'
import { airportApi } from '~/utils/api'
import type { Airport } from '~/types/api'

export const useAirportStore = defineStore('airport', {
  state: () => ({
    airports: [] as Airport[],
    currentAirport: null as Airport | null,
    loading: false,
    error: null as string | null
  }),

  getters: {
    activeAirports: state => state.airports.filter(a => a.status === 'active'),
    errorAirports: state => state.airports.filter(a => a.status === 'error'),
    totalNodes: state => state.airports.reduce((sum, a) => sum + (a.nodeCount || 0), 0)
  },

  actions: {
    async fetchAirports() {
      this.loading = true
      this.error = null
      try {
        const data = await airportApi.list()
        this.airports = Array.isArray(data) ? data : []
      } catch (error: any) {
        this.error = error.message
        this.airports = []
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchAirport(id: string) {
      this.loading = true
      this.error = null
      try {
        this.currentAirport = await airportApi.get(id)
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async createAirport(data: Partial<Airport>) {
      this.loading = true
      this.error = null
      try {
        const airport = await airportApi.create(data)
        this.airports.push(airport)
        return airport
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateAirport(id: string, data: Partial<Airport>) {
      this.loading = true
      this.error = null
      try {
        const airport = await airportApi.update(id, data)
        const index = this.airports.findIndex(a => a.id === id)
        if (index !== -1) {
          this.airports[index] = airport
        }
        if (this.currentAirport?.id === id) {
          this.currentAirport = airport
        }
        return airport
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteAirport(id: string) {
      this.loading = true
      this.error = null
      try {
        await airportApi.delete(id)
        this.airports = this.airports.filter(a => a.id !== id)
        if (this.currentAirport?.id === id) {
          this.currentAirport = null
        }
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async triggerUpdate(id: string) {
      this.loading = true
      this.error = null
      try {
        await airportApi.triggerUpdate(id)
        // 刷新机场信息
        await this.fetchAirport(id)
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async triggerUpdateAll() {
      this.loading = true
      this.error = null
      try {
        await airportApi.triggerUpdateAll()
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
