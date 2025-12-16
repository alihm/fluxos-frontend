<template>
  <div>
    <!-- Page Header -->
    <div class="mb-3">
      <div class="d-flex align-center mb-2">
        <VAvatar color="primary" variant="flat" size="48" class="mr-3">
          <VIcon icon="mdi-bug-outline" size="32" color="white" />
        </VAvatar>
        <div>
          <h2 class="text-h5 font-weight-bold">{{ t('pages.administration.debug.title') }}</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            {{ t('pages.administration.debug.subtitle') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Instructions -->
    <VCard class="mb-3" elevation="1">
      <VCardText class="pa-3">
        <div class="d-flex align-center">
          <VIcon icon="mdi-information-outline" size="20" class="mr-2 text-info" />
          <span class="text-body-2">{{ t('pages.administration.debug.downloadInstruction') }}</span>
        </div>
        <div class="d-flex align-center mt-1">
          <VIcon icon="mdi-information-outline" size="20" class="mr-2 text-info" />
          <span class="text-body-2">{{ t('pages.administration.debug.showInstruction') }}</span>
        </div>
      </VCardText>
    </VCard>

    <!-- Flux Logs Section -->
    <VCard class="mb-3" elevation="1">
      <VCardTitle class="d-flex align-center pa-3 bg-surface">
        <VIcon icon="mdi-file-document-multiple-outline" size="24" class="mr-2" />
        <span class="text-body-1 font-weight-medium">{{ t('pages.administration.debug.fluxLogs') }}</span>
      </VCardTitle>
      <VDivider />
      <VCardText class="pa-3">
        <VRow>
          <VCol
            v-for="logType in fluxLogTypes"
            :key="logType"
            cols="12"
            sm="6"
            md="3"
          >
            <VCard variant="flat" style="background-color: rgba(0, 0, 0, 0.08);" class="border">
              <VCardText class="pa-3">
                <div class="d-flex align-center mb-3">
                  <VAvatar :color="getLogColor(logType)" variant="flat" size="40" class="mr-3">
                    <VIcon :icon="getLogIcon(logType)" size="24" color="white" />
                  </VAvatar>
                  <div>
                    <div class="text-body-1 font-weight-medium">{{ capitalizeWord(logType) }} {{ t('pages.administration.debug.log') }}</div>
                  </div>
                </div>

                <!-- Download Progress -->
                <div v-if="downloads.flux[logType].downloading" class="mb-3">
                  <VProgressLinear
                    :model-value="getDownloadProgress('flux', logType)"
                    color="primary"
                    height="6"
                    rounded
                  />
                  <div class="d-flex justify-space-between align-center mt-1">
                    <span class="text-caption">
                      {{ formatBytes(downloads.flux[logType].downloaded) }} / {{ formatBytes(downloads.flux[logType].total) }}
                    </span>
                    <VBtn
                      size="x-small"
                      color="error"
                      variant="tonal"
                      @click="cancelDownload('flux', logType)"
                    >
                      {{ t('pages.administration.debug.cancel') }}
                    </VBtn>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="d-flex flex-column gap-2">
                  <VBtn
                    color="primary"
                    variant="outlined"
                    size="small"
                    block
                    :loading="downloads.flux[logType].downloading"
                    @click="showDownloadConfirm('flux', logType)"
                  >
                    <VIcon icon="mdi-download" size="18" class="mr-1" />
                    {{ t('pages.administration.debug.downloadFile') }}
                  </VBtn>
                  <VBtn
                    color="secondary"
                    variant="outlined"
                    size="small"
                    block
                    :loading="tails.flux[logType].loading"
                    @click="showTailConfirm('flux', logType)"
                  >
                    <VIcon icon="mdi-file-eye-outline" size="18" class="mr-1" />
                    {{ t('pages.administration.debug.showFile') }}
                  </VBtn>
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Daemon Debug Section -->
    <VCard class="mb-3" elevation="1">
      <VCardTitle class="d-flex align-center pa-3 bg-surface">
        <VIcon icon="mdi-link-variant" size="24" class="mr-2" />
        <span class="text-body-1 font-weight-medium">{{ t('pages.administration.debug.daemonDebug') }}</span>
      </VCardTitle>
      <VDivider />
      <VCardText class="pa-3">
        <VRow>
          <VCol cols="12" sm="6" md="4">
            <VCard variant="flat" style="background-color: rgba(0, 0, 0, 0.08);" class="border">
              <VCardText class="pa-3">
                <div class="d-flex align-center mb-3">
                  <VAvatar color="info" variant="flat" size="40" class="mr-3">
                    <VIcon icon="mdi-link-variant" size="24" color="white" />
                  </VAvatar>
                  <div>
                    <div class="text-body-1 font-weight-medium">{{ t('pages.administration.debug.daemonDebugFile') }}</div>
                  </div>
                </div>

                <!-- Download Progress -->
                <div v-if="downloads.daemon.downloading" class="mb-3">
                  <VProgressLinear
                    :model-value="getDownloadProgress('daemon')"
                    color="info"
                    height="6"
                    rounded
                  />
                  <div class="d-flex justify-space-between align-center mt-1">
                    <span class="text-caption">
                      {{ formatBytes(downloads.daemon.downloaded) }} / {{ formatBytes(downloads.daemon.total) }}
                    </span>
                    <VBtn
                      size="x-small"
                      color="error"
                      variant="tonal"
                      @click="cancelDownload('daemon')"
                    >
                      {{ t('pages.administration.debug.cancel') }}
                    </VBtn>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="d-flex flex-column gap-2">
                  <VBtn
                    color="info"
                    variant="outlined"
                    size="small"
                    block
                    :loading="downloads.daemon.downloading"
                    @click="showDownloadConfirm('daemon')"
                  >
                    <VIcon icon="mdi-download" size="18" class="mr-1" />
                    {{ t('pages.administration.debug.downloadFile') }}
                  </VBtn>
                  <VBtn
                    color="secondary"
                    variant="outlined"
                    size="small"
                    block
                    :loading="tails.daemon.loading"
                    @click="showTailConfirm('daemon')"
                  >
                    <VIcon icon="mdi-file-eye-outline" size="18" class="mr-1" />
                    {{ t('pages.administration.debug.showFile') }}
                  </VBtn>
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Benchmark Debug Section -->
    <VCard class="mb-3" elevation="1">
      <VCardTitle class="d-flex align-center pa-3 bg-surface">
        <VIcon icon="mdi-speedometer" size="24" class="mr-2" />
        <span class="text-body-1 font-weight-medium">{{ t('pages.administration.debug.benchmarkDebug') }}</span>
      </VCardTitle>
      <VDivider />
      <VCardText class="pa-3">
        <VRow>
          <VCol cols="12" sm="6" md="4">
            <VCard variant="flat" style="background-color: rgba(0, 0, 0, 0.08);" class="border">
              <VCardText class="pa-3">
                <div class="d-flex align-center mb-3">
                  <VAvatar color="warning" variant="flat" size="40" class="mr-3">
                    <VIcon icon="mdi-speedometer" size="24" color="white" />
                  </VAvatar>
                  <div>
                    <div class="text-body-1 font-weight-medium">{{ t('pages.administration.debug.benchmarkDebugFile') }}</div>
                  </div>
                </div>

                <!-- Download Progress -->
                <div v-if="downloads.benchmark.downloading" class="mb-3">
                  <VProgressLinear
                    :model-value="getDownloadProgress('benchmark')"
                    color="warning"
                    height="6"
                    rounded
                  />
                  <div class="d-flex justify-space-between align-center mt-1">
                    <span class="text-caption">
                      {{ formatBytes(downloads.benchmark.downloaded) }} / {{ formatBytes(downloads.benchmark.total) }}
                    </span>
                    <VBtn
                      size="x-small"
                      color="error"
                      variant="tonal"
                      @click="cancelDownload('benchmark')"
                    >
                      {{ t('pages.administration.debug.cancel') }}
                    </VBtn>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="d-flex flex-column gap-2">
                  <VBtn
                    color="warning"
                    variant="outlined"
                    size="small"
                    block
                    :loading="downloads.benchmark.downloading"
                    @click="showDownloadConfirm('benchmark')"
                  >
                    <VIcon icon="mdi-download" size="18" class="mr-1" />
                    {{ t('pages.administration.debug.downloadFile') }}
                  </VBtn>
                  <VBtn
                    color="secondary"
                    variant="outlined"
                    size="small"
                    block
                    :loading="tails.benchmark.loading"
                    @click="showTailConfirm('benchmark')"
                  >
                    <VIcon icon="mdi-file-eye-outline" size="18" class="mr-1" />
                    {{ t('pages.administration.debug.showFile') }}
                  </VBtn>
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Log Output Display -->
    <VCard v-if="logOutput" elevation="1">
      <VCardTitle class="d-flex align-center justify-space-between pa-3 bg-surface">
        <div class="d-flex align-center">
          <VIcon icon="mdi-console" size="24" class="mr-2" />
          <span class="text-body-1 font-weight-medium">{{ logOutputTitle }}</span>
        </div>
        <VBtn
          size="small"
          color="error"
          variant="tonal"
          @click="closeLogOutput"
        >
          <VIcon icon="mdi-close" size="18" />
        </VBtn>
      </VCardTitle>
      <VDivider />
      <VCardText class="pa-0">
        <pre class="log-output pa-4">{{ logOutput }}</pre>
      </VCardText>
    </VCard>

    <!-- Confirmation Dialog -->
    <VDialog v-model="confirmDialog.show" max-width="400">
      <VCard>
        <VCardTitle class="text-h6 pa-4">
          {{ t('pages.administration.debug.confirmTitle') }}
        </VCardTitle>
        <VCardText class="pa-4">
          {{ confirmDialog.message }}
        </VCardText>
        <VCardActions class="pa-4 pt-0">
          <VSpacer />
          <VBtn
            color="grey"
            variant="text"
            @click="confirmDialog.show = false"
          >
            {{ t('pages.administration.debug.cancel') }}
          </VBtn>
          <VBtn
            :color="confirmDialog.color"
            variant="flat"
            @click="executeConfirmAction"
          >
            {{ confirmDialog.confirmText }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSEONoIndex } from '@/composables/useSEO'
import { useSnackbar } from '@/composables/useSnackbar'
import FluxService from '@/services/FluxService'
import DaemonService from '@/services/DaemonService'
import BenchmarkService from '@/services/BenchmarkService'

useSEONoIndex()

const { t } = useI18n()
const { showSnackbar } = useSnackbar()

const fluxLogTypes = ['error', 'warn', 'info', 'debug']

// Download state
const downloads = reactive({
  flux: {
    error: { downloading: false, downloaded: 0, total: 0, cancelToken: null },
    warn: { downloading: false, downloaded: 0, total: 0, cancelToken: null },
    info: { downloading: false, downloaded: 0, total: 0, cancelToken: null },
    debug: { downloading: false, downloaded: 0, total: 0, cancelToken: null },
  },
  daemon: { downloading: false, downloaded: 0, total: 0, cancelToken: null },
  benchmark: { downloading: false, downloaded: 0, total: 0, cancelToken: null },
})

// Tail state
const tails = reactive({
  flux: {
    error: { loading: false },
    warn: { loading: false },
    info: { loading: false },
    debug: { loading: false },
  },
  daemon: { loading: false },
  benchmark: { loading: false },
})

// Log output display
const logOutput = ref('')
const logOutputTitle = ref('')

// Confirmation dialog
const confirmDialog = reactive({
  show: false,
  message: '',
  confirmText: '',
  color: 'primary',
  action: null,
  params: null,
})

// Helper functions
const capitalizeWord = word => word.charAt(0).toUpperCase() + word.slice(1)

const getLogColor = logType => {
  const colors = {
    error: 'error',
    warn: 'warning',
    info: 'info',
    debug: 'success',
  }

  return colors[logType] || 'grey'
}

const getLogIcon = logType => {
  const icons = {
    error: 'mdi-alert-circle',
    warn: 'mdi-alert',
    info: 'mdi-information',
    debug: 'mdi-bug',
  }

  return icons[logType] || 'mdi-file-document'
}

const formatBytes = bytes => {
  if (!bytes || bytes === 0) return '0 B'
  const mb = bytes / 1e6
  if (mb >= 1) return `${mb.toFixed(2)} MB`

  const kb = bytes / 1e3

  return `${kb.toFixed(2)} KB`
}

const getDownloadProgress = (category, logType) => {
  let state
  if (category === 'flux' && logType) {
    state = downloads.flux[logType]
  } else if (category === 'daemon') {
    state = downloads.daemon
  } else if (category === 'benchmark') {
    state = downloads.benchmark
  }
  if (!state || !state.total) return 0

  return (state.downloaded / state.total) * 100
}

// Confirmation dialogs
const showDownloadConfirm = (category, logType) => {
  let title
  if (category === 'flux') {
    title = `${capitalizeWord(logType)} Log`
  } else if (category === 'daemon') {
    title = t('pages.administration.debug.daemonDebugFile')
  } else {
    title = t('pages.administration.debug.benchmarkDebugFile')
  }

  confirmDialog.message = t('pages.administration.debug.downloadConfirmMessage', { title })
  confirmDialog.confirmText = t('pages.administration.debug.download')
  confirmDialog.color = 'primary'
  confirmDialog.action = 'download'
  confirmDialog.params = { category, logType }
  confirmDialog.show = true
}

const showTailConfirm = (category, logType) => {
  let title
  if (category === 'flux') {
    title = `${capitalizeWord(logType)} Log`
  } else if (category === 'daemon') {
    title = t('pages.administration.debug.daemonDebugFile')
  } else {
    title = t('pages.administration.debug.benchmarkDebugFile')
  }

  confirmDialog.message = t('pages.administration.debug.showConfirmMessage', { title })
  confirmDialog.confirmText = t('pages.administration.debug.show')
  confirmDialog.color = 'secondary'
  confirmDialog.action = 'tail'
  confirmDialog.params = { category, logType }
  confirmDialog.show = true
}

const executeConfirmAction = () => {
  const { action, params } = confirmDialog
  confirmDialog.show = false

  if (action === 'download') {
    downloadFile(params.category, params.logType)
  } else if (action === 'tail') {
    tailFile(params.category, params.logType)
  }
}

// Download functionality
const downloadFile = async (category, logType) => {
  const zelidauth = localStorage.getItem('zelidauth')
  if (!zelidauth) {
    showSnackbar(t('pages.administration.debug.authRequired'), 'error')

    return
  }

  let state, endpoint, filename, service

  if (category === 'flux') {
    state = downloads.flux[logType]
    endpoint = `/flux/${logType}log`
    filename = `${logType}.log`
    service = FluxService
  } else if (category === 'daemon') {
    state = downloads.daemon
    endpoint = '/flux/daemondebug'
    filename = 'daemon-debug.log'
    service = DaemonService
  } else {
    state = downloads.benchmark
    endpoint = '/flux/benchmarkdebug'
    filename = 'benchmark-debug.log'
    service = BenchmarkService
  }

  state.downloading = true
  state.downloaded = 0
  state.total = 0
  state.cancelToken = service.cancelToken()

  try {
    const axiosConfig = {
      headers: { zelidauth },
      responseType: 'blob',
      onDownloadProgress: progressEvent => {
        state.downloaded = progressEvent.loaded
        state.total = progressEvent.total || progressEvent.loaded
      },
      cancelToken: state.cancelToken.token,
    }

    const response = await service.justAPI().get(endpoint, axiosConfig)
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    showSnackbar(t('pages.administration.debug.downloadSuccess', { filename }), 'success')
  } catch (error) {
    if (error.message !== 'User download cancelled') {
      console.error('Download error:', error)
      showSnackbar(t('pages.administration.debug.downloadError'), 'error')
    }
  } finally {
    state.downloading = false
    state.downloaded = 0
    state.total = 0
    state.cancelToken = null
  }
}

const cancelDownload = (category, logType) => {
  let state
  if (category === 'flux' && logType) {
    state = downloads.flux[logType]
  } else if (category === 'daemon') {
    state = downloads.daemon
  } else if (category === 'benchmark') {
    state = downloads.benchmark
  }

  if (state?.cancelToken) {
    state.cancelToken.cancel('User download cancelled')
  }
}

// Tail functionality
const tailFile = async (category, logType) => {
  const zelidauth = localStorage.getItem('zelidauth')
  if (!zelidauth) {
    showSnackbar(t('pages.administration.debug.authRequired'), 'error')

    return
  }

  let state, serviceCall, title

  if (category === 'flux') {
    state = tails.flux[logType]
    serviceCall = () => FluxService.tailFluxLog(logType, zelidauth)
    title = `Flux ${capitalizeWord(logType)} Log`
  } else if (category === 'daemon') {
    state = tails.daemon
    serviceCall = () => DaemonService.tailDaemonDebug(zelidauth)
    title = t('pages.administration.debug.daemonDebugFile')
  } else {
    state = tails.benchmark
    serviceCall = () => BenchmarkService.tailBenchmarkDebug(zelidauth)
    title = t('pages.administration.debug.benchmarkDebugFile')
  }

  state.loading = true

  try {
    const response = await serviceCall()

    if (response?.data?.status === 'error') {
      showSnackbar(response.data.data?.message || response.data.data || t('pages.administration.debug.tailError'), 'error')

      return
    }

    if (response?.data?.status === 'success' && response?.data?.data) {
      const message = response.data.data.message || response.data.data
      logOutputTitle.value = `${title} - ${t('pages.administration.debug.last100Lines')}`
      logOutput.value = typeof message === 'string'
        ? message.split('\n').reverse().filter(line => line.trim() !== '').join('\n')
        : JSON.stringify(message, null, 2)
    }
  } catch (error) {
    console.error('Tail error:', error)
    showSnackbar(t('pages.administration.debug.tailError'), 'error')
  } finally {
    state.loading = false
  }
}

const closeLogOutput = () => {
  logOutput.value = ''
  logOutputTitle.value = ''
}
</script>

<style scoped>
.log-output {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 0 0 4px 4px;
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre;
  margin: 0;
  max-height: 500px;
  overflow-y: auto;
}

.gap-2 {
  gap: 8px;
}
</style>

<route lang="yaml">
meta:
  privilege:
    - admin
    - fluxteam
</route>
