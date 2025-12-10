<template>
    <label :for="Model.id" class="specialValidationFieldStyling">
        Udfyld ikke dette felt, da det bruges til at blokere for bot-genereret trafik.
    </label>
    <input class="specialValidationFieldStyling" v-if="Model" type="text" :name="Model.alias" :id="Model.id"
        :maxlength="Model?.settings?.maximumLength" :placeholder="Model?.settings?.placeholder" :required="Model?.required"
        :oninvalid="Model?.patternInvalidErrorMessage"
        aria-label="Udfyld ikke dette felt, da det bruges til at blokere for bot-genereret trafik" autocomplete="off" />
</template>

<script setup lang="ts">
import { FieldText } from '@/models/fieldText';

// Props
interface Props {
  Model: FieldText;
}
const props = defineProps<Props>();
</script>

<style scoped>
.specialValidationFieldStyling {
  position: absolute;
  left: -9999px;
  opacity: 0;
  pointer-events: none;
}
</style>
