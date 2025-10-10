// stores/dataStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
    allCountiesProductionData,
    allCountiesInjectionData,
    allCountiesHFData,
    allTexasProductionData
} from '@/composables/secret'
import {
    masterDataLoader,
    masterHFDataLoader,
    masterInjectDataLoader,
} from '@/scripts/gather-data-production.js'
import { allOutputSFO } from '@/scripts/intakeData.js'

export const useDataStore = defineStore('data', () => {
    // State
    const isLoaded = ref(false)
    const isLoading = ref(false)
    const error = ref(null)

    const masterData = ref(null)
    const hfFluidData = ref(null)
    const injectionData = ref(null)
    const problematicCountiesData = ref(null)
    const intakeData = ref(null)

    // Computed
    const hasData = computed(() => isLoaded.value && !error.value)

    // Actions
    async function loadCSVData() {
        if (isLoaded.value || isLoading.value) {
            return
        }

        isLoading.value = true
        error.value = null

        try {
            const [master, hf, injection, intake] = await Promise.all([
                masterDataLoader(allCountiesProductionData),
                masterHFDataLoader(allCountiesHFData),
                masterInjectDataLoader(allCountiesInjectionData),
                allOutputSFO
            ])

            masterData.value = master
            hfFluidData.value = hf
            injectionData.value = injection
            problematicCountiesData.value = problematicCounties
            intakeData.value = intake

            isLoaded.value = true
            console.log('All CSV data loaded successfully')
        } catch (err) {
            error.value = err.message
            console.error('Error loading CSV data:', err)
        } finally {
            isLoading.value = false
        }
    }

    function getDataByFocus(focus, dataType = 'production') {
        if (!isLoaded.value) return null

        switch (dataType) {
            case 'production':
                return masterData.value
            case 'hf_fluid':
                return hfFluidData.value
            case 'injection':
                return injectionData.value
            default:
                return null
        }
    }

    function getCountyData(county, dataType = 'production') {
        if (!isLoaded.value) return null

        const data = getDataByFocus(null, dataType)
        if (!data) return null

        return data.filter(row => row.county === county)
    }

    function isProblematicCounty(county) {
        return problematicCountiesData.value?.includes(county) || false
    }

    return {
        isLoaded,
        isLoading,
        error,
        masterData,
        hfFluidData,
        injectionData,
        problematicCountiesData,
        intakeData,
        hasData,
        loadCSVData,
        getDataByFocus,
        getCountyData,
        isProblematicCounty
    }
})