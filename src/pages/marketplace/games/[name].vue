<template>
  <div class="game-details-container">
    <!-- Loading State -->
    <LoadingSpinner
      v-if="loading"
      icon="mdi-gamepad-variant"
      :icon-size="56"
      :title="t('pages.marketplace.games.detail.loadingTitle')"
    />

    <!-- Error State -->
    <VAlert v-else-if="error" type="error" class="error-alert">
      {{ error }}
      <template #append>
        <VBtn variant="text" @click="router.push('/marketplace/games')">
          {{ t('pages.marketplace.games.detail.backToGames') }}
        </VBtn>
      </template>
    </VAlert>

    <!-- Game Details -->
    <div v-else-if="game" class="game-details">
      <!-- Back Button -->
      <VBtn
        icon="mdi-arrow-left"
        variant="tonal"
        color="grey-darken-2"
        class="back-btn"
        @click="router.push('/marketplace/games')"
      />

      <!-- Dynamic Panels -->
      <div v-if="game.panels && game.panels.length" class="panels-container">
        <PanelRenderer
          v-for="(panel, index) in orderedPanels"
          :key="index"
          :panel="panel"
          :app="game"
          @install="handleInstall"
        />
      </div>

      <!-- Fallback: No Panels - Show Basic Info -->
      <div v-else class="basic-game-info">
        <VCard class="info-card" elevation="3">
          <VCardTitle>
            <div class="game-header">
              <VImg
                v-if="gameIcon"
                :src="gameIcon"
                max-width="80"
                max-height="80"
                class="game-icon"
              />
              <h1>{{ game.displayName || game.name }}</h1>
            </div>
          </VCardTitle>

          <VCardText>
            <p v-if="game.description" class="game-description">
              {{ game.description }}
            </p>

            <!-- Configurations -->
            <div v-if="game.useConfig && game.configs && game.configs.length" class="configs-section">
              <h2>{{ t('pages.marketplace.games.detail.availableConfigurations') }}</h2>
              <div class="configs-grid">
                <AppConfigCard
                  v-for="config in game.configs"
                  :key="config.id"
                  :config="config"
                  :app="game"
                  @install="handleInstall"
                />
              </div>
            </div>

            <!-- Single Install Button (no configs) -->
            <div v-else class="single-install">
              <VBtn
                color="primary"
                size="large"
                @click="handleInstall({ app: game, config: null })"
              >
                {{ t('pages.marketplace.games.detail.installGame', { name: game.displayName || game.name }) }}
              </VBtn>
            </div>
          </VCardText>
        </VCard>
      </div>
    </div>

    <!-- Install Dialog -->
    <InstallDialog
      v-if="selectedApp"
      v-model="showInstallDialog"
      :app="selectedApp"
      :selected-config="selectedConfig"
      is-game
      @deployed="handleDeployed"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMarketplace } from '@/composables/useMarketplace'
import { useGameUtils } from '@/composables/useGameUtils'
import LoadingSpinner from '@/components/Marketplace/LoadingSpinner.vue'
import PanelRenderer from '@/components/Marketplace/PanelRenderer.vue'
import AppConfigCard from '@/components/Marketplace/AppConfigCard.vue'
import InstallDialog from '@/components/Marketplace/InstallDialog.vue'

const { t } = useI18n()

const route = useRoute()
const router = useRouter()
const { games, fetchGames } = useMarketplace()
const { parseLandingImage } = useGameUtils()

const game = ref(null)
const loading = ref(true)
const error = ref(null)
const showInstallDialog = ref(false)
const selectedApp = ref(null)
const selectedConfig = ref(null)

// Parse game icon to handle asset:// protocol
const gameIcon = computed(() => parseLandingImage(game.value?.icon))

// Reorder panels: Screenshots before Groups (configuration)
const orderedPanels = computed(() => {
  if (!game.value?.panels) return []

  const panels = [...game.value.panels]
  const panelOrder = ['Header', 'Screenshots', 'Groups', 'NodeMap', 'Subscription']

  return panels.sort((a, b) => {
    const aIndex = panelOrder.indexOf(a.type)
    const bIndex = panelOrder.indexOf(b.type)
    
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex)
  })
})

const loadGameDetails = async () => {
  loading.value = true
  error.value = null

  try {
    const gameName = route.params.name
    console.log('🔍 Loading game details for:', gameName)
    console.log('📦 Current games.value.length:', games.value.length)

    // Fetch all games if not loaded
    if (!games.value.length) {
      console.log('⏳ Fetching games...')
      await fetchGames()
      console.log('✅ Games fetched, count:', games.value.length)
    }

    // Debug: List all game names
    console.log('📋 All game names:', games.value.map(game => game.name))

    // Find game by name (case-insensitive like FluxCloud)
    const foundGame = games.value.find(app =>
      app.name?.toLowerCase() === gameName.toLowerCase(),
    )

    console.log('🎮 Found game:', foundGame ? foundGame.name : 'NOT FOUND')

    if (!foundGame) {
      error.value = t('pages.marketplace.games.detail.gameNotFound')
      console.error('❌ Game not found:', gameName)

      return
    }

    // Verify it's available (visible && enabled)
    if (!foundGame.visible || !foundGame.enabled) {
      error.value = t('pages.marketplace.games.detail.gameNotAvailable')
      console.error('❌ Game not available. visible:', foundGame.visible, 'enabled:', foundGame.enabled)

      return
    }

    console.log('✅ Game loaded successfully:', foundGame.name)
    console.log('🎮 Game data:', {
      name: foundGame.name,
      hasConfigs: !!foundGame.configs,
      configsLength: foundGame.configs?.length || 0,
      hasGroups: !!foundGame.groups,
      groupsLength: foundGame.groups?.length || 0,
      hasPanels: !!foundGame.panels,
      panelsLength: foundGame.panels?.length || 0,
      useConfig: foundGame.useConfig,
    })
    game.value = foundGame
  } catch (err) {
    console.error('Failed to load game details:', err)
    error.value = err.message || t('pages.marketplace.games.detail.failedToLoad')
  } finally {
    loading.value = false
  }
}

const handleInstall = ({ app, config }) => {
  selectedApp.value = app
  selectedConfig.value = config
  showInstallDialog.value = true
}

const handleDeployed = () => {
  // Handle successful deployment
  console.log('Game deployed successfully')
}

onMounted(loadGameDetails)
</script>

<style scoped>
.game-details-container {
  padding: 0 24px 0 24px;
  max-width: 1400px;
  margin: -16px auto 0 auto;
  min-height: calc(100vh - 100px);
  position: relative;
}

.error-alert {
  margin: 24px 0;
}

.back-btn {
  margin-bottom: 15px;
  position: absolute;
  top: 8px;
  left: 20px;
  z-index: 10;
  background-color: rgba(100, 100, 100, 0.4) !important;
  backdrop-filter: blur(10px);
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.back-btn:hover {
  background-color: rgba(120, 120, 120, 0.5) !important;
  transform: scale(1.1);
}

.back-btn :deep(.v-icon) {
  color: rgba(255, 255, 255, 0.9);
}

.game-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.panels-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 20px;
}

/* Fallback Basic Info Styling */
.basic-game-info {
  margin-top: 24px;
}

.info-card {
  border-radius: 16px;
  padding: 24px;
}

.game-header {
  display: flex;
  align-items: center;
  gap: 24px;
}

.game-header h1 {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0;
}

.game-icon {
  border-radius: 12px;
}

.game-description {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 32px;
}

.configs-section {
  margin-top: 32px;
}

.configs-section h2 {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 24px;
}

.configs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.single-install {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .game-header h1 {
    font-size: 2rem;
  }

  .configs-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 600px) {
  .game-details-container {
    padding: 16px;
  }

  .game-header {
    flex-direction: column;
    text-align: center;
  }

  .game-header h1 {
    font-size: 1.8rem;
  }

  .configs-grid {
    grid-template-columns: 1fr;
  }
}
</style>
