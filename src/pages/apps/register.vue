<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardText>
          <!-- Check if user is logged in -->
          <div v-if="!isLoggedIn">
            <VRow>
              <VCol cols="12" md="8" lg="6" class="mx-auto">
                <div class="text-center py-8">
                  <!-- Icon Container with gradient background -->
                  <div class="d-flex justify-center mb-3">
                    <VAvatar
                      size="120"
                      color="primary"
                      variant="tonal"
                      class="elevation-3 auth-icon-container"
                    >
                      <VIcon size="60" color="primary" class="auth-icon">
                        mdi-shield-lock-outline
                      </VIcon>
                    </VAvatar>
                  </div>
                  
                  <!-- Title and Description -->
                  <h1 class="text-h4 font-weight-bold mb-3">
                    Sign In Required
                  </h1>
                  
                  <p class="text-body-1 text-medium-emphasis mb-8 px-4">
                    To register and deploy applications on the Flux network, you need to authenticate with your Flux identity.
                  </p>
                  
                  <!-- Features List -->
                  <div class="d-flex justify-center mb-8">
                    <div style="display: inline-block;">
                      <div class="d-sm-flex">
                        <div class="mr-sm-8">
                          <div class="d-flex align-center mb-2">
                            <VIcon color="success" size="20" class="mr-2 flex-shrink-0">mdi-check-circle</VIcon>
                            <span class="text-body-2 text-no-wrap">Deploy distributed apps</span>
                          </div>
                          <div class="d-flex align-center mb-2">
                            <VIcon color="success" size="20" class="mr-2 flex-shrink-0">mdi-check-circle</VIcon>
                            <span class="text-body-2 text-no-wrap">Manage resources</span>
                          </div>
                        </div>
                        <div>
                          <div class="d-flex align-center mb-2">
                            <VIcon color="success" size="20" class="mr-2 flex-shrink-0">mdi-check-circle</VIcon>
                            <span class="text-body-2 text-no-wrap">Monitor performance</span>
                          </div>
                          <div class="d-flex align-center">
                            <VIcon color="success" size="20" class="mr-2 flex-shrink-0">mdi-check-circle</VIcon>
                            <span class="text-body-2 text-no-wrap">Scale globally</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Action Buttons -->
                  <div class="d-flex flex-column flex-sm-row justify-center gap-2">
                    <VBtn
                      color="primary"
                      variant="flat"
                      to="/dashboards/home"
                    >
                      <VIcon size="22" class="mr-2">mdi-login-variant</VIcon>
                      Go to Home & Sign In
                    </VBtn>
                    <VBtn
                      variant="flat"
                      href="https://runonflux.io"
                      target="_blank"
                    >
                      <VIcon size="22" class="mr-2">mdi-information-outline</VIcon>
                      Learn More
                    </VBtn>
                  </div>
                  
                  <!-- Help Text -->
                  <p class="text-caption text-medium-emphasis mt-6">
                    New to Flux? 
                    <a href="https://docs.runonflux.io" target="_blank" class="text-primary text-decoration-none">
                      Check our documentation
                    </a>
                    to get started.
                  </p>
                </div>
              </VCol>
            </VRow>
          </div>
          
          <!-- Show registration form if logged in -->
          <SubscriptionManager 
            v-else
            :app-spec="newAppSpec" 
            new-app
            :execute-local-command="executeLocalCommand" 
          />
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useFluxStore } from '@/stores/flux'
import axios from 'axios'
import { getDetectedBackendURL } from '@/utils/backend'

// Initialize flux store
const fluxStore = useFluxStore()

// Check if user is logged in
const isLoggedIn = computed(() => {
  const zelidauth = localStorage.getItem('zelidauth')
  if (!zelidauth) return false
  
  // Check if flux store has zelid, if not try to restore from localStorage
  if (!fluxStore.zelid) {
    try {
      const params = new URLSearchParams(zelidauth)
      const zelid = params.get('zelid')
      if (zelid) {
        fluxStore.setZelid(zelid)
        return true
      }
    } catch (error) {
      console.warn('Failed to restore auth state:', error)
    }
  }
  
  return !!(zelidauth && fluxStore.zelid)
})

// Create a new app specification with default values
const newAppSpec = ref({
  version: 8, // Use latest version
  name: '',
  description: '',
  owner: '',
  contacts: [],
  instances: 3,
  staticip: false,
  enterprise: '', // Empty for public apps, encrypted content for private apps
  nodes: [], // Empty for public apps, node IPs for v7 private apps
  geolocation: [],
  expire: 22000, // Default expiration
  compose: [
    {
      name: '',
      description: '',
      repotag: '',
      ports: [], // Empty ports array
      containerPorts: [], // Add containerPorts array
      domains: [],
      environmentParameters: [],
      commands: [],
      containerPort: 80,
      containerData: '',
      cpu: 0.1,
      ram: 128,
      hdd: 1,
      tiered: false,
      repoauth: '',
      secrets: '',
    },
  ],
})

// Execute local command function
async function executeLocalCommand(
  command,
  postObject = null,
  axiosConfigAux = null,
  skipCache = false,
) {
  try {
    const zelidauth = localStorage.getItem("zelidauth")
    
    if (!zelidauth) {
      throw new Error('Authentication required. Please log in first.')
    }

    const axiosConfig = {
      headers: {
        zelidauth,
        ...(skipCache && { "x-apicache-bypass": "true" }),
        ...(axiosConfigAux?.headers || {}),
      },
    }
    
    // Add any additional config options except headers and timeout (already handled above)
    if (axiosConfigAux) {
      const { headers, timeout, ...otherConfig } = axiosConfigAux
      Object.assign(axiosConfig, otherConfig)
    }

    // Use the backend URL from localStorage or auto-detect it
    const backendURL = localStorage.getItem("backendURL") || getDetectedBackendURL()
    const queryUrl = `${backendURL}${command}`
    
    console.log('Executing command:', command, 'URL:', queryUrl)
    console.log('Backend URL:', backendURL)
    console.log('From localStorage:', localStorage.getItem("backendURL"))
    console.log('Auto-detected:', getDetectedBackendURL())
    console.log('Using zelidauth:', zelidauth ? 'Present' : 'Missing')
    console.log('Headers:', axiosConfig.headers)

    const result = postObject
      ? await axios.post(queryUrl, postObject, axiosConfig)
      : await axios.get(queryUrl, axiosConfig)
      
    console.log('Command result:', result.data)
    return result
  } catch (error) {
    console.error('Command execution failed:', error, 'Command:', command)
    console.error('Full error response:', error.response?.data)
    throw error
  }
}

onMounted(() => {
  // Restore authentication state and set owner
  const zelidauth = localStorage.getItem('zelidauth')
  console.log('zelidauth from localStorage:', zelidauth)
  
  if (zelidauth) {
    try {
      // Parse the zelidauth which is in query string format
      const params = new URLSearchParams(zelidauth)
      const zelid = params.get('zelid')
      const privilege = params.get('privilege')
      const loginType = params.get('logintype')
      
      console.log('Parsed auth data:', { zelid, privilege, loginType })
      
      if (zelid) {
        // Restore flux store state
        fluxStore.setZelid(zelid)
        if (privilege) fluxStore.setPrivilege(privilege)
        if (loginType) fluxStore.setLoginType(loginType)
        
        // Set as owner
        newAppSpec.value.owner = zelid
        console.log('Set newAppSpec.owner to:', zelid)
      }
    } catch (error) {
      console.warn('Failed to restore authentication state:', error)
    }
  }
  
  // Fallback: check flux store for zelid
  if (!newAppSpec.value.owner && fluxStore.zelid) {
    newAppSpec.value.owner = fluxStore.zelid
    console.log('Set owner from flux store:', fluxStore.zelid)
  }
  
  console.log('Final newAppSpec.owner:', newAppSpec.value.owner)
})
</script>

<style scoped>
/* Avatar container animation */
.auth-icon-container {
  animation: float 3s ease-in-out infinite;
  transition: transform 0.3s ease;
}

.auth-icon-container:hover {
  transform: scale(1.1);
}

/* Icon pulse animation */
.auth-icon {
  animation: pulse 2s ease-in-out infinite;
}

/* Float animation */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Pulse animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(0.95);
  }
}

/* Alternative: Glow effect animation */
.auth-icon-container {
  position: relative;
}

.auth-icon-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.4) 0%, transparent 70%);
  animation: glow 3s ease-in-out infinite;
  z-index: -1;
}

@keyframes glow {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}
</style>
