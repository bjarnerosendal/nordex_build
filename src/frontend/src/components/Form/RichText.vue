<template>
    <div :id="Model.id">
        <h2 v-if="Model.caption">{{ Model.caption }}</h2>
        <div v-html="Model.settings?.html">
        </div>
    </div>
</template>

<script setup lang="ts">
import { FieldBase } from '@/models/fieldBase';

// Props
interface Props {
  Model: FieldBase;
}
const props = defineProps<Props>();
</script>
