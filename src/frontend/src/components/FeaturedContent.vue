<template>
  <section class="featured-content mb-5">
    <div class="container">
      <h2 class="mb-4">{{ title }}</h2>
      <div class="row">
        <div class="col-md-4 mb-4" v-for="(item, index) in items" :key="index">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">{{ item.title }}</h5>
              <p class="card-text">{{ item.description }}</p>
              <a v-if="item.link && isExternalLink(item.link)" 
                 :href="item.link" 
                 class="btn btn-outline-primary"
                 target="_blank"
                 rel="noopener noreferrer">
                {{ item.buttonText || 'Read more' }}
              </a>
              <router-link v-else-if="item.link" 
                           :to="item.link" 
                           class="btn btn-outline-primary">
                {{ item.buttonText || 'Read more' }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Props
const props = defineProps<{
  title?: string
  items: FeaturedItem[]
}>()

// Types
interface FeaturedItem {
  title: string
  description: string
  link: string
  buttonText?: string
}

// Helper function to determine if link is external
const isExternalLink = (url: string): boolean => {
  return url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('tel:')
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables';

.featured-content {
  .card {
    border: none;
    border-radius: $border-radius-lg;
    box-shadow: $box-shadow;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    background: rgba($white, 0.95);
    backdrop-filter: blur(10px);
  }

  .card:hover {
    transform: translateY(-5px);
    box-shadow: $box-shadow-lg;
  }

  .card-title {
    color: $dark;
    font-weight: $font-weight-semibold;
    margin-bottom: 1rem;
  }

  .card-text {
    color: $text-muted;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }

  .btn-outline-primary {
    border-radius: $border-radius-pill;
    font-weight: $font-weight-medium;
    transition: all 0.3s ease;
    border-color: $nordex-red;
    color: $nordex-red;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba($nordex-red, 0.3);
      background-color: $nordex-red;
      border-color: $nordex-red;
      color: $white;
    }
  }

  h2 {
    text-align: center;
    color: $dark;
    font-weight: $font-weight-semibold;
    margin-bottom: 2rem;
  }
}

@media (max-width: 768px) {
  .featured-content {
    .card {
      margin-bottom: 1.5rem;
    }
  }
}
</style>
