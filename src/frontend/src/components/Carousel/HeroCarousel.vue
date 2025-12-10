<template>
  <div class="hero-carousel">
    <CardCarousel
      :items="heroItems"
      :title="title"
      :show-controls="true"
      :show-dots="false"
      :auto-scroll="autoScroll"
      class="hero-carousel-wrapper"
    >
      <template #slide="{ item }">
        <div class="hero-slide" :style="getSlideBackground(item)">
          <div class="hero-slide-overlay"></div>
          <div class="hero-slide-content">
            <div class="container">
              <div class="row">
                <div class="col-lg-7  text-left">
                  <h2 v-if="item.subheading" class="hero-subheading text-uppercase h4 mb-4 text-muted">
                    {{ item.subheading }}
                  </h2>
                  <h1 v-if="item.headline" class="hero-headline display-3 fw-bold mb-4 text-uppercase font-weight-black ">
                    {{ item.headline }}
                  </h1>
              
                  <div v-if="item.description" class="hero-description lead mb-4" v-html="item.description"></div>
                  <div v-if="item.link && item.link.length > 0" class="hero-actions">
                    <a 
                      v-for="link in item.link" 
                      :key="link.url"
                      :href="link.url" 
                      :target="link.target"
                      class="btn btn-primary btn-lg me-3"
                    >
                      {{ link.name || 'Learn More' }}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </CardCarousel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CardCarousel from './CardCarousel.vue'

// Props
const props = defineProps<{
  heroItems?: HeroCarouselItem[]
  title?: string
  autoScroll?: boolean
}>()

// Types
interface HeroCarouselItem {
  headline?: string
  subheading?: string
  description?: string
  heroImage?: {
    url: string
    alt?: string
  }
  link?: Array<{
    url: string
    name: string
    target?: string
  }>
}

// Computed properties
const heroItems = computed(() => props.heroItems || [])

// Methods
const getSlideBackground = (item: HeroCarouselItem) => {
  if (item.heroImage?.url) {
    return {
      backgroundImage: `url(${item.heroImage.url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }
  }
  return {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }
}
</script>

<style lang="scss" scoped>
.hero-carousel {
  position: relative;
//  top: 200px;
  :deep(.carousel__container) {
    border-radius: 0;
    box-shadow: none;
  }
  
  :deep(.carousel__content) {
    height: auto;
  }
}

.hero-slide {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: max(35.25vw, 500px); /* 16:9 aspect ratio with minimum fallback */
  display: flex;

  color: white;
  text-align: center;
}

.hero-slide-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.hero-slide-content {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  padding: 2rem;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  top: auto;
}

.hero-headline {
  color: var(--white);
  margin-bottom: 1.5rem;
}

.hero-subheading {
  color: var(--white);

  margin-bottom: 2rem;
}

.hero-description {
  color: var(--white);
  margin-bottom: 2.5rem;
  
  :deep(p) {
    margin-bottom: 1rem;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.hero-actions {
  .btn {
    margin-bottom: 1rem;
   
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .hero-slide {
    min-height: max(56.25vw, 400px); /* Maintain 16:9 ratio but with smaller minimum */
  }
  
  .hero-slide-content {
    padding: 1rem;
  }
  
  .hero-headline {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
  
  .hero-subheading {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
  }
  
  .hero-description {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
  
  .hero-actions .btn {
    width: 100%;
    margin-bottom: 0.5rem;
    margin-right: 0 !important;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

@media (max-width: 576px) {
  .hero-slide {
    min-height: max(56.25vw, 350px); /* Maintain 16:9 ratio but with smaller minimum */
  }
  
  .hero-headline {
    font-size: 2rem;
  }
  
  .hero-subheading {
    font-size: 1rem;
  }
}

// Custom carousel controls for hero
.hero-carousel-wrapper {
  :deep(.carousel__control) {
    background: rgba(255, 255, 255, 0.9);
    border: 2px solid rgba(255, 255, 255, 0.3);
    width: 3.5rem;
    height: 3.5rem;
    
    &:hover {
      background: rgba(255, 255, 255, 1);
      transform: translateY(-50%) scale(1.1);
    }
    
    .carousel__control-text {
      color: #333;
      font-size: 1.8rem;
    }
  }
  
  :deep(.carousel__indicator) {
    background: rgba(255, 255, 255, 0.6);
    border: 2px solid rgba(255, 255, 255, 0.3);
    width: 1rem;
    height: 1rem;
    
    &:hover {
      background: rgba(255, 255, 255, 0.9);
    }
  }
  
  // Active indicator
  :deep(.carousel__nav:checked ~ .carousel__content .carousel__indicator) {
    background: white;
  }
}
</style>
