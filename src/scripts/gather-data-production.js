import axios from "axios";
import {
    allCountiesProductionData,
    allCountiesInjectionData,
    allCountiesHFData,
} from '@/composables/secret.js'

export let problematicCounties = {};

export async function masterDataLoader(){
let output = await gatherDataProduction(allCountiesProductionData)
    return aggregateByCounty(output)
    //console.log(resultingData)
}
export async function masterInjectDataLoader(){
    return await gatherFlatDataProduction(allCountiesInjectionData)
}

export async function masterHFDataLoader(){
    return await gatherFlatDataProduction(allCountiesHFData)
}

export async function gatherDataProduction(allCountiesProductionData){
    let incomingDataSource = '';
    try {
        //console.log(incomingDataSource)
        return await axios.get(allCountiesProductionData, {
            headers: {
                'Content-Type': 'application/octet-stream'
            }
        }).then(res => {
            //console.log(res.data);
            return csvStringToObjects(res.data)
        }).catch(err => {
            console.log("Problem accessing data " + err.toString())
            return "encountered a problem uploading. If problem persists contact BEG Admin"
        })
    } catch{
        return " encountered a problem uploading. If problem persists contact BEG Admin"
    }
}

export async function gatherFlatDataProduction(incomingCSVFile){
    try {
        //console.log(incomingDataSource)
        return await axios.get(incomingCSVFile, {
            headers: {
                'Content-Type': 'application/octet-stream'
            }
        }).then(res => {
            //console.log(res.data);
            return csvStringToObjects(res.data)
        }).catch(err => {
            console.log("Problem accessing data " + err.toString())
            return "encountered a problem uploading. If problem persists contact BEG Admin"
        })
    } catch{
        return " encountered a problem uploading. If problem persists contact BEG Admin"
    }
}

function csvStringToObjectsBACK2(str) {
    let lines = str.split(/\r?\n|\r|\n/g);
    let result = [];
    let headers = lines[0].split(",");

    // Reset the problematic counties object
    problematicCounties = {};

    for (let i = 1; i < lines.length; i++) {
        let obj = {};
        let currentline = lines[i].split(",");
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
        }

        // Track max values for ratio analysis
        const county = obj.County;
        const gasVal = parseFloat(obj.Gas_Produced_MCF);
        const liquidVal = parseFloat(obj.Liquid_Produced_BBL);
        const waterVal = parseFloat(obj.Water_Produced_BBL);

        if (!problematicCounties[county]) {
            problematicCounties[county] = {
                maxGas: gasVal,
                maxLiquid: liquidVal,
                maxWater: waterVal
            };
        } else {
            problematicCounties[county].maxGas = Math.max(problematicCounties[county].maxGas, gasVal);
            problematicCounties[county].maxLiquid = Math.max(problematicCounties[county].maxLiquid, liquidVal);
            problematicCounties[county].maxWater = Math.max(problematicCounties[county].maxWater, waterVal);
        }

        result.push(obj);
    }

    // Analyze ratios and flag problematic counties
    Object.keys(problematicCounties).forEach(county => {
        const data = problematicCounties[county];
        const ratioGasToLiquid = data.maxGas / data.maxLiquid;
        const ratioGasToWater = data.maxGas / data.maxWater;

        if (ratioGasToLiquid > 75 || ratioGasToWater > 75) {
            problematicCounties[county].needsSpecialAxes = true;
            problematicCounties[county].suggestedMaxGas = Math.ceil(data.maxGas * 1.1);
            problematicCounties[county].suggestedMaxLiquid = Math.ceil(data.maxLiquid * 1.1);
            problematicCounties[county].suggestedMaxWater = Math.ceil(data.maxWater * 1.1);

            console.log(`Problematic county detected: ${county}`, {
                maxGas: data.maxGas,
                maxLiquid: data.maxLiquid,
                maxWater: data.maxWater,
                ratioGasToLiquid: ratioGasToLiquid.toFixed(1),
                ratioGasToWater: ratioGasToWater.toFixed(1)
            });
        }
    });
    console.log(problematicCounties)

    return result;
}

function csvStringToObjects(str) {
    let lines = str.split(/\r?\n|\r|\n/g);
    let result = [];
    let headers = lines[0].split(",");
    for (let i = 1; i < lines.length; i++) {
        let obj = {};
        let currentline = lines[i].split(",");
        for (let j = 0; j < headers.length; j++) {
            // OG lineobj[headers[j]] = currentline[j];
            //New lines
            if (isNaN(currentline[j])) {
                obj[headers[j]] = currentline[j];
            } else {
                obj[headers[j]] = parseInt(currentline[j])
            }
        }
        result.push(obj);
    }
    return result;
}

function aggregateByCounty(data) {
    const result = {};
    data.forEach(row => {
        const county = row.County;
        // Initialize county object if it doesn't exist
        if (!result[county]) {
            result[county] = {
                county: county,
                gas_produced: [],
                liquid_produced: [],
                water_produced: []
            };
        }

        // Add year-value pairs to each production type
        result[county].gas_produced.push({
            year: row.Year,
            value: row.Gas_Produced_MCF
        });

        result[county].liquid_produced.push({
            year: row.Year,
            value: row.Liquid_Produced_BBL
        });

        result[county].water_produced.push({
            year: row.Year,
            value: row.Water_Produced_BBL
        });
    });

    // Sort each county's data by year
    Object.keys(result).forEach(county => {
        result[county].gas_produced.sort((a, b) => a.year - b.year);
        result[county].liquid_produced.sort((a, b) => a.year - b.year);
        result[county].water_produced.sort((a, b) => a.year - b.year);
    });

    return result;
}