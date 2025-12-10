<template>
    <div v-if="Model" class="radio-button-list" :id="Model.id">
        <div class="radio-wrapper" v-for="(pv, i) in Model.preValues" :key="i">
            <input type="radio" :name="Model.alias" :id="Model.id + '_' + i" :value="pv.value" 
                   v-model="value" :checked="pv.value == Model.settings?.defaultValue" @change="onChange" />
            <label :for="Model.id + '_' + i">{{ pv.caption }}</label>
        </div>
    </div>
</template>

<script setup lang="ts">
import {ref, defineEmits, onMounted} from 'vue'
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

const setDisplayLayout = () => {
  if (props.Model?.settings?.displayLayout.toLowerCase() === 'horizontal') {
    const wrapper = document.getElementById(props.Model.id);
    if (wrapper) {
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'row';
      wrapper.style.flexWrap = 'wrap';
      const radios = wrapper.getElementsByClassName('radio-wrapper');
      for (let i = 0; i < radios.length; i++) {
        (radios[i] as HTMLElement).style.marginRight = '1rem';
      }
    }
  }
}

onMounted(() => {
  setDisplayLayout();
});

</script>

