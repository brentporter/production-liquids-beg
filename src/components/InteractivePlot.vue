<template>
  <div>
    <v-card
        width="525px"
        height="375px"
        elevation="3"
    >
      <div class="chart-wrapper">
        <VueApexCharts
            ref="charted"
            width="500px"
            height="350px"
            type="line"
            :options="chartOptions"
            :series="chartSeries"
        />
      </div>
    </v-card>
    <v-snackbar
        v-model="showWarning"
        :timeout="3000"
        location="center"
        color="orange-darken-4"
    >
      Please select a county first either from the map or from the controls.
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="showWarning = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import VueApexCharts from 'vue3-apexcharts'
import { ref, watch, computed, onMounted, nextTick } from 'vue'
import { firstCapital, numberWithCommas } from '@/scripts/utility.js'
import { useMapStore } from '../stores/mapStore.js'
import { useDataStore } from '../stores/dataStore.js'

const mapStore = useMapStore()
const dataStore = useDataStore()
const charted = ref(null)
const showWarning = ref(false)

// Single series - only one product at a time
const chartSeries = ref([
  {
    name: 'Gas Production',
    data: []
  }
])

const chartOptions = ref({
  chart: {
    type: 'line',
    stacked: false,
    background: '#0a0a0a',
    id: 'productionChart',
    foreColor: '#ffffff',
    zoom: {
      autoScaleYaxis: false
    },
    toolbar: {
      show: true,
      export: {
        svg: { filename: 'production-data' },
        png: { filename: 'production-data' }
      }
    }
  },
  legend: {
    showForSingleSeries: true
  },
  stroke: {
    curve: 'monotoneCubic',
    width: 4
  },
  colors: ['#ff0000'],
  xaxis: {
    categories: ['2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
    labels: {
      show: true,
      rotate: -45,
      rotateAlways: false,
      axisTicks: { show: false },
      hideOverlappingLabels: true,
      tickPlacement: 'between'
    }
  },
  yaxis: {
    showAlways: true,
    axisBorder: {
      show: true,
      color: '#ffffff',
      offsetX: 0,
      offsetY: 0
    },
    title: {
      text: '(mcf)'
    },
    labels: {
      formatter: (val) => numberWithCommas(val)
    }
  },
  title: {
    text: 'Texas Well Production',
    align: 'left',
    margin: 0,
    offsetX: 10,
    offsetY: 10,
    floating: false,
    style: {
      fontSize: '19px',
      fontWeight: 'bold',
      color: '#bdcfdb'
    }
  },
  tooltip: {
    theme: 'dark',
    shared: false,
    x: { format: 'yyyy' }
  }
})

// Computed properties for current display
const currentYAxisTitle = computed(() => {
  if (mapStore.dataMode === 'production') {
    if (mapStore.selectedProduction === 'Gas') return '(mcf)'
    if (mapStore.selectedProduction === 'Liquid Oil') return '(BBL)'
    if (mapStore.selectedProduction === 'Produced Water') return '(BBL)'
  } else if (mapStore.selectedInjection === 'HF Fluid') {
    return '(gal)'
  } else {
    return '(BBL)'
  }
})

// Helper to extract values from data
function extractValues(data, key) {
  return data.map(row => parseInt(row[key]) || 0)
}

// Main data loading function
async function loadChartData() {
  try {
    if (mapStore.mapFocus === 'State') {
      await loadStatewideData()
    } else if (mapStore.mapFocus === 'County') {
      if (!mapStore.selectedCounty) {
        showWarning.value = true
        return
      }
      await loadCountyData()
    }
  } catch (error) {
    console.error('Error loading chart data:', error)
  }
}

async function loadStatewideData() {
  const txData = dataStore.statewideData

  if (!txData || !Array.isArray(txData)) {
    console.error('Statewide data not available')
    return
  }

  let values = []
  let seriesName = ''

  if (mapStore.dataMode === 'production') {
    if (mapStore.selectedProduction === 'Gas') {
      values = extractValues(txData, 'Gas_Produced_MCF')
      seriesName = 'Gas Production'
    } else if (mapStore.selectedProduction === 'Liquid Oil') {
      values = extractValues(txData, 'Liquid_Produced_BBL')
      seriesName = 'Liquid Oil Production'
    } else if (mapStore.selectedProduction === 'Produced Water') {
      values = extractValues(txData, 'Water_Produced_BBL')
      seriesName = 'Produced Water'
    }
  } else if (mapStore.dataMode === 'injection') {
    console.log('Statewide injection data - awaiting aggregated CSV')
    return
  }

  chartSeries.value = [
    {
      name: seriesName,
      data: values
    }
  ]

  chartOptions.value.title.text = `Texas-wide ${seriesName}`
  chartOptions.value.yaxis.title.text = currentYAxisTitle.value

  await nextTick()
  setTimeout(() => {
    if (charted.value?.updateOptions) {
      charted.value.updateOptions({
        title: chartOptions.value.title,
        yaxis: chartOptions.value.yaxis
      })
    }
  }, 50)
}

async function loadCountyData() {
  const countyName = mapStore.selectedCounty.toUpperCase()

  if (mapStore.dataMode === 'production') {
    const countyData = dataStore.masterData[countyName]

    if (!countyData) {
      console.error('County data not found:', countyName)
      return
    }

    let values = []
    let seriesName = ''

    if (mapStore.selectedProduction === 'Gas') {
      values = extractValues(countyData.gas_produced, 'value')
      seriesName = 'Gas Production'
    } else if (mapStore.selectedProduction === 'Liquid Oil') {
      values = extractValues(countyData.liquid_produced, 'value')
      seriesName = 'Liquid Oil Production'
    } else if (mapStore.selectedProduction === 'Produced Water') {
      values = extractValues(countyData.water_produced, 'value')
      seriesName = 'Produced Water'
    }

    chartSeries.value = [
      {
        name: seriesName,
        data: values
      }
    ]

    chartOptions.value.title.text = `${firstCapital(mapStore.selectedCounty)} ${seriesName}`
    chartOptions.value.yaxis.title.text = currentYAxisTitle.value

    await nextTick()
    setTimeout(() => {
      if (charted.value?.updateOptions) {
        charted.value.updateOptions({
          title: chartOptions.value.title,
          yaxis: chartOptions.value.yaxis
        })
      }
    }, 50)
  } else if (mapStore.dataMode === 'injection') {
    let values = []
    let seriesName = ''

    if (mapStore.selectedInjection === 'HF Fluid') {
      const hfData = dataStore.hfFluidData.find(hf => hf.COUNTY === countyName)

      if (!hfData) {
        console.error('HF Fluid data not found for:', countyName)
        return
      }

      values = Object.keys(hfData)
          .filter(key => key !== 'COUNTY')
          .sort()
          .map(year => parseInt(hfData[year]) || 0)

      seriesName = 'HF Fluid'
    } else if (mapStore.selectedInjection === 'Salt Water Disposal') {
      const injectionData = dataStore.injectionData.find(inj => inj.County === countyName)

      if (!injectionData) {
        console.error('Injection data not found for:', countyName)
        return
      }

      values = Object.keys(injectionData)
          .filter(key => key !== 'County')
          .sort()
          .map(year => parseInt(injectionData[year]) || 0)

      seriesName = 'Salt Water Disposal'
    }

    chartSeries.value = [
      {
        name: seriesName,
        data: values
      }
    ]

    chartOptions.value.title.text = `${firstCapital(mapStore.selectedCounty)} ${seriesName}`
    chartOptions.value.yaxis.title.text = currentYAxisTitle.value

    await nextTick()
    setTimeout(() => {
      if (charted.value?.updateOptions) {
        charted.value.updateOptions({
          title: chartOptions.value.title,
          yaxis: chartOptions.value.yaxis
        })
      }
    }, 50)
  }
}

// Main watcher - reacts to any change in selections
watch(
    [
      () => mapStore.mapFocus,
      () => mapStore.dataMode,
      () => mapStore.selectedProduction,
      () => mapStore.selectedInjection,
      () => mapStore.selectedCounty,
      () => mapStore.selectedProductionYear
    ],
    async () => {
      await loadChartData()
    }
)

// Initialize
onMounted(async () => {
  if (!dataStore.hasData) {
    await dataStore.loadCSVData()
  }

  await loadChartData()
})
</script>

<style scoped>
.chart-controls {
  margin-bottom: 8px;
  display: flex;
  gap: 8px;
  position: relative;
  z-index: 1001;
}

.chart-wrapper {
  background-color: black;
  padding: 12px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
}

.v-card {
  transition: all 0.3s ease;
}

.v-card.expanded {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  max-height: 95vh;
  max-width: 95vw;
  overflow: hidden;
}
</style>