<template>
  <template v-if="!shouldHide">
    <dl
      class="row"
      :class="classes"
    >
      <!-- Title with icon -->
      <dt class="col-sm-3">
        <div class="d-flex align-center">
          <VIcon
            v-if="titleIcon"
            :icon="titleIcon"
            :size="Number(titleIconScale) * 18"
            class="mr-1"
          />
          <span>
            <slot name="title">
              {{ title }}
            </slot>
          </span>
        </div>
      </dt>

      <!-- Value -->
      <dd
        v-if="href.length > 0"
        class="col-sm-9"
      >
        <a
          :href="href"
          target="_blank"
          rel="noopener noreferrer"
          class="text-decoration-none"
        >
          <kbd
            v-if="kbdVariant"
            class="resource-kbd"
            :class="[`kbd-${kbdVariant}`]"
          >
            {{ displayValue }}
          </kbd>
          <span
            v-else
            :class="`text-${variant}`"
            class="value-span"
          >
            {{ displayValue }}
          </span>
        </a>
      </dd>

      <dd
        v-else-if="click"
        class="col-sm-9"
        @click="$emit('click')"
      >
        <VBtn
          variant="text"
          class="pa-0"
        >
          <kbd
            v-if="kbdVariant"
            class="resource-kbd"
            :class="[`kbd-${kbdVariant}`]"
          >
            {{ displayValue }}
          </kbd>
          <span
            v-else
            :class="`text-${variant}`"
            class="value-span"
          >
            {{ displayValue }}
          </span>
        </VBtn>
      </dd>

      <dd
        v-else
        class="col-sm-9"
      >
        <slot>
          <kbd
            v-if="kbdVariant"
            class="resource-kbd"
            :class="[`kbd-${kbdVariant}`]"
          >
            {{ displayValue }}
          </kbd>
          <span
            v-else
            :class="`text-${variant}`"
            class="value-span"
          >
            {{ displayValue }}
          </span>
        </slot>
      </dd>
    </dl>
  </template>
</template>

<script setup>
import { computed, useSlots, defineEmits } from "vue"

const props = defineProps({
  title: String,
  titleIcon: String,
  titleIconScale: {
    type: [Number, String],
    default: 24,
  },
  classes: {
    type: String,
    default: "mb-1",
  },
  data: {
    type: [String, Array, Number],
    default: "",
  },
  number: {
    type: Number,
    default: Number.MAX_VALUE,
  },
  variant: {
    type: String,
    default: "secondary",
  },
  href: {
    type: String,
    default: "",
  },
  click: {
    type: Boolean,
    default: false,
  },
  hideIfEmpty: {
    type: Boolean,
    default: false,
  },
  kbdVariant: {
    type: String,
    default: null,
  },
})

defineEmits(["click"])

const slots = useSlots()

const displayValue = computed(() => {
  if (Array.isArray(props.data)) return props.data.join(", ")
  if (typeof props.data === "string" && props.data.trim()) return props.data
  if (typeof props.data === "number" && !Number.isNaN(props.data)) return props.data
  if (props.number !== Number.MAX_VALUE) return props.number

  return ""
})

const isEmpty = computed(() => {
  const hasData = Array.isArray(props.data)
    ? props.data.length > 0
    : String(props.data || "").trim() !== ""

  const hasNumber = props.number !== Number.MAX_VALUE

  return !(hasData || hasNumber)
})

const shouldHide = computed(() => props.hideIfEmpty && isEmpty.value)
</script>

<style scoped>
/* Layout */
dl.row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

dl.row > dt,
dl.row > dd {
  display: flex;
  align-items: baseline;
  margin-bottom: 0;
}

dl.row > dt.col-sm-3 {
  width: 25%;
  font-weight: 600;
  padding-top: 2px;
}

dl.row > dd.col-sm-9 {
  width: 75%;
}

/* Tonal KBD (soft chips) */
.resource-kbd {
  display: inline-block;
  max-width: 100%;
  padding: 0.25rem 0.5rem;
  margin-bottom: 4px;
  border-radius: 15px;
  font-family: monospace;
  font-size: 90%;
  line-height: 1.5;
  white-space: normal;
  word-break: break-word;
  vertical-align: middle;
  text-align: left;
}

/* Tonal colors */
.kbd-primary {
  background-color: rgba(13, 110, 253, 0.1);
  color: #0d6efd;
}

.kbd-secondary {
  background-color: rgba(108, 117, 125, 0.1);
  color: #6c757d;
}

.kbd-success {
  background-color: rgba(25, 135, 84, 0.1);
  color: rgb(var(--v-theme-success)) !important;
}

.kbd-danger {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.kbd-warning {
  background-color: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.kbd-info {
  background-color: rgba(13, 202, 240, 0.1);
  color: #0dcaf0;
}

/* fallback span style */
.value-span {
  display: inline-block;
  word-break: break-word;
  white-space: normal;
  line-height: 1.5;
}

/* Mobile */
@media (max-width: 576px) {
  dl.row > dt.col-sm-3,
  dl.row > dd.col-sm-9 {
    width: 100% !important;
  }

  dl.row > dt.col-sm-3 {
    margin-bottom: 0.25rem;
  }
}
</style>
