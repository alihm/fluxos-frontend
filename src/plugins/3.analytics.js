import setupAnalytics from './analytics/index'
import { router } from './1.router/index'

/**
 * Google Analytics Plugin
 * Load order: 3 (after router and pinia)
 *
 * Provides comprehensive analytics tracking with:
 * - Automatic page view tracking
 * - Device categorization (mobile/desktop)
 * - Browser and screen resolution tracking
 * - Custom event tracking via useAnalytics composable
 */
export default function (app) {
  // Initialize Google Analytics with router for automatic page view tracking
  setupAnalytics(app, router)

  // Setup automatic page view tracking on route changes
  router.afterEach((to, from) => {
    // Skip tracking if navigation failed or was cancelled
    if (!to.name) return

    // Track page view with Google Analytics
    if (window.gtag) {
      const pageTitle = to.meta?.title || to.name || document.title
      const pagePath = to.path

      // Get device info for tracking
      const deviceCategory = to.query?.device_category ||
                             (window.innerWidth <= 768 ? 'mobile' : 'desktop')

      window.gtag('event', 'page_view', {
        page_title: pageTitle,
        page_path: pagePath,
        page_location: window.location.href,
        device_category: deviceCategory,
      })

      // Track navigation from previous page (if exists)
      if (from.name) {
        window.gtag('event', 'navigation', {
          from_page: from.path,
          to_page: to.path,
          navigation_type: 'route_change',
        })
      }
    }
  })

  console.log('✅ Analytics plugin registered')
}
