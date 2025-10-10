import axios from "axios";
import { ArcGISIdentityManager  } from "@esri/arcgis-rest-request";
import { getLayer } from '@esri/arcgis-rest-feature-service';

/*****
 *
 *
 *****/
export async function dropdownOptions(period='SFY2024Q3',benefitProgramDD="Medicaid",providerSuperTypesDD="Any",
                                      subprogramDD="Any",mcoDmoDD="Any",planSvcAreaDD="Any",planCdDD='NULL'){
    //console.log(name);
    let dropdownBaseUrl = 'EARL'
    let tmpParameters = 'EARL PARAMS'
    let tmpSuperProviders = '&provSuperType='+providerSuperTypesDD;
    let tmpBenefitProgram = '&benefitProgram='+benefitProgramDD;
    let tmpSubProgram = '&benefitSubProgram='+subprogramDD;
    //let tmpMCODMO = '&Medicaid%20Dental='+mcoDmoDD;
    let tmpMCODMO = '&mcoDmoNm='+mcoDmoDD;
    let tmpSvcArea = '&planSrvcAr='+planSvcAreaDD;
    let tmpPlanCodes = '&planCode='+planCdDD;

    let callUrl = dropdownBaseUrl+period+tmpSuperProviders+tmpBenefitProgram+tmpSubProgram+tmpMCODMO+tmpSvcArea+tmpPlanCodes;
    //let callUrl = dropdownBaseUrl+period+tmpParameters;
    try {
       return await axios.get(callUrl, {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            console.log(res.data);
            return res.data
        }).catch(err => {
            //return "encountered a problem uploading. If problem persists contact DAP"
        })
    } catch{
        return " encountered a problem uploading. If problem persists contact DAP"
    }

}

//Following Returns conditions per quarterly results based on parameter combinations
export async function queryTabular(incomingProviderST, incomingBenefitP, incomingMcoDmo, incomingBenefitSub, incomingPlanSvcAr, incomingPlancode, incomginPeriod) {
    //provSuperType=Acute%20Care%20Hospital
    //&benefitProgram=Medicaid
    //&mcoDmoNm=Wellpoint
    //&benefitSubProgram=STAR
    //&planCode=NULL
    //&period=
    let baseTabularQ = 'EARL PARAMETERS'
    let queryString = 'provSuperType=' + incomingProviderST + '&' +
        'benefitProgram=' + incomingBenefitP + '&' +
        'mcoDmoNm=' + incomingMcoDmo + '&' +
        'benefitSubProgram=' + incomingBenefitSub + '&' +
        '&PlanSrvcAr=' + incomingPlanSvcAr + '&' +
        "planCode=" + incomingPlancode + "&" +
        "period=" + incomginPeriod;
    baseTabularQ = encodeURI(baseTabularQ + queryString);
    console.log(baseTabularQ);
    //console.log(" is going on???")
    try {
        return await axios.get(baseTabularQ, {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            //console.log(res);
            /*console.log("Frame Above");
            console.log(res.data);
            console.log("Frame Below");*/
            return res.data
        }).catch(err => {
            return "encountered a problem uploading. If problem persists contact DAP"
        })
    } catch{
        return " encountered a problem uploading. If problem persists contact DAP"
    }


}

export async function queryPNARest() {

    const portalUrl = 'EARL';
    const server = portalUrl + '/sharing/rest';
    const tokenServiceUrl = server + '/generateToken';

    const session = new ArcGISIdentityManager({
        username: '',
        password: '',
        // optional
        portal: "EARL"
    })

    return getLayer({
        url: "EARL/0",
        //where: "SQL",
        authentication:session,
        f:'geojson'
    })
        .then((response) => {
            //console.log(response);
            return response.features;
            //document.getElementById("result").textContent = JSON.stringify(response.features, null, 2);
        });

}

export async function queryMesonetProxy() {
    try {
        return await axios.get('https://ms2-dev.tacc.utexas.edu/proxy-mesonet/api', {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            /*console.log("Frame Above");
            console.log(res.data);
            console.log("Frame Below");*/
            return res.data
        }).catch(err => {
            return "encountered a problem uploading. If problem persists contact IDA Team"
        })
    } catch{
        return " encountered a problem uploading. If problem persists contact IDA Team"
    }


}

//https://services.arcgis.com/8vL8ZFWfQxhb4uIP/ArcGIS/rest/services/Physical%20Regions%20of%20Texas/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&relationParam=&returnGeodetic=false&outFields=*&returnGeometry=true&returnCentroid=false&returnEnvelope=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&defaultSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnTrueCurves=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=json&token=
export async function querySitesStoriesRR() {
    try {
        return await axios.get('https://sitestories.io/arcgis/rest/services/Tx_Rails_Portal/MapServer/0/query?where=1%3D1&text=&objectIds=&time=&timeRelation=esriTimeRelationOverlaps&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&returnExtentOnly=false&sqlFormat=none&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&featureEncoding=esriDefault&f=json',
            {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            console.log(res.data.features)
            /*console.log("Frame Above");
            console.log(res.data);
            console.log("Frame Below");*/
            return res.data.features
        }).catch(err => {
            return "encountered a problem uploading. If problem persists contact IDA Team"
        })
    } catch{
        return " encountered a problem uploading. If problem persists contact IDA Team"
    }


}

export async function querySitesStoriesBigBendCities() {
    try {
        return await axios.get('https://sitestories.io/arcgis/rest/services/Hosted/Cities_Big_Bend_Region/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&defaultSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&gdbVersion=&historicMoment=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=xyFootprint&resultOffset=&resultRecordCount=&returnTrueCurves=false&returnCentroid=false&timeReferenceUnknownClient=false&maxRecordCountFactor=&sqlFormat=none&resultType=&datumTransformation=&lodType=geohash&lod=&lodSR=&f=json',
            {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            console.log(res.data.features)
            /*console.log("Frame Above");
            console.log(res.data);
            console.log("Frame Below");*/
            return res.data.features
        }).catch(err => {
            return "encountered a problem uploading. If problem persists contact IDA Team"
        })
    } catch{
        return " encountered a problem uploading. If problem persists contact IDA Team"
    }


}

