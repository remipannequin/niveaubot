'use strict';

/**
 * the module that we export
 */
const rivers = {};

// Use node-fetch to get river level data
const fetch = require('node-fetch');

const fs = require('fs');



/**
 * 
 * @param msg 
 */
rivers.parseCmd = function parseCmd(msg) {
    let re = /\!\W*niveau\W+(.*)/i;
    let grp = re.exec(msg);
    if (grp != null && grp.length > 0) {
        return grp[1];
    } else {
        console.log(`unable to find river in command ${msg}`);
    }
}


/**
 * 
 * @param stationid 
 * @param channel 
 */
 function queryRiverLevel(stationid, cb) {
    let url = `http://www.vigicrues.gouv.fr/services/observations.json?CdStationHydro=${stationid}&FormatDate=iso&GrdSerie=Q`
    console.log('querying station '+stationid)
        
    fetch(url)
        .then(resp => resp.json())
        .then(json => processLevel(json))
        .then(curlev => displayLevel(curlev))
        .then(cb)
   //TODO make this function return a Promise (with the requested value inside)
}


/**
 * Process the hydrology data:
 * Extract the last value
 * @param json 
 * @returns 
 */
function processLevel(json) {
    let obs = json['Serie']['ObssHydro']
    return obs[obs.length-1]
}

/**
 * 
 * @param {*} obs 
 * @returns 
 */
function displayLevel(obs) {
    return `Débit à ${obs['DtObsHydro']}: ${obs['ResObsHydro']} m3/s`
}


/**
 *
 * 
 * TODO add the station ID in a config file 
 * @param river 
 * @param channel 
 */
rivers.query = function query(river, cb) {
    let stationid;
    switch (river) {
        case "Moselle":
            stationid = "A550061001";
            break;
        case "Madon":
            stationid = "A543101001";
            break;
        default:
            //TODO ?
    }
    //TODO check values are right
    queryRiverLevel(stationid, cb)
}

module.exports = rivers;