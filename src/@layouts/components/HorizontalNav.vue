<script setup>
import {
  HorizontalNavGroup,
  HorizontalNavLink,
} from '@layouts/components'

const props = defineProps({
  navItems: {
    type: null,
    required: true,
  },
})

const resolveNavItemComponent = item => {
  if ('children' in item)
    return HorizontalNavGroup

  return HorizontalNavLink
}

// Keep track of all menu item refs
const menuRefs = ref([])

const setMenuRef = (el, index) => {
  if (el) {
    menuRefs.value[index] = el
  }
}

// Close all other menus when one is opened
const handleMenuOpen = openedIndex => {
  menuRefs.value.forEach((ref, index) => {
    if (index !== openedIndex && ref && ref.hideContentImmediately) {
      ref.hideContentImmediately()
    }
  })
}

provide('onMenuOpen', handleMenuOpen)
</script>

<template>
  <ul class="nav-items">
    <Component
      :is="resolveNavItemComponent(item)"
      v-for="(item, index) in navItems"
      :key="index"
      :ref="el => setMenuRef(el, index)"
      data-allow-mismatch
      :item="item"
      :menu-index="index"
    />
  </ul>
</template>

<style lang="scss">
.layout-wrapper.layout-nav-type-horizontal {
  .nav-items {
    display: flex;
    flex-wrap: wrap;
  }
}
</style>
