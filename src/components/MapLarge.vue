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
import Viewpoint from "@arcgis/core/Viewpoint.js";
import {Point} from "@arcgis/core/geometry.js";
import Home from "@arcgis/core/widgets/Home.js";
import Legend from "@arcgis/core/widgets/Legend.js";
import Expand from "@arcgis/core/widgets/Expand.js";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
const isInitializing = ref(true)
let begMap,begView,countyBoundariesTx;

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

  let homeWidget = new Home({
    view: begView,
    viewpoint: new Viewpoint({
      center: new Point({
        longitude: -98,
        latitude: 30.75
      }),
      zoom:5 // Adjust scale as needed
    })
  })

  begView.ui.add(homeWidget, "top-left")

  let legend = new Legend({
    view: begView,
  })
  let bkExpand = new Expand({
    view: begView,
    content: legend,
    expanded: true,
    expandTooltip: 'Show Legend'
  });

  begView.ui.add(bkExpand, "bottom-left");

  countyBoundariesTx = new FeatureLayer({
    //url:'https://services1.arcgis.com/7DRakJXKPEhwv0fM/arcgis/rest/services/Texas_Well_Production/FeatureServer/0',
    url: 'https://services1.arcgis.com/7DRakJXKPEhwv0fM/arcgis/rest/services/Tx_Well_Production/FeatureServer/0',
    setAutoGeneralize: true,
    outFields: ["*"],
    opacity:0.95,
    id: "countyBoundariesTx",
  })
  begMap.add(countyBoundariesTx)

})
</script>

<style scoped>
.esri-ui-top-left{
  top: 80px !important;
}
.mapdiv {
  height:100vh;
  width:100vw;
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