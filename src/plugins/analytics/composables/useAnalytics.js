import { hasAnalyticsConsent } from '@/composables/useCookieConsent'

/**
 * Analytics composable for tracking events throughout the application
 * GDPR-compliant with consent checking
 * Auto-imports enabled via vite.config.js
 */
export function useAnalytics() {
  /**
   * Check if analytics tracking is allowed
   * @returns {boolean}
   */
  const canTrack = () => {
    // Always allow in development (logs to console only)
    if (import.meta.env.DEV) return true

    // In production, check consent
    return hasAnalyticsConsent()
  }

  /**
   * Track a custom event
   * @param {string} eventName - Event name (e.g., 'button_click', 'app_deploy')
   * @param {object} params - Event parameters
   */
  const trackEvent = (eventName, params = {}) => {
    // Check consent first
    if (!canTrack()) {
      return
    }

    if (!window.gtag) {
      if (import.meta.env.DEV) {
        console.warn('⚠️ Google Analytics not loaded')
      }
      
      return
    }

    try {
      // Device info is already set as user properties in analytics/index.js
      // No need to send with every event - reduces payload size
      const eventParams = {
        ...params,
        timestamp: new Date().toISOString(),
      }

      window.gtag('event', eventName, eventParams)

      if (import.meta.env.DEV) {
        console.log('📊 Analytics Event:', eventName, eventParams)
      }
    } catch (error) {
      console.error('Error tracking event:', error)
    }
  }

  /**
   * Track page view (usually automatic, but can be called manually)
   * @param {string} pagePath - Page path
   * @param {string} pageTitle - Page title
   */
  const trackPageView = (pagePath, pageTitle) => {
    trackEvent('page_view', {
      page_path: pagePath,
      page_title: pageTitle,
      page_location: window.location.href,
    })
  }

  /**
   * Track user authentication events
   * @param {string} method - Auth method (zelid, firebase, metamask, walletconnect)
   * @param {boolean} success - Whether auth was successful
   */
  const trackAuth = (method, success = true) => {
    trackEvent('user_authentication', {
      auth_method: method,
      auth_status: success ? 'success' : 'failed',
    })
  }

  /**
   * Track application deployment events
   * @param {string} appName - Application name
   * @param {string} action - Action (deploy, update, remove, start, stop)
   * @param {object} metadata - Additional metadata
   */
  const trackAppAction = (appName, action, metadata = {}) => {
    trackEvent('app_action', {
      app_name: appName,
      action_type: action,
      ...metadata,
    })
  }

  /**
   * Track marketplace interactions
   * @param {string} action - Action (view, search, filter, install)
   * @param {object} metadata - Additional metadata
   */
  const trackMarketplace = (action, metadata = {}) => {
    trackEvent('marketplace_interaction', {
      interaction_type: action,
      ...metadata,
    })
  }

  /**
   * Track FluxDrive interactions
   * @param {string} action - Action (upload, download, delete, share)
   * @param {object} metadata - File metadata
   */
  const trackFluxDrive = (action, metadata = {}) => {
    trackEvent('fluxdrive_action', {
      action_type: action,
      ...metadata,
    })
  }

  /**
   * Track xDAO interactions
   * @param {string} action - Action (view_proposal, vote, create_proposal)
   * @param {object} metadata - Proposal metadata
   */
  const trackXDAO = (action, metadata = {}) => {
    trackEvent('xdao_interaction', {
      interaction_type: action,
      ...metadata,
    })
  }

  /**
   * Track node management actions
   * @param {string} action - Action (update, restart, benchmark)
   * @param {object} metadata - Node metadata
   */
  const trackNodeAction = (action, metadata = {}) => {
    trackEvent('node_management', {
      action_type: action,
      ...metadata,
    })
  }

  /**
   * Track search queries
   * @param {string} query - Search query
   * @param {string} context - Search context (marketplace, apps, global)
   * @param {number} resultsCount - Number of results
   */
  const trackSearch = (query, context = 'global', resultsCount = 0) => {
    trackEvent('search', {
      search_term: query,
      search_context: context,
      results_count: resultsCount,
    })
  }

  /**
   * Track form submissions
   * @param {string} formName - Form identifier
   * @param {boolean} success - Whether submission was successful
   */
  const trackFormSubmit = (formName, success = true) => {
    trackEvent('form_submission', {
      form_name: formName,
      submission_status: success ? 'success' : 'failed',
    })
  }

  /**
   * Track errors
   * @param {string} errorType - Error type/category
   * @param {string} errorMessage - Error message
   * @param {string} context - Where the error occurred
   */
  const trackError = (errorType, errorMessage, context = 'unknown') => {
    trackEvent('error', {
      error_type: errorType,
      error_message: errorMessage?.substring(0, 500), // Limit message length (consistent with plugin)
      error_context: context,
      fatal: false,
    })
  }

  /**
   * Track navigation/menu clicks
   * @param {string} itemName - Menu item name
   * @param {string} destination - Destination path
   */
  const trackNavigation = (itemName, destination) => {
    trackEvent('navigation_click', {
      menu_item: itemName,
      destination_path: destination,
    })
  }

  /**
   * Track feature usage
   * @param {string} featureName - Feature name
   * @param {object} metadata - Additional metadata
   */
  const trackFeatureUse = (featureName, metadata = {}) => {
    trackEvent('feature_usage', {
      feature_name: featureName,
      ...metadata,
    })
  }

  /**
   * Track button clicks with context
   * @param {string} buttonName - Button identifier
   * @param {string} context - Context where button was clicked
   */
  const trackButtonClick = (buttonName, context = '') => {
    trackEvent('button_click', {
      button_name: buttonName,
      click_context: context,
    })
  }

  /**
   * Track downloads
   * @param {string} fileName - Downloaded file name
   * @param {string} fileType - File type/extension
   * @param {number} fileSize - File size in bytes
   */
  const trackDownload = (fileName, fileType = 'unknown', fileSize = 0) => {
    trackEvent('file_download', {
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
    })
  }

  /**
   * Track video/media interactions
   * @param {string} action - Action (play, pause, complete)
   * @param {string} mediaName - Media identifier
   */
  const trackMedia = (action, mediaName) => {
    trackEvent('media_interaction', {
      action_type: action,
      media_name: mediaName,
    })
  }

  /**
   * Track language changes
   * @param {string} fromLang - Previous language
   * @param {string} toLang - New language
   */
  const trackLanguageChange = (fromLang, toLang) => {
    trackEvent('language_change', {
      from_language: fromLang,
      to_language: toLang,
    })
  }

  /**
   * Track theme changes
   * @param {string} theme - New theme (light/dark)
   */
  const trackThemeChange = theme => {
    trackEvent('theme_change', {
      theme_name: theme,
    })
  }

  /**
   * Track checkout/payment events
   * @param {string} action - Action (begin_checkout, add_payment_info, purchase)
   * @param {object} metadata - Payment metadata
   */
  const trackCheckout = (action, metadata = {}) => {
    trackEvent(action, metadata)
  }

  /**
   * Track payment system selection
   * @param {string} paymentSystem - Payment system selected (fluxpay, cryptocom, zelcore, ssp)
   * @param {object} metadata - Additional context (plan, price, etc.)
   */
  const trackPaymentSystemSelected = (paymentSystem, metadata = {}) => {
    trackEvent('payment_system_selected', {
      payment_system: paymentSystem,
      ...metadata,
    })
  }

  /**
   * Track wallet connections
   * @param {string} walletType - Wallet type (metamask, walletconnect)
   * @param {boolean} success - Connection success
   */
  const trackWalletConnection = (walletType, success = true) => {
    trackEvent('wallet_connection', {
      wallet_type: walletType,
      connection_status: success ? 'success' : 'failed',
    })
  }

  /**
   * Track user engagement time on page
   * @param {string} pageName - Page identifier
   * @param {number} timeSeconds - Time spent in seconds
   */
  const trackEngagement = (pageName, timeSeconds) => {
    trackEvent('user_engagement', {
      page_name: pageName,
      engagement_time_seconds: timeSeconds,
    })
  }

  return {
    trackEvent,
    trackPageView,
    trackAuth,
    trackAppAction,
    trackMarketplace,
    trackFluxDrive,
    trackXDAO,
    trackNodeAction,
    trackSearch,
    trackFormSubmit,
    trackError,
    trackNavigation,
    trackFeatureUse,
    trackButtonClick,
    trackDownload,
    trackMedia,
    trackLanguageChange,
    trackThemeChange,
    trackCheckout,
    trackPaymentSystemSelected,
    trackWalletConnection,
    trackEngagement,
  }
}
