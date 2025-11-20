<template>
  <VCard :class="['benefits-grid-card', { 'has-background': backgroundColor }]" :elevation="elevation">
    <VCardText :style="containerStyle">
      <h2 v-if="resolvedTitle" class="benefits-title">{{ resolvedTitle }}</h2>
      <p v-if="resolvedSubtitle" class="benefits-subtitle">{{ resolvedSubtitle }}</p>

      <div class="benefits-list" :style="gridStyle">
        <div
          v-for="(item, index) in resolvedItems"
          :key="index"
          class="benefit-item"
        >
          <div
            class="benefit-icon"
            :style="{
              background: `rgba(var(--v-theme-${item.color || iconColor}), 0.1)`
            }"
          >
            <VIcon :icon="item.icon || 'mdi-check-circle'" :size="iconSize" :color="item.color || iconColor" />
          </div>
          <div class="benefit-text-container">
            <span class="benefit-text">{{ item.text }}</span>
          </div>
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

  // Benefit items - can be array of objects or i18n key string
  items: {
    type: [Array, String],
    required: true,
  },

  // Styling customization
  gridTemplateColumns: {
    type: String,
    default: 'repeat(auto-fit, minmax(250px, 1fr))',
  },
  iconSize: {
    type: Number,
    default: 22,
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
    default: '24px',
  },
  elevation: {
    type: Number,
    default: 0,
  },
})

const { t, te, locale, messages } = useI18n()

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

// Helper to get deeply nested i18n value
const getNestedI18nValue = key => {
  try {
    const parts = key.split('.')
    let value = messages.value[locale.value]

    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part]
      } else {
        break
      }
    }

    return value
  } catch (e) {
    return null
  }
}

// Resolve title
const resolvedTitle = computed(() => resolveI18nValue(props.title))

// Resolve subtitle
const resolvedSubtitle = computed(() => resolveI18nValue(props.subtitle))

// Resolve items
const resolvedItems = computed(() => {
  // If items is a string (i18n key), fetch from i18n
  if (typeof props.items === 'string' && isI18nKey(props.items)) {
    const key = props.items.replace('i18n:', '')
    const items = getNestedI18nValue(key)

    if (items && typeof items === 'object') {
      let itemsArray = Array.isArray(items) ? items : Object.values(items)

      // Deep clone to unwrap proxies
      itemsArray = JSON.parse(JSON.stringify(itemsArray))

      // Extract actual string values from compiled i18n message objects
      return itemsArray.map(item => {
        const extractString = obj => {
          if (typeof obj === 'string') return obj
          if (obj && typeof obj === 'object') {
            return obj.body?.static || obj.loc?.source || obj.static || JSON.stringify(obj)
          }
          return String(obj)
        }

        return {
          icon: extractString(item.icon),
          text: extractString(item.text),
          color: item.color ? extractString(item.color) : undefined,
        }
      })
    }

    return []
  }

  // If items is an array, resolve any i18n keys in individual items
  if (Array.isArray(props.items)) {
    return props.items.map(item => ({
      icon: resolveI18nValue(item.icon) || item.icon,
      text: resolveI18nValue(item.text) || item.text,
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
  gridTemplateColumns: props.gridTemplateColumns,
}))
</script>

<style scoped>
.benefits-grid-card {
  border-radius: 16px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  margin-bottom: 2rem;
}

.benefits-grid-card :deep(.v-card-text) {
  padding: 24px !important;
}

.benefits-grid-card.has-background {
  background: rgba(var(--v-theme-surface), 0.8);
}

.benefits-title {
  font-size: 28px;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 16px;
  text-align: center;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.3;
}

.benefits-subtitle {
  font-size: 1.125rem;
  text-align: center;
  margin-bottom: 32px;
  opacity: 0.9;
  line-height: 1.8;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

.benefits-list {
  display: grid;
  gap: 16px;
  margin-top: 24px;
}

.benefit-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: rgba(var(--v-theme-on-surface), 0.02);
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  transition: all 0.3s ease;
}

.benefit-item:hover {
  background: rgba(var(--v-theme-on-surface), 0.04);
  border-color: rgba(var(--v-theme-on-surface), 0.16);
  transform: translateX(4px);
}

.benefit-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.benefit-text-container {
  flex: 1;
  display: flex;
  align-items: center;
}

.benefit-text {
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.6;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.85;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .benefits-list {
    grid-template-columns: 1fr !important;
  }

  .benefits-title {
    font-size: 1.75rem;
  }

  .benefits-subtitle {
    font-size: 1rem;
  }

  .benefit-text {
    font-size: 0.9375rem;
  }
}

@media (max-width: 600px) {
  .benefits-title {
    font-size: 1.5rem;
  }

  .benefits-subtitle {
    font-size: 0.9375rem;
  }

  .benefit-item {
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 12px;
    padding: 16px;
    align-items: center;
  }

  .benefit-icon {
    width: 40px;
    height: 40px;
    margin-bottom: 0;
    flex-shrink: 0;
  }

  .benefit-icon :deep(.v-icon) {
    font-size: 24px !important;
  }

  .benefit-text-container {
    flex: 1;
    display: flex;
    align-items: center;
    min-width: 0;
  }

  .benefit-text {
    font-size: 0.875rem;
    text-align: left;
    line-height: 1.5;
    width: 100%;
  }
}
</style>
