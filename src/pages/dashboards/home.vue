<template>
  <StatusBar />
  <div
    fluid
    class="mb-6"
  >
    <VRow justify="center">
      <VCol
        v-for="section in sections"
        :key="section.title"
        cols="12"
        sm="6"
        md="6"
        lg="3"
      >
        <VCard class="responsive-card rounded-xl elevation-4 pa-4 hover-scale">
          <div class="d-flex flex-column align-center text-center">
            <VIcon
              :icon="section.icon"
              size="64"
              color="primary"
              class="mb-3"
            />
            <div class="text-h6 font-weight-medium mb-2">
              {{ section.title }}
            </div>
            <div class="text-body-2 text-secondary">
              {{ section.description }}
            </div>
          </div>
        </VCard>
      </VCol>
    </VRow>
  </div>
  <Login />
</template>

<script setup>
import StatusBar from "@core/components/StatusBar.vue"
import { useI18n } from "vue-i18n"

const { t } = useI18n()

const sections = computed(() => [
  {
    title: t("sections.dashboard.title"),
    icon: "tabler-device-desktop",
    description: t("sections.dashboard.description"),
  },
  {
    title: t("sections.application.title"),
    icon: "mdi-apps",
    description: t("sections.application.description"),
  },
  {
    title: t("sections.administration.title"),
    icon: "mdi-shield-account",
    description: t("sections.administration.description"),
  },
  {
    title: t("sections.flux_xdao.title"),
    icon: "mdi-account-group",
    description: t("sections.flux_xdao.description"),
  },
])
</script>

<style scoped>
/* Adjust card size */
.responsive-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
  height: 100%;
}
</style>
