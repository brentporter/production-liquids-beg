/**
 * Created by brentporter on 5/14/15.
 *
 * Example Math.round10(latBBQ_Joint,-6)
 */
import {objectType} from "@arcgis/core/views/2d/engine/vectorTiles/expression/types.js";

export function getColorByName(name) {
    // Define the mapping of aquifer names to colors
    const colorMap = {
        'trinity': '#00FF00',
        'ogallala': '#00B0F0FF',
        'edwards-trinity plateau': '#AFF194FF',
        'gulf coast': '#FFFF00',
        'carrizo wilcox': '#ff0000',
        'pecos valley': '#996633FF',
        'seymour': '#FFCC00FF'
    };

    // Convert name to lowercase for case-insensitive lookup
    const normalizedName = name.toLowerCase();

    // Return the color if found, otherwise return a default color
    return colorMap[normalizedName] || '#ffffff'; // Default to black if name not found
}

export function toMixedCaseAfterUnderscore(str) {
    let result = '';
    let convertNext = false;

    for (let i = 0; i < str.length; i++) {
        if(i===0){
            result += str[i].toUpperCase();
        } else if (str[i] === '_') {
            result += '_';
            convertNext = true; // Flag the next character for conversion
        } else if (str[i] === '-') {
            result += '-';
            convertNext = true; // Flag the next character for conversion
        }else if (convertNext) {
            result += str[i].toUpperCase(); // Convert to uppercase
            convertNext = false; // Reset the flag
        } else {
            result += str[i].toLowerCase(); // Otherwise, convert to lowercase
        }
    }

    return result;
}

// Example usage:
//console.log(toMixedCaseAfterUnderscore("hello_world_example")); // Output: hello_World_Example

export function titleCase(str) {
    str = str.toLowerCase().split(' ');
    for (let item of str) {
        item = item.charAt(0).toUpperCase() + item.slice(1);
    }
    if(str.indexOf("_")!==-1){
        str.substr(str.indexOf("_")+1,1).toUpperCase()
    }
    if(str.indexOf("-")!==-1){
        str.substr(str.indexOf("-")+1,1).toUpperCase()
    }
    return str.join(' ');
}
export function eventFire(el, etype){
    if (el.fireEvent) {
        el.fireEvent('on' + etype);
    } else {
        var evObj = document.createEvent('Events');
        evObj.initEvent(etype, true, false);
        el.dispatchEvent(evObj);
    }
}
export function getRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Function to search array elements using a string of characters
export function searchArrayUnrestricted(array, searchTerm) {
    // Convert search term to lowercase for case-insensitive search
    const lowercaseSearch = searchTerm.toLowerCase();

    // Filter the array based on the search term
    return array.filter(item => {
        // Convert each item to string and lowercase for comparison
        const lowercaseItem = String(item).toLowerCase();

        // Check if the item contains all characters from the search term
        // in the correct order
        let searchIndex = 0;
        let itemIndex = 0;

        while (searchIndex < lowercaseSearch.length && itemIndex < lowercaseItem.length) {
            if (lowercaseSearch[searchIndex] === lowercaseItem[itemIndex]) {
                searchIndex++;
            }
            itemIndex++;
        }

        return searchIndex === lowercaseSearch.length;
    });
}
// Function to search array elements using a string of characters
// Returns the first matching element or null if no match is found
export function findPartialMatch(array, searchTerm) {
    return array.findIndex(item => {
        // Convert the item and search term to strings and lowercase for comparison
        const itemStr = item.name.toString().toLowerCase();
        const searchStr = searchTerm.toLowerCase();
        //console.log("Before Item Str");
        //console.log(itemStr);
        //console.log("Before Search Str");
        //console.log(searchStr);

        // Check if the item contains all characters from the search term in order
        let searchIndex = 0;
        for (let char of itemStr) {
            if (char === searchStr[searchIndex]) {
                searchIndex++;
            }
            if (searchIndex === searchStr.length) {
                return true; // All characters in searchTerm are found in order
            }
        }

        return false; // If the loop completes without finding all characters
    }) || null; // Return null if no match is found
}
export function searchArrayName(array, searchTerm) {
    console.log(searchTerm);
    // Find the first matching element
    //const array = ['apple', 'banana', 'cherry'];
    //const substring = 'an';
    return array.filter(item => item.name.includes(searchTerm)) || null;
    //console.log(result); // Output: ['banana']
   /* return array.find(item => {
        // Convert each item to string and lowercase for comparison


        // Check if the item contains all characters from the search term
        // in the correct order
        let searchIndex = 0;
        let itemIndex = 0;
        console.log("Just before Item Dump")
        console.log(item)
        while (searchIndex < item.length && itemIndex < item.length) {
            if (item[searchIndex] === item[itemIndex]) {
                searchIndex++;
            }
            itemIndex++;
        }

        return searchIndex === item.length;
    }) || null;  // Return null if no match is found*/
}
// Function to search array of objects using a string of characters
// Returns the first matching object or null if no match is found
export function searchArrayOlden(array, searchTerm, removeSpacesFlag) {

    // Convert search term to lowercase for case-insensitive search
    let lowercaseSearch = searchTerm.toLowerCase();

    if(removeSpacesFlag){
       lowercaseSearch = lowercaseSearch.replace(/\s/g, '');
    }
    console.log(lowercaseSearch);
    // Find the first matching element
    return array.find(item => {
        // Skip items that don't have a name property
        if (!item.name) return false;

        // Convert name to lowercase for comparison
        const lowercaseItem = item.name.toLowerCase();

        // Check if the name contains all characters from the search term
        // in the correct order
        let searchIndex = 0;
        let itemIndex = 0;

        while (searchIndex < lowercaseSearch.length && itemIndex < lowercaseItem.length) {
            if (lowercaseSearch[searchIndex] === lowercaseItem[itemIndex]) {
                searchIndex++;
            }
            itemIndex++;
        }
        console.log(searchIndex);
        return searchIndex === lowercaseSearch.length;
    }) || null;  // Return null if no match is found
}
export function searchArray(array, searchTerm, removeSpacesFlag = false) {
    // Normalize the search term
    let lowercaseSearch = searchTerm.toLowerCase();

    // Remove spaces if flag is true
    if (removeSpacesFlag) {
        lowercaseSearch = lowercaseSearch.replace(/\s/g, '');
    }

    return array.find(item => {
        // Skip items without a name
        if (!item.name) return false;

        // Normalize item name
        const lowercaseItem = item.name.toLowerCase();

        // Specific handling for aquifer variations
        const aquiferVariations = {
            'edwards-trinity': ['edwards-trinity plateau'],
            'edwards': ['edwards'],
            'trinity': ['trinity']
        };

        // Check if the search term matches any of the predefined variations
        if (aquiferVariations[lowercaseSearch]) {
            return aquiferVariations[lowercaseSearch].some(variation =>
                lowercaseItem === variation
            );
        }

        // Default character-by-character search
        let searchIndex = 0;
        let itemIndex = 0;

        while (searchIndex < lowercaseSearch.length && itemIndex < lowercaseItem.length) {
            if (lowercaseSearch[searchIndex] === lowercaseItem[itemIndex]) {
                searchIndex++;
            }
            itemIndex++;
        }

        return searchIndex === lowercaseSearch.length;
    }) || null;
}

export function numberWithCommas(x) {
    //console.log(x);
    let formatted = ''
       if (typeof x === "undefined"){
           formatted = 0
       } else {
          formatted = x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
       }
       return formatted;
}

export function convertToTableFormat(countyData) {
    if (!countyData || !countyData.gas_produced) {
        return [];
    }

    const tableData = [];
    const years = new Set();

    // Collect all unique years from all production types
    countyData.gas_produced.forEach(item => years.add(item.year));
    countyData.liquid_produced.forEach(item => years.add(item.year));
    countyData.water_produced.forEach(item => years.add(item.year));

    // Convert to array and sort
    const sortedYears = Array.from(years).sort((a, b) => a - b);

    sortedYears.forEach(year => {
        const gasData = countyData.gas_produced.find(item => item.year === year);
        const liquidData = countyData.liquid_produced.find(item => item.year === year);
        const waterData = countyData.water_produced.find(item => item.year === year);

        const row = {
            Year: year.toString(),
            Gas_Produced_MCF: gasData ? gasData.value.toString() : "0",
            Liquid_Produced_BBL: liquidData ? liquidData.value.toString() : "0",
            Water_Produced_BBL: waterData ? waterData.value.toString() : "0"
        };

        tableData.push(row);
    });

    return tableData;
}

// Example usage and verification
const aquifers = [
    { name: 'Edwards-Trinity Aquifer',
        data: [
            {
                x: "2002-04-16",
                y: 34
            },
            {
                x: "2002-05-16",
                y: 43
            },
        ]},
    { name: 'Edwards Aquifer',
        data: [
            {
                x: "2002-04-16",
                y: 34
            },
            {
                x: "2002-05-16",
                y: 43
            },
        ] },
    { name: 'Trinity Basin',
        data: [
            {
                x: "2002-04-16",
                y: 34
            },
            {
                x: "2002-05-16",
                y: 43
            },
        ] }
];

// Test cases
console.log(searchArray(aquifers, 'Edwards-Trinity'));
// Should return { name: 'Edwards-Trinity Aquifer' }

console.log(searchArray(aquifers, 'Edwards'));
// Should return { name: 'Edwards Aquifer' }

console.log(searchArray(aquifers, 'Trinity Basin'));
// Should return { name: 'Trinity Aquifer' }
// Should return { name: 'Edwards' }
// Returns { name: 'Edwards' }

/*// Example usage and test cases
const testArray = [
    { name: "Apple", id: 1, price: 0.50 },
    { name: "Banana", id: 2, price: 0.30 },
    { name: "Orange", id: 3, price: 0.40 },
    { name: "Pineapple", id: 4, price: 2.00 },
    { name: "Mango", id: 5, price: 1.50 },
    { name: "Strawberry", id: 6, price: 1.00 },
    { name: "Blueberry", id: 7, price: 1.20 }
];

// Test function with different search terms
console.log(searchArray(testArray, "app")); // { name: "Apple", id: 1, price: 0.50 }
console.log(searchArray(testArray, "ber")); // { name: "Strawberry", id: 6, price: 1.00 }
console.log(searchArray(testArray, "an")); // { name: "Banana", id: 2, price: 0.30 }
console.log(searchArray(testArray, "xyz")); // null*/
/*// Example usage and test cases
const testArray = [
    "Apple",
    "Banana",
    "Orange",
    "Pineapple",
    "Mango",
    "Strawberry",
    "Blueberry"
];

// Test function with different search terms
console.log(searchArray(testArray, "app")); // "Apple"
console.log(searchArray(testArray, "ber")); // "Strawberry"
console.log(searchArray(testArray, "an")); // "Banana"
console.log(searchArray(testArray, "xyz")); // null*/

function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(string, find, replace) {
    return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

export function firstCapital(incomingString2Capital) {
    console.log("did make it here to firstCapital");
    if (!incomingString2Capital) return incomingString2Capital;
    //If not null then do the following
    const words = incomingString2Capital.split(" ");
    if (words.length === 1) {
        // Single word
        return incomingString2Capital.charAt(0).toUpperCase() + incomingString2Capital.slice(1).toLowerCase();
    } // If not a single word then do the following
    else {
        // Multiple words
        return words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
    }
}

// Closure
(function() {
    /**
     * Decimal adjustment of a number.
     *
     * @param {String}  type  The type of adjustment.
     * @param {Number}  value The number.
     * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
     * @returns {Number} The adjusted value.
     */
    function decimalAdjust(type, value, exp) {
        // If the exp is undefined or zero...
        if (typeof exp === 'undefined' || +exp === 0) {
            return Math[type](value);
        }
        value = +value;
        exp = +exp;
        // If the value is not a number or the exp is not an integer...
        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
            return NaN;
        }
        // Shift
        value = value.toString().split('e');
        value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
        // Shift back
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }

    // Decimal round
    if (!Math.round10) {
        Math.round10 = function(value, exp) {
            return decimalAdjust('round', value, exp);
        };
    }
    // Decimal floor
    if (!Math.floor10) {
        Math.floor10 = function(value, exp) {
            return decimalAdjust('floor', value, exp);
        };
    }
    // Decimal ceil
    if (!Math.ceil10) {
        Math.ceil10 = function(value, exp) {
            return decimalAdjust('ceil', value, exp);
        };
    }
})();
