<template>
  <div class="app-container">


    <main class="container py-4">
      <router-view />
    </main>

  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App'
});
</script>

<style lang="scss">
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
}

.logo {
  height: 40px;
}
</style>
