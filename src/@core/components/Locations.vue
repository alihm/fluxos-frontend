<template>
  <div class="table-wrapper">
    <!-- MAP on top -->
    <div
      v-if="mapVisible && mapLocations.length"
      class="map-wrapper d-flex justify-center"
    >
      <div class="map-inner">
        <MapComponent
          class="mb-0"
          :show-all="false"
          :filter-nodes="mapLocations"
        />
      </div>
    </div>
  
    <!-- Controls and Table under Map -->
    <div class="table-wrapper mt-6">
      <VRow
        v-if="filteredLocations.length > 5"
        class="align-center"
      >
        <!-- Controls -->
        <VCol cols="4">
          <VSelect
            v-model="appLocationOptions.perPage"
            label="Per page"
            :items="appLocationOptions.pageOptions"
            density="compact"
            class="flex-grow-1"
          />
        </VCol>
  
        <VCol cols="8">
          <VTextField
            v-model="appLocationOptions.filter"
            label="Filter"
            density="compact"
            variant="outlined"
            placeholder="Type to Search"
            clearable
            class="flex-grow-1"
          >
            <template #append-inner>
              <VIcon size="20">
                tabler-search
              </VIcon>
            </template>
          </VTextField>
        </VCol>
      </VRow>
  
      <!-- Data Table -->
      <VDataTable
        :headers="appLocationFields"
        :items="paginatedLocations"
        :items-per-page="appLocationOptions.perPage"
        :page="appLocationOptions.currentPage"
        class="locations-table pa-2 mt-2"
        :class="filteredLocations.length > 5 ? 'mb-0' : 'mb-2'"
        hide-default-footer
        hide-headers
        fixed-header
        density="compact"
        no-data-text="No instances found..."
      >
        <template #headers />
  
        <template #item.ip="{ item }">
          <div class="d-flex align-center text-no-wrap">
            <VChip
              color="info"
              size="small"
              class="mr-2"
            >
              <VIcon
                icon="mdi-laptop"
                size="18"
              />
            </VChip>
            <VChip
              color="success"
              label
              size="small"
              class="text-no-wrap"
              style="border-radius: 15px"
            >
              <strong>{{ item.ip }}</strong>
            </VChip>
          </div>
        </template>
  
        <template #item.osUptime="{ item }">
          <span
            v-bind="props"
            class="text-no-wrap"
          >
            <VTooltip text="System uptime since last reboot">
              <template #activator="{ props: tooltipProps }">
                <VChip
                  color="info"
                  size="small"
                  class="mr-2 ml-2 text-no-wrap"
                  v-bind="tooltipProps"
                >
                  <VIcon
                    icon="mdi-home-clock"
                    size="18"
                  />
                </VChip>
              </template>
            </VTooltip>

            <VChip
              color="success"
              label
              size="small"
              class="text-no-wrap"
              style="border-radius: 15px"
            >
              <strong>{{ formatUptime(item.osUptime) }}</strong>
            </VChip>
          </span>
        </template>
  
        <template #item.visit="{ item }">
          <div class="d-flex justify-end">
            <VTooltip text="Visit App">
              <template #activator="{ props: btnProps }">
                <VBtn
                  v-bind="btnProps"
                  size="x-small"
                  color="primary"
                  class="mr-2"
                  rounded="pill"
                  @click="openApp(item.name, item.ip.split(':')[0], getProperPort(appSpec))"
                >
                  <VIcon
                    start
                    icon="mdi-door-open"
                  />
                  App
                </VBtn>
              </template>
            </VTooltip>
  
            <VTooltip text="Visit FluxNode">
              <template #activator="{ props: btnProps }">
                <VBtn
                  v-bind="btnProps"
                  size="x-small"
                  variant="outlined"
                  color="primary"
                  rounded="pill"
                  @click="
                    openNodeFluxOS(
                      item.ip.split(':')[0],
                      item.ip.split(':')[1] ? +item.ip.split(':')[1] - 1 : 16126
                    )
                  "
                >
                  <VIcon
                    start
                    icon="mdi-home"
                  />
                  FluxNode
                </VBtn>
              </template>
            </VTooltip>
          </div>
        </template>
      </VDataTable>
  
      <!-- Pagination -->
      <div>
        <VPagination
          v-if="filteredLocations.length > 5"
          v-model="appLocationOptions.currentPage"
          :length="Math.ceil(filteredLocations.length / appLocationOptions.perPage)"
          density="compact"
          rounded
          size="small"
          total-visible="5"
          class="justify-center mb-2"
        />
      </div>
    </div>
  </div>
</template>
  
<script setup>
import { ref, computed, watch } from "vue"
  
// Props
const props = defineProps({
  appLocations: {
    type: Array,
    default: () => [],
  },
  expanded: {
    type: Boolean,
    default: false,
  },
  appSpec: {
    type: Object,
    required: true,
  },
})
  
// Reactive state
const mapVisible = ref(props.expanded)
  
const appLocationOptions = ref({
  perPage: 5,
  pageOptions: [5, 10, 25, 50, 100],
  currentPage: 1,
  filter: "",
})
  
const appLocationFields = [
  { key: "ip", title: "IP Address",   cellClass: 'column-ip', headerProps: { class: 'column-ip' } },
  { key: "osUptime", title: "Uptime" },
  { key: "visit", title: "" },
]
  
// Computed
const mapLocations = computed(() => {
  return props.appLocations.map(l => l.ip)
})
  
const filteredLocations = computed(() => {
  const filter = appLocationOptions.value.filter?.toLowerCase()
  if (!filter) return props.appLocations
  
  return props.appLocations.filter(loc =>
    loc.ip.toLowerCase().includes(filter),
  )
})
  
const paginatedLocations = computed(() => {
  const start = (appLocationOptions.value.currentPage - 1) * appLocationOptions.value.perPage
  const end = start + appLocationOptions.value.perPage
  
  return filteredLocations.value.slice(start, end)
})
  
// Watchers
watch(
  () => props.expanded,
  newVal => {
    mapVisible.value = newVal
  },
)
  
watch(
  () => appLocationOptions.value.filter,
  () => {
    appLocationOptions.value.currentPage = 1
  },
)
  
// Helpers
function formatUptime(seconds) {
  if (!seconds || isNaN(seconds)) return "N/A"
  
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0 || days > 0) parts.push(`${hours}h`)
  parts.push(`${minutes}m`)
  
  return parts.join(" ")
}
  
function getProperPort(appLocation) {
  if (appLocation.port) return appLocation.port
  if (Array.isArray(appLocation.ports) && appLocation.ports.length > 0) {
    return appLocation.ports[0]
  }
  if (Array.isArray(appLocation.compose)) {
    for (const c of appLocation.compose) {
      if (Array.isArray(c.ports) && c.ports.length > 0) {
        return c.ports[0]
      }
    }
  }
  
  return null
}
  
function openSite(url) {
  const win = window.open(url, "_blank")

  win?.focus()
}
  
function openApp(name, ip, port) {
  if (ip && port) {
    openSite(`http://${ip}:${port}`)
  } else {
    console.error("No port provided for App")
  }
}
  
function openNodeFluxOS(ip, port) {
  if (ip && port) {
    openSite(`http://${ip}:${port}`)
  } else {
    console.error("No FluxNode port available")
  }
}
</script>
  
  <style scoped>
  .table-wrapper {
    width: 100%;
    min-width: 400px;
    max-width: 100%;
    margin: auto;
  }
  .map-wrapper {
    width: 100%;
    overflow-x: auto;
    display: flex;
    justify-content: center;
  }
  .map-wrapper > * {
    width: 100%;
    max-width: 100%;
  }
  .locations-table {
    font-family: monospace;
    border-radius: 8px;
    overflow: hidden;
  }
  ::v-deep(.column-ip) {
  width: 150px !important;
  min-width: 150px !important;
  max-width: 150px !important;
  text-align: center !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

/* Target the entire column by using both header and row cell selectors */
::v-deep(td.v-data-table__td:nth-child(1)),
::v-deep(th.v-data-table__th:nth-child(1)) {
  width: 200px !important; /* or whatever width you prefer */
  min-width: 200px !important;
  max-width: 270px !important;
  white-space: nowrap;
}
  </style>
  