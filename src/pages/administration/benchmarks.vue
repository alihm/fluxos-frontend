<template>
  <div>
    <!-- Loading State -->
    <LoadingSpinner
      v-if="loading"
      icon="mdi-speedometer"
      :title="t('pages.administration.benchmarks.loadingTitle')"
    />

    <!-- Maintenance/Error State -->
    <MaintenanceCard
      v-else-if="error"
      :title="t('pages.administration.benchmarks.errorTitle')"
      :subtitle="t('pages.administration.benchmarks.errorSubtitle')"
      :description="t('pages.administration.benchmarks.errorDescription')"
      :loading="loading"
      margin-top="-50px"
      @retry="fetchBenchmarks"
    />

    <!-- Content -->
    <div v-else>
      <!-- Page Header -->
      <div class="mb-3">
        <div class="d-flex align-center mb-2">
          <VAvatar color="primary" variant="flat" size="48" class="mr-3">
            <VIcon icon="mdi-speedometer" size="32" color="white" />
          </VAvatar>
          <div>
            <h2 class="text-h5 font-weight-bold">{{ t('pages.administration.benchmarks.title') }}</h2>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ t('pages.administration.benchmarks.subtitle') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Status Overview -->
      <VCard class="mb-3" elevation="1">
        <VCardTitle class="d-flex align-center pa-3 bg-surface">
          <VIcon icon="mdi-chart-bar" size="24" class="mr-2" />
          <span class="text-body-1 font-weight-medium">{{ t('pages.administration.benchmarks.statusOverview') }}</span>
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-3">
          <VRow>
            <!-- Status -->
            <VCol cols="12" md="4" lg="3">
              <VCard variant="tonal" :color="getStatusColor(benchmarkData.status)">
                <VCardText class="pa-3">
                  <div class="d-flex align-center">
                    <VAvatar :color="getStatusColor(benchmarkData.status)" variant="flat" size="40" class="mr-3">
                      <VIcon icon="mdi-check-circle" size="24" color="white" />
                    </VAvatar>
                    <div>
                      <div class="text-body-2 text-medium-emphasis">{{ t('pages.administration.benchmarks.status') }}</div>
                      <div class="text-h6 font-weight-bold">{{ benchmarkData.status || 'N/A' }}</div>
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </VCol>

            <!-- ArcaneOS -->
            <VCol cols="12" md="4" lg="3">
              <VCard variant="tonal" :color="benchmarkData.systemsecure ? 'success' : 'grey'">
                <VCardText class="pa-3">
                  <div class="d-flex align-center">
                    <VAvatar :color="benchmarkData.systemsecure ? 'success' : 'grey'" variant="flat" size="40" class="mr-3">
                      <VIcon icon="mdi-shield-check" size="24" color="white" />
                    </VAvatar>
                    <div>
                      <div class="text-body-2 text-medium-emphasis">{{ t('pages.administration.benchmarks.arcaneOS') }}</div>
                      <div class="text-h6 font-weight-bold">{{ benchmarkData.systemsecure ? 'Yes' : 'No' }}</div>
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </VCol>

            <!-- Thunder -->
            <VCol cols="12" md="4" lg="3">
              <VCard variant="tonal" :color="benchmarkData.thunder ? 'warning' : 'grey'">
                <VCardText class="pa-3">
                  <div class="d-flex align-center">
                    <VAvatar :color="benchmarkData.thunder ? 'warning' : 'grey'" variant="flat" size="40" class="mr-3">
                      <VIcon icon="mdi-lightning-bolt" size="24" color="white" />
                    </VAvatar>
                    <div>
                      <div class="text-body-2 text-medium-emphasis">{{ t('pages.administration.benchmarks.thunder') }}</div>
                      <div class="text-h6 font-weight-bold">{{ benchmarkData.thunder ? 'Yes' : 'No' }}</div>
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </VCol>

            <!-- Architecture -->
            <VCol cols="12" md="4" lg="3">
              <VCard variant="tonal" color="info">
                <VCardText class="pa-3">
                  <div class="d-flex align-center">
                    <VAvatar color="info" variant="flat" size="40" class="mr-3">
                      <VIcon icon="mdi-chip" size="24" color="white" />
                    </VAvatar>
                    <div>
                      <div class="text-body-2 text-medium-emphasis">{{ t('pages.administration.benchmarks.architecture') }}</div>
                      <div class="text-h6 font-weight-bold">{{ benchmarkData.architecture || 'N/A' }}</div>
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>

      <!-- Hardware Information -->
      <VCard class="mb-3" elevation="1">
        <VCardTitle class="d-flex align-center pa-3 bg-surface">
          <VIcon icon="mdi-memory" size="24" class="mr-2" />
          <span class="text-body-1 font-weight-medium">{{ t('pages.administration.benchmarks.hardwareInfo') }}</span>
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-3">
          <VRow>
            <!-- CPU Threads -->
            <VCol cols="12" sm="6" md="4" lg="3">
              <VCard variant="flat" style="background-color: rgba(0, 0, 0, 0.08);" class="border">
                <VCardText class="pa-3">
                  <div class="d-flex align-center">
                    <VAvatar color="primary" variant="flat" size="40" class="mr-3">
                      <VIcon icon="mdi-cpu-32-bit" size="24" color="white" />
                    </VAvatar>
                    <div>
                      <div class="text-body-2 text-medium-emphasis">{{ t('pages.administration.benchmarks.cpuThreads') }}</div>
                      <div class="text-body-1 font-weight-medium">{{ benchmarkData.cores || 'N/A' }}</div>
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </VCol>

            <!-- RAM -->
            <VCol cols="12" sm="6" md="4" lg="3">
              <VCard variant="flat" style="background-color: rgba(0, 0, 0, 0.08);" class="border">
                <VCardText class="pa-3">
                  <div class="d-flex align-center">
                    <VAvatar color="success" variant="flat" size="40" class="mr-3">
                      <VIcon icon="mdi-memory" size="24" color="white" />
                    </VAvatar>
                    <div>
                      <div class="text-body-2 text-medium-emphasis">{{ t('pages.administration.benchmarks.ram') }}</div>
                      <div class="text-body-1 font-weight-medium">{{ benchmarkData.ram ? `${benchmarkData.ram} GB` : 'N/A' }}</div>
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </VCol>

            <!-- CPU Speed -->
            <VCol cols="12" sm="6" md="4" lg="3">
              <VCard variant="flat" style="background-color: rgba(0, 0, 0, 0.08);" class="border">
                <VCardText class="pa-3">
                  <div class="d-flex align-center">
                    <VAvatar color="warning" variant="flat" size="40" class="mr-3">
                      <VIcon icon="mdi-speedometer" size="24" color="white" />
                    </VAvatar>
                    <div>
                      <div class="text-body-2 text-medium-emphasis">{{ t('pages.administration.benchmarks.cpuSpeed') }}</div>
                      <div class="text-body-1 font-weight-medium">{{ benchmarkData.eps ? `${benchmarkData.eps.toFixed(2)} eps` : 'N/A' }}</div>
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>

      <!-- Network Information -->
      <VCard class="mb-3" elevation="1">
        <VCardTitle class="d-flex align-center pa-3 bg-surface">
          <VIcon icon="mdi-network" size="24" class="mr-2" />
          <span class="text-body-1 font-weight-medium">{{ t('pages.administration.benchmarks.networkInfo') }}</span>
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-3">
          <VRow>
            <!-- IP Address -->
            <VCol cols="12" sm="6" md="4" lg="3">
              <VCard variant="flat" style="background-color: rgba(0, 0, 0, 0.08);" class="border">
                <VCardText class="pa-3">
                  <div class="d-flex align-center">
                    <VAvatar color="info" variant="flat" size="40" class="mr-3">
                      <VIcon icon="mdi-ip-network" size="24" color="white" />
                    </VAvatar>
                    <div class="overflow-hidden">
                      <div class="text-body-2 text-medium-emphasis">{{ t('pages.administration.benchmarks.ipAddress') }}</div>
                      <div class="text-body-1 font-weight-medium text-truncate" :title="benchmarkData.ipaddress">{{ benchmarkData.ipaddress || 'N/A' }}</div>
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </VCol>

            <!-- Download Speed -->
            <VCol cols="12" sm="6" md="4" lg="3">
              <VCard variant="flat" style="background-color: rgba(0, 0, 0, 0.08);" class="border">
                <VCardText class="pa-3">
                  <div class="d-flex align-center">
                    <VAvatar color="success" variant="flat" size="40" class="mr-3">
                      <VIcon icon="mdi-download" size="24" color="white" />
                    </VAvatar>
                    <div>
                      <div class="text-body-2 text-medium-emphasis">{{ t('pages.administration.benchmarks.downloadSpeed') }}</div>
                      <div class="text-body-1 font-weight-medium">{{ benchmarkData.download_speed ? `${benchmarkData.download_speed.toFixed(2)} Mb/s` : 'N/A' }}</div>
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </VCol>

            <!-- Upload Speed -->
            <VCol cols="12" sm="6" md="4" lg="3">
              <VCard variant="flat" style="background-color: rgba(0, 0, 0, 0.08);" class="border">
                <VCardText class="pa-3">
                  <div class="d-flex align-center">
                    <VAvatar color="primary" variant="flat" size="40" class="mr-3">
                      <VIcon icon="mdi-upload" size="24" color="white" />
                    </VAvatar>
                    <div>
                      <div class="text-body-2 text-medium-emphasis">{{ t('pages.administration.benchmarks.uploadSpeed') }}</div>
                      <div class="text-body-1 font-weight-medium">{{ benchmarkData.upload_speed ? `${benchmarkData.upload_speed.toFixed(2)} Mb/s` : 'N/A' }}</div>
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </VCol>

            <!-- Ping -->
            <VCol cols="12" sm="6" md="4" lg="3">
              <VCard variant="flat" style="background-color: rgba(0, 0, 0, 0.08);" class="border">
                <VCardText class="pa-3">
                  <div class="d-flex align-center">
                    <VAvatar color="warning" variant="flat" size="40" class="mr-3">
                      <VIcon icon="mdi-timer-outline" size="24" color="white" />
                    </VAvatar>
                    <div>
                      <div class="text-body-2 text-medium-emphasis">{{ t('pages.administration.benchmarks.ping') }}</div>
                      <div class="text-body-1 font-weight-medium">{{ benchmarkData.ping ? `${benchmarkData.ping.toFixed(2)} ms` : 'N/A' }}</div>
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>

      <!-- Disk Information -->
      <VCard v-if="benchmarkData.disksinfo && benchmarkData.disksinfo.length > 0" class="mb-3" elevation="1">
        <VCardTitle class="d-flex align-center pa-3 bg-surface">
          <VIcon icon="mdi-harddisk" size="24" class="mr-2" />
          <span class="text-body-1 font-weight-medium">{{ t('pages.administration.benchmarks.diskInfo') }}</span>
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-3">
          <VRow>
            <VCol
              v-for="(disk, index) in benchmarkData.disksinfo"
              :key="index"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <VCard variant="flat" style="background-color: rgba(0, 0, 0, 0.08);" class="border">
                <VCardText class="pa-3">
                  <div class="d-flex align-center">
                    <VAvatar color="info" variant="flat" size="40" class="mr-3">
                      <VIcon icon="mdi-harddisk" size="24" color="white" />
                    </VAvatar>
                    <div class="overflow-hidden">
                      <div class="text-body-2 text-medium-emphasis">{{ disk.disk || `Disk ${index + 1}` }}</div>
                      <div class="text-body-2">{{ t('pages.administration.benchmarks.size') }}: {{ disk.size || 'N/A' }} GB</div>
                      <div class="text-body-2">{{ t('pages.administration.benchmarks.writeSpeed') }}: {{ disk.writespeed ? `${disk.writespeed} MB/s` : 'N/A' }}</div>
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>

      <!-- Additional Details -->
      <VCard class="mb-3" elevation="1">
        <VCardTitle class="d-flex align-center pa-3 bg-surface">
          <VIcon icon="mdi-information-outline" size="24" class="mr-2" />
          <span class="text-body-1 font-weight-medium">{{ t('pages.administration.benchmarks.additionalDetails') }}</span>
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-3">
          <VRow>
            <!-- Time -->
            <VCol cols="12" sm="6" md="4" lg="3">
              <VCard variant="flat" style="background-color: rgba(0, 0, 0, 0.08);" class="border">
                <VCardText class="pa-3">
                  <div class="d-flex align-center">
                    <VAvatar color="grey" variant="flat" size="40" class="mr-3">
                      <VIcon icon="mdi-clock-outline" size="24" color="white" />
                    </VAvatar>
                    <div class="overflow-hidden">
                      <div class="text-body-2 text-medium-emphasis">{{ t('pages.administration.benchmarks.time') }}</div>
                      <div class="text-body-1 font-weight-medium text-truncate" :title="formatTime(benchmarkData.time)">
                        {{ formatTime(benchmarkData.time) }}
                      </div>
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </VCol>

            <!-- Error if present -->
            <VCol v-if="benchmarkData.error" cols="12" sm="6" md="4" lg="3">
              <VCard variant="tonal" color="error">
                <VCardText class="pa-3">
                  <div class="d-flex align-center">
                    <VAvatar color="error" variant="flat" size="40" class="mr-3">
                      <VIcon icon="mdi-alert-circle" size="24" color="white" />
                    </VAvatar>
                    <div class="overflow-hidden">
                      <div class="text-body-2 text-medium-emphasis">{{ t('pages.administration.benchmarks.error') }}</div>
                      <div class="text-body-1 font-weight-medium text-truncate" :title="benchmarkData.error">
                        {{ benchmarkData.error }}
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
            <span class="text-body-1 font-weight-medium">{{ t('pages.administration.benchmarks.rawData') }}</span>
          </div>
          <VBtn
            size="small"
            variant="outlined"
            color="primary"
            @click="copyToClipboard"
          >
            <VIcon icon="mdi-content-copy" size="18" class="mr-1" />
            {{ t('pages.administration.benchmarks.copy') }}
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
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSEONoIndex } from '@/composables/useSEO'
import { useSnackbar } from '@/composables/useSnackbar'
import BenchmarkService from '@/services/BenchmarkService'
import LoadingSpinner from '@/components/Marketplace/LoadingSpinner.vue'
import MaintenanceCard from '@/components/Marketplace/MaintenanceCard.vue'

// Prevent indexing of benchmarks admin page (private admin data)
useSEONoIndex()

const { t } = useI18n()
const { showSnackbar } = useSnackbar()
const loading = ref(true)
const error = ref(null)

// Benchmark data state
const benchmarkData = ref({})
const rawJsonData = ref('')

// Get status color based on status value
const getStatusColor = status => {
  if (!status) return 'grey'
  const statusLower = status.toLowerCase()
  if (statusLower === 'online' || statusLower === 'running' || statusLower === 'ok') return 'success'
  if (statusLower === 'offline' || statusLower === 'error' || statusLower === 'failed') return 'error'
  if (statusLower === 'pending' || statusLower === 'starting') return 'warning'

  return 'primary'
}

// Format timestamp to readable date
const formatTime = timestamp => {
  if (!timestamp) return 'N/A'

  return new Date(timestamp * 1000).toLocaleString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// Copy raw JSON to clipboard
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(rawJsonData.value)
    showSnackbar(t('pages.administration.benchmarks.copiedToClipboard'), 'success')
  } catch (err) {
    showSnackbar(t('pages.administration.benchmarks.copyFailed'), 'error')
  }
}

// Fetch benchmark information
const fetchBenchmarks = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await BenchmarkService.getBenchmarks()

    if (response?.data?.status === 'error') {
      error.value = response.data.data || { message: 'An error occurred while loading benchmark information' }

      return
    }

    if (response?.data?.status === 'success' && response?.data?.data) {
      benchmarkData.value = response.data.data
      rawJsonData.value = JSON.stringify(response.data.data, null, 4)
    }
  } catch (err) {
    console.error('Error fetching benchmarks:', err)
    error.value = {
      name: 'Connection Error',
      message: 'Unable to connect to the benchmark service. Please check your connection and try again.',
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchBenchmarks()
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
