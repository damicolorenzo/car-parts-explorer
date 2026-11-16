
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AutomotiveComponent } from '../../types/automotive'


const props = defineProps<{
  components: AutomotiveComponent[]
  selectedId: string | null
  hiddenIds: string[]
}>()

const emit = defineEmits<{
  select: [component: AutomotiveComponent]
  toggleVisibility: [component: AutomotiveComponent]
}>()


const searchQuery = ref('')

const filteredComponents = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return props.components.filter(component =>
    component.name.toLowerCase().includes(query) ||
    component.category.toLowerCase().includes(query)
  )
})
</script>

<template>
  <div class="component-list">
    <input
      v-model="searchQuery"
      type="search"
      placeholder="Search components..."
      class="search-input"
    />

    <div class="results">
      
<div
  v-for="component in filteredComponents"
  :key="component.id"
  class="component-row"
>
  <button
    class="component-item"
    :class="{
      active: selectedId === component.id,
      hidden: hiddenIds.includes(component.id)
    }"
    @click="emit('select', component)"
  >
    <span>{{ component.name }}</span>
    <small>{{ component.category }}</small>
  </button>

  <button
    type="button"
    class="visibility-button"
    :aria-label="
      hiddenIds.includes(component.id)
        ? `Show ${component.name}`
        : `Hide ${component.name}`
    "
    @click="emit('toggleVisibility', component)"
  >
    {{ hiddenIds.includes(component.id) ? 'Show' : 'Hide' }}
  </button>
</div>

    </div>
  </div>
</template>

<style scoped>
.component-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #475569;
  border-radius: 8px;
  background: #0f172a;
  color: white;
}

.results {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 400px;
  overflow-y: auto;
}

.component-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 0;
  border-radius: 8px;
  background: #334155;
  color: white;
  cursor: pointer;
  text-align: left;
}

.component-item:hover,
.component-item.active {
  background: #2563eb;
}

.component-item small {
  color: #cbd5e1;
}

.component-row {
  display: flex;
  align-items: stretch;
  gap: 6px;
}

.component-row .component-item {
  flex: 1;
  min-width: 0;
}

.component-item.hidden {
  opacity: 0.45;
}

.visibility-button {
  padding: 8px 12px;
  border: 1px solid #475569;
  border-radius: 8px;
  background: #1e293b;
  color: white;
  cursor: pointer;
}

.visibility-button:hover {
  background: #475569;
}
</style>
