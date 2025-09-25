import { storeToRefs } from 'pinia'
import { useTheme } from 'vuetify'
import { cookieRef, useLayoutConfigStore } from '@layouts/stores/config'
import { themeConfig } from '@themeConfig'

// SECTION Store
export const useConfigStore = defineStore('config', () => {
  // 👉 Theme
  const userPreferredColorScheme = usePreferredColorScheme()
  const cookieColorScheme = cookieRef('color-scheme', 'light')

  watch(userPreferredColorScheme, val => {
    if (val !== 'no-preference')
      cookieColorScheme.value = val
  }, { immediate: true })

  const theme = cookieRef('theme', themeConfig.app.theme)

  // 👉 isVerticalNavSemiDark
  const isVerticalNavSemiDark = cookieRef('isVerticalNavSemiDark', themeConfig.verticalNav.isVerticalNavSemiDark)

  // 👉 isVerticalNavSemiDark
  const skin = cookieRef('skin', themeConfig.app.skin)

  // ℹ️ We need to use `storeToRefs` to forward the state
  const { isLessThanOverlayNavBreakpoint, appContentWidth, navbarType, isNavbarBlurEnabled, appContentLayoutNav, isVerticalNavCollapsed, footerType, isAppRTL } = storeToRefs(useLayoutConfigStore())
  
  return {
    theme,
    isVerticalNavSemiDark,
    skin,

    // @layouts exports
    isLessThanOverlayNavBreakpoint,
    appContentWidth,
    navbarType,
    isNavbarBlurEnabled,
    appContentLayoutNav,
    isVerticalNavCollapsed,
    footerType,
    isAppRTL,
  }
})
// !SECTION
// SECTION Init
export const initConfigStore = () => {
  const userPreferredColorScheme = usePreferredColorScheme()
  const vuetifyTheme = useTheme()
  const configStore = useConfigStore()

  watch([() => configStore.theme, userPreferredColorScheme], () => {
    const themeName = configStore.theme === 'system'
      ? userPreferredColorScheme.value === 'dark'
        ? 'dark'
        : 'light'
      : configStore.theme

    // Use the new Vuetify theme.change() API
    if (vuetifyTheme.global.name.value !== themeName) {
      try {
        // Use the new theme.change() method as recommended by Vuetify
        if (typeof vuetifyTheme.global.name.change === 'function') {
          vuetifyTheme.global.name.change(themeName)
        } else if (typeof vuetifyTheme.change === 'function') {
          vuetifyTheme.change(themeName)
        } else {
          // Fallback to direct assignment if change method doesn't exist
          vuetifyTheme.global.name.value = themeName
        }
      } catch (error) {
        console.warn('Failed to change theme:', error)
        // Fallback to direct assignment
        vuetifyTheme.global.name.value = themeName
      }
    }
  })
  onMounted(() => {
    if (configStore.theme === 'system') {
      const themeName = userPreferredColorScheme.value

      // Use the new Vuetify theme.change() API
      if (vuetifyTheme.global.name.value !== themeName) {
        try {
          // Use the new theme.change() method as recommended by Vuetify
          if (typeof vuetifyTheme.global.name.change === 'function') {
            vuetifyTheme.global.name.change(themeName)
          } else if (typeof vuetifyTheme.change === 'function') {
            vuetifyTheme.change(themeName)
          } else {
            // Fallback to direct assignment if change method doesn't exist
            vuetifyTheme.global.name.value = themeName
          }
        } catch (error) {
          console.warn('Failed to change theme in onMounted:', error)
          // Fallback to direct assignment
          vuetifyTheme.global.name.value = themeName
        }
      }
    }
  })
}
// !SECTION
