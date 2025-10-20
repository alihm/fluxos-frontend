<template>
  <VDialog
    v-model="isOpen"
    max-width="700"
    persistent
  >
    <VCard rounded="xl">
      <VCardTitle class="bg-primary text-white dialog-title d-flex align-center">
        <VIcon>mdi-upload</VIcon>
        <span class="ml-2">Upgrade Application Specification</span>
      </VCardTitle>

      <VCardText class="px-6 pt-6 pb-0">
        <!-- Upgrade info -->
        <div class="text-body-1 mb-4">
          You are about to upgrade this application specification from <strong>v{{ currentVersion }}</strong> to <strong>v{{ targetVersion }}</strong>.
        </div>

        <!-- Warning section - dynamic based on version -->
        <VAlert
          type="warning"
          variant="tonal"
          class="mb-4"
        >
          <div class="font-weight-bold mb-2">The following data will be lost or reset:</div>
          <ul class="ml-2">
            <li v-for="(item, index) in warningItems" :key="index">{{ item }}</li>
          </ul>
        </VAlert>

        <!-- Info section -->
        <VAlert
          type="info"
          variant="tonal"
        >
          <div class="font-weight-bold mb-2">What happens next:</div>
          <ul class="ml-2">
            <li>Specification format will be updated to v{{ targetVersion }}</li>
            <li>You can review and modify the upgraded specification</li>
            <li>You must validate and sign the updated specification</li>
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
          Cancel
        </VBtn>
        <VBtn
          color="warning"
          variant="flat"
          @click="confirmUpgrade"
        >
          <VIcon size="22" class="mr-2">mdi-upload</VIcon>
          Upgrade
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

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

const isOpen = ref(props.modelValue)

// Dynamic warning items based on version
const warningItems = computed(() => {
  const items = []

  // All versions lose tiered field
  if (props.currentVersion >= 3 && props.currentVersion <= 7) {
    items.push('Tiered pricing configurations (tiered field)')
  }

  // V3 and earlier don't have these fields, so they get reset
  if (props.currentVersion < 5) {
    items.push('Custom contacts (reset to empty)')
    items.push('Custom geolocation (reset to empty)')
  }

  if (props.currentVersion < 6) {
    items.push('Custom expire value (reset to 22000)')
  }

  // V1-V2 specific warnings
  if (props.currentVersion <= 2) {
    items.push('Port type conversions (string → number)')
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
