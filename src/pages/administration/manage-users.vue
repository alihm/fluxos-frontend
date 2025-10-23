<template>
  <div>
    <!-- Page Header -->
    <div class="mb-3">
      <div class="d-flex align-center mb-2">
        <VAvatar color="primary" variant="flat" size="48" class="mr-3">
          <VIcon icon="mdi-account-group" size="32" color="white" />
        </VAvatar>
        <div>
          <h2 class="text-h5 font-weight-bold">{{ t('pages.administration.manageUsers.title') }}</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            {{ t('pages.administration.manageUsers.subtitle') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Users Section -->
    <VCard elevation="1">
      <VCardText class="pa-3">
        <VRow class="mb-3">
          <VCol cols="12" md="6">
            <VTextField
              v-model="usersSearch"
              :label="t('pages.administration.manageUsers.searchUsers')"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            >
              <template #prepend-inner>
                <VIcon icon="mdi-magnify" size="22" />
              </template>
            </VTextField>
          </VCol>
          <VCol cols="12" md="6" class="d-flex justify-end align-center">
            <VBtn
              color="primary"
              variant="flat"
              @click="loadUsers"
            >
              <VIcon icon="mdi-refresh" size="22" class="mr-2" />
              {{ t('pages.administration.manageUsers.refresh') }}
            </VBtn>
          </VCol>
        </VRow>

        <VCard variant="outlined">
          <VDataTable
            :headers="translatedUsersHeaders"
            :items="users"
            :search="usersSearch"
            :loading="usersLoading"
            item-value="zelid"
            hover
            show-expand
            v-model:expanded="expanded"
            class="compact-table"
          >
            <template #[`item.data-table-expand`]="{ item, internalItem, isExpanded, toggleExpand }">
              <VAvatar
                size="32"
                variant="tonal"
                color="grey"
                @click="() => toggleExpand(internalItem)"
                style="cursor: pointer;"
              >
                <VIcon :icon="isExpanded(internalItem) ? 'mdi-chevron-down' : 'mdi-chevron-right'" size="20" />
              </VAvatar>
            </template>
            <template #item.zelid="{ item }">
              <div class="d-flex align-center py-2">
                <VAvatar color="primary" variant="flat" size="32" class="mr-3">
                  <VIcon icon="mdi-fingerprint" size="18" color="white" />
                </VAvatar>
                <span class="text-body-2 font-weight-medium">{{ item.zelid }}</span>
              </div>
            </template>

            <template #item.loginPhrase="{ item }">
              <span class="text-body-2 font-weight-medium">{{ item.loginPhrase }}</span>
            </template>

            <template #item.actions="{ item }">
              <div class="d-flex align-center justify-end gap-2">
                <VTooltip location="top" v-if="item.loginPhrase === currentLoginPhrase">
                  <template #activator="{ props }">
                    <VIcon v-bind="props" icon="mdi-information-outline" color="info" size="20" />
                  </template>
                  <span>{{ t('pages.administration.manageUsers.yourCurrentSession') }}</span>
                </VTooltip>
                <VBtn
                  size="small"
                  color="error"
                  variant="flat"
                  prepend-icon="mdi-logout"
                  @click="confirmLogoutUser(item)"
                >
                  {{ t('pages.administration.manageUsers.logOut') }}
                </VBtn>
              </div>
            </template>

            <template #expanded-row="{ columns, item }">
              <tr>
                <td :colspan="columns.length" class="pa-4 bg-surface">
                  <div class="text-subtitle-2 font-weight-medium mb-3 d-flex align-center">
                    <VIcon icon="mdi-view-list" size="18" class="mr-2" />
                    {{ t('pages.administration.manageUsers.activeSessions') }}
                  </div>
                  <VCard variant="outlined">
                    <VList class="py-0">
                      <VListItem
                        v-for="(session, index) in getUserSessions(item.zelid)"
                        :key="session.loginPhrase"
                        class="px-4"
                      >
                        <div class="d-flex align-center justify-space-between w-100 py-2">
                          <div class="d-flex align-center">
                            <VAvatar color="success" variant="tonal" size="32" class="mr-3">
                              <VIcon icon="mdi-key-variant" size="18" />
                            </VAvatar>
                            <span class="text-body-2 font-weight-medium">{{ session.loginPhrase }}</span>
                          </div>
                          <div class="d-flex align-center gap-2">
                            <VTooltip location="top" v-if="session.loginPhrase === currentLoginPhrase">
                              <template #activator="{ props }">
                                <VChip v-bind="props" size="small" variant="tonal" color="info" prepend-icon="mdi-information-outline">
                                  {{ t('pages.administration.manageUsers.current') }}
                                </VChip>
                              </template>
                              <span>{{ t('pages.administration.manageUsers.yourCurrentSession') }}</span>
                            </VTooltip>
                            <VBtn
                              size="small"
                              color="error"
                              variant="flat"
                              prepend-icon="mdi-logout"
                              @click="confirmLogoutUser(session)"
                            >
                              {{ t('pages.administration.manageUsers.logOut') }}
                            </VBtn>
                          </div>
                        </div>
                        <VDivider v-if="index < getUserSessions(item.zelid).length - 1" />
                      </VListItem>
                    </VList>
                  </VCard>
                </td>
              </tr>
            </template>

            <template #bottom>
              <div class="text-center pa-4 border-t">
                <VBtn
                  color="error"
                  variant="flat"
                  size="default"
                  @click="confirmLogoutAllUsers"
                >
                  <VIcon icon="mdi-account-multiple-remove" size="22" class="mr-2" />
                  {{ t('pages.administration.manageUsers.logOutAllUsers') }}
                </VBtn>
              </div>
            </template>
          </VDataTable>
        </VCard>
      </VCardText>
    </VCard>

    <!-- Confirmation Dialogs -->
    <VDialog v-model="logoutUserDialog" max-width="500">
      <VCard>
        <VCardTitle class="d-flex align-center pa-3 bg-primary">
          <VIcon icon="mdi-account-remove" size="28" color="white" class="mr-2" />
          <span class="text-white">{{ t('pages.administration.manageUsers.confirmLogoutUser') }}</span>
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-3">
          <VAlert type="warning" variant="tonal" class="mb-2">
            {{ t('pages.administration.manageUsers.logoutUserWarning') }}
          </VAlert>
          {{ t('pages.administration.manageUsers.areYouSureProceed') }}
        </VCardText>
        <VCardActions class="pa-3 pt-0">
          <VSpacer />
          <VBtn color="error" variant="flat" size="small" @click="logoutUserDialog = false">{{ t('pages.administration.manageUsers.cancel') }}</VBtn>
          <VBtn color="primary" variant="flat" size="small" @click="logoutUser">{{ t('pages.administration.manageUsers.logOut') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <VDialog v-model="logoutAllUsersDialog" max-width="500">
      <VCard>
        <VCardTitle class="d-flex align-center pa-3 bg-primary">
          <VIcon icon="mdi-account-multiple-remove" size="28" color="white" class="mr-2" />
          <span class="text-white">{{ t('pages.administration.manageUsers.confirmLogoutAllUsers') }}</span>
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-3">
          <VAlert type="error" variant="tonal" class="mb-2">
            {{ t('pages.administration.manageUsers.logoutAllUsersWarning') }}
          </VAlert>
          {{ t('pages.administration.manageUsers.areYouSureProceed') }}
        </VCardText>
        <VCardActions class="pa-3 pt-0">
          <VSpacer />
          <VBtn color="error" variant="flat" size="small" @click="logoutAllUsersDialog = false">{{ t('pages.administration.manageUsers.cancel') }}</VBtn>
          <VBtn color="primary" variant="flat" size="small" @click="logoutAllUsers">{{ t('pages.administration.manageUsers.logOutAll') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSnackbar } from '@/composables/useSnackbar'
import { useFluxStore } from '@/stores/flux'
import IDService from '@/services/IDService'
import qs from 'qs'

const router = useRouter()
const { t } = useI18n()
const { showSnackbar } = useSnackbar()
const fluxStore = useFluxStore()

// Users data
const users = ref([])
const sessions = ref([])
const usersSearch = ref('')
const usersLoading = ref(false)
const expanded = ref([])

// Translated headers computed property
const translatedUsersHeaders = computed(() => [
  { title: '', key: 'data-table-expand', sortable: false, width: '48px' },
  { title: t('pages.administration.manageUsers.table.fluxId'), key: 'zelid', sortable: true },
  { title: t('pages.administration.manageUsers.table.loginPhrase'), key: 'loginPhrase', sortable: true },
  { title: '', key: 'actions', sortable: false, align: 'end' },
])

// Dialog states
const logoutUserDialog = ref(false)
const logoutAllUsersDialog = ref(false)
const selectedItem = ref(null)

// Get current login phrase
const currentLoginPhrase = computed(() => {
  const zelidauth = localStorage.getItem('zelidauth')
  if (!zelidauth) return ''
  const auth = qs.parse(zelidauth)

  return auth.loginPhrase || ''
})

// Get sessions for a specific user
const getUserSessions = zelid => {
  return sessions.value.filter(session => session.zelid === zelid)
}

// Load users
const loadUsers = async () => {
  usersLoading.value = true
  try {
    const zelidauth = localStorage.getItem('zelidauth')
    const [usersResponse, sessionsResponse] = await Promise.all([
      IDService.loggedUsers(zelidauth),
      IDService.loggedSessions(zelidauth),
    ])

    if (usersResponse.data.status === 'error') {
      showSnackbar(usersResponse.data.data.message || usersResponse.data.data, 'error', 3000, 'mdi-alert-circle')
    } else {
      users.value = usersResponse.data.data
    }

    if (sessionsResponse.data.status === 'error') {
      showSnackbar(sessionsResponse.data.data.message || sessionsResponse.data.data, 'error', 3000, 'mdi-alert-circle')
    } else {
      sessions.value = sessionsResponse.data.data
    }
  } catch (error) {
    console.error(error)
    showSnackbar(t('pages.administration.manageUsers.errors.failedToLoadUsers'), 'error', 3000, 'mdi-alert-circle')
  } finally {
    usersLoading.value = false
  }
}

// Confirm logout user
const confirmLogoutUser = item => {
  selectedItem.value = item
  logoutUserDialog.value = true
}

// Logout user
const logoutUser = async () => {
  logoutUserDialog.value = false
  try {
    const zelidauth = localStorage.getItem('zelidauth')
    const response = await IDService.logoutSpecificSession(zelidauth, selectedItem.value.loginPhrase)

    if (response.data.status === 'error') {
      showSnackbar(response.data.data.message || response.data.data, 'error', 3000, 'mdi-alert-circle')
    } else {
      showSnackbar(response.data.data.message || response.data.data, 'success', 3000, 'mdi-check-circle')

      // If logging out current session, redirect to home
      if (selectedItem.value.loginPhrase === currentLoginPhrase.value) {
        localStorage.removeItem('zelidauth')
        fluxStore.setPrivilege('none')
        fluxStore.setZelid('')
        router.replace('/')
      } else {
        loadUsers()
      }
    }
  } catch (error) {
    console.error(error)
    showSnackbar(t('pages.administration.manageUsers.errors.failedToLogoutUser'), 'error', 3000, 'mdi-alert-circle')
  }
}

// Confirm logout all users
const confirmLogoutAllUsers = () => {
  logoutAllUsersDialog.value = true
}

// Logout all users
const logoutAllUsers = async () => {
  logoutAllUsersDialog.value = false
  try {
    const zelidauth = localStorage.getItem('zelidauth')
    const response = await IDService.logoutAllUsers(zelidauth)

    if (response.data.status === 'error') {
      showSnackbar(response.data.data.message || response.data.data, 'error', 3000, 'mdi-alert-circle')
    } else {
      showSnackbar(response.data.data.message || response.data.data, 'success', 3000, 'mdi-check-circle')
      localStorage.removeItem('zelidauth')
      fluxStore.setPrivilege('none')
      fluxStore.setZelid('')
      router.replace('/')
    }
  } catch (error) {
    console.error(error)
    showSnackbar(t('pages.administration.manageUsers.errors.failedToLogoutAllUsers'), 'error', 3000, 'mdi-alert-circle')
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<route lang="yaml">
meta:
  privilege:
    - admin
    - fluxteam
</route>

<style scoped>
.compact-table :deep(td:first-child),
.compact-table :deep(th:first-child) {
  padding-left: 8px !important;
  padding-right: 4px !important;
}

.compact-table :deep(td:last-child),
.compact-table :deep(th:last-child) {
  padding-right: 12px !important;
}

.compact-table :deep(thead th) {
  height: 48px !important;
  background-color: rgba(var(--v-theme-on-surface), 0.1) !important;
}
</style>
