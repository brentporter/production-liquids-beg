<template>
  <header class="app-header">
    <div class="header-content">
      <h1 class="app-title">Energy Data Explorer</h1>
      <div class="header-info">
        <v-chip>{{ mapStore.mapFocus }}</v-chip>
        <v-chip>{{ mapStore.dataMode }}</v-chip>
        <v-chip>
          {{ mapStore.dataMode === 'production' ? mapStore.selectedProduction : mapStore.selectedInjection }}
        </v-chip>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useMapStore } from '../stores/mapStore'
import { VChip } from 'vuetify/components'

const mapStore = useMapStore()
</script>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-title {
  font-size: 24px;
  font-weight: 600;
}

.header-info {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .app-title {
    font-size: 20px;
  }

  .header-info {
    font-size: 12px;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .header-content {
    flex-direction: column;
    gap: 8px;
  }

  .app-title {
    font-size: 18px;
  }
}
</style>