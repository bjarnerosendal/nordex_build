<template>
  <section class="carousel-section">
    <div class="container-fluid g-0">
      <h2 class="mb-4">{{ title }}</h2>
      
      <!-- Desktop Carousel: 3 cards per slide -->
      <div class="d-none d-md-block">
        <CardCarousel 
          :items="carouselSlides" 
          :title="carouselTitle"
          :show-controls="true"
          :show-dots="true"
          class=""
        >
          <template #slide="{ item }">
            <div class="article-slide  p-5">
              <div class="article-cards-desktop">
                <div v-for="article in item.items" :key="article.id" class="article-card">
                  <img v-if="article.image" :src="article.image + '?width=400&height=265&mode=crop'" :alt="article.name || article.title" class="article-image" />
                  <div class="article-content">
                    <h3>{{ article.name || article.title }}</h3>
                    <p v-if="article.price" class="price">${{ article.price }}</p>
                    <p class="description">{{ article.description || article.excerpt }}</p>
                    <router-link :to="article.link || article.url" class="btn btn-primary">Read More</router-link>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </CardCarousel>
      </div>

      <!-- Mobile Carousel: 1 card per slide -->
      <div class="d-md-none">
        <CardCarousel 
          :items="mobileSlides" 
          :title="carouselTitle"
          :show-controls="true"
          :show-dots="true"
          class="primary"
        >
          <template #slide="{ item }">
            <div class="article-slide">
              <div class="article-cards-mobile">
                <div v-for="article in item.items" :key="`mobile-${article.id}`" class="article-card-mobile">
                  <img :src="article.image" :alt="article.name || article.title" class="article-image" />
                  <div class="article-content">
                    <h3>{{ article.name || article.title }}</h3>
                    <p v-if="article.price" class="price">${{ article.price }}</p>
                    <p class="description">{{ article.description || article.excerpt }}</p>
                    <router-link :to="article.link || article.url" class="btn btn-primary">Read More</router-link>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </CardCarousel>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import CardCarousel from './CardCarousel.vue';

export interface ArticleItem {
  id: number | string;
  name: string;
  title?: string;
  price?: number;
  description: string;
  excerpt?: string;
  image: string;
  thumbnail?: string;
  link: string;
  url?: string;
}

export default defineComponent({
  name: 'ArticleCarousel',
  components: {
    CardCarousel
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    carouselTitle: {
      type: String,
      default: ''
    },
    articles: {
      type: Array as PropType<ArticleItem[]>,
      required: true,
      default: () => []
    }
  },
  computed: {
    // Group carousel items into slides of 3 for desktop
    carouselSlides() {
      const slides = [];
      const itemsPerSlide = 3;
      
      for (let i = 0; i < this.articles.length; i += itemsPerSlide) {
        slides.push({
          id: `slide-${i / itemsPerSlide + 1}`,
          items: this.articles.slice(i, i + itemsPerSlide)
        });
      }
      
      return slides;
    },
    // Individual items for mobile
    mobileSlides() {
      return this.articles.map((item: ArticleItem) => ({
        id: `mobile-slide-${item.id}`,
        items: [item]
      }));
    }
  }
});
</script>

<style lang="scss" scoped>
@import '@/styles/variables';

.carousel-section {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 3rem 0;
  border-radius: 1.5rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="20" cy="80" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
    pointer-events: none;
  }
  
  h2 {
    font-weight: $font-weight-bold;
    color: $dark;
    font-size: 2.5rem;
    text-align: center;
    margin-bottom: 3rem;
    text-shadow: 0 2px 4px rgba($black, 0.1);
    position: relative;
    z-index: 1;
  }
}

.article-slide {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1;
}

/* Desktop: 3 cards per slide */
.article-cards-desktop {
  display: flex;
  gap: 2rem;
  justify-content: center;
  align-items: stretch;
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
}

.article-cards-desktop .article-card {
  flex: 1;
  max-width: 380px;
  min-width: 300px;
}

/* Mobile: Individual cards - single card per slide */
.article-cards-mobile {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 350px;
  margin: 0 auto;
}

.article-card,
.article-card-mobile {
  background: rgba($white, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba($white, 0.2);
  border-radius: $border-radius-xl;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 
    0 10px 30px rgba($black, 0.1),
    0 1px 8px rgba($black, 0.05);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 
      0 20px 40px rgba($black, 0.15),
      0 5px 15px rgba($black, 0.1);
    
    &::before {
      opacity: 1;
    }
    
    .article-image {
      transform: scale(1.05);
    }
    
    .article-content {
      background: linear-gradient(135deg, rgba($white, 0.95) 0%, rgba($nordex-cream, 0.95) 100%);
    }
  }
}

.article-card-mobile {
  width: 100%;
  max-width: 350px;
}

.article-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  transition: transform 0.4s ease;
  background: linear-gradient(45deg, $gray-100, $gray-200);
}

.article-content {
  padding: 1.75rem;
  transition: background 0.3s ease;
  
  h3 {
    margin: 0 0 0.75rem;
    color: $dark;
    font-size: 1.4rem;
    font-weight: $font-weight-bold;
    line-height: 1.3;
    letter-spacing: -0.025em;
  }
}

.price {
  font-size: 1.6rem;
  font-weight: $font-weight-bolder;
  background: linear-gradient(135deg, $nordex-red 0%, $nordex-orange 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 1rem;
  display: inline-block;
}

.description {
  color: $text-muted;
  margin: 0 0 1.75rem;
  line-height: 1.6;
  font-size: 1rem;
  font-weight: $font-weight-normal;
}

.article-card .btn,
.article-card-mobile .btn {
  background: linear-gradient(135deg, $nordex-red 0%, $nordex-orange 100%);
  border: none;
  border-radius: $border-radius-pill;
  padding: 0.75rem 2rem;
  font-weight: $font-weight-semibold;
  font-size: 0.95rem;
  text-decoration: none;
  color: $white;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba($white, 0.2), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba($nordex-red, 0.4);
    background: linear-gradient(135deg, $nordex-orange 0%, $nordex-red 100%);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0);
  }
}

// Responsive design
@media (max-width: 768px) {
  .carousel-section {
    padding: 2rem 0;
    border-radius: 1rem;
    
    h2 {
      font-size: 2rem;
      margin-bottom: 2rem;
    }
  }
  
  .article-cards-desktop {
    gap: 1.5rem;
  }
  
  .article-card,
  .article-card-mobile {
    max-width: 320px;
    border-radius: $border-radius-lg;
  }
  
  .article-image {
    height: 180px;
  }
  
  .article-content {
    padding: 1.25rem;
    
    h3 {
      font-size: 1.2rem;
    }
  }
  
  .price {
    font-size: 1.4rem;
  }
  
  .description {
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
  }
  
  .article-card .btn,
  .article-card-mobile .btn {
    padding: 0.65rem 1.75rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 576px) {
  .carousel-section {
    padding: 1.5rem 0;
    
    h2 {
      font-size: 1.75rem;
      margin-bottom: 1.5rem;
    }
  }
  
  .article-image {
    height: 160px;
  }
  
  .article-content {
    padding: 1rem;
    
    h3 {
      font-size: 1.1rem;
    }
  }
  
  .price {
    font-size: 1.3rem;
  }
}
</style>
