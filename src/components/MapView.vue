<template>
  <div class="map-container">
    <div class="map-placeholder">
      <div class="placeholder-content">
        <div class="map-icon">🗺️</div>
        <p>ESRI Map View</p>
        <p class="placeholder-text">
          Map Focus: <strong>{{ mapStore.mapFocus }}</strong><br/>
          Mode: <strong>{{ mapStore.dataMode }}</strong><br/>
          <span v-if="mapStore.dataMode === 'production'">
            Type: <strong>{{ mapStore.selectedProduction }}</strong>
          </span>
          <span v-else>
            Type: <strong>{{ mapStore.selectedInjection }}</strong>
          </span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useMapStore } from '../stores/mapStore'
import { watch } from 'vue'

const mapStore = useMapStore()

// Watch for changes to trigger map updates
watch(
    [
      () => mapStore.mapFocus,
      () => mapStore.dataMode,
      () => mapStore.selectedProduction,
      () => mapStore.selectedInjection
    ],
    () => {
      // Map update logic would go here
      console.log('Map settings changed:', {
        focus: mapStore.mapFocus,
        mode: mapStore.dataMode,
        production: mapStore.selectedProduction,
        injection: mapStore.selectedInjection
      })
    }
)
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  background: #e8f4f8;
  position: relative;
  overflow: hidden;
}

.map-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-content {
  text-align: center;
  color: #666;
}

.map-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.7;
}

.placeholder-content p {
  margin: 8px 0;
  font-size: 16px;
}

.placeholder-text {
  font-size: 14px;
  color: #999;
  margin-top: 16px;
}

strong {
  color: #333;
}
</style>