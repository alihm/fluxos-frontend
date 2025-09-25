<script setup>
import navItems from "@/navigation/horizontal"
import { themeConfig } from "@themeConfig"

// Components
import BackendSelector from "@/@core/components/BackendSelector.vue"
import Footer from "@/layouts/components/Footer.vue"
import NavBarNotifications from "@/layouts/components/NavBarNotifications.vue"
import NavbarThemeSwitcher from "@/layouts/components/NavbarThemeSwitcher.vue"
import UserProfile from "@/layouts/components/UserProfile.vue"
import NavBarI18n from "@core/components/I18n.vue"
import { HorizontalNavLayout } from "@layouts"
import { VNodeRenderer } from "@layouts/components/VNodeRenderer"
import { useSnackbar } from '@/composables/useSnackbar'

// Global snackbar
const { snackbar } = useSnackbar()
</script>

<template>
  <HorizontalNavLayout :nav-items="navItems">
    <!-- 👉 navbar -->
    <template #navbar>
      <RouterLink
        to="/"
        class="app-logo d-flex align-center gap-x-3"
      >
        <div class="logo-wrapper">
          <VNodeRenderer :nodes="themeConfig.app.logo.value" />
        </div>
      </RouterLink>

      <VIcon
        icon="mdi-transit-connection"
        size="24"
        class="mx-2 text-muted"
      />
      <BackendSelector class="ml-2" />
      <VSpacer />

      <NavBarI18n
        v-if="themeConfig.app.i18n.enable && themeConfig.app.i18n.langConfig?.length"
        :languages="themeConfig.app.i18n.langConfig"
      />

      <NavbarThemeSwitcher />
      <!-- <NavbarShortcuts /> -->
      <NavBarNotifications class="mr-3" />
      <UserProfile />
    </template>

    <!-- 👉 Pages -->
    <slot />

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>

    <!-- 👉 Customizer -->
    <TheCustomizer />

    <!-- Global Snackbar -->
    <VSnackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      location="top"
    >
      {{ snackbar.message }}
    </VSnackbar>
  </HorizontalNavLayout>
</template>

<style lang="scss" scoped>
.app-logo {
  display: flex;
  align-items: center;
  column-gap: 0.75rem;

  .app-logo-title {
    font-size: 1.375rem;
    font-weight: 700;
    letter-spacing: 0.25px;
    line-height: 1.5rem;
    text-transform: capitalize;
  }
}

.logo-wrapper {
  max-height: 60px;
  max-width: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  svg {
    height: auto;
    width: 100%;
    display: block;
    object-fit: contain;
  }
}
</style>
