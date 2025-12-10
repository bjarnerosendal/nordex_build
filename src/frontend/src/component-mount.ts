import { createApp } from 'vue'
import TagFilter from './components/blocks/TagFilter.vue'
import GroupedTagSelector from './components/blocks/GroupedTagSelector.vue'
import ContentResults from './components/blocks/ContentResults.vue'
import HeroCarousel from './components/Carousel/HeroCarousel.vue'
import ArticleCarousel from './components/Carousel/ArticleCarousel.vue'
import SpotBlocksCarousel from './components/Carousel/SpotBlocksCarousel.vue'
import FeaturedContent from './components/FeaturedContent.vue'
import CounterBlock from './components/blocks/CounterBlock.vue'
import LanguagePicker from './components/LanguagePicker.vue'
import Form from './components/Form/Form.vue'

// Helper function to decode HTML entities manually
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&'); // This should be last to avoid double-decoding
}

// Helper function to parse boolean data attributes
function parseBooleanAttribute(value: string | null): boolean {
  if (!value) return false
  return value.toLowerCase() === 'true'
}

// Function to mount TagFilter components
function mountTagFilters() {
  const tagFilterElements = document.querySelectorAll('[data-vue-component="TagFilter"]')
  
  tagFilterElements.forEach((element) => {
    const rawData = element.getAttribute('data-props')

    
    if (rawData) {
      try {
        console.log('Raw tag filter data:', rawData)
        
        // Decode HTML entities
        const decodedData = decodeHtmlEntities(rawData)
        console.log('Decoded tag filter data:', decodedData)
        
        const props = JSON.parse(decodedData)
        console.log('Parsed tag filter props:', props)
        
        createApp(TagFilter, props).mount(element)
      } catch (error) {
        console.error('Error mounting TagFilter component:', error)
        console.error('Raw data was:', rawData)
      }
    }
  })
}

// Function to mount GroupedTagSelector components
function mountGroupedTagSelectors() {
  const selectorElements = document.querySelectorAll('[data-vue-component="GroupedTagSelector"]')
  
  selectorElements.forEach((element) => {
    const rawData = element.getAttribute('data-props')
    
    if (rawData) {
      try {
        console.log('Raw selector data:', rawData)
        
        // Decode HTML entities
        const decodedData = decodeHtmlEntities(rawData)
        console.log('Decoded selector data:', decodedData)
        
        const props = JSON.parse(decodedData)
        console.log('Parsed selector props:', props)
        
        createApp(GroupedTagSelector, props).mount(element)
      } catch (error) {
        console.error('Error mounting GroupedTagSelector component:', error)
        console.error('Raw data was:', rawData)
      }
    }
  })
}

// Function to mount ContentResults components
function mountContentResults() {
  const resultsElements = document.querySelectorAll('[data-vue-component="ContentResults"]')
  
  resultsElements.forEach((element) => {
    const rawData = element.getAttribute('data-props')
    let props = {}
    
    if (rawData) {
      try {
        console.log('Raw results data:', rawData)
        
        // Decode HTML entities
        const decodedData = decodeHtmlEntities(rawData)
        console.log('Decoded results data:', decodedData)
        
        props = JSON.parse(decodedData)
        console.log('Parsed results props:', props)
      } catch (error) {
        console.error('Error parsing ContentResults props:', error)
        console.error('Raw data was:', rawData)
      }
    }
    
    const app = createApp(ContentResults, props)
    
    // Handle result click events
    app.config.globalProperties.$emit = (event: string, ...args: any[]) => {
      if (event === 'resultClick') {
        console.log('Content result clicked:', args[0])
        // You can add custom handling here
      }
    }
    
    app.mount(element)
  })
}

// Function to mount HeroCarousel components
function mountHeroCarousels() {
  const heroCarouselElements = document.querySelectorAll('[data-vue-component="HeroCarousel"]')
  
  heroCarouselElements.forEach((element) => {
    const rawData = element.getAttribute('data-hero-items')
    
    if (rawData) {
      try {
        console.log('Raw hero carousel data:', rawData)
        
        // First decode HTML entities, then parse JSON
        const decodedData = decodeHtmlEntities(rawData)
        console.log('Decoded hero carousel data:', decodedData)
        
        // Additional cleanup for malformed JSON
        let cleanedData = decodedData.trim()
        
        // Remove any leading/trailing characters that might cause issues
        if (cleanedData.startsWith('"') && cleanedData.endsWith('"')) {
          cleanedData = cleanedData.slice(1, -1)
        }
        
        console.log('Cleaned hero carousel data:', cleanedData)
        
        const heroItems = JSON.parse(cleanedData)
        console.log('Parsed hero carousel items:', heroItems)
        
        // Create props object with heroItems
        const props = {
          heroItems: heroItems,
          autoScroll: false // Can be made configurable
        }
        
        const app = createApp(HeroCarousel, props)
        app.mount(element)
        
        // Hide fallback content after Vue mounts
        const fallback = element.querySelector('.hero-slides-fallback') as HTMLElement
        if (fallback) {
          fallback.style.display = 'none'
        }
      } catch (error) {
        console.error('Error parsing hero carousel props:', error)
        console.error('Raw data was:', rawData)
        console.error('Trying to mount with empty hero items...')
        
        // Mount with empty data on error
        const app = createApp(HeroCarousel, { heroItems: [] })
        app.mount(element)
      }
    } else {
      console.log('No hero items data found, mounting with empty array')
      // Mount with default props if no data
      const app = createApp(HeroCarousel, { heroItems: [] })
      app.mount(element)
    }
  })
}

// Function to mount ArticleCarousel components
function mountArticleCarousels() {
  const articleCarouselElements = document.querySelectorAll('[data-component="ArticleCarousel"]')
  
  articleCarouselElements.forEach((element) => {
    const rawData = element.getAttribute('data-article-carousel')
    
    if (rawData) {
      try {
        console.log('Raw article carousel data:', rawData)
        
        // First decode HTML entities, then parse JSON
        const decodedData = decodeHtmlEntities(rawData)
        console.log('Decoded article carousel data:', decodedData)
        
        const carouselData = JSON.parse(decodedData)
        console.log('Parsed article carousel data:', carouselData)
        
        // Fetch articles from API
        if (carouselData.apiUrl) {
          fetch(carouselData.apiUrl)
            .then(response => response.json())
            .then(apiData => {
              console.log('Fetched articles from API:', apiData)
              
              // Transform API data to match ArticleItem interface
              const articles = (apiData.items || apiData || []).map((item: any, index: number) => ({
                id: item.id || index,
                name: item.title || item.name,
                price: item.price || 0,
                description: item.description || item.excerpt || '',
                image: item.image || item.pageImageUrl || '',
                link: item.url || item.link || '#'
              }))
              
              // Create props object with fetched articles
              const props = {
                title: carouselData.title || '',
                carouselTitle: carouselData.carouselTitle || '',
                articles: articles
              }
              
              const app = createApp(ArticleCarousel, props)
              app.mount(element)
              
              console.log('ArticleCarousel mounted with articles:', articles)
            })
            .catch(error => {
              console.error('Error fetching articles:', error)
              
              // Mount with empty articles on API error
              const props = {
                title: carouselData.title || '',
                carouselTitle: carouselData.carouselTitle || '', 
                articles: []
              }
              
              const app = createApp(ArticleCarousel, props)
              app.mount(element)
            })
        } else {
          // Mount with empty articles if no API URL
          const props = {
            title: carouselData.title || '',
            carouselTitle: carouselData.carouselTitle || '',
            articles: []
          }
          
          const app = createApp(ArticleCarousel, props)
          app.mount(element)
        }
        
      } catch (error) {
        console.error('Error parsing article carousel props:', error)
        console.error('Raw data was:', rawData)
        
        // Mount with empty data on error
        const app = createApp(ArticleCarousel, {
          title: '',
          carouselTitle: '',
          articles: []
        })
        app.mount(element)
      }
    } else {
      console.log('No article carousel data found, mounting with empty array')
      // Mount with default props if no data
      const app = createApp(ArticleCarousel, {
        title: '',
        carouselTitle: '',
        articles: []
      })
      app.mount(element)
    }
  })
}

// Function to mount SpotBlocksCarousel components
function mountSpotBlocksCarousels() {
  const spotBlocksElements = document.querySelectorAll('[data-component="SpotBlocksCarousel"]')
  
  spotBlocksElements.forEach((element) => {
    const rawData = element.getAttribute('data-spot-blocks')
    
    if (rawData) {
      try {
        console.log('Raw spot blocks data:', rawData)
        
        // First decode HTML entities, then parse JSON
        const decodedData = decodeHtmlEntities(rawData)
        console.log('Decoded spot blocks data:', decodedData)
        
        const data = JSON.parse(decodedData)
        console.log('Parsed spot blocks data:', data)
        
        // Create props object
        const props = {
          spotBlocks: data.spotBlocks || []
        }
        
        const app = createApp(SpotBlocksCarousel, props)
        app.mount(element)
        
        console.log('SpotBlocksCarousel mounted with blocks:', props.spotBlocks)
      } catch (error) {
        console.error('Error parsing spot blocks props:', error)
        console.error('Raw data was:', rawData)
        
        // Mount with empty data on error
        const app = createApp(SpotBlocksCarousel, {
          spotBlocks: []
        })
        app.mount(element)
      }
    } else {
      console.log('No spot blocks data found, mounting with empty array')
      // Mount with default props if no data
      const app = createApp(SpotBlocksCarousel, {
        spotBlocks: []
      })
      app.mount(element)
    }
  })
}

// Function to mount Featured Content components
function mountFeaturedContent() {
  const featuredContentElements = document.querySelectorAll('[data-component="featured-content"]')
  
  featuredContentElements.forEach((element) => {
    const rawData = element.getAttribute('data-props')
    
    if (rawData) {
      try {
        console.log('Raw featured content data:', rawData)
        
        // Decode HTML entities
        const decodedData = decodeHtmlEntities(rawData)
        console.log('Decoded featured content data:', decodedData)
        
        const props = JSON.parse(decodedData)
        console.log('Parsed featured content props:', props)
        
        // Transform the data to match the Vue component structure
        const componentProps = {
          title: props.title || '',
          items: (props.items || []).map((item: any) => ({
            title: item.title || '',
            description: item.description || '',
            link: item.link?.url || '#',
            buttonText: item.link?.name || 'Read more'
          }))
        }
        
        const app = createApp(FeaturedContent, componentProps)
        app.mount(element)
        
        console.log('FeaturedContent mounted with props:', componentProps)
        
      } catch (error) {
        console.error('Error mounting FeaturedContent component:', error)
        console.error('Raw data was:', rawData)
        
        // Mount with empty data on error
        const app = createApp(FeaturedContent, {
          title: '',
          items: []
        })
        app.mount(element)
      }
    } else {
      console.log('No featured content data found, mounting with empty array')
      // Mount with default props if no data
      const app = createApp(FeaturedContent, {
        title: '',
        items: []
      })
      app.mount(element)
    }
  })
}

// Function to mount Counter Block components
function mountCounterBlocks() {
  const counterBlockElements = document.querySelectorAll('[data-component="CounterBlock"]')
  
  counterBlockElements.forEach((element) => {
    const counterDataElement = element as HTMLElement
    
    if (counterDataElement) {
      try {
        const counterData = counterDataElement.getAttribute('data-counter-data')
        console.log('Raw counter data:', counterData)
        
        // First decode HTML entities, then parse JSON
        const decodedData = decodeHtmlEntities(counterData || '{}')
        console.log('Decoded counter data:', decodedData)
        
        const data = JSON.parse(decodedData)
        console.log('Parsed counter data:', data)
        
        // Hide the server-rendered content
        const serverContent = element.querySelector('.counter-items') as HTMLElement
        const titleElement = element.querySelector('.counter-section-title') as HTMLElement
        const titleContainer = titleElement?.closest('.container') as HTMLElement
        
        if (serverContent) {
          serverContent.style.display = 'none'
        }
        if (titleContainer) {
          titleContainer.style.display = 'none'
        }
        
        // Create Vue app container
        const vueContainer = document.createElement('div')
        element.appendChild(vueContainer)
        
        // Mount Vue component
        const app = createApp(CounterBlock, {
          title: data.title,
          counterItems: data.counterItems
        })
        
        app.mount(vueContainer)
        
        console.log('CounterBlock mounted with data:', data)
        
      } catch (error) {
        console.error('Error mounting CounterBlock component:', error)
        console.error('Raw data was:', counterDataElement?.getAttribute('data-counter-data'))
        
        // Show server-rendered fallback on error
        const serverContent = element.querySelector('.counter-items') as HTMLElement
        const titleElement = element.querySelector('.counter-section-title') as HTMLElement
        const titleContainer = titleElement?.closest('.container') as HTMLElement
        
        if (serverContent) {
          serverContent.style.display = 'block'
        }
        if (titleContainer) {
          titleContainer.style.display = 'block'
        }
      }
    }
  })
}

// Function to mount Language Picker components
function mountLanguagePicker() {
  const languagePickerElements = document.querySelectorAll('#language-picker-mount')
  
  languagePickerElements.forEach((element) => {
    try {
      console.log('Mounting LanguagePicker...')
      
      // Create Vue app for language picker
      const app = createApp(LanguagePicker)
      app.mount(element)
      
      console.log('LanguagePicker mounted successfully')
      
    } catch (error) {
      console.error('Error mounting LanguagePicker component:', error)
    }
  })
}

// Enhanced tag filter system with results integration
function mountTagFilterSystems() {
  // For the new integrated TagFilter components, we don't need complex mounting
  // since ContentResults is directly imported and used within TagFilter.vue
  // This function is kept for any legacy integrations that might still need it.
  console.log('New TagFilter components use direct imports - no complex mounting needed')
}

function mountForm() {
    const formElements = document.querySelectorAll('[data-vue-component="Form"]')
    
    formElements.forEach((element) => {
        const rawData = element.getAttribute('data-model')
        
        if (rawData) {
        try {
            console.log('Raw form data:', rawData)
            
            // Decode HTML entities
            const decodedData = decodeHtmlEntities(rawData)
            console.log('Decoded form data:', decodedData)
            
            const props = JSON.parse(decodedData)
            console.log('Parsed form props:', props)

          // Transform the data to match the Vue component structure
          const componentProps = {
            Model: {
              FormKey: props.FormKey || '',
              ContentKey: props.ContentKey || '',
              RequestToken: props.RequestToken || '',
              HeaderName: props.HeaderName || '',
              Headline: props.Headline || '',
              Text: props.Text || ''
            }
          };

            createApp(Form, componentProps).mount(element)
          console.log('Form mounted with props:', componentProps)
        } catch (error) {
            console.error('Error mounting Form component:', error)
            console.error('Raw data was:', rawData)
        }
        }
    })
  
}

// Legacy component mounting for backward compatibility
function mountLegacyComponents() {
  // Mount TagFilter components using old data attributes
  document.querySelectorAll('[data-component="tag-filter"]').forEach((element) => {
    // Extract data attributes for props
    const title = element.getAttribute('data-title') || 'Filter by Tags'
    const showAllOption = element.getAttribute('data-show-all') !== 'false'
    const nodeId = element.getAttribute('data-node-id') || undefined
    const language = element.getAttribute('data-language') || 'en-US'
    const addTextSearch = parseBooleanAttribute(element.getAttribute('data-add-text-search'))
    const globalSearch = parseBooleanAttribute(element.getAttribute('data-global-search'))
    const hideFilter = parseBooleanAttribute(element.getAttribute('data-hide-filter'))
    
    // Parse tag groups data if available
    let tagGroups = []
    const tagGroupsData = element.getAttribute('data-tag-groups')
    if (tagGroupsData) {
      try {
        const decodedData = decodeHtmlEntities(tagGroupsData)
        tagGroups = JSON.parse(decodedData)
        console.log('Parsed legacy tag groups:', tagGroups)
      } catch (e) {
        console.error('Failed to parse legacy tag groups data:', e)
        console.error('Raw data:', tagGroupsData)
        tagGroups = []
      }
    }

    const cardTypeRaw = element.getAttribute('data-card-type');
    const cardType = cardTypeRaw ? cardTypeRaw.toLowerCase().split(/\s+/)[0] : 'content';
    const visibleItems = parseInt(element.getAttribute('data-visible-items') || '0', 10) || 0;
    const selectAllRaw = element.getAttribute('data-select-all');
    const selectAllFilters = selectAllRaw ? selectAllRaw.toLowerCase() === 'true' : false;
    const excludeNodeRaw = element.getAttribute('data-exclude-node');
    const excludeNode = excludeNodeRaw ? parseInt(excludeNodeRaw, 10) : undefined;

    // Create Vue app for this element
    const props = {
      title,
      showAllOption,
      nodeId,
      tagGroups,
      language,
      addTextSearch,
      global: globalSearch,
      cardType,
      hideFilter,
      visibleItems,
      selectAllFilters,
      excludeNode
    }
    
    console.log('Mounting TagFilter with props:', props)
    
    const app = createApp(TagFilter, props)
    
    // Clear existing content and mount
    element.innerHTML = ''
    app.mount(element)
  })
  
  // Mount standalone GroupedTagSelector components using old approach
  document.querySelectorAll('.grouped-tag-selector-container').forEach((element) => {
    // Find the parent tag-filter-component to get data attributes
    const parentElement = element.closest('[data-component="tag-filter"]')
    if (!parentElement) return
    
    // Extract data attributes for props
    const title = parentElement.getAttribute('data-title') || 'Filter by Tags'
    const showAllOption = parentElement.getAttribute('data-show-all') !== 'false'
    const nodeId = parentElement.getAttribute('data-node-id') || undefined
    const language = parentElement.getAttribute('data-language') || 'en-US'
    
    // Parse tag groups data if available
    let tagGroups = []
    const tagGroupsData = parentElement.getAttribute('data-tag-groups')
    if (tagGroupsData) {
      try {
        const decodedData = decodeHtmlEntities(tagGroupsData)
        tagGroups = JSON.parse(decodedData)
        console.log('Parsed tag groups for legacy standalone selector:', tagGroups)
      } catch (e) {
        console.error('Failed to parse tag groups data for legacy standalone selector:', e)
        console.error('Raw data:', tagGroupsData)
        tagGroups = []
      }
    }
    
    // Only mount if we have tag groups
    if (tagGroups && tagGroups.length > 0) {
      // Create Vue app for this element
      const app = createApp(GroupedTagSelector, {
        title,
        showAllOption,
        nodeId,
        tagGroups
      })
      
      // Clear existing content and mount
      element.innerHTML = ''
      app.mount(element)
    }
  })
}

// Initialize all components when DOM is ready
function initializeComponents() {
  console.log('Initializing Vue components...')
  
  // Mount new component system
  mountTagFilters()
  mountGroupedTagSelectors()
  mountContentResults()
  mountHeroCarousels()
  mountArticleCarousels()
  mountSpotBlocksCarousels()
  mountFeaturedContent()
  mountCounterBlocks()
  mountLanguagePicker()
  mountTagFilterSystems()
  mountForm()
  
  // Mount legacy components for backward compatibility
  mountLegacyComponents()
  
  console.log('Vue components initialized')
}

// Component registration for mounting on specific DOM elements
export const mountVueComponents = () => {
  initializeComponents()
}

// Run initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeComponents)
} else {
  initializeComponents()
}

// Re-mount when new content is loaded (for AJAX content)
export const remountComponents = () => {
  initializeComponents()
}

// Global function for Umbraco or other systems to trigger remounting
;(window as any).remountVueComponents = remountComponents

// Also run on dynamic content changes (if using AJAX/SPA navigation)
const observer = new MutationObserver((mutations) => {
  let shouldReinitialize = false
  
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element
        if (
          element.querySelector('[data-vue-component]') ||
          element.hasAttribute('data-vue-component') ||
          element.querySelector('[data-component="tag-filter"]') ||
          element.querySelector('[data-component="ArticleCarousel"]') ||
          element.querySelector('[data-component="SpotBlocksCarousel"]') ||
          element.querySelector('[data-component="CounterBlock"]') ||
          element.hasAttribute('data-component')
        ) {
          shouldReinitialize = true
        }
      }
    })
  })
  
  if (shouldReinitialize) {
    setTimeout(initializeComponents, 100)
  }
})

observer.observe(document.body, {
  childList: true,
  subtree: true
})
