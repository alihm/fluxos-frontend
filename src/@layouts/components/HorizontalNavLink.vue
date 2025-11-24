<script setup>
import { layoutConfig } from "@layouts"
import { hasPrivilege } from "@layouts/plugins/casl"
import {
  getComputedNavLinkToProp,
  getDynamicI18nProps,
  isNavLinkActive,
} from "@layouts/utils"

const props = defineProps({
  item: {
    type: null,
    required: true,
  },
  isSubItem: {
    type: Boolean,
    required: false,
    default: false,
  },
})
</script>

<template>
  <li
    v-if="hasPrivilege(item.privilege)"
    class="nav-link"
    :class="[
      {
        'sub-item': props.isSubItem,
        disabled: item.disable,
      },
    ]"
  >
    <RouterLink
      v-if="item.to"
      v-bind="getComputedNavLinkToProp(item)"
      custom
      v-slot="{ navigate, href }"
    >
      <a
        :href="href"
        @click="navigate"
        :class="{
          'router-link-active router-link-exact-active': isNavLinkActive(item, $router),
        }"
      >
        <Component
          :is="layoutConfig.app.iconRenderer || 'div'"
          class="nav-item-icon"
          :class="item.iconClass"
          v-bind="item.icon || layoutConfig.verticalNav.defaultNavItemIconProps"
        />
        <Component
          :is="layoutConfig.app.i18n.enable ? 'i18n-t' : 'span'"
          class="nav-item-title"
          v-bind="getDynamicI18nProps(item.title, 'span')"
        >
          {{ item.title }}
        </Component>
      </a>
    </RouterLink>
    <a
      v-else
      :href="item.href"
      :class="{
        'router-link-active router-link-exact-active': isNavLinkActive(item, $router),
      }"
    >
      <Component
        :is="layoutConfig.app.iconRenderer || 'div'"
        class="nav-item-icon"
        :class="item.iconClass"
        v-bind="item.icon || layoutConfig.verticalNav.defaultNavItemIconProps"
      />
      <Component
        :is="layoutConfig.app.i18n.enable ? 'i18n-t' : 'span'"
        class="nav-item-title"
        v-bind="getDynamicI18nProps(item.title, 'span')"
      >
        {{ item.title }}
      </Component>
    </a>
  </li>
</template>

<style lang="scss">
.layout-horizontal-nav {
  .nav-link {
    white-space: nowrap;
    flex-shrink: 0;
  }

  .nav-link a {
    display: flex;
    align-items: center;
    white-space: nowrap;
  }

  .nav-item-title {
    white-space: nowrap;
  }
}
</style>
