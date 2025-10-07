<template>
  <VCard
    class="flux-app-card"
    hover
    @click="$emit('click', app)"
  >
    <VCardText class="pa-4">
      <VRow align="center" no-gutters>
        <!-- App Icon -->
        <VCol cols="auto" class="me-3">
          <VAvatar size="48" class="app-icon">
            <VIcon v-if="!app.icon" icon="mdi-application" size="32" />
            <VImg v-else :src="app.icon" :alt="app.displayName || app.name" />
          </VAvatar>
        </VCol>

        <!-- App Info -->
        <VCol class="flex-grow-1 min-width-0">
          <div class="text-subtitle-1 font-weight-medium text-truncate mb-1">
            {{ app.displayName || app.name }}
          </div>
          <div class="text-caption text-medium-emphasis text-truncate">
            {{ app.developer || 'Unknown Developer' }}
          </div>
          <!-- Category chip -->
          <VChip
            v-if="app.category"
            size="x-small"
            :color="getCategoryColor(app.category)"
            variant="tonal"
            class="mt-2 text-capitalize"
          >
            {{ app.category }}
          </VChip>
        </VCol>

        <!-- Action Buttons -->
        <VCol cols="auto" class="d-flex flex-column gap-2 ml-3">
          <VBtn
            :color="app.price > 0 ? 'success' : 'primary'"
            size="small"
            variant="elevated"
            block
            :disabled="!app.enabled"
            @click.stop="handleInstall"
            class="text-none"
            style="min-width: 80px;"
          >
            {{ app.price > 0 ? `$${app.price}` : 'Install' }}
          </VBtn>
          <VBtn
            variant="outlined"
            size="small"
            color="primary"
            block
            @click.stop="handleViewApp"
            class="text-none"
            style="min-width: 80px;"
          >
            View App
          </VBtn>
        </VCol>
      </VRow>

      <!-- App Description -->
      <div v-if="app.description" class="text-body-2 text-medium-emphasis mt-3 description-text">
        {{ truncatedDescription }}
      </div>

      <!-- App Stats -->
      <div class="d-flex align-center justify-space-between mt-3">
        <!-- Rating -->
        <div v-if="app.rating" class="d-flex align-center">
          <VRating
            :model-value="app.rating"
            color="warning"
            size="x-small"
            density="compact"
            readonly
            half-increments
          />
          <span class="text-caption text-medium-emphasis ml-2">
            ({{ app.ratingsCount || 0 }})
          </span>
        </div>

        <!-- Install Count -->
        <div v-if="app.installCount" class="text-caption text-medium-emphasis">
          <VIcon icon="mdi-download" size="12" class="me-1" />
          {{ formatNumber(app.installCount) }}
        </div>
      </div>

      <!-- Tags -->
      <div v-if="app.tags && app.tags.length" class="mt-2">
        <VChip
          v-for="tag in app.tags.slice(0, 3)"
          :key="tag"
          size="x-small"
          variant="outlined"
          color="primary"
          class="me-1 mb-1"
        >
          {{ tag }}
        </VChip>
      </div>
    </VCardText>

    <!-- Sponsored Badge -->
    <div v-if="sponsored" class="sponsored-badge">
      <VChip
        color="warning"
        size="x-small"
        prepend-icon="mdi-star"
        variant="elevated"
      >
        Sponsored
      </VChip>
    </div>
  </VCard>
</template>

<script setup>
import { computed } from 'vue'
import { useMarketplaceUtils } from '@/composables/useMarketplaceUtils'
import { useRouter } from 'vue-router'

const props = defineProps({
  app: {
    type: Object,
    required: true,
  },
  sponsored: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click', 'install'])

const router = useRouter()

const { formatNumber, getCategoryColor } = useMarketplaceUtils()

const truncatedDescription = computed(() => {
  if (!props.app.description) return ''
  
  return props.app.description.length > 120
    ? props.app.description.substring(0, 120) + '...'
    : props.app.description
})


const formatInstallCount = count => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M'
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K'
  }
  
  return count.toString()
}

const handleInstall = () => {
  emit('install', props.app)

  // TODO: Show install dialog similar to FluxCloud
  console.log('Installing app:', props.app.displayName || props.app.name)
}

const handleViewApp = () => {
  router.push(`/marketplace/${props.app.uuid || props.app.name}`)
}
</script>

<style scoped>
.flux-app-card {
  height: 100%;
  position: relative;
  transition: all 0.2s ease;
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
}

.flux-app-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.app-icon {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(var(--v-theme-surface), 1);
}

.description-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.sponsored-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
}

.min-width-0 {
  min-width: 0;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .flux-app-card .v-card-text {
    padding: 12px;
  }

  .app-icon {
    width: 40px !important;
    height: 40px !important;
  }
}
</style>