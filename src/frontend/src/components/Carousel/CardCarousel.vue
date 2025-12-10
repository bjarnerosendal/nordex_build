<template>
  <div class="carousel" :class="{ 'carousel--auto': autoScroll }" :id="carouselId.replace(/[^a-zA-Z0-9-_]/g, '')">
    <h2 v-if="title" class="carousel__title">{{ title }}</h2>
    
    <div class="carousel__container">
      <!-- CSS-only navigation inputs -->
      <input 
        v-for="(item, index) in items" 
        :key="`nav-${getItemKey(item, index)}`"
        type="radio" 
        :name="`carousel-${carouselId}`" 
        :id="`carousel-${carouselId}-${index}`"
        class="carousel__nav"
        :checked="index === 0"
      />

      <!-- Carousel content -->
      <div class="carousel__content">
        <div class="carousel__slides">
          <div 
            v-for="(item, index) in items"
            :key="getItemKey(item, index)"
            class="carousel__slide"
          >
            <slot 
              :item="item" 
              :index="index"
              name="slide"
            >
              <div class="carousel__default-card">
                <h3>{{ item.title || item.name || `Slide ${index + 1}` }}</h3>
                <p>{{ item.description || item.content || item }}</p>
              </div>
            </slot>
          </div>
        </div>

        <!-- Navigation buttons -->
        <div v-if="showControls" class="carousel__controls">
          <!-- Previous button - only show when we have slides -->
          <label 
            v-if="items.length > 1"
            class="carousel__control carousel__control--prev"
            @click="goToPrevSlide"
          >
            <span class="carousel__control-text">‹</span>
          </label>
          
          <!-- Next button - only show when we have slides -->
          <label 
            v-if="items.length > 1"
            class="carousel__control carousel__control--next"
            @click="goToNextSlide"
          >
            <span class="carousel__control-text">›</span>
          </label>
        </div>

        <!-- Dots/indicators -->
        <div v-if="showDots" class="carousel__indicators">
          <label 
            v-for="(item, index) in items"
            :key="`dot-${index}`"
            :for="`carousel-${carouselId}-${index}`"
            class="carousel__indicator"
          ></label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, nextTick, ref, withDefaults } from 'vue'

// Props with defaults
const props = withDefaults(defineProps<{
  items: any[];
  title?: string;
  showControls?: boolean;
  showDots?: boolean;
  autoScroll?: boolean;
  keyProp?: string;
}>(), {
  items: () => [],
  title: '',
  showControls: true,
  showDots: true,
  autoScroll: false,
  keyProp: undefined
})

// Generate unique carousel ID
const carouselId = computed(() => {
  return `carousel-${Math.random().toString(36).substr(2, 9)}`
})

// Current slide tracking
const currentSlide = ref(0)

// Navigation functions
const goToPrevSlide = () => {
  if (props.items.length === 0) return
  const prevIndex = currentSlide.value === 0 ? props.items.length - 1 : currentSlide.value - 1
  currentSlide.value = prevIndex
  
  // Trigger the radio button
  const radioButton = document.getElementById(`carousel-${carouselId.value}-${prevIndex}`) as HTMLInputElement
  if (radioButton) {
    radioButton.checked = true
  }
}

const goToNextSlide = () => {
  if (props.items.length === 0) return
  const nextIndex = currentSlide.value === props.items.length - 1 ? 0 : currentSlide.value + 1
  currentSlide.value = nextIndex
  
  // Trigger the radio button
  const radioButton = document.getElementById(`carousel-${carouselId.value}-${nextIndex}`) as HTMLInputElement
  if (radioButton) {
    radioButton.checked = true
  }
}

// Generate dynamic CSS for slide positioning
const dynamicCSS = computed(() => {
  if (!props.items.length) return ''
  
  let css = ''
  const totalSlides = props.items.length
  const carouselSelector = `#${carouselId.value.replace(/[^a-zA-Z0-9-_]/g, '')}`
  
  // Default positioning - show first slide
  css += `${carouselSelector} .carousel__slides { transform: translateX(0%); }\n`
  
  // Generate positioning rules for each active slide
  for (let activeIndex = 0; activeIndex < totalSlides; activeIndex++) {
    const radioSelector = `${carouselSelector} .carousel__nav:nth-of-type(${activeIndex + 1}):checked ~ .carousel__content`
    const translatePercent = -(activeIndex * 100)
    
    // Move the slides container to show the active slide
    css += `${radioSelector} .carousel__slides { transform: translateX(${translatePercent}%); }\n`
  }
  
  // Generate indicator styles
  for (let i = 0; i < totalSlides; i++) {
    css += `${carouselSelector} .carousel__nav:nth-of-type(${i + 1}):checked ~ .carousel__content .carousel__indicator:nth-child(${i + 1}) { background: white; }\n`
  }
  
  return css
})

// Helper methods
const getItemKey = (item: any, index: number): string | number => {
  if (props.keyProp && typeof item === 'object' && item[props.keyProp]) {
    return item[props.keyProp]
  }
  return index
}

const getPrevIndex = (index: number): number => {
  return index === 0 ? props.items.length - 1 : index - 1
}

const getNextIndex = (index: number): number => {
  return index === props.items.length - 1 ? 0 : index + 1
}

// Inject dynamic CSS
onMounted(() => {
  nextTick(() => {
    const styleId = `carousel-dynamic-styles-${carouselId.value}`
    let styleEl = document.getElementById(styleId)
    
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = styleId
      document.head.appendChild(styleEl)
    }
    
    styleEl.textContent = dynamicCSS.value
  })
})
</script>

<style scoped>
/* CSS-only Carousel inspired by CSS Tricks */
.carousel {
  --carousel-duration: 0.5s;
  --carousel-ease: ease-out;
  --carousel-size: 300px;
  width: 100%;
}

.carousel__title {
  text-align: center;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: var(--text-color, #333);
}

.carousel__container {
  position: relative;
  overflow: hidden;
  border-radius: 0.5rem;
}

/* Hide radio inputs */
.carousel__nav {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.carousel__content {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.carousel__slides {
  position: relative;
  width: 100%;
  display: flex;
  transition: transform var(--carousel-duration) var(--carousel-ease);
}

.carousel__slide {
  position: relative;
  width: 100%;
  flex: 0 0 100%;
  display: flex;
  align-items: center;
  justify-content: center;
 
  border-radius: 0.5rem;
 
}

.carousel__default-card {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 80%;
}

.carousel__default-card h3 {
  margin: 0 0 1rem;
  color: var(--primary-color, #007bff);
}

.carousel__default-card p {
  margin: 0;
  color: var(--text-muted, #666);
}

/* Controls */
.carousel__controls {
  position: absolute;
  top: 50%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  z-index: 10;
}

.carousel__control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  pointer-events: auto;
  opacity: 0;
  z-index: 20;
}

.carousel__control:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-50%) scale(1.1);
}

.carousel__control--prev {
  left: 1rem;
}

.carousel__control--next {
  right: 1rem;
}

.carousel__control-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color, #007bff);
}

/* Show controls when any slide is active */
.carousel__nav:checked ~ .carousel__content .carousel__control { opacity: 1; }

/* Always show controls when using click navigation */
.carousel__control { opacity: 1; }

/* Indicators/Dots */
.carousel__indicators {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  z-index: 10;
}

.carousel__indicator {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s ease;
}

.carousel__indicator:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: scale(1.2);
}

/* Active indicator styles - dynamically generated */

/* Auto-scroll animation (optional) */
.carousel--auto .carousel__nav {
  animation: carousel-auto-advance calc(var(--carousel-duration) * 8) infinite;
}

@keyframes carousel-auto-advance {
  0%, 12.5% { opacity: 0; }
  12.5%, 25% { opacity: 1; }
  25%, 100% { opacity: 0; }
}

/* Responsive design */
@media (max-width: 768px) {
  .carousel {
    --carousel-size: 200px;
  }
  
  .carousel__control {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .carousel__control-text {
    font-size: 1.2rem;
  }
  
  .carousel__control--prev {
    left: 0.5rem;
  }
  
  .carousel__control--next {
    right: 0.5rem;
  }
}

/* Custom properties for theming */
.carousel.primary {
  --primary-color: #007bff;
  --slide-bg: #e7f3ff;
}

.carousel.success {
  --primary-color: #28a745;
  --slide-bg: #d4edda;
}

.carousel.warning {
  --primary-color: #ffc107;
  --slide-bg: #fff3cd;
}

.carousel.danger {
  --primary-color: #dc3545;
  --slide-bg: #f8d7da;
}

.carousel.dark {
  --text-color: #fff;
  --slide-bg: #343a40;
}
</style>
