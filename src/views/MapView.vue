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
.map-view {
  display: flex;
  height: calc(100vh - 60px);
}
</style>