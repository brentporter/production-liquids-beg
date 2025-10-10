import axios from "axios";

export async function allOutputSFO(incomingDataSource) {
    /*********
     * This eliminates the need for any REST APIs - instead the admin can just replace the output.json
     * an updated set of data for the all texas stats - data field expectations are in
     * variable headersAquifersDash in dashboard-table.vue in the key attribute
     **********/
    try {
        console.log(incomingDataSource)
        return await axios.get(incomingDataSource, {
            headers: {
                'Content-Type': 'application/octet-stream'
            }
        }).then(res => {
            console.log(res.data);
            const dataCSV = csvStringToObjectRounding(res.data)
            return dataCSV
        }).catch(err => {
            console.log("Problem accessing data " + err.toString())
            return "encountered a problem uploading. If problem persists contact BEG Admin"
        })
    } catch{
        return " encountered a problem uploading. If problem persists contact BEG Admin"
    }
}

export async function allOutputSFOTabular(incomingDataSource) {
    /*********
     * This eliminates the need for any REST APIs - instead the admin can just replace the output.json
     * an updated set of data for the all texas stats - data field expectations are in
     * variable headersAquifersDash in dashboard-table.vue in the key attribute
     **********/
    try {
        return await axios.get(incomingDataSource, {
            headers: {
                'Content-Type': 'application/octet-stream'
            }
        }).then(res => {
            console.log(res.data);
            return res.data
        }).catch(err => {
            console.log("Problem accessing data " + err.toString())
            return "encountered a problem uploading. If problem persists contact BEG Admin"
        })
    } catch{
        return " encountered a problem uploading. If problem persists contact BEG Admin"
    }
}

function csvStringToObject(str) {
    let lines = str.split(/\r?\n|\r|\n/g);
    let result = [];
    let headers = lines[0].split(",");
    for (let i = 1; i < lines.length; i++) {
        let obj = {};
        let currentline = lines[i].split(",");
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
        }
        result.push(obj);
    }
    return result;
}

function csvStringToObjectRounding(str) {
    let lines = str.split(/\r?\n|\r|\n/g);
    let result = [];
    let headers = lines[0].split(",");
    for (let i = 1; i < lines.length; i++) {
        let obj = {};
        let currentline = lines[i].split(",");
        for (let j = 0; j < headers.length; j++) {
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