<template>
    <div class="checkbox-wrapper">
        <input type="checkbox" :name="Model.alias" :id="Model.id" :value="true" 
               v-model="checked" @change="onChange" :required="Model?.required" />
        <label :for="Model.id" v-if="Model.caption">{{ Model.caption }}</label>
    </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue'
import { FieldBase } from '@/models/fieldBase';

// Props
interface Props {
  Model: FieldBase;
}
const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  fieldChange: [field: FieldBase]
}>();

// Reactive state
const checked = ref(props.Model?.settings?.defaultValue === 'true' || props.Model?.settings?.defaultValue === true);

// Methods
const onChange = () => {
  const field = props.Model as FieldBase;
  field.value = checked.value;
  emit('fieldChange', field);
};
</script>

