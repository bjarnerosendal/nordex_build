<template>
    <select v-if="Model" v-model="value" :class="value != '' ? 'has-value' : ''" :name="Model?.alias" :id="Model.id"
        :multiple="Model.settings?.allowMultipleSelections === true || Model.settings?.allowMultipleSelections === 'True'" :autocomplete="Model?.settings?.autocompleteAttribute"
        :required="Model?.required" @change="onChange" class="form-control">
        <option v-if="Model.settings?.allowMultipleSelections !== 'True'" value="">{{ Model?.settings?.placeholder || 'Vælg en option...' }}</option>
        <option v-for="item in Model.preValues" :key="item.value" :value="item.value" :selected="item.value == Model.settings?.defaultValue">
            {{ item.caption }}
        </option>
    </select>
</template>

<script setup lang="ts">
import { ref, onMounted, defineEmits } from 'vue'
import { FieldDropdown } from '@/models/fieldDropdown'
import { FieldBase } from '@/models/fieldBase';

// Props
interface Props {
  Model: FieldDropdown;
}
const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  fieldChange: [field: FieldBase]
}>();

// Reactive state
const value = ref(props.Model?.settings?.defaultValue || '');

// Methods
const onChange = () => {
  const field = props.Model as FieldBase;
  field.value = value.value;
  emit('fieldChange', field);
};

// Lifecycle
onMounted(() => {
  const element = document.getElementById(props.Model.id);
  if (element) {
    element.oninvalid = function (e) {
      const target = e.target as HTMLSelectElement;
      if (
        props.Model?.requiredErrorMessage && 
        props.Model?.required && 
        (target.value === '' || !target.value)
      ) {
        target.setCustomValidity("");
        target.setCustomValidity(props.Model.requiredErrorMessage);
      }
    };
    
    element.oninput = function (e) {
      (e.target as HTMLSelectElement).setCustomValidity("");
    };
  }
});
</script>
