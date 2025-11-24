/**
 * Google Analytics 4 Integration
 * GDPR-compliant analytics with consent management
 */

/**
 * Detect device type with consistent logic
 * @returns {string} Device type: mobile, tablet, or desktop
 */
export function detectDeviceType() {
  try {
    const userAgent = navigator.userAgent.toLowerCase()
    const width = window.innerWidth

    // Check for mobile devices first
    const isMobileDevice = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)

    // Check for tablets (including iPads)
    const isTabletDevice = /ipad|android(?!.*mobile)|tablet/i.test(userAgent)

    // Combine device detection with screen size for accuracy
    if (isTabletDevice || (isMobileDevice && width >= 768 && width <= 1024)) {
      return 'tablet'
    }

    if (isMobileDevice || width <= 768) {
      return 'mobile'
    }

    return 'desktop'
  } catch (error) {
    console.error('Error detecting device type:', error)
    
    return 'desktop' // Safe fallback
  }
}

/**
 * Get device category for analytics (mobile or desktop)
 * Tablets are grouped as mobile for simpler analytics
 * @returns {string} Device category
 */
export function getDeviceCategory() {
  try {
    const deviceType = detectDeviceType()
    
    return deviceType === 'mobile' || deviceType === 'tablet' ? 'mobile' : 'desktop'
  } catch (error) {
    console.error('Error getting device category:', error)
    
    return 'desktop' // Safe fallback
  }
}

/**
 * Get browser information
 * @returns {object} Browser name and version
 */
export function getBrowserInfo() {
  try {
    const userAgent = navigator.userAgent
    let browserName = 'Unknown'
    let browserVersion = 'Unknown'

    // Chrome (check before Safari)
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      browserName = 'Chrome'
      browserVersion = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown'
    }

    // Edge
    else if (userAgent.includes('Edg')) {
      browserName = 'Edge'
      browserVersion = userAgent.match(/Edg\/(\d+)/)?.[1] || 'Unknown'
    }

    // Firefox
    else if (userAgent.includes('Firefox')) {
      browserName = 'Firefox'
      browserVersion = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown'
    }

    // Safari
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browserName = 'Safari'
      browserVersion = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown'
    }

    // Opera
    else if (userAgent.includes('OPR')) {
      browserName = 'Opera'
      browserVersion = userAgent.match(/OPR\/(\d+)/)?.[1] || 'Unknown'
    }

    return { browserName, browserVersion }
  } catch (error) {
    console.error('Error getting browser info:', error)
    
    return { browserName: 'Unknown', browserVersion: 'Unknown' }
  }
}

/**
 * Get screen resolution category
 * @returns {string} Resolution category
 */
export function getResolutionCategory() {
  try {
    const width = window.screen.width

    if (width <= 768) return 'small' // Mobile
    if (width <= 1024) return 'medium' // Tablet
    if (width <= 1920) return 'large' // Desktop HD
    
    return 'xlarge' // 2K/4K
  } catch (error) {
    console.error('Error getting resolution category:', error)
    
    return 'medium' // Safe fallback
  }
}

/**
 * Initialize Google Analytics 4
 * @param {object} app - Vue app instance
 */
export default function setupAnalytics(app) {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID
  const analyticsEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true'
  const isProduction = import.meta.env.PROD
  const isDevelopment = import.meta.env.DEV

  // Don't initialize if no measurement ID
  if (!measurementId) {
    if (isDevelopment) {
      console.warn('⚠️ Google Analytics: VITE_GA_MEASUREMENT_ID not configured')
    }

    return
  }

  // Don't send analytics in development to avoid polluting production data
  if (isDevelopment) {
    console.log('📊 Google Analytics: Development mode - tracking disabled')

    // Create mock gtag for development
    window.gtag = function(...args) {
      console.log('📊 [DEV] Analytics Event:', ...args)
    }

    return
  }

  // Check if analytics is explicitly enabled (production safety check)
  if (!analyticsEnabled) {
    console.log('📊 Google Analytics: Disabled (VITE_ENABLE_ANALYTICS=false)')

    // Create mock gtag for disabled state
    window.gtag = function(...args) {
      console.log('📊 [DISABLED] Analytics Event:', ...args)
    }

    return
  }

  try {
    // Load gtag.js script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    document.head.appendChild(script)

    // Initialize gtag function
    window.dataLayer = window.dataLayer || []
    window.gtag = function() {
      window.dataLayer.push(arguments)
    }

    // Set default consent to denied (GDPR compliance)
    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      wait_for_update: 500,
    })

    // Configure Google Analytics
    window.gtag('js', new Date())
    window.gtag('config', measurementId, {
      send_page_view: false, // We handle page views manually
      anonymize_ip: true, // GDPR: Anonymize IP addresses
      cookie_flags: 'SameSite=None;Secure', // Modern cookie settings
      app_version: import.meta.env.VITE_APP_VERSION || 'unknown',
    })

    // Get device info for custom dimensions
    const deviceCategory = getDeviceCategory()
    const deviceType = detectDeviceType()
    const { browserName, browserVersion } = getBrowserInfo()
    const resolutionCategory = getResolutionCategory()

    // Set custom user properties (these persist across events)
    window.gtag('set', 'user_properties', {
      device_category: deviceCategory,
      device_type: deviceType,
      browser_name: browserName,
      browser_version: browserVersion,
      resolution_category: resolutionCategory,
    })

    if (isProduction) {
      console.log('✅ Google Analytics initialized (consent required)')
    }
  } catch (error) {
    console.error('Error initializing Google Analytics:', error)
  }
}
