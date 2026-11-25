
<script setup lang="ts">
import type { PartResponse } from '../../types/catalog'

defineProps<{
  parts: readonly Readonly<PartResponse>[]
  loading: boolean
  error: string | null
  hasSelectedComponent: boolean
  hasSelectedVehicle: boolean
}>()

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <section
    class="replacement-parts-panel"
    aria-labelledby="replacement-parts-heading"
    :aria-busy="loading"
  >
    <header class="panel-header">
      <h3 id="replacement-parts-heading">
        Replacement parts
      </h3>

      <span
        v-if="hasSelectedComponent && !loading && !error"
        class="part-count"
      >
        {{ parts.length }}
        {{ parts.length === 1 ? 'part' : 'parts' }}
      </span>
    </header>

    <p
      v-if="hasSelectedComponent"
      class="filter-description"
    >
      {{
        hasSelectedVehicle
          ? 'Filtered by selected vehicle'
          : 'All associated replacement parts'
      }}
    </p>

    <!-- No component selected -->
    <div
      v-if="!hasSelectedComponent"
      class="panel-state"
    >
      <p>Select a component to explore its replacement parts.</p>
    </div>

    <!-- Loading -->
    <div
      v-else-if="loading"
      class="panel-state"
      role="status"
    >
      <span class="spinner" aria-hidden="true"></span>
      <p>Loading replacement parts...</p>
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="panel-state error-state"
      role="alert"
    >
      <strong>Unable to load replacement parts</strong>

      <p>{{ error }}</p>

      <button
        type="button"
        class="retry-button"
        @click="emit('retry')"
      >
        Retry
      </button>
    </div>

    <!-- Empty results -->
    <div
      v-else-if="parts.length === 0"
      class="panel-state"
      role="status"
    >
      <strong>No replacement parts found</strong>

      <p>
        {{
          hasSelectedVehicle
            ? 'No recorded fitments for the selected vehicle.'
            : 'No replacement parts are associated with this component.'
        }}
      </p>
    </div>

    <!-- Replacement parts -->
    <div v-else class="parts-list">
      <article
        v-for="part in parts"
        :key="part.id"
        class="part-card"
      >
        <span class="part-brand">
          {{ part.brand }}
        </span>

        <h4 class="part-name">
          {{ part.name }}
        </h4>

        <dl class="part-metadata">
          <div>
            <dt>Part number</dt>
            <dd>{{ part.partNumber }}</dd>
          </div>

          <div>
            <dt>OEM reference</dt>
            <dd>
              {{ part.oemReference ?? 'Not available' }}
            </dd>
          </div>
        </dl>

        <p
          v-if="part.description"
          class="part-description"
        >
          {{ part.description }}
        </p>
      </article>
    </div>

    <footer class="catalog-notice">
      <strong>Development catalog</strong>

      <p>
        Products and fitments are synthetic and must
        not be used for purchasing or installation
        decisions.
      </p>
    </footer>
  </section>
</template>

<style scoped>
.replacement-parts-panel {
  --panel-border: rgba(128, 128, 128, 0.25);
  --panel-surface: rgba(128, 128, 128, 0.06);

  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1rem;
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  min-width: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.panel-header h3 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
}

.part-count {
  font-size: 0.75rem;
  opacity: 0.7;
  white-space: nowrap;
}

.filter-description {
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.7;
}

.parts-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 420px;
  overflow-y: auto;
}

.part-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.9rem;
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  background: var(--panel-surface);
  overflow-wrap: anywhere;
}

.part-brand {
  font-size: 0.75rem;
  font-weight: 600;
  opacity: 0.7;
}

.part-name {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.part-metadata {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin: 0;
}

.part-metadata div {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.75rem;
}

.part-metadata dt {
  opacity: 0.65;
}

.part-metadata dd {
  margin: 0;
  text-align: right;
}

.part-description {
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.5;
  opacity: 0.85;
}

.panel-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
  padding: 1.5rem 0.75rem;
  text-align: center;
  font-size: 0.85rem;
}

.panel-state p {
  margin: 0;
  opacity: 0.75;
  line-height: 1.5;
}

.error-state {
  border: 1px solid var(--panel-border);
  border-radius: 8px;
}

.retry-button {
  padding: 0.45rem 1rem;
  border: 1px solid var(--panel-border);
  border-radius: 6px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
}

.retry-button:hover {
  background: var(--panel-surface);
}

.spinner {
  width: 22px;
  height: 22px;
  border: 2px solid var(--panel-border);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.catalog-notice {
  padding-top: 0.75rem;
  border-top: 1px solid var(--panel-border);
  font-size: 0.75rem;
  line-height: 1.5;
  opacity: 0.75;
}

.catalog-notice p {
  margin: 0.25rem 0 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
  }
}
</style>
