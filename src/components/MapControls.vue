<template>
  <div class="controls">
    <div class="control-section mt-5">
      <div class="toggle-group">
        <v-btn
            :color="router.currentRoute.value.path === '/pwd/' ? 'orange-darken-4' : 'grey-darken-2'"
            @click="navigateToView('map')"
        >
          Map Focus
        </v-btn>
        <v-btn
            :color="router.currentRoute.value.path === '/pwd/table' ? 'orange-darken-4' : 'grey-darken-2'"
            @click="navigateToView('table')"
        >
          Table Focus
        </v-btn>
      </div>
    </div>
    <div class="control-section">
      <h3 class="section-title">{{ focusTitle }}</h3>
      <div class="button-group">
        <v-btn
            v-for="option in mapStore.mapFocusOptions"
            :key="option.value"
            :variant="mapStore.mapFocus === option.value ? 'flat' : 'outlined'"
            :color="mapStore.mapFocus === option.value ? 'primary' : 'default'"
            @click="mapStore.setMapFocus(option.value)"
            class="w-100"
        >
          {{ option.label }}
        </v-btn>
      </div>
    </div>

    <div class="control-section">
      <h3 class="section-title">Data Types</h3>
      <div class="toggle-group">
        <v-btn
            class="control-button"
            :class="{ active: mapStore.dataMode === 'production' }"
            @click="mapStore.setDataMode('production')"
        >
          Production
        </v-btn>
        <v-btn
            class="control-button"
            :class="{ active: mapStore.dataMode === 'injection' }"
            @click="mapStore.setDataMode('injection')"
        >
          Injection
        </v-btn>
      </div>
    </div>

    <div class="control-section" v-if="mapStore.dataMode === 'production'">
      <h3 class="section-title">Production Type</h3>
      <div class="option-group">
        <label
            v-for="option in mapStore.productionOptions"
            :key="option.value"
            class="option-label"
        >
          <input
              type="radio"
              :value="option.value"
              v-model="mapStore.selectedProduction"
              @change="mapStore.setSelectedProduction(option.value)"
          />
          {{ option.label }}
        </label>
      </div>
    </div>

    <div class="control-section" v-if="mapStore.dataMode === 'injection'">
      <h3 class="section-title">Injection Type</h3>
      <div class="option-group">
        <label
            v-for="option in mapStore.injectionOptions"
            :key="option.value"
            class="option-label"
        >
          <input
              type="radio"
              :value="option.value"
              v-model="mapStore.selectedInjection"
              @change="mapStore.setSelectedInjection(option.value)"
          />
          {{ option.label }}
        </label>
      </div>
    </div>

<!--    <div class="control-section">
      <v-btn class="refresh-button">
        ⟳ Refresh Data
      </v-btn>
    </div>-->
  </div>
</template>

<script setup>
import { useMapStore } from '../stores/mapStore'
import {useRouter} from "vue-router";
import router from "@/router/index.js";
import {computed} from "vue";

const focusTitle = computed(() => {
  return router.currentRoute.value.path === '/pwd/table' ? 'Table Focus' : 'Map Focus'
})
const mapStore = useMapStore()
function navigateToView(incomingDir){
  if (incomingDir === 'map') {
    router.push('/pwd/')
  } else if (incomingDir === 'table') {
    router.push('/pwd/table')
  }
}
</script>

<style scoped>
.controls {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.control-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: antiquewhite;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-button {
  background: #f5f5f5;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  color: #666;
}

.control-button:hover {
  background: #efefef;
  border-color: #d0d0d0;
}

.control-button.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.toggle-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.toggle-button {
  padding: 12px;
  background: #f5f5f5;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color:black;
  transition: all 0.2s ease;
}

.toggle-button.active {
  background: #764ba2;
  color: white;
  border-color: #764ba2;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  color: whitesmoke;
}

.option-label input {
  cursor: pointer;
}

.refresh-button {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.refresh-button:hover {
  background: #764ba2;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

@media (max-width: 768px) {
  .controls {
    padding: 16px;
    gap: 16px;
  }

  .control-button,
  .toggle-button {
    padding: 10px 12px;
    font-size: 13px;
  }
}
</style>
