<template>
  <div class="footer-container">
    <!-- StatusBar -->
    <div
      class="d-flex align-center w-100 footer-wrapper"
      :class="{ 'statusbar-hidden': isStatusBarHidden }"
      :style="{
        height: isStatusBarHidden ? '0px' : '100%',
        minHeight: isStatusBarHidden ? '0px' : 'auto',
        paddingBottom: isStatusBarHidden ? '1rem' : '0'
      }"
    >
      <StatusBar style="width: 100%;" />
    </div>

    <!-- Always visible footer links (when StatusBar is hidden) -->
    <div
      v-if="isStatusBarHidden"
      class="footer-links"
    >
      <VContainer>
        <div class="d-flex justify-center align-center flex-wrap ga-4 py-2">
          <VBtn
            variant="text"
            size="small"
            class="text-caption"
            @click="openCookieSettings"
          >
            <VIcon
              size="16"
              class="mr-1"
            >mdi-cookie-settings</VIcon>
            {{ t("common.cookieConsent.manageCookies") }}
          </VBtn>
        </div>
      </VContainer>
    </div>

    <!-- Mobile cookie button (always visible on small screens) -->
    <div
      v-if="!isStatusBarHidden && isMobile"
      class="mobile-cookie-link"
    >
      <VContainer>
        <div class="d-flex justify-center align-center py-1">
          <VBtn
            variant="text"
            size="x-small"
            class="text-caption opacity-70"
            @click="openCookieSettings"
          >
            <VIcon
              size="14"
              class="mr-1"
            >mdi-cookie-settings</VIcon>
            {{ t("common.cookieConsent.manageCookies") }}
          </VBtn>
        </div>
      </VContainer>
    </div>
  </div>
</template>

<script setup>
import StatusBar from "@core/components/StatusBar.vue"
import { ref, onMounted, onBeforeUnmount, watch } from "vue"
import { useI18n } from "vue-i18n"

const { t } = useI18n()
const isStatusBarHidden = ref(localStorage.getItem('statusBarHidden') === 'true')
const isMobile = ref(false)

const handleStatusBarToggle = event => {
  isStatusBarHidden.value = event.detail.hidden
}

// Function to open cookie settings
const openCookieSettings = () => {
  window.dispatchEvent(new CustomEvent('open-cookie-settings'))
}

// Detect mobile screen size
const updateMobileState = () => {
  isMobile.value = window.innerWidth < 768
}

// Resize handler
let resizeHandler = null

// Apply class to parent footer element and update page content padding
const updateFooterClass = () => {
  const footer = document.querySelector('.layout-footer')
  const pageContent = document.querySelector('.layout-page-content')

  if (footer) {
    if (isStatusBarHidden.value) {
      footer.classList.add('statusbar-hidden')
      if (pageContent) {
        pageContent.style.paddingBlockEnd = '0.25rem'
      }
    } else {
      footer.classList.remove('statusbar-hidden')
      if (pageContent) {
        pageContent.style.paddingBlockEnd = '0.5rem'
      }
    }
  }
}

watch(isStatusBarHidden, updateFooterClass)

onMounted(() => {
  window.addEventListener('statusbar-toggle', handleStatusBarToggle)
  updateFooterClass()

  // Initialize mobile state
  updateMobileState()

  // Add resize listener
  resizeHandler = () => {
    updateMobileState()
  }
  window.addEventListener('resize', resizeHandler)
})

onBeforeUnmount(() => {
  window.removeEventListener('statusbar-toggle', handleStatusBarToggle)
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
  }
})
</script>

<style scoped>
:deep(.layout-footer.statusbar-hidden) {
  padding: 0 !important;
  min-height: 0 !important;
  height: 0 !important;
}

.footer-container {
  width: 100%;
}

.footer-links {
  border-top: 1px solid rgba(var(--v-border-color), 0.12);
  background: rgba(var(--v-theme-surface), 0.8);
}

.mobile-cookie-link {
  border-top: 1px solid rgba(var(--v-border-color), 0.06);
}

.mobile-cookie-link .v-btn {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.mobile-cookie-link .v-btn:hover {
  opacity: 1;
}
</style>
