<template>
  <div class="map-view">
    <map-display />
  </div>
</template>

<script setup>
import MapDisplay from '../components/MapLarge.vue'
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
  height: calc(100vh);
  background-color: black;
}
</style>