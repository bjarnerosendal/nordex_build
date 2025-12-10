<template>
  <div class="tag-filter-component" data-component="tag-filter" :class="{ 'hide-filters': hideFilter }">
    <div class="tag-filter-layout" :class="{ 'full-width-layout': hideFilter }">
      <!-- Left side: Tag selector (hidden when hideFilter is true) -->
      <div v-if="!hideFilter" class="tag-filter-sidebar">
        <!-- Text search input -->
        <div v-if="addTextSearch" class="text-search-section">
          <h4 class="search-section-title">{{ t('TagFilter.TextSearch', 'Text Search') }}</h4>
          <div class="text-search-input-container">
            <div class="search-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                  <path
                    d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z"/>
              </svg>
            </div>
            <input
                v-model="searchQuery"
                type="text"
                class="text-search-input"
                :placeholder="t('TagFilter.SearchInContent', 'Search in content...')"
                @input="handleSearchQueryChange"
                @keydown.enter.prevent="() => debouncedSearch(searchQuery)"
                autocomplete="off"
                spellcheck="false"
            />
            <button
                v-if="searchQuery"
                @click="clearSearch"
                class="clear-search-btn"
                type="button"
                :title="t('TagFilter.ClearSearch', 'Clear search')"
            >
              ×
            </button>
          </div>
        </div>


        <!-- Use grouped tag selector if tag groups are provided -->
        <GroupedTagSelector
            v-if="hasTagGroups"
            :title="displayTitle"
            :show-all-option="showAllOption"
            :tag-groups="tagGroups"
            :node-id="nodeId"
            :initial-selected-tags="selectedTags"
            @tags-changed="handleTagsChanged"
            :class="{'has-search': addTextSearch}"
        />

      </div>

      <!-- Right side: Results -->
      <div class="tag-filter-results" :class="{ 'full-width-results': hideFilter }">
        <ContentResults
            :selected-tags="selectedTags"
            :tag-query="tagQuery"
            :search-query="searchQuery"
            :page-size="visibleItems > 0 ? visibleItems : 9"
            :language="language"
            :global="global"
            :node-id="nodeId"
            :is-initialized="isInitialized"
            :card-type="cardType"
            :full-width-result-cards="fullWidthResultCards"
            :hide-item-count="hideFilter"
            :visible-items="visibleItems"
            :exclude-node="excludeNode"
            @result-click="handleResultClick"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, onUnmounted, defineProps, defineEmits, watch} from 'vue'
import GroupedTagSelector from './GroupedTagSelector.vue'
import ContentResults from './ContentResults.vue'
import {useTranslations} from '../../composables/useTranslations'

// Use the translation composable
const {t} = useTranslations()

interface TagGroup {
  groupName: string
  tags: string[]
}

interface Props {
  title?: string
  showAllOption?: boolean
  initialTags?: string[]
  tagGroups?: TagGroup[]
  nodeId?: string
  language?: string
  global?: boolean
  addTextSearch?: boolean
  cardType?: 'content' | 'recipe'
  hideFilter?: boolean,
  visibleItems?: number,
  selectAllFilters?: boolean,
  excludeNode?:number
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Filter by Tags',
  showAllOption: true,
  initialTags: () => [],
  tagGroups: () => [],
  nodeId: undefined,
  language: 'en-US',
  global: false,
  addTextSearch: false,
  cardType: 'content',
  hideFilter: false,
  visibleItems: 0,
  selectAllFilters: false,
  excludeNode: undefined
})

const emit = defineEmits<{
  tagChanged: [tag: string]
  tagsChanged: [tags: string[]]
  resultClick: [content: any]
  searchQueryChanged: [searchQuery: string]
  initialized: []
}>()

const selectedTag = ref<string>('')
const selectedTags = ref<string[]>([])
const tagQuery = ref<string>('')
const searchQuery = ref<string>('')
const tags = ref<string[]>([])
const isInitialized = ref(false)

let searchDebounceTimer: NodeJS.Timeout | null = null
let urlUpdateTimer: NodeJS.Timeout | null = null
let isInitializingFromUrl = false

const hasTagGroups = computed(() => {
  return props.tagGroups && props.tagGroups.length > 0
})
const fullWidthResultCards = computed(() => {
  return props.cardType === 'content'
})
// Reactive title that falls back to default if translation is not loaded
const displayTitle = computed(() => {
  return props.title || t('TagFilter.FilterByTags', 'Filter by Tags')
})

// URL parameter management
const getUrlParams = () => {
  const urlParams = new URLSearchParams(window.location.search)
  return {
    search: urlParams.get('search') || '',
    tags: urlParams.get('tags') || '',
    tagQuery: urlParams.get('tagQuery') || ''
  }
}

const updateUrlParams = (search: string, tags: string[], tagQueryParam: string) => {
  // Don't update URL if we're currently initializing from URL params
  if (isInitializingFromUrl) {
    return
  }

  if (urlUpdateTimer) {
    clearTimeout(urlUpdateTimer)
  }

  urlUpdateTimer = setTimeout(() => {
    const url = new URL(window.location.href)
    const params = url.searchParams

    // Update search parameter
    if (search && search.trim()) {
      params.set('search', search.trim())
    } else {
      params.delete('search')
    }

    // Update tags parameter
    if (tags.length > 0) {
      params.set('tags', tags.join(','))
    } else {
      params.delete('tags')
    }

    // Update tagQuery parameter (for complex group queries)
    if (tagQueryParam && tagQueryParam.trim()) {
      params.set('tagQuery', tagQueryParam.trim())
    } else {
      params.delete('tagQuery')
    }

    // Update URL without page reload
    const newUrl = url.pathname + (params.toString() ? '?' + params.toString() : '')
    window.history.replaceState({}, '', newUrl)
  }, 300) // Debounce URL updates
}

const initializeFromUrlParams = () => {
  isInitializingFromUrl = true

  const urlParams = getUrlParams()

  // Set initial search query from URL
  if (urlParams.search) {
    searchQuery.value = urlParams.search
  }

  // Set initial tags from URL
  if (urlParams.tags) {
    const tagsFromUrl = urlParams.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    selectedTags.value = tagsFromUrl

    // For single tag compatibility
    if (tagsFromUrl.length > 0) {
      selectedTag.value = tagsFromUrl[0]
    }
  }

  // Set initial tag query from URL (for complex group queries)
  if (urlParams.tagQuery) {
    tagQuery.value = urlParams.tagQuery
  }

  // Reset flag after a brief delay to allow watchers to settle
  setTimeout(() => {
    isInitializingFromUrl = false
    isInitialized.value = true

    // Emit initialization complete event
    emit('initialized')
  }, 100)
}

// Debounced search function
const debouncedSearch = (query: string) => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }

  searchDebounceTimer = setTimeout(() => {
    emit('searchQueryChanged', query)

    // Update URL parameters
    updateUrlParams(query, selectedTags.value, tagQuery.value)

    // Dispatch custom event for backward compatibility
    const searchEvent = new CustomEvent('searchQueryChanged', {
      detail: {
        searchQuery: query,
        component: 'vue-tag-filter'
      },
      bubbles: true
    })

    document.dispatchEvent(searchEvent)
  }, 300) // 300ms debounce delay
}

const handleSearchQueryChange = () => {
  // Use debounced search to avoid too many API calls while typing
  debouncedSearch(searchQuery.value)
}

const clearSearch = () => {
  searchQuery.value = ''

  // Clear any pending debounced search
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
    searchDebounceTimer = null
  }

  // Immediately emit the change when clearing search
  emit('searchQueryChanged', '')

  // Update URL parameters immediately
  updateUrlParams('', selectedTags.value, tagQuery.value)

  // Dispatch custom event for backward compatibility
  const searchEvent = new CustomEvent('searchQueryChanged', {
    detail: {
      searchQuery: '',
      component: 'vue-tag-filter'
    },
    bubbles: true
  })

  document.dispatchEvent(searchEvent)
}

const selectTag = (tag: string) => {
  selectedTag.value = tag
  emit('tagChanged', tag)

  // Also emit as array for consistency
  emit('tagsChanged', tag ? [tag] : [])

  // Dispatch custom event for backward compatibility with non-Vue components
  const filterEvent = new CustomEvent('tagFilterChanged', {
    detail: {
      tag: tag,
      tags: tag ? [tag] : [],
      component: 'vue-tag-filter'
    },
    bubbles: true
  })

  document.dispatchEvent(filterEvent)
}

const handleTagsChanged = (newSelectedTags: string[]) => {
  selectedTags.value = newSelectedTags
  emit('tagsChanged', newSelectedTags)

  // Update URL parameters
  updateUrlParams(searchQuery.value, newSelectedTags, tagQuery.value)

  // For backward compatibility, emit single tag event with first selected tag
  const firstTag = newSelectedTags.length > 0 ? newSelectedTags[0] : ''
  emit('tagChanged', firstTag)
}

const handleResultClick = (content: any) => {
  emit('resultClick', content)
  console.log('Content result clicked:', content)
}

const loadTags = async () => {
  // Skip loading if we have tag groups (use grouped data instead)
  if (hasTagGroups.value) {
    return
  }

  try {
    // Build API URL with optional nodeId parameter
    let apiUrl = '/api/tags'
    if (props.nodeId) {
      apiUrl += `?nodeId=${props.nodeId}`
    }

    const response = await fetch(apiUrl)
    if (response.ok) {
      const data = await response.json()
      tags.value = data.tags || []
    }
  } catch (error) {
    console.error('Failed to load tags:', error)
    // Fallback to initial tags if API fails
    tags.value = props.initialTags
  }
}

const selectAllAvailableFilters = () => {
  let allAvailableTags: string[] = []

  if (hasTagGroups.value) {
    // Collect all tags from all groups
    allAvailableTags = props.tagGroups.flatMap(group => group.tags)
  } else {
    // Use the loaded tags
    allAvailableTags = tags.value
  }

  // Remove duplicates and empty tags
  allAvailableTags = [...new Set(allAvailableTags)].filter(tag => tag && tag.trim())

  // Select all available tags
  selectedTags.value = allAvailableTags

  // Emit the change
  emit('tagsChanged', allAvailableTags)

  // For backward compatibility, emit single tag event with first selected tag
  const firstTag = allAvailableTags.length > 0 ? allAvailableTags[0] : ''
  emit('tagChanged', firstTag)

  // Update URL parameters
  updateUrlParams(searchQuery.value, allAvailableTags, tagQuery.value)
}

onMounted(async () => {
  // Initialize from URL parameters first
  initializeFromUrlParams()

  // Load tags after URL initialization
  await loadTags()

  // Select all filters if selectAllFilters is true and no tags were set from URL
  if (props.selectAllFilters && selectedTags.value.length === 0) {
    selectAllAvailableFilters()
  }

  // Listen for custom events from GroupedTagSelector
  const handleCustomTagEvent = (event: Event) => {
    const customEvent = event as CustomEvent
    if (customEvent.detail?.component === 'vue-grouped-tag-selector') {
      selectedTags.value = customEvent.detail.tags || []
      tagQuery.value = customEvent.detail.tagQuery || ''

      // Update URL when tags change from GroupedTagSelector
      updateUrlParams(searchQuery.value, selectedTags.value, tagQuery.value)
    }
  }

  // Listen for browser back/forward navigation
  const handlePopState = () => {
    initializeFromUrlParams()
  }

  document.addEventListener('tagFilterChanged', handleCustomTagEvent)
  window.addEventListener('popstate', handlePopState)

  // Clean up event listeners and timers on unmount
  onUnmounted(() => {
    document.removeEventListener('tagFilterChanged', handleCustomTagEvent)
    window.removeEventListener('popstate', handlePopState)

    // Clear any pending debounced search
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer)
    }

    // Clear any pending URL updates
    if (urlUpdateTimer) {
      clearTimeout(urlUpdateTimer)
    }
  })
})

// Watch for programmatic changes to searchQuery
watch(() => searchQuery.value, (newValue) => {
  if (newValue !== undefined) {
    debouncedSearch(newValue)
  }
})

// Watch for changes to selectedTags to update URL
watch(() => selectedTags.value, (newTags) => {
  if (!isInitializingFromUrl) {
    updateUrlParams(searchQuery.value, newTags, tagQuery.value)
  }
}, {deep: true})

// Watch for changes to tagQuery to update URL
watch(() => tagQuery.value, (newTagQuery) => {
  if (!isInitializingFromUrl) {
    updateUrlParams(searchQuery.value, selectedTags.value, newTagQuery)
  }
})

// Watch for changes to selectAllFilters prop
watch(() => props.selectAllFilters, (newValue) => {
  if (newValue && selectedTags.value.length === 0) {
    selectAllAvailableFilters()
  } else if (!newValue) {
    // Clear all selected tags when selectAllFilters is set to false
    selectedTags.value = []
    emit('tagsChanged', [])
    emit('tagChanged', '')
    updateUrlParams(searchQuery.value, [], tagQuery.value)
  }
})

// Watch for changes to tagGroups prop in case they load asynchronously
watch(() => props.tagGroups, (newTagGroups) => {
  if (props.selectAllFilters && selectedTags.value.length === 0 && newTagGroups && newTagGroups.length > 0) {
    selectAllAvailableFilters()
  }
}, {deep: true})
</script>

<style scoped>
.tag-filter-component {
  margin: 1rem 0;
}

.has-search {
  margin: 1rem 0;
}

.tag-filter-layout {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  align-items: start;
}

/* Full-width layout when filters are hidden */
.tag-filter-layout.full-width-layout {
  grid-template-columns: 1fr;
  gap: 0;
}

.tag-filter-results.full-width-results {
  width: 100%;
  max-width: none;
}

.tag-filter-sidebar {
  position: sticky;
  top: 2rem;
}

.text-search-section {
  margin-bottom: 2.5rem;
}

.search-section-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.text-search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  width: 1rem;
  height: auto;
  left: 0.75rem;
  fill: #3D2411;
  font-size: 0.875rem;
  pointer-events: none;
  z-index: 1;
  align-self: center;
}

.text-search-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 2rem;
  border: 2px solid #ECE8DB;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: transparent;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.text-search-input:focus {
  outline: none;
  border-color: #E41E26;
}


.clear-search-btn {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
  border-radius: 0.25rem;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out;
}

.clear-search-btn:hover {
  color: #374151;
  background-color: #f3f4f6;
}

.tag-filter-results {
  min-height: 200px;
}

.tag-filter-title {
  margin-bottom: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.tag-filter-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-filter-item {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  font-size: 0.875rem;
  font-family: inherit;
  outline: none;
}

.tag-filter-item:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
  transform: translateY(-1px);
}

.tag-filter-item:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.tag-filter-item.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.tag-filter-item.active:hover {
  background: #2563eb;
  border-color: #2563eb;
}

/* Responsive design */
@media (max-width: 1024px) {
  .tag-filter-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .tag-filter-sidebar {
    position: static;
  }
}

@media (max-width: 640px) {
  .tag-filter-list {
    gap: 0.25rem;
  }

  .tag-filter-item {
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
  }

  .tag-filter-layout {
    gap: 1rem;
  }
}

</style>
