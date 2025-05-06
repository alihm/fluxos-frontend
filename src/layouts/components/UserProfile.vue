<script setup>
import { PerfectScrollbar } from "vue3-perfect-scrollbar"
import { useFluxStore } from "@/stores/flux"
import IDService from "@/services/IDService"
import qs from "qs"
import { useRoute, useRouter } from "vue-router"
import { eventBus } from "@/utils/eventBus"

const route = useRoute()
const router = useRouter()
const fluxStore = useFluxStore()
const { privilege } = storeToRefs(fluxStore)

const auth = computed(() => {
  const zelidauth = localStorage.getItem("zelidauth")

  if (zelidauth) {
    try {
      return qs.parse(zelidauth)
    } catch (error) {
      return {}
    }
  }

  return {}
})

// TODO: Get type from backend
const userData = {
  id: 1,
  fullName: "John Doe",
  username: "johndoe",
  password: "admin",
  avatar: `${import.meta.env.BASE_URL ?? "/"}images/logo.png`,
  email: "admin@demo.com",
}

const logout = async () => {
  const zelidauth = localStorage.getItem("zelidauth")

  // Clear local storage and reset store state
  localStorage.removeItem("zelidauth")
  fluxStore.setPrivilege("none")
  fluxStore.setZelid("")

  try {
    // Call the logout API
    const response = await IDService.logoutCurrentSession(zelidauth)

    if (response.data.status === "error") {
      console.error(response.data.data.message)
    } else {
      console.log("Logout successful:", response.data.data.message)

      // If the user is already on the root path '/', trigger onMounted
      if (route.path === "/") {
        // reload
        eventBus.emit("getZelIdLoginPhrase")
      } else {
        // Otherwise, navigate to '/'
        await router.push("/")
      }
    }
  } catch (error) {
    console.error("API error during logout:", error)
  }

  // Log out from Firebase
  try {
    await firebase.auth().signOut()
    console.log("Firebase logged out successfully.")
  } catch (error) {
    console.error("Error during Firebase logout:", error)
  }
}

const userProfileList = [
  { type: "divider" },
  {
    type: "navItem",
    icon: "tabler-user",
    title: "Profile",
  },
  {
    type: "navItem",
    icon: "tabler-settings",
    title: "Settings",
  },
  {
    type: "navItem",
    icon: "tabler-file-dollar",
    title: "Billing Plan",
    badgeProps: {
      color: "error",
      content: "4",
    },
  },
  { type: "divider" },
  {
    type: "navItem",
    icon: "tabler-currency-dollar",
    title: "Pricing",
  },
  {
    type: "navItem",
    icon: "tabler-question-mark",
    title: "FAQ",
  },
]
</script>

<template>
  <VBadge
    v-if="privilege !== 'none'"
    dot
    bordered
    location="bottom right"
    offset-x="1"
    offset-y="2"
    color="success"
  >
    <VAvatar
      size="38"
      class="cursor-pointer"
      :color="!(userData && userData.avatar) ? 'primary' : undefined"
      :variant="!(userData && userData.avatar) ? 'tonal' : undefined"
    >
      <VImg
        v-if="userData && userData.avatar"
        :src="userData.avatar"
      />
      <VIcon
        v-else
        icon="tabler-user"
      />

      <!-- SECTION Menu -->
      <VMenu
        activator="parent"
        width="240"
        location="bottom end"
        offset="12px"
      >
        <VList>
          <VListItem>
            <div class="d-flex gap-2 align-center">
              <VListItemAction>
                <VBadge
                  dot
                  location="bottom right"
                  offset-x="3"
                  offset-y="3"
                  color="success"
                  bordered
                >
                  <VAvatar
                    :color="!(userData && userData.avatar) ? 'primary' : undefined"
                    :variant="!(userData && userData.avatar) ? 'tonal' : undefined"
                  >
                    <VImg
                      v-if="userData && userData.avatar"
                      :src="userData.avatar"
                    />
                    <VIcon
                      v-else
                      icon="tabler-user"
                    />
                  </VAvatar>
                </VBadge>
              </VListItemAction>

              <div>
                <div class="text-h6 font-weight-medium">
                  {{ (auth?.zelid ?? "").slice(0, 14) + (auth?.zelid ? "..." : "") }}
                </div>
                <VListItemSubtitle class="text-capitalize text-disabled">
                  {{ privilege }}
                </VListItemSubtitle>
              </div>
            </div>
          </VListItem>

          <PerfectScrollbar :options="{ wheelPropagation: false }">
            <template
              v-for="item in userProfileList"
              :key="item.title"
            >
              <VListItem
                v-if="item.type === 'navItem'"
                :to="item.to"
              >
                <template #prepend>
                  <VIcon
                    :icon="item.icon"
                    size="22"
                  />
                </template>

                <VListItemTitle>{{ item.title }}</VListItemTitle>

                <template
                  v-if="item.badgeProps"
                  #append
                >
                  <VBadge
                    rounded="sm"
                    class="me-3"
                    v-bind="item.badgeProps"
                  />
                </template>
              </VListItem>

              <VDivider
                v-else
                class="my-2"
              />
            </template>

            <div class="px-4 py-2">
              <VBtn
                block
                size="small"
                color="error"
                append-icon="tabler-logout"
                @click="logout"
              >
                Logout
              </VBtn>
            </div>
          </PerfectScrollbar>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>
