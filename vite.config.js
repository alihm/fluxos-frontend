import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { fileURLToPath } from 'node:url';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { VueRouterAutoImports, getPascalCaseRouteName } from 'unplugin-vue-router';
import VueRouter from 'unplugin-vue-router/vite';
import { defineConfig } from 'vite';
import VueDevTools from 'vite-plugin-vue-devtools';
import { ClientSideLayout } from 'vite-plugin-vue-layouts';
import vuetify from 'vite-plugin-vuetify';
import svgLoader from 'vite-svg-loader';
import { visualizer } from 'rollup-plugin-visualizer';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { aliases } from './aliases.mjs';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  return {
    plugins: [
      VueRouter({
        getRouteName: routeNode => {
          return getPascalCaseRouteName(routeNode)
            .replace(/([a-z\d])([A-Z])/g, '$1-$2')
            .toLowerCase();
        },
        importMode: 'async',
      }),
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag === 'swiper-container' || tag === 'swiper-slide',
          },
        },
      }),
      isDev && VueDevTools(),
      vueJsx(),
      vuetify({
        styles: {
          configFile: 'src/assets/styles/variables/_vuetify.scss',
        },
      }),
      ClientSideLayout({
        layoutsDir: 'src/layouts',
        importMode: 'async',
      }),
      Components({
        dirs: ['src/@core/components', 'src/views/demos', 'src/components'],
        dts: 'src/components.d.ts',
        deep: true,
        resolvers: [
          (componentName) => {
            if (componentName === 'VueApexCharts')
              return { name: 'default', from: 'vue3-apexcharts', as: 'VueApexCharts' };
          },
        ],
      }),
      AutoImport({
        imports: ['vue', VueRouterAutoImports, '@vueuse/core', '@vueuse/math', 'vue-i18n', 'pinia'],
        dirs: [
          './src/@core/utils',
          './src/@core/composable/',
          './src/composables/',
          './src/utils/',
          './src/plugins/*/composables/*',
          './src/plugins/analytics/composables/*',
        ],
        dts: 'src/auto-imports.d.ts',
        vueTemplate: true,
        eslintrc: {
          enabled: isDev,
          filepath: './eslintrc-auto-import.cjs',
        },
      }),
      VueI18nPlugin({
        runtimeOnly: false,
        compositionOnly: true,
        strictMessage: false,
        include: [
          fileURLToPath(new URL('./src/plugins/i18n/locales/*.json', import.meta.url)),
        ],
      }),
      svgLoader(),
      // Image optimization for production builds
      ViteImageOptimizer({
        // PNG optimization
        png: {
          quality: 80,
        },
        // JPEG optimization
        jpeg: {
          quality: 80,
        },
        // JPG optimization
        jpg: {
          quality: 80,
        },
        // WebP conversion
        webp: {
          quality: 80,
        },
        // SVG optimization
        svg: {
          multipass: true,
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  cleanupNumericValues: false,
                  // Removed removeViewBox from overrides - moved to separate plugin below
                },
              },
            },
            {
              name: 'removeViewBox',
              active: false, // Disable removeViewBox to preserve viewBox attributes
            },
          ],
        },
      }),
      // Bundle analyzer - generates stats.html
      visualizer({
        filename: 'dist/stats.html',
        open: false, // Set to true to auto-open in browser
        gzipSize: true,
        brotliSize: true,
        template: 'treemap', // 'sunburst', 'treemap', 'network'
      }),
    ],
    define: {
      'process.env': {},
      global: 'globalThis', // ✅ important for some node packages
      // Disable Lit dev mode in production
      ...(mode === 'production' && {
        'globalThis.litIssuedWarnings': 'false',
        'globalThis.litDevMode': 'false',
      }),
    },
    resolve: {
      alias: {
        ...aliases,
      },
    },
    server: {
      watch: {
        ignored: ['**/node_modules/**', '**/.git/**'],
        usePolling: false,
        awaitWriteFinish: {
          stabilityThreshold: 100,
          pollInterval: 100,
        },
      },
      hmr: {
        overlay: true,
        protocol: 'ws',
        host: 'localhost',
        port: 3000,
      },
      host: '0.0.0.0',
      port: 3000,
      open: isDev,
      headers: {
        // Allow Firebase popups on localhost by setting COOP to unsafe-none
        'Cross-Origin-Opener-Policy': 'unsafe-none',
        'Cross-Origin-Embedder-Policy': 'unsafe-none',
      },
      proxy: {
        '/api/proposals': {
          target: 'https://stats.runonflux.io',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/proposals/, '/proposals'),
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 1800, // Warn about chunks larger than 1800KB
      reportCompressedSize: true, // Report gzip sizes
      minify: 'esbuild', // Use esbuild for fast builds
      commonjsOptions: {
        include: [/node_modules/, /@metamask\/.*/,/eventemitter2/],
      },
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Skip non-node_modules
            if (!id.includes('node_modules')) {
              return undefined
            }

            // UI Framework - Vuetify
            if (id.includes('vuetify')) {
              return 'vuetify'
            }

            // Element Plus (if used)
            if (id.includes('element-plus')) {
              return 'element-plus'
            }

            // Charts & Visualization
            if (id.includes('apexcharts') || id.includes('vue3-apexcharts')) {
              return 'apexcharts'
            }
            if (id.includes('chart.js') || id.includes('vue-chartjs')) {
              return 'chartjs'
            }

            // Code Editor - Monaco
            if (id.includes('monaco-editor') || id.includes('vue-monaco-editor')) {
              return 'monaco'
            }

            // Maps - Leaflet
            if (id.includes('leaflet.markercluster')) {
              return 'leaflet-cluster'
            }
            if (id.includes('leaflet') || id.includes('vue-leaflet')) {
              return 'leaflet-core'
            }

            // Terminal - xterm
            if (id.includes('@xterm') || id.includes('xterm')) {
              return 'xterm'
            }

            // Rich Text Editor - Tiptap
            if (id.includes('@tiptap') || id.includes('prosemirror')) {
              return 'tiptap'
            }

            // Crypto - MetaMask
            if (id.includes('@metamask')) {
              return 'crypto-metamask'
            }

            // Crypto - WalletConnect/Reown
            if (id.includes('@reown') || id.includes('@walletconnect')) {
              return 'crypto-walletconnect'
            }

            // Crypto - Wagmi/Viem (including @wagmi scoped packages)
            if (id.includes('wagmi') || id.includes('viem') || id.includes('@wagmi')) {
              return 'crypto-viem'
            }

            // Crypto - React Query (wagmi dependency)
            if (id.includes('@tanstack')) {
              return 'crypto-query'
            }

            // Encryption - OpenPGP
            if (id.includes('openpgp')) {
              return 'pgp'
            }

            // Firebase
            if (id.includes('firebase') || id.includes('@firebase')) {
              return 'firebase'
            }

            // Code Highlighting
            if (id.includes('highlight.js') || id.includes('prismjs') || id.includes('shiki')) {
              return 'syntax-highlight'
            }

            // Internationalization
            if (id.includes('vue-i18n') || id.includes('@intlify')) {
              return 'i18n'
            }

            // VueUse utilities
            if (id.includes('@vueuse')) {
              return 'vueuse'
            }

            // Lodash utilities
            if (id.includes('lodash')) {
              return 'lodash'
            }

            // Carousel - Swiper
            if (id.includes('swiper')) {
              return 'swiper'
            }

            // JSON viewer
            if (id.includes('vue-json-pretty')) {
              return 'json-viewer'
            }

            // Date picker
            if (id.includes('flatpickr')) {
              return 'datepicker'
            }

            // Drag and drop
            if (id.includes('draggable') || id.includes('@formkit/drag-and-drop')) {
              return 'drag-drop'
            }

            // Shepherd.js (guided tours)
            if (id.includes('shepherd')) {
              return 'shepherd'
            }

            // YAML parser
            if (id.includes('js-yaml')) {
              return 'yaml'
            }

            // Core Vue ecosystem - keep together
            if (id.includes('vue-router') || id.includes('pinia')) {
              return 'vue-core'
            }

            // Axios and HTTP
            if (id.includes('axios')) {
              return 'http'
            }

            // DOMPurify
            if (id.includes('dompurify')) {
              return 'sanitizer'
            }

            // Buffer/process polyfills
            if (id.includes('/buffer/') || id.includes('/process/')) {
              return 'polyfills'
            }

            // Date utilities
            if (id.includes('date-fns') || id.includes('dayjs') || id.includes('moment')) {
              return 'date-utils'
            }

            // Geospatial utilities (used with leaflet)
            if (id.includes('@turf')) {
              return 'geo-utils'
            }

            // Crypto primitives (noble curves, etc.)
            if (id.includes('@noble') || id.includes('@scure')) {
              return 'crypto-primitives'
            }

            // Additional wallet dependencies (Solana, Porto, Coinbase, Base)
            if (id.includes('@solana') || id.includes('porto') || id.includes('@coinbase') || id.includes('@base-org') || id.includes('coinbase')) {
              return 'crypto-wallets-extra'
            }

            // 3D rendering (if used)
            if (id.includes('three')) {
              return 'three'
            }

            // Vue core (keep vue itself small and in main bundle, but split heavy parts)
            if (id.includes('@vue/') && !id.includes('@vue/runtime') && !id.includes('@vue/reactivity') && !id.includes('@vue/shared')) {
              return 'vue-utils'
            }

            // QR code
            if (id.includes('qr') || id.includes('qrcode')) {
              return 'qrcode'
            }

            // Perfect scrollbar
            if (id.includes('perfect-scrollbar')) {
              return 'scrollbar'
            }

            // Clipboard
            if (id.includes('clipboard')) {
              return 'clipboard'
            }

            // LZ-String compression
            if (id.includes('lz-string')) {
              return 'compression'
            }

            // CASL authorization
            if (id.includes('@casl')) {
              return 'casl'
            }

            // Eventemitter
            if (id.includes('eventemitter')) {
              return 'eventemitter'
            }

            // OX library (crypto related)
            if (id.includes('/ox/')) {
              return 'crypto-ox'
            }

            // UUID library
            if (id.includes('uuid')) {
              return 'uuid'
            }

            // Socket.io and related
            if (id.includes('socket.io') || id.includes('engine.io')) {
              return 'socketio'
            }

            // Floating UI
            if (id.includes('@floating-ui')) {
              return 'floating-ui'
            }

            // Additional wallet/crypto packages (WalletConnect dependencies)
            if (id.includes('@gemini-wallet') || id.includes('@safe-global') || id.includes('@msgpack')) {
              return 'crypto-wallets-extra'
            }

            // Phosphor icons (large icon library used by wallets)
            if (id.includes('@phosphor-icons')) {
              return 'phosphor-icons'
            }

            // Iconify and MDI icons
            if (id.includes('@iconify') || id.includes('@mdi') || id.includes('mdi')) {
              return 'icons-mdi'
            }

            // Lit web components (used by wallets)
            if (id.includes('@lit')) {
              return 'lit'
            }

            // @ctrl packages
            if (id.includes('@ctrl')) {
              return 'ctrl'
            }

            // @unhead packages (SEO/head management)
            if (id.includes('@unhead')) {
              return 'unhead'
            }

            // @ucast packages (CASL dependencies)
            if (id.includes('@ucast')) {
              return 'casl'
            }

            // Keep Vue core in main bundle (essential for app)
            // Don't split these to vendor chunks
            if (id.includes('@vue/') || id.includes('/vue/')) {
              return undefined  // Stay in main bundle
            }

            // Remaining heavy vendor libraries - catch-all for node_modules
            // This helps prevent the main bundle from growing with unhandled deps
            const nodeModulesMatch = id.match(/node_modules\/(@?[^/]+)/)
            if (nodeModulesMatch) {
              const pkgName = nodeModulesMatch[1]

              // Keep essential small packages in main bundle
              const keepInMain = [
                'vue', '@vue', 'pinia', 'destr', 'cookie-es',
                'ofetch', 'ufo', '@sindresorhus'
              ]
              if (keepInMain.some(p => pkgName.includes(p))) {
                return undefined
              }

              // Group remaining scoped packages
              if (pkgName.startsWith('@')) {
                return 'vendor-scoped'
              }
              return 'vendor-misc'
            }

            return undefined
          },
        },
      },
    },
    optimizeDeps: {
      include: [
        'leaflet',
        'leaflet.markercluster',
        '@metamask/sdk',
        '@metamask/providers',
        'buffer',
        'process',
        'events',
        'util',
        'eventemitter2',
      ],
      exclude: [
        'vuetify',
        'dompurify',
        'vue-i18n',
        '@intlify/core-base',
        '@intlify/vue-i18n-bridge',
        '@intlify/unplugin-vue-i18n',
      ],
      entries: ['./src/**/*.vue'],
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
    },
    logLevel: isDev ? 'debug' : 'info',
  };
});
