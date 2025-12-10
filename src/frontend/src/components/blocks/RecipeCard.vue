<template>
  <article class="recipe-card">
    <a 
      :href="content.url || '#'" 
      class="recipe-link"
      :aria-label="`View recipe: ${content.name}`"
      @click="handleLinkClick"
    >
      <div class="recipe-image-container" v-if="imageUrl">
        <img 
          :src="imageUrl" 
          :alt="content.name" 
          loading="lazy" 
          class="recipe-image"
        />
        <div class="recipe-overlay">
          <div class="recipe-difficulty" v-if="difficulty">
            <span class="difficulty-badge" :class="`difficulty-${difficulty.toLowerCase()}`">
              {{ difficulty }}
            </span>
          </div>
          <div class="recipe-time" v-if="cookingTime">
            <svg class="time-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.7L16.2,16.2Z" />
            </svg>
            {{ cookingTime }}
          </div>
        </div>
      </div>
      
      <div class="recipe-content">
        <header class="recipe-header">
          <h3 class="recipe-title">{{ content.name }}</h3>
          <div class="recipe-rating" v-if="rating">
            <div class="stars">
              <span 
                v-for="i in 5" 
                :key="i" 
                class="star"
                :class="{ 'star-filled': i <= rating }"
              >★</span>
            </div>
            <span class="rating-text">{{ rating }}/5</span>
          </div>
        </header>

        <div class="recipe-body">
          <p class="recipe-description" v-if="description">{{ description }}</p>
          
          <div class="recipe-details">
            <div class="detail-item" v-if="servings">
              <svg class="detail-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21A7,7 0 0,1 14,26H10A7,7 0 0,1 3,19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M14,9H10A5,5 0 0,0 5,14V17H19V14A5,5 0 0,0 14,9Z" />
              </svg>
              <span>{{ servings }} servings</span>
            </div>
            <div class="detail-item" v-if="calories">
              <svg class="detail-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.07,12.25L14.17,13.17C13.45,13.9 13,14.5 13,15.17C13,16.26 13.74,17 14.83,17C15.5,17 16.1,16.55 16.83,15.83L17.75,14.92C18.17,14.5 18.65,14.07 19.13,13.81C20.26,13.19 21,12.31 21,11.29C21,10.5 20.74,9.81 20.26,9.33L15.07,4.14C14.59,3.66 13.9,3.4 13.11,3.4C12.15,3.4 11.27,4.14 10.65,5.27C10.39,5.75 9.96,6.23 9.54,6.65L8.62,7.57C7.9,8.29 7.45,8.89 7.45,9.56C7.45,10.65 8.19,11.39 9.28,11.39C9.95,11.39 10.55,10.94 11.27,10.22L12.19,9.3C12.61,8.88 13.09,8.45 13.57,8.19C14.7,7.57 15.44,6.69 15.44,5.67C15.44,4.88 15.18,4.19 14.7,3.71L9.51,8.9C9.03,9.38 8.34,9.64 7.55,9.64C6.59,9.64 5.71,8.9 5.09,7.77C4.83,7.29 4.4,6.81 3.98,6.39L3.06,5.47C2.34,4.75 1.89,4.15 1.89,3.48C1.89,2.39 2.63,1.65 3.72,1.65C4.39,1.65 4.99,2.1 5.71,2.82L6.63,3.74C7.05,4.16 7.53,4.59 8.01,4.85C9.14,5.47 9.88,6.35 9.88,7.37C9.88,8.16 9.62,8.85 9.14,9.33L15.07,12.25Z" />
              </svg>
              <span>{{ calories }} cal</span>
            </div>
          </div>

          <div class="recipe-tags" v-if="tags && tags.length">
            <span class="recipe-tag" v-for="tag in tags.slice(0, 3)" :key="tag">
              {{ tag }}
            </span>
            <span class="more-tags" v-if="tags.length > 3">
              +{{ tags.length - 3 }}
            </span>
          </div>
        </div>
      </div>
    </a>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Define props
interface ContentItem {
  id: string
  name: string
  contentType?: string
  createDate?: string
  url?: string
  excerpt?: string
  description?: string
  image?: string
  tags?: string[]
  properties?: Record<string, any>
}

interface Props {
  content: ContentItem
  excerptLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  excerptLength: 120
})

// Define emits
const emit = defineEmits<{
  click: [content: ContentItem]
}>()

// Computed properties
const imageUrl = computed(() => {
  let image = props.content.image || 
              props.content.properties?.image || 
              props.content.properties?.featuredImage ||
              props.content.properties?.recipeImage ||
              null
  return image ? image + '?width=530' : null
})

const description = computed(() => {
  const text = props.content.description || 
               props.content.excerpt || 
               props.content.properties?.description ||
               props.content.properties?.excerpt ||
               ''
  
  if (!text) return null
  
  if (text.length <= props.excerptLength) return text
  
  return text.substring(0, props.excerptLength).trim() + '...'
})

const tags = computed(() => {
  return props.content.tags || 
         props.content.properties?.tags || 
         []
})

const difficulty = computed(() => {
  return props.content.properties?.difficulty || 
         props.content.properties?.recipeDifficulty ||
         null
})

const cookingTime = computed(() => {
  return props.content.properties?.cookingTime || 
         props.content.properties?.prepTime ||
         props.content.properties?.totalTime ||
         null
})

const servings = computed(() => {
  return props.content.properties?.servings || 
         props.content.properties?.portions ||
         null
})

const calories = computed(() => {
  return props.content.properties?.calories || 
         props.content.properties?.caloriesPerServing ||
         null
})

const rating = computed(() => {
  const r = props.content.properties?.rating || 
           props.content.properties?.averageRating ||
           null
  return r ? Math.round(parseFloat(r)) : null
})

// Event handlers
const handleLinkClick = (event: Event) => {
  if (!props.content.url) {
    event.preventDefault()
  }
  
  emit('click', props.content)
}
</script>

<style scoped lang="scss">
.recipe-card {
  display: block;
  border-radius: 12px;
  background: white;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 100%;
}

.recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.recipe-link {
  display: flex;
  flex-direction: column;
  height: 100%;
  text-decoration: none;
  color: inherit;
  outline: none;
}

.recipe-link:focus {
  outline: 2px solid #f59e0b;
  outline-offset: 2px;
}

/* Image container */
.recipe-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
  background: #f3f4f6;
}

.recipe-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.recipe-link:hover .recipe-image {
  transform: scale(1.05);
}

.recipe-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 50%, rgba(0,0,0,0.7) 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px;
}

.recipe-difficulty {
  align-self: flex-start;
}

.difficulty-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: white;
  
  &.difficulty-easy {
    background: #10b981;
  }
  
  &.difficulty-medium {
    background: #f59e0b;
  }
  
  &.difficulty-hard {
    background: #ef4444;
  }
}

.recipe-time {
  display: flex;
  align-items: center;
  gap: 4px;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  align-self: flex-end;
}

.time-icon {
  width: 16px;
  height: 16px;
}

/* Content */
.recipe-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.recipe-header {
  margin-bottom: 12px;
}

.recipe-title {
  margin: 0 0 8px 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.4;
  transition: color 0.2s ease;
}

.recipe-link:hover .recipe-title {
  color: #f59e0b;
}

.recipe-rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stars {
  display: flex;
  gap: 1px;
}

.star {
  font-size: 0.875rem;
  color: #d1d5db;
  transition: color 0.2s ease;
}

.star-filled {
  color: #fbbf24;
}

.rating-text {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

/* Body */
.recipe-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recipe-description {
  margin: 0;
  color: #4b5563;
  line-height: 1.5;
  font-size: 0.875rem;
}

.recipe-details {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.detail-icon {
  width: 14px;
  height: 14px;
  color: #9ca3af;
}

.recipe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
}

.recipe-tag {
  padding: 4px 8px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.more-tags {
  padding: 4px 8px;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Responsive design */
@media (max-width: 640px) {
  .recipe-image-container {
    height: 160px;
  }
  
  .recipe-content {
    padding: 12px;
  }
  
  .recipe-title {
    font-size: 1rem;
  }
  
  .recipe-details {
    gap: 12px;
  }
}
</style>
