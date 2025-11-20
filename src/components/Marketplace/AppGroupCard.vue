<template>
  <div class="group-card" :style="groupStyle">
    <div v-if="backgroundImage" class="group-background">
      <VImg :src="backgroundImage" cover />
    </div>

    <div class="group-content">
      <h2
        v-if="groupTitle"
        class="group-title"
        :class="{ 'no-description': !groupDescription }"
        :style="{ color: group.color }"
      >
        {{ groupTitle }}
      </h2>
      <p v-if="groupDescription" class="group-description">
        {{ groupDescription }}
      </p>

      <div class="configs-grid">
        <AppConfigCard
          v-for="(config, index) in configs"
          :key="config.id"
          :config="getConfigWithPopular(config, index, configs.length)"
          :app="app"
          @install="handleInstall"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGameUtils } from '@/composables/useGameUtils'
import AppConfigCard from './AppConfigCard.vue'

const props = defineProps({
  group: {
    type: Object,
    required: true,
  },
  configs: {
    type: Array,
    required: true,
  },
  app: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['install'])

const { t, te } = useI18n()
const { parseLandingImage } = useGameUtils()

// Helper function to check if a string is an i18n key
const isI18nKey = str => {
  return str && typeof str === 'string' && str.startsWith('i18n:')
}

// Helper function to extract string from compiled i18n message objects
const extractString = obj => {
  // If it's already a string, check if it's JSON-encoded
  if (typeof obj === 'string') {
    try {
      const parsed = JSON.parse(obj)
      // If parsed successfully, try to extract the string from the structure
      if (parsed && typeof parsed === 'object' && parsed.b && parsed.b.s) {
        return parsed.b.s
      }
      return obj
    } catch {
      return obj
    }
  }

  if (obj && typeof obj === 'object') {
    // Try to get the actual string from compiled message object
    // Structure: {t: 0, b: {t: 2, i: [...], s: "actual text"}}
    if (obj.b && obj.b.s) {
      return obj.b.s
    }
    return obj.body?.static || obj.loc?.source || obj.static || JSON.stringify(obj)
  }

  return String(obj)
}

// Resolve group title with i18n support
const groupTitle = computed(() => {
  if (!props.group.title) return ''

  // Handle i18n keys
  if (isI18nKey(props.group.title)) {
    const key = props.group.title.replace('i18n:', '')
    return te(key) ? extractString(t(key)) : props.group.title
  }

  // Translate common API strings that are always in English
  const apiStringMap = {
    'Select Server Configuration': 'common.selectServerConfiguration',
    'Small Servers': 'common.groups.smallServers',
    'Medium Servers': 'common.groups.mediumServers',
    'Large Servers': 'common.groups.largeServers',
  }

  const translationKey = apiStringMap[props.group.title]
  if (translationKey && te(translationKey)) {
    return extractString(t(translationKey))
  }

  return props.group.title
})

// Resolve group description with i18n support
const groupDescription = computed(() => {
  if (!props.group.description) return ''

  if (isI18nKey(props.group.description)) {
    const key = props.group.description.replace('i18n:', '')
    return te(key) ? extractString(t(key)) : props.group.description
  }

  return props.group.description
})

const backgroundImage = computed(() => parseLandingImage(props.group.backgroundImage))

const groupStyle = computed(() => {
  const hasBackgroundImage = !!backgroundImage.value

  return {
    backgroundColor: props.group.backgroundColor || 'transparent',
    borderRadius: '16px',
    padding: '12px 32px 32px 32px',
    position: 'relative',
    overflow: 'hidden',
    // Add border when there's no background image
    border: hasBackgroundImage ? 'none' : '1px solid rgba(var(--v-theme-on-surface), 0.12)',
  }
})

// 🎯 CONFIGURE "MOST POPULAR" BADGE HERE
// Change this number to mark a different config as popular:
// - 0 = first config (cheapest)
// - Math.floor(total / 2) = middle config (recommended)
// - total - 1 = last config (most expensive)
const POPULAR_CONFIG_INDEX = total => Math.floor(total / 2) // Middle option

const getConfigWithPopular = (config, index, totalConfigs) => {
  return {
    ...config,
    isPopular: index === POPULAR_CONFIG_INDEX(totalConfigs),
  }
}

const handleInstall = data => {
  emit('install', data)
}
</script>

<style scoped>
.group-card {
  margin-bottom: 0;
}

.group-background {
  position: absolute;
  inset: 0;
  opacity: 0.3;
  z-index: 0;
  width: 100%;
  height: 100%;
}

.group-background :deep(.v-img) {
  width: 100%;
  height: 100%;
}

.group-background :deep(.v-img__img) {
  width: 100%;
  height: 100%;
}

.group-content {
  position: relative;
  z-index: 1;
}

.group-title {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 24px;
}

.group-title.no-description {
  margin-bottom: 32px;
}

.group-description {
  text-align: center;
  margin-bottom: 24px;
  font-size: 1.1rem;
  opacity: 0.9;
}

.configs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  justify-content: center;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .group-card {
    padding: 20px;
  }

  .group-title {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }

  .group-title.no-description {
    margin-bottom: 28px;
  }

  .configs-grid {
    grid-template-columns: 1fr;
  }
}
</style>
