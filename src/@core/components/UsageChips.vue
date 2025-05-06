<template>
  <div class="d-flex align-items-center usage-row">
    <template
      v-for="(item, index) in items"
      :key="index"
    >
      <VIcon
        :icon="item.icon"
        class="usage-icon mr-1"
      />
      <VChip
        :color="item.color || 'default'"
        class="custom-usage-chip mr-2"
        density="comfortable"
        size="small"
        rounded="pill"
      >
        {{ item.value }}
      </VChip>
    </template>
  </div>
</template>
  
<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
    default: () => [],
  },
})
</script>
  
  <style scoped>
 .usage-row {
  height: 23px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.usage-icon {
  height: 18px !important;
  width: 18px !important;
  font-size: 18px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  vertical-align: middle !important;
  margin: 0 !important;
  padding: 0 !important;
}

.custom-usage-chip {
  --v-chip-height: 19px !important;
  height: 19px !important;
  font-size: 10px !important;
  line-height: 19px !important;
  padding: 0 6px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  vertical-align: middle !important;
  margin: 0 !important;
}

.custom-usage-chip .v-chip__content {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
}
  </style>
  