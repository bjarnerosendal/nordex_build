<template>
    <div class="checkbox-list-wrapper" :id="Model.id">
        <div class="checkbox-wrapper" v-for="(pv, i) in Model.preValues" :key="i">
            <input @change="onChange" type="checkbox" :class="Model.alias" :name="Model.alias + '[' + i + ']'"
                :id="Model.id + '_' + i" :value="pv.value" :required="Model?.required && !value" />
            <label :for="Model.id + '_' + i">{{ pv.caption }}</label>
        </div>
        <input type="hidden" :name="Model.alias" :value="value" />
    </div>
</template>

<script setup lang="ts">
import {ref, defineEmits, onMounted} from 'vue';
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
  const cboxes = document.querySelectorAll("." + props.Model.alias);
  const len = cboxes.length;
  const checked: string[] = [];

  for (let i = 0; i < len; i++) {
    if ((cboxes[i] as HTMLInputElement).checked) {
      checked.push((cboxes[i] as HTMLInputElement).value)
    }
  }
  
  if (checked.length > 0) {
    value.value = checked.toString();
  } else {
    value.value = "";
  }

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
      const checkboxes = wrapper.getElementsByClassName('checkbox-wrapper');
      for (let i = 0; i < checkboxes.length; i++) {
        (checkboxes[i] as HTMLElement).style.marginRight = '1rem';
      }
    }
  }
}

onMounted(() => {
  setDisplayLayout();
});
  
</script>
