<template>
  <VCard class="feature-showcase" :class="[{ 'has-background': backgroundColor }]" :elevation="elevation">
    <VCardText :style="containerStyle">
      <h2 v-if="resolvedTitle" class="showcase-title">{{ resolvedTitle }}</h2>
      <p v-if="resolvedSubtitle" class="showcase-subtitle">{{ resolvedSubtitle }}</p>

      <div class="features-grid" :style="gridStyle">
        <div
          v-for="(item, index) in resolvedItems"
          :key="index"
          class="feature-item"
        >
          <VAvatar
            :color="item.color || iconColor"
            size="80"
            class="feature-avatar"
          >
            <VIcon :icon="item.icon || 'mdi-check-circle'" :size="iconSize" />
          </VAvatar>
          <h3 class="feature-title">{{ item.title }}</h3>
          <p class="feature-description">{{ item.description }}</p>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  // Header content
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },

  // Feature items - can be array of objects or i18n key string
  items: {
    type: [Array, String],
    required: true,
  },

  // Styling customization
  gridMinWidth: {
    type: String,
    default: '280px',
  },
  iconSize: {
    type: Number,
    default: 40,
  },
  iconColor: {
    type: String,
    default: 'primary',
  },
  backgroundColor: {
    type: String,
    default: '',
  },
  padding: {
    type: String,
    default: '32px',
  },
  elevation: {
    type: Number,
    default: 0,
  },
})

const { t, te, tm } = useI18n()

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

// Helper function to resolve i18n keys or return raw value
const resolveI18nValue = value => {
  if (!value) return ''

  if (isI18nKey(value)) {
    const key = value.replace('i18n:', '')

    return te(key) ? extractString(t(key)) : value
  }

  return value
}

// Removed getNestedI18nValue - use tm() instead

// Resolve title
const resolvedTitle = computed(() => resolveI18nValue(props.title))

// Resolve subtitle
const resolvedSubtitle = computed(() => resolveI18nValue(props.subtitle))

// Resolve items
const resolvedItems = computed(() => {
  // If items is a string (i18n key), fetch from i18n using tm() and extract strings
  if (typeof props.items === 'string' && isI18nKey(props.items)) {
    const key = props.items.replace('i18n:', '')

    // Use te() to check if key exists
    if (!te(key)) return []

    const items = tm(key)

    // Deep clone to unwrap all proxies
    let itemsArray = Array.isArray(items) ? items : Object.values(items)
    itemsArray = JSON.parse(JSON.stringify(itemsArray))

    return itemsArray.map((item) => ({
      icon: extractString(item.icon),
      title: extractString(item.title),
      description: extractString(item.description),
      color: extractString(item.color),
    }))
  }

  // If items is an array, resolve any i18n keys in individual items
  if (Array.isArray(props.items)) {
    return props.items.map(item => ({
      icon: resolveI18nValue(item.icon) || item.icon,
      title: resolveI18nValue(item.title) || item.title,
      description: resolveI18nValue(item.description) || item.description,
      color: item.color,
    }))
  }

  return []
})

// Container style
const containerStyle = computed(() => ({
  padding: props.padding,
  background: props.backgroundColor || 'transparent',
}))

// Grid style
const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(auto-fit, minmax(${props.gridMinWidth}, 1fr))`,
}))
</script>

<style scoped>
.feature-showcase {
  border-radius: 16px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  margin-bottom: 0;
}

.feature-showcase :deep(.v-card-text) {
  padding: 24px !important;
}

.feature-showcase.has-background {
  background: rgba(var(--v-theme-surface), 0.8);
}

.showcase-title {
  font-size: 28px;
  font-weight: 700;
  margin-top: 0.5rem;
  margin-bottom: 0;
  text-align: center;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.3;
}

.showcase-subtitle {
  font-size: 1.125rem;
  text-align: center;
  margin-bottom: 16px;
  opacity: 0.9;
  line-height: 1.6;
}

.features-grid {
  display: grid;
  gap: 24px;
  margin-top: 32px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px 24px;
  background: rgba(var(--v-theme-on-surface), 0.04);
  border-radius: 16px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  transition: all 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: rgba(var(--v-theme-on-surface), 0.24);
}

.feature-avatar {
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.feature-item:hover .feature-avatar {
  transform: scale(1.1);
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: rgb(var(--v-theme-on-surface));
}

.feature-description {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: rgba(var(--v-theme-on-surface), 0.8);
  margin: 0;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .features-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important;
    gap: 20px;
  }

  .showcase-title {
    font-size: 1.75rem;
  }

  .showcase-subtitle {
    font-size: 1rem;
    margin-bottom: 16px;
  }

  .feature-item {
    padding: 24px 20px;
  }
}

@media (max-width: 600px) {
  .features-grid {
    grid-template-columns: 1fr !important;
    gap: 16px;
  }

  .showcase-title {
    font-size: 1.5rem;
  }

  .showcase-subtitle {
    font-size: 0.9375rem;
    margin-bottom: 24px;
  }

  .feature-item {
    padding: 20px 16px;
  }

  .feature-avatar {
    width: 64px !important;
    height: 64px !important;
    margin-bottom: 16px;
  }

  .feature-avatar :deep(.v-icon) {
    font-size: 32px !important;
  }

  .feature-title {
    font-size: 1.125rem;
  }

  .feature-description {
    font-size: 0.875rem;
  }
}
</style>
