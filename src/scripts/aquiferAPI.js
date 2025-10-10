import axios from "axios";

export async function allTexas() {
    /*********
     * This eliminates the need for any REST APIs - instead the admin can just replace the output.json
     * an updated set of data for the all texas stats - data field expectations are in
     * variable headersAquifersDash in dashboard-table.vue in the key attribute
    **********/
    let callUrl = '../output.json'
    try {
        return await axios.get(callUrl, {
            headers: {
                'Content-Type': 'application/json'
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

export async function dataFilterGeneric(incomingAryTable){
    let trend_mean_tx = []
    for(let objPNA in incomingAryTable){
        //console.log(incomingAryTable[objPNA].trend_mean)
        trend_mean_tx.push(incomingAryTable[objPNA].trend_mean)
    }
    return trend_mean_tx;
}

export async function dataFilterGeneric1(incomingAryTable,filterValue){
    let filteredAry = []
    for(let objPNA in incomingAryTable){
        //console.log(incomingAryTable[objPNA].trend_mean)
        filteredAry.push(incomingAryTable[objPNA].orig)
    }
    console.log(filteredAry)
    return filteredAry;
}

