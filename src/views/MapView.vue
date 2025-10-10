<template>
  <div class="map-view">
    <map-controls />
    <map-display />
  </div>
</template>

<script setup>
import MapControls from '../components/MapControls.vue'
import MapDisplay from '../components/MapView.vue'
</script>

<style scoped>
/*
.esri-zoom {
  top: 80px !important;
}
.esri-widget--panel {
  top: 80px !important;
}
*/

.esri-ui-top-left{
  top: 80px !important;
}

.map-view {
  display: flex;
  height: calc(100vh - 60px);
}
</style>