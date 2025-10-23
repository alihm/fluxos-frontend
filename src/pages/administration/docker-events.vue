<template>
  <div>
    <!-- Loading State -->
    <LoadingSpinner
      v-if="loading"
      icon="mdi-docker"
      :title="t('pages.administration.dockerEvents.loadingTitle')"
    />

    <!-- Content -->
    <div v-else>
      <!-- Page Header -->
      <div class="mb-3">
        <div class="d-flex align-center mb-2">
          <VAvatar color="primary" variant="flat" size="48" class="mr-3">
            <VIcon icon="mdi-docker" size="32" color="white" />
          </VAvatar>
          <div>
            <h2 class="text-h5 font-weight-bold">{{ t('pages.administration.dockerEvents.title') }}</h2>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ t('pages.administration.dockerEvents.subtitle') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Docker Events Content -->
      <VCard elevation="1">
        <VCardTitle class="d-flex align-center pa-3 bg-surface">
          <VIcon icon="mdi-timeline-clock" size="24" class="mr-2" />
          <span class="text-body-1 font-weight-medium">{{ t('pages.administration.dockerEvents.recentEvents') }}</span>
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-3">
          <div v-if="events.length === 0" class="text-center pa-6">
            <VIcon icon="mdi-information-outline" size="48" color="grey" class="mb-3" />
            <p class="text-body-1 text-medium-emphasis">{{ t('pages.administration.dockerEvents.noEventsAvailable') }}</p>
          </div>
          <div v-else>
            <!-- Events will be displayed here -->
            <pre>{{ events }}</pre>
          </div>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSnackbar } from '@/composables/useSnackbar'
import LoadingSpinner from '@/components/Marketplace/LoadingSpinner.vue'

const { t } = useI18n()
const { showSnackbar } = useSnackbar()
const loading = ref(true)
const events = ref([])

// Fetch Docker events
const fetchDockerEvents = async () => {
  loading.value = true

  // Start loading data and 2s timer in parallel
  const dataPromise = (async () => {
    try {
      // TODO: Implement Docker events API call
      console.log('Fetching Docker events...')

      // Placeholder - replace with actual API call
      events.value = []
    } catch (error) {
      console.error('Error fetching Docker events:', error)
      showSnackbar(t('pages.administration.dockerEvents.errorLoadingEvents'), 'error', 3000, 'mdi-alert-circle')
    }
  })()

  // Wait for data loading and 2s delay
  const delayPromise = new Promise(resolve => setTimeout(resolve, 2000))

  await Promise.all([dataPromise, delayPromise])
  loading.value = false
}

onMounted(() => {
  fetchDockerEvents()
})
</script>
