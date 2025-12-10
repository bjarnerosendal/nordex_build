<template>
    <textarea v-if="Model" :name="Model.alias" :id="Model.id" class="form-control" type="text"
        :rows="Model?.settings?.numberOfRows" cols="20" :maxlength="Model?.settings?.maximumLength"
        :placeholder="Model?.settings?.placeholder" :autocomplete="Model?.settings?.autocompleteAttribute"
        :required="Model?.required ? true : null" v-model="value"
        :class="value && value != '' ? 'has-value' : ''"
        :pattern="Model?.pattern == null || Model?.pattern == '' ? null : Model?.pattern == '^[a-zA-Z0-9_\.\+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-\.]+$' ? '^[a-zA-Z0-9_\.\+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+$' : Model?.pattern"
        :title="Model?.patternInvalidErrorMessage"
        @input="onChange"></textarea>
</template>

<script setup lang="ts">
import { ref, onMounted, defineEmits } from 'vue'
import { FieldBase } from '@/models/fieldBase';

// Props
interface Props {
  Model: FieldTextArea;
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
      const target = e.target as HTMLInputElement;
      if (
        props.Model?.requiredErrorMessage && 
        props.Model?.required && 
        (target.value === '' || !target.value)
      ) {
        target.setCustomValidity("");
        target.setCustomValidity(props.Model.requiredErrorMessage);
      } else if (
        !target.validity.valid && 
        props.Model.patternInvalidErrorMessage && 
        props.Model.pattern
      ) {
        target.setCustomValidity("");
        target.setCustomValidity(props.Model.patternInvalidErrorMessage);
      }
    };
    
    element.oninput = function (e) {
      (e.target as HTMLInputElement).setCustomValidity("");
    };
  }
});
</script>
