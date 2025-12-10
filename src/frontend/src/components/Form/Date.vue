<template>
    <input v-if="Model" type="date" :name="Model.alias" :id="Model.id" class="form-control"
        :class="value != '' ? 'has-value' : ''" :maxlength="Model?.settings?.maximumLength" 
        :placeholder="Model?.settings?.placeholder" :autocomplete="Model?.settings?.autocompleteAttribute" 
        :required="Model?.required" v-model="value" @input="onChange" />
</template>

<script setup lang="ts">
import { ref, onMounted, defineEmits } from 'vue'
import { FieldText } from '@/models/fieldText';
import { FieldBase } from '@/models/fieldBase';


// Props
interface Props {
  Model: FieldText;
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
      }
    };
    
    element.oninput = function (e) {
      (e.target as HTMLInputElement).setCustomValidity("");
    };
  }
});
</script>
