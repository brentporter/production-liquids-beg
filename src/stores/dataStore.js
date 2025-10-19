// stores/dataStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
    allCountiesProductionData,
    allTexasProductionData
} from '@/composables/secret'
import Papa from 'papaparse'

export const useDataStore = defineStore('data', () => {
    // State
    const isLoaded = ref(false)
    const isLoading = ref(false)
    const error = ref(null)

    const rawData = ref([])
    const countyData = ref({})
    const statewideData = ref([])

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
            // Load both CSV files in parallel
            const [countyResponse, stateResponse] = await Promise.all([
                fetch(allCountiesProductionData),
                fetch(allTexasProductionData)
            ])

            const [countyCSV, stateCSV] = await Promise.all([
                countyResponse.text(),
                stateResponse.text()
            ])

            // Parse county-level CSV
            const countyParsed = Papa.parse(countyCSV, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true
            })

            rawData.value = countyParsed.data

            // Parse state-level CSV
            const stateParsed = Papa.parse(stateCSV, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true
            })

            // Process data by county
            processCountyData()

            // Use state-level data directly (don't aggregate from counties)
            processStatewideData(stateParsed.data)

            isLoaded.value = true
            console.log('All CSV data loaded successfully')
        } catch (err) {
            error.value = err.message
            console.error('Error loading CSV data:', err)
        } finally {
            isLoading.value = false
        }
    }

    function processCountyData() {
        countyData.value = {}

        rawData.value.forEach(row => {
            const county = row.County.toUpperCase()

            if (!countyData.value[county]) {
                countyData.value[county] = {
                    gas_produced: [],
                    liquid_produced: [],
                    water_produced: [],
                    hf_fluid: [],
                    injection: []
                }
            }

            // Add data for each year
            countyData.value[county].gas_produced.push({
                year: row.Year,
                value: row.Gas_Produced_BCF * 1000 // Convert BCF to MCF
            })

            countyData.value[county].liquid_produced.push({
                year: row.Year,
                value: row.Liquid_Produced_Million_BBL * 1000000 // Convert to BBL
            })

            countyData.value[county].water_produced.push({
                year: row.Year,
                value: row.Water_Produced_Million_BBL * 1000000 // Convert to BBL
            })

            countyData.value[county].hf_fluid.push({
                year: row.Year,
                value: row.HF_Water_Billion_GAL * 1000000000 // Convert to GAL
            })

            countyData.value[county].injection.push({
                year: row.Year,
                value: row.Salt_Water_Disposal_Million_BBL * 1000000 // Convert to BBL
            })
        })
    }

    function processStatewideData(stateData) {
        statewideData.value = stateData.map(row => ({
            Year: row.Year,
            Gas_Produced_MCF: row.Gas_Produced_BCF * 1000,
            Liquid_Produced_BBL: row.Liquid_Produced_Million_BBL * 1000000,
            Water_Produced_BBL: row.Water_Produced_Million_BBL * 1000000,
            HF_Water_GAL: row.HF_Water_Billion_GAL * 1000000000,
            Salt_Water_Disposal_BBL: row.Salt_Water_Disposal_Million_BBL * 1000000
        })).sort((a, b) => a.Year - b.Year)
    }

    function getCountyData(county, dataType = 'production') {
        if (!isLoaded.value) return null

        const countyKey = county.toUpperCase()
        const data = countyData.value[countyKey]

        if (!data) return null

        switch (dataType) {
            case 'production':
                return data
            case 'hf_fluid':
                return data.hf_water
            case 'injection':
                return data.salt_water_disposal
            default:
                return null
        }
    }

    function getDataByFocus(focus, dataType = 'production') {
        if (!isLoaded.value) return null

        if (focus === 'State') {
            return statewideData.value
        }

        // For county focus, return all county data
        return countyData.value
    }

    return {
        isLoaded,
        isLoading,
        error,
        rawData,
        countyData,
        statewideData,
        hasData,
        loadCSVData,
        getDataByFocus,
        getCountyData
    }
})