/**
 * Marketplace Type Definitions
 * Based on FluxCloud game marketplace architecture
 */

/**
 * @typedef {Object} MarketplaceAppConfiguration
 * @property {string} id - Unique configuration identifier
 * @property {number} price - Monthly price for this configuration
 * @property {number} instances - Number of instances
 * @property {string} name - Configuration name (e.g., "Basic", "Premium")
 * @property {string} description - Configuration description
 * @property {Array<FluxCloudAppComponent>} components - Component resources
 * @property {string} [icon] - Optional configuration icon
 * @property {string} [group] - Group this config belongs to
 * @property {string} [color] - Configuration color theme
 * @property {string} [highlight] - Border highlight color
 * @property {number} [highlightWidth] - Border highlight width in pixels
 * @property {string} [style] - Custom styling
 */

/**
 * @typedef {Object} FluxCloudAppComponent
 * @property {number} cpu - CPU cores required
 * @property {number} ram - RAM in MB
 * @property {number} hdd - Storage in GB
 * @property {string} [tiered] - Tiered pricing info
 */

/**
 * @typedef {Object} MarketplaceAppGroup
 * @property {string} title - Group title
 * @property {string} description - Group description
 * @property {string} [color] - Text color
 * @property {string} [backgroundColor] - Background color
 * @property {string} [backgroundImage] - Background image URL
 * @property {string} [style] - Custom styling
 */

/**
 * @typedef {Object} PanelPadding
 * @property {number} top - Top padding in pixels
 * @property {number} right - Right padding in pixels
 * @property {number} bottom - Bottom padding in pixels
 * @property {number} left - Left padding in pixels
 */

/**
 * @typedef {Object} Panel
 * @property {boolean} enabled - Whether panel is enabled
 * @property {string} title - Panel title
 * @property {string} body - Panel body content
 * @property {number} [height] - Panel height in pixels
 * @property {string} [background] - Background color/gradient
 * @property {string} [image] - Background image URL
 * @property {PanelPadding} [padding] - Panel padding
 * @property {string} type - Panel type (Header, Groups, Screenshots, NodeMap, Subscription)
 * @property {number} [cornerRadius] - Border radius in pixels
 */

/**
 * @typedef {Object} GameApplication
 * @property {string} uuid - Unique identifier
 * @property {string} name - App name (lowercase, used in URLs)
 * @property {string} displayName - Display name
 * @property {string} [uiName] - UI-specific name override
 * @property {string} description - App description
 * @property {string} [icon] - Icon URL
 * @property {boolean} visible - Whether app is visible
 * @property {boolean} enabled - Whether app is enabled
 * @property {number} [price] - Base price (if not using configs)
 * @property {boolean} useConfig - Whether to use configuration system
 * @property {Array<MarketplaceAppConfiguration>} [configs] - Available configurations
 * @property {Array<MarketplaceAppGroup>} [groups] - Configuration groups
 * @property {Array<Panel>} [panels] - Dynamic UI panels for details page
 * @property {string} [landingImage] - Hero image for landing card
 * @property {string} [detailHeaderImage] - Header image for details page
 * @property {string} [detailHeaderText] - Header text for details page
 * @property {PanelPadding} [groupPadding] - Padding for group containers
 * @property {PanelPadding} [configPadding] - Padding for config cards
 * @property {boolean} [swapPageHeaderLayout] - Swap header image/text order
 * @property {string} [style] - Custom styling
 * @property {Array<string>} [screenshots] - Screenshot URLs
 * @property {string} [category] - Category identifier
 */

export {

  // Export types for JSDoc usage
}
