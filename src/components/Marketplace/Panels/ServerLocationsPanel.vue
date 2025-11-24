<template>
  <div v-if="!hasError && fluxList.length > 0" class="server-locations-panel" :style="panelStyle">
    <VCard class="locations-card" elevation="0">
      <VCardText>
        <h2 v-if="titleText" class="locations-title">{{ titleText }}</h2>
        <p v-if="subtitleText" class="locations-subtitle">{{ subtitleText }}</p>

        <!-- Map Component -->
        <div class="map-container">
          <VOverlay
            v-model="isLoadingLocal"
            contained
            scroll-strategy="none"
            class="align-center justify-center"
          >
            <VProgressCircular indeterminate color="primary" />
          </VOverlay>

          <MapComponent
            v-if="fluxList.length > 0"
            :nodes="fluxList"
            :show-tier-display="false"
            class="server-map"
          />

          <div v-if="!isLoadingLocal && fluxList.length === 0" class="no-data">
            {{ t('components.marketplace.panels.serverLocationsPanel.noData') }}
          </div>
        </div>

        <!-- Stats -->
        <div v-if="fluxNodeCount > 0" class="stats-container">
          <div class="stat-item">
            <VIcon icon="mdi-server-network" size="40" color="success" />
            <div class="stat-content">
              <div class="stat-value">{{ fluxNodeCount.toLocaleString() }}+</div>
              <div class="stat-label">{{ t('components.marketplace.panels.serverLocationsPanel.activeServers') }}</div>
            </div>
          </div>
          <div class="stat-item">
            <VIcon icon="mdi-earth" size="40" color="success" />
            <div class="stat-content">
              <div class="stat-value">{{ countryCount }}+</div>
              <div class="stat-label">{{ t('components.marketplace.panels.serverLocationsPanel.countries') }}</div>
            </div>
          </div>
          <div class="stat-item">
            <VIcon icon="mdi-web" size="40" color="success" />
            <div class="stat-content">
              <div class="stat-value">{{ t('components.marketplace.panels.serverLocationsPanel.global') }}</div>
              <div class="stat-label">{{ t('components.marketplace.panels.serverLocationsPanel.coverage') }}</div>
            </div>
          </div>
        </div>
      </VCardText>
    </VCard>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import MapComponent from '@core/components/MapComponent.vue'
import { useFluxStore } from '@/stores/flux'
import { storeToRefs } from 'pinia'

const props = defineProps({
  panel: {
    type: Object,
    required: true,
  },
  app: {
    type: Object,
    required: true,
  },
})

const { t, te } = useI18n()

// Use server locations data from Pinia store
const fluxStore = useFluxStore()
const { serverLocations } = storeToRefs(fluxStore)

// Extract data from store
const fluxList = computed(() => serverLocations.value.fluxList)
const fluxNodeCount = computed(() => serverLocations.value.fluxNodeCount)
const isLoadingLocal = computed(() => serverLocations.value.isLoading)
const hasError = computed(() => serverLocations.value.hasError)

// Helper function to check if a string is an i18n key
const isI18nKey = str => {
  return str && typeof str === 'string' && str.startsWith('i18n:')
}

// Get translated or raw title
const titleText = computed(() => {
  if (!props.panel.title) return ''

  if (isI18nKey(props.panel.title)) {
    const key = props.panel.title.replace('i18n:', '')
    
    return te(key) ? t(key) : props.panel.title
  }

  return props.panel.title
})

// Get translated or raw subtitle
const subtitleText = computed(() => {
  if (!props.panel.subtitle) return ''

  if (isI18nKey(props.panel.subtitle)) {
    const key = props.panel.subtitle.replace('i18n:', '')
    
    return te(key) ? t(key) : props.panel.subtitle
  }

  return props.panel.subtitle
})

// Count unique countries
const countryCount = computed(() => {
  const countries = new Set()
  fluxList.value.forEach(flux => {
    if (flux.geolocation?.country) {
      countries.add(flux.geolocation.country)
    }
  })

  return countries.size
})

const panelStyle = computed(() => ({
  padding: props.panel.padding
    ? `${props.panel.padding.top}px ${props.panel.padding.right}px ${props.panel.padding.bottom}px ${props.panel.padding.left}px`
    : '0',
  background: props.panel.background || 'transparent',
  borderRadius: props.panel.cornerRadius ? `${props.panel.cornerRadius}px` : '0',
}))
</script>

<style scoped>
.server-locations-panel {
  margin-bottom: 0;
}

.locations-card {
  border-radius: 16px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.locations-card :deep(.v-card-text) {
  padding: 24px !important;
}

.locations-title {
  font-size: 28px;
  font-weight: 700;
  margin-top: 0.5rem;
  margin-bottom: 0;
  text-align: center;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.3;
}

.locations-subtitle {
  font-size: 1.125rem;
  text-align: center;
  margin-bottom: 16px;
  opacity: 0.9;
  line-height: 1.6;
}

.map-container {
  position: relative;
  min-height: 400px;
  margin-top: 24px;
  margin-bottom: -42px;
  padding: 0;
  border-radius: 12px;
  overflow: visible;
  background: rgba(var(--v-theme-surface), 0.4);
}

.server-map {
  border-radius: 12px;
}

.server-map :deep(.v-card) {
  padding: 0 !important;
  box-shadow: none !important;
}

.server-map :deep(.v-card-text) {
  padding: 0 !important;
}

.map-container :deep(.v-card) {
  margin: 0 !important;
  border-radius: 12px !important;
}

.map-container :deep(.v-map-wrapper) {
  margin: 0 !important;
  padding: 0 !important;
}

.no-data {
  text-align: center;
  font-size: 18px;
  color: rgba(var(--v-theme-on-surface), 0.5);
  padding: 60px 20px;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-top: 62px;
  position: relative;
  z-index: 10;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(var(--v-theme-on-surface), 0.04);
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(var(--v-theme-on-surface), 0.06);
  border-color: rgba(var(--v-theme-on-surface), 0.24);
  transform: translateY(-2px);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.2;
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .locations-title {
    font-size: 1.75rem;
  }

  .locations-subtitle {
    font-size: 1rem;
  }

  .stats-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .stat-value {
    font-size: 1.5rem;
  }
}

@media (max-width: 600px) {
  .server-locations-panel {
    padding: 0 !important;
  }

  .locations-title {
    font-size: 1.5rem;
  }

  .locations-subtitle {
    font-size: 0.9375rem;
    margin-bottom: 24px;
  }

  .map-container {
    min-height: 300px;
  }

  .stats-container {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .stat-item {
    flex-direction: column;
    padding: 12px 8px;
    gap: 8px;
    text-align: center;
  }

  .stat-item :deep(.v-icon) {
    font-size: 32px !important;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-value {
    font-size: 1rem;
  }

  .stat-label {
    font-size: 0.625rem;
  }
}
</style>
