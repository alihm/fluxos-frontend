<template>
  <div>
    <VTabs
      v-model="tabIndex"
      grow
      hide-slider
      class="tabs-no-slider mb-4"
    >
      <VTab class="tab-chip">
        My Active Apps
        <VBadge
          v-if="activeApps.length"
          :content="activeApps.length"
          color="success"
          offset-x="-5"
          offset-y="8"
          class="ml-2"
          floating
          rounded
          size="small"
          density="default"
        />
      </VTab>
      <VTab class="tab-chip">
        My Expired Apps
        <VBadge
          v-if="expiredApps.length"
          :content="expiredApps.length"
          color="error"
          offset-x="-5"
          offset-y="8"
          class="ml-2"
          floating
          rounded
          size="small"
          density="default"
        />
      </VTab>
    </VTabs>

    <div v-if="!managedApplication">
      <VWindow v-model="tabIndex">
        <VWindowItem value="0">
          <div v-if="!loading.blockCount">
            <MyAppsTab
              ref="activeAppsRef"
              :apps="activeApps"
              :loading="loading.active"
              :logged-in="loggedIn"
              :current-block-height="daemonBlockCount"
              active-apps-tab
              manage
              :api-error="apiError"
            />
          </div>
        </VWindowItem>

        <VWindowItem value="1">
          <div v-if="!loading.blockCount">
            <MyAppsTab
              ref="expiredAppsRef"
              :apps="expiredApps"
              :loading="loading.expired"
              :logged-in="loggedIn"
              :current-block-height="daemonBlockCount"
              :active-apps-tab="false"
              :api-error="apiError"
            />
          </div>
        </VWindowItem>
      </VWindow>
    </div>

    <Management
      v-if="managedApplication"
      :app-name="managedApplication"
      global
      :installed-apps="[]"
      @back="clearManagedApplication"
    />

    <VSnackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="4000"
    >
      {{ snackbar.message }}
    </VSnackbar>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from "vue"
import qs from "qs"
import Management from "@/views/apps/management/manage.vue"
import MyAppsTab from "@/views/apps/management/tabView.vue"
import AppsService from "@/services/AppsService"
import DaemonService from "@/services/DaemonService"

const activeApps = ref([])
const apiError = ref(false)
const expiredApps = ref([])
const managedApplication = ref("")
const daemonBlockCount = ref(-1)
const loading = ref({ active: true, expired: true, blockCount: true })
const loggedIn = ref(false)
const snackbar = ref({ show: false, message: "", color: "error" })
const tabIndex = ref(0)
const activeAppsRef = ref(null)
const expiredAppsRef = ref(null)

function showSnackbar(message, color = "error") {
  snackbar.value = { show: true, message, color }
}

function setLoginStatus() {
  const zelidauth = localStorage.getItem("zelidauth")
  const auth = qs.parse(zelidauth || "")

  loggedIn.value = Boolean(auth.zelid)
  console.log("setLoginStatus:", loggedIn.value)
}

async function getDaemonBlockCount() {
  try {
    const response = await DaemonService.getBlockCount()
    if (response.data.status === "success") {
      daemonBlockCount.value = response.data.data
      console.log("Daemon block count set:", daemonBlockCount.value)
    } else {
      console.warn("Daemon block count fetch failed:", response.data)
      daemonBlockCount.value = -1
    }
  } catch (error) {
    console.error("Error fetching daemon block count:", error.message)
    daemonBlockCount.value = -1
  } finally {
    loading.value.blockCount = false
  }
}

async function getActiveApps() {
  loading.value.active = true
  apiError.value = false
  try {
    const zelidauth = localStorage.getItem("zelidauth")
    const auth = qs.parse(zelidauth || "")
    if (!auth?.zelid) {
      activeApps.value = []
      console.log("No zelid, cleared activeApps")

      return
    }
    const response = await AppsService.myGlobalAppSpecifications(auth.zelid)

    activeApps.value = Array.isArray(response.data.data) ? response.data.data : []
    console.log("Active apps set:", activeApps.value)
  } catch (error) {
    console.error("Error fetching active apps:", error.message)
    activeApps.value = []
    apiError.value = true
    showSnackbar("Failed to load active apps")
  } finally {
    loading.value.active = false
    console.log(
      "Active apps loading complete, passing to MyAppsTab:",
      activeApps.value.length,
    )
  }
}

async function getExpiredApps() {
  loading.value.expired = true
  try {
    const zelidauth = localStorage.getItem("zelidauth")
    const auth = qs.parse(zelidauth || "")
    if (!auth?.zelid) {
      expiredApps.value = []
      console.log("No zelid, cleared expiredApps")

      return
    }

    const response = await AppsService.permanentMessagesOwner(auth.zelid).catch(() => ({
      data: { data: [] },
    }))

    const appMessages = response.data.data || []
    const adjustedPermMessages = []

    appMessages.forEach(msg => {
      const existingIndex = adjustedPermMessages.findIndex(
        existing => existing.appSpecifications.name === msg.appSpecifications.name,
      )

      if (existingIndex === -1) {
        adjustedPermMessages.push(msg)
      } else if (msg.height > adjustedPermMessages[existingIndex].height) {
        adjustedPermMessages[existingIndex] = msg
      }
    })

    const filtered = adjustedPermMessages.filter(
      msg =>
        !activeApps.value.find(
          active =>
            active.name.toLowerCase() === msg.appSpecifications.name.toLowerCase(),
        ),
    )

    expiredApps.value = filtered.map(msg => msg.appSpecifications)
    console.log("Expired apps set:", expiredApps.value)
  } catch (error) {
    console.error("Error fetching expired apps:", error.message)
    expiredApps.value = []
    showSnackbar("Failed to load expired apps")
  } finally {
    loading.value.expired = false
    console.log(
      "Expired apps loading complete, passing to MyAppsTab:",
      expiredApps.value.length,
    )
  }
}

async function getApps() {
  await Promise.all([getActiveApps(), getExpiredApps()])
}

watch(loggedIn, newValue => {
  console.log("Login status changed:", newValue)
  if (newValue) getApps()
})

watch(activeApps, newValue => {
  console.log("activeApps updated:", newValue.length, "items")
})

watch(expiredApps, newValue => {
  console.log("expiredApps updated:", newValue.length, "items")
})

watch(daemonBlockCount, newValue => {
  console.log("daemonBlockCount updated:", newValue)
})

onMounted(async () => {
  console.log("Parent component mounted")
  setLoginStatus()
  await getDaemonBlockCount()
  console.log("Initial data fetching complete")
})
</script>

<style scoped>
.v-tab {
  text-transform: none;
}
.v-tabs {
  max-width: 100%;
}
.tab-chip {
  min-height: 36px;
  height: 40px;
  padding: 0 16px;
  border-radius: 20px;
  font-size: 16px;
  font-family: monospace;
}

/* ACTIVE tab */
.tab-chip[aria-selected="true"] {
  background-color: rgba(0, 123, 255, 0.1);
  padding: 0 16px;
  border-radius: 20px;
}

/* HOVER */
.tab-chip:hover {
  transform: scale(1.03);
}

/* REMOVE BORDER CORRECTLY */
.tabs-no-slider.v-tabs {
  border-block-end: none !important;
}

@media (max-width: 600px) {
  .tab-chip {
    font-size: 12px !important;
    padding: 0 8px !important;
    min-height: 28px !important;
    height: 32px !important;
    line-height: 1 !important;
  }

  @media (max-width: 600px) {
  /* Deeper selector to target badge bubble */
  ::v-deep(.v-badge__badge) {
    font-size: 11px !important;
    height: 16px !important;
    min-width: 30px !important;
    top: -15px !important;
    right: -28px !important;
    left: auto !important;
  }
}

  /* Optional: reduce spacing from badge's offset */
  .v-badge.floating {
    transform: translate(4px, -4px) !important;
  }

  /* Optional: reduce tab spacing on mobile */
  .v-tabs {
    gap: 4px !important;
  }

  /* Optional: reduce tab content padding */
  .v-tab {
    padding: 0 6px !important;
  }
}
</style>
