<template>
  <VCard class="discover-card" :height="cardHeight" elevation="6">
    <div class="card-background">
      <VImg
        :src="backgroundImage"
        cover
        :height="cardHeight"
        class="background-image"
        style="object-fit: cover; object-position: center;"
      >
        <template #placeholder>
          <div class="gradient-background" />
        </template>
      </VImg>
      <div class="overlay-darken" />
    </div>

    <div class="card-content">
      <h1 class="discover-title">
        <span class="gradient-text">
          {{ t('components.marketplace.discoverCard.title') }}<br>
          {{ t('components.marketplace.discoverCard.subtitle') }}
        </span>
      </h1>
    </div>
  </VCard>
</template>

<script setup>
import { computed } from 'vue'
import { useTheme } from 'vuetify'
import { useI18n } from 'vue-i18n'

// Import background image
import backgroundImg from '@images/header.png'

const props = defineProps({
  height: {
    type: Number,
    default: 250,
  },
  compact: {
    type: Boolean,
    default: false,
  },
  mobile: {
    type: Boolean,
    default: false,
  },
})

const { t } = useI18n()

const theme = useTheme()

const cardHeight = computed(() => {
  if (props.mobile) return 150
  if (props.compact) return props.height || 170
  
  return props.height || 170
})

const backgroundImage = computed(() => {
  return backgroundImg
})
</script>

<style scoped>
.discover-card {
  position: relative;
  overflow: hidden;
  border-radius: 12px !important;
  cursor: default;
}

.card-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.background-image {
  width: 100%;
  height: 100%;
}

.gradient-background {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg,
    rgb(var(--v-theme-primary)) 0%,
    rgb(var(--v-theme-secondary)) 100%);
}

.overlay-darken {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  mix-blend-mode: multiply;
}

.card-content {
  position: relative;
  z-index: 1;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  color: white;
}

.discover-title {
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 8px;
}

.gradient-text {
  background: linear-gradient(135deg,
    #ffffff 0%,
    #a363f1 50%,
    #3e98fc 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}


/* Responsive adjustments */
@media (max-width: 1280px) {
  .discover-title {
    font-size: 2rem;
  }
}

@media (max-width: 960px) {
  .card-content {
    padding: 24px;
  }
  .discover-title {
    font-size: 1.8rem;
  }
}

@media (max-width: 600px) {
  .card-content {
    padding: 20px;
    align-items: center;
    text-align: center;
  }
  .discover-title {
    font-size: 1.5rem;
  }
}

/* Compact mode adjustments */
.discover-card[height="170"] .card-content {
  padding: 16px 24px;
}

.discover-card[height="170"] .discover-title {
  font-size: 1.5rem;
  margin-bottom: 8px;
}
</style>