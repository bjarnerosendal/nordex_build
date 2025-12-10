import { ref, computed, onMounted } from 'vue'
import translationService from '../translation'

export function useTranslations() {
  const isTranslationsLoaded = ref(translationService.isReady())
  
  // Set up callback to be notified when translations load
  onMounted(() => {
    translationService.onLoaded(() => {
      isTranslationsLoaded.value = true
    })
  })
  
  // Computed translation function that's reactive to loading state
  const t = computed(() => {
    return (key: string, fallback: string = '') => {
      if (!isTranslationsLoaded.value) {
        return fallback || '' // Return fallback while loading
      }
      
      const translation = translationService.get(key as any)
      // If translation is the same as the key, it means it wasn't found
      if (translation === key) {
        return fallback || key
      }
      return translation
    }
  })
  
  return {
    t: t.value, // Return the computed function value
    isTranslationsLoaded
  }
}
