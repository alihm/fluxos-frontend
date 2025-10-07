import { computed } from 'vue'

/**
 * Shared marketplace utilities composable
 * Centralizes common formatting and utility functions used across marketplace components
 */
export function useMarketplaceUtils() {
  /**
   * Format large numbers to K/M notation
   * @param {number} num - Number to format
   * @returns {string} Formatted number (e.g., "1.5K", "2.3M")
   */
  const formatNumber = num => {
    if (!num && num !== 0) return '0'
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    
    return num.toString()
  }

  /**
   * Format price to 2 decimal places
   * @param {number} price - Price to format
   * @returns {string} Formatted price (e.g., "0.00", "19.99")
   */
  const formatPrice = price => {
    if (!price || price === 0) return '0.00'
    
    return price.toFixed(2)
  }

  /**
   * Truncate text to specified length with ellipsis
   * @param {string} text - Text to truncate
   * @param {number} length - Maximum length
   * @returns {string} Truncated text
   */
  const truncateText = (text, length = 100) => {
    if (!text) return 'No description available'
    
    return text.length > length ? text.substring(0, length) + '...' : text
  }

  /**
   * Get category color by category UUID or name
   * @param {string} categoryIdentifier - Category UUID or name
   * @param {Map} categoryMap - Optional category map (uuid -> name)
   * @returns {string} Vuetify color name
   */
  const getCategoryColor = (categoryIdentifier, categoryMap = null) => {
    // Get category name from map if provided
    let categoryName = categoryIdentifier
    if (categoryMap && categoryMap.get) {
      categoryName = categoryMap.get(categoryIdentifier) || categoryIdentifier
    }

    // Normalize to lowercase for comparison
    const normalizedName = (categoryName || '').toLowerCase()

    const colors = {
      blockchain: 'primary',
      'front-end': 'info',
      masternode: 'success',
      'rpc node': 'warning',
      hosting: 'secondary',
      games: 'error',
      newgames: 'pink',
      blockbook: 'purple',
      productivity: 'orange',
      defi: 'success',
      gaming: 'error',
      social: 'info',
      development: 'purple',
      media: 'pink',
      utilities: 'teal',
      ai: 'indigo',
      infrastructure: 'orange',
      other: 'grey',
    }

    return colors[normalizedName] || 'primary'
  }

  /**
   * Generate consistent color for app based on name hash
   * @param {Object} app - App object with name or displayName
   * @returns {string} Hex color code
   */
  const getAppColor = app => {
    const name = app.displayName || app.name || 'Unknown'
    const colors = [
      '#F44336', // Red
      '#E91E63', // Pink
      '#9C27B0', // Purple
      '#673AB7', // Deep Purple
      '#3F51B5', // Indigo
      '#2196F3', // Blue
      '#03A9F4', // Light Blue
      '#00BCD4', // Cyan
      '#009688', // Teal
      '#4CAF50', // Green
      '#8BC34A', // Light Green
      '#FF9800', // Orange
      '#FF5722', // Deep Orange
      '#795548', // Brown
      '#607D8B', // Blue Grey
    ]

    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }

    return colors[Math.abs(hash) % colors.length]
  }

  /**
   * Generate app initials from name
   * @param {Object} app - App object with name or displayName
   * @returns {string} App initials (e.g., "AB")
   */
  const getAppInitials = app => {
    const name = app.displayName || app.name || 'Unknown'
    const words = name.split(/\s+/)

    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase()
    }

    return name.substring(0, 2).toUpperCase()
  }

  /**
   * Format timestamp to relative time
   * @param {number} timestamp - Unix timestamp in milliseconds
   * @returns {string} Relative time (e.g., "2h ago", "Just now")
   */
  const formatRelativeTime = timestamp => {
    if (!timestamp) return 'New'

    const now = Date.now()
    const diff = now - timestamp
    const absDiff = Math.abs(diff)
    const hours = Math.floor(absDiff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    // Handle future timestamps
    if (diff < 0) {
      if (hours < 1) return 'Soon'
      if (hours < 24) return `In ${hours}h`
      
      return `In ${days}d`
    }

    // Handle past timestamps
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days === 1) return '1d ago'
    if (days < 30) return `${days}d ago`
    if (days < 365) return `${Math.floor(days / 30)}mo ago`
    
    return `${Math.floor(days / 365)}y ago`
  }

  /**
   * Debounce function for search inputs
   * @param {Function} fn - Function to debounce
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} Debounced function
   */
  const debounce = (fn, delay = 300) => {
    let timeoutId
    
    return (...args) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => fn(...args), delay)
    }
  }

  /**
   * Check if image URL is valid
   * @param {string} url - Image URL to validate
   * @returns {boolean} True if valid URL
   */
  const isValidImageUrl = url => {
    if (!url) return false
    
    return url.startsWith('data:image/') ||
           url.startsWith('http://') ||
           url.startsWith('https://') ||
           url.startsWith('//')
  }

  /**
   * Proxy HTTP images through HTTPS
   * @param {string} url - Image URL
   * @returns {string} Proxied HTTPS URL
   */
  const proxyImageUrl = url => {
    if (!url) return ''

    // Handle protocol-relative URLs
    if (url.startsWith('//')) {
      return 'https:' + url
    }

    // Convert HTTP to HTTPS
    if (url.startsWith('http://')) {
      return url.replace('http://', 'https://')
    }

    return url
  }

  return {
    formatNumber,
    formatPrice,
    truncateText,
    getCategoryColor,
    getAppColor,
    getAppInitials,
    formatRelativeTime,
    debounce,
    isValidImageUrl,
    proxyImageUrl,
  }
}
