<template>
  <v-app-bar
      style="background: linear-gradient(135deg, #FB8C00 0%, #E65100 100%);"
      title="Produced Water Dashboard"
      elevation="2"
      class="text-h5"
      theme="dark"
  >
    <template v-slot:prepend>
      <img src="@/assets/beg-logo.svg" height="55" width="200" alt=""/>
    </template>

    <template v-slot:append>
      <span style="font-size: 1.0rem">Active Data Focus&nbsp;</span>
      <div class="header-chips">
        - <v-chip
            size="small"
        >
          {{ mapStore.mapFocus }}
        </v-chip>
        <v-chip
            size="small"
        >
          {{ mapStore.dataMode }}
        </v-chip>
        <v-chip
            size="small"
        >
          {{ mapStore.dataMode === 'production' ? mapStore.selectedProduction : mapStore.selectedInjection }}
        </v-chip>
      </div>
    </template>
  </v-app-bar>
</template>

<script setup>
import { useMapStore } from '../stores/mapStore'

const mapStore = useMapStore()
const chipColor = 'primary'

defineEmits(['toggle-sidebar'])
</script>

<style scoped>
.header-chips {
  display: flex;
  gap: 8px;
  margin-right: 8px;
  color: whitesmoke;
}

@media (max-width: 768px) {
  .header-chips {
    gap: 4px;
    margin-right: 4px;
  }
}
</style>