<template>
  <article class="content-card">
    <a 
      :href="content.url || '#'" 
      class="card-link"
      :aria-label="`Read more about ${content.name}`"
      @click="handleLinkClick"
    >
      <div class="card-image" v-if="imageUrl">
        <img :src="imageUrl + '?width=1200'" :alt="content.name" loading="lazy" />
      </div>
      
      <div class="card-content">
        <header class="card-header">
          <h3 class="card-title">{{ content.name }}</h3>
          <div class="card-meta">
            <time class="card-date" v-if="content.createDate" :datetime="content.createDate">
              {{ formatDate(content.createDate) }}
            </time>
          </div>
        </header>

        <div class="card-body">
          <p class="card-excerpt" v-if="excerpt">{{ excerpt }}</p>
          <div class="card-tags" v-if="tags && tags.length">
            <span class="tag" v-for="tag in tags" :key="tag">{{ tag }}</span>
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
  updateDate?: string
  url?: string
  editUrl?: string
  excerpt?: string
  description?: string
  image?: string
  tags?: string[]
  properties?: Record<string, any>
}

interface Props {
  content: ContentItem
  showImage?: boolean
  showTags?: boolean
  excerptLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  showImage: true,
  showTags: true,
  excerptLength: 150
})

// Define emits
const emit = defineEmits<{
  click: [content: ContentItem]
}>()

// Computed properties
const imageUrl = computed(() => {
  if (!props.showImage) return null
  
  // Try multiple image sources
  return props.content.image || 
         props.content.properties?.pageImageUrl || 
         props.content.properties?.image || 
         props.content.properties?.featuredImage ||
         null
})

const excerpt = computed(() => {
  const text = props.content.excerpt || 
               props.content.description || 
               props.content.properties?.excerpt ||
               props.content.properties?.description ||
               props.content.properties?.subTitle ||
               ''
  
  if (!text) return null
  
  if (text.length <= props.excerptLength) return text
  
  return text.substring(0, props.excerptLength).trim() + '...'
})

const tags = computed(() => {
  if (!props.showTags) return []
  
  return props.content.tags || 
         props.content.properties?.tags || 
         []
})

// Event handlers
const handleLinkClick = (event: Event) => {
  // Prevent navigation if no URL
  if (!props.content.url) {
    event.preventDefault()
  }
  
  // Emit click event for tracking/analytics
  emit('click', props.content)
}

// Utility functions
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}
</script>

<style scoped>
.content-card {
  display: block;
  border-radius: 0.5rem;
  background: #EBDDCC;
  overflow: hidden;
  transition: all 0.2s ease-in-out;
}

.content-card:hover {
  background: #FEF2E2; 
  border-color: #d1d5db;
  transform: translateY(-0.5px);
}

.card-link {
  display: flex;
  flex-direction: column;
  height: 100%;
  text-decoration: none;
  color: inherit;
  outline: none;
}

/* Horizontal layout on larger screens */
@media (min-width: 768px) {
  .card-link {
    flex-direction: row;
  }
}

.card-link:focus {
  outline: 2px solid --nordex-red;
  outline-offset: 2px;
}

.card-link:hover .card-title {
  color: --nordex-red;
}

/* Card image */
.card-image {
  width: 100%;
  height: 12rem;
  overflow: hidden;
  background: #f3f4f6;
}

/* Image sizing for horizontal layout */
@media (min-width: 768px) {
  .card-image {
    width: 40%;
    flex-shrink: 0;
    aspect-ratio: 4/3;
    min-height: 16rem;
  }
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease-in-out;
}

.card-link:hover .card-image img {
  transform: scale(1.05);
}

/* Card content */
.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

/* Content adjustments for horizontal layout */
@media (min-width: 768px) {
  .card-content {
    width: 60%;
    padding: 1.5rem;
  }
}

.card-header {
  margin-bottom: 0.75rem;
}

.card-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #3d241f;
  line-height: 1.4;
  transition: color 0.2s ease-in-out;
}

.card-meta {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.card-type {
  padding: 0.125rem 0.5rem;
  background: #ECE8DB;
  color: #3D2411;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.card-date {
  font-size: 0.875rem;
  color: #3D2411;
}

/* Card body */
.card-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-bottom: 1rem;
}

.card-excerpt {
  margin: 0 0 0.75rem 0;
  color: #3D2411;
  line-height: 1.5;
  font-size: 0.875rem;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: auto;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: #3D2411;
  color: #fffef1;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Card footer */
.card-footer {
  border-top: 1px solid #f3f4f6;
  padding-top: 0.75rem;
}

.card-url {
  margin-bottom: 0.75rem;
  font-size: 0.8125rem;
}

.url-label {
  color: #6b7280;
  font-weight: 500;
}

.url-value {
  color: #3b82f6;
  word-break: break-all;
  margin-left: 0.25rem;
}

/* Responsive design */
@media (max-width: 640px) {
  .card-image {
    height: 10rem;
  }
  
  .card-content {
    padding: 0.75rem;
  }
  
  .card-title {
    font-size: 1rem;
  }
  
  .card-meta {
    gap: 0.5rem;
  }
}
</style>
