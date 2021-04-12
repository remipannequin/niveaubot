'use strict';

/**
 * the module that we export
 */
const rivers = {};

// Use node-fetch to get river level data
const fetch = require('node-fetch');

const fs = require('fs');

//Date formating is easier with sugar
const sugar = require('sugar');
require('sugar/locales/fr');
sugar.Date.setLocale('fr-FR');


function QueryCommand(flow, loc) {
    this.flow = flow;
    this.location = loc;
}

/**
 * 
 * @param msg 
 */
rivers.parseCmd = function parseCmd(msg) {
    let queryFlow = /([Dd][ée]bit+)\W+(\w*)\W*?/i;
    let queryHeight = /([Nn]iveau|[Hh]auteur)\W+(\w*)\W*?/i;
    let grp = queryFlow.exec(msg);
    if (grp != null && grp.length >= 3) {
        return new QueryCommand(true, grp[2]);
    }
    grp = queryHeight.exec(msg);
    if (grp != null && grp.length >= 3) {
        return new QueryCommand(false, grp[2]);   
    }
    //TODO: add other commands


    console.log(`unable to find river in command ${msg}`);
}


/**
 * Query the webservice and process response
 * 
 * @param stationid the stationID to query
 * @param cb a function(string) that is called when the data has been acquired and processed 
 * @param  
 */
 function queryRiverLevel(stationid, cb, flow) {
    let url = `http://www.vigicrues.gouv.fr/services/observations.json?CdStationHydro=${stationid}&FormatDate=iso`
    if (flow) {
        url += '&GrdSerie=Q'; 
    }
    console.log('querying station '+stationid)
        
    fetch(url)
        .then(resp => resp.json())
        .then(json => rivers.processJson(json))
        .then(obs => rivers.displayLevel(obs, flow))
        .then(cb)
}


/**
 * Create a new hydro observation object
 */
class ObsHydro {
    constructor(d, loc) {
        this.date = new sugar.Date(d['DtObsHydro']);
        this.value = d['ResObsHydro'];
        this.location = loc;
    }
}



/**
 * Process the hydrology data: return the values
 * 
 * @param json 
 * @returns a ObsHydro[]
 */
rivers.processJson = function processJson(json) {
    let obs = json['Serie']['ObssHydro']
    let station = json['Serie']['LbStationHydro'];
    // Turn them into an array of ObsHydro
    let result = [];
    for (const iterator of obs) {
        result.push(new ObsHydro(iterator, station))
    }
    return result;
}


/**
 * Transform the hydrological data into a analysis message
 * 
 * @param {*} obs the data to analyse
 * @param flow if true: streamflow, else height
 * @returns a string resulting from the analysis of the data
 */
rivers.displayLevel = function displayLevel(obs, flow) {
    let last_obs = obs[obs.length-1];
    let d = last_obs.date;
    //TODO: try to evaluate evolution (on the last 6h)

    let date, mesure, unit;
    if (d.isToday().raw) {
        date = `aujourd'hui à ${d.format('%R')}`;
    } else {
        date = d.format('le %A %d %B à %R');
    }
    if (flow) {
        mesure = 'Débit';
        unit = 'm3/s'
    } else {
        mesure = 'Niveau';
        unit = 'm';
    }
    return `${mesure} à ${last_obs.location}, ${date}: ${last_obs.value} ${unit}`;
}


/**
 * 
 * @param {QueryCmd} cmd command to execute
 * @param {} cb callback
 */
rivers.query = function query(cmd, cb) {
    let stationid = rivers.searchStation(cmd.location);
    //Check value is right
    if (stationid != null) {
        queryRiverLevel(stationid, cb, cmd.flow);
    }
}


/**
 * 
 * @param {string} name 
 * @returns 
 */
rivers.searchStation = function searchStation(name) {
    if (rivers.stationDb == null) {
        //TODO check file existence and format
        let station_json = fs.readFileSync('stations.json');
        let data = JSON.parse(station_json);
        rivers.stationDb = data['stations'];
        rivers.defaultStation = data['default'];
    }
    for (const iter of rivers.stationDb) {
        for (const k of iter["keys"]) {
            if (name.localeCompare(k, 'fr', { sensitivity: 'base' }) == 0) {
                return iter["id"];
            }
        }
    }
    if (rivers.hasOwnProperty("defaultStation")) {
        return rivers.defaultStation;
    }
    console.log("unable to find a stationID for "+name);
}


module.exports = rivers;