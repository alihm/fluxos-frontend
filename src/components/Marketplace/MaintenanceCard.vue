<template>
  <VRow class="ma-0 justify-center" :style="{ marginTop: marginTop }">
    <VCol cols="12" md="10" lg="8">
      <VCard class="text-center pa-8 maintenance-card">
        <VAvatar size="120" class="mx-auto mb-6 maintenance-avatar">
          <VIcon icon="mdi-tools" size="80" color="warning" />
        </VAvatar>
        <h2 class="text-h3 font-weight-bold mb-4 maintenance-title" style="white-space: pre-line;">{{ title }}</h2>
        <div class="maintenance-text-box mb-8">
          <div class="maintenance-subtitle-box mb-4">
            <VIcon icon="mdi-alert-circle-outline" size="24" class="subtitle-icon" />
            <p class="text-h6 font-weight-regular maintenance-subtitle">
              {{ subtitle }}
            </p>
          </div>
          <div class="maintenance-description-box">
            <VIcon icon="mdi-information-outline" size="24" class="description-icon" />
            <p class="text-body-1 maintenance-description">
              {{ description }}
            </p>
          </div>
        </div>
        <VBtn
          color="primary"
          size="large"
          @click="$emit('retry')"
          :loading="loading"
          class="maintenance-btn"
        >
          <VIcon start icon="mdi-refresh" />
          Refresh
        </VBtn>
      </VCard>
    </VCol>
  </VRow>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'Under Maintenance',
  },
  subtitle: {
    type: String,
    default: "We're currently experiencing technical difficulties. Our team is working to resolve this issue as quickly as possible.",
  },
  description: {
    type: String,
    default: 'Please check back later or contact support if you need immediate assistance.',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  marginTop: {
    type: String,
    default: '0px',
  },
})

defineEmits(['retry'])
</script>

<style scoped>
.maintenance-card {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.maintenance-avatar {
  background: rgba(var(--v-theme-warning), 0.1);
}

.maintenance-title {
  color: rgb(var(--v-theme-on-surface));
}

.maintenance-text-box {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.maintenance-subtitle-box {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  text-align: left;
}

.subtitle-icon {
  flex-shrink: 0;
  margin-top: 2px;
  color: rgb(var(--v-theme-warning));
}

.maintenance-subtitle {
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.85;
  margin: 0;
  text-align: left;
  font-size: 1rem;
  font-weight: 400;
}

.maintenance-description-box {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  text-align: left;
}

.description-icon {
  flex-shrink: 0;
  margin-top: 2px;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.6;
}

.maintenance-description {
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.85;
  margin: 0;
  text-align: left;
  font-size: 1rem;
  font-weight: 400;
}

.maintenance-btn {
  min-width: 160px;
  font-weight: 600;
}
</style>
