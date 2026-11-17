
<script setup lang="ts">
import { computed, ref } from 'vue'
import CarViewer from './components/viewer/CarViewer.vue'
import { viewerModels } from './data/models'

const activeModelId = ref(viewerModels[0]!.id)

const activeModel = computed(() =>
  viewerModels.find(model => model.id === activeModelId.value)
)
</script>

<template>
  <div class="app">
    <header class="toolbar">
      <label for="model-select">3D Model</label>

      <select id="model-select" v-model="activeModelId">
        <option
          v-for="model in viewerModels"
          :key="model.id"
          :value="model.id"
        >
          {{ model.name }}
        </option>
      </select>
    </header>

    <CarViewer
      v-if="activeModel"
      :key="activeModel.id"
      :model="activeModel"
    />
  </div>
</template>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: #0f172a;
  color: white;
}

.toolbar select {
  padding: 8px 12px;
  border: 1px solid #475569;
  border-radius: 6px;
  background: #1e293b;
  color: white;
}
</style>
