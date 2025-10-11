// stores/mapStore.js - Pinia Store
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMapStore = defineStore('map', () => {
    // State
    const mapFocus = ref('State') // State, Basin, County, Grid
    const dataMode = ref('production') // production or injection
    const selectedProduction = ref('Gas') // Liquid Oil, Gas, Produced Water
    const selectedInjection = ref('HF Fluid') // HF Fluid, Salt Water Disposal
    const mapCenter = ref([-99, 31])
    const mapZoom = ref(5)
    let productionYearOptions= [2010,2011,2012,2013,2014,2015,
        2016,2017,2018,2019,2020,2021,
        2022,2023,2024,2025]
    let selectedProductionYear = ref(2010);

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
    function setMapFocus(focus) {
        mapFocus.value = focus
    }

    function setDataMode(mode) {
        dataMode.value = mode
    }

    function setSelectedProduction(production) {
        selectedProduction.value = production
    }

    function setSelectedProductionYear(year){
        selectedProductionYear.value = year
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
        mapCenter,
        mapZoom,
        mapFocusOptions,
        productionOptions,
        injectionOptions,
        setMapFocus,
        setDataMode,
        setSelectedProduction,
        setSelectedInjection,
        setSelectedProductionYear,
        setMapCenter,
        setMapZoom
    }
})
