<template>
  <span
    class="status-badge"
    :class="spanClasses"
  >
    <VIcon
      size="15"
      class="status-icon"
    >mdi-timer-sand</VIcon>
    <span class="status-text">{{ expireTime }}</span>
  </span>
</template>

<script setup>
import { computed } from "vue"

const props = defineProps({
  expireTime: {
    type: String,
    required: true,
  },
})

function isLessThanTwoDays(expireTime) {
  if (!expireTime) return true
  const parts = expireTime.split(",").map(str => str.trim())
  let days = 0
  let hours = 0
  let minutes = 0

  parts.forEach(part => {
    if (part.includes("days")) {
      days = parseInt(part, 10)
    } else if (part.includes("hours")) {
      hours = parseInt(part, 10)
    } else if (part.includes("minutes")) {
      minutes = parseInt(part, 10)
    }
  })

  const totalMinutes = days * 24 * 60 + hours * 60 + minutes

  return totalMinutes < 2880
}

const spanClasses = computed(() => ({
  "red-text": isLessThanTwoDays(props.expireTime),
  "no-wrap": true,
}))
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 300;
  line-height: 1;
  vertical-align: middle;
}

.status-icon {
  font-size: 15px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Remove top offset */
  position: relative;
  top: 0;
}

.status-text {
  display: inline-flex;
  align-items: center;
  line-height: 1;
  vertical-align: middle;
}

/* Optional styling for urgent (red) badge */
.red-text {
  background-color: rgba(255, 0, 0, 0.15);
  color: #d32f2f;
  border-radius: 10px;
  padding: 2px 6px;
  font-weight: 600;
  margin-top: 5px;
}
</style>
