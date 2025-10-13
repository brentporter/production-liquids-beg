<template>
  <div class="years-overlay">
    <div class="years-container">
      <v-chip-group
          :model-value="mapStore.selectedProductionYear"
          @update:model-value="mapStore.setSelectedProductionYear"
          class="years-group"
      >
        <v-chip
            v-for="year in mapStore.productionYearOptions"
            :key="year"
            :value="year"
            :text="year"
            variant="flat"
            size="small"
            :color="getRandomColorProduction(year)"
        >
          {{ year }}
        </v-chip>
      </v-chip-group>
    </div>
  </div>
</template>

<script setup>
import { useMapStore } from '../stores/mapStore.js'

const mapStore = useMapStore()
const chipColorsProd = [
  'secondary',
  'blue-grey',
  'success',
  'info',
  'warning',
  'error',
  'purple',
  'amber',
  'cyan',
  'teal',
  'pink',
  'primary',
  'orange',
  'indigo',
  'green',
  'lime',
  'deep-orange',
  'brown',
]
const getRandomColorProduction = (countyName) => {
  // Use county name to generate consistent hash for color selection
  let hash = 0
  for (let i = 0; i < countyName.length; i++) {
    hash = countyName.charCodeAt(i) + ((hash << 3) - hash)
    //console.log(hash);
  }
  const colorIndex = Math.abs(hash) % chipColorsProd.length
  return chipColorsProd[colorIndex]
}

</script>

<style scoped>
.years-overlay {
  position: fixed;
  top: 80px;
  left: 60%;
  transform: translateX(-60%);
  z-index: 50;
  pointer-events: none;
}
/*.years-overlay {
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  pointer-events: none;
}*/

.years-container {
  pointer-events: auto;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  padding: 8px 16px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
}

.years-group {
  display: flex;
  gap: 4px;
  flex-wrap: nowrap;
  overflow-x: auto;
  max-width: 90vw;
  padding: 0 !important;
}

.years-group :deep(.v-chip) {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .years-overlay {
    top: 70px;
  }

  .years-container {
    padding: 6px 12px;
  }

  .years-group {
    max-width: 95vw;
  }
}
</style>