<template>
  <VSnackbar
    v-model="showBanner"
    :timeout="-1"
    location="bottom"
    multi-line
    class="cookie-consent-banner"
    color="surface"
    elevation="0"
  >
    <VCard
      class="cookie-consent-card"
      elevation="0"
    >
      <VCardText class="pa-6">
        <div class="d-flex flex-column ga-4">
          <!-- Header with icon -->
          <div class="d-flex align-start gap-3">
            <div class="cookie-icon-wrapper">
              <VIcon size="24" color="success">mdi-cookie</VIcon>
            </div>
            <div class="flex-grow-1">
              <div class="text-h6 font-weight-bold mb-2">
                {{ t('common.cookieConsent.title') }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ t('common.cookieConsent.description') }}
                <a
                  href="https://runonflux.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-success font-weight-medium"
                >
                  {{ t('common.cookieConsent.learnMore') }}
                </a>
              </div>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="d-flex flex-wrap gap-2">
            <VBtn
              color="success"
              variant="flat"
              class="flex-grow-1 flex-sm-grow-0"
              @click="acceptAll"
            >
              <VIcon start size="20">mdi-check-circle</VIcon>
              {{ t('common.cookieConsent.acceptAll') }}
            </VBtn>
            <VBtn
              color="secondary"
              variant="tonal"
              class="flex-grow-1 flex-sm-grow-0"
              @click="acceptNecessary"
            >
              {{ t('common.cookieConsent.onlyNecessary') }}
            </VBtn>
            <VBtn
              color="info"
              variant="text"
              @click="showSettings = true"
            >
              <VIcon start size="20">mdi-cog</VIcon>
              {{ t('common.cookieConsent.customize') }}
            </VBtn>
          </div>
        </div>
      </VCardText>
    </VCard>
  </VSnackbar>

  <!-- Cookie Settings Dialog -->
  <VDialog
    v-model="showSettings"
    max-width="600"
    content-class="cookie-settings-dialog"
  >
    <VCard class="dialog-card">
      <VCardTitle class="d-flex justify-space-between align-center pa-3 dialog-header">
        <div class="d-flex align-center gap-3">
          <VIcon size="28">mdi-cog</VIcon>
          <span>{{ t('common.cookieConsent.settingsTitle') }}</span>
        </div>
        <VBtn
          icon="mdi-close"
          variant="text"
          size="small"
          class="close-btn"
          @click="showSettings = false"
        />
      </VCardTitle>

      <VCardText>
        <div class="mb-4 ml-2">
          <div class="text-body-2 mb-2">
            {{ t('common.cookieConsent.settingsDescription') }}
          </div>
        </div>

        <!-- Necessary Cookies -->
        <div class="cookie-category mb-4">
          <div class="d-flex justify-space-between align-center mb-2">
            <div>
              <div class="text-subtitle-1 font-weight-medium">
                {{ t('common.cookieConsent.necessary') }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ t('common.cookieConsent.necessaryDescription') }}
              </div>
            </div>
            <VSwitch
              v-model="necessaryCookiesEnabled"
              disabled
              color="success"
            />
          </div>
        </div>

        <!-- Analytics Cookies -->
        <div class="cookie-category">
          <div class="d-flex justify-space-between align-center mb-2">
            <div>
              <div class="text-subtitle-1 font-weight-medium">
                {{ t('common.cookieConsent.analytics') }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ t('common.cookieConsent.analyticsDescription') }}
              </div>
            </div>
            <VSwitch
              v-model="preferences.analytics"
              color="primary"
            />
          </div>
        </div>
      </VCardText>

      <VCardActions class="dialog-actions">
        <VSpacer />
        <VBtn
          color="error"
          variant="text"
          @click="showSettings = false"
        >
          {{ t('common.buttons.cancel') }}
        </VBtn>
        <VBtn
          color="primary"
          variant="flat"
          @click="savePreferences"
        >
          {{ t('common.buttons.save') }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCookieConsent } from '@/composables/useCookieConsent'

const { t } = useI18n()
const {
  getConsent,
  saveConsent,
  hasConsent,
  enableAnalytics,
  disableAnalytics,
} = useCookieConsent()

const showBanner = ref(false)
const showSettings = ref(false)
const necessaryCookiesEnabled = ref(true) // Always true, for display purposes
const preferences = ref({
  analytics: false,
})

// Listen for cookie settings open event from StatusBar
const handleOpenCookieSettings = () => {
  showSettings.value = true
}

onMounted(() => {
  // Show banner if user hasn't made a choice
  if (!hasConsent()) {
    showBanner.value = true
  } else {
    // Load existing preferences
    const consent = getConsent()
    preferences.value.analytics = consent.analytics

    // Enable analytics if previously consented
    if (consent.analytics) {
      enableAnalytics()
    }
  }

  // Listen for cookie settings open event
  window.addEventListener('open-cookie-settings', handleOpenCookieSettings)
})

onBeforeUnmount(() => {
  window.removeEventListener('open-cookie-settings', handleOpenCookieSettings)
})

const acceptAll = () => {
  preferences.value.analytics = true
  saveConsent({
    necessary: true,
    analytics: true,
  })
  enableAnalytics()
  showBanner.value = false
}

const acceptNecessary = () => {
  preferences.value.analytics = false
  saveConsent({
    necessary: true,
    analytics: false,
  })
  disableAnalytics()
  showBanner.value = false
}

const savePreferences = () => {
  saveConsent({
    necessary: true,
    analytics: preferences.value.analytics,
  })

  if (preferences.value.analytics) {
    enableAnalytics()
  } else {
    disableAnalytics()
  }

  showSettings.value = false
  showBanner.value = false
}
</script>

<style scoped lang="scss">
.cookie-consent-banner {
  :deep(.v-snackbar__wrapper) {
    max-width: 800px;
    min-width: 320px;
    border-radius: 16px;
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    backdrop-filter: blur(10px);
    margin: 16px;

    @media (max-width: 600px) {
      margin: 12px;
      max-width: calc(100% - 24px);
    }
  }

  :deep(.v-snackbar__content) {
    padding: 0;
  }
}

.cookie-consent-card {
  width: 100%;
  background: rgb(var(--v-theme-surface));
  border-radius: 16px;
}

.cookie-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 12px;
  background: rgba(var(--v-theme-success), 0.1);

  @media (max-width: 600px) {
    width: 40px;
    height: 40px;
    min-width: 40px;
  }
}

.cookie-category {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  padding: 20px;
  background: rgba(var(--v-theme-surface-variant), 0.05);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(var(--v-theme-surface-variant), 0.08);
    border-color: rgba(var(--v-border-color), calc(var(--v-border-opacity) * 1.5));
  }

  .d-flex {
    gap: 16px;
  }
}

// Better responsive button layout
.d-flex.flex-wrap.gap-2 {
  @media (max-width: 600px) {
    flex-direction: column;

    .v-btn {
      width: 100%;
    }
  }
}

.dialog-card {
  border-radius: 16px;
  overflow: hidden;
}

.dialog-header {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

  :deep(.v-icon) {
    color: rgb(var(--v-theme-on-primary)) !important;
  }

  .close-btn {
    background: rgba(255, 255, 255, 0.1);

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

.dialog-actions {
  :deep(.v-btn) {
    height: 30px;
    min-height: 30px;
  }
}
</style>

<style lang="scss">
.cookie-settings-dialog {
  border-radius: 16px;
  overflow: hidden;
}
</style>
