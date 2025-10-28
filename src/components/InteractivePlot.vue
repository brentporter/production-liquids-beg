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
      Please select a county first from the map.
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="showWarning = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
    <v-snackbar
        v-model="showBasinWarning"
        :timeout="3000"
        location="center"
        color="orange-darken-4"
    >
      Please select a basin first from the map.
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="showBasinWarning = false">
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
const showBasinWarning = ref(false)
const isLoading = ref(false)
const chartRendered = ref(true)

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
  if (isLoading.value) return

  isLoading.value = true
  try {
    if (mapStore.mapFocus === 'State') {
      await loadStatewideData()
    } else if (mapStore.mapFocus === 'County') {
      if (!mapStore.selectedCounty) {
        showWarning.value = true
        return
      }
      await loadCountyData()
    } else if (mapStore.mapFocus === 'Basin'){
      if (!mapStore.selectedBasin) {
        showBasinWarning.value = true
        return
      }
      await loadBasinData()
    }
  } catch (error) {
    console.error('Error loading chart data:', error)
  } finally {
    isLoading.value = false
  }
}

async function loadBasinData(){
  const basinName = mapStore.selectedBasin
  const basinData = dataStore.basinData[basinName]

  if (!basinData) {
    console.error('Basin data not available')
    return
  }

  if (mapStore.dataMode === 'production') {
    let values = []
    let seriesName = ''

    if (mapStore.selectedProduction === 'Gas') {
      values = extractValues(basinData.gas_produced, 'value')
      seriesName = 'Gas Production'
    } else if (mapStore.selectedProduction === 'Liquid Oil') {
      values = extractValues(basinData.liquid_produced, 'value')
      seriesName = 'Liquid Oil Production'
    } else if (mapStore.selectedProduction === 'Produced Water') {
      values = extractValues(basinData.water_produced, 'value')
      seriesName = 'Produced Water'
    }

    const newOptions = {
      series: [{
        name: seriesName,
        data: values
      }],
      title: {
        text: `${firstCapital(mapStore.selectedBasin)} ${seriesName}`,
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
      yaxis: {
        showAlways: true,
        axisBorder: {
          show: true,
          color: '#ffffff',
          offsetX: 0,
          offsetY: 0
        },
        title: {
          text: currentYAxisTitle.value
        },
        labels: {
          formatter: (val) => numberWithCommas(val)
        },
        min: undefined,
        max: undefined,
        tickAmount: undefined,
        forceNiceScale: true
      }
    }

    await nextTick()
    setTimeout(() => {
      if (charted.value?.updateOptions) {
        try {
          charted.value.updateOptions(newOptions)
        } catch (error) {
          console.warn('ApexCharts parser warning (continuing):', error)
        }
      }
    }, 100)

  } else if (mapStore.dataMode === 'injection') {
    let values = []
    let seriesName = ''

    if (mapStore.selectedInjection === 'HF Fluid') {
      values = extractValues(basinData.hf_fluid, 'value')
      seriesName = 'HF Fluid'
    } else if (mapStore.selectedInjection === 'Salt Water Disposal') {
      values = extractValues(basinData.injection, 'value')
      seriesName = 'Salt Water Disposal'
    }

    const newOptions = {
      series: [{
        name: seriesName,
        data: values
      }],
      title: {
        text: `${firstCapital(mapStore.selectedBasin)} ${seriesName}`,
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
      yaxis: {
        showAlways: true,
        axisBorder: {
          show: true,
          color: '#ffffff',
          offsetX: 0,
          offsetY: 0
        },
        title: {
          text: currentYAxisTitle.value
        },
        labels: {
          formatter: (val) => numberWithCommas(val)
        },
        min: undefined,
        max: undefined,
        tickAmount: undefined,
        forceNiceScale: true
      }
    }

    await nextTick()
    setTimeout(() => {
      if (charted.value?.updateOptions) {
        try {
          charted.value.updateOptions(newOptions)
        } catch (error) {
          console.warn('ApexCharts parser warning (continuing):', error)
        }
      }
    }, 100)
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
    if (mapStore.selectedInjection === 'HF Fluid') {
      values = extractValues(txData, 'HF_Water_GAL')
      seriesName = 'HF Fluid'
    } else if (mapStore.selectedInjection === 'Salt Water Disposal') {
      values = extractValues(txData, 'Salt_Water_Disposal_BBL')
      seriesName = 'Salt Water Disposal'
    }
  }

  const newOptions = {
    series: [{
      name: seriesName,
      data: values
    }],
    title: {
      text: `Texas-wide ${seriesName}`,
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
    yaxis: {
      showAlways: true,
      axisBorder: {
        show: true,
        color: '#ffffff',
        offsetX: 0,
        offsetY: 0
      },
      title: {
        text: currentYAxisTitle.value
      },
      labels: {
        formatter: (val) => numberWithCommas(val)
      },
      min: undefined,
      max: undefined,
      tickAmount: undefined,
      forceNiceScale: true
    }
  }

  await nextTick()
  setTimeout(() => {
    if (charted.value?.updateOptions) {
      try {
        charted.value.updateOptions(newOptions)
      } catch (error) {
        console.warn('ApexCharts parser warning (continuing):', error)
      }
    }
  }, 100)
}

async function loadCountyData() {
  const countyName = mapStore.selectedCounty.toUpperCase()
  const countyData = dataStore.countyData[countyName]

  if (!countyData) {
    console.error('County data not found:', countyName)
    return
  }

  await nextTick()
  let values = []
  let seriesName = ''
  setTimeout(() => {
    if (mapStore.dataMode === 'production') {


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

      let newOptions = {
        series: [{
          name: seriesName,
          data: values
        }],
        title: {
          text: `${firstCapital(mapStore.selectedCounty)} ${seriesName}`,
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
        yaxis: {
          showAlways: true,
          axisBorder: {
            show: true,
            color: '#ffffff',
            offsetX: 0,
            offsetY: 0
          },
          title: {
            text: currentYAxisTitle.value
          },
          labels: {
            formatter: (val) => numberWithCommas(val)
          },
          /*min: undefined,
          max: undefined,
          tickAmount: undefined,
          forceNiceScale: true*/
        }
      }
      //let newOptions  = [...newOptions.value.yaxis]
      /*newOptions = {
        ...newOptions,
        min: undefined,
        max: undefined,
        tickAmount: undefined,
        forceNiceScale: true
      }*/

      //console.log(countyName + " is the county Name");
      // Sutton County fix - override with static values
      /*if (countyName === 'SUTTON' && mapStore.selectedProduction === 'Gas') {
        newOptions.yaxis.min = 0
        newOptions.yaxis.max = 60000
        newOptions.yaxis.tickAmount = 6
        newOptions.yaxis.forceNiceScale = false
      }*/


      //await nextTick()

// Wait for chart to actually render before allowing next update
      /*    if (!chartRendered.value) {
      await new Promise(resolve => {
        const checkRendered = setInterval(() => {
          if (chartRendered.value) {
            clearInterval(checkRendered)
            resolve()
          }
        }, 50)
      })
    }*/

      //setTimeout(() => {
      //chartRendered.value = false;
      if (charted.value) {
        try {
          charted.value.updateOptions(newOptions)
        } catch (error) {
          console.warn('ApexCharts parser warning (continuing):', error)
        }
      } else {
        chartOptions.value = {
          ...chartOptions.value,
          ...newOptions
        }
      }
      //}, 100)

    } else if (mapStore.dataMode === 'injection') {
      let values = []
      let seriesName = ''

      if (mapStore.selectedInjection === 'HF Fluid') {
        values = extractValues(countyData.hf_fluid, 'value')
        seriesName = 'HF Fluid'
      } else if (mapStore.selectedInjection === 'Salt Water Disposal') {
        values = extractValues(countyData.injection, 'value')
        seriesName = 'Salt Water Disposal'
      }

      const newOptions = {
        series: [{
          name: seriesName,
          data: values
        }],
        title: {
          text: `${firstCapital(mapStore.selectedCounty)} ${seriesName}`,
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
        yaxis: {
          showAlways: true,
          axisBorder: {
            show: true,
            color: '#ffffff',
            offsetX: 0,
            offsetY: 0
          },
          title: {
            text: currentYAxisTitle.value
          },
          labels: {
            formatter: (val) => numberWithCommas(val)
          },
          min: undefined,
          max: undefined,
          tickAmount: undefined,
          forceNiceScale: true
        }
      }


      //setTimeout(() => {
      if (charted.value?.updateOptions) {
        try {
          charted.value.updateOptions(newOptions)
        } catch (error) {
          console.warn('ApexCharts parser warning (continuing):', error)
        }
      }
      //}, 100)
    }
  }, 150)
}

// Main watcher - reacts to any change in selections
watch(
    [
      () => mapStore.mapFocus,
      () => mapStore.dataMode,
      () => mapStore.selectedProduction,
      () => mapStore.selectedInjection,
      () => mapStore.selectedCounty,
      () => mapStore.selectedBasin
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
.chart-wrapper {
  background-color: black;
  padding: 12px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
}
</style>