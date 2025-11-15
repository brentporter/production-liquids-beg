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

watch(
    () => mapStore.selectedBasin,
    async (newBasin) => {
      if (!newBasin || mapStore.mapFocus !== 'Basin') return

      const layer = begMap.findLayerById('basinsInjectionTx')
      if (!layer) return

      const query = layer.createQuery()
      query.where = `Feature = '${newBasin}'`

      try {
        console.log("In Basin Watch");
        const results = await layer.queryFeatures(query)
        if (results.features.length > 0) {
          const feature = results.features[0]
          selectedGraphic = feature

          begView.whenLayerView(layer).then((layerView) => {
            if (highlightHandle) {
              highlights.forEach((h) => h.remove())
            }

            highlightHandle = layerView.highlight(feature, "default")
            highlights.push(highlightHandle)
            begView.goTo(feature.geometry.extent.expand(2.5))
          })
        }
      } catch (error) {
        console.error('Error querying basin:', error)
      }
    }
)

const colorVisVar = {
  type: "color",
  classificationMethod: "natural-breaks",
  //valueExpression: esriExpression.value,
  field:'Gas_BCF_2010',
  //normalizationField:'County_Area',
  numClasses: 7,
  stops: [
  ]
};

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
      if (unitType === 'BCF' || unitType === 'Gas_BCF') {
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
        unit = 'Million BBL';
      }
      // County-specific units
      else if (unitType === 'BBL' && (mapStore.currentMapLayerView === 'countyProducedWaterTx' || mapStore.currentMapLayerView === 'countyLiquidOilTx')) {
        prevFormatted = (prevMax / 1000000).toFixed(1);
        currentFormatted = (value / 1000000).toFixed(1);
        //unit = 'Million BBL';
      } else if (unitType === 'BBL' && mapStore.currentMapLayerView === 'countiesInjectionTx') {
        prevFormatted = (prevMax / 1000000).toFixed(1);
        currentFormatted = (value / 1000000).toFixed(1);
        //unit = 'Million BBL';
      } else if (unitType === 'BBL') {
        prevFormatted = (prevMax / 1000000000).toFixed(1);
        currentFormatted = (value / 1000000000).toFixed(1);
        //unit = 'B BBL';
      } else if (unitType === 'GAL') {
        prevFormatted = (prevMax / 1000000).toFixed(1);
        currentFormatted = (value / 1000000).toFixed(1);
        //unit = 'M GAL';
      } else { // MCF
        prevFormatted = (prevMax / 1000000).toFixed(1);
        currentFormatted = (value / 1000000).toFixed(1);
        //unit = 'BCF';
      }

      label = `${prevFormatted} - ${currentFormatted} ${unitType}`;
    }

    return { value, color, label };
  });
};

function formatLegendTitle(esriExpression) {
  if (!esriExpression) return '';

  // Split by underscore: "Gas_BCF_2021" -> ["Gas", "BCF", "2021"]
  const parts = esriExpression.split('_');

  if (parts.length < 3) return esriExpression; // fallback if format is unexpected

  const year = parts[parts.length - 1]; // Last part is year
  const units = parts[parts.length - 2]; // Second to last is units
  const choice = parts.slice(0, -2).join(' '); // Everything before units, rejoin with spaces

  return `${choice} (${units}) - ${year}`;
}

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
    unitType = 'Gas_BCF';
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
    unitType = 'Million_BBL';
  } else if (mapStore.currentMapLayerView === 'countyProducedWaterTx') {
    let colorArrayOld = ['#CCCCCC',
      '#CCEBC5', '#A8DDB5',
      '#7BCCC4', '#4EB3D3',
      '#2B8CBE', '#08589E'];
    colorArray = ['#CCCCCC',
      '#DAD7A4', '#C6BC8F',
      '#B3A37A', '#9E8A65',
      '#8A7151', '#785A3E'];
    unitType = 'Million_BBL';
  } else if (mapStore.currentMapLayerView === 'countiesHFTx') {
    let colorArrayOld = ['#CCCCCC',
      '#FFEBAF', '#C5FF00',
      '#FFFF00', '#FFAA00',
      '#FF6600', '#FF0000'];
    colorArray = ['#CCCCCC',
      '#CCEBC5', '#A8DDB5',
      '#7BCCC4', '#4EB3D3',
      '#2B8CBE', '#08589E'];
    unitType = 'Billion_GAL';
  } else if (mapStore.currentMapLayerView === 'countiesInjectionTx') {
    colorArray = ["#CCCCCC",
      "#FDD0A2", "#FDAE6B",
      "#FD8D3C", "#F16913",
      "#D94801", "#8C2D04"];
    unitType = 'Million_BBL';
  } else if (mapStore.currentMapLayerView === 'basinsInjectionTx') {
    // Determine colors based on data type
    if (mapStore.dataMode === 'production') {
      if (mapStore.selectedProduction === 'Gas') {
        colorArray = ["#CCCCCC", "#FCBBA1", "#FC9272", "#FB6A4A","#EF3B2C", "#CB181D", "#99000D"]
        unitType = 'Gas_BCF'
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
        legendOptions: {
          title: formatLegendTitle(newExpression)  // "Gas (BCF) - 2021"
        },
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

onMounted(async () => {
  initialView = mapStore.mapZoom > 0
      ? {center: mapStore.mapCenter, zoom: mapStore.mapZoom}
      : {center: [-94.75, 30.75], zoom: 6}

  begMap = new Map({
    basemap: "streets-night-vector",
  });

  begView = new MapView({
    container: "mapViewer",
    map: begMap,
    center: initialView.center,
    highlights: [
      {name: "default", color: "magenta", fillOpacity: 0.3},
      {name: "temporary", color: "magenta"},
    ],
    popup: {
      dockEnabled: true,
      dockOptions: {
        breakpoint: false
      }
    },
    zoom: initialView.zoom,
  });

  // Wait for view to be ready
  await begView.when();

  // Set up UI after view is ready
  setTimeout(() => {
    isInitializing.value = false
  }, 500);

  let homeWidget = new Home({
    view: begView,
    viewpoint: new Viewpoint({
      center: new Point({
        longitude: -96.5,
        latitude: 32
      }),
      zoom: 5
    })
  });
  begView.ui.add(homeWidget, "top-left");

  let legend = new Legend({
    view: begView,
  });
  let bkExpand = new Expand({
    view: begView,
    content: legend,
    expanded: true,
    expandTooltip: 'Show Legend'
  });
  begView.ui.add(bkExpand, "bottom-left");

  customExpand2 = new Expand({
    view: begView,
    expanded: true,
    expandTooltip: 'Show View Options',
    content: document.getElementById('testButtonDiv2')
  });
  begView.ui.add(customExpand2, 'bottom-right');

  // Initialize all feature layers
  countyBoundariesTx = new FeatureLayer({
    url: 'https://services1.arcgis.com/7DRakJXKPEhwv0fM/arcgis/rest/services/Texas_County_Production_Data_2025/FeatureServer/0',
    //url: 'https://services1.arcgis.com/7DRakJXKPEhwv0fM/arcgis/rest/services/Texas_Gas_Production/FeatureServer/0',
    setAutoGeneralize: true,
    outFields: ["*"],
    opacity: 0.75,
    id: "countyBoundariesTx",
  });

  countyLiquidOilTx = new FeatureLayer({
    url:'https://services1.arcgis.com/7DRakJXKPEhwv0fM/arcgis/rest/services/Texas_County_Production_Data_2025/FeatureServer/0',
    //url: 'https://services1.arcgis.com/7DRakJXKPEhwv0fM/arcgis/rest/services/Texas_Liquid_Oil_Production/FeatureServer/0',
    //url: 'https://services1.arcgis.com/7DRakJXKPEhwv0fM/arcgis/rest/services/Texas_Liquid_Oil_Production/FeatureServer/0',
    setAutoGeneralize: true,
    outFields: ["*"],
    opacity: 0.75,
    id: "countyLiquidOilTx",
  });

  countyProducedWaterTx = new FeatureLayer({
    url: 'https://services1.arcgis.com/7DRakJXKPEhwv0fM/arcgis/rest/services/Texas_County_Production_Data_2025/FeatureServer/0',

    //url: 'https://services1.arcgis.com/7DRakJXKPEhwv0fM/arcgis/rest/services/Texas_Produced_Water_Production/FeatureServer/0',
    setAutoGeneralize: true,
    outFields: ["*"],
    opacity: 0.75,
    id: "countyProducedWaterTx",
  });

  countiesHFTx = new FeatureLayer({
    url: 'https://services1.arcgis.com/7DRakJXKPEhwv0fM/arcgis/rest/services/Texas_County_Production_Data_2025/FeatureServer/0',
    //url: 'https://services1.arcgis.com/7DRakJXKPEhwv0fM/arcgis/rest/services/Texas_County_HF_Fluid/FeatureServer/0',
    opacity: 0.75,
    setAutoGeneralize: true,
    outFields: ["*"],
    id: "countiesHFTx",
  });

  countiesInjectionTx = new FeatureLayer({
    url: 'https://services1.arcgis.com/7DRakJXKPEhwv0fM/arcgis/rest/services/Texas_County_Production_Data_2025/FeatureServer/0',
    //url: 'https://services1.arcgis.com/7DRakJXKPEhwv0fM/arcgis/rest/services/Texas_County_Injection_Info/FeatureServer/0',
    opacity: 0.75,
    setAutoGeneralize: true,
    outFields: ["*"],
    id: "countiesInjectionTx",
  });

  basinsInjectionTx = new FeatureLayer({
    //url: 'https://services1.arcgis.com/7DRakJXKPEhwv0fM/arcgis/rest/services/Texas_County_Production_Data_2025/FeatureServer/0',

    //url:'https://services1.arcgis.com/7DRakJXKPEhwv0fM/arcgis/rest/services/Texas_County_Production_Data/FeatureServer/0',
    url: 'https://services1.arcgis.com/7DRakJXKPEhwv0fM/arcgis/rest/services/Basins_Data/FeatureServer/0',
    opacity: 0.75,
    setAutoGeneralize: true,
    outFields: ["*"],
    id: "basinsInjectionTx",
  });

  layerMap = {
    'countyBoundariesTx': countyBoundariesTx,
    'countyLiquidOilTx': countyLiquidOilTx,
    'countyProducedWaterTx': countyProducedWaterTx,
    'countiesHFTx': countiesHFTx,
    'countiesInjectionTx': countiesInjectionTx,
    'basinsInjectionTx': basinsInjectionTx
  };

  // Add initial layer based on map focus
  let addedLayer;
  if (mapStore.mapFocus === 'Basin') {
    addedLayer = layerMap['basinsInjectionTx'];
    begMap.add(addedLayer);
  } else if (mapStore.mapFocus === 'County') {
    addedLayer = layerMap['countyBoundariesTx'];
    begMap.add(addedLayer);
  } else {
    addedLayer = countyBoundariesTx;
    begMap.add(addedLayer);
  }

  if (addedLayer) {
    // Apply initial renderer with legend title
    if (mapStore.esriExpression) {
      await updateMapLayerExpression(mapStore.esriExpression);
    }

    // Then restore highlight from Pinia
    const layerView = await begView.whenLayerView(addedLayer);
    await restoreHighlightFromPinia(addedLayer, layerView);
  }

  // Set up click handler
  begView.on("click", async (event) => {
    const response = await begView.hitTest(event);
    const result = response.results[0];

    if (result?.graphic) {
      const layer = result.layer;
      const layerView = await begView.whenLayerView(layer);

      if (layer.id === 'basinsInjectionTx') {
        mapStore.setSelectedBasin(result.graphic.attributes.Feature);
        mapStore.setMapFocus('Basin');
        await highlightFeature(result.graphic, layerView, 3.5);
      } else {
        mapStore.setSelectedCounty(result.graphic.attributes.CNTY_NM);
        mapStore.setMapFocus('County');
        await highlightFeature(result.graphic, layerView, 4.5);
      }
    }
  });
});

// Move this function OUTSIDE onMounted so it can be reused
async function restoreHighlightFromPinia(layer, layerView) {
  // Clear existing highlights
  highlights.forEach(h => h.remove());
  highlights = [];
  highlightHandle = null;

  if (mapStore.selectedBasin && mapStore.mapFocus === 'Basin') {
    const query = layer.createQuery();
    query.where = `Feature = '${mapStore.selectedBasin}'`;
    const results = await layer.queryFeatures(query);
    if (results.features.length > 0) {
      selectedGraphic = results.features[0];
      highlightHandle = layerView.highlight(selectedGraphic);
      highlights.push(highlightHandle);
      await begView.goTo(selectedGraphic.geometry.extent.expand(3.5));
    }
  } else if (mapStore.selectedCounty && mapStore.mapFocus === 'County') {
    const query = layer.createQuery();
    query.where = `CNTY_NM = '${mapStore.selectedCounty}'`;
    const results = await layer.queryFeatures(query);
    if (results.features.length > 0) {
      selectedGraphic = results.features[0];
      highlightHandle = layerView.highlight(selectedGraphic);
      highlights.push(highlightHandle);
      await begView.goTo(selectedGraphic.geometry.extent.expand(4.5));
    }
  }
}

async function highlightFeature(graphic, layerView, zoomFactor = 4.5) {
  // Clear existing highlights
  highlights.forEach(h => h.remove());
  highlights = [];

  selectedGraphic = graphic;
  highlightHandle = layerView.highlight(graphic);
  highlights.push(highlightHandle);

  if (graphic.geometry?.extent) {
    await begView.goTo(graphic.geometry.extent.expand(zoomFactor));
  }
}
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