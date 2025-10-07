<template>
  <component
    :is="panelComponent"
    v-if="panel.enabled && panelComponent"
    :panel="panel"
    :app="app"
    @install="handleInstall"
  />
</template>

<script setup>
import { computed } from 'vue'
import HeaderPanel from './Panels/HeaderPanel.vue'
import GroupsPanel from './Panels/GroupsPanel.vue'
import ScreenshotsPanel from './Panels/ScreenshotsPanel.vue'

const props = defineProps({
  panel: {
    type: Object,
    required: true,
  },
  app: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['install'])

const panelComponent = computed(() => {
  switch (props.panel.type) {
  case 'Header':
    return HeaderPanel
  case 'Groups':
    return GroupsPanel
  case 'Screenshots':
    return ScreenshotsPanel
  case 'NodeMap':
    return null // Optional: implement NodeMapPanel later
  case 'Subscription':
    return null // Disabled like FluxCloud
  default:
    return null
  }
})

const handleInstall = data => {
  emit('install', data)
}
</script>
