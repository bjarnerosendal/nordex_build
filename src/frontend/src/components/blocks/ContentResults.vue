<template>
  <div class="content-results">
    <div class="results-header" v-if="!hideItemCount">
      <h3 class="results-title">{{ t('ContentResults.SearchResults', 'Search Results') }}</h3>
      <div class="results-count" v-if="totalResults">
        {{ totalResults }} {{ totalResults === 1 ? t('ContentResults.Result', 'result') : t('ContentResults.Results', 'results') }} {{ t('ContentResults.Found', 'found') }}
      </div>
    </div>

    <transition name="fade" mode="out-in">
      <div class="results-loading" v-if="loading" key="loading">
        <div class="loading-spinner"></div>
        <span>{{ t('ContentResults.LoadingResults', 'Loading results...') }}</span>
      </div>

      <div class="results-error" v-else-if="error" key="error">
        <div class="error-icon">⚠️</div>
        <p>{{ error }}</p>
      </div>

      <div class="results-empty" v-else-if="!loading && results.length === 0" key="empty">
        <div class="empty-icon">🔍</div>
        <p>{{ t('ContentResults.NoResultsFound', 'No results found') }}</p>
      </div>

      <div class="results-list" v-else key="results">
        <transition-group 
          name="card-list" 
          tag="div"
          class="results-grid" 
          :class="{
            'grid-recipe': cardType === 'recipe',
            'grid-content': cardType === 'content',
            'grid-full-width': fullWidthResultCards && cardType !== 'recipe'
          }"
        >
          <component 
            :is="cardComponent"
            v-for="(item, index) in results" 
            :key="item.id"
            :content="item"
            @click="onResultClick(item)"
            class="card-item"
            :style="{ '--card-index': index }"
          />
        </transition-group>
      </div>
    </transition>

    <div class="results-pagination" v-if="totalPages > 1">
      <transition name="bounce" appear>
        <button 
          class="btn btn-lg ms-3 ps-5 btn-primary brown-arrow arrow-before"
          :disabled="currentPage <= 1"
          @click="goToPage(currentPage - 1)"
          key="prev-btn"
        >
          {{ t('ContentResults.Previous', 'Previous') }}
        </button>
      </transition>
      
      <transition name="slide-fade" appear>
        <span class="pagination-info d-none d-sm-block" key="page-info">
          {{ t('ContentResults.Page', 'Page') }} {{ currentPage }} {{ t('ContentResults.Of', 'of') }} {{ totalPages }}
        </span>
      </transition>
      
      <transition name="bounce" appear>
        <button 
          class="btn btn-lg me-3 pe-5 btn-primary brown-arrow"
          :disabled="currentPage >= totalPages"
          @click="goToPage(currentPage + 1)"
          key="next-btn"
        >
          {{ t('ContentResults.Next', 'Next') }}
        </button>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import ContentCard from './ContentCard.vue'
import RecipeCard from './RecipeCard.vue'
import { useTranslations } from '../../composables/useTranslations'

// Use the translation composable
const { t } = useTranslations()

// Define props
interface Props {
  selectedTags?: string[]
  tagQuery?: string
  searchQuery?: string
  pageSize?: number
  language?: string
  global?: boolean
  nodeId?: string
  isInitialized?: boolean,
  fullWidthResultCards?: boolean,
  cardType?: 'content' | 'recipe'
  hideItemCount?: boolean,
  excludeNode?: number
}

const props = withDefaults(defineProps<Props>(), {
  selectedTags: () => [],
  tagQuery: '',
  searchQuery: '',
  pageSize: 10,
  language: 'en-US',
  global: false,
  nodeId: undefined,
  isInitialized: false,
  fullWidthResultCards: false,
  cardType: 'recipe',
  hideItemCount: false,
  visibleItems: 0,
  excludeNode: undefined
})

// Define emits
const emit = defineEmits<{
  resultClick: [content: any]
}>()

// Reactive state
const results = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const totalResults = ref(0)


// Computed properties
const totalPages = computed(() => Math.ceil(totalResults.value / props.pageSize))

const cardComponent = computed(() => {
  return props.cardType === 'recipe' ? RecipeCard : ContentCard
})

// Content search function
const searchContent = async () => {
  // Allow search even with no selected tags for initial load
  // if (props.selectedTags.length === 0) {
  //   results.value = []
  //   totalResults.value = 0
  //   return
  // }

  loading.value = true
  error.value = null

  try {
    const queryParams = new URLSearchParams()
    
    // Use tagQuery if available (for complex group logic), otherwise fall back to selectedTags
    if (props.tagQuery && props.tagQuery.trim()) {
      queryParams.append('tagGroups', props.tagQuery)
    } else if (props.selectedTags.length > 0) {
      queryParams.append('tags', props.selectedTags.join(','))
    }
    
    // Add pagination parameters
    const skip = (currentPage.value - 1) * props.pageSize
    queryParams.append('skip', skip.toString())
    queryParams.append('take', props.pageSize.toString())

    // Add text search query parameter
    if (props.searchQuery && props.searchQuery.trim()) {
      queryParams.append('query', props.searchQuery.trim())
    }
    
    // Add language/culture parameter
    if (props.language) {
      queryParams.append('lang', props.language)
    }
    
    // Add StartNodeId parameter when global is false (local search) and nodeId is provided
    if (!props.global && props.nodeId) {
      // Remove quotes from nodeId if present
      const cleanNodeId = props.nodeId.replace(/['"]/g, '')
      queryParams.append('StartNodeId', cleanNodeId)
    
    }
    if (props.excludeNode) {
      queryParams.append('excludeNode', props.excludeNode.toString())
    }

    const response = await fetch(`/api/contentsearch/?${queryParams.toString()}`)
    
    if (!response.ok) {
      throw new Error(`Search failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Transform the API response to match our component expectations
    results.value = data.items.map((item: any) => ({
      id: item.id.toString(),
      name: item.name,
      contentType: item.contentType,
      createDate: item.createDate,
      updateDate: item.updateDate,
      url: item.url,
      editUrl: `/umbraco#/content/content/edit/${item.id}`,
      excerpt: item.excerpt,
      image: item.pageImageUrl,
      tags: item.tags || [],
      properties: {
        pageTitle: item.pageTitle,
        subTitle: item.subTitle,
        level: item.level,
        parentId: item.parentId,
        culture: item.culture
      }
    }))
    
    totalResults.value = data.total || 0
    
  } catch (err) {
    console.error('Content search error:', err)
    error.value = err instanceof Error ? err.message : 'An error occurred while searching'
    results.value = []
    totalResults.value = 0
  } finally {
    loading.value = false
  }
}

// Handle pagination
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    searchContent()
  }
}

// Handle result click
const onResultClick = (content: any) => {
  emit('resultClick', content)
}

// Watch for tag changes, search query changes, and global/nodeId changes
watch([() => props.selectedTags, () => props.tagQuery, () => props.searchQuery, () => props.global, () => props.nodeId], () => {
  if (props.isInitialized) {
    currentPage.value = 1 // Reset to first page when filters change
    searchContent()
  }
}, { deep: true })

// Watch for initialization to trigger initial search
watch(() => props.isInitialized, (newValue) => {
  if (newValue) {
    searchContent()
  }
})

// Initial search on mount - only if already initialized
onMounted(() => {
  if (props.isInitialized) {
    searchContent()
  }
})
</script>

<style scoped>
.content-results {
  width: 100%;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.results-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.results-count {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* Loading state */
.results-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 0.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error state */
.results-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: #dc2626;
  text-align: center;
}

.error-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

/* Empty state */
.results-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: #6b7280;
  text-align: center;
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

/* Results list */
.results-list {
  margin-bottom: 1rem;
}

.results-grid {
  display: grid;
  gap: 1.5rem;
}

/* Grid layouts */
.grid-content {
  grid-template-columns: 1fr;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.grid-recipe {
  grid-template-columns: 1fr;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (min-width: 1280px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.grid-full-width {
  grid-template-columns: 1fr !important;
}

/* Card Animation Styles */
.card-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(0) scale(1);
  opacity: 1;
  will-change: transform, box-shadow;
}

.card-item:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 8px 16px rgba(0, 0, 0, 0.06);
  z-index: 10;
}

.card-item:active {
  transform: translateY(-4px) scale(1.01);
  transition-duration: 0.1s;
}

/* Vue Transition Group Animations */
.card-list-enter-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: calc(var(--card-index, 0) * 0.1s);
}

.card-list-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-list-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.card-list-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.card-list-move {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Loading state animation */
@keyframes cardPulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.results-loading .loading-spinner {
  animation: cardPulse 2s ease-in-out infinite;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

/* Fade transition for state changes */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease-in-out;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Bounce transition for pagination buttons */
.bounce-enter-active {
  animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes bounce-in {
  0% {
    transform: scale(0.3) translateY(20px);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) translateY(-5px);
    opacity: 0.8;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

/* Slide fade for pagination info */
.slide-fade-enter-active {
  transition: all 0.4s ease-out;
}

.slide-fade-enter-from {
  transform: translateX(10px);
  opacity: 0;
}

/* Pagination */
.results-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
}


.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* Responsive design */
@media (max-width: 640px) {
  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .results-pagination {
    gap: 0.5rem;
  }
  
  .pagination-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
  }
  
  /* Reduce animation intensity on mobile for better performance */
  .card-item:hover {
    transform: translateY(-4px) scale(1.01);
  }
  
  .card-list-enter-from {
    transform: translateY(20px) scale(0.98);
  }
  
  /* Reduce bounce effect on mobile */
  .bounce-enter-active {
    animation: bounce-in-mobile 0.4s ease-out;
  }
}

@keyframes bounce-in-mobile {
  0% {
    transform: scale(0.8) translateY(10px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

/* Enhance hover effects for larger screens */
@media (min-width: 1024px) {
  .card-item:hover {
    transform: translateY(-12px) scale(1.03);
  }
}

</style>
