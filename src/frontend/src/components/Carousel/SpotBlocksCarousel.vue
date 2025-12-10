<template>
  <section class="spotBlocks-carousel-section">
    <div class="container">
      <!-- Desktop Carousel: Show only if more than 3 items -->
      <div v-if="spotBlocks.length > 3" class="d-none d-md-block">
        <CardCarousel 
          :items="desktopSlides" 
          :show-controls="true"
          :show-dots="false"
        >
          <template #slide="{ item }">
            <div class="spotBlocks-slide">
              <div class="spotBlocks-grid-desktop">
                <SpotBlockCard 
                  v-for="block in item.items" 
                  :key="block.id"
                  :spot-block="block"
                />
              </div>
            </div>
          </template>
        </CardCarousel>
      </div>

      <!-- Desktop Grid: Show if 3 or fewer items -->
      <div v-if="spotBlocks.length <= 3" class="d-none d-md-block">
        <div class="row spotBlocks-grid">
          <div 
            v-for="block in spotBlocks" 
            :key="block.id"
            class="col-lg-4 col-md-6 col-sm-12 spotBlock py-4"
          >
            <SpotBlockCard :spot-block="block" />
          </div>
        </div>
      </div>

      <!-- Mobile Carousel: Show only if more than 1 item -->
      <div v-if="spotBlocks.length > 1" class="d-md-none">
        <CardCarousel 
          :items="mobileSlides" 
          :show-controls="true"
          :show-dots="false"
        >
          <template #slide="{ item }">
            <div class="spotBlocks-slide-mobile">
              <SpotBlockCard 
                v-for="block in item.items" 
                :key="`mobile-${block.id}`"
                :spot-block="block"
              />
            </div>
          </template>
        </CardCarousel>
      </div>

      <!-- Mobile Single Item: Show if only 1 item -->
      <div v-if="spotBlocks.length === 1" class="d-md-none">
        <div class="row spotBlocks-grid">
          <div class="col-12 spotBlock py-4">
            <SpotBlockCard :spot-block="spotBlocks[0]" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import CardCarousel from './CardCarousel.vue';
import SpotBlockCard, { SpotBlockItem } from './SpotBlockCard.vue';

export default defineComponent({
  name: 'SpotBlocksCarousel',
  components: {
    CardCarousel,
    SpotBlockCard
  },
  props: {
    spotBlocks: {
      type: Array as PropType<SpotBlockItem[]>,
      required: true,
      default: () => []
    }
  },
  computed: {
    // Group spot blocks into slides of 3 for desktop
    desktopSlides() {
      const slides = [];
      const itemsPerSlide = 3;
      
      for (let i = 0; i < this.spotBlocks.length; i += itemsPerSlide) {
        slides.push({
          id: `desktop-slide-${i / itemsPerSlide + 1}`,
          items: this.spotBlocks.slice(i, i + itemsPerSlide)
        });
      }
      
      return slides;
    },
    // Individual items for mobile
    mobileSlides() {
      return this.spotBlocks.map((item: SpotBlockItem) => ({
        id: `mobile-slide-${item.id}`,
        items: [item]
      }));
    }
  }
});
</script>

<style lang="scss" scoped>
@import '@/styles/variables';

.spotBlocks-carousel-section {
  padding: 2rem 0;
}

.spotBlocks-slide {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: stretch;
  padding: 0;
  height: 100%;
}

.spotBlocks-grid-desktop {
  display: flex;
  gap: 2rem;
  justify-content: space-between;
  align-items: stretch;
  width: 100%;
  margin: 0 auto;
  height: 100%;
  padding: 1rem 0;

  > div {
    flex: 1 1 calc(33.333% - 1.333rem);
    max-width: calc(33.333% - 1.333rem);
    display: flex;
    flex-direction: column;
  }
}

.spotBlocks-slide-mobile {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
 
  > div {
    width: 100%;
  }
}

// Override carousel controls position for spot blocks
.spotBlocks-carousel-section {
  :deep(.carousel__controls) {
    top: 40%;
  }
}
</style>
