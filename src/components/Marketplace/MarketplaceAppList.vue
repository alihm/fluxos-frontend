<template>
  <VCard>
    <VList>
      <template v-for="(app, index) in apps" :key="app.id">
        <VListItem
          :prepend-avatar="app.logo"
          :title="app.name"
          :subtitle="app.description"
          @click="$router.push(`/marketplace/${app.id}`)"
          class="app-list-item"
        >
          <template #prepend>
            <VAvatar :image="app.logo" size="56">
              <VIcon v-if="!app.logo" icon="mdi-application" />
            </VAvatar>
          </template>

          <template #title>
            <div class="d-flex align-center">
              <span class="text-h6 me-2">{{ app.name }}</span>
              <VChip
                v-if="app.featured"
                color="warning"
                size="x-small"
                prepend-icon="mdi-star"
              >
                Featured
              </VChip>
            </div>
          </template>

          <template #subtitle>
            <div class="mt-1">
              <p class="text-body-2 text-medium-emphasis mb-2">
                {{ app.description }}
              </p>
              <div class="d-flex align-center flex-wrap gap-2 mb-2">
                <VChip
                  size="x-small"
                  color="grey"
                  variant="outlined"
                >
                  by {{ app.author }}
                </VChip>
                <VChip
                  :color="getCategoryColor(app.category)"
                  size="x-small"
                  variant="tonal"
                  class="text-capitalize"
                >
                  {{ app.category }}
                </VChip>
                <VChip
                  v-for="tag in app.tags?.slice(0, 3)"
                  :key="tag"
                  size="x-small"
                  color="primary"
                  variant="outlined"
                >
                  {{ tag }}
                </VChip>
              </div>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center gap-4">
                  <div class="d-flex align-center">
                    <VIcon icon="mdi-star" color="warning" size="16" class="me-1" />
                    <span class="text-body-2">{{ app.rating }}</span>
                  </div>
                  <div class="d-flex align-center">
                    <VIcon icon="mdi-download" size="16" class="me-1" />
                    <span class="text-body-2">{{ formatNumber(app.downloads) }}</span>
                  </div>
                  <div class="text-body-2">
                    v{{ app.version }}
                  </div>
                </div>
                <div class="text-h6 font-weight-bold">
                  {{ app.price ? `$${app.price}` : 'Free' }}
                </div>
              </div>
            </div>
          </template>

          <template #append>
            <div class="d-flex flex-column align-end gap-2">
              <VBtn
                :color="app.price ? 'success' : 'primary'"
                variant="elevated"
                @click.stop="$emit('deploy', app)"
              >
                <VIcon :icon="app.price ? 'mdi-cart' : 'mdi-download'" class="me-1" />
                {{ app.price ? 'Purchase' : 'Deploy' }}
              </VBtn>
              <VBtn
                variant="outlined"
                size="small"
                @click.stop="$router.push(`/marketplace/${app.id}`)"
              >
                Details
              </VBtn>
            </div>
          </template>
        </VListItem>

        <VDivider v-if="index < apps.length - 1" />
      </template>
    </VList>
  </VCard>
</template>

<script setup>
import { useMarketplaceUtils } from '@/composables/useMarketplaceUtils'

const props = defineProps({
  apps: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['select', 'deploy'])

const { formatNumber, getCategoryColor } = useMarketplaceUtils()
</script>

<style scoped>
.app-list-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
  padding: 16px;
}

.app-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.v-list-item__prepend {
  margin-inline-end: 16px;
}

.v-list-item__append {
  margin-inline-start: 16px;
}
</style>
