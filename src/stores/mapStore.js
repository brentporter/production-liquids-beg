// stores/mapStore.js - Pinia Store
import { defineStore } from 'pinia'
import {computed, ref} from 'vue'

export const useMapStore = defineStore('map', () => {
    // State
    const mapFocus = ref('State') // State, Basin, County, Grid
    const dataMode = ref('production') // production or injection
    const selectedProduction = ref('Gas') // Liquid Oil, Gas, Produced Water
    const selectedInjection = ref('HF Fluid') // HF Fluid, Salt Water Disposal
    const mapCenter = ref([-96.5, 32])
    const mapZoom = ref(5)
    let productionYearOptions= ['2010','2011','2012','2013','2014',
        '2015','2016','2017','2018',
        '2019','2020','2021','2022','2023','2024','2025']
    let selectedProductionYear = ref('2010');
    const currentMapLayerView = ref('countyBoundariesTx')
    const selectedCounty = ref(null);
    const selectedBasin = ref(null)

    const typeMapping = {
        'Liquid Oil': 'Liquid_Million_BBL',
        'Gas': 'Gas_BCF',
        'Produced Water': 'ProducedWater_Million_BBL',
        'HF Fluid': 'HF_Water_Billion_GAL_' + selectedProductionYear.value,
        'Salt Water Disposal': 'SW_Disposal_Million_BBL_'+selectedProductionYear.value,
    }

    // Computed esri expression
    const esriExpression = computed(() => {
        if (currentMapLayerView.value === 'countyBoundariesTx') {
            const fieldName = `${typeMapping[selectedProduction.value]}_${selectedProductionYear.value}`
            console.log(fieldName);
            return fieldName
        } else if (currentMapLayerView.value === 'countiesHFTx') {
            return 'HF_Water_Billion_GAL_' + selectedProductionYear.value
            //return `HF_${selectedProductionYear.value}`
        } else if (currentMapLayerView.value === 'countiesInjectionTx') {
            return 'SWDisposal_Million_BBL_'+selectedProductionYear.value
            //return `F${selectedProductionYear.value}`
        } else if (currentMapLayerView.value === 'countyLiquidOilTx') {
            const fieldName = `${typeMapping[selectedProduction.value]}_${selectedProductionYear.value}`
            return fieldName
        } else if (currentMapLayerView.value === 'countyProducedWaterTx') {
            const fieldName = `${typeMapping[selectedProduction.value]}_${selectedProductionYear.value}`
            return fieldName
        } else if (currentMapLayerView.value === 'basinsInjectionTx') {
            // Basin layer - different field naming
            if (dataMode.value === 'production') {
                if (selectedProduction.value === 'Gas') {
                    return `Gas_BCF_${selectedProductionYear.value}`
                } else if (selectedProduction.value === 'Liquid Oil') {
                    return `Liquid_Million_BBL_${selectedProductionYear.value}`
                } else if (selectedProduction.value === 'Produced Water') {
                    return `ProducedWater_Million_BBL_${selectedProductionYear.value}`
                }
            } else if (dataMode.value === 'injection') {
                if (selectedInjection.value === 'HF Fluid') {
                    return `HF_Water_Billion_Gal_${selectedProductionYear.value}`
                } else if (selectedInjection.value === 'Salt Water Disposal') {
                    console.log(selectedInjection.value)
                    return `SW_Disposal_Million_BBL_${selectedProductionYear.value}`
                }
            }
        }
        return null
    })

    // Available options
    const mapFocusOptions = [
        { label: 'State', value: 'State' },
        { label: 'Basin', value: 'Basin' },
        { label: 'County', value: 'County' },
        { label: 'Grid', value: 'Grid' }
    ]

    const productionOptions = [
        { label: 'Liquid Oil', value: 'Liquid Oil' },
        { label: 'Gas', value: 'Gas' },
        { label: 'Produced Water', value: 'Produced Water' }
    ]

    const injectionOptions = [
        { label: 'HF Fluid', value: 'HF Fluid' },
        { label: 'Salt Water Disposal', value: 'Salt Water Disposal' }
    ]

    // Actions

    function setSelectedBasin(basin){
        selectedBasin.value = basin;
    }

    function setSelectedCounty(county) {
        selectedCounty.value = county
    }

    function setMapFocus(focus) {
        mapFocus.value = focus
    }

    function setCurrentMapLayerView(layer) {
        currentMapLayerView.value = layer
    }

    function setDataMode(mode) {
        dataMode.value = mode
    }

    function setSelectedProduction(production) {
        selectedProduction.value = production
    }

    function setSelectedProductionYear(year){
        //if (productionYearOptions.value.includes(year)) {
        selectedProductionYear.value = year
        //}
    }

    function setSelectedInjection(injection) {
        selectedInjection.value = injection
    }

    function setMapCenter(center) {
        mapCenter.value = center
    }

    function setMapZoom(zoom) {
        mapZoom.value = zoom
    }

    return {
        mapFocus,
        dataMode,
        selectedProduction,
        selectedProductionYear,
        selectedInjection,
        selectedCounty,
        selectedBasin,
        mapCenter,
        mapZoom,
        mapFocusOptions,
        currentMapLayerView,
        esriExpression,
        productionOptions,
        injectionOptions,
        productionYearOptions,
        setMapFocus,
        setDataMode,
        setSelectedProduction,
        setSelectedInjection,
        setSelectedProductionYear,
        setCurrentMapLayerView,
        setSelectedCounty,
        setSelectedBasin,
        setMapCenter,
        setMapZoom
    }
})
