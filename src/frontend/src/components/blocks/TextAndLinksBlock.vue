<template>
  <div class="text-and-links-block">
    <h3 v-if="data.headline" class="block-headline">{{ data.headline }}</h3>
    <div v-if="data.text" class="block-text" v-html="data.text"></div>
    <div v-if="data.links && data.links.length" class="block-links mt-3">
      <a 
        v-for="(link, index) in data.links" 
        :key="index" 
        :href="link.url" 
        :target="link.target || '_self'"
        class="btn btn-primary btn-outline me-2 mb-2"
      >
        {{ link.name }}
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

interface Link {
  url: string;
  name?: string;
  target?: string;
}

interface TextAndLinksData {
  headline?: string;
  text?: string;
  links?: Link[];
}

export default defineComponent({
  name: 'TextAndLinksBlock',
  props: {
    data: {
      type: Object as PropType<TextAndLinksData>,
      required: true,
      default: (): TextAndLinksData => ({
        headline: '',
        text: '',
        links: []
      })
    }
  }
});
</script>

<style lang="scss" scoped>
.text-and-links-block {
  padding: 1rem;
  
  .block-headline {
    margin-bottom: 1rem;
  }
  
  .block-text {
    margin-bottom: 1rem;
    
    // Styling for rich text content
    :deep(p) {
      margin-bottom: 1rem;
    }
    
    :deep(ul), :deep(ol) {
      margin-bottom: 1rem;
      padding-left: 1.5rem;
    }
  }
  .btn {
    border-radius: 1.5rem;
  }
}
</style>
