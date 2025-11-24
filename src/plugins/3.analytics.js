import setupAnalytics from './analytics/index'
import { hasAnalyticsConsent } from '@/composables/useCookieConsent'

/**
 * Google Analytics Plugin
 * Load order: 3 (after router and pinia)
 *
 * Features:
 * - GDPR-compliant with consent management
 * - Single page view tracking (no duplication)
 * - Automatic route change tracking
 * - Development mode support (no data sent)
 * - IP anonymization enabled
 * - Custom dimensions for device/browser tracking
 *
 * Note: Router is accessed dynamically to avoid circular dependencies
 */

let routerUnsubscribe = null

export default function (app) {
  // Initialize Google Analytics (handles GDPR consent, dev mode, etc.)
  setupAnalytics(app)

  // Setup automatic page view tracking on route changes
  // Access router from app instance to avoid import issues
  const router = app.config.globalProperties.$router

  if (!router) {
    console.error('❌ Analytics: Router not found on app instance')
    
    return
  }

  // Track page views on route navigation
  // This is the ONLY place where page views are tracked (no triple tracking)
  routerUnsubscribe = router.afterEach((to, from) => {
    // Skip if navigation failed or was cancelled
    if (!to.name) return

    // Only track if user has consented and gtag is available
    if (!window.gtag) return

    // Check consent before tracking
    if (!hasAnalyticsConsent() && import.meta.env.PROD) {
      return // Don't track without consent in production
    }

    try {
      const pageTitle = to.meta?.title || to.name || document.title
      const pagePath = to.path

      // Device info is already set as user properties in analytics/index.js
      // No need to send with page_view - reduces payload size
      window.gtag('event', 'page_view', {
        page_title: pageTitle,
        page_path: pagePath,
        page_location: window.location.href,
      })

      // Track navigation path (if coming from another page)
      if (from.name) {
        window.gtag('event', 'navigation', {
          from_page: from.path,
          to_page: to.path,
          navigation_type: 'route_change',
        })
      }
    } catch (error) {
      console.error('Error tracking page view:', error)
    }
  })

  // Cleanup on app unmount to prevent memory leaks
  app._context.app.unmount = new Proxy(app._context.app.unmount, {
    apply(target, thisArg, args) {
      if (routerUnsubscribe) {
        routerUnsubscribe()
        routerUnsubscribe = null
      }
      
      return Reflect.apply(target, thisArg, args)
    },
  })

  console.log('✅ Analytics plugin registered')
}
