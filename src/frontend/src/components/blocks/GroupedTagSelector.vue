<template>
  <div class="grouped-tag-selector">
    <h3 v-if="displayTitle" class="selector-title mb-3">{{ displayTitle }}</h3>

    <!-- Selected tags summary -->
    <div v-if="selectedTags.size > 0 && !isAllSelected" class="selected-summary mt-3">
      <div class="summary-header mb-2">{{ t('GroupedTagSelector.SelectedFilters', 'Selected filters:') }}</div>
      <div class="selected-tags d-flex flex-wrap">
        <span
            v-for="tag in Array.from(selectedTags)"
            :key="tag"
            class="selected-tag me-1 mb-1"
            @click="toggleTag(tag)"
        >
          {{ tag }} ×
        </span>
      </div>
    </div>
    
    <!-- Tag Groups -->
    <div class="tag-groups">
      <div 
        v-for="group in tagGroups" 
        :key="group.groupName"
        class="tag-group"
      >
        <div class="group-header d-flex justify-content-between align-items-center" @click="toggleGroup(group.groupName)">
          <span class="group-title">{{ group.groupName }}</span>
          <span 
            class="dropdown-arrow" 
            :class="{ 'expanded': expandedGroups.has(group.groupName) }"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </div>
        
        <div 
          class="group-content" 
          :class="{ 'expanded': expandedGroups.has(group.groupName) }"
        >
          <div class="tag-options">
            <label 
              v-for="tag in group.tags" 
              :key="tag"
              class="checkbox-item d-flex align-items-center"
            >
              <input 
                type="checkbox" 
                :value="tag"
                :checked="selectedTags.has(tag)"
                @change="toggleTag(tag)"
              />
              <span class="checkmark"></span>
              <span class="label-text">{{ tag }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineProps, defineEmits, watch } from 'vue'
import { useTranslations } from '../../composables/useTranslations'

// Use the translation composable
const { t } = useTranslations()

interface TagGroup {
  groupName: string
  tags: string[]
}

interface Props {
  title?: string
  showAllOption?: boolean
  tagGroups?: TagGroup[]
  nodeId?: string
  initialSelectedTags?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showAllOption: true,
  tagGroups: () => [],
  nodeId: undefined,
  initialSelectedTags: () => []
})

const emit = defineEmits<{
  tagsChanged: [tags: string[]]
}>()

const selectedTags = ref<Set<string>>(new Set())
const expandedGroups = ref<Set<string>>(new Set())

// Reactive title that falls back to default translation if no title provided
const displayTitle = computed(() => {
  return props.title || t('GroupedTagSelector.FilterByTags', 'Filter by Tags')
})

// Initialize selectedTags with initial values
onMounted(() => {
  if (props.initialSelectedTags && props.initialSelectedTags.length > 0) {
    selectedTags.value = new Set(props.initialSelectedTags)
  }
})

// Watch for changes to initialSelectedTags prop
watch(() => props.initialSelectedTags, (newTags) => {
  if (newTags) {
    selectedTags.value = new Set(newTags)
  }
}, { immediate: true })

const isAllSelected = computed(() => {
  return selectedTags.value.size === 0
})

const toggleAll = () => {
  selectedTags.value.clear()
  emitChange()
}

const toggleTag = (tag: string) => {
  if (selectedTags.value.has(tag)) {
    selectedTags.value.delete(tag)
  } else {
    selectedTags.value.add(tag)
  }
  emitChange()
}

const toggleGroup = (groupName: string) => {
  if (expandedGroups.value.has(groupName)) {
    expandedGroups.value.delete(groupName)
  } else {
    expandedGroups.value.add(groupName)
  }
}

const emitChange = () => {
  const selectedArray = Array.from(selectedTags.value)
  
  // Build the tag group query string
  const tagQueryString = buildTagGroupQuery()
  
  emit('tagsChanged', selectedArray)
  
  // Dispatch custom event for backward compatibility
  const filterEvent = new CustomEvent('tagFilterChanged', {
    detail: {
      tags: selectedArray,
      tagQuery: tagQueryString,
      isAllSelected: isAllSelected.value,
      component: 'vue-grouped-tag-selector'
    },
    bubbles: true
  })
  
  document.dispatchEvent(filterEvent)
}

const buildTagGroupQuery = (): string => {
  if (selectedTags.value.size === 0) {
    return ''
  }

  // Group selected tags by their original groups
  const groupedSelectedTags: { [groupName: string]: string[] } = {}
  
  props.tagGroups?.forEach(group => {
    const selectedInGroup = group.tags.filter(tag => selectedTags.value.has(tag))
    if (selectedInGroup.length > 0) {
      groupedSelectedTags[group.groupName] = selectedInGroup
    }
  })

  // If no groups or only one group, use simple format
  const groupNames = Object.keys(groupedSelectedTags)
  if (groupNames.length === 0) {
    return ''
  }
  
  if (groupNames.length === 1) {
    const tags = groupedSelectedTags[groupNames[0]]
    if (tags.length === 1) {
      return tags[0] // Single tag, no parentheses needed
    }
    return `(${tags.map(tag => `"${tag}"`).join(' or ')})` // Single group with multiple tags
  }

  // Multiple groups: ((group1) and (group2) and (group3))
  const groupExpressions = groupNames.map(groupName => {
    const tags = groupedSelectedTags[groupName]
    if (tags.length === 1) {
      return `("${tags[0]}")`
    }
    return `(${tags.map(tag => `"${tag}"`).join(' or ')})`
  })

  return `(${groupExpressions.join(' and ')})`
}

// Watch for prop changes
watch(() => props.tagGroups, (newGroups) => {
  // Expand first group by default if there are groups
  if (newGroups && newGroups.length > 0 && expandedGroups.value.size === 0) {
    expandedGroups.value.add(newGroups[0].groupName)
  }
}, { immediate: true })

onMounted(() => {
  // Initialize with first group expanded if available
  if (props.tagGroups && props.tagGroups.length > 0) {
    expandedGroups.value.add(props.tagGroups[0].groupName)
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/variables';

.grouped-tag-selector {
  font-family: $font-family-sans-serif;
  margin-bottom: $spacer;
}

.selector-title {
  margin-bottom: map-get($spacers, 3);
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $nordex-brown;
  font-family: $headings-font-family;
}

.all-option {
  margin-bottom: map-get($spacers, 4);
  padding: map-get($spacers, 3);
  background-color: $nordex-cream-alt;
  border: 2px solid #ECE8DB;
  border-radius: $border-radius;
}

.tag-groups {
  display: flex;
  flex-direction: column;
  gap: map-get($spacers, 2);
}

.tag-group {
  border: 2px solid #ECE8DB;
  border-radius: $border-radius;
  overflow: hidden;
  background-color: $white;
  
}

.tag-group:has(.group-header:hover) {
  border-color: $nordex-beige;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: map-get($spacers, 3) map-get($spacers, 4);
  background-color: $nordex-cream-alt;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: $nordex-beige;
  }
}

.group-title {
  font-weight: $font-weight-medium;
  color: $nordex-brown;
  font-size: $font-size-base;
}

.dropdown-arrow {
  transition: transform 0.2s ease;
  color: $nordex-grey;
  font-size: $font-size-sm;

  &.expanded {
    transform: rotate(180deg);
  }
}

.group-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;

  &.expanded {
    max-height: 400px;
    transition: max-height 0.3s ease-in;
  }
}

.tag-options {
  padding: map-get($spacers, 4);
  display: flex;
  flex-direction: column;
  gap: map-get($spacers, 2);
  background-color: $white;
}

.checkbox-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: map-get($spacers, 1) 0;
  transition: background-color 0.2s ease;
  border-radius: $border-radius-sm;

  &:hover {
    background-color: $nordex-cream;
  }

  input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
}

.checkmark {
  position: relative;
  height: 1.25rem;
  width: 1.25rem;
  background-color: $white;
  border: 2px solid $nordex-cream-alt;
  border-radius: $border-radius-sm;
  margin-right: map-get($spacers, 2);
  transition: all 0.2s ease;

  &:after {
    content: "";
    position: absolute;
    display: none;
    left: 0.4rem;
    top: 0.2rem;
    width: 0.25rem;
    height: 0.5rem;
    border: solid $white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
}

.checkbox-item:hover .checkmark {
  border-color: $nordex-brown;
}

.checkbox-item input:checked ~ .checkmark {
  background-color: $nordex-brown;
  border-color: $nordex-brown;

  &:after {
    display: block;
  }
}

.label-text {
  color: $nordex-dark-brown;
  font-size: $font-size-sm;
  user-select: none;
}

.selected-summary {
  margin-top: map-get($spacers, 4);
  padding-bottom: $spacer;
  //padding: map-get($spacers, 3);
  //background-color: $nordex-cream-alt;
  border-radius: $border-radius;
}

.summary-header {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $nordex-brown;
  margin-bottom: map-get($spacers, 2);
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: map-get($spacers, 1);
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  padding: map-get($spacers, 1) map-get($spacers, 3);
  background-color: $nordex-brown;
  color: $nordex-cream;
  font-weight: 500;
  border-radius: 1rem;
  font-size: $font-size-xs;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: darken($nordex-brown, 10%);
  }
}

// Responsive design
@media (max-width: 576px) {
  .grouped-tag-selector {
    margin: map-get($spacers, 2) 0;
  }
  
  .group-header {
    padding: map-get($spacers, 2) map-get($spacers, 3);
  }
  
  .tag-options {
    padding: map-get($spacers, 3);
  }
  
  .selector-title {
    font-size: $font-size-base;
  }
}
</style>
