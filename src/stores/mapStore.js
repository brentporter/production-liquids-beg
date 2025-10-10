// stores/mapStore.js - Pinia Store
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMapStore = defineStore('map', () => {
    // State
    const mapFocus = ref('State') // State, Basin, County, Grid
    const dataMode = ref('production') // production or injection
    const selectedProduction = ref('Liquid Oil') // Liquid Oil, Gas, Produced Water
    const selectedInjection = ref('HF Fluid') // HF Fluid, Salt Water Disposal
    const mapCenter = ref([-94, 31])
    const mapZoom = ref(5)

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
        setMapCenter,
        setMapZoom
    }
})
