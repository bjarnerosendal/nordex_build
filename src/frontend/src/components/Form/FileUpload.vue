<template>
  <div class="file-upload-wrapper">
    <input type="file" :name="Model.alias" :id="Model.id" :multiple="Model.fileUploadOptions.allowMultipleFileUploads"
           @change="onChange" />
    <div v-if="selectedFiles.length && Model.fileUploadOptions.allowMultipleFileUploads">
    <span v-for="fileName in selectedFiles" :key="fileName" class="badge bg-primary mt-2 py-1 px-2">
      <div>
         {{ fileName }}
        <button class="btn-close btn-close-white" @click="removeFile(fileName)"></button>
      </div>
    </span>
    </div>
  </div>

</template>

<script setup lang="ts">
import { computed } from 'vue'
import { defineEmits} from 'vue'
import { FieldFile } from '@/models/fieldFile';
import { FieldBase } from '@/models/fieldBase';

// Props
interface Props {
  Model: FieldFile;
}
const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  fieldChange: [field: FieldBase]
}>();

// Methods
const onChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const field = props.Model as FieldBase;
  field.value = target.files;
  emit('fieldChange', field);
};

const selectedFiles = computed(() => {
  const files = (props.Model as FieldBase).value as FileList | null;
  return files ? Array.from(files).map(f => f.name) : [];
});

const removeFile = (fileName: string) => {
  const input = document.getElementById(props.Model.id) as HTMLInputElement;
  if (!input || !input.files) return;

  const dt = new DataTransfer();
  Array.from(input.files)
      .filter(file => file.name !== fileName)
      .forEach(file => dt.items.add(file));

  input.files = dt.files;
  // Update the field value and emit the change
  (props.Model as FieldBase).value = dt.files;
  emit('fieldChange', props.Model as FieldBase);
};
</script>
