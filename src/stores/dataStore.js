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

    const rawData = ref([])
    const countyData = ref({})
    const statewideData = ref([])
    const basinData = ref({})
    const basinRawData = ref([])
    let aryCountiesAry = ["anderson","andrews","angelina","aransas","archer","armstrong","atascosa","austin","bailey","bandera","bastrop","baylor","bee","bell","bexar","blanco","borden","bosque","bowie","brazoria","brazos","brewster","briscoe","brooks","brown","burleson","burnet","caldwell","calhoun","callahan","cameron","camp","carson","cass","castro","chambers","cherokee","childress","clay","cochran","coke","coleman","collin","collingsworth","colorado","comal","comanche","concho","cooke","coryell","cottle","crane","crockett","crosby","culberson","dallam","dallas","dawson","de witt","deaf smith","delta","denton","dickens","dimmit","donley","duval","eastland","ector","edwards","el paso","ellis","erath","falls","fannin","fayette","fisher","floyd","foard","fort bend","franklin","freestone","frio","gaines","galveston","garza","gillespie","glasscock","goliad","gonzales","gray","grayson","gregg","grimes","guadalupe","hale","hall","hamilton","hansford","hardeman","hardin","harris","harrison","hartley","haskell","hays","hemphill","henderson","hidalgo","hill","hockley","hood","hopkins","houston","howard","hudspeth","hunt","hutchinson","irion","jack","jackson","jasper","jeff davis","jefferson","jim hogg","jim wells","johnson","jones","karnes","kaufman","kendall","kenedy","kent","kerr","kimble","king","kinney","kleberg","knox","la salle","lamar","lamb","lampasas","lavaca","lee","leon","liberty","limestone","lipscomb","live oak","llano","loving","lubbock","lynn","madison","marion","martin","mason","matagorda","maverick","mcculloch","mclennan","mcmullen","medina","menard","midland","milam","mills","mitchell","montague","montgomery","moore","morris","motley","nacogdoches","navarro","newton","nolan","nueces","ochiltree","oldham","orange","palo pinto","panola","parker","parmer","pecos","polk","potter","presidio","rains","randall","reagan","real","red river","reeves","refugio","roberts","robertson","rockwall","runnels","rusk","sabine","san augustine","san jacinto","san patricio","san saba","schleicher","scurry","shackelford","shelby","sherman","smith","somervell","starr","stephens","sterling","stonewall","sutton","swisher","tarrant","taylor","terrell","terry","throckmorton","titus","tom green","travis","trinity","tyler","upshur","upton","uvalde","val verde","van zandt","victoria","walker","waller","ward","washington","webb","wharton","wheeler","wichita","wilbarger","willacy","williamson","wilson","winkler","wise","wood","yoakum","young","zapata","zavala"]
    let autocompleteValues= null;
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

            rawData.value = countyParsed.data

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

            basinRawData.value = basinParsed.data
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
        console.log(countyData);
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

    function processBasinData() {
        basinData.value = {}

        basinRawData.value.forEach(row => {
            const basin = row.Basin

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
                value: row.Gas_Produced_BCF * 1000 // Convert BCF to MCF
            })

            basinData.value[basin].liquid_produced.push({
                year: row.Year,
                value: row.Liquid_Produced_Million_BBL * 1000000 // Convert to BBL
            })

            basinData.value[basin].water_produced.push({
                year: row.Year,
                value: row.Water_Produced_Million_BBL * 1000000 // Convert to BBL
            })

            basinData.value[basin].hf_fluid.push({
                year: row.Year,
                value: row.HF_Water_Billion_GAL * 1000000000 // Convert to GAL
            })

            basinData.value[basin].injection.push({
                year: row.Year,
                value: row.Salt_Water_Disposal_Million_BBL * 1000000 // Convert to BBL
            })
        })
        console.log(basinData);
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
        rawData,
        countyData,
        statewideData,
        basinData,
        hasData,
        aryCountiesAry,
        autocompleteValues,
        loadCSVData,
        getDataByFocus,
        getCountyData
    }
})