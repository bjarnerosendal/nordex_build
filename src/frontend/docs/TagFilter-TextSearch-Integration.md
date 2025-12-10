# TagFilter Component - Text Search Integration

## Overview

The TagFilter component now supports free text search functionality that integrates seamlessly with the Umbraco backend and ContentSearchController API. This document explains how the `addTextSearch` property flows from Umbraco to the Vue component.

## Architecture Flow

```
Umbraco CMS → Razor View → HTML Data Attributes → JavaScript Component Mount → Vue Component
```

## 1. Umbraco Content Type Configuration

**File:** `uSync/v16/ContentTypes/tagfilter.config`

The TagFilter element type includes an `addTextSearch` property:

```xml
<GenericProperty>
  <Key>0f36fe83-7ea9-42f4-9a15-48a2eb1d334f</Key>
  <Name>Add text search</Name>
  <Alias>addTextSearch</Alias>
  <Definition>92897bc6-a5f3-4ffe-ae27-f2e7e33dda49</Definition>
  <Type>Umbraco.TrueFalse</Type>
  <Mandatory>false</Mandatory>
  <Tab Alias="content">Content</Tab>
</GenericProperty>
```

This creates a toggle switch in the Umbraco backoffice that content editors can use to enable/disable text search.

## 2. Razor View Integration

**File:** `Views/Partials/blockgrid/Components/TagFilter.cshtml`

The Razor view extracts the property value and passes it as a data attribute:

```csharp
@{
    var addTextSearch = content.Value<bool>("addTextSearch");
}

<div class="tag-filter-component" 
     data-component="tag-filter" 
     data-add-text-search="@addTextSearch.ToString().ToLower()"
     data-title="@title" 
     data-tag-groups="@HttpUtility.HtmlAttributeEncode(tagGroupsJson)"
     data-global-search="@globalSearch.ToString().ToLower()"
     data-language="@language"
     @(string.IsNullOrEmpty(finalNodeId) ? "" : $"data-node-id=\"{finalNodeId}\"")>
```

### Key Features:
- ✅ **Boolean conversion**: `addTextSearch.ToString().ToLower()` ensures "true"/"false" string output
- ✅ **HTML entity encoding**: Prevents XSS and ensures proper attribute values
- ✅ **Conditional node ID**: Uses filterNodeId or currentPageId as appropriate

## 3. JavaScript Component Mounting

**File:** `component-mount.ts`

The component mounting system extracts data attributes and passes them as Vue props:

```typescript
// Helper function to parse boolean data attributes
function parseBooleanAttribute(value: string | null): boolean {
  if (!value) return false
  return value.toLowerCase() === 'true'
}

// Legacy component mounting for backward compatibility
function mountLegacyComponents() {
  document.querySelectorAll('[data-component="tag-filter"]').forEach((element) => {
    // Extract data attributes for props
    const title = element.getAttribute('data-title') || 'Filter by Tags'
    const showAllOption = element.getAttribute('data-show-all') !== 'false'
    const nodeId = element.getAttribute('data-node-id') || undefined
    const language = element.getAttribute('data-language') || 'en-US'
    const addTextSearch = parseBooleanAttribute(element.getAttribute('data-add-text-search'))
    const globalSearch = parseBooleanAttribute(element.getAttribute('data-global-search'))
    
    // Create Vue app for this element
    const props = {
      title,
      showAllOption,
      nodeId,
      tagGroups,
      language,
      addTextSearch,
      global: globalSearch
    }
    
    console.log('Mounting TagFilter with props:', props)
    
    const app = createApp(TagFilter, props)
    app.mount(element)
  })
}
```

### Key Features:
- ✅ **Robust boolean parsing**: `parseBooleanAttribute()` handles null/undefined values safely
- ✅ **Debug logging**: Console output shows exactly what props are passed to Vue
- ✅ **Error handling**: Try/catch blocks prevent mounting failures

## 4. Vue Component Implementation

**File:** `components/blocks/TagFilter.vue`

The Vue component receives the `addTextSearch` prop and conditionally renders the search field:

```vue
<template>
  <div class="tag-filter-component" data-component="tag-filter">
    <div class="tag-filter-layout">
      <!-- Left side: Tag selector -->
      <div class="tag-filter-sidebar">
        <!-- Text search input -->
        <div v-if="addTextSearch" class="text-search-section">
          <h4 class="search-section-title">Text Search</h4>
          <div class="text-search-input-container">
            <div class="search-icon">🔍</div>
            <input
              v-model="searchQuery"
              type="text"
              class="text-search-input"
              placeholder="Search in content..."
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
              title="Clear search"
            >
              ×
            </button>
          </div>
        </div>
        <!-- ... rest of component -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  showAllOption?: boolean
  initialTags?: string[]
  tagGroups?: TagGroup[]
  nodeId?: string
  language?: string
  global?: boolean
  addTextSearch?: boolean  // ← This prop controls text search visibility
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Filter by Tags',
  showAllOption: true,
  initialTags: () => [],
  tagGroups: () => [],
  nodeId: undefined,
  language: 'en-US',
  global: false,
  addTextSearch: false  // ← Default is false (hidden)
})
</script>
```

### Key Features:
- ✅ **Conditional rendering**: `v-if="addTextSearch"` shows/hides search field based on Umbraco setting
- ✅ **Debounced search**: 300ms delay prevents excessive API calls while typing
- ✅ **Event system**: Emits `searchQueryChanged` events for parent components
- ✅ **UX enhancements**: Search icon, clear button, Enter key support

## 5. API Integration

**File:** `components/blocks/ContentResults.vue`

The search query is passed to the ContentSearchController API:

```typescript
// Add text search query parameter
if (props.searchQuery && props.searchQuery.trim()) {
  queryParams.append('query', props.searchQuery.trim())
}

const response = await fetch(`/api/contentsearch?${queryParams.toString()}`)
```

The `query` parameter matches the `Query` property in `PageSearchRequest` model, ensuring proper API integration.

## Usage Examples

### 1. Enable Text Search in Umbraco
1. Edit a page with a TagFilter block
2. Toggle "Add text search" to **ON**
3. Save and publish

### 2. Component Output
With `addTextSearch: true`:
```html
<div data-component="tag-filter" 
     data-add-text-search="true"
     data-title="Filter Content">
  <!-- Text search field will be rendered -->
</div>
```

With `addTextSearch: false`:
```html
<div data-component="tag-filter" 
     data-add-text-search="false"
     data-title="Filter Content">
  <!-- Text search field will be hidden -->
</div>
```

### 3. API Requests
When user types "recipe" in search field:
```
GET /api/contentsearch?query=recipe&tags=vegetarian&lang=en-US&skip=0&take=10
```

## Debugging

### Check Console Output
The mounting system logs detailed information:
```javascript
console.log('Mounting TagFilter with props:', {
  title: "Filter Content",
  addTextSearch: true,
  tagGroups: [...],
  language: "en-US"
})
```

### Verify Data Attributes
Inspect the HTML element to confirm attributes are set correctly:
```html
<div data-component="tag-filter" 
     data-add-text-search="true"
     data-title="Filter Content"
     data-language="en-US">
```

## Error Handling

The system includes multiple layers of error handling:

1. **Razor level**: Safe boolean conversion with `.ToString().ToLower()`
2. **JavaScript level**: `parseBooleanAttribute()` handles null/undefined values
3. **Vue level**: Default prop values prevent undefined behavior
4. **API level**: Graceful handling of missing or invalid query parameters

## Performance Considerations

- ✅ **Debounced search**: 300ms delay reduces API load
- ✅ **Conditional rendering**: Text search UI only rendered when enabled
- ✅ **Lazy mounting**: Components only mount when detected in DOM
- ✅ **Efficient updates**: Vue reactivity handles prop changes automatically

## Backward Compatibility

The integration maintains full backward compatibility:
- Existing TagFilter blocks without `addTextSearch` property default to `false`
- Legacy component mounting continues to work alongside new data attribute system
- API remains unchanged - `query` parameter is optional

## Testing Checklist

- [ ] Toggle `addTextSearch` in Umbraco backoffice
- [ ] Verify text search field appears/disappears on frontend
- [ ] Test search functionality with API integration
- [ ] Confirm debouncing works (300ms delay)
- [ ] Verify clear button functionality
- [ ] Test Enter key to trigger search
- [ ] Check console logs for proper prop passing
- [ ] Validate HTML data attributes in browser inspector
