/**
 * Dynamic Sitemap Generator for FluxCloud
 * Generates sitemap.xml with current date as lastmod
 * Run with: node scripts/generate-sitemap.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Get current date in ISO format (YYYY-MM-DD)
const currentDate = new Date().toISOString().split('T')[0]

// Define all URLs with their priorities and change frequencies
const urls = [
  // High Priority Pages
  {
    loc: 'https://cloud.runonflux.com/',
    priority: 1.0,
    changefreq: 'daily',
    description: 'Homepage',
  },
  {
    loc: 'https://cloud.runonflux.com/cost-calculator',
    priority: 0.9,
    changefreq: 'weekly',
    description: 'Cost Calculator',
  },
  {
    loc: 'https://cloud.runonflux.com/flux-drive',
    priority: 0.9,
    changefreq: 'weekly',
    description: 'FluxDrive',
  },
  {
    loc: 'https://cloud.runonflux.com/marketplace/games',
    priority: 0.9,
    changefreq: 'weekly',
    description: 'Games Landing Page',
  },
  {
    loc: 'https://cloud.runonflux.com/marketplace/wordpress',
    priority: 0.9,
    changefreq: 'weekly',
    description: 'WordPress Hosting',
  },

  // Dashboard Pages
  {
    loc: 'https://cloud.runonflux.com/dashboards/overview',
    priority: 0.8,
    changefreq: 'daily',
    description: 'Flux Network Overview',
  },
  {
    loc: 'https://cloud.runonflux.com/marketplace',
    priority: 0.8,
    changefreq: 'weekly',
    description: 'Marketplace',
  },
  {
    loc: 'https://cloud.runonflux.com/dashboards/resources',
    priority: 0.7,
    changefreq: 'daily',
    description: 'Flux Network Resources',
  },
  {
    loc: 'https://cloud.runonflux.com/dashboards/locations',
    priority: 0.7,
    changefreq: 'weekly',
    description: 'Flux Node Locations',
  },
  {
    loc: 'https://cloud.runonflux.com/apps/register',
    priority: 0.7,
    changefreq: 'monthly',
    description: 'App Registration',
  },

  // Game Server Hosting Pages
  {
    loc: 'https://cloud.runonflux.com/marketplace/games/palworld',
    priority: 0.8,
    changefreq: 'weekly',
    description: 'Palworld Server Hosting',
  },
  {
    loc: 'https://cloud.runonflux.com/marketplace/games/minecraftserver',
    priority: 0.8,
    changefreq: 'weekly',
    description: 'Minecraft Server Hosting',
  },
  {
    loc: 'https://cloud.runonflux.com/marketplace/games/factorio',
    priority: 0.8,
    changefreq: 'weekly',
    description: 'Factorio Server Hosting',
  },
  {
    loc: 'https://cloud.runonflux.com/marketplace/games/satisfactory',
    priority: 0.8,
    changefreq: 'weekly',
    description: 'Satisfactory Server Hosting',
  },
  {
    loc: 'https://cloud.runonflux.com/marketplace/games/enshrouded',
    priority: 0.8,
    changefreq: 'weekly',
    description: 'Enshrouded Server Hosting',
  },
]

// Generate XML
function generateSitemap() {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`

  urls.forEach(({ loc, priority, changefreq, description }) => {
    xml += `
  <!-- ${description} -->
  <url>
    <loc>${loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>${priority}</priority>
    <changefreq>${changefreq}</changefreq>
  </url>
`
  })

  xml += `
</urlset>`

  return xml
}

// Write sitemap to public directory
function writeSitemap() {
  const sitemap = generateSitemap()
  const outputPath = path.join(__dirname, '../public/sitemap.xml')

  try {
    fs.writeFileSync(outputPath, sitemap, 'utf8')
    console.log(`✅ Sitemap generated successfully at ${outputPath}`)
    console.log(`📅 Last modified date: ${currentDate}`)
    console.log(`📊 Total URLs: ${urls.length}`)
  } catch (error) {
    console.error('❌ Error writing sitemap:', error)
    process.exit(1)
  }
}

// Execute
writeSitemap()
