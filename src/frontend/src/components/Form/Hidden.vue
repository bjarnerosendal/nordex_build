<template>
    <input type="hidden" :name="Model.alias" :id="Model.id" class="hidden" :value="valueReplaceByPattern(value)" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FieldBase } from '@/models/fieldBase';

// Props
interface Props {
  Model: FieldBase;
}
const props = defineProps<Props>();

// Reactive state
const value = ref(props.Model?.settings?.defaultValue || '');

// Methods
const valueReplaceByPattern = (inputValue: string) => {
  // Add your pattern replacement logic here if needed
  return inputValue;
};
</script>
