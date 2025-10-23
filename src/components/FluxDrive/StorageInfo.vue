<template>
  <VContainer>
    <VCard variant="outlined" class="mt-2">
      <VCardText>
        <div class="d-flex align-center justify-space-between mb-3">
          <h4 class="text-h6">{{ t('components.fluxDrive.storageInfo.title') }}</h4>
          <VProgressCircular
            v-if="loadingStorage"
            indeterminate
            size="20"
            width="2"
          />
        </div>

        <VProgressLinear
          :model-value="storagePercentage"
          color="primary"
          height="8"
          rounded
          class="mb-3"
        />

        <div class="text-center">
          <span class="text-body-2">
            {{ t('components.fluxDrive.storageInfo.usedOf', { used: bytesConversion(usedStorage), total: convertSize(totalStorage) }) }}
          </span>
          <span class="text-body-2 text-medium-emphasis">
            ({{ storagePercentage }}%)
          </span>
        </div>

        <!-- Additional storage details -->
        <VRow class="mt-4" no-gutters>
          <VCol cols="4" class="text-center">
            <div class="text-body-2 text-medium-emphasis">{{ t('components.fluxDrive.storageInfo.usedSpace') }}</div>
            <div class="text-h6 text-primary">{{ bytesConversion(usedStorage) }}</div>
          </VCol>
          <VCol cols="4" class="text-center">
            <div class="text-body-2 text-medium-emphasis">{{ t('components.fluxDrive.storageInfo.available') }}</div>
            <div class="text-h6 text-success">{{ bytesConversion(totalStorage - usedStorage) }}</div>
          </VCol>
          <VCol cols="4" class="text-center">
            <div class="text-body-2 text-medium-emphasis">{{ t('components.fluxDrive.storageInfo.total') }}</div>
            <div class="text-h6">{{ convertSize(totalStorage) }}</div>
          </VCol>
        </VRow>

        <!-- Storage status indicator -->
        <VAlert
          v-if="storagePercentage >= 90"
          type="warning"
          variant="tonal"
          class="mt-4"
          density="compact"
        >
          <template #title>{{ t('components.fluxDrive.storageInfo.almostFull') }}</template>
          {{ t('components.fluxDrive.storageInfo.almostFullMessage', { percentage: storagePercentage }) }}
        </VAlert>
        <VAlert
          v-else-if="storagePercentage >= 75"
          type="info"
          variant="tonal"
          class="mt-4"
          density="compact"
        >
          <template #title>{{ t('components.fluxDrive.storageInfo.statusTitle') }}</template>
          {{ t('components.fluxDrive.storageInfo.statusMessage', { percentage: storagePercentage }) }}
        </VAlert>
      </VCardText>
    </VCard>
  </VContainer>
</template>

<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFluxDrive } from '@/composables/useFluxDrive'

// i18n
const { t } = useI18n()

// Use the composable
const {
  loadingStorage,
  usedStorage,
  totalStorage,
  storagePercentage,
  hasActiveSubscription,
  bytesConversion,
  convertSize,
  fetchStorageInfo,
} = useFluxDrive()

// Only fetch storage info if it hasn't been fetched yet
onMounted(() => {
  // Since checkSubscriptionStatus already fetches storage info,
  // we only need to call fetchStorageInfo if storage info hasn't been fetched yet
  if (!hasActiveSubscription.value || !storagePercentage.value) {
    console.log('📊 StorageInfo component: fetchStorageInfo may be needed')

    // fetchStorageInfo() has internal logic to prevent duplicate calls
    fetchStorageInfo()
  } else {
    console.log('📊 StorageInfo component: storage info already available, skipping fetch')
  }
})
</script>

<style scoped>
/* Component-specific styles if needed */
</style>