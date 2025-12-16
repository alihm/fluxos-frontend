<template>
  <div>
    <!-- Loading State -->
    <LoadingSpinner
      v-if="loading"
      icon="mdi-link-variant"
      :title="t('pages.administration.daemon.loadingTitle')"
    />

    <!-- Maintenance/Error State -->
    <MaintenanceCard
      v-else-if="error"
      :title="t('pages.administration.daemon.errorTitle')"
      :subtitle="t('pages.administration.daemon.errorSubtitle')"
      :description="t('pages.administration.daemon.errorDescription')"
      :loading="loading"
      margin-top="-50px"
      @retry="fetchBlockchainInfo"
    />

    <!-- Content -->
    <div v-else>
      <!-- Page Header -->
      <div class="mb-3">
        <div class="d-flex align-center mb-2">
          <VAvatar color="primary" variant="flat" size="48" class="mr-3">
            <VIcon icon="mdi-link-variant" size="32" color="white" />
          </VAvatar>
          <div>
            <h2 class="text-h5 font-weight-bold">{{ t('pages.administration.daemon.title') }}</h2>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ t('pages.administration.daemon.subtitle') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Blockchain Overview -->
      <VCard class="mb-3" elevation="1">
        <VCardTitle class="d-flex align-center pa-3 bg-surface">
          <VIcon icon="mdi-cube-outline" size="24" class="mr-2" />
          <span class="text-body-1 font-weight-medium">{{ t('pages.administration.daemon.blockchainOverview') }}</span>
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-3">
          <VRow>
            <!-- Chain -->
            <VCol cols="12" md="4" lg="3">
              <VCard variant="tonal" color="primary">
                <VCardText class="pa-3">
                  <div class="d-flex align-center">
                    <VAvatar color="primary" variant="flat" size="40" class="mr-3">
                      <VIcon icon="mdi-link-variant" size="24" color="white" />
                    </VAvatar>
                    <div>
                      <div class="text-body-2 text-medium-emphasis">{{ t('pages.administration.daemon.chain') }}</div>
                      <div class="text-h6 font-weight-bold">{{ blockchainInfo.chain || 'N/A' }}</div>
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </VCol>

            <!-- Blocks -->
            <VCol cols="12" md="4" lg="3">
              <VCard variant="tonal" color="success">
                <VCardText class="pa-3">
                  <div class="d-flex align-center">
                    <VAvatar color="success" variant="flat" size="40" class="mr-3">
                      <VIcon icon="mdi-cube" size="24" color="white" />
                    </VAvatar>
                    <div>
                      <div class="text-body-2 text-medium-emphasis">{{ t('pages.administration.daemon.blocks') }}</div>
                      <div class="text-h6 font-weight-bold">{{ formatNumber(blockchainInfo.blocks) }}</div>
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </VCol>

            <!-- Headers -->
            <VCol cols="12" md="4" lg="3">
              <VCard variant="tonal" color="info">
                <VCardText class="pa-3">
                  <div class="d-flex align-center">
                    <VAvatar color="info" variant="flat" size="40" class="mr-3">
                      <VIcon icon="mdi-file-document-outline" size="24" color="white" />
                    </VAvatar>
                    <div>
                      <div class="text-body-2 text-medium-emphasis">{{ t('pages.administration.daemon.headers') }}</div>
                      <div class="text-h6 font-weight-bold">{{ formatNumber(blockchainInfo.headers) }}</div>
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </VCol>

            <!-- Difficulty -->
            <VCol cols="12" md="4" lg="3">
              <VCard variant="tonal" color="warning">
                <VCardText class="pa-3">
                  <div class="d-flex align-center">
                    <VAvatar color="warning" variant="flat" size="40" class="mr-3">
                      <VIcon icon="mdi-speedometer" size="24" color="white" />
                    </VAvatar>
                    <div>
                      <div class="text-body-2 text-medium-emphasis">{{ t('pages.administration.daemon.difficulty') }}</div>
                      <div class="text-h6 font-weight-bold">{{ formatDifficulty(blockchainInfo.difficulty) }}</div>
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>

      <!-- Blockchain Details -->
      <VCard class="mb-3" elevation="1">
        <VCardTitle class="d-flex align-center pa-3 bg-surface">
          <VIcon icon="mdi-information-outline" size="24" class="mr-2" />
          <span class="text-body-1 font-weight-medium">{{ t('pages.administration.daemon.blockchainDetails') }}</span>
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-3">
          <VRow>
            <VCol
              v-for="detail in blockchainDetails"
              :key="detail.key"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <VCard variant="flat" style="background-color: rgba(0, 0, 0, 0.08);" class="border">
                <VCardText class="pa-3">
                  <div class="d-flex align-center">
                    <VAvatar :color="detail.color" variant="flat" size="40" class="mr-3">
                      <VIcon :icon="detail.icon" size="24" color="white" />
                    </VAvatar>
                    <div class="overflow-hidden">
                      <div class="text-body-2 text-medium-emphasis">{{ detail.label }}</div>
                      <div class="text-body-1 font-weight-medium text-truncate" :title="detail.value">
                        {{ detail.value }}
                      </div>
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>

      <!-- Raw JSON Data -->
      <VCard elevation="1">
        <VCardTitle class="d-flex align-center justify-space-between pa-3 bg-surface">
          <div class="d-flex align-center">
            <VIcon icon="mdi-code-json" size="24" class="mr-2" />
            <span class="text-body-1 font-weight-medium">{{ t('pages.administration.daemon.rawData') }}</span>
          </div>
          <VBtn
            size="small"
            variant="outlined"
            color="primary"
            @click="copyToClipboard"
          >
            <VIcon icon="mdi-content-copy" size="18" class="mr-1" />
            {{ t('pages.administration.daemon.copy') }}
          </VBtn>
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-0">
          <pre class="raw-json-output pa-4">{{ rawJsonData }}</pre>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSEONoIndex } from '@/composables/useSEO'
import { useSnackbar } from '@/composables/useSnackbar'
import DaemonService from '@/services/DaemonService'
import LoadingSpinner from '@/components/Marketplace/LoadingSpinner.vue'
import MaintenanceCard from '@/components/Marketplace/MaintenanceCard.vue'

// Prevent indexing of daemon admin page (private admin data)
useSEONoIndex()

const { t } = useI18n()
const { showSnackbar } = useSnackbar()
const loading = ref(true)
const error = ref(null)

// Blockchain information state
const blockchainInfo = ref({})
const rawJsonData = ref('')

// Computed blockchain details for display
const blockchainDetails = computed(() => {
  const info = blockchainInfo.value
  if (!info || Object.keys(info).length === 0) return []

  const details = []

  const fieldConfig = {
    verificationprogress: { label: t('pages.administration.daemon.verificationProgress'), icon: 'mdi-check-circle-outline', color: 'success' },
    chainwork: { label: t('pages.administration.daemon.chainWork'), icon: 'mdi-link-box-outline', color: 'primary' },
    pruned: { label: t('pages.administration.daemon.pruned'), icon: 'mdi-content-cut', color: 'grey' },
    size_on_disk: { label: t('pages.administration.daemon.sizeOnDisk'), icon: 'mdi-harddisk', color: 'info' },
    commitments: { label: t('pages.administration.daemon.commitments'), icon: 'mdi-checkbox-marked-circle-outline', color: 'purple' },
    valuePools: { label: t('pages.administration.daemon.valuePools'), icon: 'mdi-pool', color: 'cyan' },
    bestblockhash: { label: t('pages.administration.daemon.bestBlockHash'), icon: 'mdi-pound', color: 'warning' },
  }

  // Add configured fields if they exist
  for (const [key, config] of Object.entries(fieldConfig)) {
    if (info[key] !== undefined) {
      let value = info[key]

      // Format specific values
      if (key === 'verificationprogress') {
        value = `${(value * 100).toFixed(4)}%`
      } else if (key === 'pruned') {
        value = value ? 'Yes' : 'No'
      } else if (key === 'size_on_disk') {
        value = formatBytes(value)
      } else if (key === 'valuePools') {
        value = Array.isArray(value) ? `${value.length} pool(s)` : String(value)
      } else if (typeof value === 'object') {
        value = JSON.stringify(value)
      }

      details.push({
        key,
        label: config.label,
        value: String(value),
        icon: config.icon,
        color: config.color,
      })
    }
  }

  return details
})

// Format number with commas
const formatNumber = value => {
  if (value === undefined || value === null) return 'N/A'

  return Number(value).toLocaleString()
}

// Format difficulty
const formatDifficulty = value => {
  if (value === undefined || value === null) return 'N/A'
  const num = Number(value)
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`

  return num.toFixed(2)
}

// Format bytes to human readable
const formatBytes = bytes => {
  if (!bytes) return 'N/A'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let unitIndex = 0
  let size = bytes
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`
}

// Copy raw JSON to clipboard
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(rawJsonData.value)
    showSnackbar(t('pages.administration.daemon.copiedToClipboard'), 'success')
  } catch (err) {
    showSnackbar(t('pages.administration.daemon.copyFailed'), 'error')
  }
}

// Fetch blockchain information
const fetchBlockchainInfo = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await DaemonService.getBlockchainInfo()

    if (response?.data?.status === 'error') {
      error.value = response.data.data || { message: 'An error occurred while loading blockchain information' }

      return
    }

    if (response?.data?.status === 'success' && response?.data?.data) {
      blockchainInfo.value = response.data.data
      rawJsonData.value = JSON.stringify(response.data.data, null, 4)
    }
  } catch (err) {
    console.error('Error fetching blockchain info:', err)
    error.value = {
      name: 'Connection Error',
      message: 'Unable to connect to the daemon. Please check your connection and try again.',
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchBlockchainInfo()
})
</script>

<style scoped>
.raw-json-output {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 0 0 4px 4px;
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre;
  margin: 0;
  max-height: 400px;
  overflow-y: auto;
}
</style>

<route lang="yaml">
meta:
  privilege:
    - admin
    - fluxteam
</route>
