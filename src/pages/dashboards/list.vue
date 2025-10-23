<template>
  <VCard>
    <VOverlay
      v-model="fluxListLoading"
      contained
      persistent
      scroll-strategy="none"
      class="align-center justify-center overlay"
    >
      <VProgressCircular indeterminate />
    </VOverlay>
    <VRow class="ma-0">
      <VCol
        cols="4"
        class="pa-4 mt-4"
      >
        <VSelect
          v-model="options.itemsPerPage"
          :items="pageOptions"
          :label="t('pages.dashboard.list.perPage')"
          density="compact"
          variant="outlined"
          style="min-width: 100px"
        />
      </VCol>
      <VCol
        cols="8"
        class="pa-4 mt-4"
      >
        <VTextField
          v-model="filter"
          :label="t('pages.dashboard.list.filter')"
          :placeholder="t('pages.dashboard.list.filterPlaceholder')"
          density="compact"
          variant="outlined"
          clearable
        >
          <template #append-inner>
            <VIcon size="20">
              tabler-search
            </VIcon>
          </template>
        </VTextField>
      </VCol>
      <VCol
        cols="12"
        class="pa-4"
      >
        <VSheet
          border
          rounded
          style="max-height: none; overflow: visible"
        >
          <VDataTable
            :items="paginatedItems"
            :items-per-page="options.itemsPerPage"
            :headers="translatedHeaders"
            :sort-by="sortBy"
            hover
            striped
            hide-default-footer
            :page="options.page"
            class="no-wrap-table bordered"
            @update:sort-by="sortBy = $event"
          >
            <template #item.lastpaid="{ item }">
              {{ item.lastpaid ? formatLastPaid(item.lastpaid) : t('pages.dashboard.list.notAvailable') }}
            </template>
            <template #item.location="{ item }">
              {{
                item.location ? `${item.location.country} / ${item.location.org}` : t('pages.dashboard.list.notAvailable')
              }}
            </template>
          </VDataTable>
        </VSheet>
      </VCol>
      <VCol
        cols="12"
        class="pa-2"
      >
        <VPagination
          v-model="options.page"
          :length="Math.max(1, Math.ceil(totalRows / options.itemsPerPage))"
          :total-visible="5"
          rounded="circle"
          size="default"
          class="mb-3"
        />
      </VCol>
    </VRow>
  </VCard>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue"
import { useI18n } from "vue-i18n"
import axios from "axios"
import DashboardService from "@/services/DashboardService"

const { t } = useI18n()

const timeoptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
}

const fluxListLoading = ref(true)
const pageOptions = [5, 10, 25, 50]
const sortBy = ref([])
const items = ref([])
const filter = ref("")
const debouncedFilter = ref("")

// Custom debounce function
function debounceFn(fn, delay) {
  let timeoutId

  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

const updateFilter = debounceFn(value => {
  debouncedFilter.value = value || ""
}, 400)

watch(filter, newValue => {
  updateFilter(newValue)
})

const options = ref({
  page: 1,
  itemsPerPage: 10,
})

const headers = ref([
  { title: "IP Address", key: "ip", sortable: true },
  { title: "Address", key: "payment_address", sortable: true, translationKey: "paymentAddress" },
  {
    title: "Country",
    key: "location.country",
    sortable: true,
    value: item => formatTableEntry(item.location?.country),
    translationKey: "locationCountry",
  },
  {
    title: "Provider",
    key: "location.org",
    sortable: true,
    value: item => formatTableEntry(item.location?.org),
    translationKey: "locationOrg",
  },
  { title: "Last Paid", key: "lastpaid", sortable: true },
  { title: "Tier", key: "tier", sortable: true },
])

const translatedHeaders = computed(() => {
  return headers.value.map(header => ({
    ...header,
    title: t(`pages.dashboard.list.columns.${header.translationKey || header.key.replace('.', '_')}`),
  }))
})

function formatTableEntry(value) {
  return value || t('pages.dashboard.list.unknown')
}

function formatLastPaid(value) {
  return new Date(Number(value) * 1000).toLocaleString("en-GB", timeoptions)
}

const filteredItems = computed(() => {
  if (!debouncedFilter.value) {
    return items.value
  }

  const search = debouncedFilter.value.toLowerCase()

  const searchNested = obj => {
    if (!obj || typeof obj !== "object") {
      return false
    }

    return Object.values(obj).some(value => {
      if (value && typeof value === "object") {
        return searchNested(value)
      }

      return (
        value &&
        typeof value !== "object" &&
        value.toString().toLowerCase().includes(search)
      )
    })
  }

  return items.value.filter(item => searchNested(item))
})

const totalRows = computed(() => {
  return filteredItems.value.length
})

const paginatedItems = computed(() => {
  if (fluxListLoading.value || items.value.length === 0) {
    return []
  }

  const start = (options.value.page - 1) * options.value.itemsPerPage
  const end = start + options.value.itemsPerPage
  const itemsToShow = filteredItems.value.slice(start, end)

  console.log("Paginated Items:", itemsToShow)

  return itemsToShow
})

watch([debouncedFilter, () => options.value.itemsPerPage], () => {
  options.value.page = 1
})

async function getFluxList() {
  try {
    fluxListLoading.value = true

    const [resLoc, resList] = await Promise.all([
      axios.get("https://stats.runonflux.io/fluxlocations"),
      DashboardService.listFluxNodes(),
    ])

    const locations = resLoc.data.data
    const fluxList = resList.data.data

    const locationMap = locations.reduce((map, location) => {
      const ip = location.geolocation?.ip || location.ip
      if (ip) {
        const country = location.country || location.geolocation?.country || t('pages.dashboard.list.unknown')
        const org = location.org || location.geolocation?.org || t('pages.dashboard.list.unknown')

        const simplifiedLocation = {
          ip,
          country,
          org,
        }

        map[ip] = simplifiedLocation
      }

      return map
    }, {})

    const adjustedFluxList = fluxList
      .map(node => {
        if (!node.ip) {
          return null
        }
        const ip = node.ip.split(":")[0]
        const location = locationMap[ip]

        return {
          ...node,
          location: location || null,
        }
      })
      .filter(node => node !== null && node.ip)

    items.value = adjustedFluxList
    fluxListLoading.value = false
  } catch (error) {
    console.log(t('pages.dashboard.list.errorLoading'), error)
    fluxListLoading.value = false
  }
}

onMounted(() => {
  getFluxList()
})
</script>

<style>
.overlay {
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}
.no-wrap-table td {
  white-space: nowrap;
}
</style>
