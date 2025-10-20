<template>
  <div class="map-container">
    <MapDates />
    <div id="mapViewer" class="mapdiv"></div>

    <!--    <div id="testButtonDiv" style="min-width: 250px;min-height: 40px;background-color: black !important;">
          <MapDates />
        </div>-->
    <div id="testButtonDiv2">
      <InteractivePlot />
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
import InteractivePlot from "@/components/InteractivePlot.vue";
import Color from "@arcgis/core/Color.js";
const isInitializing = ref(true)
let begMap,begView,countyBoundariesTx,
    countiesHFTx,countyProducedWaterTx,customExpand,
    customExpand2,countyLiquidOilTx,countiesInjectionTx,
    basinsInjectionTx, layerMap;

const mapStore = useMapStore();
const dataStore = useDataStore();

//let highlightHandle = null
let highlightHandle = null;
let highlights = [];
let selectedGraphic = null;
let selectedBasinGraphic = null;
let initialView;

watch(
    () => mapStore.mapFocus,
    (newFocus) => {
      if (newFocus === 'State') {
        begView.goTo({
          center: initialView.center,
          zoom: initialView.zoom
        }, {
          duration: 1000 // milliseconds
        })
        highlights.forEach((h) => {
          h.remove()
        })
        highlightHandle = null
        selectedGraphic = null
      }
      else if (newFocus === 'County' && selectedGraphic) {
        // Get the actual layer object from the map by ID
        console.log('Re-highlighting graphic')
        const layerId = mapStore.currentMapLayerView
        const layer = begMap.findLayerById(layerId)

        if (layer) {
          begView.whenLayerView(layer).then((layerView) => {
            if (highlightHandle) {
              highlights.forEach((h) => h.remove())
            }

            highlightHandle = layerView.highlight(selectedGraphic, "default")
            highlights.push(highlightHandle)
          }).catch((err) => {
            console.warn('Layer view not yet available:', err)
          })
        }
      }
      else if (newFocus === 'Basin'){
        begView.goTo({
          center: initialView.center,
          zoom: initialView.zoom
        }, {
          duration: 1000 // milliseconds
        })
        highlights.forEach((h) => {
          h.remove()
        })
        highlightHandle = null
        selectedGraphic = null
        const layerId = mapStore.currentMapLayerView
        const layer = begMap.findLayerById(layerId)
      }
    }

)
/*
watch(
    () => mapStore.mapFocus,
    (newFocus) => {
      if (newFocus === 'State' && highlightHandle) {
        highlights.forEach((h) =>{
          h.remove();
        });
      }
    }
)
*/

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
      // Store the current highlight before removing layers
      const wasHighlighted = highlightHandle !== null
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
      begMap.remove(layerMap['basinsInjectionTx'])

      // Add the correct layer
      // Add the correct layer
      let newLayerId = ''
      // Check if we're in Basin focus
      if (newFocus === 'Basin') {
        newLayerId = 'basinsInjectionTx'
        mapStore.setCurrentMapLayerView(newLayerId)
        begMap.add(layerMap[newLayerId])
      } else if (newMode === 'production' && newProduction === 'Gas') {
        newLayerId = 'countyBoundariesTx'
        mapStore.setCurrentMapLayerView(newLayerId)
        begMap.add(layerMap[newLayerId])
      } else if (newMode === 'production' && newProduction === 'Liquid Oil') {
        newLayerId = 'countyLiquidOilTx'
        mapStore.setCurrentMapLayerView(newLayerId)
        begMap.add(layerMap[newLayerId])
      } else if(newMode === 'production' && newProduction === 'Produced Water'){
        newLayerId = 'countyProducedWaterTx'
        mapStore.setCurrentMapLayerView(newLayerId)
        begMap.add(layerMap[newLayerId])
      } else if (newMode === 'injection' && newInjection === 'HF Fluid') {
        newLayerId = 'countiesHFTx'
        mapStore.setCurrentMapLayerView(newLayerId)
        begMap.add(layerMap[newLayerId])
      } else if (newMode === 'injection' && newInjection === 'Salt Water Disposal') {
        newLayerId = 'countiesInjectionTx'
        mapStore.setCurrentMapLayerView(newLayerId)
        begMap.add(layerMap[newLayerId])
      }
      // Re-highlight on the new layer if there was a highlight before
      if (wasHighlighted && selectedGraphic && newLayerId) {
        const layer = begMap.findLayerById(newLayerId)
        if (layer) {
          begView.whenLayerView(layer).then((layerView) => {
            if (highlightHandle) {
              highlights.forEach((h) => h.remove())
            }

            highlightHandle = layerView.highlight(selectedGraphic, "default")
            highlights.push(highlightHandle)
          })
        }
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

/*
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
      if (unitType === 'BBL' && (mapStore.currentMapLayerView === 'countyProducedWaterTx' || mapStore.currentMapLayerView === 'countyLiquidOilTx')) {
        prevFormatted = (prevMax / 1000000).toFixed(1);
        currentFormatted = (value / 1000000).toFixed(1);
        unit = 'M BBL';
      } else if (unitType === 'BBL' && mapStore.currentMapLayerView === 'countiesInjectionTx') {
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
*/

const transformClassBreaksToStops = (classBreakInfos, colorArray, unitType) => {
  if (!classBreakInfos || classBreakInfos.length === 0) return [];

  return classBreakInfos.map((classBreak, index) => {
    const value = classBreak.maxValue;
    const color = colorArray[index % colorArray.length];
    let label;

    if (index === 0) {
      label = "0";
    } else {
      const prevMax = classBreakInfos[index - 1].maxValue;
      let prevFormatted, currentFormatted, unit;

      // Basin-specific units
      if (unitType === 'BCF') {
        prevFormatted = prevMax.toFixed(1);
        currentFormatted = value.toFixed(1);
        unit = 'BCF';
      } else if (unitType === 'Billion_GAL') {
        prevFormatted = prevMax.toFixed(1);
        currentFormatted = value.toFixed(1);
        unit = 'B GAL';
      } else if (unitType === 'Million_BBL') {
        prevFormatted = prevMax.toFixed(1);
        currentFormatted = value.toFixed(1);
        unit = 'M BBL';
      }
      // County-specific units
      else if (unitType === 'BBL' && (mapStore.currentMapLayerView === 'countyProducedWaterTx' || mapStore.currentMapLayerView === 'countyLiquidOilTx')) {
        prevFormatted = (prevMax / 1000000).toFixed(1);
        currentFormatted = (value / 1000000).toFixed(1);
        unit = 'M BBL';
      } else if (unitType === 'BBL' && mapStore.currentMapLayerView === 'countiesInjectionTx') {
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
    let colorArrayOld = ["#CCCCCC",
      "#FDD0A2", "#FDAE6B",
      "#FD8D3C", "#F16913",
      "#D94801", "#8C2D04"];
    colorArray = ["#CCCCCC",
      "#FCBBA1", "#FC9272",
      "#FB6A4A","#EF3B2C",
      "#CB181D", "#99000D"
    ]
    unitType = mapStore.selectedProduction === 'Gas' ? 'mcf' : 'bbl';
  } else if (mapStore.currentMapLayerView === 'countyLiquidOilTx') {
    let colorArrayGasOld = ['#CCCCCC',
      '#DAD7A4', '#C6BC8F',
      '#B3A37A', '#9E8A65',
      '#8A7151', '#785A3E'];
    colorArray = ['#CCCCCC',
      "#CCECD1","#99D8C9",
      "#66C2A4","#41AE76",
      "#238B45","#005824",

    ]
    unitType = 'BBL';
  } else if (mapStore.currentMapLayerView === 'countyProducedWaterTx') {
    let colorArrayOld = ['#CCCCCC',
      '#CCEBC5', '#A8DDB5',
      '#7BCCC4', '#4EB3D3',
      '#2B8CBE', '#08589E'];
    colorArray = ['#CCCCCC',
      '#DAD7A4', '#C6BC8F',
      '#B3A37A', '#9E8A65',
      '#8A7151', '#785A3E'];
    unitType = 'BBL';
  } else if (mapStore.currentMapLayerView === 'countiesHFTx') {
    let colorArrayOld = ['#CCCCCC',
      '#FFEBAF', '#C5FF00',
      '#FFFF00', '#FFAA00',
      '#FF6600', '#FF0000'];
    colorArray = ['#CCCCCC',
      '#CCEBC5', '#A8DDB5',
      '#7BCCC4', '#4EB3D3',
      '#2B8CBE', '#08589E'];
    unitType = 'GAL';
  } else if (mapStore.currentMapLayerView === 'countiesInjectionTx') {
    colorArray = ["#CCCCCC",
      "#FDD0A2", "#FDAE6B",
      "#FD8D3C", "#F16913",
      "#D94801", "#8C2D04"];
    unitType = 'BBL';
  } else if (mapStore.currentMapLayerView === 'basinsInjectionTx') {
    // Determine colors based on data type
    if (mapStore.dataMode === 'production') {
      if (mapStore.selectedProduction === 'Gas') {
        colorArray = ["#CCCCCC", "#FCBBA1", "#FC9272", "#FB6A4A","#EF3B2C", "#CB181D", "#99000D"]
        unitType = 'BCF'
      } else if (mapStore.selectedProduction === 'Liquid Oil') {
        colorArray = ['#CCCCCC', "#CCECD1","#99D8C9", "#66C2A4","#41AE76", "#238B45","#005824"]
        unitType = 'Million_BBL'
      } else if (mapStore.selectedProduction === 'Produced Water') {
        colorArray = ['#CCCCCC', '#DAD7A4', '#C6BC8F', '#B3A37A', '#9E8A65', '#8A7151', '#785A3E']
        unitType = 'Million_BBL'
      }
    } else if (mapStore.dataMode === 'injection') {
      if (mapStore.selectedInjection === 'HF Fluid') {
        colorArray = ['#CCCCCC', '#CCEBC5', '#A8DDB5', '#7BCCC4', '#4EB3D3', '#2B8CBE', '#08589E']
        unitType = 'Billion_GAL'
      } else if (mapStore.selectedInjection === 'Salt Water Disposal') {
        colorArray = ["#CCCCCC", "#FDD0A2", "#FDAE6B", "#FD8D3C", "#F16913", "#D94801", "#8C2D04"]
        unitType = 'Million_BBL'
      }
    }
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

  initialView = mapStore.mapZoom > 0
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
    highlights: [
      { name: "default", color: "magenta",fillOpacity: 0.3  },
      { name: "temporary", color: "magenta" },
      /*
            { name: "oaks", color: "forestgreen", haloOpacity: 0.8, fillOpacity: 0.3 }
      */
    ],
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
        longitude: -96.5,
        latitude: 32
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

  /*customExpand = new Expand({
    view: begView,
    expanded: true,
    expandTooltip: 'Show View Options',
    content: document.getElementById('testButtonDiv')
  });
  begView.ui.add(customExpand, 'top-right');*/

  customExpand2 = new Expand({
    view: begView,
    expanded: true,
    expandTooltip: 'Show View Options',
    content: document.getElementById('testButtonDiv2')
  });
  begView.ui.add(customExpand2, 'bottom-right');

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
  //https://services1.arcgis.com/7DRakJXKPEhwv0fM/arcgis/rest/services/Basins_Data/FeatureServer
  basinsInjectionTx = new FeatureLayer({
    url:'https://services1.arcgis.com/7DRakJXKPEhwv0fM/arcgis/rest/services/Basins_Data/FeatureServer/0',
    opacity:0.75,
    setAutoGeneralize:true,
    outFields:["*"],
    id:"basinsInjectionTx",
  })

  layerMap = {
    'countyBoundariesTx': countyBoundariesTx,
    'countyLiquidOilTx':countyLiquidOilTx,
    'countyProducedWaterTx':countyProducedWaterTx,
    'countiesHFTx': countiesHFTx,
    'countiesInjectionTx': countiesInjectionTx,
    'basinsInjectionTx':basinsInjectionTx
  };
  begMap.add(countyBoundariesTx)

  begView.on("click", (event) => {
    begView.hitTest(event).then((response) => {
      const result = response.results[0]
      if (result?.graphic) {
        const layer = result.layer  // Define layer here, before using it
        if (layer.id === 'basinsInjectionTx') {
          // Basin clicked
          let tmpBasinClicked = result.graphic.attributes.Feature
          mapStore.setSelectedBasin(tmpBasinClicked)
          mapStore.setMapFocus('Basin')

          selectedGraphic = result.graphic

          begView.whenLayerView(layer).then((layerView) => {
            if (highlightHandle) {
              highlights.forEach((h) => h.remove())
            }

            highlightHandle = layerView.highlight(selectedGraphic, "default")
            highlights.push(highlightHandle)
            begView.goTo(selectedGraphic.geometry.extent.expand(2.5))
          })
        } else {
          let tmpCountyClicked = result.graphic.attributes.CNTY_NM
          mapStore.setSelectedCounty(tmpCountyClicked)
          mapStore.setMapFocus('County')

          selectedGraphic = result.graphic

          const layer = result.layer
          begView.whenLayerView(layer).then((layerView) => {
            if (highlightHandle) {
              highlights.forEach((h) => h.remove())
            }

            highlightHandle = layerView.highlight(selectedGraphic, "default")
            highlights.push(highlightHandle)
            begView.goTo(selectedGraphic.geometry.extent.expand(4.5))
          })
        }
      }
    })
  })
  /*  begView.on("click", (event) => {
      begView.hitTest(event).then((response) => {
        const result = response.results[0]
        if (result?.graphic) {
          let tmpCountyClicked = result.graphic.attributes.CNTY_NM
          mapStore.setSelectedCounty(tmpCountyClicked)
          mapStore.setMapFocus('County')

          // Get the layerView from the layer
          const layer = result.layer
          //highlight = layerView.highlight(result.features, {name: "temporary"});
          //hightlights.push(highlight);
          begView.whenLayerView(layer).then((layerView) => {
            if (highlightHandle) {
              highlights.forEach((h) =>{
                h.remove();
              });
            }

            highlightHandle = layerView.highlight(result.graphic,"default")
            highlights.push(highlightHandle);
            //begView.goTo(result.graphic.geometry.extent.extent);
            const ext = result.graphic.geometry.extent
            const expanded = ext.expand(2.5)
            begView.goTo(expanded);
          })
        }
      })
    })*/
  /*begView.on("click", (event) => {
    begView.hitTest(event).then((response) => {
      const countyFeature = response.results[0]?.graphic
      if (countyFeature) {
        console.log("Available attributes:", countyFeature.attributes)
        let tmpCountyClicked = countyFeature.attributes.CNTY_NM.split(' County')[0]
        mapStore.setSelectedCounty(tmpCountyClicked)
        mapStore.setMapFocus('County')
        }
    })
  })*/

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