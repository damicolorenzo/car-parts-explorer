
<script setup lang="ts">
import type { ComponentResponse } from '../../types/catalog'

defineProps<{
  component: ComponentResponse | null
  loading: boolean
  error: string | null
}>()
</script>

<template>
  <aside class="component-details">
    <h2>Component details</h2>

    <p v-if="loading" role="status">
      Loading component information...
    </p>

    <p v-else-if="error" role="alert">
      {{ error }}
    </p>

    <div v-else-if="component">
      <h3>{{ component.name }}</h3>

      <p class="component-code">
        {{ component.code }}
      </p>

      <section v-if="component.description">
        <h4>Description</h4>
        <p>{{ component.description }}</p>
      </section>

      <section v-if="component.functionDescription">
        <h4>Function</h4>
        <p>{{ component.functionDescription }}</p>
      </section>

      <section v-if="component.material">
        <h4>Material</h4>
        <p>{{ component.material }}</p>
      </section>
    </div>

    <p v-else>
      Select a component in the 3D viewer.
    </p>
  </aside>
</template>

<style scoped>
.component-details {
  padding: 1.25rem;
  border: 1px solid #374151;
  border-radius: 12px;
  background: #111827;
  color: #f9fafb;
}

.component-details h2 {
  margin-top: 0;
  font-size: 1.1rem;
}

.component-details h3 {
  margin-bottom: 0.25rem;
}

.component-code {
  color: #9ca3af;
  font-family: monospace;
  font-size: 0.8rem;
}

.component-details section {
  margin-top: 1.25rem;
}

.component-details h4 {
  margin-bottom: 0.35rem;
  color: #d1d5db;
}

.component-details p {
  line-height: 1.6;
}
</style>
