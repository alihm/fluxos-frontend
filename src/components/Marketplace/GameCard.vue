<template>
  <div
    class="game-card"
    @click="navigateToGame"
    :style="{ backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none' }"
  >
    <!-- Price Chip -->
    <VChip
      class="price-chip"
      color="success"
      size="large"
      variant="flat"
    >
      Starting at ${{ getMinimumPrice(game) }} / month
    </VChip>

    <!-- Content -->
    <div class="game-card-content">
      <!-- Logo Section -->
      <div class="logo-section">
        <VImg
          v-if="game.icon"
          :src="parseLandingImage(game.icon)"
          class="game-logo"
          contain
        />
      </div>

      <!-- Action Button -->
      <VBtn
        color="primary"
        size="small"
        rounded="pill"
        class="view-details-btn"
        @click.stop="navigateToGame"
      >
        <VIcon size="18" class="mr-1">mdi-eye</VIcon>
        View Details
      </VBtn>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameUtils } from '@/composables/useGameUtils'

const props = defineProps({
  game: {
    type: Object,
    required: true,
  },
})
const router = useRouter()
const { getMinimumPrice, parseLandingImage } = useGameUtils()

const backgroundImageUrl = computed(() => {
  if (!props.game.landingImage) return ''
  const parsed = parseLandingImage(props.game.landingImage)
  console.log('🎨 Game:', props.game.name, 'Landing image:', props.game.landingImage, '→', parsed)
  
  return parsed
})

const navigateToGame = () => {
  const gameName = props.game.name.toLowerCase()
  console.log('🎮 Navigating to game:', gameName)
  console.log('🔗 Full path:', `/marketplace/games/${gameName}`)
  router.push(`/marketplace/games/${gameName}`)
}
</script>

<style scoped>
.game-card {
  height: 500px;
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.game-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(var(--v-theme-primary), 0.25);
}

.price-chip {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
  font-weight: 600;
  border-radius: 0 24px 0 20px;
  opacity: 0.8;
}

.game-card-content {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  padding: 32px;
}

.logo-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-logo {
  max-height: 200px;
  max-width: 300px;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.8));
}

.view-details-btn {
  height: 44px;
  border-radius: 22px;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.view-details-btn :deep(.v-icon) {
  font-size: 18px;
}

.view-details-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(var(--v-theme-primary), 0.3);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .game-card {
    height: 500px;
  }

  .game-logo {
    max-height: 150px;
    max-width: 250px;
  }

  .view-details-btn {
    height: 50px;
    font-size: 16px;
  }

  .pricing-text {
    font-size: 14px;
  }
}
</style>
