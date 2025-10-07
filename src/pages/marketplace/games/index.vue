<template>
  <div class="games-container">
    <div class="games-layout">
      <!-- Modern Compact Header - Hidden during loading and maintenance -->
      <div v-if="!loading && games.length > 0" class="games-header">
        <div class="header-modern">
          <div class="logo-badge">
            <img
              :src="fluxPlayLogo"
              alt="FluxPlay"
              class="fluxplay-logo-compact"
            />
          </div>
          <div class="text-compact">
            <h1 class="title-modern">Level Up Your Gaming</h1>
            <p class="subtitle-modern">
              Premium game hosting with global servers, lightning-fast connections, and flexible plans for every gamer.
            </p>
          </div>
        </div>
      </div>

      <!-- Games Grid Section -->
      <div class="games-grid-section">
        <div v-if="loading" style="margin-top: -100px;">
          <LoadingSpinner
            icon="mdi-gamepad-variant"
            :icon-size="56"
            title="Loading Games..."
          />
        </div>

        <MaintenanceCard
          v-else-if="!games.length"
          title="Games Marketplace
Under Maintenance"
          subtitle="We're currently experiencing technical difficulties with the games marketplace. Our team is working to resolve this issue as quickly as possible."
          :loading="loading"
          margin-top="-150px"
          @retry="fetchGames"
        />

        <div v-else class="games-grid">
          <GameCard
            v-for="game in games"
            :key="game.uuid || game.name"
            :game="game"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { useMarketplace } from '@/composables/useMarketplace'
import LoadingSpinner from '@/components/Marketplace/LoadingSpinner.vue'
import MaintenanceCard from '@/components/Marketplace/MaintenanceCard.vue'
import GameCard from '@/components/Marketplace/GameCard.vue'

const theme = useTheme()
const { games, loading, fetchGames } = useMarketplace()

// Theme-aware FluxPlay logo
const fluxPlayLogo = computed(() => {
  return theme.current.value.dark
    ? '/images/games/FluxPlay_white.svg'
    : '/images/games/FluxPlay_black.svg'
})

// Load games on mount
onMounted(async () => {
  try {
    await fetchGames()
    console.log('✅ Games loaded successfully')
  } catch (err) {
    console.error('Failed to load games:', err)
  }
})
</script>

<style scoped>
.games-container {
  padding: 8px 24px 8px 24px;
  min-height: 100vh;
}

.games-layout {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Modern Compact Header */
.games-header {
  width: 100%;
  margin-bottom: 12px;
}

.header-modern {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.1) 0%, rgba(var(--v-theme-secondary), 0.05) 100%);
  border-radius: 20px;
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  margin-bottom: 16px;
}

.logo-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(var(--v-theme-surface), 0.8);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: logoGlow 2s ease-in-out infinite;
  min-width: 112px;
  min-height: 112px;
}

.fluxplay-logo-compact {
  height: 80px;
  width: auto;
  object-fit: contain;
}

@keyframes logoGlow {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1),
                0 0 20px rgba(0, 191, 255, 0.3),
                0 0 30px rgba(0, 191, 255, 0.2);
  }
  50% {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1),
                0 0 30px rgba(0, 191, 255, 0.5),
                0 0 40px rgba(0, 191, 255, 0.3);
  }
}

.text-compact {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title-modern {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
}

.subtitle-modern {
  font-size: 1.125rem;
  line-height: 1.6;
  margin: 0;
  opacity: 0.85;
}

/* Games Grid Section */
.games-grid-section {
  flex: 1;
  margin-top: 0;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  padding: 0;
  width: 100%;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .header-modern {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }

  .logo-badge {
    margin: 0 auto;
  }

  .title-modern {
    font-size: 2rem;
  }

  .subtitle-modern {
    font-size: 1rem;
  }

  .games-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

@media (max-width: 600px) {
  .games-container {
    padding: 16px;
  }

  .games-layout {
    gap: 16px;
  }

  .header-modern {
    padding: 16px;
  }

  .logo-badge {
    min-width: 90px;
    min-height: 90px;
    padding: 12px;
  }

  .fluxplay-logo-compact {
    height: 60px;
  }

  .title-modern {
    font-size: 1.75rem;
  }

  .subtitle-modern {
    font-size: 0.95rem;
  }

  .games-grid {
    grid-template-columns: 1fr;
    padding: 0;
  }
}
</style>
