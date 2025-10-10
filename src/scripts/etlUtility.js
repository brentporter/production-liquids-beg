export function dataCollectionCategories(incomingType){
    let aryCo = [];
    aryCo.push(incomingType);
    let dataStream = Object.keys(dataOrganization)
        .filter(key => aryCo.includes(key))
        .reduce((obj, key) => {
            obj[key] = dataOrganization[key];
            return obj;
        }, {});
    console.log(dataStream);
    //console.log(dataStream[incomingRequest].current);
    return dataStream;
    //console.log(dataStreams[incomingType])
}

export async function matchCollections(incomingType,incomingSearchValueAry,incomingAryTable){
    let compliantPNAObjCollection = [];
    for(let filterR = 0; filterR < incomingSearchValueAry.length; filterR++){
        let aryCo = [];
            aryCo.push('CURR_MCO_CMPLNT_TIME_OR_DIST');
        if(filterR===6){
            //console.log("DID make it to 6");
            let seriesFIlterObj = incomingAryTable.filter(o=>o.CURR_MCO_CMPLNT_TIME_OR_DIST === incomingSearchValueAry[filterR]);
            //console.log(aryCo[0]);
            let somethingChecking = [];
            for(let objPNA in incomingAryTable){
                let dataStream = Object.keys(incomingAryTable[objPNA])
                    .filter(key => aryCo.includes(key))
                    .reduce((obj, key) => {
                        obj[key] = incomingAryTable[objPNA][key];
                        return obj;
                }, {});
                somethingChecking.push(dataStream);
            }
            compliantPNAObjCollection.push(somethingChecking);
            //console.log(somethingChecking);
           
        }
        else if(filterR===7){
            let aryCo = [];
            let aryPercentagesBreakdownCompliant = []
            /***********
            ***********/
            aryCo.push("CNTY_GEOID");
            let aryOfPercentCompliant = [
                [90,100],
                [75,89],
                [55,74],
                [40,54],
                [0,39],
                ['']
            ]
            for(let i=0;i<aryOfPercentCompliant.length;i++){
                let filteredObj ='';
                if(i===5){
                    filteredObj = incomingAryTable.filter(o => o.PCT_MBR_CMPLNT_TIME_OR_DIST === aryOfPercentCompliant[i][0]);
                }
                else {
                    console.log(aryOfPercentCompliant[i]);
                    //console.log(incomingSearchValueAry);
                    filteredObj = incomingAryTable.filter(o => o.PCT_MBR_CMPLNT_TIME_OR_DIST >=aryOfPercentCompliant[i][0] && o.PCT_MBR_CMPLNT_TIME_OR_DIST <=aryOfPercentCompliant[i][1]);
                }
                    console.log(filteredObj);
                    let compliantPNAObj = [];
                    for(let objPNA in filteredObj){
                        //console.log(objPNA);
                        let dataStream = Object.keys(filteredObj[objPNA])
                            .filter(key => aryCo.includes(key))
                            .reduce((obj, key) => {
                                obj[key] = filteredObj[objPNA][key];
                                return obj;
                            }, {});
                        //console.log(dataStream);
                        compliantPNAObj.push(dataStream[incomingType]);
                    }
                
                console.log(compliantPNAObj);
                aryPercentagesBreakdownCompliant.push(compliantPNAObj);
            }
            console.log(aryPercentagesBreakdownCompliant);
            compliantPNAObjCollection.push(aryPercentagesBreakdownCompliant);
        }
        else {
            let aryCo = [];
            aryCo.push(incomingType);
            //console.log(incomingSearchValueAry);
            //console.log(incomingAryTable.filter(o => o.CAT_CHG_MCO_CMPLNT_TIME_OR_DIST === 'Compliant/NA to Compliant'))
            let filteredObj = incomingAryTable.filter(o => o.CAT_CHG_MCO_CMPLNT_TIME_OR_DIST === incomingSearchValueAry[filterR]);
            //console.log(filteredObj);
            let compliantPNAObj = [];
            for(let objPNA in filteredObj){
                //console.log(objPNA);
                let dataStream = Object.keys(filteredObj[objPNA])
                    .filter(key => aryCo.includes(key))
                    .reduce((obj, key) => {
                        obj[key] = filteredObj[objPNA][key];
                        return obj;
                    }, {});
                //console.log(dataStream);
                compliantPNAObj.push(dataStream[incomingType]);
            }
            //console.log(compliantPNAObj);
            compliantPNAObjCollection.push(compliantPNAObj);
        }
    }
    
    return compliantPNAObjCollection;
}

export function testMe(incomingAry1, incomingAry2){
    console.log(incomingAry1);
    console.log(incomingAry2);
   
        const filterFormKeys = Object.keys(incomingAry2[0].attributes);
        const filterFormKeysSP = Object.keys(incomingAry1[0]);
        // Get a flattened array of this.rows' keys
        const rowKeys = incomingAry1.flatMap(item => Object.keys(item));
        console.log(filterFormKeys);
        console.log(filterFormKeysSP);
        console.log(rowKeys);
        
}

export function commonKeys(featuresObj, obj2) {
    var keys = [];
    var values = []
    var frankenObject = {};
    for (let key in featuresObj) {
        if (featuresObj.hasOwnProperty(key)) {
            console.log(key, featuresObj[key]);
        }
    }
    /* for(var i in obj1) {
      if(i in obj2) {
        keys.push(i);
        values.push(obj1[i]);
        values.push(obj2[i]);
        frankenObject[i]=obj1[i];
        //frankenObject.add(obj2[i]);
        console.log(keys[i]);
        let variableSh = keys[i];
        Object.assign(frankenObject, {variableSh: obj2[i]});
      }
    } */
    console.log(keys);
    console.log(values);
    console.log(frankenObject);
    return keys;
  }


  