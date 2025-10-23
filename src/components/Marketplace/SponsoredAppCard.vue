<template>
  <VCard
    class="sponsored-app-card"
    width="200"
    height="120"
    hover
    @click="$emit('click', app)"
  >
    <VCardText class="pa-3 d-flex align-center h-100">
      <VRow align="center" no-gutters class="h-100">
        <!-- App Icon -->
        <VCol cols="auto" class="me-3">
          <VAvatar size="40" class="app-icon">
            <VIcon v-if="!app.icon" icon="mdi-application" size="24" />
            <VImg v-else :src="app.icon" :alt="app.displayName || app.name" />
          </VAvatar>
        </VCol>

        <!-- App Info -->
        <VCol class="flex-grow-1 min-width-0">
          <div class="text-subtitle-2 font-weight-medium text-truncate mb-1">
            {{ app.displayName || app.name }}
          </div>
          <div class="text-caption text-medium-emphasis text-truncate mb-2">
            {{ app.developer || labels.unknown }}
          </div>

          <!-- Stats -->
          <div class="d-flex align-center gap-2">
            <!-- Rating -->
            <div v-if="app.rating" class="d-flex align-center">
              <VIcon icon="mdi-star" color="warning" size="12" />
              <span class="text-caption ml-1">{{ app.rating.toFixed(1) }}</span>
            </div>

            <!-- Install count -->
            <div v-if="app.installCount" class="text-caption text-medium-emphasis">
              <VIcon icon="mdi-download" size="10" class="me-1" />
              {{ formatNumber(app.installCount) }}
            </div>

            <!-- Price -->
            <VChip
              :color="app.price > 0 ? 'success' : 'primary'"
              size="x-small"
              variant="tonal"
            >
              {{ app.price > 0 ? `$${app.price}` : labels.free }}
            </VChip>
          </div>
        </VCol>
      </VRow>
    </VCardText>

    <!-- Category badge -->
    <div v-if="app.category" class="category-badge">
      <VChip
        :color="getCategoryColor(app.category)"
        size="x-small"
        variant="elevated"
        class="text-capitalize"
      >
        {{ getCategoryName(app.category) }}
      </VChip>
    </div>
  </VCard>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMarketplace } from '@/composables/useMarketplace'
import { useMarketplaceUtils } from '@/composables/useMarketplaceUtils'

const props = defineProps({
  app: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['click'])

const { t } = useI18n()

const { categoryMap } = useMarketplace()
const { formatNumber, getCategoryColor } = useMarketplaceUtils()

const labels = computed(() => ({
  unknown: t('components.marketplace.sponsoredAppCard.unknown'),
  free: t('components.marketplace.sponsoredAppCard.free'),
  other: t('components.marketplace.sponsoredAppCard.other'),
}))

const getCategoryName = categoryUuid => {
  return categoryMap.value.get(categoryUuid) || labels.value.other
}


const formatInstallCount = count => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M'
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K'
  }

  return count.toString()
}
</script>

<style scoped>
.sponsored-app-card {
  flex-shrink: 0;
  position: relative;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
}

.sponsored-app-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.app-icon {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(var(--v-theme-surface), 1);
}

.category-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 2;
}

.min-width-0 {
  min-width: 0;
}
</style>