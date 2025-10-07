<template>
  <div class="apps-grid-wrapper">
    <VCard class="apps-grid-card" elevation="3">
      <!-- Header with search and filters -->
      <div class="grid-header">
        <div class="header-top">
          <h2 class="section-title">
            <VIcon start color="secondary">mdi-apps</VIcon>
            Flux Applications
          </h2>
        </div>

        <div class="controls-row">
          <VTextField
            v-model="search"
            placeholder="Search apps..."
            variant="outlined"
            density="compact"
            clearable
            hide-details
            class="search-field"
            @update:model-value="updateSearch"
          >
            <template #prepend-inner>
              <VIcon size="20" color="grey">mdi-magnify</VIcon>
            </template>
          </VTextField>

          <VSelect
            v-model="category"
            :items="categoryItems"
            label="Category"
            variant="outlined"
            density="compact"
            hide-details
            class="category-select"
            prepend-inner-icon="mdi-tag"
            @update:model-value="updateCategory"
          />

          <VSelect
            v-model="sort"
            :items="sortOptions"
            label="Sort by"
            variant="outlined"
            density="compact"
            hide-details
            class="sort-select"
            prepend-inner-icon="mdi-sort"
            @update:model-value="updateSort"
          />
        </div>
      </div>

      <!-- Apps Grid -->
      <div v-if="loading" class="loading-state">
        <div class="modern-loader">
          <div class="loader-ring"></div>
          <div class="loader-ring"></div>
          <div class="loader-ring"></div>
        </div>
        <p>Loading marketplace apps...</p>
      </div>

      <div v-else-if="!paginatedApps.length" class="empty-state">
        <template v-if="search || category">
          <VIcon size="64" color="grey">mdi-magnify-close</VIcon>
          <h3>No apps found</h3>
          <p>Try adjusting your search or filters</p>
          <VBtn
            variant="flat"
            color="primary"
            @click="resetFilters"
          >
            Reset Filters
          </VBtn>
        </template>
        <template v-else>
          <VIcon size="64" color="grey">mdi-store-off-outline</VIcon>
          <h3 class="mt-1 mb-0">No apps available</h3>
          <p class="text-body-1 mb-0">The marketplace is currently empty</p>
          <VBtn
            variant="flat"
            color="primary"
            class="mt-3"
            @click="refreshApps"
          >
            <VIcon start>mdi-refresh</VIcon>
            Refresh
          </VBtn>
        </template>
      </div>

      <div v-else class="apps-container">
        <div class="apps-content">
          <Transition name="slide">
            <div :key="currentPage" class="apps-grid" :class="gridClass">
              <AppCard
                v-for="app in paginatedApps"
                :key="app.uuid || app.name"
                :app="app"
                :marketplace-categories="marketplaceCategories"
                @deploy="$emit('deploy', app)"
              />
            </div>
          </Transition>
        </div>

      </div>
    </VCard>

    <!-- Pagination outside VCard -->
    <div v-if="totalPages > 1" class="pagination">
      <VBtn
        variant="tonal"
        color="primary"
        :disabled="currentPage <= 1"
        @click="changePage(currentPage - 1)"
      >
        <VIcon start>mdi-arrow-left</VIcon>
        Previous
      </VBtn>

      <div class="page-numbers">
        <VBtn
          v-for="page in displayPages"
          :key="page"
          size="small"
          :variant="page === currentPage ? 'flat' : 'text'"
          :color="page === currentPage ? 'primary' : undefined"
          :disabled="page === '...'"
          @click="page !== '...' && changePage(page)"
        >
          {{ page }}
        </VBtn>
      </div>

      <VBtn
        variant="tonal"
        color="primary"
        :disabled="currentPage >= totalPages"
        @click="changePage(currentPage + 1)"
      >
        Next
        <VIcon end>mdi-arrow-right</VIcon>
      </VBtn>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDisplay } from 'vuetify'
import AppCard from '@/components/Marketplace/AppCard.vue'
import { useMarketplaceUtils } from '@/composables/useMarketplaceUtils'

const props = defineProps({
  apps: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  searchQuery: {
    type: String,
    default: '',
  },
  selectedCategory: {
    type: [String, null],
    default: null,
  },
  sortBy: {
    type: String,
    default: 'recent',
  },
  categories: {
    type: Array,
    default: () => [],
  },
  marketplaceCategories: {
    type: Array,
    default: () => [],
  },
  compact: {
    type: Boolean,
    default: false,
  },
  mobile: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['update:search', 'update:category', 'update:sort', 'deploy', 'refresh'])
const { width } = useDisplay()
const { debounce } = useMarketplaceUtils()

// Local state
const search = ref(props.searchQuery)
const category = ref(props.selectedCategory)
const sort = ref(props.sortBy)
const currentPage = ref(1)

// Sort options (matching FluxCloud)
const sortOptions = [
  { title: 'Default', value: null },
  { title: 'Date', value: 'date' },
  { title: 'Name', value: 'name' },
]

// Category items
const categoryItems = computed(() => [
  { title: 'All Categories', value: null },
  ...props.categories,
])

// Grid configuration - responsive based on available space for cards
const columnsCount = computed(() => {
  const minCardWidth = 300  // Minimum width per app card
  const gridGap = 16        // Gap between cards
  const containerPadding = 40  // Container padding

  const availableWidth = width.value - containerPadding

  // Calculate maximum columns that fit comfortably
  if (availableWidth >= (minCardWidth * 3) + (gridGap * 2)) {
    return 3  // FluxCloud standard: 3 columns
  } else if (availableWidth >= (minCardWidth * 2) + gridGap) {
    return 2  // 2 columns for medium screens
  } else {
    return 1  // 1 column for small screens
  }
})

const itemsPerPage = computed(() => {
  const rows = 1  // Only 1 row per page
  
  return columnsCount.value * rows
})

const gridClass = computed(() => {
  if (columnsCount.value === 1) return 'grid-mobile'
  if (columnsCount.value === 2) return 'grid-sm'
  
  return 'grid-md'  // 3 columns
})

// Filtered apps count
const filteredAppsCount = computed(() => props.apps.length)

// Pagination
const totalPages = computed(() => 
  Math.ceil(props.apps.length / itemsPerPage.value),
)

const paginatedApps = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  
  return props.apps.slice(start, end)
})

const displayPages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 3) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 2) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }

  return pages
})

// Methods
const updateSearch = value => {
  emit('update:search', value)
  currentPage.value = 1
}

const updateCategory = value => {
  emit('update:category', value)
  currentPage.value = 1
}

const updateSort = value => {
  emit('update:sort', value)
  currentPage.value = 1
}

const changePage = newPage => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    currentPage.value = newPage
  }
}

const resetFilters = () => {
  search.value = ''
  category.value = null
  sort.value = 'recent'
  updateSearch('')
  updateCategory(null)
  updateSort('recent')
}

const refreshApps = () => {
  emit('refresh')
}

// Watch for prop changes
watch(() => props.searchQuery, val => { search.value = val })
watch(() => props.selectedCategory, val => { category.value = val })
watch(() => props.sortBy, val => { sort.value = val })
</script>

<style scoped>
.apps-grid-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.apps-grid-card {
  display: flex;
  flex-direction: column;
  padding: 24px;
  border-radius: 24px !important;
  min-height: 400px;
  background: linear-gradient(135deg,
    rgba(var(--v-theme-surface), 1) 0%,
    rgba(var(--v-theme-primary), 0.02) 50%,
    rgba(var(--v-theme-surface), 1) 100%);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.06),
    0 4px 16px rgba(0, 0, 0, 0.04),
    0 2px 8px rgba(0, 0, 0, 0.02);
}

.grid-header {
  margin-bottom: 20px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.controls-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.search-field {
  flex: 3;
  min-width: 350px;
}

.category-select {
  width: 65px;
}

.sort-select {
  width: 50px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 16px;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.modern-loader {
  position: relative;
  width: 60px;
  height: 60px;
}

.loader-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid rgba(59, 130, 246, 0.1);
  border-top: 3px solid #3B82F6;
  border-radius: 50%;
  animation: modern-spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
}

.loader-ring:nth-child(2) {
  animation-delay: 0.2s;
  border-top-color: #60A5FA;
  border-color: rgba(96, 165, 250, 0.1);
  transform: scale(0.8);
}

.loader-ring:nth-child(3) {
  animation-delay: 0.4s;
  border-top-color: #93C5FD;
  border-color: rgba(147, 197, 253, 0.1);
  transform: scale(0.6);
}

@keyframes modern-spin {
  0% {
    transform: rotate(0deg) scale(var(--scale, 1));
  }
  50% {
    transform: rotate(180deg) scale(calc(var(--scale, 1) * 1.1));
  }
  100% {
    transform: rotate(360deg) scale(var(--scale, 1));
  }
}

.empty-state h3 {
  font-size: 1.25rem;
  margin: 0;
}

.apps-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.apps-content {
  position: relative;
  overflow: hidden;
  height: 250px;
}


.apps-grid {
  display: grid;
  gap: 16px;
  margin-bottom: 0;
  width: 100%;
  grid-auto-rows: minmax(250px, auto);
}

/* Modern slide transition with blur and scale effects */
.slide-enter-active {
  transition: all 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
}

.slide-leave-active {
  transition: all 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
}

.slide-enter-from {
  transform: translateX(100%) scale(0.95);
  opacity: 0;
  filter: blur(4px);
}

.slide-leave-to {
  transform: translateX(-100%) scale(0.95);
  opacity: 0;
  filter: blur(4px);
}

.slide-enter-to {
  transform: translateX(0) scale(1);
  opacity: 1;
  filter: blur(0px);
}

.slide-leave-from {
  transform: translateX(0) scale(1);
  opacity: 1;
  filter: blur(0px);
}

.grid-mobile {
  grid-template-columns: repeat(1, 1fr);
}

.grid-sm {
  grid-template-columns: repeat(2, 1fr);
}

.grid-md {
  grid-template-columns: repeat(3, 1fr);
}

.grid-lg {
  grid-template-columns: repeat(3, 1fr);
}

.grid-xl {
  grid-template-columns: repeat(4, 1fr);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 16px 0;
}


.page-numbers {
  display: flex;
  gap: 8px;
}


/* FluxCloud PageView style - horizontal sliding */

/* Responsive adjustments */
@media (max-width: 960px) {
  .controls-row {
    flex-direction: column;
  }

  .category-select,
  .sort-select {
    width: 100%;
  }
}

@media (max-width: 600px) {
  .apps-grid-card {
    padding: 12px;
  }

  .section-title {
    font-size: 1.1rem;
  }

  .page-numbers {
    display: none;
  }
}
</style>
