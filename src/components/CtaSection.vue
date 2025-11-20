<template>
  <VCard
    class="section-card cta-section"
    :color="cardColor"
    :variant="cardVariant"
  >
    <VCardText :class="['text-center', paddingClass]">
      <!-- Icon -->
      <div v-if="icon" :class="iconWrapperClass">
        <VIcon
          :icon="icon"
          :size="iconSize"
          :color="iconColor"
          class="mb-4 cta-icon-animated"
        />
      </div>

      <!-- Title -->
      <h2 class="cta-title">{{ resolvedTitle }}</h2>

      <!-- Subtitle -->
      <p v-if="resolvedSubtitle" class="cta-subtitle">{{ resolvedSubtitle }}</p>

      <!-- CTA Button -->
      <VBtn
        v-if="showButton"
        :color="buttonColor"
        :size="buttonSize"
        :variant="buttonVariant"
        :to="buttonTo"
        :href="buttonHref"
        :class="['mt-4', buttonClass]"
        @click="handleButtonClick"
      >
        <VIcon
          v-if="buttonIcon && buttonIconPosition === 'start'"
          start
        >
          {{ buttonIcon }}
        </VIcon>
        {{ resolvedButtonText }}
        <VIcon
          v-if="buttonIcon && buttonIconPosition === 'end'"
          end
        >
          {{ buttonIcon }}
        </VIcon>
      </VBtn>

      <!-- Slot for custom actions -->
      <slot name="actions"></slot>
    </VCardText>
  </VCard>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  // Card styling
  cardColor: {
    type: String,
    default: undefined, // Uses default card color unless specified
  },
  cardVariant: {
    type: String,
    default: undefined,
  },
  paddingClass: {
    type: String,
    default: 'pa-10',
  },

  // Icon
  icon: {
    type: String,
    default: '',
  },
  iconSize: {
    type: [Number, String],
    default: 64,
  },
  iconColor: {
    type: String,
    default: 'primary',
  },
  iconWrapperClass: {
    type: String,
    default: 'cta-icon',
  },

  // Content
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },

  // Button
  showButton: {
    type: Boolean,
    default: true,
  },
  buttonText: {
    type: String,
    default: '',
  },
  buttonIcon: {
    type: String,
    default: '',
  },
  buttonIconPosition: {
    type: String,
    default: 'start',
    validator: value => ['start', 'end'].includes(value),
  },
  buttonColor: {
    type: String,
    default: 'primary',
  },
  buttonSize: {
    type: String,
    default: 'x-large',
  },
  buttonVariant: {
    type: String,
    default: 'elevated',
  },
  buttonTo: {
    type: [String, Object],
    default: undefined,
  },
  buttonHref: {
    type: String,
    default: undefined,
  },
  buttonClass: {
    type: String,
    default: 'cta-btn',
  },
})

const emit = defineEmits(['buttonClick'])

const { t, te } = useI18n()

// Helper function to check if a string is an i18n key
const isI18nKey = str => {
  return str && typeof str === 'string' && str.startsWith('i18n:')
}

// Helper function to resolve i18n keys or return raw value
const resolveI18nValue = value => {
  if (!value) return ''

  if (isI18nKey(value)) {
    const key = value.replace('i18n:', '')
    return te(key) ? t(key) : value
  }

  return value
}

const resolvedTitle = computed(() => resolveI18nValue(props.title))
const resolvedSubtitle = computed(() => resolveI18nValue(props.subtitle))
const resolvedButtonText = computed(() => resolveI18nValue(props.buttonText))

const handleButtonClick = event => {
  emit('buttonClick', event)
}
</script>

<style scoped>
.cta-section {
  margin-bottom: 2rem;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
}

.cta-section :deep(.v-card-text) {
  padding: 24px !important;
}

.cta-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
}

.cta-icon-animated {
  animation: float 3s ease-in-out infinite, glow 2s ease-in-out infinite;
  filter: drop-shadow(0 0 6px rgba(var(--v-theme-primary), 0.3));
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes glow {
  0%, 100% {
    filter: drop-shadow(0 0 6px rgba(var(--v-theme-primary), 0.3));
  }
  50% {
    filter: drop-shadow(0 0 12px rgba(var(--v-theme-primary), 0.5));
  }
}

.cta-title {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 12px;
  line-height: 1.3;
}

.cta-subtitle {
  font-size: 1.25rem;
  margin-bottom: 0;
  opacity: 0.9;
  line-height: 1.6;
}

.cta-btn {
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(var(--v-theme-primary), 0.4);
}

/* Ensure VBtn inside cta-section maintains hover animation without color change */
.cta-section .v-btn {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.cta-section .v-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

/* Styling for primary background CTA (like games page) */
.cta-section.bg-primary .cta-title,
.cta-section.v-card--variant-flat .cta-title {
  color: white;
}

.cta-section.bg-primary .cta-subtitle,
.cta-section.v-card--variant-flat .cta-subtitle {
  color: rgba(255, 255, 255, 0.9);
}

/* Button on primary background - white button with primary text */
.cta-section.v-card--variant-flat .v-btn {
  background-color: white !important;
  color: rgb(var(--v-theme-primary)) !important;
}

.cta-section.v-card--variant-flat .v-btn:hover {
  background-color: white !important;
  color: rgb(var(--v-theme-primary)) !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.cta-section.v-card--variant-flat .v-btn .v-icon {
  color: rgb(var(--v-theme-primary)) !important;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .cta-title {
    font-size: 2rem;
  }

  .cta-subtitle {
    font-size: 1.1rem;
  }
}

@media (max-width: 600px) {
  .cta-title {
    font-size: 1.75rem;
  }

  .cta-subtitle {
    font-size: 1rem;
  }
}
</style>
