import VueGtag from 'vue-gtag-next'

/**
 * Detect device type (mobile, tablet, or desktop)
 * @returns {string} Device type
 */
export function detectDeviceType() {
  const userAgent = navigator.userAgent.toLowerCase()
  const width = window.innerWidth

  // Mobile detection
  const isMobile = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)

  // Tablet detection (including iPads)
  const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(userAgent) ||
                   (isMobile && width >= 768)

  if (isTablet) return 'tablet'
  if (isMobile) return 'mobile'

  return 'desktop'
}

/**
 * Get device category for analytics
 * @returns {string} Device category (mobile or desktop)
 */
export function getDeviceCategory() {
  const deviceType = detectDeviceType()
  // Simplify to mobile/desktop for cleaner analytics
  return deviceType === 'mobile' || deviceType === 'tablet' ? 'mobile' : 'desktop'
}

/**
 * Get browser information
 * @returns {object} Browser name and version
 */
export function getBrowserInfo() {
  const userAgent = navigator.userAgent
  let browserName = 'Unknown'
  let browserVersion = 'Unknown'

  // Chrome
  if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edg') === -1) {
    browserName = 'Chrome'
    browserVersion = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown'
  }
  // Edge
  else if (userAgent.indexOf('Edg') > -1) {
    browserName = 'Edge'
    browserVersion = userAgent.match(/Edg\/(\d+)/)?.[1] || 'Unknown'
  }
  // Firefox
  else if (userAgent.indexOf('Firefox') > -1) {
    browserName = 'Firefox'
    browserVersion = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown'
  }
  // Safari
  else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
    browserName = 'Safari'
    browserVersion = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown'
  }
  // Opera
  else if (userAgent.indexOf('OPR') > -1) {
    browserName = 'Opera'
    browserVersion = userAgent.match(/OPR\/(\d+)/)?.[1] || 'Unknown'
  }

  return { browserName, browserVersion }
}

/**
 * Get screen resolution category
 * @returns {string} Resolution category
 */
export function getResolutionCategory() {
  const width = window.screen.width
  const height = window.screen.height

  if (width <= 768) return 'small' // Mobile
  if (width <= 1024) return 'medium' // Tablet
  if (width <= 1920) return 'large' // Desktop HD
  return 'xlarge' // 2K/4K
}

/**
 * Initialize Google Analytics plugin
 * @param {object} app - Vue app instance
 * @param {object} router - Vue router instance
 */
export default function setupAnalytics(app, router) {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID

  if (!measurementId) {
    console.warn('⚠️ Google Analytics: VITE_GA_MEASUREMENT_ID not found in environment variables')
    return
  }

  const deviceCategory = getDeviceCategory()
  const deviceType = detectDeviceType()
  const { browserName, browserVersion } = getBrowserInfo()
  const resolutionCategory = getResolutionCategory()
  const screenSize = `${window.screen.width}x${window.screen.height}`

  console.log('📊 Google Analytics initialized:', {
    measurementId,
    deviceCategory,
    deviceType,
    browserName,
    browserVersion,
    resolutionCategory,
    screenSize,
  })

  // Configure Google Analytics
  app.use(VueGtag, {
    property: {
      id: measurementId,
      params: {
        // Custom dimensions for device categorization
        device_category: deviceCategory,
        device_type: deviceType,
        browser_name: browserName,
        browser_version: browserVersion,
        resolution_category: resolutionCategory,
        screen_size: screenSize,
        app_version: import.meta.env.VITE_APP_VERSION || 'unknown',
        send_page_view: false, // We'll handle page views manually via router
      },
    },
    // Enable debug mode in development
    isEnabled: true,
    useDebugger: import.meta.env.DEV,
  }, router)

  // Track initial page view with device info
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
      device_category: deviceCategory,
      device_type: deviceType,
    })
  }

  console.log('✅ Google Analytics tracking enabled')
}
