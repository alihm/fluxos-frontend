<script setup>
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import AppsService from '@/services/AppsService'
import { useFluxStore } from '@/stores/flux'
import IDService from '@/services/IDService'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import qs from 'qs'
import DaemonService from "@/services/DaemonService"

const logoutTrigger = ref(false)
const route = useRoute()
const fluxStore = useFluxStore()
const currentTab = ref('logs')
const router = useRouter()
const appName = ref(useRoute().params.appName)
const selectedIp = ref(null)
const masterIP = ref(null)
const isDisabled = ref(false)
const masterSlaveApp = ref(false)
const ipAccess = ref(false)
const ipAddress = ref('')
const globalZelidAuthorized = ref(false)
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')
const appSpecification = ref(null)
const appSpecificationGlobal = ref(null)
const applicationManagementAndStatus = ref([])
const currentBlockHeight = ref(-1)
const activeTabLocalIndexSpec = ref(0)
const status = ref(true)

const getAllAppsResponse = ref({
  status: null,
  data: null,
})

const callResponse = ref({ status: null, data: null })
const callBResponse = ref({ status: null, data: null })

function showToast(type, message) {
  snackbarMessage.value = message
  snackbarColor.value = type === 'danger' ? 'error' : type
  snackbar.value = true
}

watch(status, () => {
  if (status.value) {
    console.log('Local')
    appSpecification.value = callResponse.value.data
  } else {
    console.log('Global')
    appSpecification.value = callBResponse.value.data
    console.log(appSpecification.value)
  }
})

async function getDaemonBlockCount() {
  try {
    const response = await DaemonService.getBlockCount()
    if (response.data.status === "success") {
      currentBlockHeight.value = response.data.data
      console.log("Daemon block count set:", currentBlockHeight.value)
    } else {
      console.warn("Daemon block count fetch failed:", response.data)
      currentBlockHeight.value = -1
    }
  } catch (error) {
    console.error("Error fetching daemon block count:", error.message)
    currentBlockHeight.value = -1
  } 
}

function normalizeComponents(data) {
  if (!data) return []

  return data.version >= 4 ? data.compose : [{ ...data, repoauth: false }]
}

function goBack() {
  router.push('/apps/management')
}

// Define custom tab items
const tabs = [
  { label: 'Specifications', value: 'logs' },
  { label: 'Information', value: 'config' },
  { label: 'Monitoring', value: 'stats' },
  { label: 'File Changes', value: 'env' },
  { label: 'Logs', value: 'volumes' },
  { label: 'Aplication Control', value: 'ports' },
  { label: 'Backup/Restore', value: 'health' },
  { label: 'Interacive Terminal', value: 'events' },
  { label: 'Global Control', value: 'updates' },
  { label: 'Running Instances', value: 'danger' },
  { label: 'Update/Renew', value: 'danger1' },
  { label: 'Cancel Subscription', value: 'danger2' },
]

const tabItemText = 'Shortbread chocolate bar marshmallow bear claw tiramisu chocolate cookie wafer.'


const instances = ref({
  data: [],
})

function refreshInfo() {
  console.log('Refreshing instance list...')

  // Replace with your actual fetch logic
}

async function getInstancesForDropDown() {
  const response = await AppsService.getAppLocation(appName.value)

  selectedIp.value = null

  if (response.data.status === 'error') {
    showToast('danger', response.data.data.message || response.data.data)
    
    return
  }

  masterIP.value = null
  instances.value.data = response.data.data

  if (masterSlaveApp.value) {
    const url = `https://${appName.value}.app.runonflux.io/fluxstatistics?scope=${appName.value}apprunonfluxio;json;norefresh`
    let errorFdm = false

    let fdmData = await axios.get(url).catch(error => {
      errorFdm = true
      masterIP.value = 'Failed to Check'
      console.error(`UImasterSlave: Failed to reach FDM:`, error)
    })

    if (!errorFdm && fdmData?.data?.length) {
      for (const fdmServer of fdmData.data) {
        const serviceName = fdmServer.find(
          el => el.id === 1 && el.objType === 'Server' &&
            el.field.name === 'pxname' &&
            el.value.value.toLowerCase().startsWith(`${appName.value.toLowerCase()}apprunonfluxio`),
        )

        if (serviceName) {
          const ipElement = fdmServer.find(
            el => el.id === 1 && el.objType === 'Server' && el.field.name === 'svname',
          )

          if (ipElement) {
            const [ip, port] = ipElement.value.value.split(':')

            masterIP.value = ip
            selectedIp.value = port === '16127' ? ip : ipElement.value.value
            break
          }
        }
      }
    }

    if (!masterIP.value) masterIP.value = 'Defining New Primary In Progress'
    if (!selectedIp.value) selectedIp.value = instances.value.data[0]?.ip

  } else if (!selectedIp.value) {
    selectedIp.value = instances.value.data[0]?.ip
  }

  // IP access logic
  if (ipAccess.value) {
    const withoutProtocol = ipAddress.value.replace('http://', '')
    const desiredIP = config.apiPort === 16127 ? withoutProtocol : `${withoutProtocol}:${config.apiPort}`
    const match = instances.value.data.find(instance => instance.ip === desiredIP)
    if (match) selectedIp.value = desiredIP
  } else {
    const regex = /https:\/\/(\d+-\d+-\d+-\d+)-(\d+)/
    const match = ipAddress.value.match(regex)
    if (match) {
      const ip = match[1].replace(/-/g, '.')
      const desiredIP = config.apiPort === 16127 ? ip : `${ip}:${config.apiPort}`
      const match = instances.value.data.find(instance => instance.ip === desiredIP)
      if (match) selectedIp.value = desiredIP
    }
  }

  instances.value.totalRows = instances.value.data.length
}

function getAlertColor(state, status) {
  if (!state) return 'primary'
  const normalizedState = state.toLowerCase()

  if (normalizedState === 'running') {
    return status?.toLowerCase().includes('unhealthy') ? 'warning' : 'success'
  } else if (normalizedState === 'restarting') {
    return 'warning'
  } else if (normalizedState === 'exited') {
    return 'error'
  }

  return 'primary'
}

function getComponentInfo(apps, appName) {
  if (!Array.isArray(apps)) return false

  const match = apps.find(app =>
    app.Names?.[0] === getAppDockerNameIdentifier(appName),
  )

  console.log(match)

  if (!match) return false

  return {
    name: appName.includes('_') ? appName.substring(0, appName.lastIndexOf('_')) : appName,
    state: match.State ?? 'N/A',
    status: match.Status?.toLowerCase() ?? 'N/A',
    image: match.Image ?? 'N/A',
  }
}

function getIconColor(state, status) {
  return getAlertColor(state, status)
}

async function logout(expired = false) {
  if (logoutTrigger.value) return
  logoutTrigger.value = true

  const zelidauth = localStorage.getItem('zelidauth')
  const auth = qs.parse(zelidauth || '')

  localStorage.removeItem('zelidauth')
  fluxStore.setPrivilege('none')
  fluxStore.setZelid('')

  try {
    const response = await IDService.logoutCurrentSession(zelidauth)

    console.log(response)

    if (response.data.status === 'error') {
      console.log(response.data.data.message) // should never happen
    } else {
      if (expired) {
        showToast('warning', 'Session expired, logging out...')
      } else {
        showToast('success', response.data.data.message)
      }

      if (route.path === '/') {
        window.location.reload()
      } else {
        await router.push("/")
      }
    }
  } catch (e) {
    console.log(e)
    showToast('danger', e.toString())
  }

  try {
    await firebase.auth().signOut()
  } catch (error) {
    console.log(error)
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function labelForExpire(expire, height) {
  if (!height) return "Application Expired"
  if (currentBlockHeight.value === -1) return "Not possible to calculate expiration"
  const expires = expire || 22000
  const blocksToExpire = height + expires - currentBlockHeight.value
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

async function getZelidAuthority() {
  const zelidauth = localStorage.getItem('zelidauth')
  const auth = qs.parse(zelidauth || '')

  const timestamp = Date.now()
  const maxTime = 1.5 * 60 * 60 * 1000 // 1.5 hours
  const mesTime = auth?.loginPhrase?.substring(0, 13) || 0
  const expiryTime = +mesTime + maxTime

  if (+mesTime > 0 && timestamp < expiryTime) {
    globalZelidAuthorized.value = true
  } else {
    globalZelidAuthorized.value = false
    console.log('Session expired, logging out...')
    await logout(true)
  }
}

async function executeCommand(app, command, warningText, parameter = null) {
  try {
    const zelidauth = localStorage.getItem('zelidauth')

    const axiosConfig = {
      headers: {
        zelidauth,
      },
    }

    getZelidAuthority()
    if (!globalZelidAuthorized.value) return

    showToast('warning', warningText)

    let urlPath = `/apps/${command}/${app}`
    if (parameter) {
      urlPath += `/${parameter}`
    }
    urlPath += '/true' // global deploy

    const response = await axios.get(urlPath, axiosConfig)

    await delay(500)

    const result = response?.data?.data || response?.data?.message || response?.data

    if (response?.data?.status === 'success') {
      showToast('success', result)
    } else {
      showToast('danger', result)
    }
  } catch (error) {
    showToast('danger', error.message || error)
  }
}

async function executeLocalCommand(command, postObject = null, axiosConfigAux = null, skipCache = false) {
  try {
    const zelidauth = localStorage.getItem('zelidauth')

    const axiosConfig = axiosConfigAux || {
      headers: {
        zelidauth,
        ...(skipCache && { 'x-apicache-bypass': 'true' }),
      },
    }

    getZelidAuthority()
    if (!globalZelidAuthorized.value) return null

    const [host, port = 16127] = selectedIp.value?.split(':') || []
    if (!host) throw new Error('Instance not found with deployed application.')

    const queryHost = host.replace(/\./g, '-')
    let queryUrl = `https://${queryHost}-${port}.node.api.runonflux.io${command}`

    if (ipAccess.value) {
      queryUrl = `http://${host}:${port}${command}`
    }

    return postObject
      ? await axios.post(queryUrl, postObject, axiosConfig)
      : await axios.get(queryUrl, axiosConfig)
  } catch (error) {
    showToast('danger', error.message || error)
    
    return null
  }
}

async function getApplicationManagementAndStatus(skip = false) {
  if (!globalZelidAuthorized.value || !selectedIp.value) return
  console.log("test...1")
  if (!skip) {
    await appsGetListAllApps()
  }
  console.log("test...2")
  if (!appSpecification.value?.name) {
    await getInstalledApplicationSpecifics(true)

    if (!appSpecification.value?.name) {
      applicationManagementAndStatus.value = []
      await nextTick()
      
      return
    }

    await nextTick()
  }

  console.log(appSpecification.value)
  console.log("-----------------------------------")
  console.log(getAllAppsResponse.value)

  const appInfoArray = []

  if (appSpecification.value?.version >= 4 && Array.isArray(appSpecification.value.compose)) {
    for (const component of appSpecification.value.compose) {
      console.log(`${component.name}_${appSpecification.value.name}`)

      const infoObject = getComponentInfo(getAllAppsResponse.value.data, `${component.name}_${appSpecification.value.name}`)
      if (infoObject) appInfoArray.push(infoObject)
    }
  } else {
    const infoObject = getComponentInfo(getAllAppsResponse.value.data, appSpecification.value.name)
    if (infoObject) appInfoArray.push(infoObject)
  }

  console.log(appInfoArray)
  applicationManagementAndStatus.value = appInfoArray
}

async function getInstalledApplicationSpecifics(silent = false) {
  const response = await executeLocalCommand(`/apps/installedapps/${appName.value}`, null, null, true)

  console.log(response)

  if (response) {
    const result = response.data

    if (result.status === 'error' || !result.data?.[0]) {
      if (!silent) {
        showToast('danger', result.message || result.data)
      }
    } else {
      callResponse.value.status = result.status
      callResponse.value.data = result.data[0]
      appSpecification.value = result.data[0]
    }
  }
}

async function getGlobalApplicationSpecifics(silent = false) {
  const response = await AppsService.getAppSpecifics(appName.value)

  console.log(response)

  if (response) {
    const result = response.data

    if (result.status === 'success' || !result.data?.[0]) {
      callBResponse.value.status = result.status
      callBResponse.value.data = result.data
      appSpecificationGlobal.value = result.data

    } else {

      if (!silent) {
        showToast('danger', result.message || result.data)
      }

    }
  }
}

async function appsGetListAllApps() {
  const response = await executeLocalCommand('/apps/listallapps', null, null, true)

  console.log(response)

  getAllAppsResponse.value.status = response?.data?.status
  getAllAppsResponse.value.data = response?.data?.data

  await getApplicationManagementAndStatus(true)
  await nextTick()
}

function getAppIdentifier(appName) {
  if (!appName) return ''

  if (appName.startsWith('zel') || appName.startsWith('flux')) {
    return appName
  }

  if (appName === 'KadenaChainWebNode' || appName === 'FoldingAtHomeB') {
    return `zel${appName}`
  }

  return `flux${appName}`
}

function getAppDockerNameIdentifier(appName) {
  const name = getAppIdentifier(appName)
  
  return name.startsWith('/') ? name : `/${name}`
}

onMounted(async () => {
  await getZelidAuthority()
  await getDaemonBlockCount()
  await getInstancesForDropDown()
  await getInstalledApplicationSpecifics()
  await getGlobalApplicationSpecifics()
  await getApplicationManagementAndStatus()
})
</script>

<template>
  <VCard>
    <VCardTitle class="d-flex justify-space-between align-center">
      <div>
        <VBtn
          color="primary"
          variant="outlined"
          size="small"
          rounded="pill"
          class="mr-2"
          @click="goBack"
        >
          Back
        </VBtn>
        <VChip
          class="current-task-chip"
          variant="tonal"
          rounded="pill"
        >
          <template #prepend>
            <VIcon
              size="24"
              class="mr-1"
            >
              mdi-progress-wrench
            </VIcon>
          </template>
          {{ appName }}
        </VChip>
      </div>
      <VRow
        class="d-flex align-center my-1"
        style="max-width: 255px; flex-wrap: nowrap;"
        no-gutters
      >
        <!-- IP Selector with laptop icon -->
        <VSelect
          v-model="selectedIp"
          :items="instances.data.map(i => i.ip)"
          variant="outlined"
          density="compact"
          hide-details
          class="flex-grow-1"
          style="min-width: 0;"
        >
          <template #prepend-inner>
            <VIcon
              icon="mdi-laptop"
              size="20"
              class="mr-2"
            />
          </template>
        </VSelect>

        <!-- Refresh Icon -->
        <VIcon
          icon="mdi-refresh"
          size="20"
          class="ml-2"
          style="min-width: 20px;"
          :class="{ 'v-icon--disabled': isDisabled }"
          @click="!isDisabled && refreshInfo()"
        />
      </VRow>
    </VCardTitle>
    <VDivider class="mb-1 mx-2" />
    <div class="app-header d-flex align-center">
      <!-- App list -->
      <div class="d-flex flex-wrap gap-4 ml-4 mb-2">
        <div
          v-for="(app, index) in applicationManagementAndStatus"
          :key="index"
          class="d-flex align-center"
        >
          <VTooltip location="top">
            <template #activator="{ props }">
              <div
                v-bind="props"
                class="app-item d-flex align-center"
                style="cursor: pointer"
              >
                <VIcon
                  icon="mdi-heart-pulse"
                  :color="getIconColor(app.state, app.status)"
                  size="28"
                  class="mr-2"
                />
                <div class="app-details">
                  <VChip
                    class="mb-1"
                    color="info"
                    variant="tonal"
                    size="x-small"
                    rounded="pill"
                  >
                    {{ app.name }}
                  </VChip>
                  <VChip
                    :color="app.state === 'running' ? 'success' : 'warning'"
                    variant="tonal"
                    destiny="comfort"
                    size="x-small"
                    rounded="pill"
                  >
                    {{ app.state }}
                  </VChip>
                </div>
              </div>
            </template>

            <div>
              <div class="d-flex align-center mb-1">
                <VIcon
                  icon="mdi-information"
                  class="mr-1"
                  size="16"
                />
                <strong>Image:</strong> {{ app.image }}
              </div>
              <div class="d-flex align-center">
                <VIcon
                  icon="mdi-clock"
                  class="mr-1"
                  size="16"
                />
                <strong>Status:</strong> {{ app.status }}
                <span v-if="app.status === 'created'"> (standby mode)</span>
              </div>
            </div>
          </VTooltip>
        </div>
      </div>
    </div>
  </VCard>

  <VCard class="mt-6">
    <VTabs
      v-model="currentTab"
      show-arrows
      class="v-tabs-pill mt-1"
    >
      <VTab
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
      >
        {{ tab.label }}
      </VTab>
    </VTabs>

    <VCardText>
      <VWindow v-model="currentTab">
        <VWindowItem
          v-for="tab in tabs"
          :key="tab.value"
          :value="tab.value"
        >
          <div
            v-if="appSpecification"
            class="pa-0"
          >
            <SmartChip
              v-model="status"
              icon="mdi-cube-outline"
              text-on="Local Specyfication"
              text-off="Global Specyfication"
              icon-after-true="mdi-wifi"
              icon-after-false="mdi-wifi-off"
              color="info"
              variant="tonal"
              rounded="md"
            />
            <AppDetailsCard
              :app="appSpecification"
              :get-new-expire-label="labelForExpire(appSpecification.expire, appSpecification.height)"
              class="mt-4 px-4"
            />

            <div>
              <div class="d-flex align-center justify-start my-3">
                <VChip
                  color="info"
                  variant="tonal"
                  class="composition-chip w-100"
                >
                  <VIcon
                    size="22"
                    class="ml-1"
                  >
                    mdi-hexagon-multiple
                  </VIcon>
                  <span
                    class="ml-1"
                    style="font-size: 18px;"
                  >Composition</span>
                </VChip>
              </div>

              <VTabs
                v-model="activeTabLocalIndexSpec"
                align-tabs="start"
                background-color="transparent"
                color="primary"
                height="30"
                hide-slider
                class="v-tabs-pill"
              >
                <VTab
                  v-for="(component, index) in normalizeComponents(appSpecification)"
                  :key="index"
                  :value="index"
                  class="v-tabs-pill"
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
                  v-for="(component, index) in normalizeComponents(appSpecification)"
                  :key="index"
                  :value="index"
                >
                  <VSlideYTransition mode="out-in">
                    <div>
                      <ComponentDetails
                        :component="component"
                        :app-name="appSpecification.name || ''"
                        :index="index"
                      />
                    </div>
                  </VSlideYTransition>
                </VWindowItem>
              </VWindow>
            </div>
          </div>
          <div v-else>
            <VProgressLinear
              indeterminate
              color="primary"
            />
          </div>
        </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
  <VSnackbar
    v-model="snackbar"
    :color="snackbarColor"
    timeout="4000"
    location="top"
    elevation="4"
  >
    {{ snackbarMessage }}
  </VSnackbar>
</template>


<style>
#updatemessage {
  padding-right: 25px !important;
}
.text-wrap {
  position: relative;
  padding: 0em;
}
.clipboard.icon {
  position: absolute;
  top: 0.4em;
  right: 2em;
  margin-top: 4px;
  margin-left: 4px;
  width: 12px;
  height: 12px;
  border: solid 1px #333333;
  border-top: none;
  border-radius: 1px;
  cursor: pointer;
}
.no-wrap {
  white-space: nowrap !important;
}
.no-wrap-limit {
  white-space: nowrap !important;
  min-width: 150px;
  text-align: center;;
}
.custom-button {
  width: 15px !important;
  height: 25px !important;
}
.button-cell {
  display: flex;
  align-items: center;
  min-width: 150px;
}
.xterm {
  padding: 10px;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.spin-icon {
  animation: spin 2s linear infinite;
}
.spin-icon-l {
  animation: spin 2s linear infinite;
  width: 12px !important;
  height: 12px !important;
}
.app-instances-table td:nth-child(1) {
  padding: 0 0 0 5px;
}
.app-instances-table th:nth-child(1) {
  padding: 0 0 0 5px;
}
.app-instances-table td:nth-child(5) {
  width: 105px;
}
.app-instances-table th:nth-child(5) {
  width: 105px;
}
.loginRow {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 10px;
}
.walletIcon {
  height: 90px;
  width: 90px;
  padding: 10px;
}
.walletIcon img {
  -webkit-app-region: no-drag;
  transition: 0.1s;
}
.fluxSSO {
  height: 90px;
  padding: 10px;
  margin-left: 5px;
}
.fluxSSO img {
  -webkit-app-region: no-drag;
  transition: 0.1s;
}
.stripePay {
  margin-left: 5px;
  height: 90px;
  padding: 10px;
}
.stripePay img {
  -webkit-app-region: no-drag;
  transition: 0.1s;
}
.paypalPay {
  margin-left: 5px;
  height: 90px;
  padding: 10px;
}
.paypalPay img {
  -webkit-app-region: no-drag;
  transition: 0.1s;
}

a img {
  transition: all 0.05s ease-in-out;
}

a:hover img {
  filter: opacity(70%);
  transform: scale(1.1);
}

.flex {
  display: flex;
}
</style>

<style lang="scss">
.anchor {
  display: block;
  height: 100px;
  margin-top: -100px;
  visibility: hidden;
}
.v-toast__text {
  font-family: "Roboto", sans-serif !important;
}
.jv-dark {
  background: none;
  white-space: nowrap;
  font-size: 14px;
  font-family: Consolas, Menlo, Courier, monospace;
  margin-bottom: 25px;
}
.jv-button {
  color: #49b3ff !important;
}
.jv-dark .jv-key {
  color: #999 !important;
}
.jv-dark .jv-array {
  color: #999 !important;
}
.jv-boolean {
  color: #fc1e70 !important;
}
.jv-function {
  color: #067bca !important;
}
.jv-number {
  color: #fc1e70 !important;
}
.jv-number-float {
  color: #fc1e70 !important;
}
.jv-number-integer {
  color: #fc1e70 !important;
}
.jv-dark .jv-object {
  color: #999 !important;
}
.jv-undefined {
  color: #e08331 !important;
}
.jv-string {
  color: #42b983 !important;
  word-break: break-word;
  white-space: normal;
}
.card-body {
  padding: 1rem;
}
.table-no-padding > td {
  padding: 0 !important;
}

.backups-table td {
  position: relative;
}
td .ellipsis-wrapper {
  position: absolute;
  max-width: calc(100% - 1rem);
  line-height: calc(3rem - 8px);
  top: 0;
  left: 1rem;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.logs {
  margin: 5px;
  max-height: 392px;
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 10px;
  background-color: #000;
  color: #fff;
  font-size: 12px;
  font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
}

.input {
  min-width: 150px;
  width: 200px;
}

.input_s {
  min-width: 300px;
  width: 350px;
}

.clear-button {
  height: 100%;
}

.code-container {
  margin: 5px;
  height: 330px;
  max-width: 100vw;
  position: relative;
  background-color: #000;
  user-select: text;
  color: #fff;
  border-radius: 6px;
  border: 1px solid #e1e4e8;
  overflow: auto;
  padding: 16px;
  font-size: 12px;
  font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
  box-sizing: border-box;
  clip-path: inset(0 round 6px);
  word-wrap: break-word;
  word-break: break-all;
}

.log-entry {
  user-select: text;
  white-space: pre-wrap;
}

.line-by-line-mode .log-entry {
  cursor: pointer;
  user-select: none;
}

.line-by-line-mode .log-entry:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.line-by-line-mode .log-entry.selected {
  background-color: rgba(255, 255, 255, 0.3);
  border-left: 5px solid #007bff;
}

.line-by-line-mode .log-entry.selected:hover {
  background-color: rgba(255, 255, 255, 0.5);
}

.log-copy-button {
  position: sticky;
  top: 2px;
  float: right;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background-color: #0366d6;
  color: white;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s ease;
  z-index: 1000;
}

.log-copy-button:hover {
  background-color: #024b8e;
}

.log-copy-button:disabled {
  background-color: #6c757d;
  color: white;
}

.download-button:disabled {
  background-color: #6c757d;
  color: white;
}

.download-button {
  position: sticky;
  float: right;
  top: 2px;
  right: 8px;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background-color: #28a745;
  color: white;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s ease;
  margin-left: 15px;
}

.search_input {
  min-width: 600px;
}

.flex-container {
  display: flex;
  justify-content: space-between;
  align-items: left;
  flex-wrap: wrap;
}

.download-button:hover {
  background-color: #218838;
}

.download-button:disabled:hover {
  background-color: #6c757d;
}

.icon-tooltip {
  cursor: pointer;
  font-size: 15px;
  margin-right: 10px;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  color: #6c757d;
}

.x {
  cursor: pointer;
  font-size: 1.5rem;
  vertical-align: middle;
  color: #ff6666;
  transition: color 0.3s ease;
}

.x:hover {
  color: #cc0000;
}

.r {
  cursor: pointer;
  font-size: 30px;
  vertical-align: middle;
  color: #39ff14;
  transition: color 0.6s ease, border-color 0.6s ease, box-shadow 0.6s ease, opacity 0.6s ease, transform 0.6s ease;
  border: 2px solid #4caf50;
  padding: 4px;
  border-radius: 4px;
  box-sizing: border-box;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.r:hover {
  color: #39ff14;
  border-color: #81c784;
  box-shadow: 0 0 10px 2px rgba(129, 199, 132, 0.7);
}

.button-red:hover {
  color: #ff1414;
  border-color: #ff0000;
  box-shadow: 0 0 10px 2px rgba(211, 9, 9, 0.7);
}

.button-green:not(:disabled):hover {
  color: #39ff14;
  border-color: #81c784;
  box-shadow: 0 0 10px 2px rgba(129, 199, 132, 0.7);
}

.cb:hover {
  color: #39ff14;
  border-color: #81c784;
  box-shadow: 0 0 10px 2px rgba(129, 199, 132, 0.7);
}

.cb {
  min-width: 225px;
}

.r.disabled {
  animation: spin 2s linear infinite;
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
  border-radius: 50%;
  padding: 4px;
  width: 30px !important;
  height: 30px !important;
  box-shadow: 0 0 10px 2px rgba(129, 199, 132, 0.7);
  transition: color 0.6s ease, border-color 0.6s ease, box-shadow 0.6s ease, opacity 0.6s ease, transform 0.6s ease;
}

.container {
  max-width: 1500px;
  width: 100%;
  padding: 0;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.flex-container2 {
  height: 50%;
  justify-content: space-between;
  flex-wrap: nowrap;
  padding: 0.5vw;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1vw;
  width: 100%;
  margin: 1vh;
}

.chart-wrapper {
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  min-width: 600px;
  overflow: hidden;
  justify-content: center;
  align-items: center;
}

.chart-title-container {
  align-items: center;
  display: flex;
  margin-right: 10px;
}

.table-responsive {
  overflow-x: auto;
  box-shadow: 0px 6px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 0;
}

.table-monitoring {
  table-layout: auto;
  width: 100%;
}

.table-monitoring th, .table-monitoring td {
  white-space: nowrap;
  border: none;
  background-color: transparent;

}

.chart-title {
  margin-left: 8px;
  font-size: 18px;
  font-weight: bold;
}

.icon-large {
  font-size: 24px !important;
}

.chart-wrapper canvas {
  max-width: 100%;
  height: 100%;
}

.progress-container {
  width: 150px;
  height: 20px;
  position: relative;
  background-color: #6e6b7b;
  transition: width 0.5s;
  border-radius: 10px;
}

.progress-center-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  z-index: 10;
  pointer-events: none;
}

#my-id .tooltip-inner {
  background-color: transparent !important;
  color: #333;
  border: none !important;
  box-shadow: none !important;
  margin-right: 25px;
  margin-top: 4px;
}

#my-id .arrow {
  display: none !important;
}

@media (max-width: 1800px) {
  .charts-grid {
    grid-template-columns: 1fr;
    gap: 2vw;
    margin: 1vh 0;
  }
}

@media (min-width: 1800px) {
  .charts-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1vw;
  }

  .charts-grid > .chart-wrapper:nth-last-child(1):nth-child(odd) {
    grid-column: 1 / -1;
    justify-self: center;
    width: 100%;
  }
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: auto;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
  -webkit-appearance: textfield;
  appearance: textfield;
  padding-right: 10px;
  color: grey;
}

.b-table-sort-icon-left {
  padding-left:  20px !important;
}

.editor-container {
  overflow: hidden;
  height: 80vh;
  width: 100%;
  position: relative;
  -webkit-font-smoothing: antialiased;
}

.monaco-editor {
  -webkit-font-smoothing: antialiased;
}

.custom-modal-size {
  max-width: 800px;
}

.modal-backdrop {
  background-color: rgba(0, 0, 0, 1) !important;
}

.custom-modal-title {
  color: #fff !important;
}

.app-item {
  display: flex;
  align-items: center;
  padding: 10px;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.app-list {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}

.app-item:hover {
  background-color: var(--v-theme-surface);
  border-radius: 8px;
  box-shadow: 0 4px 8px var(--v-theme-shadow-color, rgba(0, 0, 0, 0.2));
}

.app-icon {
  margin-right: 12px;
  font-size: 1.5em;
}

.hover-icon {
  margin-right: 5px;
  font-size: 1em;
}

.app-details {
  display: flex;
  flex-direction: column;
}

.app-name {
  font-weight: bold;
}
.app-header {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}

.wrap-text-info {
  white-space: normal !important;
  overflow-wrap: break-word;
  word-break: break-word;
}

.force-mb-0 {
  margin-bottom: 0 !important;
}

.jv-container.boxed {
  border: 1px solid #eee !important;
  border-radius: 6px
}

.hidden-tab {
  display: none !important;
}

.limited-width {
  max-width: 225px;
  display: inline-block;
  text-align: center;
  word-wrap: break-word;
}

.placeholder-box {
  padding: 30px;
  border: 1px solid #ccc;
  text-align: center;
  border-radius: 8px;
  color: #888;
  margin: 20px;
}

.tab-slide-enter-active, .tab-slide-leave-active {
  transition: all 1s ease;
}
.tab-slide-enter {
  opacity: 0;
  transform: translateX(100px);
}
.tab-slide-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}

.v-tabs-pill {
  flex-wrap: nowrap; /* Prevent tabs from wrapping */
}

.v-tab--full {
  text-transform: none; /* Prevent uppercase transformation */
  text-overflow: unset !important; /* Disable ellipsis */
  white-space: nowrap !important; /* Prevent text wrapping */
  padding: 0 16px; /* Adjust padding for readability */
}

.v-tab__slider {
  display: none; /* Optional: Hide slider if it interferes */
}
</style>
