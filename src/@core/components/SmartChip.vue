<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  icon: {
    type: String,
    default: 'mdi-hexagon-multiple',
  },
  iconAfterTrue: {
    type: String,
    default: 'mdi-check-circle',
  },
  iconAfterFalse: {
    type: String,
    default: 'mdi-close-circle',
  },
  iconAfterTrueColor: {
    type: String,
    default: 'success',
  },
  iconAfterFalseColor: {
    type: String,
    default: 'error',
  },
  iconState: {
    type: [Boolean, Function],
    required: true,
  },
  textOn: {
    type: String,
    default: 'Enabled',
  },
  textOff: {
    type: String,
    default: 'Disabled',
  },
  color: {
    type: String,
    default: 'info',
  },
  variant: {
    type: String,
    default: 'tonal',
  },
  rounded: {
    type: String,
    default: 'md',
  },
  className: {
    type: String,
    default: '',
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const isToggled = ref(props.modelValue)

watch(isToggled, val => emit('update:modelValue', val))

const displayText = computed(() => (isToggled.value ? props.textOn : props.textOff))

const iconStateValue = computed(() =>
  typeof props.iconState === 'function' ? props.iconState() : props.iconState,
)

const trailingIcon = computed(() =>
  iconStateValue.value ? props.iconAfterTrue : props.iconAfterFalse,
)

const trailingIconColor = computed(() =>
  iconStateValue.value ? props.iconAfterTrueColor : props.iconAfterFalseColor,
)
</script>

<template>
  <VChip
    :color="color"
    :variant="variant"
    :rounded="rounded"
    style="width: 100%"
    :class="className"
  >
    <div class="chip-grid">
      <!-- Left: icon + text + dynamic icon -->
      <div class="chip-left">
        <VIcon
          size="22"
          class="mr-2"
        >
          {{ icon }}
        </VIcon>
        <span style="font-size: 18px;">{{ displayText }}</span>
        <VIcon
          v-if="isToggled"
          size="20"
          class="ml-2"
          :color="trailingIconColor"
        >
          {{ trailingIcon }}
        </VIcon>
      </div>

      <!-- Right: toggle switch -->
      <VSwitch
        v-model="isToggled"
        hide-details
        inset
        density="compact"
        color="primary"
        class="chip-switch"
      />
    </div>
  </VChip>
</template>

<style scoped>
.chip-grid {
  display: grid !important;
  grid-template-columns: 1fr auto !important;
  align-items: center !important;
  width: 100% !important;
  min-width: 0 !important;
  gap: 12px !important;
}

.chip-left {
  display: flex !important;
  align-items: center !important;
  min-width: 0 !important;
  overflow: hidden !important;
}

.chip-switch {
  margin-top: -4px !important;
  margin-bottom: -4px !important;
}

::v-deep(.v-chip__content) {
  width: 100% !important;
}
</style>
