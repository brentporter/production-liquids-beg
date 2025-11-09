<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-4 mt-2">
      <h1 style="margin-left: 7.6rem">{{ tableTitle }}</h1>
      <v-btn
          v-if="mapStore.mapFocus !== 'State'"
          color="orange-darken-3"
          @click="downloadCSV"
          :disabled="tableData.length === 0"
      >
        <template v-slot:prepend>
          <v-icon color="white">mdi-download</v-icon>
        </template>
        Download Selected
      </v-btn>
      <v-btn
          color="blue-darken-3"
          @click="downloadAllCSV"
          :disabled="!dataStore.hasData"
          class="ml-2"
      >
        Download All {{ mapStore.mapFocus === 'Basin' ? 'Basins' : mapStore.mapFocus === 'County' ? 'Counties' : 'Statewide' }}
<!--        Download All {{ mapStore.mapFocus === 'Basin' ? 'Basins' : 'Counties' }}-->
      </v-btn>
    </div>

    <v-alert
        v-if="tableData.length === 0"
        type="info"
        variant="tonal"
        class="mb-4"
        style="margin-left: 7.6rem"
    >
      Please select a {{ mapStore.mapFocus.toLowerCase() }} from the selection tool or map to view data.
    </v-alert>

    <v-data-table
        v-else
        :headers="headers"
        :items="tableData"
        :items-per-page="-1"
        :sort-by="[{ key: 'Year', order: 'asc' }]"
        class="elevation-2"
    ></v-data-table>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useMapStore } from '../stores/mapStore'
import { useDataStore } from '../stores/dataStore'
import Papa from 'papaparse'
import {firstCapital} from "@/scripts/utility.js";

const mapStore = useMapStore()
const dataStore = useDataStore()

const tableTitle = computed(() => {
  let location = ''
  let dataType = ''

  if (mapStore.mapFocus === 'State') {
    location = 'Texas Statewide'
  } else if (mapStore.mapFocus === 'County' && mapStore.selectedCounty) {
    //firstCapital(mapStore.selectedCounty)
    location = `${firstCapital(mapStore.selectedCounty)} County`
  } else if (mapStore.mapFocus === 'Basin' && mapStore.selectedBasin) {
    location = `${mapStore.selectedBasin}`
  } else {
    location = 'No Selection'
  }

  if (mapStore.dataMode === 'production') {
    dataType = mapStore.selectedProduction
  } else {
    dataType = mapStore.selectedInjection
  }

  return `${location} - Roll Up Data`
})

const headers = computed(() => {
  const baseHeaders = [
    { title: 'Year', key: 'Year', align: 'start' }
  ]

  // Add all production and injection columns
  baseHeaders.push(
      { title: 'Gas (MCF)', key: 'Gas', align: 'end' },
      { title: 'Liquid Oil (BBL)', key: 'LiquidOil', align: 'end' },
      { title: 'Produced Water (BBL)', key: 'ProducedWater', align: 'end' },
      { title: 'HF Fluid (GAL)', key: 'HFFluid', align: 'end' },
      { title: 'Salt Water Disposal (BBL)', key: 'SaltWaterDisposal', align: 'end' }
  )

  return baseHeaders
})

const tableData = computed(() => {
  if (!dataStore.hasData) return []

  let rawData = []

  // Get data based on map focus
  if (mapStore.mapFocus === 'State') {
    rawData = getStatewideTableData()
  } else if (mapStore.mapFocus === 'County' && mapStore.selectedCounty) {
    rawData = getCountyTableData()
  } else if (mapStore.mapFocus === 'Basin' && mapStore.selectedBasin) {
    rawData = getBasinTableData()
  }

  return rawData
})

function getStatewideTableData() {
  const txData = dataStore.statewideData
  if (!txData || !Array.isArray(txData)) return []

  return txData.map(row => ({
    Year: row.Year,
    Gas: formatNumber(row.Gas_Produced_MCF),
    LiquidOil: formatNumber(row.Liquid_Produced_BBL),
    ProducedWater: formatNumber(row.Water_Produced_BBL),
    HFFluid: formatNumber(row.HF_Water_GAL),
    SaltWaterDisposal: formatNumber(row.Salt_Water_Disposal_BBL)
  }))
}

function getCountyTableData() {
  const countyName = mapStore.selectedCounty.toUpperCase()
  const countyData = dataStore.countyData[countyName]

  if (!countyData) return []

  // Create a map of year to all values
  const yearMap = {}

  countyData.gas_produced.forEach(row => {
    if (!yearMap[row.year]) yearMap[row.year] = { Year: row.year }
    yearMap[row.year].Gas = formatNumber(row.value)
  })

  countyData.liquid_produced.forEach(row => {
    if (!yearMap[row.year]) yearMap[row.year] = { Year: row.year }
    yearMap[row.year].LiquidOil = formatNumber(row.value)
  })

  countyData.water_produced.forEach(row => {
    if (!yearMap[row.year]) yearMap[row.year] = { Year: row.year }
    yearMap[row.year].ProducedWater = formatNumber(row.value)
  })

  countyData.hf_fluid.forEach(row => {
    if (!yearMap[row.year]) yearMap[row.year] = { Year: row.year }
    yearMap[row.year].HFFluid = formatNumber(row.value)
  })

  countyData.injection.forEach(row => {
    if (!yearMap[row.year]) yearMap[row.year] = { Year: row.year }
    yearMap[row.year].SaltWaterDisposal = formatNumber(row.value)
  })

  return Object.values(yearMap).sort((a, b) => a.Year - b.Year)
}

function getBasinTableData() {
  const basinName = mapStore.selectedBasin
  const basinData = dataStore.basinData[basinName]

  if (!basinData) return []

  // Create a map of year to all values
  const yearMap = {}

  basinData.gas_produced.forEach(row => {
    if (!yearMap[row.year]) yearMap[row.year] = { Year: row.year }
    yearMap[row.year].Gas = formatNumber(row.value)
  })

  basinData.liquid_produced.forEach(row => {
    if (!yearMap[row.year]) yearMap[row.year] = { Year: row.year }
    yearMap[row.year].LiquidOil = formatNumber(row.value)
  })

  basinData.water_produced.forEach(row => {
    if (!yearMap[row.year]) yearMap[row.year] = { Year: row.year }
    yearMap[row.year].ProducedWater = formatNumber(row.value)
  })

  basinData.hf_fluid.forEach(row => {
    if (!yearMap[row.year]) yearMap[row.year] = { Year: row.year }
    yearMap[row.year].HFFluid = formatNumber(row.value)
  })

  basinData.injection.forEach(row => {
    if (!yearMap[row.year]) yearMap[row.year] = { Year: row.year }
    yearMap[row.year].SaltWaterDisposal = formatNumber(row.value)
  })

  return Object.values(yearMap).sort((a, b) => a.Year - b.Year)
}

function formatNumber(value) {
  if (value === null || value === undefined) return '0'
  return new Intl.NumberFormat('en-US').format(Math.round(value))
}

function downloadCSV() {
  if (tableData.value.length === 0) return

  // Convert data to CSV
  const csv = Papa.unparse(tableData.value)

  // Create filename based on current selection
  let filename = 'data'
  if (mapStore.mapFocus === 'State') {
    filename = 'texas_statewide'
  } else if (mapStore.mapFocus === 'County' && mapStore.selectedCounty) {
    filename = `${mapStore.selectedCounty.toLowerCase()}_county`
  } else if (mapStore.mapFocus === 'Basin' && mapStore.selectedBasin) {
    filename = `${mapStore.selectedBasin.toLowerCase()}_basin`
  }

  const dataType = mapStore.dataMode === 'production'
      ? mapStore.selectedProduction.toLowerCase().replace(/ /g, '_')
      : mapStore.selectedInjection.toLowerCase().replace(/ /g, '_')

  filename = `${filename}_${dataType}_${new Date().toISOString().split('T')[0]}.csv`

  // Create download link
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
function downloadAllCSV() {
  const focus = mapStore.mapFocus;
  let allData = [];
  let filename = '';

  if (focus === 'Basin') {
    allData = dataStore.rawBasinData;
    filename = 'all_basins_data.csv';
  } else if (focus === 'County') {
    allData = dataStore.rawCountyData;
    filename = 'all_counties_data.csv';
  } else {
    // State level (focus === 'State' or default)
    allData = dataStore.statewideData;
    filename = 'statewide_data.csv';
  }

  if (!allData || allData.length === 0) {
    console.warn('No data available for download');
    return;
  }

  // Convert to CSV using Papa Parse
  const csv = Papa.unparse(allData);

  // Trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getAllBasinsData() {
  const allBasins = Object.keys(dataStore.basinData);
  const allRows = [];

  allBasins.forEach(basinName => {
    const basinData = dataStore.basinData[basinName];
    if (!basinData) return;

    // Create a map of year to all values for this basin
    const yearMap = {};

    // Process each data type
    basinData.gas_produced?.forEach(row => {
      if (!yearMap[row.year]) {
        yearMap[row.year] = {
          Basin: basinName,
          Year: row.year
        };
      }
      yearMap[row.year].Gas = formatNumber(row.value);
    });

    basinData.liquid_produced?.forEach(row => {
      if (!yearMap[row.year]) {
        yearMap[row.year] = {
          Basin: basinName,
          Year: row.year
        };
      }
      yearMap[row.year].LiquidOil = formatNumber(row.value);
    });

    basinData.water_produced?.forEach(row => {
      if (!yearMap[row.year]) {
        yearMap[row.year] = {
          Basin: basinName,
          Year: row.year
        };
      }
      yearMap[row.year].ProducedWater = formatNumber(row.value);
    });

    basinData.hf_fluid?.forEach(row => {
      if (!yearMap[row.year]) {
        yearMap[row.year] = {
          Basin: basinName,
          Year: row.year
        };
      }
      yearMap[row.year].HFFluid = formatNumber(row.value);
    });

    basinData.injection?.forEach(row => {
      if (!yearMap[row.year]) {
        yearMap[row.year] = {
          Basin: basinName,
          Year: row.year
        };
      }
      yearMap[row.year].SaltWaterDisposal = formatNumber(row.value);
    });

    // Convert yearMap to array and add to allRows
    Object.values(yearMap).forEach(row => allRows.push(row));
  });

  // Sort by Basin then Year
  allRows.sort((a, b) => {
    if (a.Basin !== b.Basin) return a.Basin.localeCompare(b.Basin);
    return a.Year - b.Year;
  });

  return allRows;
}

function getAllCountiesData() {
  const allCounties = Object.keys(dataStore.countyData);
  const allRows = [];

  allCounties.forEach(countyName => {
    const countyData = dataStore.countyData[countyName];
    if (!countyData) return;

    // Create a map of year to all values for this county
    const yearMap = {};

    // Process each data type (same structure as basins)
    countyData.gas_produced?.forEach(row => {
      if (!yearMap[row.year]) {
        yearMap[row.year] = {
          County: countyName,
          Year: row.year
        };
      }
      yearMap[row.year].Gas = formatNumber(row.value);
    });

    countyData.liquid_oil_produced?.forEach(row => {
      if (!yearMap[row.year]) {
        yearMap[row.year] = {
          County: countyName,
          Year: row.year
        };
      }
      yearMap[row.year].LiquidOil = formatNumber(row.value);
    });

    countyData.produced_water?.forEach(row => {
      if (!yearMap[row.year]) {
        yearMap[row.year] = {
          County: countyName,
          Year: row.year
        };
      }
      yearMap[row.year].ProducedWater = formatNumber(row.value);
    });

    countyData.hf_fluid_injected?.forEach(row => {
      if (!yearMap[row.year]) {
        yearMap[row.year] = {
          County: countyName,
          Year: row.year
        };
      }
      yearMap[row.year].HFFluid = formatNumber(row.value);
    });

    countyData.saltwater_disposed?.forEach(row => {
      if (!yearMap[row.year]) {
        yearMap[row.year] = {
          County: countyName,
          Year: row.year
        };
      }
      yearMap[row.year].SaltWaterDisposal = formatNumber(row.value);
    });

    // Convert yearMap to array and add to allRows
    Object.values(yearMap).forEach(row => allRows.push(row));
  });

  // Sort by County then Year
  allRows.sort((a, b) => {
    if (a.County !== b.County) return a.County.localeCompare(b.County);
    return a.Year - b.Year;
  });

  return allRows;
}

// Load data on mount if needed
onMounted(async () => {
  if (!dataStore.hasData) {
    await dataStore.loadCSVData()
  }
})
</script>

<style scoped>
h1 {
  font-size: 1.5rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  h1 {
    font-size: 1.2rem;
  }

  .d-flex {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 12px;
  }
}
</style>