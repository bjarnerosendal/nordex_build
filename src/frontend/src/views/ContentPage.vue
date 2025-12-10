<template>
  <div class="content-page" v-if="pageContent">
    <h1>{{ pageContent.title }}</h1>
    
    <div class="content-blocks" v-if="pageContent.blocks && pageContent.blocks.length">
      <div v-for="(block, index) in pageContent.blocks" :key="index" class="content-block my-4">
        <component 
          :is="getComponentForBlock(block.type)" 
          :data="block.data"
        />
      </div>
    </div>
    
    <div v-else class="placeholder-content">
      <div class="alert alert-info">
        This is a placeholder for dynamic content that will be loaded from the Umbraco backend.
        The page would typically display the block grid content configured in the Content Page document type.
      </div>
      
      <div class="card mb-4">
        <div class="card-header">
          <h3>Text and Links Example</h3>
        </div>
        <div class="card-body">
          <h4>Sample Headline</h4>
          <div class="rich-text mb-3">
            <p>This is an example of rich text content that would be managed through Umbraco.</p>
            <p>The content editor would be able to format text, add links, and more.</p>
          </div>
          <div class="links">
            <a href="#" class="btn btn-primary me-2">Link 1</a>
            <a href="#" class="btn btn-outline-primary">Link 2</a>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading">
    <p>Loading content...</p>
  </div>
</template>

<script lang="ts">
// Import block components
import { defineComponent, PropType } from 'vue';
import TextAndLinksBlock from '@/components/blocks/TextAndLinksBlock.vue';

interface Block {
  type: string;
  data: Record<string, any>;
}

interface PageContent {
  title: string;
  blocks: Block[];
}

export default defineComponent({
  name: 'ContentPage',
  components: {
    TextAndLinksBlock
  },
  props: {
    id: {
      type: String as PropType<string>,
      required: true
    }
  },
  data() {
    return {
      pageContent: null as PageContent | null,
      loading: true,
      error: null as Error | null
    };
  },
  created() {
    // In a real application, this would fetch data from the Umbraco API
    // For now, we'll just simulate some content after a delay
    setTimeout(() => {
      this.pageContent = {
        title: `Content Page ${this.id}`,
        blocks: []  // In a real app, this would contain actual block data
      };
      this.loading = false;
    }, 500);
  },
  methods: {
    getComponentForBlock(blockType: string): string {
      // This would map block types to component names
      const blockComponentMap: Record<string, string> = {
        'textAndLinks': 'TextAndLinksBlock',
        // Add more block types as needed
      };
      
      return blockComponentMap[blockType] || 'div';
    }
  }
});
</script>

<style lang="scss" scoped>
.content-page {
  h1 {
    margin-bottom: 1.5rem;
  }
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}
</style>
