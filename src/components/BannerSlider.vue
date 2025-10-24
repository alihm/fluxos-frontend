<template>
  <div class="banner-slider-container mb-6">
    <div class="carousel-wrapper">
      <div
        v-for="(banner, index) in banners"
        :key="index"
        class="carousel-slide" :class="[{ active: currentSlide === index, prev: prevSlide === index }]"
      >
        <div class="puzzle-grid">
          <div
            v-for="i in puzzlePieces"
            :key="i"
            class="puzzle-piece"
            :style="getPuzzleStyle(i, banner.image)"
          />
        </div>
      </div>

      <div class="carousel-controls">
        <button class="carousel-arrow carousel-arrow-prev" @click="prevSlideAction">
          <VIcon>mdi-chevron-left</VIcon>
        </button>
        <button class="carousel-arrow carousel-arrow-next" @click="nextSlideAction">
          <VIcon>mdi-chevron-right</VIcon>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const currentSlide = ref(0)
const prevSlide = ref(null)
const forceUpdate = ref(0)
let autoPlayInterval = null
let resizeTimeout = null

// Compute puzzle pieces based on screen size
const puzzlePieces = computed(() => {
  forceUpdate.value // trigger reactivity
  
  return window.innerWidth <= 600 ? 36 : 64 // 6x6 for mobile, 8x8 for desktop
})

const gridSize = computed(() => {
  forceUpdate.value // trigger reactivity
  
  return window.innerWidth <= 600 ? 6 : 8
})

// Dynamically load all banners from public/banner directory
const banners = ref([])

const loadBanners = () => {
  const bannerFiles = [
    'FluxCloud.png',
    'FluxAI.png',
    'FluxDrive.png',
    'FluxEdge.png',
    'FluxMarketplace.png',
    'WordPressonFluxCloud.png',
  ]

  banners.value = bannerFiles.map(file => ({
    image: `/banner/${file}`,
  }))
}

const getPuzzleStyle = (index, imageUrl) => {
  const cols = gridSize.value
  const rows = gridSize.value
  const pieceIndex = index - 1
  const row = Math.floor(pieceIndex / cols)
  const col = pieceIndex % cols

  // Calculate exact pixel position to offset the background
  const xPercent = (col * 100) / (cols - 1)
  const yPercent = (row * 100) / (rows - 1)

  return {
    backgroundImage: `url(${imageUrl})`,
    backgroundPosition: `${xPercent}% ${yPercent}%`,
    transitionDelay: `${Math.random() * 0.6}s`,
  }
}

const nextSlideAction = () => {
  prevSlide.value = currentSlide.value
  currentSlide.value = (currentSlide.value + 1) % banners.value.length
  setTimeout(() => {
    prevSlide.value = null
  }, 1200)
}

const prevSlideAction = () => {
  prevSlide.value = currentSlide.value
  currentSlide.value = currentSlide.value === 0 ? banners.value.length - 1 : currentSlide.value - 1
  setTimeout(() => {
    prevSlide.value = null
  }, 1200)
}

const startAutoPlay = () => {
  autoPlayInterval = setInterval(() => {
    nextSlideAction()
  }, 6000)
}

const handleResize = () => {
  // Clear existing timeout
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }

  // Debounce resize to avoid too many recalculations
  resizeTimeout = setTimeout(() => {
    forceUpdate.value++
  }, 200)
}

onMounted(() => {
  loadBanners()
  startAutoPlay()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval)
  }
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.banner-slider-container {
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
  position: relative;
}

.banner-slider-container:hover {
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.18);
}

.carousel-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  max-height: 600px;
  overflow: hidden;
  border-radius: 16px;
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
}

.carousel-slide.active {
  opacity: 1;
  z-index: 2;
  pointer-events: auto;
}

.carousel-slide.prev {
  opacity: 1;
  z-index: 1;
}

.puzzle-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  width: 100%;
  height: 100%;
}

.puzzle-piece {
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-size: 800% 800%;
  opacity: 0;
  transform: scale(0.8) rotate(45deg);
  transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

.carousel-slide.active .puzzle-piece {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

.carousel-slide.prev .puzzle-piece {
  opacity: 0;
  transform: scale(1.2) rotate(-45deg);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Carousel Controls */
.carousel-controls {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 10;
  pointer-events: none;
}

.carousel-arrow {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: 0.6;
  pointer-events: auto;
}

.carousel-arrow:hover {
  background: rgba(255, 255, 255, 0.35);
  opacity: 1;
  transform: scale(1.15);
}

.carousel-arrow :deep(.v-icon) {
  font-size: 32px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .carousel-controls {
    display: none;
  }

  .puzzle-grid {
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(6, 1fr);
  }

  .puzzle-piece {
    background-size: 600% 600%;
  }
}
</style>
