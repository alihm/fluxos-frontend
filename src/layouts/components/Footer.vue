<template>
  <div class="h-100 d-flex align-center justify-md-space-between justify-center w-100">
    <!-- 👉 Desktop layout -->
    <div class="d-none d-md-flex w-100 align-center justify-space-between">
      <!-- Left -->
      <span class="d-flex align-center text-medium-emphasis">
        <a
          href="https://github.com/runonflux/flux"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary ms-1"
        >
          Flux, Your Gateway to a Decentralized World
        </a>
      </span>
    </div>

    <!-- 👉 Mobile layout -->
    <div
      class="d-flex d-md-none w-100 justify-center"
      style="height: 80%"
      color="primary"
    >
      <a
        href="https://github.com/runonflux/flux"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary text-caption text-decoration-none"
        style="display: flex; flex-direction: column; align-items: center;"
      >
        Flux, Your Gateway to a Decentralized World
      </a>
    </div>
  </div>
</template>


<script setup>
import FluxService from '@/services/FluxService'
import { useFluxStore } from "@/stores/flux"

const fluxStore = useFluxStore()
const { fluxVersion } = storeToRefs(fluxStore)

onMounted(() => {

  FluxService.getFluxVersion()
    .then(response => {
      const version = response.data.data

      fluxVersion.value = version
    })
    .catch(e => {
      console.log(e)
      console.log(e.code)
    })

})
</script>
