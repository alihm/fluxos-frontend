<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { v4 as uuid } from 'uuid'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: String,
  componentIndex: Number,
  newApp: Boolean,
  specVersion: Number, // App specification version
})

const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()

const expandedPanels = ref([])

const baseSyncModes = computed(() => {
  const modes = [
    { value: '', label: t('core.volumePathBuilder.modeNone') },
    { value: 'r', label: t('core.volumePathBuilder.modePhasedMasterMaster') },
    { value: 'g', label: t('core.volumePathBuilder.modeMasterSlave') },
  ]

  // Only include 's' mode if it's already being used in the existing data
  if (!props.newApp && props.modelValue && props.modelValue.includes('s:')) {
    modes.splice(1, 0, { value: 's', label: t('core.volumePathBuilder.modeMasterMaster') })
  }

  return modes
})

const normalize = p =>
  '/' + p.replace(/^\/+/, '').replace(/\/+$/, '').replace(/\/+/g, '/')

function getAllowedMountModes() {
  const modes = []
  for (let i = 0; i <= props.componentIndex; i++) {
    modes.push({
      value: String(i),
      label: i === props.componentIndex
        ? t('core.volumePathBuilder.remountFromSameComponent', { index: i })
        : t('core.volumePathBuilder.mountFromComponent', { index: i }),
    })
  }

  return modes
}

function getAllModes() {
  return [...baseSyncModes.value, ...getAllowedMountModes()]
}

const entries = ref([])
const baseRoot = ref(null)

function parseInitialValue(containerData) {
  if (!containerData) return []

  return containerData.split('|').map((entry, index) => {
    const match = entry.match(/^([srg]|\d*?):(\/.*)$/)
    const modeVal = match?.[1] || ''
    const path = match?.[2] || entry
    const allModes = getAllModes()
    const mode = allModes.find(m => m.value === modeVal) || { value: modeVal, label: `${modeVal}:` }
    if (index === 0) baseRoot.value = path
    
    return { id: uuid(), mode, path }
  })
}

onMounted(() => {
  entries.value = parseInitialValue(props.modelValue)
  if (entries.value.length === 0) {
    entries.value.push({ id: uuid(), mode: baseSyncModes.value[0], path: '' })
  } else {
    entries.value.forEach(e => {
      e.path = normalize(e.path || '')
    })
  }
})

function normalizePath(index) {
  const entry = entries.value[index]
  if (!entry) return
  const current = entry.path || ''
  const normalized = normalize(current)
  if (current !== normalized) {
    entry.path = normalized
  }
  validateAndEmit()
}

function getAvailableModes(index) {
  const mountModes = getAllowedMountModes()
  const firstModeVal = entries.value[0]?.mode?.value || entries.value[0]?.mode || ''
  if (index === 0) return [...baseSyncModes.value, ...mountModes]
  if (['s', 'r', 'g'].includes(firstModeVal)) return mountModes
  
  return [...baseSyncModes.value.filter(m => m.value !== ''), ...mountModes]
}

const baseIsMount = computed(() => {
  const modeVal = typeof entries.value[0]?.mode === 'object'
    ? entries.value[0]?.mode?.value
    : entries.value[0]?.mode
  
  return /^\d+$/.test(modeVal)
})

function validateEntries(entries, componentIndex) {
  const logs = []
  const normalize = p => '/' + p.replace(/^\/+/, '').replace(/\/+$/, '').replace(/\/+/g, '/')

  if (!entries || entries.length === 0 || !entries[0]) return logs

  const first = entries[0]
  const basePath = normalize(first?.path || '')
  const baseMode = typeof first?.mode === 'object' ? first.mode?.value : first.mode
  const usedSyncModes = new Set(
    entries.map(e => {
      const m = typeof e?.mode === 'object' ? e?.mode?.value : e?.mode
      
      return ['s', 'r', 'g'].includes(m) ? m : null
    }).filter(Boolean),
  )
  const seenPaths = new Set()

  entries.forEach((entry, index) => {
    if (!entry) return
    const path = normalize(entry.path || '')
    const mode = typeof entry.mode === 'object' ? entry.mode?.value : entry.mode

    if (!path) logs.push({ index, mode, path, reason: t('core.volumePathBuilder.validationPathEmpty') })
    if (index === 0 && /^\d+$/.test(mode)) logs.push({ index, mode, path, reason: t('core.volumePathBuilder.validationBaseCannotBeMount') })
    if (seenPaths.has(path)) logs.push({ index, mode, path, reason: t('core.volumePathBuilder.validationDuplicatePath') })
    else seenPaths.add(path)
    if (!path.startsWith('/')) logs.push({ index, mode, path, reason: t('core.volumePathBuilder.validationPathMustStartWithSlash') })
    const invalidChars = /[<>:"\\|?*\x00-\x1F;]/

    const parts = path.split('/').filter(p => p !== '')

    if (parts.some(p => invalidChars.test(p))) {
      logs.push({ index, mode, path, reason: t('core.volumePathBuilder.validationInvalidCharacters') })
    }
    if (/^\d+$/.test(mode) && parseInt(mode) > componentIndex)
      logs.push({ index, mode, path, reason: t('core.volumePathBuilder.validationMountFutureComponent') })
    if (usedSyncModes.size > 1 && ['s', 'r', 'g'].includes(mode))
      logs.push({ index, mode, path, reason: t('core.volumePathBuilder.validationMixedSyncModes') })
    if (index !== 0 && ['s', 'r', 'g'].includes(mode) && !path.startsWith(basePath + '/'))
      logs.push({ index, mode, path, reason: t('core.volumePathBuilder.validationSyncMustBeSubpath', { basePath }) })
    if (index !== 0 && path === basePath)
      logs.push({ index, mode, path, reason: t('core.volumePathBuilder.validationPathCannotEqualBase') })
    if (['s', 'r', 'g'].includes(mode)) {
      const conflicts = entries.filter((e, i2) => {
        if (i2 === index || !e) return false
        const m = typeof e.mode === 'object' ? e.mode?.value : e.mode
        const p = normalize(e.path || '')

        return ['s', 'r', 'g'].includes(m) && (path.startsWith(p + '/') || p.startsWith(path + '/'))
      })
      if (conflicts.length) logs.push({ index, mode, path, reason: t('core.volumePathBuilder.validationConflictsSyncPath') })
    }
    if (index !== 0 && /^\d+$/.test(mode) && ['s', 'r', 'g'].includes(baseMode)) {
      if (path === basePath || path.startsWith(basePath + '/') || basePath.startsWith(path + '/'))
        logs.push({ index, mode, path, reason: t('core.volumePathBuilder.validationMountOverlapsSyncRoot') })
    }
  })

  return logs
}

const validationLogs = computed(() => validateEntries(entries.value, props.componentIndex))

function getEntryError(index) {
  return validationLogs.value
    .filter(log => log.index === index)
    .map(e => e.reason)
    .join(', ')
}

function validateAndEmit() {
  const logs = validateEntries(entries.value, props.componentIndex)

  const baseMode = typeof entries.value[0]?.mode === 'object'
    ? entries.value[0]?.mode?.value
    : entries.value[0]?.mode

  if (/^\d+$/.test(baseMode) || logs.length > 0) return

  const value = entries.value
    .filter(e => e.path?.trim())
    .map(e => {
      const modeVal = typeof e.mode === 'object' ? e.mode?.value : e.mode
      const path = normalize(e.path || '')
      
      return modeVal ? `${modeVal}:${path}` : path
    })
    .join('|')

  emit('update:modelValue', value)
}

const showAddPath = computed(() => {
  if (props.componentIndex === 0) {
    const first = entries.value[0]
    const mode = first?.mode?.value || first?.mode || ''
    
    return !['s', 'r', 'g'].includes(mode)
  }
  
  return true
})

function addEntry() {
  const firstMode = typeof entries.value[0]?.mode === 'object'
    ? entries.value[0]?.mode?.value
    : entries.value[0]?.mode
  const isLocked = ['s', 'r', 'g'].includes(firstMode)
  const defaultMode = getAvailableModes(entries.value.length).find(m => m.value === (isLocked ? '0' : '')) || baseSyncModes.value[1]
  entries.value.push({ id: uuid(), mode: defaultMode, path: '' })
}

function removeEntry(id) {
  if (entries.value.length <= 1) return
  entries.value = entries.value.filter(e => e.id !== id)

  validateAndEmit()
}

const isUsingSMode = computed(() => {
  return !props.newApp && props.modelValue && props.modelValue.includes('s:')
})

watch(validationLogs, logs => {
  expandedPanels.value = logs.length > 0 ? [0] : []
})
</script>


<template>
  <VCard class="pa-4" variant="tonal">
    <VRow
      v-for="(entry, index) in entries"
      :key="entry.id"
      class="mb-2"
      align="center"
    >
      <VCol cols="3">
        <VSelect
          v-model="entry.mode"
          :items="getAvailableModes(index)"
          item-title="label"
          item-value="value"
          dense
          hide-details
          :label="t('core.volumePathBuilder.labelMode')"
          @blur="validateAndEmit"
        />
      </VCol>

      <VCol cols="8">
        <VTextField
          v-model="entry.path"
          :label="t('core.volumePathBuilder.labelPath')"
          :placeholder="t('core.volumePathBuilder.pathPlaceholder')"
          :error="!!getEntryError(index)"
          dense
          @blur="() => normalizePath(index)"
        />
      </VCol>

      <VCol cols="1" class="text-right">
        <VBtn
          icon
          variant="text"
          @click="removeEntry(entry.id)"
          color="error"
          :disabled="entries.length === 1"
        >
          <VIcon size="22">mdi-delete</VIcon>
        </VBtn>
      </VCol>
    </VRow>

    <VBtn
      v-if="showAddPath"
      @click="addEntry"
      prepend-icon="mdi-plus"
      variant="flat"
      size="small"
      color="primary"
    >
      {{ t('core.volumePathBuilder.addPath') }}
    </VBtn>


    <VDivider class="my-4" />

    <VExpansionPanels v-model="expandedPanels"  variant="accordion" class="mt-4">
      <!-- Panel 1: Validation Logs -->
      <VExpansionPanel>
        <VExpansionPanelTitle class="d-flex align-center">
          <VIcon :color="validationLogs.length === 0 ? 'success' : 'error'" size="21" class="mr-2">{{ validationLogs.length === 0 ? 'mdi-file-document-check' : 'mdi-file-document-remove' }}</VIcon>
          {{ t('core.volumePathBuilder.validationLogs') }}
        </VExpansionPanelTitle>
        <VExpansionPanelText>
          <div v-if="validationLogs.length === 0">
            {{ t('core.volumePathBuilder.noValidationErrors') }}
          </div>
          <VList v-else dense>
            <VListItem
              v-for="(log, idx) in validationLogs"
              :key="idx"
            >
              <VListItemTitle>
                {{ t('core.volumePathBuilder.entryLabel', { index: log.index, mode: log.mode || 'none', path: log.path }) }}
              </VListItemTitle>
              <VListItemSubtitle style="color: #FF4C51">
                {{ log.reason }}
              </VListItemSubtitle>
            </VListItem>
          </VList>
        </VExpansionPanelText>
      </VExpansionPanel>

      <VExpansionPanel>
        <VExpansionPanelTitle class="d-flex align-center">
          <VIcon size="21" class="mr-2">mdi-cog-sync</VIcon>
          {{ t('core.volumePathBuilder.detailedInfoTitle') }}
        </VExpansionPanelTitle>
        <VExpansionPanelText>
          <h4><strong>{{ t('core.volumePathBuilder.syncModeDifferencesTitle') }}</strong></h4>
          <ul class="mb-4 ml-4" style="font-size: 13px">
            <li v-if="isUsingSMode"><strong>{{ t('core.volumePathBuilder.syncModesMasterMasterLabel') }}</strong> {{ t('core.volumePathBuilder.syncModesMasterMasterDesc') }}</li>
            <li><strong>{{ t('core.volumePathBuilder.syncModesPhasedMasterMasterLabel') }}</strong> {{ t('core.volumePathBuilder.syncModesPhasedMasterMasterDesc') }}</li>
            <li><strong>{{ t('core.volumePathBuilder.syncModesMasterSlaveLabel') }}</strong> {{ t('core.volumePathBuilder.syncModesMasterSlaveDesc') }}</li>
          </ul>

          <h4><strong>{{ t('core.volumePathBuilder.rulesTitle') }}</strong></h4>
          <ul class="ml-4" style="font-size: 13px">
            <li>{{ t('core.volumePathBuilder.ruleBaseCannotBeMount') }}</li>
            <li>{{ t('core.volumePathBuilder.ruleOnlyOneSyncMode') }}</li>
            <li>{{ t('core.volumePathBuilder.ruleAllSyncPathsWithinBase') }}</li>
            <li>{{ t('core.volumePathBuilder.ruleSyncFoldersSharedParent') }}</li>
            <li>{{ t('core.volumePathBuilder.ruleSameComponentRemounts') }}</li>
            <li>{{ t('core.volumePathBuilder.ruleOtherMountsReferPrevious') }}</li>
            <li>{{ t('core.volumePathBuilder.ruleNoDuplicatePaths') }}</li>
            <li>{{ t('core.volumePathBuilder.ruleMountPathsNoOverlap') }}</li>
            <li>{{ t('core.volumePathBuilder.ruleSyncSubpathsNoOverlap') }}</li>
            <li>{{ t('core.volumePathBuilder.ruleAllPathsStartSlash') }}</li>
          </ul>
        </VExpansionPanelText>
      </VExpansionPanel>
    </VExpansionPanels>
  </VCard>
</template>

<style scoped>
.v-col {
  padding-top: 4px;
  padding-bottom: 4px;
}
</style>
