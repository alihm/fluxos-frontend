<template>
  <div class="header-panel" :style="panelStyle">
    <div class="header-content" :class="{ 'reverse-layout': app.swapPageHeaderLayout }">
      <div class="text-section">
        <h1 class="game-title">
          {{ t('components.marketplace.panels.headerPanel.serverHosting', { name: app.uiName || app.displayName || app.name }) }}
        </h1>
        <p v-if="app.detailHeaderText" class="header-description">
          {{ app.detailHeaderText }}
        </p>
      </div>
      <div v-if="headerImage" class="image-section">
        <img :src="headerImage" class="header-image" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGameUtils } from '@/composables/useGameUtils'

const props = defineProps({
  panel: {
    type: Object,
    required: true,
  },
  app: {
    type: Object,
    required: true,
  },
})

const { t } = useI18n()
const { parseLandingImage } = useGameUtils()

const headerImage = computed(() => parseLandingImage(props.app.detailHeaderImage))

const panelStyle = computed(() => {
  const style = {
    padding: props.panel.padding ?
      `${props.panel.padding.top}px ${props.panel.padding.right}px ${props.panel.padding.bottom}px ${props.panel.padding.left}px`
      : '8px 32px',
    background: props.panel.background || 'transparent',
    borderRadius: props.panel.cornerRadius ? `${props.panel.cornerRadius}px` : '0',
    marginBottom: '15px',
  }
  console.log('🎨 HeaderPanel style:', style, 'Panel config:', props.panel)
  
  return style
})
</script>

<style scoped>
.header-panel {
  margin-bottom: 8px;
  margin-top: 48px;
}

.header-content {
  display: flex;
  gap: 48px;
  align-items: center;
}

.reverse-layout {
  flex-direction: row-reverse;
}

.text-section {
  flex: 1;
}

.game-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 24px;
  line-height: 1.2;
}

.header-description {
  font-size: 1.25rem;
  opacity: 0.9;
  line-height: 1.6;
}

.image-section {
  flex: 1;
  max-width: 50%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-image {
  max-height: 300px;
  max-width: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .header-content {
    flex-direction: column !important;
    gap: 24px;
  }

  .image-section {
    max-width: 100%;
    width: 100%;
  }

  .game-title {
    font-size: 2.5rem;
  }

  .header-description {
    font-size: 1.1rem;
  }
}

@media (max-width: 600px) {
  .game-title {
    font-size: 2rem;
  }

  .header-description {
    font-size: 1rem;
  }

  .image-section {
    max-width: 100%;
    width: 100%;
  }

  .header-image {
    max-height: 150px;
    max-width: 90%;
    width: auto;
    height: auto;
  }
}
</style>
