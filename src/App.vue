<script setup>
import ScrollToTop from "@core/components/ScrollToTop.vue"
import initCore from "@core/initCore"
import { initConfigStore, useConfigStore } from "@core/stores/config"
import { hexToRgb } from "@core/utils/colorConverter"
import { logoRef, logos } from "@themeConfig"
import { onMounted, watch } from "vue"
import { useTheme } from "vuetify"
import { useFluxStore } from '@/stores/flux'

const { global } = useTheme()

// ℹ️ Sync current theme with initial loader theme
initCore()
initConfigStore()

const configStore = useConfigStore()
function updateLogoByTheme() {
  const theme = global.current.value

  localStorage.setItem("vuexy-initial-loader-bg", theme.colors.background)
  localStorage.setItem("vuexy-initial-loader-color", theme.colors.primary)
  logoRef.value = h("div", {
    innerHTML: global.current.value.dark ? logos.dark : logos.light,
    style: "line-height: 0;",
  })
}

onMounted(() => {
  updateLogoByTheme()
  window.dispatchEvent(new Event("app-ready"))

  const fluxStore = useFluxStore()

  fluxStore.fetchFluxIDs()
})

watch(
  () => global.current.value.dark,
  val => {
    updateLogoByTheme()
  },
)
</script>

<template>
  <VLocaleProvider :rtl="configStore.isAppRTL">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp
      :style="`--v-global-theme-primary: ${hexToRgb(
        global.current.value.colors.primary
      )}`"
    >
      <RouterView />
      <ScrollToTop />
    </VApp>
  </VLocaleProvider>
</template>
