<template>
  <VCard class="new-listed-card" elevation="3">
    <VCardTitle class="card-title">
      <div class="title-content">
        <VAvatar size="32" color="primary" class="title-avatar">
          <VIcon color="white" size="18">mdi-rocket-launch-outline</VIcon>
        </VAvatar>
        <span class="title-text">{{ labels.title }}</span>
      </div>
    </VCardTitle>

    <VCardText class="card-content">

      <div v-if="loading" class="loading-container">
        <div class="modern-loader">
          <div class="loader-ring"></div>
          <div class="loader-ring"></div>
          <div class="loader-ring"></div>
        </div>
      </div>

      <div v-else-if="!displayApps.length" class="empty-container">
        <VIcon size="48" color="grey-lighten-1" class="empty-icon">mdi-package-variant-closed</VIcon>
        <p class="text-body-1 mt-0 font-weight-medium">{{ labels.noNewApps }}</p>
      </div>

      <div v-else class="apps-list-container">
        <div class="apps-vertical-list">
          <div
            v-for="(app, index) in displayApps"
            :key="app.uuid || app.name || index"
            class="app-list-item"
            :class="{ 'first-item': index === 0 }"
            @click="navigateToApp(app)"
          >
            <div class="app-item-content">
              <div class="app-icon-section">
                <AppIcon :app="app" :size="50" />
              </div>

              <div class="app-details">
                <div class="app-main-info">
                  <h4 class="app-name" :title="app.displayName || app.name">
                    {{ app.displayName || app.name || labels.unknownApp }}
                  </h4>
                  <p class="app-description" :title="app.description">
                    {{ app.description || labels.noDescription }}
                  </p>
                </div>
              </div>

              <div class="app-actions">
                <VBtn
                  color="primary"
                  variant="flat"
                  size="x-small"
                  style="height: 25px; font-size: 0.75rem; padding: 0 12px; width: 85px; border-radius: 20px;"
                  @click.stop="navigateToApp(app)"
                >
                  {{ labels.view }}
                </VBtn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/Marketplace/AppIcon.vue'
import { useMarketplaceUtils } from '@/composables/useMarketplaceUtils'

const props = defineProps({
  apps: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  compact: {
    type: Boolean,
    default: false,
  },
  mobile: {
    type: Boolean,
    default: false,
  },
})

const { t } = useI18n()

const router = useRouter()
const { formatRelativeTime } = useMarketplaceUtils()

const labels = computed(() => ({
  title: t('components.marketplace.newListedCard.title'),
  noNewApps: t('components.marketplace.newListedCard.noNewApps'),
  unknownApp: t('components.marketplace.newListedCard.unknownApp'),
  noDescription: t('components.marketplace.newListedCard.noDescription'),
  view: t('components.marketplace.newListedCard.view'),
}))

const displayApps = computed(() => {
  return [...props.apps]
    .filter(app => app.visible !== false && app.enabled !== false)

  // Show all apps, not limited to 6
})

const formatTime = timestamp => {
  if (!timestamp) return 'New'
  const now = Date.now()
  const time = timestamp // timestamp is already in milliseconds
  const diff = now - time
  const absDiff = Math.abs(diff)
  const hours = Math.floor(absDiff / (1000 * 60 * 60))

  // Handle future timestamps
  if (diff < 0) {
    if (hours < 1) return 'Soon'
    if (hours < 24) return `In ${hours}h`
    
    return `In ${Math.floor(hours / 24)}d`
  }

  // Handle past timestamps
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  if (hours < 48) return '1d ago'
  
  return `${Math.floor(hours / 24)}d ago`
}

const getCategoryName = categoryId => {
  return 'Apps'
}

const navigateToApp = app => {
  router.push(`/marketplace/${app.uuid || app.name}`)
}

const deployApp = app => {
  router.push(`/marketplace/${app.uuid || app.name}`)
}
</script>

<style scoped>
.new-listed-card {
  border-radius: 12px;
  height: 150px; /* Consistent height across all resolutions */
  display: flex;
  flex-direction: column;
}

.card-title {
  padding: 12px 16px 8px 16px;
  flex-shrink: 0;
}

.title-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-text {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.title-avatar {
  margin-right: 8px;
  flex-shrink: 0;
}

.card-content {
  padding: 8px 16px 8px 16px; /* Balanced padding for better centering */
  flex: 1;
  overflow: hidden;
  display: flex; /* Ensure flex container */
  flex-direction: column; /* Stack content vertically */
}

.loading-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
  padding: 4px 0 0 0;
}

.empty-icon {
  margin-bottom: 4px;
}

.modern-loader {
  position: relative;
  width: 40px;
  height: 40px;
}

.loader-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid rgba(59, 130, 246, 0.1);
  border-top: 3px solid #3B82F6;
  border-radius: 50%;
  animation: modern-spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
}

.loader-ring:nth-child(2) {
  animation-delay: 0.2s;
  border-top-color: #60A5FA;
  border-color: rgba(96, 165, 250, 0.1);
  transform: scale(0.8);
}

.loader-ring:nth-child(3) {
  animation-delay: 0.4s;
  border-top-color: #93C5FD;
  border-color: rgba(147, 197, 253, 0.1);
  transform: scale(0.6);
}

@keyframes modern-spin {
  0% {
    transform: rotate(0deg) scale(var(--scale, 1));
  }
  50% {
    transform: rotate(180deg) scale(calc(var(--scale, 1) * 1.1));
  }
  100% {
    transform: rotate(360deg) scale(var(--scale, 1));
  }
}

.apps-list-container {
  flex: 1;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.apps-vertical-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  overflow-y: scroll; /* Force scrollbar to always show */
  overflow-x: hidden;
  padding: 4px;
  height: 130px;
  max-height: 130px;
  width: 100%;
  scroll-snap-type: y mandatory;
}

.apps-vertical-list::-webkit-scrollbar {
  width: 8px; /* Slightly wider for better visibility */
}

.apps-vertical-list::-webkit-scrollbar-track {
  background: rgba(var(--v-theme-surface-variant), 0.5); /* More visible track */
  border-radius: 4px;
}

.apps-vertical-list::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.6); /* More visible thumb */
  border-radius: 4px;
  transition: background 0.2s ease;
}

.apps-vertical-list::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-primary), 0.8); /* Very visible on hover */
}

.app-list-item {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-outline), 0.3);
  background: rgba(var(--v-theme-surface), 1);
  padding: 0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  scroll-snap-align: start; /* Snap each item to show fully */
}

.app-list-item:hover {
  border-color: rgba(var(--v-theme-primary), 0.5);
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.15);
  /* Removed translateX to prevent horizontal scroll issues */
}

/* Removed folding effect - first item should show fully when scroll is at top */

.app-item-content {
  padding: 8px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-height: 70px; /* Back to min-height for flexible sizing */
}

.app-icon-section {
  flex-shrink: 0;
}

.app-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.app-main-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.app-name {
  font-size: 0.95rem; /* Increased slightly for better readability */
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.2;
}

.app-description {
  font-size: 0.75rem; /* Small description text like FluxCloud */
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin: 4px 0 0 0;
  display: -webkit-box;
  -webkit-line-clamp: 3; /* Max 3 lines like FluxCloud */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.app-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.app-actions {
  flex-shrink: 0;
}

.app-actions .v-btn {
  height: 36px;
  font-size: 0.85rem;
  font-weight: 600;
}

/* Mobile adjustments */
@media (max-width: 600px) {
  .new-listed-card {
    height: 150px; /* Consistent height across all resolutions */
  }

  .card-title {
    padding: 12px 16px 6px 16px;
    font-size: 1rem;
  }

  .card-content {
    padding: 6px 16px 16px 16px;
  }

  .app-item-content {
    padding: 10px;
    gap: 12px;
    min-height: 70px;
  }

  .app-name {
    font-size: 0.95rem;
  }

  .app-dev {
    font-size: 0.8rem;
  }

  .app-actions .v-btn {
    height: 32px;
    font-size: 0.8rem;
  }
}

/* Compact mode */
@media (max-height: 600px) {
  .apps-list-container {
    max-height: 300px;
  }
}
</style>
