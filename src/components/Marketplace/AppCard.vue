<template>
  <div
    class="app-card-wrapper"
    :class="{ 'hovered': hovered }"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <VCard
      class="app-card"
      elevation="0"
    >
      <div class="card-content">
        <!-- Top section: Icon + Name + Buttons (87px height) -->
        <div class="app-top-section">
          <div class="app-icon-container">
            <AppIcon :app="app" :size="60" />
          </div>

          <div class="app-name-section">
            <h3 class="app-name">{{ app.displayName || app.name }}</h3>
            <div class="app-category">
              <VChip
                size="x-small"
                color="grey"
                variant="outlined"
                class="category-chip"
              >
                {{ categoryName }}
              </VChip>
            </div>
          </div>

          <div class="app-buttons">
            <VBtn
              color="primary"
              variant="flat"
              size="x-small"
              class="install-btn"
              @click.stop="deploy"
            >
              {{ t('components.marketplace.appCard.install') }}
            </VBtn>
            <VBtn
              color="primary"
              variant="flat"
              size="x-small"
              class="view-btn"
              @click.stop="viewDetails"
            >
              {{ t('components.marketplace.appCard.view') }}
            </VBtn>
          </div>
        </div>

        <!-- Divider -->
        <VDivider class="card-divider" />

        <!-- Stats section (35px height) -->
        <div class="app-stats-section">
          <div class="stats-row">
            <VChip
              size="small"
              color="primary"
              variant="flat"
              class="stat-chip"
            >
              <VIcon start size="14">mdi-download</VIcon>
              {{ formatNumber(app.installCount || 0) }}
            </VChip>
            <VChip
              size="small"
              color="success"
              variant="tonal"
              class="stat-chip"
            >
              <VIcon start size="14">mdi-currency-usd</VIcon>
              {{ formatPrice(app.price) }}
            </VChip>
          </div>
        </div>

        <!-- Description section (flexible height) -->
        <div class="app-description-section">
          <p class="app-description">
            {{ app.description || t('components.marketplace.appCard.noDescription') }}
          </p>
        </div>
      </div>
    </VCard>

    <!-- Install Dialog -->
    <InstallDialog
      v-model="showInstallDialog"
      :app="app"
      @deployed="handleDeploySuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/Marketplace/AppIcon.vue'
import InstallDialog from '@/components/Marketplace/InstallDialog.vue'
import { useMarketplaceUtils } from '@/composables/useMarketplaceUtils'

const props = defineProps({
  app: {
    type: Object,
    required: true,
  },
  marketplaceCategories: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['deploy'])

const { t } = useI18n()

const router = useRouter()
const { formatNumber, formatPrice } = useMarketplaceUtils()

const hovered = ref(false)
const showInstallDialog = ref(false)

const categoryName = computed(() => {
  if (!props.app.category) return t('components.marketplace.appCard.defaultCategory')

  // Find category by UUID
  const category = props.marketplaceCategories.find(cat => cat.uuid === props.app.category)

  return category ? category.name : t('components.marketplace.appCard.defaultCategory')
})

const navigateToApp = () => {
  // FluxCloud uses app.name.toLowerCase() for navigation
  const appIdentifier = props.app.name?.toLowerCase() || props.app.uuid
  router.push(`/marketplace/${appIdentifier}`)
}

const viewDetails = () => {
  navigateToApp()
}

const deploy = () => {
  // FluxCloud opens InstallDialog as modal
  showInstallDialog.value = true
}

const handleDeploySuccess = deployedApp => {
  // Emit deploy event for parent components to handle
  emit('deploy', deployedApp)
  console.log('🚀 App deployed successfully:', deployedApp.displayName || deployedApp.name)
}
</script>

<style scoped>
.app-card-wrapper {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 250px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.app-card-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12),
              0 2px 4px rgba(0, 0, 0, 0.08),
              0 1px 2px rgba(0, 0, 0, 0.06);
  z-index: -1;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.app-card-wrapper.hovered::before,
.app-card-wrapper:hover::before {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18),
              0 8px 20px rgba(0, 0, 0, 0.12),
              0 4px 8px rgba(0, 0, 0, 0.08),
              0 1px 3px rgba(0, 0, 0, 0.04);
}

.app-card {
  height: 100%;
  border-radius: 12px !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.2);
  background-color: rgb(var(--v-theme-surface));
  box-shadow: inset 0 1px 0 rgba(var(--v-theme-on-surface), 0.05);
  overflow: hidden;
}

/* Light theme hover - glowing with shadow */
.app-card-wrapper.hovered .app-card,
.app-card-wrapper:hover .app-card {
  border-color: rgba(var(--v-theme-primary), 0.8) !important;
  box-shadow: inset 0 1px 0 rgba(var(--v-theme-on-surface), 0.05),
              0 0 20px rgba(var(--v-theme-primary), 0.6),
              0 0 40px rgba(var(--v-theme-primary), 0.4),
              0 0 60px rgba(var(--v-theme-primary), 0.2),
              inset 0 0 20px rgba(var(--v-theme-primary), 0.1) !important;
}

.app-card-wrapper.hovered::before,
.app-card-wrapper:hover::before {
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3),
              0 10px 25px rgba(0, 0, 0, 0.2),
              0 5px 15px rgba(0, 0, 0, 0.15),
              0 0 30px rgba(var(--v-theme-primary), 0.7),
              0 0 60px rgba(var(--v-theme-primary), 0.5),
              0 0 90px rgba(var(--v-theme-primary), 0.3) !important;
}

/* Dark theme hover - glowing with shadow */
.v-theme--dark .app-card-wrapper.hovered .app-card,
.v-theme--dark .app-card-wrapper:hover .app-card {
  border-color: rgba(var(--v-theme-primary), 0.9) !important;
  box-shadow: inset 0 1px 0 rgba(var(--v-theme-on-surface), 0.05),
              0 0 25px rgba(var(--v-theme-primary), 0.8),
              0 0 50px rgba(var(--v-theme-primary), 0.6),
              0 0 75px rgba(var(--v-theme-primary), 0.4),
              inset 0 0 25px rgba(var(--v-theme-primary), 0.15) !important;
}

.v-theme--dark .app-card-wrapper.hovered::before,
.v-theme--dark .app-card-wrapper:hover::before {
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5),
              0 10px 25px rgba(0, 0, 0, 0.3),
              0 5px 15px rgba(0, 0, 0, 0.2),
              0 0 40px rgba(var(--v-theme-primary), 0.8),
              0 0 80px rgba(var(--v-theme-primary), 0.6),
              0 0 120px rgba(var(--v-theme-primary), 0.4) !important;
}

.card-content {
  padding: 8px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Top section - FluxCloud style (87px height) */
.app-top-section {
  height: 87px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px;
}

.app-icon-container {
  width: 60px;
  flex-shrink: 0;
}

.app-name-section {
  flex: 1;
  min-width: 0;
  padding: 0 4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.app-name {
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.app-category {
  display: flex;
  align-items: center;
}

.category-chip {
  font-size: 0.7rem !important;
  height: 18px !important;
  padding: 0 6px !important;
}

.spacer {
  width: 20px;
  flex-shrink: 0;
}

.app-buttons {
  width: 80px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0 0 0;
  margin-right: 3px;
}

.install-btn,
.view-btn {
  height: 25px !important;
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  color: white !important;
  width: 100% !important;
  border-radius: 12px !important;
}

.card-divider {
  margin: 0 8px;
  opacity: 0.1;
}

/* Stats section - FluxCloud style (35px height) */
.app-stats-section {
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
}

.stats-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.stat-chip {
  font-size: 0.8rem !important;
  height: 24px !important;
  border-radius: 12px !important;
  padding: 0 8px !important;
}

/* Description section - FluxCloud style (flexible height) */
.app-description-section {
  flex: 1;
  padding: 8px 16px 16px 16px;
  display: flex;
  align-items: flex-start;
}

.app-description {
  font-size: 0.85rem;
  line-height: 1.4;
  color: rgba(var(--v-theme-on-surface), 0.8);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
}

/* Mobile adjustments */
@media (max-width: 600px) {
  .card-content {
    padding: 12px;
  }

  .app-name {
    font-size: 1rem;
  }

  .app-description {
    font-size: 0.85rem;
  }
}
</style>