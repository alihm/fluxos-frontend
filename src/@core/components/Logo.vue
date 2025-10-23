<script setup>
import fluxCloudSymbol from '@images/fluxcloud_symbol.svg?raw'

// FluxCloud Logo Component with animated gradient
// Props to match FluxCloud's Logo widget
const props = defineProps({
  title: {
    type: String,
    default: 'Flux',
  },
  gradientTitle: {
    type: String,
    default: 'Cloud',
  },
  iconOnly: {
    type: Boolean,
    default: false,
  },
  iconSize: {
    type: Number,
    default: 42,
  },
  textSize: {
    type: Number,
    default: 28,
  },
})
</script>

<template>
  <div class="flux-logo-container" :style="{ height: iconSize + 'px' }">
    <div class="flux-logo-icon" :style="{ width: iconSize + 'px', height: iconSize + 'px' }" v-html="fluxCloudSymbol" />
    <div v-if="!iconOnly" class="flux-logo-text" :style="{ fontSize: textSize + 'px', lineHeight: iconSize + 'px' }">
      <span class="title-text">{{ title }}</span><span class="gradient-text">{{ gradientTitle }}</span>
    </div>
  </div>
</template>

<style scoped>
.flux-logo-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: -6px;
}

.flux-logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.flux-logo-icon :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}

.flux-logo-text {
  display: flex;
  align-items: baseline;
  height: 100%;
  font-weight: 600;
  font-family: Montserrat, 'Segoe UI', system-ui, -apple-system, sans-serif;
  white-space: nowrap;
  letter-spacing: -0.5px;
  gap: 2px;
}

.title-text {
  color: rgb(var(--v-theme-on-surface));
  display: inline;
  vertical-align: baseline;
}

.gradient-text {
  background: linear-gradient(135deg, #2B61D1 0%, #9c93ff 50%, #2B61D1 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-shift 3s ease infinite, text-glow 2s ease-in-out infinite;
  display: inline;
  vertical-align: baseline;
}

@keyframes gradient-shift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes text-glow {
  0%, 100% {
    filter: drop-shadow(0 0 20px rgba(43, 97, 209, 0.5));
  }
  50% {
    filter: drop-shadow(0 0 40px rgba(43, 97, 209, 0.8));
  }
}
</style>
