<template>
  <VDialog
    v-model="isOpen"
    max-width="900"
    persistent
    rounded="xl"
  >
    <VCard rounded="xl" elevation="24" class="login-dialog-card">
      <VCardTitle class="d-flex align-center justify-space-between bg-primary pa-4" style="color: white !important;">
        <div class="d-flex align-center">
          <VIcon icon="mdi-login" class="me-3" color="white" size="28" />
          <span class="text-h5" style="color: white !important;">{{ title || 'Login Required' }}</span>
        </div>
        <VBtn
          icon="mdi-close"
          variant="text"
          size="small"
          color="white"
          @click="close"
        />
      </VCardTitle>
      <VCardText class="pa-6">
        <VAlert
          v-if="message"
          type="info"
          variant="tonal"
          class="mb-4"
        >
          <div class="d-flex align-center">
            {{ message }}
          </div>
        </VAlert>
        <Login hideManualLogin @loginSuccess="handleLoginSuccess" />
      </VCardText>
    </VCard>
  </VDialog>
</template>

<script setup>
import { computed } from 'vue'
import Login from '@/@core/components/Login.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Login Required',
  },
  message: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'loginSuccess', 'cancel'])

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const close = () => {
  console.log('[LoginDialog] close() called - emitting cancel')
  isOpen.value = false
  emit('cancel')
}

const handleLoginSuccess = () => {
  console.log('[LoginDialog] handleLoginSuccess() - user logged in successfully')
  console.log('[LoginDialog] Emitting loginSuccess event')
  emit('loginSuccess')
  console.log('[LoginDialog] Closing dialog without emitting cancel')
  isOpen.value = false
}
</script>

<style scoped>
/* Login Dialog Enhanced 3D Effect */
.login-dialog-card {
  box-shadow:
    0 30px 90px rgba(0, 0, 0, 0.5),
    0 20px 50px rgba(0, 0, 0, 0.4),
    0 10px 25px rgba(0, 0, 0, 0.35),
    0 5px 10px rgba(0, 0, 0, 0.25) !important;
  transform: translateZ(50px);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

.login-dialog-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 50%);
  pointer-events: none;
  z-index: 1;
}

.login-dialog-card:hover {
  box-shadow:
    0 40px 120px rgba(0, 0, 0, 0.6),
    0 25px 65px rgba(0, 0, 0, 0.5),
    0 15px 35px rgba(0, 0, 0, 0.4),
    0 8px 15px rgba(0, 0, 0, 0.3) !important;
  transform: translateY(-4px) translateZ(60px) scale(1.01);
}

/* 3D Effect for cards inside Login dialog */
.login-dialog-card :deep(.v-card) {
  box-shadow:
    0 25px 70px rgba(0, 0, 0, 0.4),
    0 15px 40px rgba(0, 0, 0, 0.35),
    0 8px 20px rgba(0, 0, 0, 0.3) !important;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transform: translateZ(20px);
  transition: all 0.3s ease;
  position: relative;
}

.login-dialog-card :deep(.v-card)::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 60%);
  pointer-events: none;
}

.login-dialog-card :deep(.v-card):hover {
  box-shadow:
    0 30px 85px rgba(0, 0, 0, 0.45),
    0 18px 48px rgba(0, 0, 0, 0.38),
    0 10px 25px rgba(0, 0, 0, 0.32) !important;
  transform: translateY(-2px) translateZ(25px);
}
</style>
