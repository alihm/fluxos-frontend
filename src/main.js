import App from '@/App.vue'
import { registerPlugins } from '@core/utils/plugins'
import { createApp } from 'vue'
import { createHead } from '@vueuse/head'
import sanitizeHtml from '@/utils/sanitizeHtml'

// Styles
import '@core/scss/template/index.scss'
import '@styles/styles.scss'

// Fonts
import '@fontsource/montserrat/700.css' // Bold
import '@fontsource/montserrat/600.css' // Semi-bold

import process from 'process'
import { Buffer } from 'buffer'
import { EventEmitter2 } from 'eventemitter2'

window.process = process
window.Buffer = Buffer

// Create vue app
const app = createApp(App)

// Create and install head management
const head = createHead()
app.use(head)

registerPlugins(app)
app.directive('sanitize-html', sanitizeHtml)

// Mount vue app
app.mount('#app')
