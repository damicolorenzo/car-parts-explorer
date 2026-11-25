
<script setup lang="ts">
import { onMounted } from 'vue'
import { useVehicleStore } from '../../stores/useVehicleStore'

const {
  manufacturers,
  models,
  generations,
  variants,

  selectedManufacturerId,
  selectedModelId,
  selectedGenerationId,
  selectedVariantId,

  selectedVariant,

  loading,
  error,

  initialize,
  selectManufacturer,
  selectModel,
  selectGeneration,
  selectVariant,
  clearSelection,
  retry,
} = useVehicleStore()

onMounted(() => {
  void initialize()
})

function getSelectedValue(event: Event): string | null {
  const target = event.target as HTMLSelectElement

  return target.value || null
}

function onManufacturerChange(event: Event): void {
  void selectManufacturer(getSelectedValue(event))
}

function onModelChange(event: Event): void {
  void selectModel(getSelectedValue(event))
}

function onGenerationChange(event: Event): void {
  void selectGeneration(getSelectedValue(event))
}

function onVariantChange(event: Event): void {
  selectVariant(getSelectedValue(event))
}
</script>

<template>
  <section
    class="vehicle-selector"
    aria-labelledby="vehicle-selector-heading"
    :aria-busy="loading"
  >
    <header class="selector-header">
      <h3 id="vehicle-selector-heading">
        Select your vehicle
      </h3>

      <button
        type="button"
        class="clear-button"
        :disabled="!selectedManufacturerId"
        @click="clearSelection"
      >
        Clear
      </button>
    </header>

    <div class="selector-fields">
      <!-- Manufacturer -->
      <label class="selector-field">
        <span>Manufacturer</span>

        <select
          :value="selectedManufacturerId ?? ''"
          :disabled="manufacturers.length === 0"
          @change="onManufacturerChange"
        >
          <option value="">
            Select manufacturer
          </option>

          <option
            v-for="manufacturer in manufacturers"
            :key="manufacturer.id"
            :value="manufacturer.id"
          >
            {{ manufacturer.name }}
          </option>
        </select>
      </label>

      <!-- Model -->
      <label class="selector-field">
        <span>Model</span>

        <select
          :value="selectedModelId ?? ''"
          :disabled="
            !selectedManufacturerId ||
            models.length === 0
          "
          @change="onModelChange"
        >
          <option value="">
            Select model
          </option>

          <option
            v-for="model in models"
            :key="model.id"
            :value="model.id"
          >
            {{ model.name }}
          </option>
        </select>
      </label>

      <!-- Generation -->
      <label class="selector-field">
        <span>Generation</span>

        <select
          :value="selectedGenerationId ?? ''"
          :disabled="
            !selectedModelId ||
            generations.length === 0
          "
          @change="onGenerationChange"
        >
          <option value="">
            Select generation
          </option>

          <option
            v-for="generation in generations"
            :key="generation.id"
            :value="generation.id"
          >
            {{ generation.name }}
          </option>
        </select>
      </label>

      <!-- Variant -->
      <label class="selector-field">
        <span>Variant</span>

        <select
          :value="selectedVariantId ?? ''"
          :disabled="
            !selectedGenerationId ||
            variants.length === 0
          "
          @change="onVariantChange"
        >
          <option value="">
            Select variant
          </option>

          <option
            v-for="variant in variants"
            :key="variant.id"
            :value="variant.id"
          >
            {{ variant.name }}
          </option>
        </select>
      </label>
    </div>

    <!-- Loading state -->
    <p
      v-if="loading"
      class="status-message"
      role="status"
    >
      Loading vehicle catalog...
    </p>

    <!-- Error state -->
    <div
      v-if="error"
      class="error-state"
      role="alert"
    >
      <p>{{ error }}</p>

      <button
        type="button"
        class="retry-button"
        @click="retry"
      >
        Retry
      </button>
    </div>

    <!-- Selected vehicle summary -->
    <div
      v-if="selectedVariant"
      class="vehicle-summary"
    >
      <strong>{{ selectedVariant.name }}</strong>

      <dl>
        <div>
          <dt>Engine code</dt>
          <dd>
            {{ selectedVariant.engineCode ?? 'Unknown' }}
          </dd>
        </div>

        <div>
          <dt>Fuel</dt>
          <dd>
            {{ selectedVariant.fuelType ?? 'Unknown' }}
          </dd>
        </div>

        <div>
          <dt>Displacement</dt>
          <dd>
            {{
              selectedVariant.displacementCc !== null
                ? `${selectedVariant.displacementCc} cc`
                : 'Unknown'
            }}
          </dd>
        </div>

        <div>
          <dt>Power</dt>
          <dd>
            {{
              selectedVariant.powerKw !== null
                ? `${selectedVariant.powerKw} kW`
                : 'Unknown'
            }}
          </dd>
        </div>

        <div>
          <dt>Transmission</dt>
          <dd>
            {{ selectedVariant.transmission ?? 'Unknown' }}
          </dd>
        </div>

        <div>
          <dt>Drivetrain</dt>
          <dd>
            {{ selectedVariant.drivetrain ?? 'Unknown' }}
          </dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.vehicle-selector {
  --selector-border: rgba(128, 128, 128, 0.25);
  --selector-surface: rgba(128, 128, 128, 0.06);

  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--selector-border);
  border-radius: 12px;
  min-width: 0;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.selector-header h3 {
  margin: 0;
  font-size: 1.05rem;
}

.selector-fields {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(100%, 180px), 1fr)
  );
  gap: 0.75rem;
}

.selector-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;
}

.selector-field span {
  font-size: 0.75rem;
  font-weight: 500;
  opacity: 0.75;
}

.selector-field select {
  width: 100%;
  min-width: 0;
  padding: 0.65rem;
  border: 1px solid var(--selector-border);
  border-radius: 6px;
  background: var(--selector-surface);
  color: inherit;
  font: inherit;
  font-size: 0.85rem;
}

.selector-field select option {
  color: CanvasText;
  background: Canvas;
}

.selector-field select:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.clear-button,
.retry-button {
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--selector-border);
  border-radius: 6px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  font-size: 0.8rem;
}

.clear-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.clear-button:hover:not(:disabled),
.retry-button:hover {
  background: var(--selector-surface);
}

.status-message {
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.75;
}

.error-state {
  padding: 0.75rem;
  border: 1px solid var(--selector-border);
  border-radius: 8px;
  font-size: 0.8rem;
}

.error-state p {
  margin: 0 0 0.5rem;
}

.vehicle-summary {
  padding: 0.85rem;
  border: 1px solid var(--selector-border);
  border-radius: 8px;
  background: var(--selector-surface);
}

.vehicle-summary strong {
  font-size: 0.9rem;
}

.vehicle-summary dl {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(100%, 110px), 1fr)
  );
  gap: 0.75rem;
  margin: 0.75rem 0 0;
}

.vehicle-summary dt {
  font-size: 0.7rem;
  opacity: 0.65;
}

.vehicle-summary dd {
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
  font-weight: 500;
}
</style>
