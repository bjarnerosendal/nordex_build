<template>
  <div class="language-picker px-2 bg-beige" v-if="languages.length > 1">
    <button 
      class="language-toggle text-uppercase text-brown pe-4 p-2" 
      @click="toggleDropdown"
      :aria-expanded="isOpen"
      aria-haspopup="true"
      ref="toggle">
      <span class="ms-4 me-2">{{ t('languagePicker.toggle') }}</span>
      <svg 
        class="chevron-icon" 
        :class="{ 'chevron-up': isOpen }"
        width="12" 
        height="12" 
        viewBox="0 0 12 12" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M3 4.5L6 7.5L9 4.5" 
          stroke="currentColor" 
          stroke-width="1.5" 
          stroke-linecap="round" 
          stroke-linejoin="round"/>
      </svg>
    </button>
    
    <div 
      class="language-dropdown" 
      :class="{ show: isOpen }"
      ref="dropdown">
      <div class="language-dropdown-content">
        <template v-for="language in languages" :key="language.isoCode">
        <a 
          
          v-if="language.isoCode !== currentLanguageCode"
 
          :href="language.url"
          class="language-option"
          :class="{ active: language.isoCode === currentLanguageCode }"
          @click="selectLanguage(language)">
            <span class="language-name">{{ t(language.nativeName) || t(language.name) }}</span>
        </a>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useTranslations } from '@/composables/useTranslations'

interface Language {
  isoCode: string
  name: string
  nativeName: string
  url: string
  isCurrent: boolean
}

interface LanguageResponse {
  languages: Language[]
  currentLanguage: string
}

const languages = ref<Language[]>([])
const isOpen = ref(false)
const toggle = ref<HTMLElement>()
const dropdown = ref<HTMLElement>()

const { t } = useTranslations()

const currentLanguageCode = ref('')


const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectLanguage = (language: Language) => {
  // Navigation will be handled by the href, so we just close the dropdown
  isOpen.value = false
}

const closeDropdown = (event: Event) => {
  if (toggle.value && dropdown.value) {
    const target = event.target as HTMLElement
    if (!toggle.value.contains(target) && !dropdown.value.contains(target)) {
      isOpen.value = false
    }
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    isOpen.value = false
    toggle.value?.focus()
  }
}



const loadLanguages = async () => {
  try {
    const currentUrl = window.location.pathname
    const response = await fetch(`/api/LanguageApi?url=${encodeURIComponent(currentUrl)}`)
    
    if (response.ok) {
      const data: LanguageResponse = await response.json()
      languages.value = data.languages
      currentLanguageCode.value = data.currentLanguage
      
      console.log('Current language from API:', data.currentLanguage)
      console.log('Languages:', data.languages)
    } else {
      console.error('Failed to load languages:', response.statusText)
    }
  } catch (error) {
    console.error('Error loading languages:', error)
  }
}

onMounted(async () => {
  // Load languages - translations are handled by useTranslations composable
  loadLanguages()
  document.addEventListener('click', closeDropdown)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped lang="scss">
@import '@/styles/variables';

.language-picker {
  height: 76px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.language-toggle {
  border: none;
  background: none;
  color: #6c757d;
  transition: color 0.15s ease-in-out;
  display: flex;
  align-items: center;
  text-decoration: none;
  
  &:hover {
    color: #495057;
  }
  
  
  svg {
    flex-shrink: 0;
  }
}

.chevron-icon {
  transition: transform 0.2s ease-in-out;
  margin-right: 8px;
  
  &.chevron-up {
    transform: rotate(180deg);
  }
}

.language-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 200px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.15s ease-in-out;
  
  &.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
}

.language-dropdown-content {
  padding: 0.5rem 0;
}

.language-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  color: #495057;
  text-decoration: none;
  transition: background-color 0.15s ease-in-out;
  
  &:hover {
    background-color: #f8f9fa;
    color: #495057;
    text-decoration: none;
  }
  
  &.active {
    background-color: var(--bs-primary);
    color: white;
  }
}

.language-code {
  font-weight: 600;
  font-size: 0.875rem;
  min-width: 2rem;
}

.language-name {
  font-size: 0.875rem;
}

// Mobile styles
@media (max-width: 991.98px) {
  .language-picker {
    height: auto;
    padding: 0;
    background: transparent;
    width: 100% !important;
    border-top: 1px solid #f8f9fa;
    position: relative;
    display: block !important;
    flex: none !important;
    min-height: 3rem; // Ensure it has some height to be visible
  }
  
  .language-toggle {
    margin-top: 0;
    padding: 0.75rem 0;
    width: 100% !important;
    justify-content: space-between;
    font-weight: 500;
    color: #495057;
    font-size: 1rem;
    display: flex !important;
    
    &:hover {
      color: #007bff;
    }
    
    .ms-4 {
      margin-left: 0 !important;
    }
    
    .chevron-icon {
      margin-right: 0;
      width: 16px;
      height: 16px;
    }
  }
  
  .language-dropdown {
    min-width: 100% !important;
    width: 100% !important;
    margin-top: 0;
    background: #f8f9fa;
    border: none;
    border-radius: 0rem;
    box-shadow: none;
    transform: none !important;
    opacity: 1 !important;
    visibility: visible !important;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease, padding 0.3s ease;
    
    &.show {
      max-height: 500px !important;
      animation: slideDownMobile 0.3s ease;
      
      .language-dropdown-content {
        padding: 0.75rem 0;
        opacity: 1;
      }
    }
    
    &:not(.show) {
      .language-dropdown-content {
        padding: 0;
        opacity: 0;
      }
    }
  }
  
  .language-dropdown-content {
    padding: 0;
    transition: padding 0.3s ease, opacity 0.3s ease;
    width: 100%;
  }
  
  .language-option {
    padding: 0.875rem 1rem;
    margin: 0 0.5rem;
    border-radius: 0.25rem;
    font-size: 1rem;
    border-bottom: 1px solid rgba(0,0,0,0.08);
    transition: all 0.2s ease;
    display: block !important;
    width: calc(100% - 1rem);
    
    &:last-child {
      border-bottom: none;
    }
    
    &:hover {
      background-color: rgba(0, 123, 255, 0.1);
      color: #007bff;
      transform: translateX(0.25rem);
    }
    
    &.active {
      background-color: #007bff;
      color: white;
      font-weight: 500;
    }
    
    .language-name {
      font-size: 1rem;
      font-weight: inherit;
    }
  }
  
  // Animation for mobile dropdown
  @keyframes slideDownMobile {
    from {
      max-height: 0;
      opacity: 0;
    }
    to {
      max-height: 500px;
      opacity: 1;
    }
  }
}
</style>
