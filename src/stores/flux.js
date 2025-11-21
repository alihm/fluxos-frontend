// src/stores/flux.js
import { defineStore } from "pinia"
import Api from "@/services/ApiClient"
import axios from "axios"
import DashboardService from "@/services/DashboardService"

export const useFluxStore = defineStore("flux", {
  state: () => ({
    userconfig: {
      zelid: "",
      externalip: "",
    },
    config: {
      fluxTeamFluxID: "",
      fluxSupportTeamFluxID: "",
      apiPort: "",
    },
    privilege: "none",
    zelid: "",
    fluxVersion: "",
    loginType: "",
    xdaoOpen: 0,
    serverLocations: {
      fluxList: [],
      fluxNodeCount: 0,
      isLoading: false,
      hasError: false,
      lastFetched: null,
    },
  }),

  getters: {
    isXdaoOpen: state => state.xdaoOpen,
  },

  actions: {
    async fetchFluxIDs() {
      try {
        const response = await Api().get("/flux/fluxids")
    
        if (!response?.data?.data) {
          console.warn("⚠️ Unexpected API structure:", response.data)
          
          return
        }
    
        const { fluxTeamFluxID, fluxSupportTeamFluxID } = response.data.data

        console.log("📦 Extracted IDs:", fluxTeamFluxID, fluxSupportTeamFluxID)
    
        this.setFluxTeamFluxID(fluxTeamFluxID)
        this.setFluxSupportTeamFluxID(fluxSupportTeamFluxID)
      } catch (error) {
        console.error("❌ Failed to fetch Flux IDs:", error)
      }
    },    

    setPrivilege(privilege) {
      this.privilege = privilege
    },

    setZelid(zelid) {
      this.zelid = zelid
    },

    setFluxVersion(version) {
      this.fluxVersion = version
    },

    setUserZelid(zelid) {
      this.userconfig.zelid = zelid
    },

    setUserIp(ip) {
      this.userconfig.externalip = ip
    },

    setFluxPort(port) {
      this.config.apiPort = port
    },

    setXDAOOpen(open) {
      this.xdaoOpen = open
    },

    setFluxTeamFluxID(id) {
      this.config.fluxTeamFluxID = id
    },

    setFluxSupportTeamFluxID(id) {
      this.config.fluxSupportTeamFluxID = id
    },
    setLoginType(type) {
      this.loginType = type
    },

    // IndexedDB helper functions for server locations caching
    async openServerLocationsDB() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('FluxServerLocationsDB', 1)

        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result)

        request.onupgradeneeded = event => {
          const db = event.target.result
          if (!db.objectStoreNames.contains('locations')) {
            db.createObjectStore('locations', { keyPath: 'id' })
          }
        }
      })
    },

    async loadServerLocationsFromCache() {
      try {
        const db = await this.openServerLocationsDB()

        return new Promise(resolve => {
          const transaction = db.transaction(['locations'], 'readonly')
          const store = transaction.objectStore('locations')
          const request = store.get('flux_server_locations')

          request.onsuccess = () => {
            if (request.result) {
              console.log('✅ Loaded server locations from IndexedDB cache')
              resolve(request.result.data)
            } else {
              resolve(null)
            }
          }
          request.onerror = () => {
            console.warn('Error reading from IndexedDB:', request.error)
            resolve(null)
          }
        })
      } catch (error) {
        console.warn('IndexedDB not available, skipping cache:', error)

        return null
      }
    },

    async saveServerLocationsToCache(fluxData, nodeCount) {
      try {
        const db = await this.openServerLocationsDB()

        const dataToCache = {
          id: 'flux_server_locations',
          data: {
            fluxList: fluxData,
            fluxNodeCount: nodeCount,
            timestamp: Date.now(),
          },
        }

        const transaction = db.transaction(['locations'], 'readwrite')
        const store = transaction.objectStore('locations')
        store.put(dataToCache)

        await new Promise((resolve, reject) => {
          transaction.oncomplete = () => {
            console.log(`✅ Cached ${fluxData.length} nodes in IndexedDB`)
            resolve()
          }
          transaction.onerror = () => reject(transaction.error)
        })
      } catch (error) {
        console.warn('Unable to cache to IndexedDB:', error)
      }
    },

    async fetchServerLocations() {
      // Don't fetch if already loading
      if (this.serverLocations.isLoading) {
        return
      }

      // Try to load from cache first to populate immediately
      const cached = await this.loadServerLocationsFromCache()
      if (cached) {
        this.serverLocations.fluxList = Array.isArray(cached.fluxList) ? cached.fluxList : []
        this.serverLocations.fluxNodeCount = cached.fluxNodeCount || 0
        this.serverLocations.hasError = false
        this.serverLocations.lastFetched = cached.timestamp
      }

      // Then fetch fresh data in background
      this.serverLocations.isLoading = true

      try {
        const resLoc = await axios.get(
          'https://stats.runonflux.io/fluxinfo?projection=geolocation,ip,tier',
        )

        const data = resLoc.data.data
        const fetchedFluxList = Array.isArray(data) ? data : []

        const resList = await DashboardService.fluxnodeCount()
        const fetchedNodeCount = resList.data.data.total || 0

        // Update state
        this.serverLocations.fluxList = fetchedFluxList
        this.serverLocations.fluxNodeCount = fetchedNodeCount
        this.serverLocations.hasError = false
        this.serverLocations.lastFetched = Date.now()

        // Save to cache
        await this.saveServerLocationsToCache(fetchedFluxList, fetchedNodeCount)
      } catch (error) {
        console.error('Error fetching server locations:', error)

        // If we don't have cached data, try to load it
        if (!cached) {
          const fallbackCache = await this.loadServerLocationsFromCache()
          if (fallbackCache) {
            this.serverLocations.fluxList = Array.isArray(fallbackCache.fluxList) ? fallbackCache.fluxList : []
            this.serverLocations.fluxNodeCount = fallbackCache.fluxNodeCount || 0
            this.serverLocations.hasError = false
            this.serverLocations.lastFetched = fallbackCache.timestamp
          } else {
            // No cache available
            this.serverLocations.fluxList = []
            this.serverLocations.fluxNodeCount = 0
            this.serverLocations.hasError = true
          }
        }
        // If we already have cached data, keep it and just log the error
      } finally {
        this.serverLocations.isLoading = false
      }
    },
  },
})
