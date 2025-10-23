<template>
  <VDialog
    v-model="isOpen"
    max-width="700"
    persistent
  >
    <VCard rounded="xl">
      <VCardTitle class="bg-primary text-white dialog-title d-flex align-center">
        <VIcon>mdi-upload</VIcon>
        <span class="ml-2">{{ t('components.dialogs.upgradeSpecDialog.title') }}</span>
      </VCardTitle>

      <VCardText class="px-6 pt-6 pb-0">
        <!-- Upgrade info -->
        <div class="text-body-1 mb-4">
          {{ t('components.dialogs.upgradeSpecDialog.upgradeInfo', { currentVersion, targetVersion }) }}
        </div>

        <!-- Warning section - dynamic based on version -->
        <VAlert
          type="warning"
          variant="tonal"
          class="mb-4"
        >
          <div class="font-weight-bold mb-2">{{ t('components.dialogs.upgradeSpecDialog.dataLossWarning') }}</div>
          <ul class="ml-2">
            <li v-for="(item, index) in warningItems" :key="index">{{ item }}</li>
          </ul>
        </VAlert>

        <!-- Info section -->
        <VAlert
          type="info"
          variant="tonal"
        >
          <div class="font-weight-bold mb-2">{{ t('components.dialogs.upgradeSpecDialog.nextSteps') }}</div>
          <ul class="ml-2">
            <li>{{ t('components.dialogs.upgradeSpecDialog.step1', { targetVersion }) }}</li>
            <li>{{ t('components.dialogs.upgradeSpecDialog.step2') }}</li>
            <li>{{ t('components.dialogs.upgradeSpecDialog.step3') }}</li>
          </ul>
        </VAlert>
      </VCardText>

      <VCardActions class="dialog-actions">
        <VSpacer />
        <VBtn
          color="error"
          variant="text"
          @click="closeDialog"
        >
          {{ t('common.buttons.cancel') }}
        </VBtn>
        <VBtn
          color="warning"
          variant="flat"
          @click="confirmUpgrade"
        >
          <VIcon size="22" class="mr-2">mdi-upload</VIcon>
          {{ t('components.dialogs.upgradeSpecDialog.upgrade') }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  currentVersion: {
    type: Number,
    required: true,
  },
  targetVersion: {
    type: Number,
    default: 8,
  },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const { t } = useI18n()

const isOpen = ref(props.modelValue)

// Dynamic warning items based on version
const warningItems = computed(() => {
  const items = []

  // All versions lose tiered field
  if (props.currentVersion >= 3 && props.currentVersion <= 7) {
    items.push(t('components.dialogs.upgradeSpecDialog.warnings.tieredPricing'))
  }

  // V3 and earlier don't have these fields, so they get reset
  if (props.currentVersion < 5) {
    items.push(t('components.dialogs.upgradeSpecDialog.warnings.customContacts'))
    items.push(t('components.dialogs.upgradeSpecDialog.warnings.customGeolocation'))
  }

  if (props.currentVersion < 6) {
    items.push(t('components.dialogs.upgradeSpecDialog.warnings.customExpire'))
  }

  // V1-V2 specific warnings
  if (props.currentVersion <= 2) {
    items.push(t('components.dialogs.upgradeSpecDialog.warnings.portConversion'))
  }

  return items
})

watch(() => props.modelValue, newValue => {
  isOpen.value = newValue
})

watch(isOpen, newValue => {
  if (!newValue) {
    emit('update:modelValue', false)
  }
})

function closeDialog() {
  isOpen.value = false
}

function confirmUpgrade() {
  emit('confirm')
  closeDialog()
}
</script>

<style scoped>
.dialog-title {
  border-radius: 16px 16px 0 0 !important;
  padding-left: 32px !important;
  padding-right: 32px !important;
  padding-top: 10px !important;
  padding-bottom: 10px !important;
}

.dialog-actions {
  padding: 13px 32px 13px 32px !important;
}

ul {
  list-style-position: outside;
  padding-left: 20px;
}

li {
  margin-bottom: 4px;
}
</style>
