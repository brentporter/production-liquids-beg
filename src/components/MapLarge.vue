<template>
  <div class="map-container">
    <div id="mapViewer" class="mapdiv"></div>
<!--    <div class="map-placeholder">
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
    </div>-->
  </div>
</template>

<script setup>
import { useMapStore } from '../stores/mapStore'
import {onMounted, ref, watch} from 'vue'
import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";
const isInitializing = ref(true)
let begMap,begView;

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

onMounted(()=>{

  const initialView = mapStore.mapZoom > 0
      ? { center: mapStore.mapCenter, zoom: mapStore.mapZoom }
      : { center: [-94.75, 30.75], zoom: 6 }

  begMap = new Map({
    // basemap:'dark-gray-vector',             // Create a Map object
    basemap: "streets-night-vector",

    //layers: additionalLayers             // Optionally, add additional layers collection
  });

  begView = new MapView({
    // https://v3.vuejs.org/api/instance-properties.html#el
    container: "mapViewer",
    map: begMap,
    center: initialView.center,
    popup: {
      dockEnabled: true,
      dockOptions: {
        // Disables the dock button from the popup
        //buttonEnabled: false,
        // Ignore the default sizes that trigger responsive docking
        breakpoint: false
      }
    },
    zoom: initialView.zoom,
  });

  begView.when(() => {
    // Create home widget after view is ready
    // Then set up your other initialization
    setTimeout(() => {
      isInitializing.value = false
    }, 500)
  })
})
</script>

<style scoped>
.esri-ui-top-left{
  top: 80px !important;
}
.mapdiv {
  height:100vh;
  width:100vw;
  z-index: 5000;
}
.esri-attribution {
  display: none !important;
}

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