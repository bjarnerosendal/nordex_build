import { LitElement, html, css } from '/umbraco/backoffice/external/lit/index.js';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';
import { UMB_ENTITY_CONTEXT } from "@umbraco-cms/backoffice/entity";
import { UmbContextConsumerController } from '@umbraco-cms/backoffice/context-api';
import { UMB_VARIANT_CONTEXT } from '@umbraco-cms/backoffice/variant';

export class TagGrouperPropertyEditorElement extends UmbElementMixin(LitElement) {
  static get properties() {
    return {
      value: { type: Array },
      config: { type: Object },
      global: { type: Boolean },
      _currentCulture: { state: true }
    };
  }

  set value(val) {
    // Handle both array format (legacy) and object format (new)
    if (Array.isArray(val)) {
      // Legacy array format - convert to new object format
      this._value = {
        global: false, // Default to local for legacy data
        groups: val
      };
    } else if (val && typeof val === 'object') {
      // New object format
      this._value = {
        global: val.global || false,
        groups: Array.isArray(val.groups) ? val.groups : []
      };
    } else {
      // Empty or invalid value
      this._value = {
        global: false,
        groups: []
      };
    }
    
    // Update the global property to match the stored value
    this.global = this._value.global;
  }

  get value() {
    return this._value || { global: false, groups: [] };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .tag-grouper {
        border: 1px solid var(--uui-color-border);
        border-radius: 6px;
        padding: 16px;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .title {
        font-size: 16px;
        font-weight: 600;
        color: var(--uui-color-text);
      }

      .global-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
      }

      .toggle-switch {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
      }

      .toggle-input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--uui-color-border);
        transition: .4s;
        border-radius: 24px;
      }

      .toggle-slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
      }

      .toggle-input:checked + .toggle-slider {
        background-color: var(--uui-color-positive);
      }

      .toggle-input:checked + .toggle-slider:before {
        transform: translateX(20px);
      }

      .culture-indicator {
        font-size: 12px;
        color: var(--uui-color-text-alt);
        background: var(--uui-color-surface-alt);
        padding: 4px 8px;
        border-radius: 12px;
        border: 1px solid var(--uui-color-border);
      }

      .add-group-btn {
        background: var(--uui-color-positive);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }

      .add-group-btn:hover {
        background: var(--uui-color-positive-emphasis);
      }

      .groups-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .group {
        border: 1px solid var(--uui-color-border-standalone);
        border-radius: 4px;
        padding: 12px;
        background: var(--uui-color-surface);
      }

      .group-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .group-name-input {
        border: 1px solid var(--uui-color-border);
        border-radius: 4px;
        padding: 8px;
        font-size: 14px;
        flex: 1;
        margin-right: 8px;
      }

      .remove-group-btn {
        background: var(--uui-color-danger);
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }

      .remove-group-btn:hover {
        background: var(--uui-color-danger-emphasis);
      }

      .tags-section {
        margin-top: 12px;
      }

      .tags-header {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 8px;
        color: var(--uui-color-text);
      }

      .available-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 12px;
        padding: 8px;
        background: var(--uui-color-surface-alt);
        border-radius: 4px;
        min-height: 40px;
      }

      .tag-item {
        background: var(--uui-color-interactive);
        color:white;
        border: none;
        padding: 4px 14px;
        border-radius: 14px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s ease;
      }

      .tag-item:hover {
        background: var(--uui-color-interactive-emphasis);
        transform: translateY(-1px);
      }

      .selected-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 8px;
        background: var(--uui-color-positive-surface);
        border-radius: 4px;
        min-height: 40px;
      }

      .selected-tag {
        background: var(--uui-color-positive);
        color: white;
        border: none;
        padding: 4px 14px;
        border-radius: 14px;
        cursor: pointer;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .selected-tag:hover {
        background: var(--uui-color-positive-emphasis);
      }

      .remove-tag {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 10px;
        padding: 0;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .remove-tag:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .loading {
        text-align: center;
        padding: 20px;
        color: var(--uui-color-text-alt);
      }

      .empty-state {
        text-align: center;
        padding: 20px;
        color: var(--uui-color-text-alt);
        font-style: italic;
      }
    `;
  }

  constructor() {
    super();
    this._value = { global: false, groups: [] };
    this.availableTags = [];
    this.isLoading = false;
    this.global = false; // Default to local (node-specific) tags
    this._currentCulture = null;
    
    // Consume the variant context to get current culture
    new UmbContextConsumerController(this, UMB_VARIANT_CONTEXT, async (variantCtx) => {
       const culture = await variantCtx?.getCulture();
      
      // Try alternative methods if culture is null
      if (!culture) {
         
        // Method 1: Try to extract from Umbraco's URL path structure
        // Pattern: /umbraco/section/content/workspace/document/edit/{id}/{culture}/...
        const pathMatch = window.location.pathname.match(/\/edit\/[a-f0-9-]+\/([a-z]{2}-[A-Z]{2})\//i);
        const cultureFromPath = pathMatch ? pathMatch[1] : null;
     
        
        // Method 2: Try to get culture from any part of the URL
        const fullUrlMatch = window.location.href.match(/\/([a-z]{2}-[A-Z]{2})\//i);
        const cultureFromFullUrl = fullUrlMatch ? fullUrlMatch[1] : null;

        
        this._currentCulture = cultureFromPath || cultureFromFullUrl || umbracoCurrentCulture || null;
      } else {
        this._currentCulture = culture;
      }
      
      // Reload tags when culture changes
      if (this._entityContext) {
        this.loadAvailableTags();
      }
    });
    
    // Consume the entity context
    this.consumeContext(UMB_ENTITY_CONTEXT, (context) => {
      this._entityContext = context;
    });
  }

  connectedCallback() {
    super.connectedCallback();
    
    // Ensure value has the correct structure
    if (!this.value || typeof this.value !== 'object') {
      this.value = { global: false, groups: [] };
    }
    
    // Try to detect culture if not already set
    if (!this._currentCulture) {
      this.detectCultureFromUrl();
    }
    
    // Add a small delay to ensure Umbraco context is available
    setTimeout(() => {
      this.loadAvailableTags();
    }, 100);
  }

  detectCultureFromUrl() {
  
    
   // Method 1: Try to extract from Umbraco's URL path structure
        // Pattern: /umbraco/section/content/workspace/document/edit/{id}/{culture}/...
        const pathMatch = window.location.pathname.match(/\/edit\/[a-f0-9-]+\/([a-z]{2}-[A-Z]{2})\//i);
        const cultureFromPath = pathMatch ? pathMatch[1] : null;
   

        
        // Method 2: Try to get culture from any part of the URL
        const fullUrlMatch = window.location.href.match(/\/([a-z]{2}-[A-Z]{2})\//i);
        const cultureFromFullUrl = fullUrlMatch ? fullUrlMatch[1] : null;
    
    // Set culture with priority: edit path > any path > params > hash
    this._currentCulture = cultureFromPath || cultureFromFullUrl || null;

    if (this._currentCulture) {
      this.requestUpdate();
    }
  }

  async loadAvailableTags() {
    this.isLoading = true;
    this.requestUpdate();
    
    try {
      let apiUrl = '/api/tags';
      const params = new URLSearchParams();
      
      // Only add nodeId if global is false
      if (!this.global) {
        const currentNodeId = this.getCurrentNodeId();
        
        if (currentNodeId) {
          params.append('nodeId', currentNodeId);
        }
      }
      
      // Add culture parameter if available
      if (this._currentCulture) {
        params.append('culture', this._currentCulture);
      }
      
      if (params.toString()) {
        apiUrl += `?${params.toString()}`;
      }
      
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        this.availableTags = data.tags || [];
      } else {
        console.error('TagGrouper: API request failed:', response.status, response.statusText);
        // Try without nodeId as fallback only if we were using local mode
        if (!this.global) {
          const fallbackUrl = this._currentCulture ? `/api/tags?culture=${this._currentCulture}` : '/api/tags';
          const fallbackResponse = await fetch(fallbackUrl);
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            this.availableTags = fallbackData.tags || [];
          }
        }
      }
    } catch (error) {
      console.error('Failed to load available tags:', error);
      // Set empty array so UI doesn't stay in loading state
      this.availableTags = [];
    } finally {
      this.isLoading = false;
      this.requestUpdate();
    }
  }

  getCurrentNodeId() {
    // Use Umbraco's entity context to get the current node ID
    const nodeId = this._entityContext?.getUnique();
    
    return nodeId;
  }

  toggleGlobal() {
    this.global = !this.global;
    
    // Update the stored value
    this._value = {
      ...this.value,
      global: this.global
    };
    
    this.dispatchValueChange();
    
    // Reload tags when toggling
    this.loadAvailableTags();
  }

  addGroup() {
    // Ensure value has the correct structure
    const currentValue = this.value;
    const groups = Array.isArray(currentValue.groups) ? currentValue.groups : [];
    
    const newGroup = {
      groupName: '',
      tags: []
    };
    
    this._value = {
      ...currentValue,
      groups: [...groups, newGroup]
    };
    
    this.dispatchValueChange();
    this.requestUpdate();
  }

  removeGroup(index) {
    // Ensure value has the correct structure
    const currentValue = this.value;
    const groups = Array.isArray(currentValue.groups) ? currentValue.groups : [];
    
    this._value = {
      ...currentValue,
      groups: groups.filter((_, i) => i !== index)
    };
    
    this.dispatchValueChange();
    this.requestUpdate();
  }

  updateGroupName(index, name) {
    // Ensure value has the correct structure
    const currentValue = this.value;
    const groups = Array.isArray(currentValue.groups) ? currentValue.groups : [];
    
    this._value = {
      ...currentValue,
      groups: groups.map((group, i) => 
        i === index ? { ...group, groupName: name } : group
      )
    };
    
    this.dispatchValueChange();
    this.requestUpdate();
  }

  addTagToGroup(groupIndex, tag) {
    // Ensure value has the correct structure
    const currentValue = this.value;
    const groups = Array.isArray(currentValue.groups) ? currentValue.groups : [];
    
    this._value = {
      ...currentValue,
      groups: groups.map((group, i) => {
        if (i === groupIndex) {
          // Ensure group has proper structure
          const safeGroup = {
            groupName: group?.groupName || '',
            tags: Array.isArray(group?.tags) ? group.tags : []
          };
          
          if (!safeGroup.tags.includes(tag)) {
            return { ...safeGroup, tags: [...safeGroup.tags, tag] };
          }
          return safeGroup;
        }
        return group;
      })
    };
    
    this.dispatchValueChange();
    this.requestUpdate();
  }

  removeTagFromGroup(groupIndex, tag) {
    // Ensure value has the correct structure
    const currentValue = this.value;
    const groups = Array.isArray(currentValue.groups) ? currentValue.groups : [];
    
    this._value = {
      ...currentValue,
      groups: groups.map((group, i) => {
        if (i === groupIndex) {
          // Ensure group has proper structure
          const safeGroup = {
            groupName: group?.groupName || '',
            tags: Array.isArray(group?.tags) ? group.tags : []
          };
          
          return { ...safeGroup, tags: safeGroup.tags.filter(t => t !== tag) };
        }
        return group;
      })
    };
    
    this.dispatchValueChange();
    this.requestUpdate();
  }

  getAvailableTagsForGroup(groupIndex) {
    // Ensure value has correct structure and availableTags exists
    const currentValue = this.value;
    const groups = Array.isArray(currentValue.groups) ? currentValue.groups : [];
    
    if (!Array.isArray(this.availableTags)) {
      return [];
    }
    
    const usedTags = groups[groupIndex]?.tags || [];
    return this.availableTags.filter(tag => !usedTags.includes(tag));
  }

  dispatchValueChange() {
    this.dispatchEvent(new CustomEvent('property-value-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    // Ensure value has the correct structure
    const currentValue = this.value;
    const groups = Array.isArray(currentValue.groups) ? currentValue.groups : [];
    
    if (this.isLoading) {
      return html`
        <div class="tag-grouper">
          <div class="loading">Loading available tags...</div>
        </div>
      `;
    }

    return html`
      <div class="tag-grouper">
        <div class="header">
          <div class="header-left">
            <div class="title">Tag Groups</div>
            <div class="global-toggle">
              <span>Local</span>
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  class="toggle-input"
                  .checked=${currentValue.global || false}
                  @change=${this.toggleGlobal}
                />
                <span class="toggle-slider"></span>
              </label>
              <span>Global</span>
            </div>
            ${this._currentCulture ? html`
              <div class="culture-indicator" title="Current culture for tags">
                🌍 ${this._currentCulture}
              </div>
            ` : ''}
          </div>
          <button class="add-group-btn" @click=${this.addGroup}>
            Add Group
          </button>
        </div>

        ${groups.length === 0 ? html`
          <div class="empty-state">
            No tag groups defined. Click "Add Group" to create your first group.
          </div>
        ` : ''}

        <div class="groups-container">
          ${groups.map((group, groupIndex) => {
            // Ensure group has required properties
            const safeGroup = {
              groupName: group?.groupName || '',
              tags: Array.isArray(group?.tags) ? group.tags : []
            };
            
            return html`
            <div class="group">
              <div class="group-header">
                <input
                  class="group-name-input"
                  type="text"
                  placeholder="Enter group name (e.g., Color, Size, Material)"
                  .value=${safeGroup.groupName}
                  @input=${(e) => {
                    this.updateGroupName(groupIndex, e.target.value);
                  }}
                />
                <button 
                  class="remove-group-btn" 
                  @click=${() => this.removeGroup(groupIndex)}
                >
                  Remove
                </button>
              </div>

              <div class="tags-section">
                <div class="tags-header">Available Tags (click to add):</div>
                <div class="available-tags">
                  ${this.getAvailableTagsForGroup(groupIndex).length === 0 ? html`
                    <span style="color: var(--uui-color-text-alt); font-style: italic;">
                      All tags are already assigned to this group
                    </span>
                  ` : ''}
                  ${this.getAvailableTagsForGroup(groupIndex).map(tag => html`
                    <button 
                      class="tag-item"
                      @click=${() => this.addTagToGroup(groupIndex, tag)}
                    >
                      ${tag}
                    </button>
                  `)}
                </div>

                <div class="tags-header">Selected Tags:</div>
                <div class="selected-tags">
                  ${safeGroup.tags.length === 0 ? html`
                    <span style="color: var(--uui-color-text-alt); font-style: italic;">
                      No tags selected for this group
                    </span>
                  ` : ''}
                  ${safeGroup.tags.map(tag => html`
                    <div class="selected-tag"   @click=${() => this.removeTagFromGroup(groupIndex, tag)}>
                      ${tag}
                      <button 
                        class="remove-tag"
                      
                        title="Remove tag"
                      >
                        ×
                      </button>
                    </div>
                  `)}
                </div>
              </div>
            </div>
            `;
          })}
        </div>
      </div>
    `;
  }
}

customElements.define('tag-grouper-property-editor', TagGrouperPropertyEditorElement);
