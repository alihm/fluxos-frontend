<template>
  <VSnackbar
    v-model="showBanner"
    :timeout="-1"
    location="bottom"
    multi-line
    class="cookie-consent-banner"
    color="surface"
    elevation="24"
  >
    <VCard
      class="cookie-consent-card"
      elevation="0"
      color="transparent"
    >
      <VCardText class="pa-4">
        <div class="d-flex flex-column ga-3">
          <div class="d-flex justify-space-between align-center">
            <div class="text-h6 font-weight-bold">
              {{ t('common.cookieConsent.title') }}
            </div>
            <VBtn
              icon="mdi-close"
              variant="text"
              size="small"
              @click="acceptNecessary"
            />
          </div>
          <div class="text-body-2">
            {{ t('common.cookieConsent.description') }}
            <a
              href="https://runonflux.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary text-decoration-none ml-1"
            >
              {{ t('common.cookieConsent.learnMore') }}
            </a>
          </div>
          <div class="d-flex flex-wrap ga-2 mt-2">
            <VBtn
              color="primary"
              variant="flat"
              size="default"
              @click="acceptAll"
            >
              {{ t('common.cookieConsent.acceptAll') }}
            </VBtn>
            <VBtn
              color="secondary"
              variant="outlined"
              size="default"
              @click="acceptNecessary"
            >
              {{ t('common.cookieConsent.onlyNecessary') }}
            </VBtn>
            <VBtn
              variant="text"
              size="default"
              @click="showSettings = true"
            >
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
  >
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center">
        <span>{{ t('common.cookieConsent.settingsTitle') }}</span>
        <VBtn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="showSettings = false"
        />
      </VCardTitle>

      <VCardText>
        <div class="mb-4">
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
        <div class="cookie-category mb-4">
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

      <VCardActions>
        <VSpacer />
        <VBtn
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
    max-width: 700px;
    min-width: 320px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  :deep(.v-snackbar__content) {
    padding: 0;
  }
}

.cookie-consent-card {
  width: 100%;
}

.cookie-category {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  padding: 16px;
  background: rgba(var(--v-theme-surface-variant), 0.05);
}
</style>
