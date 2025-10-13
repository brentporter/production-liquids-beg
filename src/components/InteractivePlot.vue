<template>
  <v-card
      max-width="650"
      min-width="650"
      height="525"
      elevation="3"
  >
    <div class="ml-2 mt-2">
      <VueApexCharts
          ref="charted"
          width="635px"
          height="465px"
          type="line"
          :options="chartOptions"
          :series="chartSeries"
      />
    </div>
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
  </v-card>
</template>

<script setup>
import VueApexCharts from 'vue3-apexcharts'
import { ref, watch, computed, onMounted } from 'vue'
import { firstCapital, numberWithCommas } from '@/scripts/utility.js'
import { useMapStore } from '../stores/mapStore.js'
import { useDataStore } from '../stores/dataStore.js'
import {
  masterDataLoader,
  masterHFDataLoader,
  masterInjectDataLoader
} from '@/scripts/gather-data-production.js'

const mapStore = useMapStore()
const dataStore = useDataStore()
const charted = ref(null)
const showWarning = ref(false)

// Chart data
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
    curve: ['monotoneCubic', 'monotoneCubic', 'monotoneCubic'],
    width: 4
  },
  colors: ['#ff0000', '#4f67e1', 'rgba(82,192,201,0.55)'],
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
  yaxis: [
    {
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
    {
      opposite: true,
      axisTicks: { show: true },
      axisBorder: {
        show: true,
        color: '#247BA0'
      },
      labels: {
        style: { colors: '#247BA0' },
        formatter: (val) => numberWithCommas(val)
      },
      title: {
        text: '(BBL)',
        style: { color: '#247BA0' }
      }
    }
  ],
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
    shared: true,
    x: { format: 'yyyy' }
  }
})

// Helper functions
function createSeriesData(results, seriesName, seriesKey) {
  const values = results.map(row => parseInt(row[seriesKey]))
  return {
    name: seriesName,
    data: values
  }
}

function combineProductionData(gasArray, liquidArray, waterArray) {
  const yearMap = {}

  gasArray.forEach(item => {
    if (!yearMap[item.year]) yearMap[item.year] = { Year: item.year }
    yearMap[item.year].Gas_Produced_MCF = item.value
  })

  liquidArray.forEach(item => {
    if (!yearMap[item.year]) yearMap[item.year] = { Year: item.year }
    yearMap[item.year].Liquid_Produced_BBL = item.value
  })

  waterArray.forEach(item => {
    if (!yearMap[item.year]) yearMap[item.year] = { Year: item.year }
    yearMap[item.year].Water_Produced_BBL = item.value
  })

  return Object.values(yearMap).sort((a, b) => parseInt(a.Year) - parseInt(b.Year))
}

function updateChartTitle(text) {
  chartOptions.value.title.text = text
}

function updateYAxisTitle(axisIndex, title) {
  if (chartOptions.value.yaxis[axisIndex]) {
    chartOptions.value.yaxis[axisIndex].title.text = title
  }
}

function resetAxisScales() {
  chartOptions.value.yaxis.forEach((axis, index) => {
    chartOptions.value.yaxis[index] = {
      ...axis,
      min: undefined,
      max: undefined,
      tickAmount: undefined,
      forceNiceScale: true
    }
  })

  if (charted.value) {
    try {
      charted.value.updateOptions({ yaxis: chartOptions.value.yaxis })
    } catch (error) {
      console.warn('Chart update warning:', error)
    }
  }
}

// Main data loading function
async function loadChartData(focusLevel, dataType) {
  try {
    if (focusLevel === 'statewide') {
      const txData = await dataStore.statewideData
      console.log(txData);

      if (!txData) {
        console.error('Statewide data not available')
        return
      }

      const gasResults = txData.map(({ Year, Gas_Produced_MCF }) => ({ Year, Gas_Produced_MCF }))
      const liquidResults = txData.map(({ Year, Liquid_Produced_BBL }) => ({ Year, Liquid_Produced_BBL }))
      const waterResults = txData.map(({ Year, Water_Produced_BBL }) => ({ Year, Water_Produced_BBL }))

      chartSeries.value = [
        createSeriesData(gasResults, 'Gas Produced (mcf)', 'Gas_Produced_MCF'),
        createSeriesData(waterResults, 'Water Produced (BBL)', 'Water_Produced_BBL'),
        createSeriesData(liquidResults, 'Liquid Produced (BBL)', 'Liquid_Produced_BBL')
      ]

      updateChartTitle('Texas-wide Well Production')
      updateYAxisTitle(0, '(mcf)')

      setTimeout(resetAxisScales, 100)
    } else if (focusLevel === 'county' && mapStore.selectedCounty) {
      if (dataType === 'production') {
        const countyData = dataStore.masterData[mapStore.selectedCounty.toUpperCase()]

        if (!countyData) {
          console.error('County data not found')
          return
        }

        const tableData = combineProductionData(
            countyData.gas_produced,
            countyData.liquid_produced,
            countyData.water_produced
        )

        chartSeries.value = [
          createSeriesData(tableData, 'Gas Produced (mcf)', 'Gas_Produced_MCF'),
          createSeriesData(tableData, 'Water Produced (BBL)', 'Water_Produced_BBL'),
          createSeriesData(tableData, 'Liquid Produced (BBL)', 'Liquid_Produced_BBL')
        ]

        updateChartTitle(`${firstCapital(mapStore.selectedCounty)} Well Production`)
        updateYAxisTitle(0, '(mcf)')

        setTimeout(resetAxisScales, 100)
      } else if (dataType === 'hf_fluid') {
        const hfData = dataStore.hfFluidData.find(
            hf => hf.COUNTY === mapStore.selectedCounty.toUpperCase()
        )

        if (hfData) {
          const hfMapped = Object.keys(hfData)
              .filter(key => key !== 'COUNTY')
              .sort()
              .map(year => ({
                Year: parseInt(year),
                HF_Fluid_Volume: hfData[year]
              }))

          chartSeries.value = [createSeriesData(hfMapped, 'HF Fluid Volume (GAL)', 'HF_Fluid_Volume')]

          // Single axis for HF
          chartOptions.value.yaxis = [chartOptions.value.yaxis[0]]
          updateChartTitle(`${firstCapital(mapStore.selectedCounty)} HF Fluid`)
          updateYAxisTitle(0, '(gal)')

          setTimeout(resetAxisScales, 100)
        }
      } else if (dataType === 'injection') {
        const injectionData = dataStore.injectionData.find(
            inj => inj.County === mapStore.selectedCounty.toUpperCase()
        )

        if (injectionData) {
          const injectionMapped = Object.keys(injectionData)
              .filter(key => key !== 'County')
              .sort()
              .map(year => ({
                Year: parseInt(year),
                Injections: injectionData[year]
              }))

          chartSeries.value = [createSeriesData(injectionMapped, 'Injections (BBL)', 'Injections')]

          // Single axis for injection
          chartOptions.value.yaxis = [chartOptions.value.yaxis[0]]
          updateChartTitle(`${firstCapital(mapStore.selectedCounty)} Injection`)
          updateYAxisTitle(0, '(barrels)')

          setTimeout(resetAxisScales, 100)
        }
      }
    } else if (!mapStore.selectedCounty && focusLevel !== 'statewide') {
      showWarning.value = true
    }
  } catch (error) {
    console.error('Error loading chart data:', error)
  }
}

// Watchers
watch(
    [
      () => mapStore.mapFocus,
      () => mapStore.dataMode,
      () => mapStore.selectedProduction,
      () => mapStore.selectedInjection,
      () => mapStore.selectedCounty,
      () => mapStore.selectedProductionYear
    ],
    ([focus, mode, production, injection, county]) => {
      if (focus === 'State') {
        loadChartData('statewide')
      } else if (focus === 'County') {
        if (!county) {
          showWarning.value = true
          return
        }

        const dataType = mode === 'production' ? 'production' : injection === 'HF Fluid' ? 'hf_fluid' : 'injection'
        loadChartData('county', dataType)
      }
    }
)

// Initialize
onMounted(async () => {
  if (!dataStore.hasData) {
    await dataStore.loadCSVData()
  }

  if (mapStore.selectedCounty) {
    const dataType = mapStore.dataMode === 'production' ? 'production' : 'hf_fluid'
    await loadChartData('county', dataType)
  } else {
    await loadChartData('statewide')
  }
})
</script>

<style scoped></style>