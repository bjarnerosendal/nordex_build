<template>
    <component :is="Model.settings?.captionTag =='' ? 'h2' : Model.settings?.captionTag">{{ Model.settings?.caption }}
    </component>
    <p v-if="Model?.settings?.bodyText">{{ Model?.settings?.bodyText }}</p>
</template>

<script setup lang="ts">
import { FieldBase } from '@/models/fieldBase';

// Props
interface Props {
  Model: FieldBase;
}
const props = defineProps<Props>();
</script>
