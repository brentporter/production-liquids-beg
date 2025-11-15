// stores/dataStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
    allCountiesProductionData,
    allTexasProductionData,
    allBasinsProductionData
} from '@/composables/secret'
import Papa from 'papaparse'

export const useDataStore = defineStore('data', () => {
    // State
    const isLoaded = ref(false)
    const isLoading = ref(false)
    const error = ref(null)

    const rawCountyData = ref([])
    const countyData = ref({})
    const statewideData = ref([])
    const basinData = ref({})
    const rawBasinData = ref([])
    const countyNames = ref([])
    const basinNames = ref([])
    const basinDataOtherStates = ref({})

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
            // Load all CSV files in parallel
            const [countyResponse, stateResponse, basinResponse] = await Promise.all([
                fetch(allCountiesProductionData),
                fetch(allTexasProductionData),
                fetch(allBasinsProductionData)
            ])

            const [countyCSV, stateCSV, basinCSV] = await Promise.all([
                countyResponse.text(),
                stateResponse.text(),
                basinResponse.text()
            ])

            // Parse county-level CSV
            const countyParsed = Papa.parse(countyCSV, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true
            })

            rawCountyData.value = countyParsed.data

            // Parse state-level CSV
            const stateParsed = Papa.parse(stateCSV, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true
            })

            // Parse basin-level CSV
            const basinParsed = Papa.parse(basinCSV, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true
            })

            rawBasinData.value = basinParsed.data

            // Process data by county
            processCountyData()

            // Process state-level data
            processStatewideData(stateParsed.data)

            // Process basin-level data
            processBasinData()

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
        const counties = new Set()

        rawCountyData.value.forEach(row => {
            const county = row.County.toUpperCase()
            counties.add(county)
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
                value: row.Gas_Produced_BCF // Convert BCF to MCF
            })

            countyData.value[county].liquid_produced.push({
                year: row.Year,
                value: row.Liquid_Produced_Million_BBL // Convert to BBL
            })

            countyData.value[county].water_produced.push({
                year: row.Year,
                value: row.Water_Produced_Million_BBL // Convert to BBL
            })

            countyData.value[county].hf_fluid.push({
                year: row.Year,
                value: row.HF_Water_Billion_GAL // Convert to GAL
            })

            countyData.value[county].injection.push({
                year: row.Year,
                value: row.Salt_Water_Disposal_Million_BBL // Convert to BBL
            })
        })

        // Convert Set to sorted array
        countyNames.value = Array.from(counties).sort()
        console.log('County names:', countyNames.value)
    }

    function processStatewideData(stateData) {
        statewideData.value = stateData.map(row => ({
            Year: row.Year,
            Gas_Produced_MCF: row.Gas_Produced_BCF,
            Liquid_Produced_BBL: row.Liquid_Produced_Million_BBL,
            Water_Produced_BBL: row.Water_Produced_Million_BBL,
            HF_Water_GAL: row.HF_Water_Billion_GAL,
            Salt_Water_Disposal_BBL: row.Salt_Water_Disposal_Million_BBL,
        })).sort((a, b) => a.Year - b.Year)
    }

/*    function processBasinData() {
        basinData.value = {}
        const basins = new Set()

        rawBasinData.value.forEach(row => {
            const basin = row.Basin
            basins.add(basin)

            if (!basinData.value[basin]) {
                basinData.value[basin] = {
                    gas_produced: [],
                    liquid_produced: [],
                    water_produced: [],
                    hf_fluid: [],
                    injection: []
                }
            }

            // Add data for each year
            basinData.value[basin].gas_produced.push({
                year: row.Year,
                value: row.Gas_Produced_BCF // Convert BCF to MCF
            })

            basinData.value[basin].liquid_produced.push({
                year: row.Year,
                value: row.Liquid_Produced_Million_BBL // Convert to BBL
            })

            basinData.value[basin].water_produced.push({
                year: row.Year,
                value: row.Water_Produced_Million_BBL // Convert to BBL
            })

            basinData.value[basin].hf_fluid.push({
                year: row.Year,
                value: row.HF_Water_Billion_GAL // Convert to GAL
            })

            basinData.value[basin].injection.push({
                year: row.Year,
                value: row.Salt_Water_Disposal_Million_BBL // Convert to BBL
            })
        })

        // Convert Set to sorted array
        basinNames.value = Array.from(basins).sort()
        console.log('Basin names:', basinNames.value)
    }*/
    function processBasinData() {
        basinData.value = {}
        basinDataOtherStates.value = {} // New: store non-TX data separately
        const basins = new Set()
        const otherStatesBasins = new Set()

        rawBasinData.value.forEach(row => {
            const basin = row.Basin
            const state = row.State

            // Only process Texas data for main basinData
            if (state === 'TX') {
                basins.add(basin)

                if (!basinData.value[basin]) {
                    basinData.value[basin] = {
                        gas_produced: [],
                        liquid_produced: [],
                        water_produced: [],
                        hf_fluid: [],
                        injection: []
                    }
                }

                // Add data for each year
                basinData.value[basin].gas_produced.push({
                    year: row.Year,
                    value: row.Gas_Produced_BCF
                })

                basinData.value[basin].liquid_produced.push({
                    year: row.Year,
                    value: row.Liquid_Produced_Million_BBL
                })

                basinData.value[basin].water_produced.push({
                    year: row.Year,
                    value: row.Water_Produced_Million_BBL
                })

                basinData.value[basin].hf_fluid.push({
                    year: row.Year,
                    value: row.HF_Water_Billion_GAL
                })

                basinData.value[basin].injection.push({
                    year: row.Year,
                    value: row.Salt_Water_Disposal_Million_BBL
                })
            } else {
                // Store non-TX data separately (optional, for future use)
                otherStatesBasins.add(`${basin} (${state})`)

                if (!basinDataOtherStates.value[basin]) {
                    basinDataOtherStates.value[basin] = {}
                }
                if (!basinDataOtherStates.value[basin][state]) {
                    basinDataOtherStates.value[basin][state] = {
                        gas_produced: [],
                        liquid_produced: [],
                        water_produced: [],
                        hf_fluid: [],
                        injection: []
                    }
                }

                // Store the non-TX data
                basinDataOtherStates.value[basin][state].gas_produced.push({
                    year: row.Year,
                    value: row.Gas_Produced_BCF
                })
                // ... (add other fields similarly if needed)
            }
        })

        // Convert Set to sorted array (only TX basins)
        basinNames.value = Array.from(basins).sort()
        console.log('Texas Basin names:', basinNames.value)
        console.log('Other states basins:', Array.from(otherStatesBasins).sort())
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

        if (focus === 'Basin') {
            return basinData.value
        }

        // For county focus, return all county data
        return countyData.value
    }

    return {
        isLoaded,
        isLoading,
        error,
        rawCountyData,
        rawBasinData,
        countyData,
        statewideData,
        basinData,
        countyNames,
        basinNames,
        hasData,
        loadCSVData,
        getDataByFocus,
        getCountyData
    }
})