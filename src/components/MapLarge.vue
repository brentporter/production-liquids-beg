<template>
  <div class="map-container">
    <div id="mapViewer" class="mapdiv"></div>
    <div id="testButtonDiv" style="min-width: 250px;min-height: 40px;background-color: black !important;">
      <MapDates />
    </div>
<!--    v-if="mapLayerView === 'countyBoundariesTx'"
<div class="map-placeholder">
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
import { useDataStore } from '../stores/dataStore'
import {onMounted, ref, watch} from 'vue'
import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";
import Viewpoint from "@arcgis/core/Viewpoint.js";
import {Point} from "@arcgis/core/geometry.js";
import Home from "@arcgis/core/widgets/Home.js";
import Legend from "@arcgis/core/widgets/Legend.js";
import Expand from "@arcgis/core/widgets/Expand.js";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import MapDates from "@/components/MapDates.vue";
import {createClassBreaksRenderer} from "@arcgis/core/smartMapping/renderers/size.js";
import {ClassBreaksRenderer} from "@arcgis/core/renderers.js";
import {SimpleFillSymbol} from "@arcgis/core/symbols.js";
const isInitializing = ref(true)
let begMap,begView,countyBoundariesTx,
    countiesHFTx,countyProducedWaterTx,customExpand,
    countyLiquidOilTx,countiesInjectionTx,layerMap;

const mapStore = useMapStore();
const dataStore = useDataStore()

// Watch for changes to trigger map updates
watch(
    [
      () => mapStore.mapFocus,
      () => mapStore.dataMode,
      () => mapStore.selectedProduction,
      () => mapStore.selectedInjection
    ],
    ([newFocus, newMode, newProduction, newInjection]) => {
      if (!dataStore.hasData) {
        console.log('Data not loaded yet')
        return
      }

      // Get statewide data for the selected type
      const data = dataStore.getDataByFocus(newFocus,
          newMode === 'production' ? 'production' :
              newInjection === 'HF Fluid' ? 'hf_fluid' : 'injection'
      )

      // Remove all layers first
      begMap.remove(layerMap['countyBoundariesTx'])
      begMap.remove(layerMap['countyLiquidOilTx'])
      begMap.remove(layerMap['countyProducedWaterTx'])
      begMap.remove(layerMap['countiesHFTx'])
      begMap.remove(layerMap['countiesInjectionTx'])

      // Add the correct layer
      if (newMode === 'production' && newProduction === 'Gas') {
        mapStore.setCurrentMapLayerView('countyBoundariesTx')
        begMap.add(layerMap['countyBoundariesTx'])
      } else if (newMode === 'production' && newProduction === 'Liquid Oil') {
        mapStore.setCurrentMapLayerView('countyLiquidOilTx')
        begMap.add(layerMap['countyLiquidOilTx'])
      } else if(newMode === 'production' && newProduction === 'Produced Water'){
        mapStore.setCurrentMapLayerView('countyProducedWaterTx')
        begMap.add(layerMap['countyProducedWaterTx'])
      } else if (newMode === 'injection' && newInjection === 'HF Fluid') {
        mapStore.setCurrentMapLayerView('countiesHFTx')
        begMap.add(layerMap['countiesHFTx'])
      } else if (newMode === 'injection' && newInjection === 'Salt Water Disposal') {
        mapStore.setCurrentMapLayerView('countiesInjectionTx')
        begMap.add(layerMap['countiesInjectionTx'])
      }
    }
)

watch(
    () => mapStore.esriExpression,
    (newExpression) => {
      if (newExpression) {
        console.log('New ESRI expression:', newExpression)
        // Update your map layer with the new expression
        updateMapLayerExpression(newExpression)
      }
    }
)

const colorVisVar = {
  type: "color",
  classificationMethod: "natural-breaks",
  //valueExpression: esriExpression.value,
  field:'Gas_Produced_BBL_2010',
  //normalizationField:'County_Area',
  numClasses: 7,
  stops: [
    /*    {
          value: 0, color: "#CCCCCC",
          label: "0"
        },
        {
          value: 12000000, color: "#efdab2",
          label: "1-12000000"
        },
        {
          value: 36000000, color: "#42ff00",
          label: "12000001-36000000"
        },
        {
          value: 77000000, color: "#1CD84F",
          label: "36000001-77000000"
        },
        {
          value: 154000000, color: "#22AFA2",
          label: "77000001-154000000"
        },
        {
          value: 294000000, color: "#386AA6",
          label: "154000000-294000000"
        },
        {
          value: 894000000, color: "#2F0E89",
          label: "294000000-894000000"
        },*/
  ]
};

const transformClassBreaksToStops = (classBreakInfos, colorArray, unitType) => {
  if (!classBreakInfos || classBreakInfos.length === 0) return [];
//'Gas','Water','Liquid (Oil)',
  return classBreakInfos.map((classBreak, index) => {
    const value = classBreak.maxValue;
    const color = colorArray[index % colorArray.length];

    let label;
    if (index === 0) {
      label = "0";
    } else {
      const prevMax = classBreakInfos[index - 1].maxValue;

      // Format based on unit type
      let prevFormatted, currentFormatted, unit;
      if (unitType === 'BBL' && mapStore.currentMapLayerView === 'countyProducedWaterTx') {
        prevFormatted = (prevMax / 1000000).toFixed(1);
        currentFormatted = (value / 1000000).toFixed(1);
        unit = 'M BBL';
      } else if (unitType === 'BBL') {
        prevFormatted = (prevMax / 1000000000).toFixed(1);
        currentFormatted = (value / 1000000000).toFixed(1);
        unit = 'B BBL';
      } else if (unitType === 'GAL') {
        prevFormatted = (prevMax / 1000000).toFixed(1);
        currentFormatted = (value / 1000000).toFixed(1);
        unit = 'M GAL';
      } else { // MCF
        prevFormatted = (prevMax / 1000000).toFixed(1);
        currentFormatted = (value / 1000000).toFixed(1);
        unit = 'M MCF';
      }

      label = `${prevFormatted} - ${currentFormatted} ${unit}`;
    }

    return { value, color, label };
  });
};
async function updateMapLayerExpression(newExpression) {
  let colorArray;
  let unitType;

  if (mapStore.currentMapLayerView === 'countyBoundariesTx') {
    colorArray = ["#CCCCCC", "#FFE197", "#42ff00", "#1CD84F", "#22AFA2", "#386AA6", "#2F0E89"];
    unitType = mapStore.selectedProduction === 'Gas' ? 'mcf' : 'bbl';
  } else if (mapStore.currentMapLayerView === 'countyLiquidOilTx') {
    colorArray = ['#CCCCCC',
      '#DAD7A4', '#C6BC8F',
      '#B3A37A', '#9E8A65',
      '#8A7151', '#785A3E'];
    unitType = 'BBL';
  } else if (mapStore.currentMapLayerView === 'countyProducedWaterTx') {
    colorArray = ['#CCCCCC',
      '#CCEBC5', '#A8DDB5',
      '#7BCCC4', '#4EB3D3',
      '#2B8CBE', '#08589E'];
    unitType = 'BBL';
  } else if (mapStore.currentMapLayerView === 'countiesHFTx') {
    colorArray = ['#CCCCCC',
      '#FFEBAF', '#C5FF00',
      '#FFFF00', '#FFAA00',
      '#FF6600', '#FF0000'];
    unitType = 'GAL';
  } else if (mapStore.currentMapLayerView === 'countiesInjectionTx') {
    colorArray = ['#CCCCCC',
      '#92F4EB', '#00A7DF',
      '#658FF8', '#5804F5',
      '#BA0EF4', '#FC20F5'];
    unitType = 'BBL';
  }

  const currentLayer = layerMap[mapStore.currentMapLayerView];
  try {

    const sizeParams = {
      layer: currentLayer,
      field: newExpression,
      classificationMethod: "natural-breaks",
      numClasses: 7
    }
    console.log(currentLayer);
    console.log(newExpression);
    console.log(sizeParams);

    await createClassBreaksRenderer(sizeParams).then(async function (response) {
      console.log(response.classBreaksResult.classBreakInfos)
      const classBreaks = response.classBreaksResult.classBreakInfos;

      const originalFirst = {...classBreaks[0]};
      const originalSecond = {...classBreaks[1]};

// Insert a new zero-only break at the beginning
      classBreaks.unshift({
        minValue: 0,
        maxValue: 0,
        label: "0"
      });

// Now merge what were the original [0] and [1] into the new [1] position
// (they're now at positions [1] and [2] after the unshift)
      classBreaks[1] = {
        minValue: originalFirst.minValue,
        maxValue: originalSecond.maxValue,
        label: `${originalFirst.minValue} - ${originalSecond.maxValue}`
      };

// Remove what's now at position [2] since it's merged into [1]
      classBreaks.splice(2, 1);


      const formattedStops = transformClassBreaksToStops(classBreaks, colorArray, unitType);

      const rendererNew = new ClassBreaksRenderer({
        field: newExpression,
        classBreakInfos: classBreaks.map((classBreak, index) => ({
          minValue: classBreak.minValue,
          maxValue: classBreak.maxValue,
          symbol: new SimpleFillSymbol({
            color: formattedStops[index].color,
            outline: {
              color: [255, 255, 255, 1.0],
              width: 2
            }
          }),
          label: formattedStops[index].label
        }))
      });
      console.log(colorVisVar.stops);
      currentLayer.renderer = rendererNew;
      /*if (legend) {
        legend.view = null; // Clear it
        await nextTick();
        legend.view = begView; // Re-attach it
      }*/
    })
  } catch (error) {
    console.log(error);
  }
}

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

  customExpand = new Expand({
    view: begView,
    expanded: true,
    expandTooltip: 'Show View Options',
    content: document.getElementById('testButtonDiv')
  });
  begView.ui.add(customExpand, 'top-right');

  countyBoundariesTx = new FeatureLayer({
    //url:'https://services1.arcgis.com/7DRakJXKPEhwv0fM/arcgis/rest/services/Texas_Well_Production/FeatureServer/0',
    //url: 'https://services1.arcgis.com/7DRakJXKPEhwv0fM/arcgis/rest/services/Tx_Well_Production/FeatureServer/0',
    //url:'https://services1.arcgis.com/7DRakJXKPEhwv0fM/arcgis/rest/services/Texas_Gas_Production/FeatureServer/0',
    url:'https://services1.arcgis.com/7DRakJXKPEhwv0fM/arcgis/rest/services/Texas_Gas_Production/FeatureServer/0',
    setAutoGeneralize: true,
    outFields: ["*"],
    opacity:0.75,
    id: "countyBoundariesTx",
  })

  countyLiquidOilTx = new FeatureLayer({
    //url:'https://services1.arcgis.com/7DRakJXKPEhwv0fM/arcgis/rest/services/Texas_Well_Production/FeatureServer/0',
    //url: 'https://services1.arcgis.com/7DRakJXKPEhwv0fM/arcgis/rest/services/Tx_Well_Production/FeatureServer/0',
    //url:'https://services1.arcgis.com/7DRakJXKPEhwv0fM/arcgis/rest/services/Texas_Gas_Production/FeatureServer/0',
    url:'https://services1.arcgis.com/7DRakJXKPEhwv0fM/arcgis/rest/services/Texas_Liquid_Oil_Production/FeatureServer/0',
    setAutoGeneralize: true,
    outFields: ["*"],
    opacity:0.75,
    id: "countyLiquidOilTx",
  })

  countyProducedWaterTx = new FeatureLayer({
    //url:'https://services1.arcgis.com/7DRakJXKPEhwv0fM/arcgis/rest/services/Texas_Well_Production/FeatureServer/0',
    //url: 'https://services1.arcgis.com/7DRakJXKPEhwv0fM/arcgis/rest/services/Tx_Well_Production/FeatureServer/0',
    url:'https://services1.arcgis.com/7DRakJXKPEhwv0fM/arcgis/rest/services/Texas_Produced_Water_Production/FeatureServer/0',
    setAutoGeneralize: true,
    outFields: ["*"],
    opacity:0.75,
    id: "countyProducedWaterTx",
  })

  countiesHFTx = new FeatureLayer({
    url:'https://services1.arcgis.com/7DRakJXKPEhwv0fM/arcgis/rest/services/Texas_County_HF_Fluid/FeatureServer/0',
    opacity:0.75,
    setAutoGeneralize: true,
    outFields: ["*"],
    id: "countiesHFTx",
  })

  countiesInjectionTx = new FeatureLayer({
    url:'https://services1.arcgis.com/7DRakJXKPEhwv0fM/arcgis/rest/services/Texas_County_Injection_Info/FeatureServer/0',
    opacity:0.75,
    setAutoGeneralize:true,
    outFields:["*"],
    id:"countiesInjectionTx",
  })

  layerMap = {
    'countyBoundariesTx': countyBoundariesTx,
    'countyLiquidOilTx':countyLiquidOilTx,
    'countyProducedWaterTx':countyProducedWaterTx,
    'countiesHFTx': countiesHFTx,
    'countiesInjectionTx': countiesInjectionTx
  };
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