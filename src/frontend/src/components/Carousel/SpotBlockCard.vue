<template>
  <div :class="[spotBlock.backgroundColor, 'rounded-edges overflow-hidden h-100 d-flex flex-column']">
    <img 
      v-if="spotBlock.image" 
      :src="spotBlock.image" 
      :alt="spotBlock.imageAlt" 
      class="img-fluid" 
    />
    <div class="px-4 py-3">
      <div 
        v-if="spotBlock.trumpet" 
        :class="[spotBlock.textColor, 'spotBlock-trumpet text-uppercase mb-1']"
      >
        {{ spotBlock.trumpet }}
      </div>
      <h2 
        v-if="spotBlock.headline"
        :class="[spotBlock.textColor, 'font-size-30 font-weight-black mb-3 text-uppercase']"
      >
        {{ spotBlock.headline }}
      </h2>
      <div 
        v-if="spotBlock.teaser"
        :class="[spotBlock.textColor, 'font-size-15']"
      >
        {{ spotBlock.teaser }}
      </div>
      <a 
        v-if="spotBlock.link"
        :href="spotBlock.link.url" 
        class="btn btn-primary btn-lg me-3 my-4 mb-3" 
        :target="spotBlock.link.target"
      >
        {{ spotBlock.link.name }}
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export interface SpotBlockItem {
  id: string | number;
  image: string;
  imageAlt: string;
  trumpet?: string;
  headline: string;
  teaser?: string;
  link?: {
    url: string;
    name: string;
    target: string;
  };
  backgroundColor: string;
  textColor: string;
}

export default defineComponent({
  name: 'SpotBlockCard',
  props: {
    spotBlock: {
      type: Object as PropType<SpotBlockItem>,
      required: true
    }
  }
});
</script>

<style lang="scss" scoped>
.spotBlock-trumpet {
  font-weight: 600;
  letter-spacing: 0.05em;
}

.font-size-30 {
  font-size: 1.875rem;
}

.font-size-15 {
  font-size: 0.9375rem;
}

.font-weight-black {
  font-weight: 900;
}
</style>
