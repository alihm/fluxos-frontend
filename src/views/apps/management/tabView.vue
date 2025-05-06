<template>
  <div>
    <VCard class="pa-4">
      <VRow>
        <VCol cols="4">
          <VSelect
            v-model="tableOptions.perPage"
            label="Per Page"
            density="compact"
            :items="tableOptions.pageOptions"
          />
        </VCol>
        <VCol cols="8">
          <VTextField
            v-model="tableOptions.filter"
            label="Filter"
            density="compact"
            variant="outlined"
            placeholder="Type to Search"
            :clearable="tableOptions.filter?.length > 0"
          >
            <template #append-inner>
              <VIcon size="20">
                tabler-search
              </VIcon>
            </template>
          </VTextField>
        </VCol>
      </VRow>

      <VSheet
        border
        rounded
        class="mt-4"
        style="max-height: none; overflow: visible"
      >
        <VDataTable
          v-model:page="tableOptions.currentPage"
          v-model:sort-by="tableOptions.sortBy"
          v-model:sort-desc="tableOptions.sortDesc"
          v-model:expanded="expanded"
          :items="filteredApps"
          :headers="mergedFields"
          :items-per-page="tableOptions.perPage"
          item-value="name"
          class="myapps-table"
          show-expand
          hide-default-footer
        >
          <template #no-data>
            <div class="text-center py-10 fade-in">
              <div
                v-if="loading && loggedIn"
                class="d-flex align-center justify-center"
              >
                <VProgressCircular
                  indeterminate
                  class="mr-1"
                  size="25"
                />
                <div>Loading...</div>
              </div>

              <div
                v-else-if="!loggedIn"
                class="d-flex align-center justify-center"
              >
                <VIcon
                  icon="mdi-login"
                  class="mr-2"
                  color="warning"
                />
                <div class="text-warning">
                  Please log in to view your apps.
                </div>
              </div>

              <div
                v-else-if="appsDataRaw.length > 0 && filteredApps.length === 0"
                class="d-flex align-center justify-center"
              >
                <VIcon
                  icon="mdi-magnify"
                  class="mr-2"
                />
                <div>No matching apps found.</div>
              </div>
              <div
                v-else-if="apiError"
                class="d-flex align-center justify-center"
              >
                <VIcon
                  icon="tabler-wifi-off"
                  class="mr-2"
                  size="24"
                  color="error"
                />
                <div class="text-error">
                  Unable to connect to the server. Please check your internet or try again later.
                </div>
              </div>
              <div v-else>
                <VIcon
                  icon="tabler-search-off"
                  class="mr-2"
                />
                <div>You don't have any apps.</div>
              </div>
            </div>
          </template>

          <template #headers="{ columns }">
            <tr>
              <th
                v-for="column in columns"
                :key="column.key"
                class="text-start"
              >
                {{ column.title }}
              </th>
            </tr>
          </template>

          <template #item.data-table-expand="{ internalItem, isExpanded }">
            <VBtn
              :icon="isExpanded(internalItem) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
              size="small"
              variant="text"
              @click.stop.prevent="handleExpandClick(internalItem)"
            />
          </template>

          <template #item.name="{ item }">
            <div class="col-name text-left">
              <VChip
                color="info"
                class="mr-1 mb-1"
                density="comfortable"
                size="small"
                rounded="pill"
                style="margin-top: 5px"
              >
                <VIcon
                  start
                  icon="mdi-square-rounded-badge-outline"
                  size="16"
                />
                {{ item.name }}
              </VChip>
              <UsageChips
                :items="[
                  { icon: 'mdi-speedometer', value: getServiceUsageValue(1, item.name, item), color: 'success' },
                  { icon: 'mdi-memory', value: getServiceUsageValue(0, item.name, item), color: 'success' },
                  { icon: 'mdi-harddisk', value: getServiceUsageValue(2, item.name, item), color: 'success' },
                  { icon: 'mdi-map-marker', value: item.instances | 3, color: 'warning' }
                ]"
              />
              <small style="font-size: 12px">
                <ExpiryLabel
                  v-if="activeAppsTab"
                  :expire-time="labelForExpire(item.expire, item.height)"
                  class="mb-1"
                />
                <div
                  v-else
                  class="mb-1"
                />
              </small>
            </div>
          </template>

          <template #item.status="{ item }">
            <VChip
              :color="getAppStatusColor(item.name)"
              size="small"
              rounded="pill"
            >
              {{ appStatusMap.get(item.name) || "checking..." }}
            </VChip>
          </template>

          <template #item.description="{ item }">
            <div class="col-description text-secondary">
              {{ item.description }}
            </div>
          </template>

          <template #expanded-row="{ columns, item }">
            <tr
              class="expanded-row"
              :data-name="item.name"
            >
              <td :colspan="columns.length">
                <div class="pa-0">
                  <AppDetailsCard
                    :app="item"
                    :active-apps-tab="activeAppsTab"
                    :get-new-expire-label="labelForExpire(item.expire, item.height)"
                    class="mt-4"
                  />

                  <div>
                    <h3 class="d-flex align-center justify-start mb-3 mt-3">
                      <VChip
                        color="info"
                        variant="tonal"
                        class="composition-chip"
                      >
                        <VIcon
                          size="22"
                          class="ml-1"
                        >
                          mdi-hexagon-multiple
                        </VIcon>
                        <span class="ml-1">Composition</span>
                      </VChip>
                    </h3>

                    <VTabs
                      v-model="activeTabLocalIndexSpec"
                      align-tabs="start"
                      background-color="transparent"
                      color="primary"
                      height="30"
                      hide-slider
                      class="my-2 tabs-no-slider"
                    >
                      <VTab
                        v-for="(component, index) in normalizeComponents(item)"
                        :key="index"
                        :value="index"
                        class="tab-chip"
                      >
                        <VIcon
                          size="18"
                          class="mr-1"
                        >
                          mdi-cube
                        </VIcon>
                        {{ component.name }}
                      </VTab>
                    </VTabs>

                    <VWindow
                      v-model="activeTabLocalIndexSpec"
                      class="pa-4"
                      :touch="false"
                    >
                      <VWindowItem
                        v-for="(component, index) in normalizeComponents(item)"
                        :key="index"
                        :value="index"
                      >
                        <VSlideYTransition mode="out-in">
                          <div>
                            <ComponentDetails
                              :component="component"
                              :app-name="item.name || ''"
                              :index="index"
                            />
                          </div>
                        </VSlideYTransition>
                      </VWindowItem>
                    </VWindow>
                  </div>
                  <h3
                    v-if="
                      activeAppsTab &&
                        appLocationsMap[item.name] &&
                        appLocationsMap[item.name].length
                    "
                    class="d-flex align-center justify-start mb-4"
                  >
                    <VChip
                      color="info"
                      variant="tonal"
                      class="composition-chip"
                    >
                      <VIcon
                        size="22"
                        class="ml-1"
                      >
                        mdi-map-marker-radius
                      </VIcon>
                      <span class="ml-2">Locations</span>
                    </VChip>
                  </h3>
                  <Locations
                    v-if="
                      activeAppsTab &&
                        appLocationsMap[item.name] &&
                        appLocationsMap[item.name].length
                    "
                    :app-locations="appLocationsMap[item.name] || []"
                    :expanded="expanded.includes(item.name)"
                    :app-spec="item"
                  />
                </div>
              </td>
            </tr>
          </template>


          <template #item.actions="{ item }">
            <Manage
              v-if="activeAppsTab"
              :row="{ item }"
              :show-manage="manage"
              :show-install="showInstall"
              :show-control="showControl"
              @open-app-management="openAppManagement"
            />
            <Redeploy
              v-else
              :row="{ item }"
            />
          </template>
        </VDataTable>
      </VSheet>
      <div>
        <VRow
          class="mt-3 mb-1"
          justify="center"
        >
          <VPagination
            v-model="tableOptions.currentPage"
            :length="pageCount"
            rounded
            size="small"
            total-visible="5"
          />
        </VRow>
      </div>
    </VCard>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from "vue"
import Manage from "@/views/apps/management/manage.vue"
import Redeploy from "@/views/apps/management/redeploy.vue"
import AppsService from "@/services/AppsService"
import { useI18n } from "vue-i18n"

const props = defineProps({
  apps: Array,
  loading: Boolean,
  loggedIn: Boolean,
  currentBlockHeight: Number,
  activeAppsTab: Boolean,
  manage: {
    type: Boolean,
    default: false,
  },
  apiError: Boolean,
  showStatus: {
    type: Boolean,
    default: false,
  },
  showInstall: {
    type: [Boolean, Function],
    default: false,
  },
  showControl: {
    type: [Boolean, Function],
    default: false,
  },
})

const emit = defineEmits(["openAppManagement"])
const { t } = useI18n()
const activeTabLocalIndexSpec = ref(0)

const tableOptions = ref({
  perPage: 10,
  pageOptions: [5, 10, 25, 50, 100],
  currentPage: 1,
  sortBy: [],
  sortDesc: false,
  filter: "",
})

const expanded = ref([])
const appLocationsMap = ref({})
const tableKey = ref(0)

const appsDataRaw = computed(() => (Array.isArray(props.apps) ? props.apps : []))

const filteredApps = computed(() => {
  const filter = tableOptions.value.filter?.toLowerCase()
  if (!filter) return appsDataRaw.value

  return appsDataRaw.value.filter(
    app =>
      app.name?.toLowerCase().includes(filter) ||
      app.description?.toLowerCase().includes(filter),
  )
})

const pageCount = computed(() =>
  Math.ceil(filteredApps.value.length / tableOptions.value.perPage),
)

const defaultFields = [
  { key: "data-table-expand", title: "", sortable: false, class: "col-expand" },
  { key: "name", title: "Name", sortable: true, class: "col-name" },
  ...(props.showStatus
    ? [{ key: "status", title: "Status", sortable: false, class: "col-status" }]
    : []),
  { key: "description", title: "Description", sortable: false, class: "col-description" },
  { key: "actions", title: "", sortable: false, align: "end", class: "col-actions" },
]

const mergedFields = computed(() => defaultFields)

function openAppManagement(name) {
  emit("openAppManagement", name)
}

async function handleExpandClick(internalItem) {
  const name = internalItem.raw?.name
  if (!name) return
  if (expanded.value.includes(name)) expanded.value = []
  else {
    expanded.value = [name]
    nextTick(() => scrollToExpandedRow(name))
    await loadLocations(name)
  }
  tableKey.value += 1
}

function scrollToExpandedRow(name) {
  setTimeout(() => {
    const parentRow = Array.from(
      document.querySelectorAll("tr.v-data-table__tr"),
    ).find(row => row.textContent.includes(name))

    if (parentRow) parentRow.scrollIntoView({ behavior: "auto", block: "center" })
  }, 100)
}

async function loadLocations(name) {
  if (appLocationsMap.value[name]) return // already fetched
  try {
    appLocationsMap.value[name] = [] // ⬅️ preload empty to prevent multiple clicks double fetch

    const response = await AppsService.getAppLocation(name)
    if (response.data.status === "success") {
      appLocationsMap.value[name] = response.data.data
    }
  } catch (error) {
    console.error(`Error loading locations for ${name}:`, error.message)
  }
}

function getServiceUsageValue(index, name, app) {
  if (Array.isArray(app.compose)) {
    const usage = getServiceUsage(name, app.compose)

    return usage[index]
  }

  return [
    +app.ram,
    +app.cpu.toFixed(1),
    +app.hdd,
  ][index]
}

function getServiceUsage(serviceName, spec) {
  let totalRAM = 0
  let totalCPU = 0
  let totalHDD = 0

  spec.forEach(obj => {
    totalRAM += obj.ram
    totalCPU += obj.cpu
    totalHDD += obj.hdd
  })

  return [totalRAM, totalCPU.toFixed(1), totalHDD]
}

function labelForExpire(expire, height) {
  if (!height) return "Application Expired"
  if (props.currentBlockHeight === -1) return "Not possible to calculate expiration"
  const expires = expire || 22000
  const blocksToExpire = height + expires - props.currentBlockHeight
  if (blocksToExpire < 1) return "Application Expired"
  const minutes = blocksToExpire * 2
  const units = { day: 1440, hour: 60, minute: 1 }
  const result = []
  let value = minutes
  for (const unit in units) {
    const p = Math.floor(value / units[unit])
    if (p > 0) result.push(`${p} ${unit}${p > 1 ? "s" : ""}`)
    value %= units[unit]
  }

  return result.slice(0, 3).join(", ")
}

function normalizeComponents(data) {
  if (!data) return []

  return data.version >= 4 ? data.compose : [{ ...data, repoauth: false }]
}

const appStatusMap = ref(new Map())

async function appsGetListRunningApps(timeout = 0) {
  setTimeout(async () => {
    try {
      const response = await AppsService.listRunningApps()
      const apps = response.data.data || []

      const defaultStatusMap = new Map()

      // Step 1: Set all installed apps as "stopped" by default
      for (const app of appsDataRaw.value) {
        if (app?.name) {
          defaultStatusMap.set(app.name, "exited")
        }
      }

      // Step 2: Overwrite with actual running states
      for (const app of apps) {
        const rawName = app.Names?.[0] || ""
        const namePart = rawName.startsWith("/flux") ? rawName.slice(5) : rawName.slice(4)
        const appName = namePart.includes("_") ? namePart.split("_")[1] : namePart

        if (!namePart.includes("watchtower") && appName) {
          defaultStatusMap.set(appName, app.State)
        }
      }

      appStatusMap.value = defaultStatusMap
    } catch (error) {
      console.error("Failed to load running apps:", error)
      appStatusMap.value = new Map()
    }
  }, timeout)
}

function getAppStatusColor(name) {
  const state = appStatusMap.value.get(name)

  switch (state) {
  case "running":
    return "success"
  case "restarting":
    return "warning"
  case "created":
  case "paused":
    return "blue-darken-4"
  case "exited":
    return "error"
  case "removing":
  case "dead":
  default:
    return "grey-darken-4"
  }
}
watch(
  () => props.apps,
  () => {
    if (props.showStatus) {
      appsGetListRunningApps()
    }
  },
)
onMounted(() => {
  if (props.showStatus) {
    appsGetListRunningApps()
  }
})
</script>

<style scoped>
.text-center {
  text-align: center;
}
.py-10 {
  padding-top: 2.5rem;
  padding-bottom: 2.5rem;
}
.my-4 {
  margin-top: 1rem;
  margin-bottom: 1rem;
}
.mt-2 {
  margin-top: 0.5rem;
}
.text-medium-emphasis {
  color: rgba(0, 0, 0, 0.6);
  font-size: 18px;
}

.fade-in {
  animation: fadeIn 0.5s ease-in;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Your extra table styles */
.myapps-table .v-data-table__wrapper {
  overflow-x: auto;
}
.myapps-table .col-expand {
  width: 35px;
  min-width: 35px;
  max-width: 35px;
  padding: 0px;
}
.myapps-table .col-name {
  width: 240px;
  min-width: 240px;
  max-width: 240px;
}
.myapps-table .col-description {
  min-width: 200px;
}
.myapps-table .col-actions {
  width: 120px;
  min-width: 120px;
  max-width: 120px;
  text-align: center;
}
.composition-chip {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding: 8px 16px;
  border-radius: 15px;
  font-family: monospace;
  font-size: 18px;
}

.v-sheet {
  overflow-x: auto; /* Add horizontal scroll if needed */
}

.v-data-table {
  min-width: 100%;
  max-width: 100%;
}

/* Optional: Control specific column sizes */
.myapps-table .col-expand {
  width: 30px;
  min-width: 30px;
  max-width: 30px;
}

/* Target the entire column by using both header and row cell selectors */
::v-deep(.myapps-table td.v-data-table__td:nth-child(1)),
::v-deep(.myapps-table th.v-data-table__th:nth-child(1)) {
  width: 55px;
  min-width: 55px;
  max-width: 55px;
  padding: 0px 0px 0px 10px !important;
}

::v-deep(.myapps-table td.v-data-table__td:nth-child(2)),
::v-deep(.myapps-table th.v-data-table__th:nth-child(2)) {
  padding: 0px 0px 0px 0px !important;
  width: 240px;
  min-width: 240px;
  max-width: 240px;
}

.myapps-table .col-actions {
  width: 120px;
  min-width: 120px;
  max-width: 120px;
  text-align: center;
}

/* Scrollable wrapper inside table */
.myapps-table .v-data-table__wrapper {
  overflow-x: auto;
}

.expanded-content-wrapper {
  min-width: 100%;
  max-width: 100%;
  overflow-x: auto;
}

.tab-chip {
  min-height: 30px !important;
  padding: 0 10px !important;
  border-radius: 30px !important;
  font-size: 16px !important;
  font-family: monospace;
  text-transform: none;
}

/* ACTIVE tab */
.tab-chip[aria-selected="true"] {
  background-color: rgba(0, 123, 255, 0.1);
  padding: 0 10px !important;
  border-radius: 30px !important;
}

/* HOVER */
.tab-chip:hover {
  transform: scale(1.03);
}

/* REMOVE BORDER CORRECTLY */
.tabs-no-slider.v-tabs {
  border-block-end: none !important;
}
</style>
