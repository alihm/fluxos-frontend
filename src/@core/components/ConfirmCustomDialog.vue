<!-- ConfirmDialog.vue -->
<template>
  <VDialog
    v-model="isDialogOpen"
    :activator="`#${target}`"
    width="400"
  >
    <VCard>
      <VCardTitle class="text-h6 bg-primary">
        {{ title }}
      </VCardTitle>
      <VCardText class="pa-4">
        {{ message }}
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn
          variant="text"
          color="grey"
          size="small"
          @click="isDialogOpen = false"
        >
          Cancel
        </VBtn>
        <VBtn
          variant="elevated"
          color="primary"
          size="small"
          @click="confirm"
        >
          {{ confirmButton }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, watch } from "vue"

const props = defineProps({
  target: String,
  confirmButton: {
    type: String,
    default: "Confirm",
  },
  title: {
    type: String,
    default: "Confirmation",
  },
  message: {
    type: String,
    default: "Are you sure?",
  },
})

const emit = defineEmits(["confirm"])

const isDialogOpen = ref(false)

// optional external control via event or store
watch(
  () => props.target,
  () => {
    isDialogOpen.value = false
  },
)

function confirm() {
  isDialogOpen.value = false
  emit("confirm")
}
</script>
