
<script setup lang="ts">
import { computed } from 'vue'
import type { AutomotiveComponent } from '../../types/automotive'

const props = defineProps<{
  component: AutomotiveComponent | null
}>()

const info = computed(() => props.component?.technicalInfo)
</script>

<template>
  <section v-if="component" class="component-info">
    <div class="info-header">
      <h3>{{ component.name }}</h3>
      <span class="category">{{ component.category }}</span>
    </div>

    <template v-if="info">
      <p class="description">{{ info.description }}</p>

      <div class="info-section">
        <h4>Function</h4>
        <p>{{ info.function }}</p>
      </div>

      <div v-if="info.material" class="info-section">
        <h4>Material</h4>
        <p>{{ info.material }}</p>
      </div>

      <div
        v-if="info.maintenance?.length"
        class="info-section"
      >
        <h4>Maintenance considerations</h4>
        <ul>
          <li
            v-for="item in info.maintenance"
            :key="item"
          >
            {{ item }}
          </li>
        </ul>
      </div>

      <div class="info-section">
        <h4>OEM Part Number</h4>
        <p>{{ info.oemPartNumber ?? 'Not available' }}</p>
      </div>

      <div v-if="info.compatibilityNotes" class="info-section">
        <h4>Compatibility</h4>
        <p>{{ info.compatibilityNotes }}</p>
      </div>
    </template>

    <p v-else class="empty-info">
      Technical information is not available for this component yet.
    </p>
  </section>
</template>

<style scoped>
.component-info {
  margin-top: 20px;
  padding: 16px;
  background: #334155;
  border: 1px solid #475569;
  border-radius: 10px;
}

.info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.info-header h3 {
  margin: 0;
  font-size: 17px;
}

.category {
  padding: 4px 8px;
  border-radius: 6px;
  background: #1e293b;
  font-size: 11px;
  text-transform: capitalize;
}

.description {
  color: #e2e8f0;
  line-height: 1.5;
}

.info-section {
  margin-top: 16px;
}

.info-section h4 {
  margin: 0 0 6px;
  color: #93c5fd;
  font-size: 13px;
}

.info-section p,
.info-section li {
  margin-top: 4px;
  font-size: 13px;
  line-height: 1.5;
}

.info-section ul {
  padding-left: 18px;
}

.empty-info {
  color: #cbd5e1;
  font-size: 13px;
}
</style>
